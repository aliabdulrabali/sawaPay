// AdminComponents.js
// React components for admin dashboard in SawaPay

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthComponents';
import AdminService from './AdminService';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Admin Login Component
export const AdminLogin = ({ onSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await AdminService.signIn(email, password);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">SawaPay Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Admin Dashboard Component
export const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [transactionStats, setTransactionStats] = useState(null);
  const [kycStats, setKycStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch admin data
        const admin = await AdminService.getAdminData(currentUser.uid);
        setAdminData(admin);
        
        // Fetch user statistics
        // This would be a real API call in production
        setUserStats({
          total: 1250,
          active: 1100,
          pending: 75,
          suspended: 75,
          kycVerified: 950,
          kycPending: 200,
          kycRejected: 100
        });
        
        // Fetch transaction statistics
        // This would be a real API call in production
        setTransactionStats({
          total: 5678,
          volume: 345678.90,
          completed: 5500,
          pending: 150,
          failed: 28,
          revenue: 4567.89
        });
        
        // Fetch KYC statistics
        // This would be a real API call in production
        setKycStats({
          pending: 45,
          approved: 950,
          rejected: 100
        });
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return <div className="p-4">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome, {adminData?.displayName || currentUser.email} | Role: {adminData?.role || 'Admin'}
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">User Statistics</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="text-xl font-bold">{userStats.total}</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="text-sm text-gray-600">Active Users</div>
              <div className="text-xl font-bold">{userStats.active}</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="text-sm text-gray-600">Pending KYC</div>
              <div className="text-xl font-bold">{userStats.kycPending}</div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="text-sm text-gray-600">Suspended</div>
              <div className="text-xl font-bold">{userStats.suspended}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Transaction Statistics</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-sm text-gray-600">Total Transactions</div>
              <div className="text-xl font-bold">{transactionStats.total}</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="text-sm text-gray-600">Volume</div>
              <div className="text-xl font-bold">${transactionStats.volume.toLocaleString()}</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-xl font-bold">{transactionStats.pending}</div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="text-sm text-gray-600">Revenue</div>
              <div className="text-xl font-bold">${transactionStats.revenue.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">KYC Statistics</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-yellow-50 p-2 rounded">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-xl font-bold">{kycStats.pending}</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="text-sm text-gray-600">Approved</div>
              <div className="text-xl font-bold">{kycStats.approved}</div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="text-sm text-gray-600">Rejected</div>
              <div className="text-xl font-bold">{kycStats.rejected}</div>
            </div>
          </div>
          
          <div className="mt-4 h-40">
            <Pie
              data={{
                labels: ['Pending', 'Approved', 'Rejected'],
                datasets: [
                  {
                    data: [kycStats.pending, kycStats.approved, kycStats.rejected],
                    backgroundColor: ['#FBBF24', '#10B981', '#EF4444'],
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/admin/users" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded flex flex-col items-center">
            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Manage Users
          </a>
          <a href="/admin/kyc" className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-4 px-4 rounded flex flex-col items-center">
            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            KYC Approval
          </a>
          <a href="/admin/transactions" className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-4 rounded flex flex-col items-center">
            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transactions
          </a>
          <a href="/admin/support" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded flex flex-col items-center">
            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Support
          </a>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <div className="h-64">
            <Line
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                  {
                    label: 'New Users',
                    data: [65, 78, 90, 115, 135, 157, 180, 205, 230, 260, 290, 320],
                    fill: false,
                    borderColor: '#3B82F6',
                    tension: 0.1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Transaction Volume</h2>
          <div className="h-64">
            <Bar
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                  {
                    label: 'Transaction Volume ($)',
                    data: [12500, 15000, 18000, 22000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000],
                    backgroundColor: '#10B981'
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  KYC Document Submitted
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  john.doe@example.com
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Large Transaction
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  jane.smith@example.com
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Support Ticket Created
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  robert.johnson@example.com
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Open
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// User Management Component
export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, kycFilter]);

  const fetchUsers = async (reset = true) => {
    try {
      setLoading(true);
      
      const filters = {};
      
      if (statusFilter !== 'all') {
        filters.accountStatus = statusFilter;
      }
      
      if (kycFilter !== 'all') {
        filters.kycStatus = kycFilter;
      }
      
      const result = await AdminService.getUsers(
        10,
        reset ? null : lastVisible,
        filters
      );
      
      setUsers(reset ? result.users : [...users, ...result.users]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }
    
    try {
      setLoading(true);
      const result = await AdminService.searchUsers(searchTerm);
      setUsers(result);
      setHasMore(false);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchUsers(false);
  };

  const handleUpdateStatus = async (userId, status) => {
    try {
      await AdminService.updateUserStatus(userId, status);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, accountStatus: status } 
          : user
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="user-management-container p-4">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="searchTerm">
              Search
            </label>
            <div className="flex">
              <input
                id="searchTerm"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Search by email or name"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
              >
                Search
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="statusFilter">
              Account Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="kycFilter">
              KYC Status
            </label>
            <select
              id="kycFilter"
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="all">All KYC Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading && users.length === 0 ? (
        <div className="text-center py-4">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No users found matching your criteria.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.profileImageUrl || 'https://via.placeholder.com/40'}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.kycStatus === 'verified' ? 'bg-green-100 text-green-800' : 
                          user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.accountStatus === 'active' ? 'bg-green-100 text-green-800' : 
                          user.accountStatus === 'suspended' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {user.accountStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a href={`/admin/users/${user.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                        View
                      </a>
                      {user.accountStatus === 'active' ? (
                        <button
                          onClick={() => handleUpdateStatus(user.id, 'suspended')}
                          className="text-red-600 hover:text-red-900 mr-3"
                        >
                          Suspend
                        </button>
                      ) : user.accountStatus === 'suspended' ? (
                        <button
                          onClick={() => handleUpdateStatus(user.id, 'active')}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Activate
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {hasMore && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={handleLoadMore}
                className="text-blue-500 hover:text-blue-700"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// KYC Approval Component
export const KycApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchKycRequests();
  }, [statusFilter]);

  const fetchKycRequests = async (reset = true) => {
    try {
      setLoading(true);
      
      const result = await AdminService.getKycRequests(
        statusFilter,
        10,
        reset ? null : lastVisible
      );
      
      setRequests(reset ? result.requests : [...requests, ...result.requests]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchKycRequests(false);
  };

  const handleApprove = async (documentId) => {
    try {
      await AdminService.approveKycDocument(documentId, 'admin-id', 'Approved by admin');
      
      // Update local state
      setRequests(requests.filter(req => req.id !== documentId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (documentId, reason) => {
    try {
      await AdminService.rejectKycDocument(documentId, 'admin-id', reason);
      
      // Update local state
      setRequests(requests.filter(req => req.id !== documentId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="kyc-approval-container p-4">
      <h1 className="text-2xl font-bold mb-6">KYC Approval</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex">
          <div className="w-64">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="statusFilter">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading && requests.length === 0 ? (
        <div className="text-center py-4">Loading KYC requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No KYC requests found with {statusFilter} status.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map(request => (
            <div key={request.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">{request.user.displayName || request.user.email}</h3>
                  <p className="text-sm text-gray-500">
                    Submitted on {new Date(request.submittedAt.seconds * 1000).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Document Type: {request.type === 'selfie' ? 'Selfie Photo' : request.type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {request.status}
                </span>
              </div>
              
              <div className="mb-4">
                <img
                  src={request.documentUrl || 'https://via.placeholder.com/300x200?text=Document+Image'}
                  alt="KYC Document"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
              
              {request.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) {
                        handleReject(request.id, reason);
                      }
                    }}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1"
                  >
                    Reject
                  </button>
                </div>
              )}
              
              {request.status === 'rejected' && request.rejectionReason && (
                <div className="mt-2 text-sm text-red-600">
                  <span className="font-medium">Rejection reason:</span> {request.rejectionReason}
                </div>
              )}
              
              <div className="mt-2">
                <a
                  href={`/admin/users/${request.user.id}`}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  View User Profile
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={handleLoadMore}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

// Transaction Management Component
export const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, typeFilter]);

  const fetchTransactions = async (reset = true) => {
    try {
      setLoading(true);
      
      const filters = {};
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      if (typeFilter !== 'all') {
        filters.type = typeFilter;
      }
      
      const result = await AdminService.getAllTransactions(
        10,
        reset ? null : lastVisible,
        filters
      );
      
      setTransactions(reset ? result.transactions : [...transactions, ...result.transactions]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchTransactions();
      return;
    }
    
    try {
      setLoading(true);
      // This would be a real search API call in production
      // For now, we'll just filter the existing transactions
      const filtered = transactions.filter(transaction => 
        transaction.id.includes(searchTerm) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setTransactions(filtered);
      setHasMore(false);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchTransactions(false);
  };

  const handleExport = () => {
    // This would be a real export function in production
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="transaction-management-container p-4">
      <h1 className="text-2xl font-bold mb-6">Transaction Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="searchTerm">
              Search
            </label>
            <div className="flex">
              <input
                id="searchTerm"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Search by ID or description"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
              >
                Search
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="statusFilter">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="typeFilter">
              Type
            </label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="all">All Types</option>
              <option value="transfer">Transfer</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateFilter">
              Date
            </label>
            <select
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleExport}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Export CSV
          </button>
        </div>
      </div>
      
      {loading && transactions.length === 0 ? (
        <div className="text-center py-4">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No transactions found matching your criteria.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt.seconds * 1000).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.senderUserId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.recipientUserId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a href={`/admin/transactions/${transaction.id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {hasMore && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={handleLoadMore}
                className="text-blue-500 hover:text-blue-700"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Analytics Dashboard Component
export const AnalyticsDashboard = () => {
  const [userGrowth, setUserGrowth] = useState([]);
  const [transactionVolume, setTransactionVolume] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [timeframe, setTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch user growth analytics
      const growthData = await AdminService.getUserGrowthAnalytics(timeframe);
      setUserGrowth(growthData);
      
      // Fetch transaction volume analytics
      const volumeData = await AdminService.getTransactionVolumeAnalytics(timeframe);
      setTransactionVolume(volumeData);
      
      // Fetch revenue analytics
      const revenueData = await AdminService.getRevenueAnalytics(timeframe);
      setRevenue(revenueData);
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="analytics-dashboard-container p-4">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-end">
          <div className="w-64">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="timeframe">
              Timeframe
            </label>
            <select
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading analytics data...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">User Growth</h2>
            <div className="h-80">
              <Line
                data={{
                  labels: userGrowth.map(item => item.period),
                  datasets: [
                    {
                      label: 'New Users',
                      data: userGrowth.map(item => item.count),
                      fill: false,
                      borderColor: '#3B82F6',
                      tension: 0.1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Transaction Volume</h2>
            <div className="h-80">
              <Bar
                data={{
                  labels: transactionVolume.map(item => item.period),
                  datasets: [
                    {
                      label: 'Transaction Count',
                      data: transactionVolume.map(item => item.count),
                      backgroundColor: '#3B82F6',
                      order: 2
                    },
                    {
                      label: 'Transaction Volume ($)',
                      data: transactionVolume.map(item => item.volume),
                      borderColor: '#10B981',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      type: 'line',
                      order: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Revenue</h2>
            <div className="h-80">
              <Line
                data={{
                  labels: revenue.map(item => item.period),
                  datasets: [
                    {
                      label: 'Revenue ($)',
                      data: revenue.map(item => item.revenue),
                      fill: true,
                      borderColor: '#8B5CF6',
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      tension: 0.1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CMS Management Component
export const CmsManagement = () => {
  const [contentType, setContentType] = useState('terms');
  const [content, setContent] = useState(null);
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchContent();
  }, [contentType]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      if (contentType === 'faq') {
        // Fetch FAQ items
        const items = await AdminService.getFaqItems();
        setFaqItems(items);
      } else {
        // Fetch content
        const contentData = await AdminService.getContent(contentType);
        setContent(contentData);
        setEditContent(contentData.body);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleUpdateContent = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await AdminService.updateContent(contentType, {
        ...content,
        body: editContent
      }, 'admin-id');
      
      setContent({
        ...content,
        body: editContent
      });
      
      setEditMode(false);
      setSuccess('Content updated successfully');
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleUpdateFaqItem = async (faqId, faqData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await AdminService.updateFaqItem(faqId, faqData, 'admin-id');
      
      // Update local state
      setFaqItems(faqItems.map(item => 
        item.id === faqId 
          ? { ...item, ...faqData } 
          : item
      ));
      
      setSuccess('FAQ item updated successfully');
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCreateFaqItem = async (faqData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await AdminService.createFaqItem({
        ...faqData,
        order: faqItems.length + 1
      }, 'admin-id');
      
      // Update local state
      setFaqItems([...faqItems, {
        id: result.id,
        ...faqData,
        order: faqItems.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: 'admin-id'
      }]);
      
      setSuccess('FAQ item created successfully');
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteFaqItem = async (faqId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await AdminService.deleteFaqItem(faqId);
      
      // Update local state
      setFaqItems(faqItems.filter(item => item.id !== faqId));
      
      setSuccess('FAQ item deleted successfully');
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="cms-management-container p-4">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex">
          <div className="w-64">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contentType">
              Content Type
            </label>
            <select
              id="contentType"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="terms">Terms of Service</option>
              <option value="privacy">Privacy Policy</option>
              <option value="about">About Us</option>
              <option value="faq">FAQ</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading content...</div>
      ) : contentType === 'faq' ? (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">FAQ Items</h2>
            <button
              onClick={() => {
                const question = prompt('Enter question:');
                const answer = prompt('Enter answer:');
                const category = prompt('Enter category:');
                
                if (question && answer) {
                  handleCreateFaqItem({
                    question,
                    answer,
                    category: category || 'General',
                    isPublished: true
                  });
                }
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add FAQ Item
            </button>
          </div>
          
          {faqItems.length === 0 ? (
            <div className="bg-gray-100 p-4 rounded text-center">
              No FAQ items found.
            </div>
          ) : (
            <div className="space-y-4">
              {faqItems.map(item => (
                <div key={item.id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{item.question}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const question = prompt('Enter question:', item.question);
                          const answer = prompt('Enter answer:', item.answer);
                          const category = prompt('Enter category:', item.category);
                          
                          if (question && answer) {
                            handleUpdateFaqItem(item.id, {
                              question,
                              answer,
                              category: category || item.category,
                              isPublished: item.isPublished
                            });
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this FAQ item?')) {
                            handleDeleteFaqItem(item.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Category: {item.category}
                  </div>
                  <div className="mt-2">
                    {item.answer}
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <div>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </div>
                    <div>
                      Last updated: {new Date(item.updatedAt.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{content.title}</h2>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Edit
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateContent}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditContent(content.body);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            Version: {content.version} | Last updated: {new Date(content.updatedAt.seconds * 1000).toLocaleDateString()}
          </div>
          
          {editMode ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="20"
            ></textarea>
          ) : (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.body }}></div>
          )}
        </div>
      )}
    </div>
  );
};

// Support Management Component
export const SupportManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async (reset = true) => {
    try {
      setLoading(true);
      
      const result = await AdminService.getSupportTickets(
        statusFilter,
        10,
        reset ? null : lastVisible
      );
      
      setTickets(reset ? result.tickets : [...tickets, ...result.tickets]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchTickets(false);
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      await AdminService.updateTicketStatus(ticketId, status, 'admin-id');
      
      // Update local state
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status } 
          : ticket
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssignTicket = async (ticketId) => {
    try {
      await AdminService.assignTicket(ticketId, 'admin-id');
      
      // Update local state
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, assignedTo: 'admin-id' } 
          : ticket
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="support-management-container p-4">
      <h1 className="text-2xl font-bold mb-6">Support Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex">
          <div className="w-64">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="statusFilter">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading && tickets.length === 0 ? (
        <div className="text-center py-4">Loading support tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No support tickets found with {statusFilter === 'all' ? 'any' : statusFilter} status.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.user.displayName || ticket.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${ticket.status === 'open' ? 'bg-red-100 text-red-800' : 
                          ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt.seconds * 1000).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.assignedTo ? 'Admin' : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a href={`/admin/support/${ticket.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                        View
                      </a>
                      {!ticket.assignedTo && (
                        <button
                          onClick={() => handleAssignTicket(ticket.id)}
                          className="text-purple-600 hover:text-purple-900 mr-3"
                        >
                          Assign
                        </button>
                      )}
                      {ticket.status === 'open' && (
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          Start
                        </button>
                      )}
                      {ticket.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Resolve
                        </button>
                      )}
                      {ticket.status === 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, 'closed')}
                          className="text-gray-600 hover:text-gray-900 mr-3"
                        >
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {hasMore && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={handleLoadMore}
                className="text-blue-500 hover:text-blue-700"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Support Ticket Detail Component
export const SupportTicketDetail = ({ ticketId }) => {
  const [ticket, setTicket] = useState(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      
      const result = await AdminService.getSupportTicketDetails(ticketId);
      
      setTicket(result.ticket);
      setUser(result.user);
      setMessages(result.messages);
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await AdminService.updateTicketStatus(ticketId, status, 'admin-id');
      
      // Update local state
      setTicket({
        ...ticket,
        status
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) {
      return;
    }
    
    try {
      setSendingReply(true);
      
      const result = await AdminService.addTicketMessage(
        ticketId,
        'admin-id',
        replyMessage
      );
      
      // Add message to local state
      setMessages([...messages, {
        id: result.messageId,
        senderId: 'admin-id',
        isAdmin: true,
        content: replyMessage,
        attachments: [],
        createdAt: new Date(),
        isRead: false
      }]);
      
      setReplyMessage('');
      setSendingReply(false);
    } catch (err) {
      setError(err.message);
      setSendingReply(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading ticket details...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        Error loading ticket details: {error}
      </div>
    );
  }

  return (
    <div className="support-ticket-detail-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Support Ticket</h1>
        <div className="flex space-x-2">
          <a
            href="/admin/support"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Back to Tickets
          </a>
          {ticket.status === 'open' && (
            <button
              onClick={() => handleUpdateStatus('in_progress')}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Start Working
            </button>
          )}
          {ticket.status === 'in_progress' && (
            <button
              onClick={() => handleUpdateStatus('resolved')}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Mark Resolved
            </button>
          )}
          {ticket.status === 'resolved' && (
            <button
              onClick={() => handleUpdateStatus('closed')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Close Ticket
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{ticket.subject}</h2>
                <div className="text-sm text-gray-500">
                  Created on {new Date(ticket.createdAt.seconds * 1000).toLocaleDateString()}
                </div>
              </div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${ticket.status === 'open' ? 'bg-red-100 text-red-800' : 
                  ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                  ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                  'bg-gray-100 text-gray-800'}`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-3/4 rounded-lg p-3 ${message.isAdmin ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <div className="text-sm text-gray-500 mb-1">
                        {message.isAdmin ? 'Admin' : user?.displayName || user?.email || 'User'} • {new Date(message.createdAt.seconds * 1000).toLocaleTimeString()}
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2">
                          {message.attachments.map((attachment, index) => (
                            <a 
                              key={index}
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 block"
                            >
                              Attachment {index + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {ticket.status !== 'closed' && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2">Reply</h3>
              <form onSubmit={handleSendReply}>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="4"
                  placeholder="Type your reply here..."
                  required
                ></textarea>
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={sendingReply}
                  >
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        <div>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-medium mb-4">Ticket Information</h3>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-500">Ticket ID</div>
                <div>{ticket.id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Category</div>
                <div>{ticket.category}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Priority</div>
                <div className="capitalize">{ticket.priority}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Assigned To</div>
                <div>{ticket.assignedTo ? 'Admin' : 'Unassigned'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Last Updated</div>
                <div>{new Date(ticket.updatedAt.seconds * 1000).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-4">User Information</h3>
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <img
                    src={user.profileImageUrl || 'https://via.placeholder.com/40'}
                    alt=""
                    className="h-10 w-10 rounded-full mr-2"
                  />
                  <div>
                    <div>{user.displayName || 'No Name'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div>{user.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Account Status</div>
                  <div className="capitalize">{user.accountStatus}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">KYC Status</div>
                  <div className="capitalize">{user.kycStatus}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Joined</div>
                  <div>{new Date(user.createdAt.seconds * 1000).toLocaleDateString()}</div>
                </div>
                <div className="pt-2">
                  <a
                    href={`/admin/users/${user.id}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View User Profile
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">User information not available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Layout Component
export const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 transition duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0`}>
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <span className="text-white font-bold text-xl">SawaPay Admin</span>
        </div>
        <nav className="mt-5">
          <a href="/admin" className="flex items-center px-6 py-2 mt-4 text-gray-100 hover:bg-gray-700">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </a>
          <a href="/admin/users" className="flex items-center px-6 py-2 mt-4 text-gray-100 hover:bg-gray-700">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </a>
          <a href="/admin/kyc" className="flex items-center px-6 py-2 mt-4 text-gray-100 hover:bg-gray-700">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            KYC Approval
          </a>
          <a href="/admin/transactions" className="flex items-center px-6 py-2 mt-4 text-gray-100 hover:bg-gray-700">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transactions
          </a>
          <a href="/admin/analytics" className="flex items-center px-6 py-2 mt-4 text-gray-100 hover:bg-gray-700">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </a>
          <a href="/admin/cms" className="flex items-center px-6 py-2 mt-4 text-gray-100 hover:bg-gray-700">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            CMS
          </a>
          <a href="/admin/support" className="flex items-center px-6 py-2 mt-4 text-gray-100 hover:bg-gray-700">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Support
          </a>
          <a href="/admin/logout" className="flex items-center px-6 py-2 mt-4 text-gray-100 hover:bg-gray-700">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </a>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 focus:outline-none md:hidden"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <button className="flex items-center text-gray-500 focus:outline-none">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src="https://via.placeholder.com/40"
                    alt="Admin"
                  />
                  <span className="ml-2">Admin</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

// Export all components
export default {
  AdminLogin,
  AdminDashboard,
  UserManagement,
  KycApproval,
  TransactionManagement,
  AnalyticsDashboard,
  CmsManagement,
  SupportManagement,
  SupportTicketDetail,
  AdminLayout
};
