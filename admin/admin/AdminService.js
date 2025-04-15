// AdminService.js
// This service handles all admin-related functionality for SawaPay

import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  endBefore,
  limitToLast,
  Timestamp
} from 'firebase/firestore';

import { 
  getStorage, 
  ref, 
  getDownloadURL
} from 'firebase/storage';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

class AdminService {
  constructor() {
    this.db = getFirestore();
    this.storage = getStorage();
    this.functions = getFunctions();
    this.auth = getAuth();
  }

  // Admin Authentication

  /**
   * Admin sign in
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise} - Admin user credential
   */
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      
      // Check if user is an admin
      const adminDoc = await getDoc(doc(this.db, 'admin_users', userCredential.user.uid));
      
      if (!adminDoc.exists()) {
        throw new Error('User is not an admin');
      }
      
      return {
        user: userCredential.user,
        adminData: adminDoc.data()
      };
    } catch (error) {
      console.error('Error signing in as admin:', error);
      throw error;
    }
  }

  /**
   * Get current admin data
   * @param {string} adminId - Admin user ID
   * @returns {Promise} - Admin data
   */
  async getAdminData(adminId) {
    try {
      const adminDoc = await getDoc(doc(this.db, 'admin_users', adminId));
      
      if (!adminDoc.exists()) {
        throw new Error('Admin not found');
      }
      
      return adminDoc.data();
    } catch (error) {
      console.error('Error getting admin data:', error);
      throw error;
    }
  }

  // User Management

  /**
   * Get users with pagination
   * @param {number} pageSize - Number of users per page
   * @param {Object} lastVisible - Last document from previous page
   * @param {Object} filters - Filter options
   * @returns {Promise} - Array of users and pagination info
   */
  async getUsers(pageSize = 10, lastVisible = null, filters = {}) {
    try {
      let usersQuery;
      const queryConstraints = [];
      
      // Add filters
      if (filters.kycStatus) {
        queryConstraints.push(where('kycStatus', '==', filters.kycStatus));
      }
      
      if (filters.accountStatus) {
        queryConstraints.push(where('accountStatus', '==', filters.accountStatus));
      }
      
      // Add sorting
      queryConstraints.push(orderBy('createdAt', 'desc'));
      
      // Add pagination
      if (lastVisible) {
        queryConstraints.push(startAfter(lastVisible));
      }
      
      queryConstraints.push(limit(pageSize));
      
      // Create query
      usersQuery = query(collection(this.db, 'users'), ...queryConstraints);
      
      // Execute query
      const snapshot = await getDocs(usersQuery);
      
      // Process results
      const users = [];
      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Get pagination info
      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
      
      return {
        users,
        lastVisible: lastVisibleDoc,
        hasMore: users.length === pageSize
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * Search users
   * @param {string} searchTerm - Search term
   * @param {number} limit - Result limit
   * @returns {Promise} - Array of matching users
   */
  async searchUsers(searchTerm, resultLimit = 10) {
    try {
      // This is a simplified implementation
      // In a real app, you would use a more sophisticated search solution
      // like Algolia or Elasticsearch, or implement a Cloud Function for this
      
      // For now, we'll search by email (exact match) or displayName (contains)
      const emailQuery = query(
        collection(this.db, 'users'),
        where('email', '==', searchTerm),
        limit(resultLimit)
      );
      
      const emailSnapshot = await getDocs(emailQuery);
      
      const users = [];
      emailSnapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // If we have fewer results than the limit, search by display name
      if (users.length < resultLimit) {
        // This is not efficient and would not work in production
        // It's just a placeholder for a proper search implementation
        const allUsersQuery = query(
          collection(this.db, 'users'),
          limit(100)
        );
        
        const allUsersSnapshot = await getDocs(allUsersQuery);
        
        allUsersSnapshot.forEach(doc => {
          const userData = doc.data();
          if (userData.displayName && 
              userData.displayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !users.some(u => u.id === doc.id)) {
            users.push({
              id: doc.id,
              ...userData
            });
            
            if (users.length >= resultLimit) {
              return;
            }
          }
        });
      }
      
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Get user details
   * @param {string} userId - User ID
   * @returns {Promise} - User details
   */
  async getUserDetails(userId) {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      // Get user's wallets
      const walletsQuery = query(
        collection(this.db, 'wallets'),
        where('userId', '==', userId)
      );
      
      const walletsSnapshot = await getDocs(walletsQuery);
      
      const wallets = [];
      walletsSnapshot.forEach(doc => {
        wallets.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Get user's KYC documents
      const kycQuery = query(
        collection(this.db, 'kyc_documents'),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc')
      );
      
      const kycSnapshot = await getDocs(kycQuery);
      
      const kycDocuments = [];
      kycSnapshot.forEach(doc => {
        kycDocuments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Get recent transactions
      const sentTransactionsQuery = query(
        collection(this.db, 'transactions'),
        where('senderUserId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const sentTransactionsSnapshot = await getDocs(sentTransactionsQuery);
      
      const sentTransactions = [];
      sentTransactionsSnapshot.forEach(doc => {
        sentTransactions.push({
          id: doc.id,
          ...doc.data(),
          direction: 'sent'
        });
      });
      
      const receivedTransactionsQuery = query(
        collection(this.db, 'transactions'),
        where('recipientUserId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const receivedTransactionsSnapshot = await getDocs(receivedTransactionsQuery);
      
      const receivedTransactions = [];
      receivedTransactionsSnapshot.forEach(doc => {
        receivedTransactions.push({
          id: doc.id,
          ...doc.data(),
          direction: 'received'
        });
      });
      
      // Combine and sort transactions
      const recentTransactions = [...sentTransactions, ...receivedTransactions];
      recentTransactions.sort((a, b) => b.createdAt - a.createdAt);
      
      return {
        user: {
          id: userDoc.id,
          ...userDoc.data()
        },
        wallets,
        kycDocuments,
        recentTransactions: recentTransactions.slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  }

  /**
   * Update user status
   * @param {string} userId - User ID
   * @param {string} status - New account status
   * @returns {Promise} - Success status
   */
  async updateUserStatus(userId, status) {
    try {
      await updateDoc(doc(this.db, 'users', userId), {
        accountStatus: status,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // KYC Management

  /**
   * Get KYC verification requests
   * @param {string} status - Filter by status
   * @param {number} pageSize - Number of requests per page
   * @param {Object} lastVisible - Last document from previous page
   * @returns {Promise} - Array of KYC requests and pagination info
   */
  async getKycRequests(status = 'pending', pageSize = 10, lastVisible = null) {
    try {
      let kycQuery;
      const queryConstraints = [
        where('status', '==', status),
        orderBy('submittedAt', 'asc')
      ];
      
      // Add pagination
      if (lastVisible) {
        queryConstraints.push(startAfter(lastVisible));
      }
      
      queryConstraints.push(limit(pageSize));
      
      // Create query
      kycQuery = query(collection(this.db, 'kyc_documents'), ...queryConstraints);
      
      // Execute query
      const snapshot = await getDocs(kycQuery);
      
      // Process results
      const requests = [];
      for (const doc of snapshot.docs) {
        const kycData = doc.data();
        
        // Get user data
        const userDoc = await getDoc(this.db.doc(`users/${kycData.userId}`));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          requests.push({
            id: doc.id,
            ...kycData,
            user: {
              id: userDoc.id,
              displayName: userData.displayName,
              email: userData.email,
              phone: userData.phone
            }
          });
        } else {
          requests.push({
            id: doc.id,
            ...kycData,
            user: {
              id: kycData.userId,
              displayName: 'Unknown User',
              email: '',
              phone: ''
            }
          });
        }
      }
      
      // Get pagination info
      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
      
      return {
        requests,
        lastVisible: lastVisibleDoc,
        hasMore: requests.length === pageSize
      };
    } catch (error) {
      console.error('Error getting KYC requests:', error);
      throw error;
    }
  }

  /**
   * Get KYC document details
   * @param {string} documentId - Document ID
   * @returns {Promise} - Document details
   */
  async getKycDocumentDetails(documentId) {
    try {
      const docRef = doc(this.db, 'kyc_documents', documentId);
      const docSnapshot = await getDoc(docRef);
      
      if (!docSnapshot.exists()) {
        throw new Error('Document not found');
      }
      
      const documentData = docSnapshot.data();
      
      // Get user data
      const userDoc = await getDoc(doc(this.db, 'users', documentData.userId));
      
      let userData = null;
      if (userDoc.exists()) {
        userData = userDoc.data();
      }
      
      return {
        document: {
          id: docSnapshot.id,
          ...documentData
        },
        user: userData ? {
          id: userDoc.id,
          ...userData
        } : null
      };
    } catch (error) {
      console.error('Error getting KYC document details:', error);
      throw error;
    }
  }

  /**
   * Approve KYC document
   * @param {string} documentId - Document ID
   * @param {string} adminId - Admin ID
   * @param {string} notes - Admin notes
   * @returns {Promise} - Success status
   */
  async approveKycDocument(documentId, adminId, notes = '') {
    try {
      // This would call a Cloud Function in production
      const approveKyc = httpsCallable(this.functions, 'approveKycDocument');
      
      const result = await approveKyc({
        documentId,
        notes
      });
      
      return result.data;
    } catch (error) {
      console.error('Error approving KYC document:', error);
      throw error;
    }
  }

  /**
   * Reject KYC document
   * @param {string} documentId - Document ID
   * @param {string} adminId - Admin ID
   * @param {string} rejectionReason - Reason for rejection
   * @returns {Promise} - Success status
   */
  async rejectKycDocument(documentId, adminId, rejectionReason) {
    try {
      // This would call a Cloud Function in production
      const rejectKyc = httpsCallable(this.functions, 'rejectKycDocument');
      
      const result = await rejectKyc({
        documentId,
        rejectionReason
      });
      
      return result.data;
    } catch (error) {
      console.error('Error rejecting KYC document:', error);
      throw error;
    }
  }

  // Wallet Management

  /**
   * Get all wallets with pagination
   * @param {number} pageSize - Number of wallets per page
   * @param {Object} lastVisible - Last document from previous page
   * @returns {Promise} - Array of wallets and pagination info
   */
  async getAllWallets(pageSize = 10, lastVisible = null) {
    try {
      let walletsQuery;
      const queryConstraints = [
        orderBy('updatedAt', 'desc')
      ];
      
      // Add pagination
      if (lastVisible) {
        queryConstraints.push(startAfter(lastVisible));
      }
      
      queryConstraints.push(limit(pageSize));
      
      // Create query
      walletsQuery = query(collection(this.db, 'wallets'), ...queryConstraints);
      
      // Execute query
      const snapshot = await getDocs(walletsQuery);
      
      // Process results
      const wallets = [];
      for (const doc of snapshot.docs) {
        const walletData = doc.data();
        
        // Get user data
        const userDoc = await getDoc(this.db.doc(`users/${walletData.userId}`));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          wallets.push({
            id: doc.id,
            ...walletData,
            user: {
              id: userDoc.id,
              displayName: userData.displayName,
              email: userData.email
            }
          });
        } else {
          wallets.push({
            id: doc.id,
            ...walletData,
            user: {
              id: walletData.userId,
              displayName: 'Unknown User',
              email: ''
            }
          });
        }
      }
      
      // Get pagination info
      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
      
      return {
        wallets,
        lastVisible: lastVisibleDoc,
        hasMore: wallets.length === pageSize
      };
    } catch (error) {
      console.error('Error getting all wallets:', error);
      throw error;
    }
  }

  /**
   * Adjust wallet balance
   * @param {string} walletId - Wallet ID
   * @param {number} amount - Amount to adjust (positive or negative)
   * @param {string} reason - Reason for adjustment
   * @param {string} adminId - Admin ID
   * @returns {Promise} - Success status
   */
  async adjustWalletBalance(walletId, amount, reason, adminId) {
    try {
      // This would call a Cloud Function in production
      const adjustBalance = httpsCallable(this.functions, 'adjustWalletBalance');
      
      const result = await adjustBalance({
        walletId,
        amount,
        reason,
        adminId
      });
      
      return result.data;
    } catch (error) {
      console.error('Error adjusting wallet balance:', error);
      throw error;
    }
  }

  // Transaction Management

  /**
   * Get all transactions with pagination
   * @param {number} pageSize - Number of transactions per page
   * @param {Object} lastVisible - Last document from previous page
   * @param {Object} filters - Filter options
   * @returns {Promise} - Array of transactions and pagination info
   */
  async getAllTransactions(pageSize = 10, lastVisible = null, filters = {}) {
    try {
      let transactionsQuery;
      const queryConstraints = [];
      
      // Add filters
      if (filters.status) {
        queryConstraints.push(where('status', '==', filters.status));
      }
      
      if (filters.type) {
        queryConstraints.push(where('type', '==', filters.type));
      }
      
      if (filters.userId) {
        // This is a simplified approach - in a real app, you would use a more sophisticated query
        const userTransactionsQuery1 = query(
          collection(this.db, 'transactions'),
          where('senderUserId', '==', filters.userId),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
        
        const userTransactionsQuery2 = query(
          collection(this.db, 'transactions'),
          where('recipientUserId', '==', filters.userId),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
        
        const [snapshot1, snapshot2] = await Promise.all([
          getDocs(userTransactionsQuery1),
          getDocs(userTransactionsQuery2)
        ]);
        
        const transactions = [];
        
        snapshot1.forEach(doc => {
          transactions.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        snapshot2.forEach(doc => {
          // Avoid duplicates
          if (!transactions.some(t => t.id === doc.id)) {
            transactions.push({
              id: doc.id,
              ...doc.data()
            });
          }
        });
        
        // Sort by createdAt
        transactions.sort((a, b) => b.createdAt - a.createdAt);
        
        return {
          transactions: transactions.slice(0, pageSize),
          hasMore: transactions.length > pageSize,
          lastVisible: transactions.length > 0 ? transactions[pageSize - 1] : null
        };
      }
      
      // Add sorting
      queryConstraints.push(orderBy('createdAt', 'desc'));
      
      // Add pagination
      if (lastVisible) {
        queryConstraints.push(startAfter(lastVisible));
      }
      
      queryConstraints.push(limit(pageSize));
      
      // Create query
      transactionsQuery = query(collection(this.db, 'transactions'), ...queryConstraints);
      
      // Execute query
      const snapshot = await getDocs(transactionsQuery);
      
      // Process results
      const transactions = [];
      snapshot.forEach(doc => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Get pagination info
      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
      
      return {
        transactions,
        lastVisible: lastVisibleDoc,
        hasMore: transactions.length === pageSize
      };
    } catch (error) {
      console.error('Error getting all transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction details
   * @param {string} transactionId - Transaction ID
   * @returns {Promise} - Transaction details
   */
  async getTransactionDetails(transactionId) {
    try {
      const transactionDoc = await getDoc(doc(this.db, 'transactions', transactionId));
      
      if (!transactionDoc.exists()) {
        throw new Error('Transaction not found');
      }
      
      const transactionData = transactionDoc.data();
      
      // Get sender data
      const senderDoc = await getDoc(doc(this.db, 'users', transactionData.senderUserId));
      
      let senderData = null;
      if (senderDoc.exists()) {
        senderData = senderDoc.data();
      }
      
      // Get recipient data
      const recipientDoc = await getDoc(doc(this.db, 'users', transactionData.recipientUserId));
      
      let recipientData = null;
      if (recipientDoc.exists()) {
        recipientData = recipientDoc.data();
      }
      
      // Get transaction activities
      const activitiesQuery = query(
        collection(this.db, `transactions/${transactionId}/activities`),
        orderBy('timestamp', 'asc')
      );
      
      const activitiesSnapshot = await getDocs(activitiesQuery);
      
      const activities = [];
      activitiesSnapshot.forEach(doc => {
        activities.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        transaction: {
          id: transactionDoc.id,
          ...transactionData
        },
        sender: senderData ? {
          id: senderDoc.id,
          displayName: senderData.displayName,
          email: senderData.email
        } : null,
        recipient: recipientData ? {
          id: recipientDoc.id,
          displayName: recipientData.displayName,
          email: recipientData.email
        } : null,
        activities
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      throw error;
    }
  }

  // Analytics

  /**
   * Get user growth analytics
   * @param {string} timeframe - Timeframe (day, week, month, year)
   * @returns {Promise} - User growth data
   */
  async getUserGrowthAnalytics(timeframe = 'month') {
    try {
      // This is a simplified implementation
      // In a real app, you would use a more sophisticated analytics solution
      // or implement a Cloud Function for this
      
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'day':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30); // Last 30 days
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 12 * 7); // Last 12 weeks
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(startDate.getFullYear() - 5); // Last 5 years
          break;
        default:
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 12); // Default to last 12 months
      }
      
      const usersQuery = query(
        collection(this.db, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(usersQuery);
      
      const usersByPeriod = {};
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        const createdAt = userData.createdAt.toDate();
        
        let periodKey;
        
        switch (timeframe) {
          case 'day':
            periodKey = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')}`;
            break;
          case 'week':
            // Get the week number
            const weekNumber = Math.ceil((createdAt.getDate() + new Date(createdAt.getFullYear(), createdAt.getMonth(), 1).getDay()) / 7);
            periodKey = `${createdAt.getFullYear()}-W${weekNumber}`;
            break;
          case 'month':
            periodKey = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          case 'year':
            periodKey = `${createdAt.getFullYear()}`;
            break;
          default:
            periodKey = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        
        if (!usersByPeriod[periodKey]) {
          usersByPeriod[periodKey] = 0;
        }
        
        usersByPeriod[periodKey]++;
      });
      
      // Convert to array format for charts
      const result = Object.entries(usersByPeriod).map(([period, count]) => ({
        period,
        count
      }));
      
      return result;
    } catch (error) {
      console.error('Error getting user growth analytics:', error);
      throw error;
    }
  }

  /**
   * Get transaction volume analytics
   * @param {string} timeframe - Timeframe (day, week, month, year)
   * @returns {Promise} - Transaction volume data
   */
  async getTransactionVolumeAnalytics(timeframe = 'month') {
    try {
      // Similar implementation to getUserGrowthAnalytics
      // but for transactions
      
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'day':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30); // Last 30 days
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 12 * 7); // Last 12 weeks
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(startDate.getFullYear() - 5); // Last 5 years
          break;
        default:
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 12); // Default to last 12 months
      }
      
      const transactionsQuery = query(
        collection(this.db, 'transactions'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(transactionsQuery);
      
      const volumeByPeriod = {};
      
      snapshot.forEach(doc => {
        const transactionData = doc.data();
        const createdAt = transactionData.createdAt.toDate();
        const amount = transactionData.amount || 0;
        
        let periodKey;
        
        switch (timeframe) {
          case 'day':
            periodKey = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')}`;
            break;
          case 'week':
            // Get the week number
            const weekNumber = Math.ceil((createdAt.getDate() + new Date(createdAt.getFullYear(), createdAt.getMonth(), 1).getDay()) / 7);
            periodKey = `${createdAt.getFullYear()}-W${weekNumber}`;
            break;
          case 'month':
            periodKey = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          case 'year':
            periodKey = `${createdAt.getFullYear()}`;
            break;
          default:
            periodKey = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        
        if (!volumeByPeriod[periodKey]) {
          volumeByPeriod[periodKey] = {
            count: 0,
            volume: 0
          };
        }
        
        volumeByPeriod[periodKey].count++;
        volumeByPeriod[periodKey].volume += amount;
      });
      
      // Convert to array format for charts
      const result = Object.entries(volumeByPeriod).map(([period, data]) => ({
        period,
        count: data.count,
        volume: data.volume
      }));
      
      return result;
    } catch (error) {
      console.error('Error getting transaction volume analytics:', error);
      throw error;
    }
  }

  /**
   * Get revenue analytics
   * @param {string} timeframe - Timeframe (day, week, month, year)
   * @returns {Promise} - Revenue data
   */
  async getRevenueAnalytics(timeframe = 'month') {
    try {
      // Similar implementation to getTransactionVolumeAnalytics
      // but focusing on fees
      
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'day':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30); // Last 30 days
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 12 * 7); // Last 12 weeks
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(startDate.getFullYear() - 5); // Last 5 years
          break;
        default:
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 12); // Default to last 12 months
      }
      
      const transactionsQuery = query(
        collection(this.db, 'transactions'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(transactionsQuery);
      
      const revenueByPeriod = {};
      
      snapshot.forEach(doc => {
        const transactionData = doc.data();
        const createdAt = transactionData.createdAt.toDate();
        const fee = transactionData.fee || 0;
        
        let periodKey;
        
        switch (timeframe) {
          case 'day':
            periodKey = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')}`;
            break;
          case 'week':
            // Get the week number
            const weekNumber = Math.ceil((createdAt.getDate() + new Date(createdAt.getFullYear(), createdAt.getMonth(), 1).getDay()) / 7);
            periodKey = `${createdAt.getFullYear()}-W${weekNumber}`;
            break;
          case 'month':
            periodKey = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          case 'year':
            periodKey = `${createdAt.getFullYear()}`;
            break;
          default:
            periodKey = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        
        if (!revenueByPeriod[periodKey]) {
          revenueByPeriod[periodKey] = 0;
        }
        
        revenueByPeriod[periodKey] += fee;
      });
      
      // Convert to array format for charts
      const result = Object.entries(revenueByPeriod).map(([period, revenue]) => ({
        period,
        revenue
      }));
      
      return result;
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      throw error;
    }
  }

  // CMS Management

  /**
   * Get content
   * @param {string} contentId - Content ID
   * @returns {Promise} - Content data
   */
  async getContent(contentId) {
    try {
      const contentDoc = await getDoc(doc(this.db, 'content', contentId));
      
      if (!contentDoc.exists()) {
        throw new Error('Content not found');
      }
      
      return {
        id: contentDoc.id,
        ...contentDoc.data()
      };
    } catch (error) {
      console.error('Error getting content:', error);
      throw error;
    }
  }

  /**
   * Update content
   * @param {string} contentId - Content ID
   * @param {Object} contentData - Content data
   * @param {string} adminId - Admin ID
   * @returns {Promise} - Success status
   */
  async updateContent(contentId, contentData, adminId) {
    try {
      await updateDoc(doc(this.db, 'content', contentId), {
        ...contentData,
        updatedAt: new Date(),
        updatedBy: adminId,
        version: contentData.version + 1
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  /**
   * Get FAQ items
   * @returns {Promise} - Array of FAQ items
   */
  async getFaqItems() {
    try {
      const faqQuery = query(
        collection(this.db, 'content/faq/items'),
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(faqQuery);
      
      const items = [];
      snapshot.forEach(doc => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return items;
    } catch (error) {
      console.error('Error getting FAQ items:', error);
      throw error;
    }
  }

  /**
   * Update FAQ item
   * @param {string} faqId - FAQ item ID
   * @param {Object} faqData - FAQ item data
   * @param {string} adminId - Admin ID
   * @returns {Promise} - Success status
   */
  async updateFaqItem(faqId, faqData, adminId) {
    try {
      await updateDoc(doc(this.db, 'content/faq/items', faqId), {
        ...faqData,
        updatedAt: new Date(),
        updatedBy: adminId
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating FAQ item:', error);
      throw error;
    }
  }

  /**
   * Create FAQ item
   * @param {Object} faqData - FAQ item data
   * @param {string} adminId - Admin ID
   * @returns {Promise} - New FAQ item ID
   */
  async createFaqItem(faqData, adminId) {
    try {
      const faqRef = doc(collection(this.db, 'content/faq/items'));
      
      await updateDoc(faqRef, {
        ...faqData,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: adminId,
        isPublished: faqData.isPublished || false
      });
      
      return {
        id: faqRef.id
      };
    } catch (error) {
      console.error('Error creating FAQ item:', error);
      throw error;
    }
  }

  /**
   * Delete FAQ item
   * @param {string} faqId - FAQ item ID
   * @returns {Promise} - Success status
   */
  async deleteFaqItem(faqId) {
    try {
      await deleteDoc(doc(this.db, 'content/faq/items', faqId));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting FAQ item:', error);
      throw error;
    }
  }

  // Support Management

  /**
   * Get support tickets
   * @param {string} status - Filter by status
   * @param {number} pageSize - Number of tickets per page
   * @param {Object} lastVisible - Last document from previous page
   * @returns {Promise} - Array of support tickets and pagination info
   */
  async getSupportTickets(status = 'all', pageSize = 10, lastVisible = null) {
    try {
      let ticketsQuery;
      const queryConstraints = [];
      
      // Add filters
      if (status !== 'all') {
        queryConstraints.push(where('status', '==', status));
      }
      
      // Add sorting
      queryConstraints.push(orderBy('updatedAt', 'desc'));
      
      // Add pagination
      if (lastVisible) {
        queryConstraints.push(startAfter(lastVisible));
      }
      
      queryConstraints.push(limit(pageSize));
      
      // Create query
      ticketsQuery = query(collection(this.db, 'support_tickets'), ...queryConstraints);
      
      // Execute query
      const snapshot = await getDocs(ticketsQuery);
      
      // Process results
      const tickets = [];
      for (const doc of snapshot.docs) {
        const ticketData = doc.data();
        
        // Get user data
        const userDoc = await getDoc(this.db.doc(`users/${ticketData.userId}`));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          tickets.push({
            id: doc.id,
            ...ticketData,
            user: {
              id: userDoc.id,
              displayName: userData.displayName,
              email: userData.email
            }
          });
        } else {
          tickets.push({
            id: doc.id,
            ...ticketData,
            user: {
              id: ticketData.userId,
              displayName: 'Unknown User',
              email: ''
            }
          });
        }
      }
      
      // Get pagination info
      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
      
      return {
        tickets,
        lastVisible: lastVisibleDoc,
        hasMore: tickets.length === pageSize
      };
    } catch (error) {
      console.error('Error getting support tickets:', error);
      throw error;
    }
  }

  /**
   * Get support ticket details
   * @param {string} ticketId - Ticket ID
   * @returns {Promise} - Ticket details
   */
  async getSupportTicketDetails(ticketId) {
    try {
      const ticketDoc = await getDoc(doc(this.db, 'support_tickets', ticketId));
      
      if (!ticketDoc.exists()) {
        throw new Error('Ticket not found');
      }
      
      const ticketData = ticketDoc.data();
      
      // Get user data
      const userDoc = await getDoc(doc(this.db, 'users', ticketData.userId));
      
      let userData = null;
      if (userDoc.exists()) {
        userData = userDoc.data();
      }
      
      // Get ticket messages
      const messagesQuery = query(
        collection(this.db, `support_tickets/${ticketId}/messages`),
        orderBy('createdAt', 'asc')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const messages = [];
      messagesSnapshot.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        ticket: {
          id: ticketDoc.id,
          ...ticketData
        },
        user: userData ? {
          id: userDoc.id,
          ...userData
        } : null,
        messages
      };
    } catch (error) {
      console.error('Error getting support ticket details:', error);
      throw error;
    }
  }

  /**
   * Update support ticket status
   * @param {string} ticketId - Ticket ID
   * @param {string} status - New status
   * @param {string} adminId - Admin ID
   * @returns {Promise} - Success status
   */
  async updateTicketStatus(ticketId, status, adminId) {
    try {
      await updateDoc(doc(this.db, 'support_tickets', ticketId), {
        status,
        updatedAt: new Date(),
        ...(status === 'resolved' ? { resolvedAt: new Date() } : {})
      });
      
      // Add a message about the status change
      const messageRef = doc(collection(this.db, `support_tickets/${ticketId}/messages`));
      
      await updateDoc(messageRef, {
        messageId: messageRef.id,
        senderId: adminId,
        isAdmin: true,
        content: `Ticket status changed to ${status}`,
        attachments: [],
        createdAt: new Date(),
        isRead: false
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  /**
   * Add message to support ticket
   * @param {string} ticketId - Ticket ID
   * @param {string} adminId - Admin ID
   * @param {string} message - Message content
   * @param {Array} attachments - Array of attachment URLs
   * @returns {Promise} - Message ID
   */
  async addTicketMessage(ticketId, adminId, message, attachments = []) {
    try {
      // Add message
      const messageRef = doc(collection(this.db, `support_tickets/${ticketId}/messages`));
      
      await updateDoc(messageRef, {
        messageId: messageRef.id,
        senderId: adminId,
        isAdmin: true,
        content: message,
        attachments,
        createdAt: new Date(),
        isRead: false
      });
      
      // Update ticket
      await updateDoc(doc(this.db, 'support_tickets', ticketId), {
        updatedAt: new Date()
      });
      
      return {
        messageId: messageRef.id
      };
    } catch (error) {
      console.error('Error adding ticket message:', error);
      throw error;
    }
  }

  /**
   * Assign ticket to admin
   * @param {string} ticketId - Ticket ID
   * @param {string} adminId - Admin ID
   * @returns {Promise} - Success status
   */
  async assignTicket(ticketId, adminId) {
    try {
      await updateDoc(doc(this.db, 'support_tickets', ticketId), {
        assignedTo: adminId,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    }
  }
}

export default new AdminService();
