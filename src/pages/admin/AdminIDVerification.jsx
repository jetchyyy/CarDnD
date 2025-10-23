import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { CheckCircle, XCircle, Clock, Search, FileText, User, Eye } from 'lucide-react';

const AdminIDVerification = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    fetchVerifications();
  }, [filter]);

  // ✅ UPDATED: Fetch all data (no where filter)
  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const verificationsRef = collection(db, 'idVerifications');
      const q = query(verificationsRef, orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);

      // Fetch all documents
      const allData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
      }));

      // Apply client-side filter (UI buttons still work)
      const filteredData =
        filter === 'all' ? allData : allData.filter((v) => v.status === filter);

      setVerifications(filteredData);

      // Compute stats locally
      setStats({
        pending: allData.filter((v) => v.status === 'pending').length,
        approved: allData.filter((v) => v.status === 'approved').length,
        rejected: allData.filter((v) => v.status === 'rejected').length,
        total: allData.length,
      });
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId, userId) => {
    setActionLoading(true);
    try {
      const verificationRef = doc(db, 'idVerifications', verificationId);
      await updateDoc(verificationRef, {
        status: 'approved',
        reviewedAt: serverTimestamp(),
        reviewedBy: 'admin',
        rejectionReason: null,
      });

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        idVerificationStatus: 'approved',
        idVerifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setShowModal(false);
      setSelectedVerification(null);
      fetchVerifications();
    } catch (error) {
      console.error('Error approving verification:', error);
      alert('Failed to approve verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (verificationId, userId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const verificationRef = doc(db, 'idVerifications', verificationId);
      await updateDoc(verificationRef, {
        status: 'rejected',
        reviewedAt: serverTimestamp(),
        reviewedBy: 'admin',
        rejectionReason: rejectionReason.trim(),
      });

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        idVerificationStatus: 'rejected',
        idRejectionReason: rejectionReason.trim(),
        updatedAt: serverTimestamp(),
      });

      setShowModal(false);
      setSelectedVerification(null);
      setRejectionReason('');
      fetchVerifications();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      alert('Failed to reject verification');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (verification) => {
    setSelectedVerification(verification);
    setShowModal(true);
    setRejectionReason('');
  };

  const filteredVerifications = verifications.filter(
    (v) =>
      v.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.idType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span
        className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const idTypeLabels = {
    national_id: 'National ID (PhilSys)',
    drivers_license: "Driver's License",
    passport: 'Passport',
    umid: 'UMID',
    sss_id: 'SSS ID',
    postal_id: 'Postal ID',
    voters_id: "Voter's ID",
    prc_id: 'PRC ID',
    philhealth_id: 'PhilHealth ID',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ID Verification Management</h1>
        <p className="text-gray-600 mt-2">Review and approve user identity verifications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by User ID or ID Type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Verifications List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredVerifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Verifications Found</h3>
          <p className="text-gray-600">There are no ID verifications matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredVerifications.map((verification) => (
            <div key={verification.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold text-gray-900">User ID: {verification.userId}</span>
                      {getStatusBadge(verification.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">ID Type</p>
                        <p className="font-medium text-gray-900">
                          {idTypeLabels[verification.idType] || verification.idType}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Submitted</p>
                        <p className="font-medium text-gray-900">
                          {verification.submittedAt?.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Images</p>
                        <p className="font-medium text-gray-900">
                          {verification.backImageURL ? '2 (Front & Back)' : '1 (Front only)'}
                        </p>
                      </div>
                    </div>

                    {verification.status === 'rejected' && verification.rejectionReason && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {verification.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => openModal(verification)}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedVerification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review ID Verification</h2>

              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">User ID</p>
                      <p className="font-medium text-gray-900">{selectedVerification.userId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ID Type</p>
                      <p className="font-medium text-gray-900">
                        {idTypeLabels[selectedVerification.idType]}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Submission Date</p>
                      <p className="font-medium text-gray-900">
                        {selectedVerification.submittedAt?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">OCR Confidence</p>
                      <p className="font-medium text-gray-900">
                        {selectedVerification.ocrConfidence?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* OCR Text Preview */}
                {selectedVerification.ocrText && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">OCR Extracted Text</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {selectedVerification.ocrText}
                    </p>
                  </div>
                )}

                {/* ID Images */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">ID Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Front Side</p>
                      <img
                        src={selectedVerification.frontImageURL}
                        alt="Front ID"
                        className="w-full h-64 object-contain bg-gray-100 rounded-lg border border-gray-200"
                      />
                    </div>
                    {selectedVerification.backImageURL && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Back Side</p>
                        <img
                          src={selectedVerification.backImageURL}
                          alt="Back ID"
                          className="w-full h-64 object-contain bg-gray-100 rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {selectedVerification.status === 'pending' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason (if rejecting)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide a clear reason for rejection..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReject(selectedVerification.id, selectedVerification.userId)}
                        disabled={actionLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center"
                      >
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 mr-2" />
                            Reject
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleApprove(selectedVerification.id, selectedVerification.userId)}
                        disabled={actionLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center"
                      >
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Approve
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIDVerification;