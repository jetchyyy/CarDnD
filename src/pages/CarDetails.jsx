import { useState } from 'react';
import { MapPin, Star, Users, Fuel, Settings, Calendar, Shield, Clock, MessageCircle, Heart } from 'lucide-react';

const CarDetails = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const vehicle = {
    id: 1,
    name: 'Tesla Model 3',
    type: 'car',
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'
    ],
    price: 89,
    rating: 4.9,
    totalTrips: 124,
    totalReviews: 98,
    location: 'Cebu City',
    transmission: 'Automatic',
    fuelType: 'Electric',
    seats: 5,
    year: 2022,
    brand: 'Tesla',
    owner: {
      name: 'Juan Cruz',
      avatar: 'JC',
      joinedDate: 'January 2023',
      totalVehicles: 3,
      responseRate: 95,
      responseTime: '30 mins'
    },
    description: 'Experience luxury and sustainability with this pristine Tesla Model 3. Perfect for both city driving and long trips. Features autopilot, premium sound system, and all the latest Tesla technology. The car is well-maintained and serviced regularly.',
    features: [
      'Autopilot',
      'Premium Audio',
      'Glass Roof',
      'Smartphone Integration',
      'Bluetooth',
      'USB Charging',
      'Air Conditioning',
      'Power Windows'
    ],
    rules: [
      'No smoking',
      'No pets',
      'Valid driver\'s license required',
      'Minimum age: 21 years old',
      'Fuel/charge level must be returned as received'
    ]
  };

  const reviews = [
    {
      id: 1,
      userName: 'Maria Santos',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Amazing car! Juan was very accommodating and the Tesla was in perfect condition. Highly recommend!'
    },
    {
      id: 2,
      userName: 'Pedro Garcia',
      rating: 5,
      date: '1 month ago',
      comment: 'Great experience renting this Tesla. Clean, smooth drive, and excellent communication with the owner.'
    },
    {
      id: 3,
      userName: 'Lisa Chen',
      rating: 4,
      date: '2 months ago',
      comment: 'Very nice car and owner was responsive. Only minor issue was pickup time coordination but overall great!'
    }
  ];

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days > 0 ? days * vehicle.price : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center">
          ← Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="relative h-96">
                <img
                  src={vehicle.images[selectedImage]}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 p-4">
                {vehicle.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-video rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-blue-600' : ''
                    }`}
                  >
                    <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{vehicle.name}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{vehicle.location}</span>
                  </div>
                </div>
                <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                  <span className="font-bold text-gray-900">{vehicle.rating}</span>
                  <span className="text-gray-600 ml-1">({vehicle.totalReviews})</span>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Seats</p>
                    <p className="font-semibold text-gray-900">{vehicle.seats}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Transmission</p>
                    <p className="font-semibold text-gray-900">{vehicle.transmission}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Fuel className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Fuel Type</p>
                    <p className="font-semibold text-gray-900">{vehicle.fuelType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Year</p>
                    <p className="font-semibold text-gray-900">{vehicle.year}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">About this vehicle</h2>
                <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {vehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Rules</h2>
                <div className="space-y-2">
                  {vehicle.rules.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <span className="text-gray-700">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Meet your host</h2>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {vehicle.owner.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{vehicle.owner.name}</h3>
                    <p className="text-gray-600 text-sm">Joined {vehicle.owner.joinedDate}</p>
                    <p className="text-gray-600 text-sm">{vehicle.owner.totalVehicles} vehicles</p>
                  </div>
                </div>
                <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>Message</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-gray-600 text-sm">Response rate</p>
                  <p className="font-bold text-gray-900">{vehicle.owner.responseRate}%</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Response time</p>
                  <p className="font-bold text-gray-900">{vehicle.owner.responseTime}</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Reviews ({vehicle.totalReviews})
              </h2>
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold">
                          {review.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.userName}</p>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">₱{vehicle.price}</span>
                  <span className="text-gray-600 ml-2">/day</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{vehicle.totalTrips} trips</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pick-up Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {calculateTotal() > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">₱{vehicle.price} x {Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} days</span>
                    <span className="font-semibold text-gray-900">₱{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Service fee</span>
                    <span className="font-semibold text-gray-900">₱{Math.round(calculateTotal() * 0.05)}</span>
                  </div>
                  <div className="border-t border-blue-200 mt-3 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">₱{calculateTotal() + Math.round(calculateTotal() * 0.05)}</span>
                  </div>
                </div>
              )}

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-colors mb-4">
                Book Now
              </button>

              <p className="text-center text-sm text-gray-500">You won't be charged yet</p>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Protected</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;