// pages/HostDashboard/components/VehiclesTab.jsx
import { Car, Bike, Plus, Eye, Edit, Trash2, Lock } from 'lucide-react';

const VehiclesTab = ({ 
  vehicles, 
  loading, 
  canAddVehicle,
  handleAddVehicleClick,
  handleDelete,
  getStatusColor 
}) => {
  if (loading) {
    return <p className="text-gray-500 text-center py-10">Loading vehicles...</p>;
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">No vehicles listed yet</p>
        <p className="text-gray-400 text-sm mb-6">Start earning by adding your first vehicle</p>
        <button
          onClick={handleAddVehicleClick}
          disabled={!canAddVehicle}
          className={`inline-flex items-center space-x-2 font-semibold px-6 py-3 rounded-lg transition-colors ${
            canAddVehicle
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {!canAddVehicle && <Lock className="w-5 h-5" />}
          <Plus className="w-5 h-5" />
          <span>Add Your First Vehicle</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Vehicles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <img
                src={v.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                alt={v.title || `${v.specifications?.brand} ${v.specifications?.model}`}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  v.status || 'available'
                )}`}
              >
                {v.status === 'available' ? 'Available' : v.status}
              </span>
              <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full">
                <span className="text-xs font-semibold text-gray-700 capitalize flex items-center">
                  {v.type === 'car' ? (
                    <Car className="w-3 h-3 mr-1" />
                  ) : (
                    <Bike className="w-3 h-3 mr-1" />
                  )}
                  {v.type}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {v.title || `${v.specifications?.brand} ${v.specifications?.model}`}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{v.location}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Price/day</p>
                  <p className="font-semibold text-gray-900">
                    ₱{v.pricePerDay}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Year</p>
                  <p className="font-semibold text-gray-900">
                    {v.specifications?.year}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Transmission</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {v.specifications?.transmission}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    {v.type === 'car' ? 'Seats' : 'Engine'}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {v.type === 'car' 
                      ? v.specifications?.seats 
                      : `${v.specifications?.engineSize}cc`}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(v.id, v.images)}
                  className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehiclesTab;