import { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { CreditCard, Calendar, CheckCircle, Loader } from 'lucide-react';

const PayoutHistory = ({ userId }) => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchPayouts = async () => {
      try {
        const q = query(
          collection(db, 'payoutTransactions'),
          where('hostId', '==', userId),
          where('status', '==', 'completed')
        );
        const snapshot = await getDocs(q);

        const payoutList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by most recent first
        payoutList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPayouts(payoutList);
      } catch (error) {
        console.error('Error fetching payouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payout History</h2>
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payout History</h2>

      {payouts.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No payouts yet</p>
          <p className="text-gray-400 text-sm">Your payouts will appear here once processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total Payouts</p>
              <p className="text-2xl font-bold text-green-700">
                ₱{payouts.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Number of Payouts</p>
              <p className="text-2xl font-bold text-blue-700">{payouts.length}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Average Payout</p>
              <p className="text-2xl font-bold text-purple-700">
                ₱{Math.round(payouts.reduce((sum, p) => sum + (p.amount || 0), 0) / payouts.length).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payouts List */}
          <div className="border-t border-gray-200 pt-6">
            {payouts.map((payout, index) => (
              <div
                key={payout.id}
                className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-3"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">Payout #{payouts.length - index}</h3>
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">GCash Account</p>
                        <p className="text-sm font-medium text-gray-900">{payout.accountName}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Mobile Number</p>
                        <p className="text-sm font-medium text-gray-900">{payout.mobileNumber}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Reference Number</p>
                        <p className="text-sm font-mono font-medium text-gray-900">{payout.referenceNumber}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Date Processed</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(payout.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {payout.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{payout.notes}</p>
                      </div>
                    )}

                    {payout.bookingIds && payout.bookingIds.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Bookings Included ({payout.bookingIds.length})</p>
                        <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                          {payout.bookingIds.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-3xl font-bold text-green-600">
                    ₱{(payout.amount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(payout.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutHistory;