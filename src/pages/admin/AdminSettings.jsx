import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Save, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platformName: 'VehicleHub',
    platformEmail: 'admin@vehiclehub.com',
    platformPhone: '+63 950 123 4567',
    commissionRate: 10,
    minCommissionAmount: 50,
    maxListingPrice: 10000,
    platformFee: 2.5,
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

  return (
    <div className="space-y-6">
      {/* Alert */}
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

      {/* Commission & Pricing */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Commission & Pricing</h2>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm">Commission is taken from each booking to cover platform costs and operations.</p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Commission Rate (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) => handleChange('commissionRate', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="text-gray-600">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Percentage taken from each booking total</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Minimum Commission (₱)</label>
              <input
                type="number"
                value={settings.minCommissionAmount}
                onChange={(e) => handleChange('minCommissionAmount', parseFloat(e.target.value))}
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
                  onChange={(e) => handleChange('platformFee', parseFloat(e.target.value))}
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
                onChange={(e) => handleChange('maxListingPrice', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum price per day for listings</p>
            </div>
          </div>

          {/* Commission Preview */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">Commission Calculation Example:</p>
            <p className="text-sm text-gray-600">
              For a ₱1,000 booking:
              <br />
              Commission (10%): ₱100
              <br />
              Platform Fee (2.5%): ₱25
              <br />
              <strong>Total Platform Earning: ₱125</strong>
            </p>
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
        <p className="text-sm font-semibold mb-2">💡 Tip:</p>
        <p className="text-sm">
          Changes to commission rates and fees will apply to new bookings. Existing bookings will use the rates that were active when they were created.
        </p>
      </div>
    </div>
  );
}