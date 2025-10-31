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
  addDoc
} from 'firebase/firestore';
import {
  RefreshCw,
  Check,
  Eye,
  Send,
  Download,
  AlertCircle,
  Loader,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign
} from 'lucide-react';

export default function AdminRefunds() {
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState(null);
  const [selectedCancellation, setSelectedCancellation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({
    referenceNumber: '',
    notes: '',
    method: 'gcash'
  });
  const [refundHistory, setRefundHistory] = useState([]);

  useEffect(() => {
    fetchCancellations();
    fetchRefundHistory();
  }, [filter]);

  const fetchCancellations = async () => {
    try {
      setLoading(true);
      let q;

      if (filter === 'pending') {
        q = query(
          collection(db, 'cancellations'),
          where('refundStatus', '==', 'pending')
        );
      } else if (filter === 'processed') {
        q = query(
          collection(db, 'cancellations'),
          where('refundStatus', '==', 'processed')
        );
      } else {
        q = collection(db, 'cancellations');
      }

      const snapshot = await getDocs(q);
      const cancellationsData = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Fetch guest details
        let guestData = {};
        try {
          const guestDoc = await getDoc(doc(db, 'users', data.guestId));
          if (guestDoc.exists()) {
            guestData = guestDoc.data();
          }
        } catch (err) {
          console.error('Error fetching guest:', err);
        }

        cancellationsData.push({
          id: docSnap.id,
          ...data,
          guestName: guestData.name || data.bookingDetails?.guestName || 'Unknown',
          guestEmail: guestData.email || 'N/A',
          guestPhone: guestData.phone || 'N/A'
        });
      }

      // Sort by cancelledAt date, newest first
      cancellationsData.sort((a, b) => 
        new Date(b.cancelledAt) - new Date(a.cancelledAt)
      );

      setCancellations(cancellationsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cancellations:', error);
      setLoading(false);
    }
  };

  const fetchRefundHistory = async () => {
    try {
      const historySnap = await getDocs(
        query(
          collection(db, 'refundTransactions'),
          where('status', '==', 'completed')
        )
      );
      const history = historySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRefundHistory(
        history.sort((a, b) => 
          new Date(b.processedAt) - new Date(a.processedAt)
        ).slice(0, 10)
      );
    } catch (error) {
      console.error('Error fetching refund history:', error);
    }
  };

  const handleViewDetails = (cancellation) => {
    setSelectedCancellation(cancellation);
    setShowDetailsModal(true);
  };

  const openRefundModal = (cancellation) => {
    setSelectedCancellation(cancellation);
    setRefundForm({
      referenceNumber: '',
      notes: '',
      method: 'gcash'
    });
    setShowRefundModal(true);
  };

  const handleProcessRefund = async () => {
    if (!refundForm.referenceNumber.trim()) {
      alert('Please enter a reference number');
      return;
    }

    if (selectedCancellation.refundAmount <= 0) {
      alert('No refund amount to process');
      return;
    }

    if (!window.confirm(
      `Process refund of ₱${selectedCancellation.refundAmount.toLocaleString()} to ${selectedCancellation.guestName}?`
    )) {
      return;
    }

    try {
      setProcessingId(selectedCancellation.id);

      const refundTimestamp = new Date().toISOString();

      // Create refund transaction record
      const refundTransaction = {
        cancellationId: selectedCancellation.id,
        bookingId: selectedCancellation.bookingId,
        guestId: selectedCancellation.guestId,
        guestName: selectedCancellation.guestName,
        guestEmail: selectedCancellation.guestEmail,
        hostId: selectedCancellation.hostId,
        vehicleTitle: selectedCancellation.bookingDetails?.vehicleTitle,
        originalAmount: selectedCancellation.originalAmount,
        refundAmount: selectedCancellation.refundAmount,
        refundPercentage: selectedCancellation.refundPercentage,
        referenceNumber: refundForm.referenceNumber.trim(),
        refundMethod: refundForm.method,
        notes: refundForm.notes,
        status: 'completed',
        processedAt: refundTimestamp,
        processedBy: 'admin'
      };

      // Add refund transaction
      await addDoc(collection(db, 'refundTransactions'), refundTransaction);

      // Update cancellation status
      await updateDoc(doc(db, 'cancellations', selectedCancellation.id), {
        refundStatus: 'processed',
        refundProcessedAt: refundTimestamp,
        refundReference: refundForm.referenceNumber.trim()
      });

      // Update booking
      await updateDoc(doc(db, 'bookings', selectedCancellation.bookingId), {
        refundStatus: 'processed',
        refundProcessedAt: refundTimestamp,
        refundReference: refundForm.referenceNumber.trim()
      });

      alert(
        `✅ Refund processed successfully!\n\nReference: ${refundForm.referenceNumber}\nAmount: ₱${selectedCancellation.refundAmount.toLocaleString()}\nGuest: ${selectedCancellation.guestName}`
      );

      setShowRefundModal(false);
      fetchCancellations();
      fetchRefundHistory();
    } catch (error) {
      console.error('Error processing refund:', error);
      alert(`Failed to process refund: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'processed':
        return 'bg-green-100 text-green-700';
      case 'not_applicable':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processed':
        return <CheckCircle className="w-4 h-4" />;
      case 'not_applicable':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const totalPendingRefunds = cancellations
    .filter(c => c.refundStatus === 'pending')
    .reduce((sum, c) => sum + (c.refundAmount || 0), 0);

  const totalProcessedThisMonth = refundHistory
    .filter(r => {
      const date = new Date(r.processedAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, r) => sum + (r.refundAmount || 0), 0);

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
          <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
          <p className="text-gray-600 mt-1">Process refunds for cancelled bookings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              fetchCancellations();
              fetchRefundHistory();
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Refunds</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {cancellations.filter(c => c.refundStatus === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Pending Amount</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ₱{totalPendingRefunds.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Processed This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {refundHistory.filter(r => {
                  const date = new Date(r.processedAt);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && 
                         date.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Amount Refunded (Month)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ₱{totalProcessedThisMonth.toLocaleString()}
              </p>
            </div>
            <RefreshCw className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending Refunds
        </button>
        <button
          onClick={() => setFilter('processed')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'processed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Processed
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Cancellations
        </button>
      </div>

      {/* Cancellations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Cancelled Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Original Amount</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Refund Amount</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Refund %</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cancellations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No cancellations found</p>
                  </td>
                </tr>
              ) : (
                cancellations.map(cancellation => (
                  <tr key={cancellation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {cancellation.guestName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {cancellation.guestEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">
                        {cancellation.bookingDetails?.vehicleTitle || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(cancellation.bookingDetails?.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })} - {new Date(cancellation.bookingDetails?.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">
                        {new Date(cancellation.cancelledAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-600">
                        {cancellation.hoursBeforeBooking}h before booking
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-semibold text-gray-900">
                        ₱{(cancellation.originalAmount || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-bold text-green-600">
                        ₱{(cancellation.refundAmount || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-700 rounded-full font-bold">
                        {cancellation.refundPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(cancellation.refundStatus)}`}>
                        {getStatusIcon(cancellation.refundStatus)}
                        {cancellation.refundStatus === 'pending' && 'Pending'}
                        {cancellation.refundStatus === 'processed' && 'Processed'}
                        {cancellation.refundStatus === 'not_applicable' && 'No Refund'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(cancellation)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {cancellation.refundStatus === 'pending' && 
                         cancellation.refundAmount > 0 && (
                          <button
                            onClick={() => openRefundModal(cancellation)}
                            disabled={processingId === cancellation.id}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition disabled:opacity-50"
                            title="Process refund"
                          >
                            {processingId === cancellation.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {cancellation.refundStatus === 'processed' && (
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Check className="w-4 h-4 text-green-700" />
                          </div>
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

      {/* Refund History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Refunds</h3>
        {refundHistory.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No refund history yet</p>
        ) : (
          <div className="space-y-3">
            {refundHistory.map(refund => (
              <div
                key={refund.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{refund.guestName}</p>
                  <p className="text-sm text-gray-600">
                    {refund.vehicleTitle} • Ref: {refund.referenceNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {refund.refundPercentage}% refund via {refund.refundMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    ₱{(refund.refundAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(refund.processedAt).toLocaleDateString('en-US', {
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

      {/* Refund Modal */}
      {showRefundModal && selectedCancellation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Process Refund</h3>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Guest:</strong> {selectedCancellation.guestName}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Vehicle:</strong> {selectedCancellation.bookingDetails?.vehicleTitle}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Amount
                </label>
                <input
                  type="text"
                  value={`₱${selectedCancellation.refundAmount.toLocaleString()} (${selectedCancellation.refundPercentage}%)`}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-bold text-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Method <span className="text-red-600">*</span>
                </label>
                <select
                  value={refundForm.method}
                  onChange={(e) => setRefundForm(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gcash">GCash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={refundForm.referenceNumber}
                  onChange={(e) => setRefundForm(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  placeholder="e.g., REFUND-2025-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={refundForm.notes}
                  onChange={(e) => setRefundForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this refund"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleProcessRefund}
                disabled={processingId === selectedCancellation.id}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {processingId === selectedCancellation.id ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Process Refund</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowRefundModal(false)}
                disabled={processingId === selectedCancellation.id}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCancellation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancellation Details</h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Guest Name</p>
                <p className="text-lg font-semibold text-gray-900">{selectedCancellation.guestName}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Contact</p>
                <p className="text-sm text-gray-900">{selectedCancellation.guestEmail}</p>
                <p className="text-sm text-gray-900">{selectedCancellation.guestPhone}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Vehicle</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedCancellation.bookingDetails?.vehicleTitle}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Booking Dates</p>
                <p className="text-sm text-gray-900">
                  {new Date(selectedCancellation.bookingDetails?.startDate).toLocaleDateString()} - {new Date(selectedCancellation.bookingDetails?.endDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Cancelled On</p>
                <p className="text-sm text-gray-900">
                  {new Date(selectedCancellation.cancelledAt).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">
                  {selectedCancellation.hoursBeforeBooking} hours before booking
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Original Amount</p>
                <p className="text-xl font-bold text-gray-900">
                  ₱{(selectedCancellation.originalAmount || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Refund Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{(selectedCancellation.refundAmount || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedCancellation.refundPercentage}% of original amount
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Cancellation Reason</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedCancellation.reason}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Refund Status</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedCancellation.refundStatus)}`}>
                  {getStatusIcon(selectedCancellation.refundStatus)}
                  {selectedCancellation.refundStatus === 'pending' && 'Pending'}
                  {selectedCancellation.refundStatus === 'processed' && 'Processed'}
                  {selectedCancellation.refundStatus === 'not_applicable' && 'No Refund'}
                </span>
              </div>

              {selectedCancellation.refundStatus === 'processed' && (
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Refund Reference</p>
                  <p className="text-sm font-mono text-gray-900 bg-green-50 p-2 rounded">
                    {selectedCancellation.refundReference}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Processed: {new Date(selectedCancellation.refundProcessedAt).toLocaleString()}
                  </p>
                </div>
              )}
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