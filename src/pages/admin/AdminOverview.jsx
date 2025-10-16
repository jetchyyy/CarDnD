import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Car, Calendar, TrendingUp } from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalHosts: 0,
    totalRenters: 0,
    totalListings: 0,
    totalBookings: 0,
    totalEarnings: 0,
  });
  const [bookingsTrend, setBookingsTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => doc.data());
      const hosts = users.filter(u => u.role === 'host').length;
      const renters = users.filter(u => u.role === 'renter').length;

      // Fetch listings
      const listingsSnap = await getDocs(collection(db, 'listings'));
      const totalListings = listingsSnap.size;

      // Fetch bookings
      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      const totalBookings = bookingsSnap.size;

      // Fetch transactions for earnings
      const transactionsSnap = await getDocs(collection(db, 'transactions'));
      const totalEarnings = transactionsSnap.docs.reduce((sum, doc) => {
        const commission = doc.data().commission || 0;
        return sum + commission;
      }, 0);

      setStats({
        totalHosts: hosts,
        totalRenters: renters,
        totalListings,
        totalBookings,
        totalEarnings: totalEarnings.toFixed(2),
      });

      // Generate booking trend (mock data - replace with real aggregation)
      generateBookingsTrend(bookingsSnap.docs);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const generateBookingsTrend = (bookings) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const trendData = months.map((month, index) => ({
      month,
      bookings: 0,
    }));

    bookings.forEach(doc => {
      const createdAt = doc.data().createdAt?.toDate?.() || new Date();
      if (createdAt.getFullYear() === currentYear) {
        const monthIndex = createdAt.getMonth();
        trendData[monthIndex].bookings += 1;
      }
    });

    setBookingsTrend(trendData);
  };

  if (loading) {
    return <div className="text-center py-12">Loading statistics...</div>;
  }

  const cards = [
    { label: 'Total Hosts', value: stats.totalHosts, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Renters', value: stats.totalRenters, icon: Users, color: 'bg-green-500' },
    { label: 'Total Listings', value: stats.totalListings, icon: Car, color: 'bg-purple-500' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'bg-orange-500' },
    { label: 'Total Earnings', value: `₱${stats.totalEarnings}`, icon: TrendingUp, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-full`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Bookings Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Bookings Trend (This Year)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bookingsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Top Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Platform Summary</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Hosts', value: stats.totalHosts },
                { name: 'Renters', value: stats.totalRenters },
                { name: 'Listings', value: stats.totalListings },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Users</p>
            <p className="text-2xl font-bold">{stats.totalHosts + stats.totalRenters}</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Active Listings</p>
            <p className="text-2xl font-bold">{stats.totalListings}</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">This Month Bookings</p>
            <p className="text-2xl font-bold">{stats.totalBookings}</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold">₱{stats.totalEarnings}</p>
          </div>
        </div>
      </div>
    </div>
  );
}