import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Car, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/Authcontext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { login, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setServerError('');

    const result = await login(formData.email, formData.password);
    
    setLoading(false);

    if (result.success) {
      // Navigate to return URL or home
      const returnTo = location.state?.returnTo || '/';
      navigate(returnTo);
    } else {
      // Handle Firebase error messages
      let errorMessage = 'An error occurred. Please try again.';
      
      if (result.error.includes('user-not-found')) {
        errorMessage = 'No account found with this email.';
      } else if (result.error.includes('wrong-password')) {
        errorMessage = 'Incorrect password.';
      } else if (result.error.includes('invalid-credential')) {
        errorMessage = 'Invalid email or password.';
      } else if (result.error.includes('too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setServerError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setServerError('');

    const result = await googleSignIn('guest');
    
    setLoading(false);

    if (result.success) {
      // Navigate to return URL or home
      const returnTo = location.state?.returnTo || '/';
      navigate(returnTo);
    } else {
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (result.error.includes('popup-closed')) {
        errorMessage = 'Sign in was cancelled.';
      } else if (result.error.includes('popup-blocked')) {
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
      }
      
      setServerError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171717] via-[#171717] to-[#8C8C8C]/30 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#007BFF] rounded-full mb-4 shadow-lg">
            <Car className="w-8 h-8 text-[#171717]" />
          </div>
          <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">Welcome Back</h1>
          <p className="text-[#E0E0E0]">Sign in to continue to CarDnD</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl p-8 border border-[#8C8C8C]/30">
          {/* Server Error Message */}
          {serverError && (
            <div className="mb-6 bg-[#EF4444]/10 border border-[#EF4444] rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-[#EF4444] mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-[#EF4444] text-sm">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#171717] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-[#8C8C8C]" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-[#EF4444]' : 'border-[#8C8C8C]'} rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition-colors text-[#171717] bg-[#FFFFFF]`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-2 text-[#EF4444] text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#171717] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-[#8C8C8C]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-[#EF4444]' : 'border-[#8C8C8C]'} rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-transparent transition-colors text-[#171717] bg-[#FFFFFF]`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[#8C8C8C] hover:text-[#171717] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-2 text-[#EF4444] text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-[#007BFF] hover:text-[#007BFF]/80 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#007BFF] hover:bg-[#0056b3] disabled:bg-[#8C8C8C] text-[#171717] font-semibold py-3 rounded-lg transition-all hover:scale-[1.02] flex items-center justify-center shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-[#171717] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#8C8C8C]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#FFFFFF] text-[#8C8C8C]">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-[#FFFFFF] border-2 border-[#8C8C8C] hover:bg-[#FFFFFF]/80 hover:border-[#007BFF] disabled:bg-[#8C8C8C] text-[#171717] font-medium py-3 rounded-lg transition-all hover:scale-[1.02] flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </form>
        </div>

        {/* Toggle to Signup */}
        <div className="mt-6 text-center">
          <p className="text-[#E0E0E0]">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-[#007BFF] hover:text-[#007BFF]/80 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
