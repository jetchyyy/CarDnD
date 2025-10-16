import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Search, CheckCircle, Clock, Download } from 'lucide-react';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, search, typeFilter]);

  const fetchData = async () => {
    try {
      // Fetch transactions
      const transactionsSnap = await getDocs(collection(db, 'transactions'));
      const transactionsData = transactionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(transactionsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      }));

      // Fetch payouts
      const payoutsSnap = await getDocs(collection(db, 'payouts'));
      const payoutsData = payoutsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPayouts(payoutsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => (t.type || 'payment') === typeFilter);
    }

    if (search) {
      filtered = filtered.filter(t =>
        t.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
        t.hostName?.toLowerCase().includes(search.toLowerCase()) ||
        t.renterName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleMarkPayoutSent = async (payoutId) => {
    try {
      await updateDoc(doc(db, 'payouts', payoutId), {
        status: 'sent',
        sentAt: new Date(),
      });
      fetchData();
      alert('Payout marked as sent');
    } catch (error) {
      console.error('Error marking payout:', error);
      alert('Failed to mark payout');
    }
  };

  const calculateTotalEarnings = () => {
    return transactions.reduce((sum, t) => sum + (t.commission || 0), 0).toFixed(2);
  };

  const calculateTotalPayouts = () => {
    return payouts.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2);
  };

  const handleExportTransactions = () => {
    const csv = [
      ['Transaction ID', 'Booking ID', 'Host', 'Renter', 'Amount', 'Commission', 'Date'],
      ...filteredTransactions.map(t => [
        t.id,
        t.bookingId || 'N/A',
        t.hostName || 'N/A',
        t.renterName || 'N/A',
        t.amount || 0,
        t.commission || 0,
        t.createdAt?.toDate?.().toLocaleDateString() || 'N/A',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().getTime()}.csv`;
    a.click();
  };

  if (loading) return <div className="text-center py-12">Loading transactions...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white p-6">
          <p className="text-green-100 text-sm">Total Platform Earnings</p>
          <p className="text-4xl font-bold mt-2">₱{calculateTotalEarnings()}</p>
          <p className="text-green-100 text-xs mt-2">{transactions.length} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white p-6">
          <p className="text-blue-100 text-sm">Pending Payouts</p>
          <p className="text-4xl font-bold mt-2">₱{
            payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)
          }</p>
          <p className="text-blue-100 text-xs mt-2">{payouts.filter(p => p.status === 'pending').length} payouts</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white p-6">
          <p className="text-purple-100 text-sm">Total Paid Out</p>
          <p className="text-4xl font-bold mt-2">₱{
            payouts.filter(p => p.status === 'sent').reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)
          }</p>
          <p className="text-purple-100 text-xs mt-2">{payouts.filter(p => p.status === 'sent').length} sent</p>
        </div>
      </div>

      {/* Filters & Export */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search transaction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="payment">Payments</option>
            <option value="commission">Commissions</option>
            <option value="refund">Refunds</option>
          </select>
          <button
            onClick={handleExportTransactions}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
        <p className="text-gray-600 text-sm mt-3">Total: {filteredTransactions.length} transactions</p>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Transaction ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Booking ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Host</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Renter</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Commission (₱)</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-600">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">{transaction.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm">{transaction.bookingId?.slice(0, 8) || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">{transaction.hostName || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm">{transaction.renterName || 'Unknown'}</td>
                  <td className="px-6 py-4 font-semibold">₱{transaction.amount || 0}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">₱{transaction.commission || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      transaction.type === 'payment' ? 'bg-blue-100 text-blue-800' :
                      transaction.type === 'commission' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type || 'payment'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {transaction.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payouts Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Host Payouts</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Payout ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Host</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Request Date</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-600">
                    No payouts
                  </td>
                </tr>
              ) : (
                payouts.map(payout => (
                  <tr key={payout.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{payout.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm">{payout.hostName || 'Unknown'}</td>
                    <td className="px-6 py-4 font-semibold">₱{payout.amount || 0}</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                        payout.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payout.status === 'sent' ? <CheckCircle size={16} /> : <Clock size={16} />}
                        {payout.status?.charAt(0).toUpperCase() + payout.status?.slice(1) || 'pending'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {payout.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {payout.status === 'pending' && (
                        <button
                          onClick={() => handleMarkPayoutSent(payout.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition"
                        >
                          Mark Sent
                        </button>
                      )}
                      {payout.status === 'sent' && (
                        <span className="text-gray-600 text-xs">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Total Revenue (Commissions)</p>
            <p className="text-3xl font-bold">₱{calculateTotalEarnings()}</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Total Paid to Hosts</p>
            <p className="text-3xl font-bold">₱{calculateTotalPayouts()}</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Net Profit</p>
            <p className="text-3xl font-bold">
              ₱{(parseFloat(calculateTotalEarnings()) - parseFloat(calculateTotalPayouts())).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}