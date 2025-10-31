import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import {
  Calendar,
  Hash,
  CreditCard,
  FileText,
  Car
} from 'lucide-react';
import MyProfileDisplayCard from '../components/reusables/MyProfileDisplayCard';

export default function GuestRefundDetails({ bookingId, guestId }) {
  const [refundDetails, setRefundDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefundDetails();
  }, [bookingId]);

  const fetchRefundDetails = async () => {
    try {
      // Fetch refund transaction
      const q = query(
        collection(db, 'refundTransactions'),
        where('bookingId', '==', bookingId),
        where('guestId', '==', guestId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const refundData = snapshot.docs[0].data();
        setRefundDetails(refundData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching refund details:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4 h-20"></div>
    );
  }

  if (!refundDetails) {
    return null;
  }

  return (
    <MyProfileDisplayCard 
      title="Refund Processed Successfully" 
      isOpen={false}
    >
      <div className="space-y-4">
        {/* Amount Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <span>Refund Amount</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ₱{refundDetails.refundAmount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {refundDetails.refundPercentage}% of ₱{refundDetails.originalAmount.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <Hash className="w-4 h-4" />
              <span>Reference Number</span>
            </div>
            <p className="text-lg font-bold text-gray-900 font-mono break-all">
              {refundDetails.referenceNumber}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-600">Processed on:</span>
            <span className="font-semibold text-gray-900">
              {new Date(refundDetails.processedAt).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <CreditCard className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-semibold text-gray-900 uppercase">
              {refundDetails.refundMethod}
            </span>
          </div>

          {refundDetails.vehicleTitle && (
            <div className="flex items-center gap-3 text-sm">
              <Car className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-gray-600">Vehicle:</span>
              <span className="font-semibold text-gray-900">
                {refundDetails.vehicleTitle}
              </span>
            </div>
          )}

          {refundDetails.notes && (
            <div className="flex items-start gap-3 text-sm">
              <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-gray-600">Admin Notes:</span>
                <p className="font-medium text-gray-900 mt-1 bg-white rounded p-2">
                  {refundDetails.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-green-200">
          <p className="text-xs text-green-700">
            💡 Please allow 1-3 business days for the refund to reflect in your account.
            If you have any questions, please contact support with reference number: <strong>{refundDetails.referenceNumber}</strong>
          </p>
        </div>
      </div>
    </MyProfileDisplayCard>
  );
}