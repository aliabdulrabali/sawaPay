# Firebase Infrastructure Setup Guide for SawaPay MVP

This guide provides step-by-step instructions for setting up the Firebase infrastructure required for the SawaPay MVP. It covers project creation, authentication configuration, Firestore database setup, storage configuration, Cloud Functions implementation, and security rules.

## 1. Firebase Project Setup

### 1.1 Create a New Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter "SawaPay" as the project name
4. Configure Google Analytics (recommended)
5. Select or create a Google Analytics account
6. Accept the terms and create the project

### 1.2 Add Web Application

1. From the project overview, click the web icon (</>) to add a web app
2. Register the app with name "SawaPay Web"
3. Check the box for "Also set up Firebase Hosting"
4. Click "Register app"
5. Copy the Firebase configuration object for later use in the web application
6. Click "Continue to console"

### 1.3 Add iOS Application

1. From the project overview, click the iOS icon to add an iOS app
2. Enter "com.sawapay.ios" as the iOS bundle ID
3. Enter "SawaPay" as the app nickname
4. Enter the App Store ID (if available, otherwise can be added later)
5. Click "Register app"
6. Download the GoogleService-Info.plist file for later use in the iOS application
7. Click "Continue to console"

### 1.4 Add Android Application

1. From the project overview, click the Android icon to add an Android app
2. Enter "com.sawapay.android" as the Android package name
3. Enter "SawaPay" as the app nickname
4. Enter the SHA-1 signing certificate (optional, can be added later)
5. Click "Register app"
6. Download the google-services.json file for later use in the Android application
7. Click "Continue to console"

## 2. Firebase Authentication Setup

### 2.1 Enable Authentication Methods

1. In the Firebase console, navigate to "Authentication" > "Sign-in method"
2. Enable the following authentication methods:
   - Email/Password
   - Google
   - Apple
   - Phone

### 2.2 Configure Email/Password Authentication

1. Click "Email/Password" and toggle the "Enable" switch
2. Enable "Email link (passwordless sign-in)" if desired
3. Click "Save"

### 2.3 Configure Google Authentication

1. Click "Google" and toggle the "Enable" switch
2. Enter your project's public-facing name
3. Select a project support email
4. Click "Save"

### 2.4 Configure Apple Authentication

1. Click "Apple" and toggle the "Enable" switch
2. Follow the instructions to set up Apple Sign-In
3. Enter the Apple Services ID
4. Upload the private key
5. Enter the key ID and team ID
6. Click "Save"

### 2.5 Configure Phone Authentication

1. Click "Phone" and toggle the "Enable" switch
2. Review the terms of service
3. Click "Save"

### 2.6 Set Up Security Configuration

1. Navigate to "Authentication" > "Settings"
2. Configure authorized domains for redirects
3. Set up multi-factor authentication if required
4. Configure email templates for authentication emails

## 3. Firestore Database Setup

### 3.1 Create Firestore Database

1. In the Firebase console, navigate to "Firestore Database"
2. Click "Create database"
3. Select "Start in production mode"
4. Select the database location closest to your target users
5. Click "Enable"

### 3.2 Set Up Collections and Initial Documents

Based on the database schema design, create the following collections:

1. `users` collection
2. `wallets` collection
3. `transactions` collection
4. `kyc_documents` collection
5. `notifications` collection
6. `support_tickets` collection
7. `content` collection
8. `admin_users` collection

### 3.3 Create Composite Indexes

Create the following composite indexes to support the queries defined in the database schema:

1. Transactions collection:
   - Fields: `senderUserId` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

2. Transactions collection:
   - Fields: `recipientUserId` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

3. Transactions collection:
   - Fields: `status` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

4. Transactions collection:
   - Fields: `senderUserId` (Ascending), `status` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

5. Transactions collection:
   - Fields: `recipientUserId` (Ascending), `status` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

6. KYC Documents collection:
   - Fields: `status` (Ascending), `submittedAt` (Ascending)
   - Query scope: Collection

7. KYC Documents collection:
   - Fields: `userId` (Ascending), `type` (Ascending)
   - Query scope: Collection

