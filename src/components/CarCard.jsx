import { MapPin, Star, Users, Fuel, Settings, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CarCard = ({ vehicle }) => {
  const navigate = useNavigate();
  // Extract data from Firestore structure
  const id = vehicle.id;
  const title = vehicle.title || `${vehicle.specifications?.brand} ${vehicle.specifications?.model}`;
  const type = vehicle.type || 'car';
  const image = vehicle.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';
  const price = vehicle.pricePerDay;
  const rating = vehicle.rating || 4.5;
  const totalTrips = vehicle.totalTrips || 0;
  const location = vehicle.location;
  const transmission = vehicle.specifications?.transmission || 'Automatic';
  const fuelType = vehicle.specifications?.fuelType || 'Gasoline';
  const seats = vehicle.specifications?.seats;
  const engineSize = vehicle.specifications?.engineSize;
  const owner = vehicle.owner || 'Unknown';

  const isCar = type === 'car';

  return (
    <div 
      className="bg-[#FFFFFF] rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-[#8C8C8C]/20 hover:border-[#007BFF]/50"
      onClick={() => navigate(`/vehicles/${id}`)}
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-[#171717] px-3 py-1.5 rounded-full shadow-md border border-[#007BFF]">
          <span className="text-sm font-semibold text-[#FFFFFF] capitalize">{type}</span>
        </div>
        {rating >= 4.5 && (
          <div className="absolute top-3 left-3 bg-[#007BFF] text-[#171717] px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            Featured
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 bg-[#FFFFFF]">
        {/* Title and Rating */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-[#171717] group-hover:text-[#007BFF] transition-colors">
            {title}
          </h3>
          <div className="flex items-center space-x-1 bg-[#171717] px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-[#007BFF] fill-current" />
            <span className="text-sm font-semibold text-[#FFFFFF]">{rating}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-[#8C8C8C] mb-3">
          <MapPin className="w-4 h-4 mr-1.5 text-[#007BFF]" />
          <span className="text-sm">{location}</span>
        </div>

        {/* Vehicle Features - Different for Car vs Motorcycle */}
        <div className="flex items-center justify-between mb-4 text-sm text-[#8C8C8C]">
          {isCar ? (
            <>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-[#171717]" />
                <span>{seats} seats</span>
              </div>
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-1 text-[#171717]" />
                <span className="capitalize">{transmission}</span>
              </div>
              <div className="flex items-center">
                <Fuel className="w-4 h-4 mr-1 text-[#171717]" />
                <span className="capitalize">{fuelType}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <Gauge className="w-4 h-4 mr-1 text-[#171717]" />
                <span>{engineSize}cc</span>
              </div>
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-1 text-[#171717]" />
                <span className="capitalize">{transmission}</span>
              </div>
              <div className="flex items-center">
                <Fuel className="w-4 h-4 mr-1 text-[#171717]" />
                <span className="capitalize">{fuelType}</span>
              </div>
            </>
          )}
        </div>

        {/* Owner Info */}
        <div className="flex items-center mb-4 pb-4 border-b border-[#8C8C8C]/30">
          <div className="w-8 h-8 bg-[#007BFF] rounded-full flex items-center justify-center text-[#171717] font-semibold text-sm mr-2">
            {owner.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-[#8C8C8C]">Hosted by</p>
            <p className="text-sm font-semibold text-[#171717]">{owner}</p>
          </div>
        </div>

        {/* Pricing and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-[#171717]">₱{price}</span>
              <span className="text-[#8C8C8C] text-sm ml-1">/day</span>
            </div>
            <p className="text-xs text-[#8C8C8C]">{totalTrips} trips</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/vehicles/${id}`);
            }}
            className="bg-[#007BFF] hover:bg-[#0056b3] text-[#171717] font-semibold px-6 py-2.5 rounded-lg transition-all hover:scale-105 shadow-md"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
