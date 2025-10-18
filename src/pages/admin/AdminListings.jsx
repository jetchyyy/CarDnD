import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Search, Trash2, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, search, statusFilter, vehicleTypeFilter]);

  const fetchListings = async () => {
    try {
      const listingsSnap = await getDocs(collection(db, 'vehicles'));
      const listingsData = listingsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings(listingsData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = listings;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(l => (l.status || 'available') === statusFilter);
    }

    if (vehicleTypeFilter !== 'all') {
      filtered = filtered.filter(l => l.type === vehicleTypeFilter);
    }

    if (search) {
      filtered = filtered.filter(l =>
        l.specifications?.brand?.toLowerCase().includes(search.toLowerCase()) ||
        l.specifications?.model?.toLowerCase().includes(search.toLowerCase()) ||
        l.owner?.toLowerCase().includes(search.toLowerCase()) ||
        l.location?.toLowerCase().includes(search.toLowerCase()) ||
        l.specifications?.plateNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  const handleApprove = async (listingId) => {
    try {
      await updateDoc(doc(db, 'vehicles', listingId), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
      });
      fetchListings();
      alert('Listing approved successfully');
    } catch (error) {
      console.error('Error approving listing:', error);
      alert('Failed to approve listing');
    }
  };

  const handleReject = async (listingId) => {
    try {
      await updateDoc(doc(db, 'vehicles', listingId), {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
      });
      fetchListings();
      alert('Listing rejected');
    } catch (error) {
      console.error('Error rejecting listing:', error);
      alert('Failed to reject listing');
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteDoc(doc(db, 'vehicles', listingId));
      fetchListings();
      alert('Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing');
    }
  };

  const getStatusBadge = (status) => {
    const defaultStatus = status || 'available';
    const badges = {
      available: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };
    return badges[defaultStatus] || badges.available;
  };

  const getVehicleTitle = (listing) => {
    const brand = listing.specifications?.brand || '';
    const model = listing.specifications?.model || '';
    return `${brand} ${model}`.trim() || listing.title || 'Untitled';
  };

  const getVehicleTypeDisplay = (vehicleType) => {
    return vehicleType === 'car' ? 'Car' : 'Motorcycle';
  };

  if (loading) return <div className="text-center py-12">Loading listings...</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by brand, model, host, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={vehicleTypeFilter}
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="car">Cars</option>
            <option value="motorcycle">Motorcycles</option>
          </select>
          <button
            onClick={fetchListings}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
        <p className="text-gray-600 text-sm mt-3">Total: {filteredListings.length} listings</p>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Vehicle</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Host</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Price/Day</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-600">
                  No listings found
                </td>
              </tr>
            ) : (
              filteredListings.map(listing => {
                const badgeStyle = getStatusBadge(listing.status);
                const StatusIcon = badgeStyle.icon;
                return (
                  <tr key={listing.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {listing.images && listing.images[0] && (
                          <img 
                            src={listing.images[0]} 
                            alt={getVehicleTitle(listing)}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{getVehicleTitle(listing)}</p>
                          <p className="text-xs text-gray-500">{listing.specifications?.year || 'N/A'}</p>
                          {listing.specifications?.plateNumber && (
                            <p className="text-xs text-gray-500 font-mono">{listing.specifications.plateNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        {getVehicleTypeDisplay(listing.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{listing.owner || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm">{listing.location || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold">₱{listing.pricePerDay || 0}</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 ${badgeStyle.bg} ${badgeStyle.text} px-3 py-1 rounded-full text-xs font-semibold w-fit`}>
                        <StatusIcon size={16} />
                        {(listing.status || 'available').charAt(0).toUpperCase() + (listing.status || 'available').slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => { setSelectedListing(listing); setShowDetails(true); }}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {(listing.status || 'available') === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(listing.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(listing.id)}
                              className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Listing Details Modal */}
      {showDetails && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Listing Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Images */}
              {selectedListing.images && selectedListing.images.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedListing.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`Vehicle ${idx + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Type</p>
                  <p className="font-semibold">{getVehicleTypeDisplay(selectedListing.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Brand & Model</p>
                  <p className="font-semibold">{getVehicleTitle(selectedListing)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-semibold">{selectedListing.specifications?.year || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plate Number</p>
                  <p className="font-semibold font-mono">{selectedListing.specifications?.plateNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Host</p>
                  <p className="font-semibold">{selectedListing.owner || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{selectedListing.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price per Day</p>
                  <p className="font-semibold text-lg text-blue-600">₱{selectedListing.pricePerDay || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold">{(selectedListing.status || 'available').charAt(0).toUpperCase() + (selectedListing.status || 'available').slice(1)}</p>
                </div>
                {selectedListing.type === 'car' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Transmission</p>
                      <p className="font-semibold capitalize">{selectedListing.specifications?.transmission || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fuel Type</p>
                      <p className="font-semibold capitalize">{selectedListing.specifications?.fuelType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Seats</p>
                      <p className="font-semibold">{selectedListing.specifications?.seats || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Body Type</p>
                      <p className="font-semibold capitalize">{selectedListing.specifications?.type || 'N/A'}</p>
                    </div>
                  </>
                )}
                {selectedListing.type === 'motorcycle' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Transmission</p>
                      <p className="font-semibold capitalize">{selectedListing.specifications?.transmission || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Engine Size</p>
                      <p className="font-semibold">{selectedListing.specifications?.engineSize ? `${selectedListing.specifications.engineSize}cc` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-semibold capitalize">{selectedListing.specifications?.type || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-700">{selectedListing.description || 'No description provided'}</p>
              </div>

              {/* Features */}
              {selectedListing.features && Object.keys(selectedListing.features).length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedListing.features).map(([key, value]) => (
                      value && (
                        <span key={key} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                {(selectedListing.status || 'available') === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedListing.id);
                        setShowDetails(false);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedListing.id);
                        setShowDetails(false);
                      }}
                      className="flex-1 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Listings Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Available</p>
            <p className="text-2xl font-bold">
              {listings.filter(l => (l.status || 'available') === 'available').length}
            </p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold">
              {listings.filter(l => l.status === 'pending').length}
            </p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Approved</p>
            <p className="text-2xl font-bold">
              {listings.filter(l => l.status === 'approved').length}
            </p>
          </div>
          <div className="border-l-4 border-red-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Rejected</p>
            <p className="text-2xl font-bold">
              {listings.filter(l => l.status === 'rejected').length}
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Total Vehicles</p>
            <p className="text-2xl font-bold">
              {listings.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}