8. Notifications collection:
   - Fields: `userId` (Ascending), `isRead` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

9. Notifications collection:
   - Fields: `userId` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

10. Support Tickets collection:
    - Fields: `status` (Ascending), `createdAt` (Ascending)
    - Query scope: Collection

11. Support Tickets collection:
    - Fields: `userId` (Ascending), `status` (Ascending), `createdAt` (Descending)
    - Query scope: Collection

12. Support Tickets collection:
    - Fields: `assignedTo` (Ascending), `status` (Ascending), `priority` (Descending)
    - Query scope: Collection

### 3.4 Implement Security Rules

Navigate to "Firestore Database" > "Rules" and implement the security rules as defined in the database schema document:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User can read and update their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow create, delete: if false; // Only through Firebase Functions
    }
    
    // User can read their own wallet
    match /wallets/{walletId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create, update, delete: if false; // Only through Firebase Functions
    }
    
    // User can read their own transactions
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
                  (resource.data.senderUserId == request.auth.uid || 
                   resource.data.recipientUserId == request.auth.uid);
      allow create, update, delete: if false; // Only through Firebase Functions
    }
    
    // User can read and create their own KYC documents
    match /kyc_documents/{documentId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Only through Firebase Functions
    }
    
    // User can read and update their own notifications
    match /notifications/{notificationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
                    resource.data.userId == request.auth.uid && 
                    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isRead', 'readAt']);
      allow create, delete: if false; // Only through Firebase Functions
    }
    
    // User can read and create their own support tickets
    match /support_tickets/{ticketId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Only through Firebase Functions
      
      // User can read and create messages in their own tickets
      match /messages/{messageId} {
        allow read: if request.auth != null && get(/databases/$(database)/documents/support_tickets/$(ticketId)).data.userId == request.auth.uid;
        allow create: if request.auth != null && 
                      get(/databases/$(database)/documents/support_tickets/$(ticketId)).data.userId == request.auth.uid && 
                      request.resource.data.senderId == request.auth.uid && 
                      request.resource.data.isAdmin == false;
        allow update, delete: if false; // Only through Firebase Functions
      }
    }
    
    // Public content is readable by all authenticated users
    match /content/{contentId} {
      allow read: if request.auth != null && resource.data.isPublished == true;
      allow create, update, delete: if false; // Only through Firebase Functions
      
      match /faq/items/{faqId} {
        allow read: if request.auth != null && resource.data.isPublished == true;
        allow create, update, delete: if false; // Only through Firebase Functions
      }
    }
    
    // Admin users collection is not accessible to regular users
    match /admin_users/{adminId} {
      allow read, write: if false; // Only through Firebase Functions with admin privileges
    }
  }
}
```

## 4. Firebase Storage Setup

### 4.1 Create Storage Bucket

1. In the Firebase console, navigate to "Storage"
2. Click "Get started"
3. Select "Start in production mode"
4. Select the storage location closest to your target users
5. Click "Done"

### 4.2 Create Folder Structure

Create the following folder structure in the Storage bucket:

1. `/profile_images/`
2. `/kyc_documents/`
3. `/support_attachments/`

### 4.3 Implement Storage Security Rules

Navigate to "Storage" > "Rules" and implement the following security rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile images can be read by anyone, but only uploaded by the owner
    match /profile_images/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // KYC documents can only be read and written by the owner
    match /kyc_documents/{userId}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Support attachments can be read by the ticket owner and admins
    match /support_attachments/{ticketId}/{fileName} {
      allow read: if request.auth != null && (
                  exists(/databases/$(database)/documents/support_tickets/$(ticketId)) && 
                  get(/databases/$(database)/documents/support_tickets/$(ticketId)).data.userId == request.auth.uid
                  );
      allow write: if request.auth != null && (
                   exists(/databases/$(database)/documents/support_tickets/$(ticketId)) && 
                   get(/databases/$(database)/documents/support_tickets/$(ticketId)).data.userId == request.auth.uid
                   );
    }
  }
}
```

## 5. Firebase Cloud Functions Setup

### 5.1 Initialize Firebase Functions

1. Install Firebase CLI on your development machine:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in your project directory:
   ```
   firebase init
   ```

