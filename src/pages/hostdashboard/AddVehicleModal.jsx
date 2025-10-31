// pages/HostDashboard/components/AddVehicleModal.jsx
import { X, Car, Bike } from 'lucide-react';
import AddCar from '../AddCar';
import AddMotorcycle from '../AddMotorcycle';

const AddVehicleModal = ({ show, onClose, addType, setAddType }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start overflow-auto py-10 z-50">
      <div className="relative bg-white w-full max-w-5xl rounded-xl shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex justify-center space-x-4 border-b p-4">
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
              addType === 'car'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setAddType('car')}
          >
            <Car className="w-5 h-5" />
            <span>Add Car</span>
          </button>
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
              addType === 'motorcycle'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setAddType('motorcycle')}
          >
            <Bike className="w-5 h-5" />
            <span>Add Motorcycle</span>
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {addType === 'car' ? (
            <AddCar onSuccess={onClose} />
          ) : (
            <AddMotorcycle onSuccess={onClose} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddVehicleModal;