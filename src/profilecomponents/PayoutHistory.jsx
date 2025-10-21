import { useState } from 'react';
import { CreditCard, CheckCircle, Calendar, Loader, User, Car, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import Pagination from '../components/reusables/Pagination';

const PayoutHistory = ({ payoutHistory, bookingDetails, payoutsLoading }) => {
  const [expandedPayouts, setExpandedPayouts] = useState({});
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const togglePayout = (payoutId) => {
    setExpandedPayouts(prev => ({
      ...prev,
      [payoutId]: !prev[payoutId]
    }));
  };

  // Sort payouts
  const sortedPayouts = [...payoutHistory].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedPayouts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayouts = sortedPayouts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (payoutsLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payout History</h2>
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (payoutHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payout History</h2>
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No payouts yet</p>
          <p className="text-gray-400 text-sm">Your payouts will appear here once processed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payout History</h2>
        
        {/* Sort Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest to Oldest</option>
            <option value="oldest">Oldest to Newest</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Total Payouts</p>
            <p className="text-2xl font-bold text-green-700">
              ₱{payoutHistory.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Number of Payouts</p>
            <p className="text-2xl font-bold text-blue-700">{payoutHistory.length}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Average Payout</p>
            <p className="text-2xl font-bold text-purple-700">
              ₱{Math.round(payoutHistory.reduce((sum, p) => sum + (p.amount || 0), 0) / payoutHistory.length).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Payouts List */}
        <div className="border-t border-gray-200 pt-6 space-y-3">
          {paginatedPayouts.map((payout, index) => {
            const globalIndex = sortedPayouts.findIndex(p => p.id === payout.id);
            const isExpanded = expandedPayouts[payout.id];

            return (
              <div
                key={payout.id}
                className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                {/* Header - Always Visible */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">Payout #{sortedPayouts.length - globalIndex}</h3>
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(payout.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ₱{(payout.amount || 0).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => togglePayout(payout.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">GCash Account</p>
                          <p className="text-sm font-medium text-gray-900">{payout.accountName}</p>
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

                        <div>
                          <p className="text-xs text-gray-600 mb-1">Time Processed</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(payout.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {payout.notes && (
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Notes</p>
                          <p className="text-sm text-gray-700">{payout.notes}</p>
                        </div>
                      )}

                      {payout.bookingIds && payout.bookingIds.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-sm font-semibold text-gray-900 mb-3">
                            Bookings Included ({payout.bookingIds.length})
                          </p>
                          <div className="space-y-3">
                            {payout.bookingIds.map(bookingId => {
                              const booking = bookingDetails[bookingId];
                              
                              if (!booking) {
                                return (
                                  <div key={bookingId} className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <p className="text-xs text-gray-500 font-mono">{bookingId}</p>
                                    <p className="text-xs text-gray-400 mt-1">Loading booking details...</p>
                                  </div>
                                );
                              }

                              return (
                                <div key={bookingId} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                  {/* Booking Reference */}
                                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-300">
                                    <p className="text-xs font-mono text-gray-500">{bookingId}</p>
                                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                      {booking.status}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Guest Details */}
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 mb-2">
                                        <User className="w-4 h-4 text-blue-600" />
                                        <p className="text-xs font-semibold text-gray-700 uppercase">Guest Details</p>
                                      </div>
                                      
                                      <div>
                                        <p className="text-xs text-gray-600">Name</p>
                                        <p className="text-sm font-medium text-gray-900">
                                          {booking.guestDetails?.name || 'N/A'}
                                        </p>
                                      </div>
                                      
                                      <div>
                                        <p className="text-xs text-gray-600">Email</p>
                                        <p className="text-sm text-gray-900">
                                          {booking.guestDetails?.email || 'N/A'}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Vehicle Details */}
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Car className="w-4 h-4 text-blue-600" />
                                        <p className="text-xs font-semibold text-gray-700 uppercase">Vehicle Rented</p>
                                      </div>
                                      
                                      {booking.vehicleDetails?.image && (
                                        <div className="mb-2">
                                          <img 
                                            src={booking.vehicleDetails.image} 
                                            alt={booking.vehicleDetails.title}
                                            className="w-full h-24 object-cover rounded border border-gray-200"
                                          />
                                        </div>
                                      )}
                                      
                                      <div>
                                        <p className="text-xs text-gray-600">Vehicle</p>
                                        <p className="text-sm font-medium text-gray-900">
                                          {booking.vehicleDetails?.title || 'N/A'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Booking Dates and Price */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-300">
                                    <div>
                                      <p className="text-xs text-gray-600">Start Date</p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {new Date(booking.startDate).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <p className="text-xs text-gray-600">End Date</p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {new Date(booking.endDate).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <p className="text-xs text-gray-600">Total Price</p>
                                      <p className="text-sm font-bold text-green-600">
                                        ₱{(booking.totalPrice || 0).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default PayoutHistory;