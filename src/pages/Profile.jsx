import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '../context/Authcontext'; // Import useAuth
import { db } from '../firebase/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ProfileCard from '../profilecomponents/ProfileCard';
import ProfileInfoForm from '../profilecomponents/ProfileInfoForm';
import PayoutHistory from '../profilecomponents/PayoutHistory';
import BookingHistory from '../profilecomponents/BookingHistory';
import PayoutMethods from '../components/PayoutMethods';
import { fetchVehicleCount } from '../../api/vehicleService';
import { getGuestBookings } from '../utils/bookingService';
import { getPayout } from '../../api/transaction';

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // Use useAuth hook
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    joinedDate: '',
    photoUrl: ''
  });
  
  const [tempData, setTempData] = useState({ ...profileData });
  const [bookingHistory, setBookingHistory] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({});
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    rating: 0,
    vehicles: 0
  });
  const [vehicleCount, setVehicleCount] = useState(0);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Redirect to login if no user
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const profileInfo = {
            fullName: userData.name || '',
            email: userData.email || user.email || '',
            phone: userData.phone || '',
            location: userData.location || '',
            bio: userData.bio || '',
            photoUrl: userData.photoUrl || '',
            joinedDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'
          };
          setProfileData(profileInfo);
          setTempData(profileInfo);

          setStats({
            totalTrips: userData.totalTrips || 0,
            rating: userData.rating || 0,
            vehicles: userData.vehicles || 0
          });
        } else {
          const newProfile = {
            fullName: user.name || '',
            email: user.email || '',
            phone: '',
            location: '',
            bio: '',
            photoUrl: user.photoUrl || '',
            joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
          };
          setProfileData(newProfile);
          setTempData(newProfile);

          await updateDoc(doc(db, 'users', user.userId), {
            name: user.name || '',
            email: user.email || '',
            createdAt: new Date().toISOString()
          }).catch(() => {});
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const VehicleCount = async () => {
      try {
        const vehicleCount = await fetchVehicleCount()
        setVehicleCount(vehicleCount);
      } catch (error) {
        console.error('Error fetching vehicle count:', error);
      }
    };

    const fetchBookings = async () => {
      try {
        const bookingsData = await getGuestBookings()
        
        const bookings = bookingsData.map((data) => ({
          id: data.id,
          vehicleName: data.vehicleDetails?.title || "Vehicle",
          type: data.vehicleDetails?.type || "Car",
          date: `${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()}`,
          amount: `₱${data.totalPrice?.toLocaleString() || "0"}`,
          status: data.status
            ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
            : "Unknown",
          createdAt: data.createdAt || new Date().toISOString(),
        }));
        
        bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookingHistory(bookings.slice(0, 10));
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPayouts = async () => {
      try {
        const payouts = await getPayout()

        payouts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPayoutHistory(payouts);

        const allBookingIds = payouts.flatMap(p => p.bookingIds || []);
        await fetchBookingDetails(allBookingIds);
      } catch (error) {
        console.error('Error fetching payouts:', error);
      } finally {
        setPayoutsLoading(false);
      }
    };

    const fetchBookingDetails = async (bookingIds) => {
      if (!bookingIds || bookingIds.length === 0) return;

      const details = {};
      
      try {
        for (const bookingId of bookingIds) {
          const bookingRef = doc(db, 'bookings', bookingId);
          const bookingSnap = await getDoc(bookingRef);
          
          if (bookingSnap.exists()) {
            details[bookingId] = {
              id: bookingId,
              ...bookingSnap.data()
            };
          }
        }
        
        setBookingDetails(details);
      } catch (error) {
        console.error('Error fetching booking details:', error);
      }
    };

    fetchProfile();
    fetchBookings();
    VehicleCount();
    fetchPayouts();
  }, [user, authLoading, navigate]);

  // Show loading while auth is being checked
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show message if no user (shouldn't happen due to redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard
              currentUser={user}
              profileData={profileData}
              setProfileData={setProfileData}
              setTempData={setTempData}
              stats={stats}
              vehicleCount={vehicleCount}
            />
          </div>

          {/* Right Section - Profile Details and History */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileInfoForm
              currentUser={user}
              profileData={profileData}
              setProfileData={setProfileData}
            />

            <PayoutMethods />

            <PayoutHistory
              payoutHistory={payoutHistory}
              bookingDetails={bookingDetails}
              payoutsLoading={payoutsLoading}
            />

            <BookingHistory bookingHistory={bookingHistory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;