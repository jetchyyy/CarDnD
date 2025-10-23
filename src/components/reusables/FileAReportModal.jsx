import { useState } from 'react';
import { X, AlertTriangle, Flag } from 'lucide-react';
import { auth, db } from '../../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const FileAReportModal = ({ isOpen, onClose, chatId, reportedUserId, reportedUserName }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const currentUser = auth.currentUser;

  const reportReasons = [
    'Attempting to book outside the app',
    'Requesting personal payment information',
    'Suspicious or fraudulent behavior',
    'Harassment or inappropriate messages',
    'Spam or advertising',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason || !description.trim()) {
      alert('Please select a reason and provide details');
      return;
    }

    if (!currentUser) {
      alert('You must be logged in to submit a report');
      return;
    }

    setSubmitting(true);

    try {
      // Store report in Firestore
      const reportData = {
        chatId,
        reportedUserId,
        reportedUserName: reportedUserName || 'User',
        reportedBy: currentUser.uid,
        reportedByName: currentUser.displayName || currentUser.email || 'User',
        reportedByEmail: currentUser.email || '',
        reason,
        description: description.trim(),
        status: 'pending', // pending, under_review, resolved, dismissed
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add report to 'reports' collection
      await addDoc(collection(db, 'reports'), reportData);

      setSubmitted(true);
      
      // Reset and close after showing success
      setTimeout(() => {
        setSubmitted(false);
        setReason('');
        setDescription('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Report User</h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Submitted</h3>
              <p className="text-gray-600">Thank you for helping keep our community safe. We'll review this report shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Warning Alert */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Report Responsibly</p>
                  <p>False reports may result in action against your account. Only submit reports for legitimate safety concerns.</p>
                </div>
              </div>

              {/* Reported User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Reporting user:</p>
                <p className="font-semibold text-gray-900">{reportedUserName || 'User'}</p>
              </div>

              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Reason for Report <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {reportReasons.map((reasonOption) => (
                    <label
                      key={reasonOption}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reasonOption}
                        checked={reason === reasonOption}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        disabled={submitting}
                      />
                      <span className="text-sm text-gray-900">{reasonOption}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                  Additional Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide specific details about the issue..."
                  rows={4}
                  disabled={submitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Include relevant details like specific messages, dates, or behavior patterns.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !reason || !description.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileAReportModal;