// UserService.js
// This service handles all user-related functionality for SawaPay

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
  getDocs
} from 'firebase/firestore';

import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

import { getFunctions, httpsCallable } from 'firebase/functions';

class UserService {
  constructor() {
    this.db = getFirestore();
    this.storage = getStorage();
    this.functions = getFunctions();
  }

  // User Profile Management

  /**
   * Get user profile data
   * @param {string} userId - User ID
   * @returns {Promise} - User profile data
   */
  async getUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      return userDoc.data();
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile data
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} - Success status
   */
  async updateUserProfile(userId, profileData) {
    try {
      await updateDoc(doc(this.db, 'users', userId), {
        ...profileData,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Upload profile image
   * @param {string} userId - User ID
   * @param {File} imageFile - Image file to upload
   * @returns {Promise} - Download URL of uploaded image
   */
  async uploadProfileImage(userId, imageFile) {
    try {
      const storageRef = ref(this.storage, `profile_images/${userId}/${Date.now()}_${imageFile.name}`);
      
      // Upload file
      await uploadBytes(storageRef, imageFile);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile with new image URL
      await updateDoc(doc(this.db, 'users', userId), {
        profileImageUrl: downloadURL,
        updatedAt: new Date()
      });
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  // KYC Document Management

  /**
   * Upload KYC document
   * @param {string} userId - User ID
   * @param {string} documentType - Document type (id_card, passport, driver_license, selfie)
   * @param {File} documentFile - Document file to upload
   * @param {Object} metadata - Document metadata
   * @returns {Promise} - Document ID and download URL
   */
  async uploadKycDocument(userId, documentType, documentFile, metadata = {}) {
    try {
      // Upload file to storage
      const storageRef = ref(this.storage, `kyc_documents/${userId}/${documentType}_${Date.now()}`);
      await uploadBytes(storageRef, documentFile);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Create document record in Firestore
      const kycDocRef = doc(collection(this.db, 'kyc_documents'));
      
      await updateDoc(kycDocRef, {
        documentId: kycDocRef.id,
        userId: userId,
        type: documentType,
        status: 'pending',
        documentUrl: downloadURL,
        documentNumber: metadata.documentNumber || '',
        expiryDate: metadata.expiryDate || null,
        issuingCountry: metadata.issuingCountry || '',
        submittedAt: new Date(),
        ...metadata
      });
      
      return {
        documentId: kycDocRef.id,
        documentUrl: downloadURL
      };
    } catch (error) {
      console.error('Error uploading KYC document:', error);
      throw error;
    }
  }

  /**
   * Get KYC documents for user
   * @param {string} userId - User ID
   * @returns {Promise} - Array of KYC documents
   */
  async getKycDocuments(userId) {
    try {
      const kycQuery = query(
        collection(this.db, 'kyc_documents'),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(kycQuery);
      
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return documents;
    } catch (error) {
      console.error('Error getting KYC documents:', error);
      throw error;
    }
  }

  /**
   * Get KYC verification status
   * @param {string} userId - User ID
   * @returns {Promise} - KYC status
   */
  async getKycStatus(userId) {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      return {
        kycStatus: userDoc.data().kycStatus || 'pending',
        kycVerifiedAt: userDoc.data().kycVerifiedAt || null
      };
    } catch (error) {
      console.error('Error getting KYC status:', error);
      throw error;
    }
  }

  // Wallet Management

  /**
   * Get user wallets
   * @param {string} userId - User ID
   * @returns {Promise} - Array of user wallets
   */
  async getUserWallets(userId) {
    try {
      const walletsQuery = query(
        collection(this.db, 'wallets'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(walletsQuery);
      
      const wallets = [];
      querySnapshot.forEach((doc) => {
        wallets.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return wallets;
    } catch (error) {
      console.error('Error getting user wallets:', error);
      throw error;
    }
  }

  /**
   * Get wallet by ID
   * @param {string} walletId - Wallet ID
   * @returns {Promise} - Wallet data
   */
  async getWalletById(walletId) {
    try {
      const walletDoc = await getDoc(doc(this.db, 'wallets', walletId));
      
      if (!walletDoc.exists()) {
        throw new Error('Wallet not found');
      }
      
      return {
        id: walletDoc.id,
        ...walletDoc.data()
      };
    } catch (error) {
      console.error('Error getting wallet:', error);
      throw error;
    }
  }

  /**
   * Add funds to wallet (placeholder for real payment integration)
   * @param {string} walletId - Wallet ID
   * @param {number} amount - Amount to add
   * @returns {Promise} - Transaction result
   */
  async addFundsToWallet(walletId, amount) {
    try {
      // This would be a Cloud Function in production
      const addFunds = httpsCallable(this.functions, 'addFundsToWallet');
      
      const result = await addFunds({
        walletId,
        amount
      });
      
      return result.data;
    } catch (error) {
      console.error('Error adding funds to wallet:', error);
      throw error;
    }
  }

  /**
   * Withdraw funds from wallet (placeholder for real payment integration)
   * @param {string} walletId - Wallet ID
   * @param {number} amount - Amount to withdraw
   * @param {Object} bankDetails - Bank details for withdrawal
   * @returns {Promise} - Transaction result
   */
  async withdrawFundsFromWallet(walletId, amount, bankDetails) {
    try {
      // This would be a Cloud Function in production
      const withdrawFunds = httpsCallable(this.functions, 'withdrawFundsFromWallet');
      
      const result = await withdrawFunds({
        walletId,
        amount,
        bankDetails
      });
      
      return result.data;
    } catch (error) {
      console.error('Error withdrawing funds from wallet:', error);
      throw error;
    }
  }

  // Transaction Management

  /**
   * Get user transactions
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise} - Array of transactions
   */
  async getUserTransactions(userId, filters = {}) {
    try {
      let transactionsQuery;
      
      // Base query conditions
      const conditions = [
        where('senderUserId', '==', userId),
        orderBy('createdAt', 'desc')
      ];
      
      // Apply filters
      if (filters.status) {
        conditions.push(where('status', '==', filters.status));
      }
      
      if (filters.limit) {
        conditions.push(limit(filters.limit));
      }
      
      // Create query
      transactionsQuery = query(
        collection(this.db, 'transactions'),
        ...conditions
      );
      
      // Execute query
      const querySnapshot = await getDocs(transactionsQuery);
      
      // Process results
      const sentTransactions = [];
      querySnapshot.forEach((doc) => {
        sentTransactions.push({
          id: doc.id,
          ...doc.data(),
          direction: 'sent'
        });
      });
      
      // Get received transactions
      const receivedConditions = [
        where('recipientUserId', '==', userId),
        orderBy('createdAt', 'desc')
      ];
      
      if (filters.status) {
        receivedConditions.push(where('status', '==', filters.status));
      }
      
      if (filters.limit) {
        receivedConditions.push(limit(filters.limit));
      }
      
      const receivedQuery = query(
        collection(this.db, 'transactions'),
        ...receivedConditions
      );
      
      const receivedSnapshot = await getDocs(receivedQuery);
      
      const receivedTransactions = [];
      receivedSnapshot.forEach((doc) => {
        receivedTransactions.push({
          id: doc.id,
          ...doc.data(),
          direction: 'received'
        });
      });
      
      // Combine and sort transactions
      const allTransactions = [...sentTransactions, ...receivedTransactions];
      allTransactions.sort((a, b) => b.createdAt - a.createdAt);
      
      // Apply limit if needed
      if (filters.limit && allTransactions.length > filters.limit) {
        return allTransactions.slice(0, filters.limit);
      }
      
      return allTransactions;
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   * @param {string} transactionId - Transaction ID
   * @returns {Promise} - Transaction data
   */
  async getTransactionById(transactionId) {
    try {
      const transactionDoc = await getDoc(doc(this.db, 'transactions', transactionId));
      
      if (!transactionDoc.exists()) {
        throw new Error('Transaction not found');
      }
      
      return {
        id: transactionDoc.id,
        ...transactionDoc.data()
      };
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  /**
   * Send money to another user
   * @param {string} senderUserId - Sender user ID
   * @param {string} recipientUserId - Recipient user ID
   * @param {number} amount - Amount to send
   * @param {string} description - Transaction description
   * @returns {Promise} - Transaction result
   */
  async sendMoney(senderUserId, recipientUserId, amount, description = '') {
    try {
      // This would be a Cloud Function in production
      const sendMoney = httpsCallable(this.functions, 'createTransaction');
      
      const result = await sendMoney({
        recipientUserId,
        amount,
        description
      });
      
      return result.data;
    } catch (error) {
      console.error('Error sending money:', error);
      throw error;
    }
  }

  /**
   * Request money from another user
   * @param {string} requesterId - Requester user ID
   * @param {string} requesteeId - Requestee user ID
   * @param {number} amount - Amount to request
   * @param {string} description - Request description
   * @returns {Promise} - Request result
   */
  async requestMoney(requesterId, requesteeId, amount, description = '') {
    try {
      // This would be a Cloud Function in production
      const requestMoney = httpsCallable(this.functions, 'requestMoney');
      
      const result = await requestMoney({
        requesteeId,
        amount,
        description
      });
      
      return result.data;
    } catch (error) {
      console.error('Error requesting money:', error);
      throw error;
    }
  }

  // Notification Management

  /**
   * Get user notifications
   * @param {string} userId - User ID
   * @param {boolean} unreadOnly - Get only unread notifications
   * @returns {Promise} - Array of notifications
   */
  async getUserNotifications(userId, unreadOnly = false) {
    try {
      let notificationsQuery;
      
      if (unreadOnly) {
        notificationsQuery = query(
          collection(this.db, 'notifications'),
          where('userId', '==', userId),
          where('isRead', '==', false),
          orderBy('createdAt', 'desc')
        );
      } else {
        notificationsQuery = query(
          collection(this.db, 'notifications'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(notificationsQuery);
      
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} - Success status
   */
  async markNotificationAsRead(notificationId) {
    try {
      await updateDoc(doc(this.db, 'notifications', notificationId), {
        isRead: true,
        readAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   * @param {string} userId - User ID
   * @returns {Promise} - Success status
   */
  async markAllNotificationsAsRead(userId) {
    try {
      // This would be a Cloud Function in production
      const markAllRead = httpsCallable(this.functions, 'markAllNotificationsAsRead');
      
      const result = await markAllRead({
        userId
      });
      
      return result.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Support Ticket Management

  /**
   * Create support ticket
   * @param {string} userId - User ID
   * @param {string} subject - Ticket subject
   * @param {string} message - Initial message
   * @param {string} category - Ticket category
   * @returns {Promise} - Ticket ID
   */
  async createSupportTicket(userId, subject, message, category) {
    try {
      // Create ticket document
      const ticketRef = doc(collection(this.db, 'support_tickets'));
      
      await updateDoc(ticketRef, {
        ticketId: ticketRef.id,
        userId,
        subject,
        status: 'open',
        priority: 'medium',
        category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add initial message
      const messageRef = doc(collection(this.db, `support_tickets/${ticketRef.id}/messages`));
      
      await updateDoc(messageRef, {
        messageId: messageRef.id,
        senderId: userId,
        isAdmin: false,
        content: message,
        attachments: [],
        createdAt: new Date(),
        isRead: false
      });
      
      return {
        ticketId: ticketRef.id
      };
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  }

  /**
   * Get user support tickets
   * @param {string} userId - User ID
   * @returns {Promise} - Array of support tickets
   */
  async getUserSupportTickets(userId) {
    try {
      const ticketsQuery = query(
        collection(this.db, 'support_tickets'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(ticketsQuery);
      
      const tickets = [];
      querySnapshot.forEach((doc) => {
        tickets.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return tickets;
    } catch (error) {
      console.error('Error getting user support tickets:', error);
      throw error;
    }
  }

  /**
   * Get support ticket by ID
   * @param {string} ticketId - Ticket ID
   * @returns {Promise} - Ticket data
   */
  async getSupportTicketById(ticketId) {
    try {
      const ticketDoc = await getDoc(doc(this.db, 'support_tickets', ticketId));
      
      if (!ticketDoc.exists()) {
        throw new Error('Ticket not found');
      }
      
      return {
        id: ticketDoc.id,
        ...ticketDoc.data()
      };
    } catch (error) {
      console.error('Error getting support ticket:', error);
      throw error;
    }
  }

  /**
   * Get ticket messages
   * @param {string} ticketId - Ticket ID
   * @returns {Promise} - Array of messages
   */
  async getTicketMessages(ticketId) {
    try {
      const messagesQuery = query(
        collection(this.db, `support_tickets/${ticketId}/messages`),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(messagesQuery);
      
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return messages;
    } catch (error) {
      console.error('Error getting ticket messages:', error);
      throw error;
    }
  }

  /**
   * Add message to support ticket
   * @param {string} ticketId - Ticket ID
   * @param {string} userId - User ID
   * @param {string} message - Message content
   * @param {Array} attachments - Array of attachment URLs
   * @returns {Promise} - Message ID
   */
  async addTicketMessage(ticketId, userId, message, attachments = []) {
    try {
      // Add message
      const messageRef = doc(collection(this.db, `support_tickets/${ticketId}/messages`));
      
      await updateDoc(messageRef, {
        messageId: messageRef.id,
        senderId: userId,
        isAdmin: false,
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
   * Upload support ticket attachment
   * @param {string} ticketId - Ticket ID
   * @param {string} userId - User ID
   * @param {File} file - File to upload
   * @returns {Promise} - Download URL
   */
  async uploadTicketAttachment(ticketId, userId, file) {
    try {
      const storageRef = ref(this.storage, `support_attachments/${ticketId}/${Date.now()}_${file.name}`);
      
      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading ticket attachment:', error);
      throw error;
    }
  }
}

export default new UserService();
