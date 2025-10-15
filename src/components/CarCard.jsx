import { MapPin, Star, Users, Fuel, Settings } from 'lucide-react';

const CarCard = ({ vehicle }) => {
  const {
    id,
    name,
    type,
    image,
    price,
    rating,
    totalTrips,
    location,
    transmission,
    fuelType,
    seats,
    owner
  } = vehicle;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white px-3 py-1.5 rounded-full shadow-md">
          <span className="text-sm font-semibold text-gray-900 capitalize">{type}</span>
        </div>
        {rating >= 4.5 && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Featured
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title and Rating */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-semibold text-gray-900">{rating}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1.5" />
          <span className="text-sm">{location}</span>
        </div>

        {/* Vehicle Features */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{seats} seats</span>
          </div>
          <div className="flex items-center">
            <Settings className="w-4 h-4 mr-1" />
            <span>{transmission}</span>
          </div>
          <div className="flex items-center">
            <Fuel className="w-4 h-4 mr-1" />
            <span>{fuelType}</span>
          </div>
        </div>

        {/* Owner Info */}
        <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-2">
            {owner.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-gray-600">Hosted by</p>
            <p className="text-sm font-semibold text-gray-900">{owner}</p>
          </div>
        </div>

        {/* Pricing and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">₱{price}</span>
              <span className="text-gray-600 text-sm ml-1">/day</span>
            </div>
            <p className="text-xs text-gray-500">{totalTrips} trips</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;