4. Select "Functions" when prompted for features
5. Select your Firebase project
6. Choose JavaScript or TypeScript
7. Configure ESLint (recommended)
8. Install dependencies when prompted

### 5.2 Implement Core Functions

Create the following Firebase Functions based on the architecture plan:

#### 5.2.1 Authentication Functions

```javascript
// functions/src/auth/onUserCreate.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, phoneNumber, photoURL } = user;
  
  // Create user document in Firestore
  await admin.firestore().collection('users').doc(uid).set({
    uid,
    email: email || null,
    phone: phoneNumber || null,
    displayName: displayName || null,
    profileImageUrl: photoURL || null,
    kycStatus: 'pending',
    accountStatus: 'active',
    twoFactorEnabled: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    notificationPreferences: {
      email: true,
      push: true,
      sms: true
    },
    authProviders: [user.providerData.map(provider => provider.providerId)]
  });
  
  // Create default wallet for user
  await admin.firestore().collection('wallets').add({
    userId: uid,
    balance: 0,
    currency: 'USD',
    isDefault: true,
    dailyLimit: 1000,
    monthlyLimit: 10000,
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Create welcome notification
  await admin.firestore().collection('notifications').add({
    userId: uid,
    type: 'system',
    title: 'Welcome to SawaPay!',
    body: 'Thank you for joining SawaPay. Complete your profile and KYC verification to start sending and receiving money.',
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return null;
});
```

#### 5.2.2 Transaction Functions

```javascript
// functions/src/transactions/createTransaction.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.createTransaction = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to create a transaction.'
    );
  }
  
  const { recipientUserId, amount, description } = data;
  const senderUserId = context.auth.uid;
  
  // Validate input
  if (!recipientUserId || !amount || amount <= 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid transaction details provided.'
    );
  }
  
  // Check if recipient exists
  const recipientDoc = await admin.firestore().collection('users').doc(recipientUserId).get();
  if (!recipientDoc.exists) {
    throw new functions.https.HttpsError(
      'not-found',
      'Recipient user not found.'
    );
  }
  
  // Get sender's wallet
  const senderWalletsQuery = await admin.firestore()
    .collection('wallets')
    .where('userId', '==', senderUserId)
    .where('isDefault', '==', true)
    .limit(1)
    .get();
  
  if (senderWalletsQuery.empty) {
    throw new functions.https.HttpsError(
      'not-found',
      'Sender wallet not found.'
    );
  }
  
  const senderWallet = senderWalletsQuery.docs[0];
  const senderWalletData = senderWallet.data();
  const senderWalletId = senderWallet.id;
  
  // Check if sender has sufficient balance
  if (senderWalletData.balance < amount) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Insufficient balance for this transaction.'
    );
  }
  
  // Get recipient's wallet
  const recipientWalletsQuery = await admin.firestore()
    .collection('wallets')
    .where('userId', '==', recipientUserId)
    .where('isDefault', '==', true)
    .limit(1)
    .get();
  
  if (recipientWalletsQuery.empty) {
    throw new functions.https.HttpsError(
      'not-found',
      'Recipient wallet not found.'
    );
  }
  
  const recipientWallet = recipientWalletsQuery.docs[0];
  const recipientWalletId = recipientWallet.id;
  
  // Create transaction
  const transactionRef = admin.firestore().collection('transactions').doc();
  
  // Use a transaction to ensure data consistency
  await admin.firestore().runTransaction(async (transaction) => {
    // Deduct amount from sender's wallet
    transaction.update(senderWallet.ref, {
      balance: admin.firestore.FieldValue.increment(-amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastTransactionAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Add amount to recipient's wallet
    transaction.update(recipientWallet.ref, {
      balance: admin.firestore.FieldValue.increment(amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastTransactionAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create the transaction record
    transaction.set(transactionRef, {
      transactionId: transactionRef.id,
      type: 'transfer',
      status: 'completed',
      amount: amount,
      currency: 'USD',
      fee: 0,
      senderUserId: senderUserId,
      senderWalletId: senderWalletId,
      recipientUserId: recipientUserId,
      recipientWalletId: recipientWalletId,
      description: description || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  
  // Create activity record for the transaction
  await admin.firestore()
    .collection('transactions')
    .doc(transactionRef.id)
    .collection('activities')
    .add({
      type: 'status_change',
      status: 'completed',
      note: 'Transaction completed successfully',
      performedBy: senderUserId,
      isAdmin: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  
  // Create notification for recipient
  await admin.firestore().collection('notifications').add({
    userId: recipientUserId,
    type: 'transaction',
    title: 'Money Received',
    body: `You have received $${amount.toFixed(2)} from ${senderWalletData.displayName || 'another user'}.`,
    data: {
      transactionId: transactionRef.id
    },
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    relatedEntityType: 'transaction',
    relatedEntityId: transactionRef.id
  });
  
  // Create notification for sender
  await admin.firestore().collection('notifications').add({
    userId: senderUserId,
    type: 'transaction',
    title: 'Money Sent',
    body: `You have sent $${amount.toFixed(2)} to ${recipientDoc.data().displayName || 'another user'}.`,
    data: {
      transactionId: transactionRef.id
    },
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    relatedEntityType: 'transaction',
    relatedEntityId: transactionRef.id
  });
  
  return {
    success: true,
    transactionId: transactionRef.id
  };
});
```

