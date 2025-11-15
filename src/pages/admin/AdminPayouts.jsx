import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import {
  CreditCard,
  Check,
  Eye,
  Send,
  Download,
  AlertCircle,
  Loader,
  CheckCircle,
  Clock,
  TrendingUp,
  Info
} from 'lucide-react';

export default function AdminPayouts() {
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [payoutMethods, setPayoutMethods] = useState({});
  const [hostData, setHostData] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('verified');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [payoutForm, setPayoutForm] = useState({
    methodId: '',
    amount: '',
    notes: '',
    referenceNumber: ''
  });
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [selectedForDetails, setSelectedForDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [platformSettings, setPlatformSettings] = useState(null);

  useEffect(() => {
    fetchPlatformSettings();
    fetchPayoutMethods();
    fetchPayoutHistory();
  }, [filter]);

  const fetchPlatformSettings = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'platformSettings');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        setPlatformSettings(settingsSnap.data());
      } else {
        setPlatformSettings({
          serviceFeeThreshold: 2000,
          serviceFeeAboveThreshold: 5,
          serviceFeeBelowThreshold: 3
        });
      }
    } catch (error) {
      console.error('Error fetching platform settings:', error);
      setPlatformSettings({
        serviceFeeThreshold: 2000,
        serviceFeeAboveThreshold: 5,
        serviceFeeBelowThreshold: 3
      });
    }
  };

  const fetchPayoutMethods = async () => {
    try {
      const methodsSnap = await getDocs(collection(db, 'payoutMethods'));
      const methods = {};
      const requests = [];
      const hostDataLocal = {};

      for (const methodDoc of methodsSnap.docs) {
        const methodData = methodDoc.data();
        methods[methodDoc.id] = { id: methodDoc.id, ...methodData };

        // Get host info
        try {
          const userDoc = await getDoc(doc(db, 'users', methodData.userId));
          if (userDoc.exists()) {
            hostDataLocal[methodData.userId] = userDoc.data();
          }
        } catch (err) {
          console.error('Error fetching host user data:', err);
        }

        // Fetch host's unpaid bookings to calculate earnings
        let totalEarnings = 0;
        let unpaidBookingIds = [];
        let serviceFeeBreakdown = {
          totalServiceFees: 0,
          aboveThresholdFees: 0,
          belowThresholdFees: 0,
          aboveThresholdCount: 0,
          belowThresholdCount: 0
        };

        try {
          const bookingsQuery = query(
            collection(db, 'bookings'),
            where('hostId', '==', methodData.userId),
            where('status', '==', 'confirmed')
          );
          const bookingsSnap = await getDocs(bookingsQuery);
          
          bookingsSnap.docs.forEach(booking => {
            const bookingData = booking.data();
            const earnings = bookingData.hostEarnings || 0;
            
            // Check if booking has NOT been paid out
            if (!bookingData.paidOutAt) {
              unpaidBookingIds.push(booking.id);
              totalEarnings += (typeof earnings === 'number' ? earnings : 0);

              // Track service fee breakdown
              if (bookingData.serviceFee) {
                const serviceFeeAmount = bookingData.serviceFee.amount || 0;
                const tier = bookingData.serviceFee.tier;
                
                serviceFeeBreakdown.totalServiceFees += serviceFeeAmount;
                
                if (tier === 'above') {
                  serviceFeeBreakdown.aboveThresholdFees += serviceFeeAmount;
                  serviceFeeBreakdown.aboveThresholdCount++;
                } else if (tier === 'below') {
                  serviceFeeBreakdown.belowThresholdFees += serviceFeeAmount;
                  serviceFeeBreakdown.belowThresholdCount++;
                }
              }
            }
          });
          
          console.log(`Host ${methodData.userId} - Unpaid bookings: ${unpaidBookingIds.length}, Total earnings: ₱${totalEarnings}`);
        } catch (err) {
          console.error('Error fetching bookings for host:', methodData.userId, err);
          totalEarnings = 0;
          unpaidBookingIds = [];
        }

        // Create payout request entry
        requests.push({
          methodId: methodDoc.id || '',
          userId: methodData.userId || '',
          accountName: methodData.accountName || 'N/A',
          mobileNumber: methodData.mobileNumber || 'N/A',
          isPrimary: methodData.isPrimary || false,
          verified: methodData.verified || false,
          totalEarnings: totalEarnings || 0,
          earnings: totalEarnings || 0,
          unpaidBookingIds: unpaidBookingIds || [],
          unpaidBookingCount: unpaidBookingIds.length,
          addedAt: methodData.addedAt || new Date().toISOString(),
          type: methodData.type || 'gcash',
          verifiedAt: methodData.verifiedAt || null,
          serviceFeeBreakdown: serviceFeeBreakdown
        });
      }

      setPayoutMethods(methods);
      setHostData(hostDataLocal);

      // Filter requests based on selected filter
      let filtered = requests;
      if (filter === 'pending') {
        filtered = requests.filter(r => !r.verified);
      } else if (filter === 'verified') {
        filtered = requests.filter(r => r.verified && r.earnings > 0);
      } else if (filter === 'ready') {
        filtered = requests.filter(r => r.verified && r.earnings > 0);
      }

      setPayoutRequests(filtered.sort((a, b) => b.earnings - a.earnings));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payout methods:', error);
      setLoading(false);
    }
  };

  const fetchPayoutHistory = async () => {
    try {
      const historySnap = await getDocs(
        query(collection(db, 'payoutTransactions'), where('status', '==', 'completed'))
      );
      const history = historySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPayoutHistory(history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10));
    } catch (error) {
      console.error('Error fetching payout history:', error);
    }
  };

  const handleVerifyMethod = async (methodId) => {
    if (!window.confirm('Manually verify this GCash account?')) return;

    try {
      setProcessingId(methodId);
      await updateDoc(doc(db, 'payoutMethods', methodId), {
        verified: true,
        verifiedAt: new Date().toISOString()
      });
      alert('Account verified successfully!');
      fetchPayoutMethods();
    } catch (error) {
      console.error('Error verifying payout method:', error);
      alert('Failed to verify payout method');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedForDetails(request);
    setShowDetailsModal(true);
  };

  const openPayoutModal = (request) => {
    setSelectedMethod(request);
    setPayoutForm({
      methodId: request.methodId,
      amount: request.earnings.toString(),
      notes: '',
      referenceNumber: ''
    });
    setShowPayoutModal(true);
  };

  const handleProcessPayout = async () => {
    if (!payoutForm.amount || parseFloat(payoutForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!payoutForm.referenceNumber.trim()) {
      alert('Please enter a reference number');
      return;
    }

    if (!window.confirm(`Process payout of ₱${parseFloat(payoutForm.amount).toLocaleString()} to ${selectedMethod.accountName}?`)) {
      return;
    }

    try {
      setProcessingId(selectedMethod.methodId);

      // Fetch unpaid bookings for this host RIGHT NOW
      let bookingIdsToUpdate = [];
      try {
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('hostId', '==', selectedMethod.userId),
          where('status', '==', 'confirmed')
        );
        const bookingsSnap = await getDocs(bookingsQuery);
        
        bookingIdsToUpdate = bookingsSnap.docs
          .filter(booking => !booking.data().paidOutAt) // Only unpaid
          .map(booking => booking.id);

        console.log('Found unpaid bookings for payout:', bookingIdsToUpdate);
      } catch (err) {
        console.error('Error fetching bookings before payout:', err);
        alert('Failed to fetch unpaid bookings. Please try again.');
        setProcessingId(null);
        return;
      }

      if (bookingIdsToUpdate.length === 0) {
        alert('No unpaid bookings found for this host.');
        setProcessingId(null);
        return;
      }

      const batch = writeBatch(db);
      const payoutRef = doc(collection(db, 'payoutTransactions'));
      const payoutTimestamp = new Date().toISOString();

      // Create payout transaction record
      const transaction = {
        hostId: selectedMethod.userId,
        hostName: hostData[selectedMethod.userId]?.name || 'Unknown',
        methodId: selectedMethod.methodId,
        accountName: selectedMethod.accountName,
        mobileNumber: selectedMethod.mobileNumber,
        amount: parseFloat(payoutForm.amount),
        referenceNumber: payoutForm.referenceNumber.trim(),
        notes: payoutForm.notes,
        status: 'completed',
        createdAt: payoutTimestamp,
        processedBy: 'admin',
        bookingIds: bookingIdsToUpdate,
        bookingCount: bookingIdsToUpdate.length,
        serviceFeeBreakdown: selectedMethod.serviceFeeBreakdown
      };

      batch.set(payoutRef, transaction);

      // Mark all unpaid bookings as paid
      bookingIdsToUpdate.forEach(bookingId => {
        const bookingRef = doc(db, 'bookings', bookingId);
        batch.update(bookingRef, {
          paidOutAt: payoutTimestamp,
          paidOutTransactionId: payoutRef.id
        });
      });

      await batch.commit();

      console.log('Batch commit successful');
      alert(`✅ Payout processed successfully!\n\nReference: ${payoutForm.referenceNumber}\nAmount: ₱${parseFloat(payoutForm.amount).toLocaleString()}\nBookings paid: ${bookingIdsToUpdate.length}`);
      setShowPayoutModal(false);
      fetchPayoutMethods();
      fetchPayoutHistory();
    } catch (error) {
      console.error('Error processing payout:', error);
      alert(`Failed to process payout: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (verified) => {
    if (verified) return 'bg-green-100 text-green-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getStatusIcon = (verified) => {
    if (verified) return <CheckCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const totalPendingPayouts = payoutRequests
    .filter(r => r.verified && r.earnings > 0)
    .reduce((sum, r) => sum + (r.earnings || 0), 0);

  const totalServiceFeesCollected = payoutRequests
    .filter(r => r.verified && r.earnings > 0)
    .reduce((sum, r) => sum + (r.serviceFeeBreakdown?.totalServiceFees || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
          <p className="text-gray-600 mt-1">Manage host payouts with tiered service fee system</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Service Fee Info Banner */}
      {platformSettings && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Current Tiered Service Fee Structure</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">LOWER TIER</span>
                  <span>Below ₱{platformSettings.serviceFeeThreshold?.toLocaleString()}: <strong>{platformSettings.serviceFeeBelowThreshold}%</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">HIGHER TIER</span>
                  <span>Above ₱{platformSettings.serviceFeeThreshold?.toLocaleString()}: <strong>{platformSettings.serviceFeeAboveThreshold}%</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ready for Payout</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {payoutRequests.filter(r => r.verified && r.earnings > 0).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Verification</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {payoutRequests.filter(r => !r.verified).length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Pending Amount</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ₱{Math.max(0, totalPendingPayouts).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">To hosts</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Service Fees Collected</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ₱{Math.max(0, totalServiceFeesCollected).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">From pending payouts</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('verified')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'verified'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ready for Payout
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending Verification
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Accounts
        </button>
      </div>

      {/* Payout Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Host</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">GCash Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Mobile Number</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Bookings</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Host Earnings</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Service Fee</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payoutRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No payout requests found</p>
                  </td>
                </tr>
              ) : (
                payoutRequests.map(request => (
                  <tr key={request.methodId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {hostData[request.userId]?.name || 'Unknown Host'}
                        </p>
                        <p className="text-xs text-gray-600">{request.userId.substring(0, 12)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{request.accountName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{request.mobileNumber}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="space-y-1">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                          {request.unpaidBookingCount || 0}
                        </span>
                        {request.serviceFeeBreakdown && (request.serviceFeeBreakdown.aboveThresholdCount > 0 || request.serviceFeeBreakdown.belowThresholdCount > 0) && (
                          <div className="text-xs text-gray-500">
                            <div className="flex items-center justify-center gap-1">
                              {request.serviceFeeBreakdown.belowThresholdCount > 0 && (
                                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{request.serviceFeeBreakdown.belowThresholdCount}L</span>
                              )}
                              {request.serviceFeeBreakdown.aboveThresholdCount > 0 && (
                                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{request.serviceFeeBreakdown.aboveThresholdCount}H</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-gray-900">₱{(request.earnings || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">After fees</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-purple-600">₱{(request.serviceFeeBreakdown?.totalServiceFees || 0).toLocaleString()}</p>
                      {request.serviceFeeBreakdown && (request.serviceFeeBreakdown.aboveThresholdFees > 0 || request.serviceFeeBreakdown.belowThresholdFees > 0) && (
                        <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                          {request.serviceFeeBreakdown.belowThresholdFees > 0 && (
                            <div>L: ₱{request.serviceFeeBreakdown.belowThresholdFees.toFixed(0)}</div>
                          )}
                          {request.serviceFeeBreakdown.aboveThresholdFees > 0 && (
                            <div>H: ₱{request.serviceFeeBreakdown.aboveThresholdFees.toFixed(0)}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.verified)}`}>
                        {getStatusIcon(request.verified)}
                        {request.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!request.verified && (
                          <button
                            onClick={() => handleVerifyMethod(request.methodId)}
                            disabled={processingId === request.methodId}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition disabled:opacity-50"
                            title="Verify account"
                          >
                            {processingId === request.methodId ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {request.verified && request.earnings > 0 && (
                          <button
                            onClick={() => openPayoutModal(request)}
                            disabled={processingId === request.methodId}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition disabled:opacity-50"
                            title="Process payout"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Payouts</h3>
        {payoutHistory.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No payout history yet</p>
        ) : (
          <div className="space-y-3">
            {payoutHistory.map(payout => (
              <div
                key={payout.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{payout.accountName}</p>
                  <p className="text-sm text-gray-600">Ref: {payout.referenceNumber}</p>
                  <p className="text-xs text-gray-500">{payout.bookingCount} booking(s) paid</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₱{(payout.amount || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(payout.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {showPayoutModal && selectedMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Process Payout</h3>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Host:</strong> {hostData[selectedMethod.userId]?.name || 'Unknown'}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Unpaid Bookings:</strong> {selectedMethod.unpaidBookingCount || 0}
                </p>
              </div>

              {/* Service Fee Breakdown */}
              {selectedMethod.serviceFeeBreakdown && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-purple-900 mb-2">Service Fee Breakdown:</p>
                  <div className="space-y-1 text-xs text-purple-800">
                    {selectedMethod.serviceFeeBreakdown.belowThresholdCount > 0 && (
                      <div className="flex justify-between">
                        <span>Lower Tier ({selectedMethod.serviceFeeBreakdown.belowThresholdCount} bookings):</span>
                        <span className="font-semibold">₱{selectedMethod.serviceFeeBreakdown.belowThresholdFees.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedMethod.serviceFeeBreakdown.aboveThresholdCount > 0 && (
                      <div className="flex justify-between">
                        <span>Higher Tier ({selectedMethod.serviceFeeBreakdown.aboveThresholdCount} bookings):</span>
                        <span className="font-semibold">₱{selectedMethod.serviceFeeBreakdown.aboveThresholdFees.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-purple-300 pt-1 mt-1">
                      <span className="font-semibold">Total Service Fees:</span>
                      <span className="font-bold">₱{selectedMethod.serviceFeeBreakdown.totalServiceFees.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={selectedMethod.accountName}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={selectedMethod.mobileNumber}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₱) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">Host earnings after tiered service fee deduction</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={payoutForm.referenceNumber}
                  onChange={(e) => setPayoutForm(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  placeholder="e.g., GCash-2025-001, TRX-12345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">Enter GCash transaction reference number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={payoutForm.notes}
                  onChange={(e) => setPayoutForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this payout"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleProcessPayout}
                disabled={processingId === selectedMethod.methodId}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {processingId === selectedMethod.methodId ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Process Payout</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowPayoutModal(false)}
                disabled={processingId === selectedMethod.methodId}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Account Details</h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Host Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {hostData[selectedForDetails?.userId]?.name || 'Unknown'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">GCash Account Name</p>
                <p className="text-lg font-semibold text-gray-900">{selectedForDetails?.accountName || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Mobile Number</p>
                <p className="text-lg font-semibold text-gray-900">{selectedForDetails?.mobileNumber || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Unpaid Bookings</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedForDetails?.unpaidBookingCount || 0}
                </p>
                {selectedForDetails?.serviceFeeBreakdown && (
                  <div className="flex gap-2 mt-1">
                    {selectedForDetails.serviceFeeBreakdown.belowThresholdCount > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {selectedForDetails.serviceFeeBreakdown.belowThresholdCount} Lower Tier
                      </span>
                    )}
                    {selectedForDetails.serviceFeeBreakdown.aboveThresholdCount > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {selectedForDetails.serviceFeeBreakdown.aboveThresholdCount} Higher Tier
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Service Fee Breakdown in Details */}
              {selectedForDetails?.serviceFeeBreakdown && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 uppercase mb-2">Service Fee Breakdown</p>
                  <div className="space-y-2 text-sm">
                    {selectedForDetails.serviceFeeBreakdown.belowThresholdCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Lower Tier ({selectedForDetails.serviceFeeBreakdown.belowThresholdCount}):</span>
                        <span className="font-semibold text-gray-900">₱{selectedForDetails.serviceFeeBreakdown.belowThresholdFees.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedForDetails.serviceFeeBreakdown.aboveThresholdCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Higher Tier ({selectedForDetails.serviceFeeBreakdown.aboveThresholdCount}):</span>
                        <span className="font-semibold text-gray-900">₱{selectedForDetails.serviceFeeBreakdown.aboveThresholdFees.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-purple-300 pt-2">
                      <span className="font-semibold text-purple-900">Total Service Fees:</span>
                      <span className="font-bold text-purple-900">₱{selectedForDetails.serviceFeeBreakdown.totalServiceFees.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Amount to Pay (Host Earnings)</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{(selectedForDetails?.earnings || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">After tiered service fee deduction</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Status</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedForDetails?.verified)}`}>
                  {getStatusIcon(selectedForDetails?.verified)}
                  {selectedForDetails?.verified ? 'Verified' : 'Pending'}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Added On</p>
                <p className="text-sm text-gray-900">
                  {new Date(selectedForDetails?.addedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}