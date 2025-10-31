import { useState } from 'react';
import { X, AlertTriangle, Clock, DollarSign, Info } from 'lucide-react';

const CancellationModal = ({ booking, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate refund percentage based on time until booking
  const calculateRefund = () => {
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const hoursUntilBooking = (startDate - now) / (1000 * 60 * 60);

    let refundPercentage = 0;
    let refundPolicy = '';

    if (hoursUntilBooking >= 24) {
      refundPercentage = 100;
      refundPolicy = 'Full refund (24+ hours before booking)';
    } else if (hoursUntilBooking >= 10) {
      refundPercentage = 50;
      refundPolicy = '50% refund (10-24 hours before booking)';
    } else if (hoursUntilBooking >= 5) {
      refundPercentage = 0;
      refundPolicy = 'No refund (5-10 hours before booking)';
    } else {
      refundPercentage = 0;
      refundPolicy = 'No refund (less than 5 hours before booking)';
    }

    const refundAmount = (booking.totalPrice * refundPercentage) / 100;

    return {
      refundPercentage,
      refundAmount,
      refundPolicy,
      hoursUntilBooking: Math.floor(hoursUntilBooking)
    };
  };

  const refundInfo = calculateRefund();

  const handleCancel = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm(reason, refundInfo);
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRefundColor = () => {
    if (refundInfo.refundPercentage === 100) return 'text-green-600';
    if (refundInfo.refundPercentage === 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cancel Booking</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {booking.vehicleDetails?.title || 'Vehicle'}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>Check-in:</strong>{' '}
                {new Date(booking.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <p>
                <strong>Total Paid:</strong> ₱{booking.totalPrice?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Time Until Booking */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Time until booking starts
              </p>
              <p className="text-lg font-bold text-blue-700">
                {refundInfo.hoursUntilBooking} hours
              </p>
            </div>
          </div>

          {/* Refund Information */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Refund Amount
                </p>
                <p className={`text-3xl font-bold ${getRefundColor()}`}>
                  ₱{refundInfo.refundAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {refundInfo.refundPercentage}% of total price
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  Cancellation Policy
                </p>
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Applied:</strong> {refundInfo.refundPolicy}
                </p>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>• 24+ hours before: 100% refund</p>
                  <p>• 10-24 hours before: 50% refund</p>
                  <p>• 5-10 hours before: No refund</p>
                  <p>• Less than 5 hours: No refund</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Cancellation <span className="text-red-600">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for canceling this booking..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone. The booking
              will be permanently cancelled.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:bg-red-400"
          >
            {isProcessing ? 'Processing...' : 'Cancel Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;