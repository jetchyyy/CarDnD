import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/Authcontext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import CarList from './pages/CarList';
import CarDetails from './pages/CarDetails';
import HostDashboard from './pages/HostDashboard';
import AddCar from './pages/AddCar';
import AddMotorcycle from './pages/AddMotorcycle';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/vehicles" element={<CarList />} />
              <Route path="/vehicles/:id" element={<CarDetails />} />
              <Route path="/host/dashboard" element={<HostDashboard />} />
              <Route path="/host/add-car" element={<AddCar />} />
              <Route path="/host/add-motorcycle" element={<AddMotorcycle />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;