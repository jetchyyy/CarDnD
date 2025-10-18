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
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  CreditCard,
  Check,
  X,
  Eye,
  Send,
  Filter,
  Download,
  AlertCircle,
  Loader,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

export default function AdminPayouts() {
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [payoutMethods, setPayoutMethods] = useState({});
  const [hostData, setHostData] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
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

  useEffect(() => {
    fetchPayoutMethods();
    fetchPayoutHistory();
  }, [filter]);

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

        // Fetch host's bookings to calculate total earnings
        let totalEarnings = 0;
        let unpaidBookingIds = [];
        try {
          const bookingsQuery = query(
            collection(db, 'bookings'),
            where('hostId', '==', methodData.userId),
            where('status', '==', 'confirmed')
          );
          const bookingsSnap = await getDocs(bookingsQuery);
          
          bookingsSnap.docs.forEach(booking => {
            const bookingData = booking.data();
            const price = bookingData.totalPrice || 0;
            
            // Check if booking has NOT been paid out
            if (!bookingData.paidOutAt) {
              unpaidBookingIds.push(booking.id);
              totalEarnings += (typeof price === 'number' ? price : 0);
            }
          });
          
          console.log(`Host ${methodData.userId} - Unpaid bookings: ${unpaidBookingIds.length}, Total: ₱${totalEarnings}`);
        } catch (err) {
          console.error('Error fetching bookings for host:', methodData.userId, err);
          totalEarnings = 0;
          unpaidBookingIds = [];
        }

        // Always create payout request - with fallback values
        requests.push({
          methodId: methodDoc.id || '',
          userId: methodData.userId || '',
          accountName: methodData.accountName || 'N/A',
          mobileNumber: methodData.mobileNumber || 'N/A',
          isPrimary: methodData.isPrimary || false,
          verified: methodData.verified || false,
          totalEarnings: totalEarnings || 0,
          paidAmount: 0,
          earnings: totalEarnings || 0,
          unpaidBookingIds: unpaidBookingIds || [],
          addedAt: methodData.addedAt || new Date().toISOString(),
          type: methodData.type || 'gcash',
          verifiedAt: methodData.verifiedAt || null
        });
      }

      setPayoutMethods(methods);
      setHostData(hostDataLocal);

      // Filter requests based on selected filter
      let filtered = requests;
      if (filter === 'pending') {
        filtered = requests.filter(r => !r.verified);
      } else if (filter === 'verified') {
        filtered = requests.filter(r => r.verified);
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

      const batch = writeBatch(db);
      const payoutRef = doc(collection(db, 'payoutTransactions'));
      const payoutTimestamp = new Date().toISOString();

      // Create payout transaction record
      const transaction = {
        hostId: selectedMethod.userId,
        methodId: selectedMethod.methodId,
        accountName: selectedMethod.accountName,
        mobileNumber: selectedMethod.mobileNumber,
        amount: parseFloat(payoutForm.amount),
        referenceNumber: payoutForm.referenceNumber.trim(),
        notes: payoutForm.notes,
        status: 'completed',
        createdAt: payoutTimestamp,
        processedBy: 'admin',
        bookingIds: bookingIdsToUpdate
      };

      batch.set(payoutRef, transaction);

      // Mark all unpaid bookings as paid
      if (bookingIdsToUpdate.length > 0) {
        bookingIdsToUpdate.forEach(bookingId => {
          const bookingRef = doc(db, 'bookings', bookingId);
          batch.update(bookingRef, {
            paidOutAt: payoutTimestamp,
            paidOutTransactionId: payoutRef.id
          });
        });
        console.log(`Marked ${bookingIdsToUpdate.length} bookings as paid`);
      }

      await batch.commit();

      console.log('Batch commit successful');
      alert(`Payout processed successfully!\nReference: ${payoutForm.referenceNumber}\nBookings marked as paid: ${bookingIdsToUpdate.length}`);
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
          <p className="text-gray-600 mt-1">Manage host payouts and verify GCash accounts</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ready for Payout</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {payoutRequests.filter(r => r.verified).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
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
              <p className="text-gray-600 text-sm">Total Pending Payouts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ₱{Math.max(0, payoutRequests.reduce((sum, r) => sum + (r.earnings || 0), 0)).toLocaleString()}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ready for Payout
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'verified'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Verified Accounts
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Unpaid Earnings</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payoutRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
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
                        <p className="text-sm text-gray-600">{request.userId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{request.accountName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{request.mobileNumber}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-gray-900">₱{(request.earnings || 0).toLocaleString()}</p>
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
                        {request.verified && (
                          <button
                            onClick={() => openPayoutModal(request)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
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
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900">{payout.accountName}</p>
                  <p className="text-sm text-gray-600">{payout.referenceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₱{(payout.amount || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(payout.createdAt).toLocaleDateString()}
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
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Process Payout</h3>

            <div className="space-y-4 mb-6">
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
                  Amount (₱)
                </label>
                <input
                  type="number"
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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
                <p className="text-xs text-gray-600 mt-1">Enter GCash transaction reference number for tracking</p>
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {processingId === selectedMethod.methodId ? 'Processing...' : 'Process Payout'}
              </button>
              <button
                onClick={() => setShowPayoutModal(false)}
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
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
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
                <p className="text-xs font-medium text-gray-600 uppercase">Unpaid Earnings</p>
                <p className="text-lg font-semibold text-gray-900">
                  ₱{(selectedForDetails?.earnings || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Status</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedForDetails?.verified)}`}>
                  {getStatusIcon(selectedForDetails?.verified)}
                  {selectedForDetails?.verified ? 'Verified' : 'Pending'}
                </span>
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