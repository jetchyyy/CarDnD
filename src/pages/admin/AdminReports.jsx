import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { AlertCircle, CheckCircle, XCircle, Clock, Filter, Search, Eye } from 'lucide-react';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateReportStatus = async (reportId, newStatus) => {
    setUpdating(true);
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      report.reportedUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      reviewed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Eye },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      dismissed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getReportStats = () => {
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      reviewed: reports.filter(r => r.status === 'reviewed').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      dismissed: reports.filter(r => r.status === 'dismissed').length
    };
  };

  const stats = getReportStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Reports</h1>
        <p className="text-gray-600 mt-1">Manage and review user reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Reports</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <p className="text-yellow-800 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <p className="text-blue-800 text-sm">Reviewed</p>
          <p className="text-2xl font-bold text-blue-900">{stats.reviewed}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-green-800 text-sm">Resolved</p>
          <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <p className="text-gray-800 text-sm">Dismissed</p>
          <p className="text-2xl font-bold text-gray-900">{stats.dismissed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <AlertCircle className="mx-auto mb-2" size={48} />
                    <p>No reports found</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {report.reportedUserName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{report.reportedByName}</div>
                      <div className="text-xs text-gray-500">{report.reportedByEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{report.reason}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {report.createdAt?.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">Report Details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Reported User</label>
                <p className="text-gray-900">{selectedReport.reportedUserName}</p>
                <p className="text-xs text-gray-500">ID: {selectedReport.reportedUserId}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Reported By</label>
                <p className="text-gray-900">{selectedReport.reportedByName}</p>
                <p className="text-xs text-gray-500">{selectedReport.reportedByEmail}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Reason</label>
                <p className="text-gray-900">{selectedReport.reason}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedReport.description || 'No description provided'}</p>
              </div>

              {selectedReport.chatId && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Chat ID</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedReport.chatId}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Date Reported</label>
                <p className="text-gray-900">
                  {selectedReport.createdAt?.toDate().toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Current Status</label>
                <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
              </div>

              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Update Status
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'reviewed')}
                    disabled={updating || selectedReport.status === 'reviewed'}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                    disabled={updating || selectedReport.status === 'resolved'}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Mark as Resolved
                  </button>
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'dismissed')}
                    disabled={updating || selectedReport.status === 'dismissed'}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Dismiss Report
                  </button>
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'pending')}
                    disabled={updating || selectedReport.status === 'pending'}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Mark as Pending
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}