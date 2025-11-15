import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platformName: 'VehicleHub',
    platformEmail: 'admin@vehiclehub.com',
    platformPhone: '+63 950 123 4567',
    commissionRate: 10,
    minCommissionAmount: 50,
    maxListingPrice: 10000,
    platformFee: 2.5,
    serviceFeeThreshold: 2000,
    serviceFeeAboveThreshold: 5,
    serviceFeeBelowThreshold: 3,
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: '',
  });

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settingsSnap = await getDocs(collection(db, 'settings'));
      if (settingsSnap.docs.length > 0) {
        setSettings(prev => ({
          ...prev,
          ...settingsSnap.docs[0].data(),
        }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'platformSettings');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  if (loading) return <div className="text-center py-12">Loading settings...</div>;

  // Calculate examples for both tiers
  const exampleBelow = 1500;
  const exampleAbove = 3000;
  
  const serviceFeeBelow = (exampleBelow * settings.serviceFeeBelowThreshold) / 100;
  const hostEarningsBelow = exampleBelow - serviceFeeBelow;
  
  const serviceFeeAbove = (exampleAbove * settings.serviceFeeAboveThreshold) / 100;
  const hostEarningsAbove = exampleAbove - serviceFeeAbove;

  return (
    <div className="space-y-6">
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          Settings saved successfully!
        </div>
      )}

      {/* Platform Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Platform Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Platform Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => handleChange('platformName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.platformEmail}
                onChange={(e) => handleChange('platformEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={settings.platformPhone}
                onChange={(e) => handleChange('platformPhone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tiered Service Fee Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Tiered Service Fee Configuration</h2>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm">Service fee is automatically calculated based on the booking amount. Lower fees for smaller bookings encourage more transactions, while higher fees for larger bookings maximize revenue.</p>
        </div>
        
        <div className="space-y-6">
          {/* Threshold Setting */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Service Fee Threshold</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">₱</span>
              <input
                type="number"
                value={settings.serviceFeeThreshold}
                onChange={(e) => handleChange('serviceFeeThreshold', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
                step="100"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Bookings below this amount use the lower fee rate, bookings above use the higher rate</p>
          </div>

          {/* Fee Rates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Below Threshold */}
            <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">LOWER TIER</div>
                <span className="text-sm text-gray-600">Below ₱{settings.serviceFeeThreshold.toLocaleString()}</span>
              </div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service Fee Percentage</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.serviceFeeBelowThreshold}
                  onChange={(e) => handleChange('serviceFeeBelowThreshold', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                  max="50"
                  step="0.1"
                />
                <span className="text-gray-600 font-semibold">%</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Applied to smaller bookings</p>
            </div>

            {/* Above Threshold */}
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">HIGHER TIER</div>
                <span className="text-sm text-gray-600">Above ₱{settings.serviceFeeThreshold.toLocaleString()}</span>
              </div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service Fee Percentage</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.serviceFeeAboveThreshold}
                  onChange={(e) => handleChange('serviceFeeAboveThreshold', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="50"
                  step="0.1"
                />
                <span className="text-gray-600 font-semibold">%</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Applied to larger bookings</p>
            </div>
          </div>

          {/* Service Fee Preview */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">Service Fee Calculation Examples:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Below Threshold Example */}
              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <p className="text-xs font-semibold text-green-600 mb-2">LOWER TIER EXAMPLE</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Booking Amount: <span className="font-semibold">₱{exampleBelow.toLocaleString()}</span></p>
                  <p>Service Fee ({settings.serviceFeeBelowThreshold}%): <span className="font-semibold text-red-600">-₱{serviceFeeBelow.toFixed(2)}</span></p>
                  <p className="border-t pt-1">Host Receives: <span className="font-bold text-green-600">₱{hostEarningsBelow.toFixed(2)}</span></p>
                  <p>Platform Earnings: <span className="font-bold text-blue-600">₱{serviceFeeBelow.toFixed(2)}</span></p>
                </div>
              </div>

              {/* Above Threshold Example */}
              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <p className="text-xs font-semibold text-blue-600 mb-2">HIGHER TIER EXAMPLE</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Booking Amount: <span className="font-semibold">₱{exampleAbove.toLocaleString()}</span></p>
                  <p>Service Fee ({settings.serviceFeeAboveThreshold}%): <span className="font-semibold text-red-600">-₱{serviceFeeAbove.toFixed(2)}</span></p>
                  <p className="border-t pt-1">Host Receives: <span className="font-bold text-green-600">₱{hostEarningsAbove.toFixed(2)}</span></p>
                  <p>Platform Earnings: <span className="font-bold text-blue-600">₱{serviceFeeAbove.toFixed(2)}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission & Pricing */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Additional Fees & Limits</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Commission Rate (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) => handleChange('commissionRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="text-gray-600">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Additional commission per booking</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Minimum Commission (₱)</label>
              <input
                type="number"
                value={settings.minCommissionAmount}
                onChange={(e) => handleChange('minCommissionAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum commission per booking</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Platform Fee (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.platformFee}
                  onChange={(e) => handleChange('platformFee', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="text-gray-600">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Additional platform processing fee</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Listing Price (₱)</label>
              <input
                type="number"
                value={settings.maxListingPrice}
                onChange={(e) => handleChange('maxListingPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum price per day for listings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Bank Account Information</h2>
        <p className="text-sm text-gray-600 mb-4">Used for receiving platform earnings (optional)</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              value={settings.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              placeholder="e.g., BDO, BPI, Metrobank"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={settings.bankAccountName}
                onChange={(e) => handleChange('bankAccountName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                value={settings.bankAccountNumber}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Save size={20} />
          Save Settings
        </button>
        <button
          onClick={fetchSettings}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
        >
          Cancel
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
        <p className="text-sm font-semibold mb-2">💡 Important:</p>
        <p className="text-sm">
          Changes to service fee rates will apply to new bookings only. Existing bookings will retain the service fee percentage that was active when they were created.
        </p>
      </div>
    </div>
  );
}