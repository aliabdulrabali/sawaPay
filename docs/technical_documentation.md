# SawaPay MVP Technical Documentation

## System Architecture

### Overview

SawaPay is a digital payment application built with a modern tech stack that includes:

- **Frontend**: React (Web) and React Native/Flutter (Mobile)
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions, Storage)
- **Deployment**: CI/CD pipelines via GitHub Actions, Firebase Hosting

The system follows a client-server architecture with Firebase serving as the backend-as-a-service (BaaS) provider. This architecture enables rapid development, scalability, and robust security while minimizing operational overhead.

### Component Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Web Frontend   │     │ Mobile Frontend │     │ Admin Dashboard │
│  (React + TW)   │     │ (React Native)  │     │  (React + TW)   │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         └──────────────►                 ◄──────────────┘
                        │  Firebase API   │
                        │                 │
                        └────────┬────────┘
                                 │
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Firebase Auth  │     │    Firestore    │     │ Cloud Functions │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │                 │
                                               │ Firebase Storage│
                                               │                 │
                                               └─────────────────┘
```

### Key Components

#### Web Frontend
- Built with React and TailwindCSS
- Responsive design for desktop and mobile browsers
- Implements user-facing features (registration, wallet management, transfers, etc.)
- Communicates with Firebase backend services

#### Mobile Frontend
- Built with React Native (or Flutter)
- Native experience on iOS and Android
- Feature parity with web application
- Push notification support
- Biometric authentication

#### Admin Dashboard
- Built with React and TailwindCSS
- Secure admin interface
- User management
- KYC verification
- Transaction monitoring
- Analytics and reporting
- Content management
- Support ticket handling

#### Firebase Backend
- **Authentication**: Handles user registration, login, and session management
- **Firestore**: NoSQL database for storing user data, transactions, and application state
- **Cloud Functions**: Server-side logic for sensitive operations (transfers, KYC verification)
- **Storage**: Stores user documents, profile images, and other binary data
- **Hosting**: Serves web and admin applications
- **Cloud Messaging**: Delivers push notifications to mobile devices

### Security Architecture

SawaPay implements multiple layers of security:

1. **Authentication**: Firebase Authentication with email/phone verification
2. **Authorization**: Firestore security rules to enforce access control
3. **Data Validation**: Client and server-side validation
4. **Encryption**: Data in transit (HTTPS) and at rest
5. **Secure Transactions**: Server-side validation via Cloud Functions
6. **Audit Logging**: Comprehensive activity logging
7. **Two-Factor Authentication**: Additional security for sensitive operations

### Data Flow

#### User Registration Flow
1. User enters registration details
2. Client validates input
3. Firebase Authentication creates user account
4. Cloud Function triggers to create user profile in Firestore
5. Welcome notification sent to user
6. User redirected to KYC verification

#### Transaction Flow
1. User initiates transfer
2. Client validates input
3. Request sent to Cloud Function
4. Function validates transaction
5. Function updates sender and recipient wallets
6. Transaction record created
7. Notifications sent to both parties

## API Documentation

### Authentication API

#### Register User
```javascript
// Register a new user
const registerUser = async (email, password, phone, displayName) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    // Link phone number (requires verification)
    const phoneProvider = new PhoneAuthProvider(auth);
    // ... phone verification logic
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      phone,
      displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      accountStatus: 'active',
      kycStatus: 'pending'
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};
```

#### Login User
```javascript
// Login with email and password
const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Login with phone number
const loginWithPhone = async (phoneNumber, verificationCode) => {
  try {
    // ... phone verification logic
    const userCredential = await signInWithPhoneNumber(auth, phoneNumber, verificationCode);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};
```

#### Two-Factor Authentication
```javascript
// Enable 2FA
const enable2FA = async (user) => {
  try {
    // Generate QR code for authenticator app
    const appVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible'
    }, auth);
    
    const multiFactorSession = await getMultiFactorSession(user);
    const phoneInfoOptions = {
      phoneNumber: user.phoneNumber,
      session: multiFactorSession
    };
    
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, appVerifier);
    
    // Store verification ID for later use
    return verificationId;
  } catch (error) {
    throw error;
  }
};
```

### User API

#### Get User Profile
```javascript
// Get user profile
const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    throw error;
  }
};
```

#### Update User Profile
```javascript
// Update user profile
const updateUserProfile = async (userId, profileData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};
```

#### Upload KYC Documents
```javascript
// Upload KYC document
const uploadKycDocument = async (userId, documentType, file) => {
  try {
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `kyc/${userId}/${documentType}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Create document record in Firestore
    const docRef = doc(collection(db, 'kyc_documents'));
    await setDoc(docRef, {
      userId,
      type: documentType,
      status: 'pending',
      documentUrl: downloadURL,
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update user KYC status
    await updateDoc(doc(db, 'users', userId), {
      kycStatus: 'pending',
      updatedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      status: 'pending'
    };
  } catch (error) {
    throw error;
  }
};
```

### Wallet API

#### Get User Wallets
```javascript
// Get user wallets
const getUserWallets = async (userId) => {
  try {
    const walletsQuery = query(
      collection(db, 'wallets'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(walletsQuery);
    
    const wallets = [];
    snapshot.forEach(doc => {
      wallets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return wallets;
  } catch (error) {
    throw error;
  }
};
```

#### Create Wallet
```javascript
// Create new wallet
const createWallet = async (userId, currency) => {
  try {
    // Check if wallet already exists for this currency
    const existingWalletsQuery = query(
      collection(db, 'wallets'),
      where('userId', '==', userId),
      where('currency', '==', currency)
    );
    
    const existingSnapshot = await getDocs(existingWalletsQuery);
    
    if (!existingSnapshot.empty) {
      throw new Error(`Wallet for ${currency} already exists`);
    }
    
    // Create new wallet
    const walletRef = doc(collection(db, 'wallets'));
    await setDoc(walletRef, {
      userId,
      currency,
      balance: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: walletRef.id,
      userId,
      currency,
      balance: 0,
      isActive: true
    };
  } catch (error) {
    throw error;
  }
};
```

### Transaction API

#### Send Money
```javascript
// Send money (this would be a Cloud Function)
const sendMoney = async (senderUserId, recipientUserId, amount, currency, description) => {
  try {
    // This is a simplified version - in production, this would be a Cloud Function
    // to ensure atomicity and security
    
    // Get sender wallet
    const senderWalletsQuery = query(
      collection(db, 'wallets'),
      where('userId', '==', senderUserId),
      where('currency', '==', currency)
    );
    
    const senderSnapshot = await getDocs(senderWalletsQuery);
    
    if (senderSnapshot.empty) {
      throw new Error(`Sender does not have a ${currency} wallet`);
    }
    
    const senderWallet = {
      id: senderSnapshot.docs[0].id,
      ...senderSnapshot.docs[0].data()
    };
    
    // Check balance
    if (senderWallet.balance < amount) {
      throw new Error('Insufficient funds');
    }
    
    // Get recipient wallet
    const recipientWalletsQuery = query(
      collection(db, 'wallets'),
      where('userId', '==', recipientUserId),
      where('currency', '==', currency)
    );
    
    const recipientSnapshot = await getDocs(recipientWalletsQuery);
    
    let recipientWallet;
    
    if (recipientSnapshot.empty) {
      // Create recipient wallet if it doesn't exist
      const newWalletRef = doc(collection(db, 'wallets'));
      await setDoc(newWalletRef, {
        userId: recipientUserId,
        currency,
        balance: 0,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      recipientWallet = {
        id: newWalletRef.id,
        userId: recipientUserId,
        currency,
        balance: 0,
        isActive: true
      };
    } else {
      recipientWallet = {
        id: recipientSnapshot.docs[0].id,
        ...recipientSnapshot.docs[0].data()
      };
    }
    
    // Calculate fee (simplified)
    const fee = amount * 0.01; // 1% fee
    const netAmount = amount - fee;
    
    // Create transaction record
    const transactionRef = doc(collection(db, 'transactions'));
    await setDoc(transactionRef, {
      type: 'transfer',
      senderUserId,
      recipientUserId,
      senderWalletId: senderWallet.id,
      recipientWalletId: recipientWallet.id,
      amount,
      fee,
      netAmount,
      currency,
      description,
      status: 'completed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update sender wallet
    await updateDoc(doc(db, 'wallets', senderWallet.id), {
      balance: senderWallet.balance - amount,
      updatedAt: serverTimestamp()
    });
    
    // Update recipient wallet
    await updateDoc(doc(db, 'wallets', recipientWallet.id), {
      balance: recipientWallet.balance + netAmount,
      updatedAt: serverTimestamp()
    });
    
    // Create transaction activities
    await setDoc(doc(collection(db, `transactions/${transactionRef.id}/activities`)), {
      type: 'created',
      timestamp: serverTimestamp(),
      data: {
        status: 'completed'
      }
    });
    
    return {
      id: transactionRef.id,
      status: 'completed',
      amount,
      fee,
      netAmount
    };
  } catch (error) {
    throw error;
  }
};
```

#### Get Transaction History
```javascript
// Get transaction history
const getTransactionHistory = async (userId, filters = {}, lastVisible = null, pageSize = 10) => {
  try {
    // This is a simplified implementation
    // In a real app, you would use a more sophisticated query
    
    const sentTransactionsQuery = query(
      collection(db, 'transactions'),
      where('senderUserId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    const receivedTransactionsQuery = query(
      collection(db, 'transactions'),
      where('recipientUserId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentTransactionsQuery),
      getDocs(receivedTransactionsQuery)
    ]);
    
    const transactions = [];
    
    sentSnapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
        direction: 'sent'
      });
    });
    
    receivedSnapshot.forEach(doc => {
      // Avoid duplicates
      if (!transactions.some(t => t.id === doc.id)) {
        transactions.push({
          id: doc.id,
          ...doc.data(),
          direction: 'received'
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
  } catch (error) {
    throw error;
  }
};
```

### Notification API

#### Get User Notifications
```javascript
// Get user notifications
const getUserNotifications = async (userId, lastVisible = null, pageSize = 20) => {
  try {
    let notificationsQuery;
    
    if (lastVisible) {
      notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(pageSize)
      );
    } else {
      notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
    const snapshot = await getDocs(notificationsQuery);
    
    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get pagination info
    const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
    
    return {
      notifications,
      lastVisible: lastVisibleDoc,
      hasMore: notifications.length === pageSize
    };
  } catch (error) {
    throw error;
  }
};
```

#### Mark Notification as Read
```javascript
// Mark notification as read
const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};
```

### Support API

#### Create Support Ticket
```javascript
// Create support ticket
const createSupportTicket = async (userId, subject, message, category) => {
  try {
    const ticketRef = doc(collection(db, 'support_tickets'));
    
    await setDoc(ticketRef, {
      userId,
      subject,
      category,
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Add initial message
    await setDoc(doc(collection(db, `support_tickets/${ticketRef.id}/messages`)), {
      senderId: userId,
      isAdmin: false,
      content: message,
      attachments: [],
      createdAt: serverTimestamp(),
      isRead: false
    });
    
    return {
      id: ticketRef.id,
      status: 'open'
    };
  } catch (error) {
    throw error;
  }
};
```

#### Get User Support Tickets
```javascript
// Get user support tickets
const getUserSupportTickets = async (userId) => {
  try {
    const ticketsQuery = query(
      collection(db, 'support_tickets'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(ticketsQuery);
    
    const tickets = [];
    snapshot.forEach(doc => {
      tickets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return tickets;
  } catch (error) {
    throw error;
  }
};
```

### Admin API

#### Admin Authentication
```javascript
// Admin sign in
const adminSignIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user is an admin
    const adminDoc = await getDoc(doc(db, 'admin_users', userCredential.user.uid));
    
    if (!adminDoc.exists()) {
      throw new Error('User is not an admin');
    }
    
    return {
      user: userCredential.user,
      adminData: adminDoc.data()
    };
  } catch (error) {
    throw error;
  }
};
```

#### User Management
```javascript
// Get users with pagination
const getUsers = async (pageSize = 10, lastVisible = null, filters = {}) => {
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
    usersQuery = query(collection(db, 'users'), ...queryConstraints);
    
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
    throw error;
  }
};
```

#### KYC Management
```javascript
// Get KYC verification requests
const getKycRequests = async (status = 'pending', pageSize = 10, lastVisible = null) => {
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
    kycQuery = query(collection(db, 'kyc_documents'), ...queryConstraints);
    
    // Execute query
    const snapshot = await getDocs(kycQuery);
    
    // Process results
    const requests = [];
    for (const doc of snapshot.docs) {
      const kycData = doc.data();
      
      // Get user data
      const userDoc = await getDoc(doc(db, `users/${kycData.userId}`));
      
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
    throw error;
  }
};
```

## Deployment Guide

### Prerequisites

- Node.js 16.x or later
- Firebase CLI
- GitHub account
- Firebase project
- Google Play Developer account (for Android)
- Apple Developer account (for iOS)

### Web Application Deployment

1. **Setup Firebase Project**:
   ```bash
   firebase login
   firebase init
   ```

2. **Configure Firebase Hosting**:
   - Copy the `firebase.json` file to your project root
   - Update the project ID in `.firebaserc`

3. **Setup GitHub Actions**:
   - Copy the workflow files to `.github/workflows/`
   - Add required secrets to your GitHub repository:
     - `FIREBASE_SERVICE_ACCOUNT_STAGING`
     - `FIREBASE_SERVICE_ACCOUNT_PRODUCTION`

4. **Manual Deployment**:
   ```bash
   npm run build
   firebase deploy --only hosting:web
   ```

### Admin Dashboard Deployment

1. **Configure Firebase Hosting Target**:
   ```bash
   firebase target:apply hosting admin admin-sawapay
   ```

2. **Manual Deployment**:
   ```bash
   cd admin
   npm run build
   firebase deploy --only hosting:admin
   ```

### Mobile App Deployment

#### Android

1. **Generate Keystore**:
   ```bash
   keytool -genkey -v -keystore sawapay.keystore -alias sawapay -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Gradle**:
   - Add signing configuration to `android/app/build.gradle`
   - Update `android/gradle.properties` with keystore information

3. **Manual Build**:
   ```bash
   cd mobile
   npm run build:android
   ```

#### iOS

1. **Configure Xcode Project**:
   - Update bundle identifier
   - Configure signing certificates
   - Set up provisioning profiles

2. **Manual Build**:
   ```bash
   cd mobile
   npm run build:ios
   ```

## Maintenance and Monitoring

### Firebase Console

Monitor your application through the Firebase Console:
- User authentication status
- Database usage
- Storage usage
- Function invocations
- Crash reports

### Error Tracking

Implement error tracking with Firebase Crashlytics:
- Web: Add Crashlytics SDK
- Mobile: Configure Crashlytics in the app

### Performance Monitoring

Use Firebase Performance Monitoring:
- Track page load times
- Monitor API response times
- Identify bottlenecks

### Security Audits

Regularly review:
- Firestore security rules
- Storage security rules
- Authentication settings
- API access controls

## Future Enhancements

### Phase 2 Features

1. **Advanced Analytics**:
   - User behavior tracking
   - Conversion funnels
   - Retention metrics

2. **Additional Payment Methods**:
   - Credit/debit card integration
   - Bank transfers
   - Mobile money integration

3. **Merchant Services**:
   - Payment links
   - Invoicing
   - Subscription management

4. **Enhanced Security**:
   - Biometric authentication
   - Device fingerprinting
   - Fraud detection algorithms

5. **International Transfers**:
   - Currency conversion
   - Cross-border payments
   - Remittance services