#### 5.2.3 KYC Functions

```javascript
// functions/src/kyc/processKycDocument.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.processKycDocument = functions.firestore
  .document('kyc_documents/{documentId}')
  .onCreate(async (snapshot, context) => {
    const documentData = snapshot.data();
    const documentId = context.params.documentId;
    const userId = documentData.userId;
    
    // Update user's KYC status to under review
    await admin.firestore().collection('users').doc(userId).update({
      kycStatus: 'under_review',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create notification for user
    await admin.firestore().collection('notifications').add({
      userId: userId,
      type: 'kyc',
      title: 'KYC Document Received',
      body: 'Your KYC document has been received and is under review. We will notify you once the verification is complete.',
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      relatedEntityType: 'kyc_document',
      relatedEntityId: documentId
    });
    
    return null;
  });

exports.approveKycDocument = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated and is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to approve KYC documents.'
    );
  }
  
  // Check if user is an admin (this would require custom claims or admin check)
  const adminDoc = await admin.firestore().collection('admin_users').doc(context.auth.uid).get();
  if (!adminDoc.exists) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can approve KYC documents.'
    );
  }
  
  const { documentId, notes } = data;
  
  // Get the document
  const documentRef = admin.firestore().collection('kyc_documents').doc(documentId);
  const documentSnapshot = await documentRef.get();
  
  if (!documentSnapshot.exists) {
    throw new functions.https.HttpsError(
      'not-found',
      'KYC document not found.'
    );
  }
  
  const documentData = documentSnapshot.data();
  const userId = documentData.userId;
  
  // Update document status
  await documentRef.update({
    status: 'approved',
    reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    reviewedBy: context.auth.uid,
    notes: notes || ''
  });
  
  // Update user's KYC status
  await admin.firestore().collection('users').doc(userId).update({
    kycStatus: 'verified',
    kycVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Create notification for user
  await admin.firestore().collection('notifications').add({
    userId: userId,
    type: 'kyc',
    title: 'KYC Verification Approved',
    body: 'Your KYC verification has been approved. You now have full access to all SawaPay features.',
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    relatedEntityType: 'kyc_document',
    relatedEntityId: documentId
  });
  
  return {
    success: true
  };
});

exports.rejectKycDocument = functions.https.onCall(async (data, context) => {
  // Similar implementation to approveKycDocument, but with rejection logic
  // ...
});
```

#### 5.2.4 Notification Functions

