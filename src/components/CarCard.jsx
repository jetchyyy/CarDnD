import { useState, useEffect } from 'react';
import { MapPin, Star, Users, Fuel, Settings, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const CarCard = ({ vehicle }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // Extract data from Firestore structure
  const id = vehicle.id;
  const title = vehicle.title || `${vehicle.specifications?.brand} ${vehicle.specifications?.model}`;
  const type = vehicle.type || 'motorcycle';
  const image = vehicle.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';
  const price = vehicle.pricePerDay;
  const totalTrips = vehicle.totalTrips || 0;
  const location = vehicle.location;
  const transmission = vehicle.specifications?.transmission || 'Automatic';
  const fuelType = vehicle.specifications?.fuelType || 'Gasoline';
  const seats = vehicle.specifications?.seats;
  const engineSize = vehicle.specifications?.engineSize;
  const owner = vehicle.owner || 'Unknown';

  const isCar = type === 'car';

  // Fetch reviews for this vehicle and calculate rating
  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const q = query(collection(db, 'reviews'), where('carId', '==', id));
        const snapshot = await getDocs(q);
        const fetchedReviews = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            rating: data.rating || 0,
          };
        });
        
        // Sort by date, newest first
        fetchedReviews.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
        setReviews(fetchedReviews);

        // Calculate average rating
        if (fetchedReviews.length > 0) {
          const avgRating = (
            fetchedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / 
            fetchedReviews.length
          ).toFixed(1);
          setAverageRating(parseFloat(avgRating));
        } else {
          setAverageRating(0);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setAverageRating(0);
      } finally {
        setLoadingReviews(false);
      }
    };

    // Fetch reviews immediately when component loads (not just on expand)
    fetchReviews();
  }, [id]);

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/vehicles/${id}`)}
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-full shadow-md">
          <span className="text-sm font-semibold text-gray-900 capitalize">{type}</span>
        </div>

      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title with Rating */}
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-semibold text-gray-900">{averageRating}</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1.5" />
          <span className="text-sm">{location}</span>
        </div>

        {/* Vehicle Features - Different for Car vs Motorcycle */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          {isCar ? (
            <>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{seats} seats</span>
              </div>
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-1" />
                <span className="capitalize">{transmission}</span>
              </div>
              <div className="flex items-center">
                <Fuel className="w-4 h-4 mr-1" />
                <span className="capitalize">{fuelType}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <Gauge className="w-4 h-4 mr-1" />
                <span>{engineSize}cc</span>
              </div>
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-1" />
                <span className="capitalize">{transmission}</span>
              </div>
              <div className="flex items-center">
                <Fuel className="w-4 h-4 mr-1" />
                <span className="capitalize">{fuelType}</span>
              </div>
            </>
          )}
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
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/vehicles/${id}`);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;