import { useState, useEffect } from 'react';
import { X, Cookie, Shield, Settings } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('parenta_cookie_consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    savePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    savePreferences(onlyNecessary);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const savePreferences = (prefs) => {
    localStorage.setItem('parenta_cookie_consent', JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
    
    // Here you would typically initialize your analytics/marketing scripts
    if (prefs.analytics) {
      // Initialize analytics (e.g., Google Analytics)
      console.log('Analytics cookies enabled');
    }
    if (prefs.marketing) {
      // Initialize marketing pixels
      console.log('Marketing cookies enabled');
    }
    if (prefs.functional) {
      // Initialize functional cookies
      console.log('Functional cookies enabled');
    }
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Cannot toggle necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6 md:p-8">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-br from-[#0077B6] to-[#00B4D8] rounded-xl">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  We Value Your Privacy
                </h3>
                <p className="text-gray-600 text-sm md:text-base mb-4 leading-relaxed">
                  We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies. You can customize your preferences or reject non-essential cookies.
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#0077B6] to-[#00B4D8] hover:from-[#023E8A] hover:to-[#0077B6] text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all duration-300"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-2.5 border-2 border-gray-300 hover:border-[#0077B6] text-gray-700 hover:text-[#0077B6] font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Customize
                  </button>
                </div>

                {/* Privacy Policy Link */}
                <div className="mt-3">
                  <a 
                    href="/privacy" 
                    className="text-sm text-[#0077B6] hover:text-[#023E8A] underline transition-colors"
                  >
                    Read our Privacy Policy
                  </a>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleRejectAll}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close cookie banner"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#0077B6] to-[#00B4D8] rounded-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Cookie Preferences</h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <p className="text-gray-600">
                Manage your cookie preferences below. Some cookies are essential for the website to function properly.
              </p>

              {/* Necessary Cookies */}
              <div className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-[#0077B6]" />
                      <h3 className="font-bold text-gray-900">Necessary Cookies</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Always Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Essential for the website to function. These cookies enable core functionality such as security, authentication, and accessibility.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#0077B6]/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Analytics Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className="flex-shrink-0"
                  >
                    <div className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 px-1 ${
                      preferences.analytics ? 'bg-[#0077B6] justify-end' : 'bg-gray-300 justify-start'
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#0077B6]/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Marketing Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('marketing')}
                    className="flex-shrink-0"
                  >
                    <div className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 px-1 ${
                      preferences.marketing ? 'bg-[#0077B6] justify-end' : 'bg-gray-300 justify-start'
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#0077B6]/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Functional Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Enable enhanced functionality and personalization, such as language preferences and chat features.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('functional')}
                    className="flex-shrink-0"
                  >
                    <div className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 px-1 ${
                      preferences.functional ? 'bg-[#0077B6] justify-end' : 'bg-gray-300 justify-start'
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0077B6] to-[#00B4D8] hover:from-[#023E8A] hover:to-[#0077B6] text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