```javascript
// functions/src/notifications/sendPushNotification.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.sendPushNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snapshot, context) => {
    const notificationData = snapshot.data();
    const userId = notificationData.userId;
    
    // Get user's FCM tokens
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log(`User ${userId} not found`);
      return null;
    }
    
    const userData = userDoc.data();
    const fcmTokens = userData.fcmTokens || [];
    
    if (fcmTokens.length === 0) {
      console.log(`No FCM tokens found for user ${userId}`);
      return null;
    }
    
    // Check user's notification preferences
    if (!userData.notificationPreferences?.push) {
      console.log(`Push notifications disabled for user ${userId}`);
      return null;
    }
    
    // Prepare notification message
    const message = {
      notification: {
        title: notificationData.title,
        body: notificationData.body
      },
      data: {
        notificationId: context.params.notificationId,
        type: notificationData.type,
        ...(notificationData.data || {})
      },
      tokens: fcmTokens
    };
    
    try {
      // Send the notification
      const response = await admin.messaging().sendMulticast(message);
      console.log(`${response.successCount} messages were sent successfully`);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(fcmTokens[idx]);
          }
        });
        
        // Remove failed tokens from user's FCM tokens
        if (failedTokens.length > 0) {
          const validTokens = fcmTokens.filter(token => !failedTokens.includes(token));
          await admin.firestore().collection('users').doc(userId).update({
            fcmTokens: validTokens
          });
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    
    return null;
  });
```

### 5.3 Deploy Firebase Functions

Deploy the implemented functions to Firebase:

```
firebase deploy --only functions
```

## 6. Firebase Hosting Setup

### 6.1 Configure Hosting

1. In the Firebase console, navigate to "Hosting"
2. Follow the setup instructions if not already set up
3. Configure custom domain if available

### 6.2 Set Up Deployment

1. Create a basic `firebase.json` configuration:

```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

2. Set up GitHub Actions for CI/CD (create `.github/workflows/firebase-hosting-merge.yml`):

```yaml
name: Deploy to Firebase Hosting on merge
'on':
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_SAWAPAY }}'
          channelId: live
          projectId: your-firebase-project-id
```

## 7. Firebase App Configuration

### 7.1 Web Application Configuration

Create a configuration file for the web application:

```javascript
// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
```

### 7.2 Mobile Application Configuration

For React Native, create a similar configuration file:

```javascript
// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
```

## 8. Firebase Admin SDK Setup

For the admin dashboard, set up the Firebase Admin SDK:

```javascript
// src/firebase/adminConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
```

## 9. Firebase Analytics Setup

### 9.1 Configure Analytics

1. In the Firebase console, navigate to "Analytics"
2. Set up Google Analytics if not already configured
3. Configure events to track

### 9.2 Implement Analytics in Applications

For web application:

```javascript
// src/firebase/analytics.js
import { getAnalytics, logEvent } from 'firebase/analytics';
import app from './config';

export const analytics = getAnalytics(app);

export const logCustomEvent = (eventName, eventParams) => {
  logEvent(analytics, eventName, eventParams);
};

export const logPageView = (pageName) => {
  logEvent(analytics, 'page_view', {
    page_title: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
};

export const logLogin = (method) => {
  logEvent(analytics, 'login', {
    method: method
  });
};

export const logTransaction = (transactionId, value, currency) => {
  logEvent(analytics, 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency
  });
};
```

## 10. Testing Firebase Setup

### 10.1 Test Authentication

1. Create a test user account
2. Verify login with different authentication methods
3. Test password reset functionality
4. Test account linking

### 10.2 Test Database Operations

1. Create test documents in each collection
2. Verify security rules are working as expected
3. Test queries with indexes

### 10.3 Test Cloud Functions

1. Trigger functions manually or through the application
2. Verify function execution and results
3. Check error handling

## 11. Monitoring and Maintenance

### 11.1 Set Up Monitoring

1. Configure Firebase Crashlytics
2. Set up performance monitoring
3. Configure alerts for critical issues

### 11.2 Regular Maintenance Tasks

1. Monitor Firebase usage and quotas
2. Regularly backup Firestore data
3. Update security rules as needed
4. Keep Firebase SDKs updated

## 12. Security Best Practices

1. Regularly review and update security rules
2. Implement proper authentication checks in all Cloud Functions
3. Use Firebase App Check to prevent abuse
4. Implement rate limiting for sensitive operations
5. Regularly audit database access patterns
6. Use environment variables for sensitive configuration

This Firebase infrastructure setup guide provides a comprehensive foundation for the SawaPay MVP, covering all required components and best practices for a secure, scalable application.
