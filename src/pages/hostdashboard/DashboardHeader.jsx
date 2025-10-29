// pages/HostDashboard/components/DashboardHeader.jsx
import { Plus, Lock } from 'lucide-react';

const DashboardHeader = ({ canAddVehicle, isPending, onAddVehicleClick }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your vehicles and bookings</p>
      </div>
      
      <div className="relative">
        <button
          onClick={onAddVehicleClick}
          disabled={!canAddVehicle}
          className={`flex items-center space-x-2 font-semibold px-6 py-3 rounded-lg transition-colors ${
            canAddVehicle
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {!canAddVehicle && <Lock className="w-5 h-5" />}
          <Plus className="w-5 h-5" />
          <span>Add Vehicle</span>
        </button>
        {!canAddVehicle && (
          <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg p-3 border border-gray-200 z-10">
            <p className="text-xs text-gray-600">
              {isPending 
                ? '⏳ Your ID verification is pending. You can add vehicles once approved.'
                : '🔒 Please verify your ID to start listing vehicles.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;