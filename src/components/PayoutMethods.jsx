import { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, Check, AlertCircle, Loader } from 'lucide-react';
import { auth } from '../firebase/firebase';
import {
  addPayoutMethod,
  getUserPayoutMethods,
  updatePayoutMethod,
  setPrimaryPayoutMethod,
  deletePayoutMethod
} from '../utils/payoutService';

const PayoutMethods = () => {
  const currentUser = auth.currentUser;
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    mobileNumber: '',
    isPrimary: false
  });

  // Fetch payout methods on mount
  useEffect(() => {
    if (!currentUser) return;

    const fetchPayoutMethods = async () => {
      try {
        const methods = await getUserPayoutMethods(currentUser.uid);
        setPayoutMethods(methods);
      } catch (error) {
        console.error('Error fetching payout methods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayoutMethods();
  }, [currentUser]);

  const resetForm = () => {
    setFormData({
      accountName: '',
      mobileNumber: '',
      isPrimary: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (method) => {
    setFormData({
      accountName: method.accountName,
      mobileNumber: method.mobileNumber,
      isPrimary: method.isPrimary
    });
    setEditingId(method.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.accountName.trim()) {
      alert('Please enter account name');
      return;
    }
    if (!formData.mobileNumber.trim()) {
      alert('Please enter mobile number');
      return;
    }

    // Validate mobile number format (basic)
    const mobileRegex = /^09\d{9}$/;
    if (!mobileRegex.test(formData.mobileNumber.replace(/\D/g, ''))) {
      alert('Please enter a valid Philippine mobile number (09XXXXXXXXX)');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update existing method
        const updates = {
          accountName: formData.accountName,
          mobileNumber: formData.mobileNumber
        };

        if (formData.isPrimary && !payoutMethods.find(m => m.id === editingId)?.isPrimary) {
          await setPrimaryPayoutMethod(currentUser.uid, editingId);
        }

        await updatePayoutMethod(editingId, updates);

        setPayoutMethods(prev =>
          prev.map(m =>
            m.id === editingId
              ? { ...m, ...updates, isPrimary: formData.isPrimary }
              : { ...m, isPrimary: formData.isPrimary ? false : m.isPrimary }
          )
        );
      } else {
        // Add new method
        const newMethodId = await addPayoutMethod(currentUser.uid, formData);
        const newMethods = await getUserPayoutMethods(currentUser.uid);
        setPayoutMethods(newMethods);
      }

      alert(`Payout method ${editingId ? 'updated' : 'added'} successfully!`);
      resetForm();
    } catch (error) {
      console.error('Error saving payout method:', error);
      alert('Failed to save payout method. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (methodId) => {
    if (!window.confirm('Are you sure you want to delete this payout method?')) {
      return;
    }

    try {
      await deletePayoutMethod(methodId);
      setPayoutMethods(prev => prev.filter(m => m.id !== methodId));
      alert('Payout method deleted successfully!');
    } catch (error) {
      console.error('Error deleting payout method:', error);
      alert('Failed to delete payout method. Please try again.');
    }
  };

  const handleSetPrimary = async (methodId) => {
    try {
      await setPrimaryPayoutMethod(currentUser.uid, methodId);
      setPayoutMethods(prev =>
        prev.map(m => ({
          ...m,
          isPrimary: m.id === methodId
        }))
      );
    } catch (error) {
      console.error('Error setting primary payout method:', error);
      alert('Failed to set as primary. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Payout Methods</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add GCash Account</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, accountName: e.target.value }))
                }
                placeholder="Full name on GCash account"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">Must match your GCash account name</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 11) {
                    setFormData(prev => ({ ...prev, mobileNumber: value }));
                  }
                }}
                placeholder="09XXXXXXXXX"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-1">Philippine mobile number linked to GCash</p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPrimary"
                checked={formData.isPrimary}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPrimary" className="text-sm text-gray-700">
                Set as primary payout method
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payout Methods List */}
      {payoutMethods.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No payout methods added yet</p>
          <p className="text-gray-500 text-sm mb-6">
            Add a GCash account to receive your earnings
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First GCash Account</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {payoutMethods.map(method => (
            <div
              key={method.id}
              className={`p-4 border-2 rounded-lg transition-colors ${
                method.isPrimary
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{method.accountName}</h4>
                        {method.isPrimary && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                            <Check className="w-3 h-3" />
                            Primary
                          </span>
                        )}
                        {!method.verified && (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                        {method.verified && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                            <Check className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{method.mobileNumber}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Added {new Date(method.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!method.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(method.id)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                      title="Set as primary"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(method)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Before you can receive payouts:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Add a valid GCash account linked to your mobile number</li>
              <li>Account name must match your GCash account name</li>
              <li>Admin will verify your account within 24-48 hours</li>
              <li>Only verified accounts can receive earnings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutMethods;