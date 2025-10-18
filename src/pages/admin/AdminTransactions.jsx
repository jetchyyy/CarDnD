import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Search, Download, TrendingUp, DollarSign, Users, Calendar, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalPaidOut: 0,
    serviceFeeProfit: 0,
    netBalance: 0,
    totalBookings: 0,
    unpaidBookings: 0
  });

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, search, typeFilter]);

  const fetchAllTransactions = async () => {
    try {
      const allTransactions = [];
      
      // 1. Fetch All Bookings (Money IN - received from renters)
      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      const bookingsData = [];
      
      bookingsSnap.docs.forEach(doc => {
        const data = doc.data();
        const serviceFee = data.totalPrice * 0.05; // 5% service fee
        const hostAmount = data.totalPrice - serviceFee; // Amount owed to host
        
        bookingsData.push({
          id: doc.id,
          type: 'payment_received',
          amount: data.totalPrice || 0,
          serviceFee: serviceFee,
          hostAmount: hostAmount,
          bookingId: doc.id,
          hostId: data.hostId || '',
          guestId: data.guestId || '',
          guestName: data.guestDetails?.name || 'Unknown Guest',
          vehicleTitle: data.vehicleDetails?.title || 'Unknown Vehicle',
          vehicleType: data.vehicleDetails?.type || '',
          status: data.status || 'confirmed',
          isPaidOut: data.paidOutAt ? true : false,
          paidOutAt: data.paidOutAt || null,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          paymentReceipt: data.paymentReceipt || '',
          description: `Payment from ${data.guestDetails?.name || 'guest'} for ${data.vehicleDetails?.title || 'vehicle'}`
        });
        
        allTransactions.push(bookingsData[bookingsData.length - 1]);
      });

      // 2. Fetch Payout Transactions (Money OUT - paid to hosts)
      const payoutsSnap = await getDocs(collection(db, 'payoutTransactions'));
      payoutsSnap.docs.forEach(doc => {
        const data = doc.data();
        allTransactions.push({
          id: doc.id,
          type: 'payout_sent',
          amount: data.amount || 0,
          hostId: data.hostId || '',
          accountName: data.accountName || 'Unknown',
          mobileNumber: data.mobileNumber || '',
          referenceNumber: data.referenceNumber || '',
          status: data.status || 'completed',
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          notes: data.notes || '',
          bookingIds: data.bookingIds || [],
          bookingCount: (data.bookingIds || []).length,
          description: `Payout to ${data.accountName || 'host'} via GCash`
        });
      });

      // Sort by date (newest first)
      allTransactions.sort((a, b) => b.createdAt - a.createdAt);

      setTransactions(allTransactions);
      calculateStats(allTransactions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const calculateStats = (txns) => {
    // Total money received from renters
    const totalReceived = txns
      .filter(t => t.type === 'payment_received' && t.status === 'confirmed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Total money paid out to hosts
    const totalPaidOut = txns
      .filter(t => t.type === 'payout_sent' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Service fee profit (5% from all confirmed bookings)
    const serviceFeeProfit = txns
      .filter(t => t.type === 'payment_received' && t.status === 'confirmed')
      .reduce((sum, t) => sum + t.serviceFee, 0);
    
    // Net balance (money in hand = received - paid out)
    const netBalance = totalReceived - totalPaidOut;
    
    // Unpaid bookings count
    const unpaidBookings = txns
      .filter(t => t.type === 'payment_received' && !t.isPaidOut && t.status === 'confirmed')
      .length;

    setStats({
      totalReceived: totalReceived,
      totalPaidOut: totalPaidOut,
      serviceFeeProfit: serviceFeeProfit,
      netBalance: netBalance,
      totalBookings: txns.filter(t => t.type === 'payment_received').length,
      unpaidBookings: unpaidBookings
    });
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.id?.toLowerCase().includes(searchLower) ||
        t.bookingId?.toLowerCase().includes(searchLower) ||
        t.guestName?.toLowerCase().includes(searchLower) ||
        t.accountName?.toLowerCase().includes(searchLower) ||
        t.vehicleTitle?.toLowerCase().includes(searchLower) ||
        t.referenceNumber?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleExportTransactions = () => {
    const csv = [
      ['Date', 'Type', 'Description', 'Amount Received', 'Amount Paid Out', 'Service Fee', 'Status', 'Reference'],
      ...filteredTransactions.map(t => [
        t.createdAt?.toLocaleDateString() || 'N/A',
        t.type === 'payment_received' ? 'Payment Received' : 'Payout Sent',
        t.description || '',
        t.type === 'payment_received' ? t.amount : '',
        t.type === 'payout_sent' ? t.amount : '',
        t.serviceFee || '',
        t.status || 'N/A',
        t.referenceNumber || t.bookingId || t.id.slice(0, 8)
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().getTime()}.csv`;
    a.click();
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'payment_received':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'payout_sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'payment_received':
        return <ArrowDownCircle className="w-4 h-4" />;
      case 'payout_sent':
        return <ArrowUpCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100 text-sm font-medium">Total Received</p>
            <ArrowDownCircle className="w-6 h-6 text-green-100" />
          </div>
          <p className="text-3xl font-bold">₱{stats.totalReceived.toFixed(2)}</p>
          <p className="text-green-100 text-xs mt-2">From {stats.totalBookings} bookings</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100 text-sm font-medium">Total Paid Out</p>
            <ArrowUpCircle className="w-6 h-6 text-blue-100" />
          </div>
          <p className="text-3xl font-bold">₱{stats.totalPaidOut.toFixed(2)}</p>
          <p className="text-blue-100 text-xs mt-2">To hosts via GCash</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100 text-sm font-medium">Service Fee Profit</p>
            <TrendingUp className="w-6 h-6 text-purple-100" />
          </div>
          <p className="text-3xl font-bold">₱{stats.serviceFeeProfit.toFixed(2)}</p>
          <p className="text-purple-100 text-xs mt-2">5% commission earned</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-100 text-sm font-medium">Balance on Hand</p>
            <DollarSign className="w-6 h-6 text-orange-100" />
          </div>
          <p className="text-3xl font-bold">₱{stats.netBalance.toFixed(2)}</p>
          <p className="text-orange-100 text-xs mt-2">{stats.unpaidBookings} unpaid bookings</p>
        </div>
      </div>

      {/* Filters & Export */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Transactions</option>
            <option value="payment_received">Payments Received</option>
            <option value="payout_sent">Payouts Sent</option>
          </select>

          <button
            onClick={handleExportTransactions}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium"
          >
            <Download size={18} />
            Export CSV
          </button>

          <button
            onClick={fetchAllTransactions}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Refresh
          </button>
        </div>
        <p className="text-gray-600 text-sm mt-3">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </p>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Reference</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase">Service Fee</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Calendar className="w-12 h-12 mb-3 text-gray-400" />
                      <p className="font-medium">No transactions found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.createdAt?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                        {transaction.type === 'payment_received' ? 'Money IN' : 'Money OUT'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      {transaction.vehicleTitle && (
                        <p className="text-xs text-gray-600">{transaction.vehicleTitle}</p>
                      )}
                      {transaction.bookingCount > 0 && (
                        <p className="text-xs text-gray-600">{transaction.bookingCount} bookings paid</p>
                      )}
                      {transaction.type === 'payment_received' && (
                        <p className="text-xs text-gray-500">
                          {transaction.isPaidOut ? (
                            <span className="text-blue-600">✓ Paid out to host</span>
                          ) : (
                            <span className="text-orange-600">⏳ Awaiting payout</span>
                          )}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-gray-700">
                        {transaction.referenceNumber || transaction.bookingId?.slice(0, 8) || transaction.id.slice(0, 8)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`text-sm font-bold ${transaction.type === 'payment_received' ? 'text-green-600' : 'text-blue-600'}`}>
                        ₱{transaction.amount.toFixed(2)}
                      </p>
                      {transaction.type === 'payment_received' && (
                        <p className="text-xs text-gray-500">Host: ₱{transaction.hostAmount.toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {transaction.type === 'payment_received' ? (
                        <p className="text-sm font-bold text-purple-600">
                          ₱{transaction.serviceFee.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">-</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        transaction.status === 'completed' || transaction.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
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
        <h3 className="text-lg font-bold text-gray-800 mb-6">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-gray-600 text-sm font-medium">Total Money Received</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">₱{stats.totalReceived.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">From renters</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-600 text-sm font-medium">Total Money Paid Out</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">₱{stats.totalPaidOut.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">To hosts</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="text-gray-600 text-sm font-medium">Service Fee Profit</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">₱{stats.serviceFeeProfit.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">5% commission</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4 py-2">
            <p className="text-gray-600 text-sm font-medium">Current Balance</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">₱{stats.netBalance.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Money in hand</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">💡 How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Renters pay the full booking amount to your account</li>
            <li>• You keep 5% as service fee (your profit)</li>
            <li>• You pay out 95% to the host after the booking</li>
            <li>• Balance on hand = Money received - Money paid out</li>
          </ul>
        </div>
      </div>
    </div>
  );
}