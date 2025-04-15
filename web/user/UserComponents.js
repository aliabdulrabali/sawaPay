// UserComponents.js
// React components for user features in SawaPay

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthComponents';
import UserService from './UserService';

// User Dashboard Component
export const Dashboard = () => {
  const { currentUser } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's wallets
        const userWallets = await UserService.getUserWallets(currentUser.uid);
        setWallets(userWallets);
        
        // Fetch recent transactions
        const userTransactions = await UserService.getUserTransactions(currentUser.uid, { limit: 5 });
        setTransactions(userTransactions);
        
        // Fetch unread notifications
        const userNotifications = await UserService.getUserNotifications(currentUser.uid, true);
        setNotifications(userNotifications);
        
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
    <div className="dashboard-container p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome, {currentUser.displayName || 'User'}</h1>
      
      {/* Wallet Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Wallet</h2>
        
        {wallets.length === 0 ? (
          <div className="bg-yellow-100 p-4 rounded">
            No wallets found. Please contact support.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallets.map(wallet => (
              <div key={wallet.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Balance</span>
                  {wallet.isDefault && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Default</span>}
                </div>
                <div className="text-3xl font-bold mb-2">${wallet.balance.toFixed(2)}</div>
                <div className="text-sm text-gray-500">{wallet.currency}</div>
                <div className="mt-4 flex space-x-2">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Add Money
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                    Withdraw
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded flex flex-col items-center">
            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send Money
          </button>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-4 rounded flex flex-col items-center">
            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Request Money
          </button>
          <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded flex flex-col items-center">
            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Transaction History
          </button>
          <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-4 px-4 rounded flex flex-col items-center">
            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Scheduled Payments
          </button>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <a href="/transactions" className="text-blue-500 hover:text-blue-700">View All</a>
        </div>
        
        {transactions.length === 0 ? (
          <div className="bg-gray-100 p-4 rounded text-center">
            No recent transactions found.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {transaction.direction === 'sent' ? (
                          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        )}
                        {transaction.direction === 'sent' ? 'Sent to' : 'Received from'}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${transaction.direction === 'sent' ? 'text-red-500' : 'text-green-500'}`}>
                      {transaction.direction === 'sent' ? '-' : '+'}${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt.seconds * 1000).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Notifications */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <a href="/notifications" className="text-blue-500 hover:text-blue-700">View All</a>
        </div>
        
        {notifications.length === 0 ? (
          <div className="bg-gray-100 p-4 rounded text-center">
            No unread notifications.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {notifications.slice(0, 3).map(notification => (
              <div key={notification.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <h3 className="font-medium">{notification.title}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(notification.createdAt.seconds * 1000).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{notification.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// KYC Upload Component
export const KycUpload = () => {
  const { currentUser } = useAuth();
  const [kycStatus, setKycStatus] = useState('pending');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Form state
  const [idType, setIdType] = useState('passport');
  const [idNumber, setIdNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [country, setCountry] = useState('');
  const [idFile, setIdFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchKycData = async () => {
      try {
        setLoading(true);
        
        // Fetch KYC status
        const status = await UserService.getKycStatus(currentUser.uid);
        setKycStatus(status.kycStatus);
        
        // Fetch existing documents
        const userDocuments = await UserService.getKycDocuments(currentUser.uid);
        setDocuments(userDocuments);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchKycData();
  }, [currentUser]);

  const handleIdFileChange = (e) => {
    if (e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleSelfieFileChange = (e) => {
    if (e.target.files[0]) {
      setSelfieFile(e.target.files[0]);
    }
  };

  const handleSubmitId = async (e) => {
    e.preventDefault();
    
    if (!idFile) {
      setError('Please select an ID document to upload');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Upload ID document
      await UserService.uploadKycDocument(currentUser.uid, idType, idFile, {
        documentNumber: idNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        issuingCountry: country
      });
      
      // Move to next step
      setActiveStep(1);
      setIsSubmitting(false);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleSubmitSelfie = async (e) => {
    e.preventDefault();
    
    if (!selfieFile) {
      setError('Please select a selfie photo to upload');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Upload selfie
      await UserService.uploadKycDocument(currentUser.uid, 'selfie', selfieFile);
      
      // Refresh documents
      const userDocuments = await UserService.getKycDocuments(currentUser.uid);
      setDocuments(userDocuments);
      
      // Move to next step
      setActiveStep(2);
      setIsSubmitting(false);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading KYC data...</div>;
  }

  // If KYC is already verified, show status
  if (kycStatus === 'verified') {
    return (
      <div className="kyc-container p-4">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <div className="flex">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold">Your identity has been verified!</span>
          </div>
          <p className="mt-2">You have full access to all SawaPay features.</p>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Your Verification Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{doc.type === 'selfie' ? 'Selfie Photo' : `${doc.type.replace('_', ' ').toUpperCase()}`}</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Submitted on {new Date(doc.submittedAt.seconds * 1000).toLocaleDateString()}
              </div>
              {doc.documentNumber && (
                <div className="text-sm">
                  <span className="font-medium">Document Number:</span> {doc.documentNumber}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If KYC is under review, show status
  if (kycStatus === 'under_review') {
    return (
      <div className="kyc-container p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <div className="flex">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold">Your identity verification is under review</span>
          </div>
          <p className="mt-2">We are currently reviewing your documents. This process usually takes 1-2 business days.</p>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Your Submitted Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{doc.type === 'selfie' ? 'Selfie Photo' : `${doc.type.replace('_', ' ').toUpperCase()}`}</span>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Under Review</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Submitted on {new Date(doc.submittedAt.seconds * 1000).toLocaleDateString()}
              </div>
              {doc.documentNumber && (
                <div className="text-sm">
                  <span className="font-medium">Document Number:</span> {doc.documentNumber}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If KYC is rejected, show status and allow resubmission
  if (kycStatus === 'rejected') {
    return (
      <div className="kyc-container p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold">Your identity verification was rejected</span>
          </div>
          <p className="mt-2">Please review the feedback and resubmit your documents.</p>
        </div>
        
        <button 
          onClick={() => setActiveStep(0)} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Resubmit Documents
        </button>
        
        <h2 className="text-xl font-semibold mb-4">Previously Submitted Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{doc.type === 'selfie' ? 'Selfie Photo' : `${doc.type.replace('_', ' ').toUpperCase()}`}</span>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Rejected</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Submitted on {new Date(doc.submittedAt.seconds * 1000).toLocaleDateString()}
              </div>
              {doc.rejectionReason && (
                <div className="text-sm text-red-600 mt-2">
                  <span className="font-medium">Reason for rejection:</span> {doc.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // KYC upload steps
  return (
    <div className="kyc-container p-4">
      <h1 className="text-2xl font-bold mb-6">Identity Verification</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${activeStep >= 0 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${activeStep >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${activeStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <div className={`flex-1 h-1 mx-2 ${activeStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${activeStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            3
          </div>
        </div>
        <div className="flex text-sm mt-2">
          <div className="flex-1 text-center">ID Document</div>
          <div className="flex-1 text-center">Selfie Photo</div>
          <div className="flex-1 text-center">Verification</div>
        </div>
      </div>
      
      {activeStep === 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upload ID Document</h2>
          <p className="mb-4 text-gray-600">
            Please upload a clear photo of your government-issued ID document.
          </p>
          
          <form onSubmit={handleSubmitId}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="idType">
                ID Type
              </label>
              <select
                id="idType"
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="passport">Passport</option>
                <option value="driver_license">Driver's License</option>
                <option value="id_card">National ID Card</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="idNumber">
                Document Number
              </label>
              <input
                id="idNumber"
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expiryDate">
                Expiry Date
              </label>
              <input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
                Issuing Country
              </label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="idFile">
                Upload Document
              </label>
              <input
                id="idFile"
                type="file"
                accept="image/*"
                onChange={handleIdFileChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: JPG, PNG, PDF. Max size: 5MB.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Uploading...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {activeStep === 1 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upload Selfie Photo</h2>
          <p className="mb-4 text-gray-600">
            Please upload a clear selfie photo of yourself holding your ID document.
          </p>
          
          <form onSubmit={handleSubmitSelfie}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="selfieFile">
                Upload Selfie
              </label>
              <input
                id="selfieFile"
                type="file"
                accept="image/*"
                onChange={handleSelfieFileChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: JPG, PNG. Max size: 5MB.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(0)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Uploading...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {activeStep === 2 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Documents Submitted Successfully</h2>
            <p className="mb-4 text-gray-600">
              Your identity verification is now under review. This process usually takes 1-2 business days.
              We will notify you once the verification is complete.
            </p>
            <a
              href="/dashboard"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// Send Money Component
export const SendMoney = () => {
  const { currentUser } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoading(true);
        
        // Fetch user's wallets
        const userWallets = await UserService.getUserWallets(currentUser.uid);
        setWallets(userWallets);
        
        // Set default wallet
        const defaultWallet = userWallets.find(wallet => wallet.isDefault) || userWallets[0];
        if (defaultWallet) {
          setSelectedWallet(defaultWallet.id);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchWallets();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedWallet) {
      setError('Please select a wallet');
      return;
    }
    
    if (!recipientEmail) {
      setError('Please enter recipient email');
      return;
    }
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setSending(true);
      setError(null);
      
      // Get recipient user ID from email (this would be a Cloud Function in production)
      // For now, we'll simulate this
      const recipientUserId = 'simulated-recipient-id';
      
      // Send money
      const result = await UserService.sendMoney(
        currentUser.uid,
        recipientUserId,
        parseFloat(amount),
        description
      );
      
      setTransactionId(result.transactionId);
      setSuccess(true);
      setSending(false);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading wallet data...</div>;
  }

  if (success) {
    return (
      <div className="send-money-container p-4">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Money Sent Successfully</h2>
          <p className="mb-2 text-gray-600">
            You have sent ${parseFloat(amount).toFixed(2)} to {recipientEmail}.
          </p>
          <p className="mb-4 text-sm text-gray-500">
            Transaction ID: {transactionId}
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/dashboard"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Return to Dashboard
            </a>
            <a
              href="/send-money"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={(e) => {
                e.preventDefault();
                setSuccess(false);
                setRecipientEmail('');
                setAmount('');
                setDescription('');
              }}
            >
              Send More Money
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="send-money-container p-4">
      <h1 className="text-2xl font-bold mb-6">Send Money</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="wallet">
              From Wallet
            </label>
            <select
              id="wallet"
              value={selectedWallet || ''}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select Wallet</option>
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.isDefault ? 'Default Wallet' : `Wallet ${wallet.id.substring(0, 8)}`} - ${wallet.balance.toFixed(2)} {wallet.currency}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recipientEmail">
              Recipient Email
            </label>
            <input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="recipient@example.com"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 pl-7 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="What's this payment for?"
              rows="3"
            ></textarea>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Transaction History Component
export const TransactionHistory = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        
        // Fetch user transactions
        const userTransactions = await UserService.getUserTransactions(currentUser.uid);
        setTransactions(userTransactions);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [currentUser]);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Status filter
    if (statusFilter !== 'all' && transaction.status !== statusFilter) {
      return false;
    }
    
    // Type filter
    if (typeFilter === 'sent' && transaction.direction !== 'sent') {
      return false;
    }
    if (typeFilter === 'received' && transaction.direction !== 'received') {
      return false;
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.createdAt.seconds * 1000);
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);
      
      if (dateFilter === 'today' && transactionDate.toDateString() !== today.toDateString()) {
        return false;
      }
      if (dateFilter === 'week' && transactionDate < lastWeek) {
        return false;
      }
      if (dateFilter === 'month' && transactionDate < lastMonth) {
        return false;
      }
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.description?.toLowerCase().includes(query) ||
        transaction.id.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  if (loading) {
    return <div className="p-4">Loading transactions...</div>;
  }

  return (
    <div className="transaction-history-container p-4">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <option value="sent">Sent</option>
              <option value="received">Received</option>
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
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="searchQuery">
              Search
            </label>
            <input
              id="searchQuery"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Search transactions..."
            />
          </div>
        </div>
      </div>
      
      {filteredTransactions.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No transactions found matching your filters.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt.seconds * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {transaction.direction === 'sent' ? (
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      )}
                      {transaction.direction === 'sent' ? 'Sent' : 'Received'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.description || '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap font-medium ${transaction.direction === 'sent' ? 'text-red-500' : 'text-green-500'}`}>
                    {transaction.direction === 'sent' ? '-' : '+'}${transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href={`/transactions/${transaction.id}`} className="text-blue-500 hover:text-blue-700">
                      View Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Notifications Component
export const Notifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Fetch user notifications
        const userNotifications = await UserService.getUserNotifications(currentUser.uid);
        setNotifications(userNotifications);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [currentUser]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await UserService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true, readAt: new Date() } 
          : notification
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await UserService.markAllNotificationsAsRead(currentUser.uid);
      
      // Update local state
      setNotifications(notifications.map(notification => ({ 
        ...notification, 
        isRead: true, 
        readAt: new Date() 
      })));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-4">Loading notifications...</div>;
  }

  return (
    <div className="notifications-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        
        {notifications.some(notification => !notification.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Mark All as Read
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {notifications.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No notifications found.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{notification.title}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(notification.createdAt.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{notification.body}</p>
              
              <div className="mt-2 flex justify-between items-center">
                {notification.relatedEntityType && (
                  <a 
                    href={`/${notification.relatedEntityType}s/${notification.relatedEntityId}`} 
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    View Details
                  </a>
                )}
                
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Profile Settings Component
export const ProfileSettings = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const userProfile = await UserService.getUserProfile(currentUser.uid);
        setProfile(userProfile);
        
        // Set form values
        setFirstName(userProfile.firstName || '');
        setLastName(userProfile.lastName || '');
        setPhone(userProfile.phone || '');
        setAddress({
          street: userProfile.address?.street || '',
          city: userProfile.address?.city || '',
          state: userProfile.address?.state || '',
          country: userProfile.address?.country || '',
          postalCode: userProfile.address?.postalCode || ''
        });
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [currentUser]);

  const handleProfileImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Update profile data
      await UserService.updateUserProfile(currentUser.uid, {
        firstName,
        lastName,
        phone,
        address,
        displayName: `${firstName} ${lastName}`.trim()
      });
      
      // Upload profile image if selected
      if (profileImage) {
        await UserService.uploadProfileImage(currentUser.uid, profileImage);
      }
      
      setSuccess('Profile updated successfully');
      setIsSubmitting(false);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading profile data...</div>;
  }

  return (
    <div className="profile-settings-container p-4">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
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
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex items-center">
              <div className="mr-4">
                <img
                  src={profile.profileImageUrl || 'https://via.placeholder.com/100'}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profileImage">
                  Profile Image
                </label>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Address
            </label>
            
            <div className="mb-2">
              <input
                type="text"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Street Address"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="City"
              />
              
              <input
                type="text"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="State/Province"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Country"
              />
              
              <input
                type="text"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Postal/ZIP Code"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Support Contact Component
export const SupportContact = () => {
  const { currentUser } = useAuth();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('account');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState(null);

  const handleAttachmentChange = (e) => {
    if (e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject) {
      setError('Please enter a subject');
      return;
    }
    
    if (!message) {
      setError('Please enter a message');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let attachmentUrl = null;
      
      // Upload attachment if provided
      if (attachment) {
        // Create a temporary ticket ID for attachment upload
        const tempTicketId = `temp-${Date.now()}`;
        attachmentUrl = await UserService.uploadTicketAttachment(tempTicketId, currentUser.uid, attachment);
      }
      
      // Create support ticket
      const result = await UserService.createSupportTicket(
        currentUser.uid,
        subject,
        message,
        category
      );
      
      // If attachment was uploaded, add it to the ticket message
      if (attachmentUrl) {
        await UserService.addTicketMessage(
          result.ticketId,
          currentUser.uid,
          'Attachment for this ticket:',
          [attachmentUrl]
        );
      }
      
      setTicketId(result.ticketId);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="support-contact-container p-4">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Support Ticket Created</h2>
          <p className="mb-2 text-gray-600">
            Your support ticket has been created successfully. Our team will respond to you as soon as possible.
          </p>
          <p className="mb-4 text-sm text-gray-500">
            Ticket ID: {ticketId}
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/dashboard"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Return to Dashboard
            </a>
            <a
              href="/support-tickets"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              View My Tickets
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="support-contact-container p-4">
      <h1 className="text-2xl font-bold mb-6">Contact Support</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="account">Account</option>
              <option value="transaction">Transaction</option>
              <option value="technical">Technical Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Brief description of your issue"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Please describe your issue in detail"
              rows="6"
              required
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="attachment">
              Attachment (Optional)
            </label>
            <input
              id="attachment"
              type="file"
              onChange={handleAttachmentChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max file size: 10MB. Accepted formats: JPG, PNG, PDF, DOC, DOCX.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Export all components
export default {
  Dashboard,
  KycUpload,
  SendMoney,
  TransactionHistory,
  Notifications,
  ProfileSettings,
  SupportContact
};
