# SawaPay MVP - Database Schema Documentation

## Overview

SawaPay uses Firebase Firestore as its primary database. Firestore is a NoSQL document database that allows for flexible, scalable data storage with powerful querying capabilities. This document outlines the database schema design for the SawaPay MVP.

## Collections and Documents

### Users Collection

Stores user profile information and account details.

```
users/{userId}
```

**Fields:**
- `displayName`: String - User's full name
- `email`: String - User's email address
- `phone`: String - User's phone number
- `profileImageUrl`: String (optional) - URL to user's profile image
- `createdAt`: Timestamp - When the account was created
- `updatedAt`: Timestamp - When the account was last updated
- `accountStatus`: String - Status of the account (active, suspended, closed)
- `kycStatus`: String - KYC verification status (pending, verified, rejected)
- `kycVerifiedAt`: Timestamp (optional) - When KYC was verified
- `lastLoginAt`: Timestamp - When user last logged in
- `preferredLanguage`: String - User's preferred language
- `notificationSettings`: Map
  - `email`: Boolean - Email notifications enabled
  - `push`: Boolean - Push notifications enabled
  - `sms`: Boolean - SMS notifications enabled
- `deviceTokens`: Array - List of FCM tokens for push notifications
- `twoFactorEnabled`: Boolean - Whether 2FA is enabled

**Indexes:**
- `email` (ASC)
- `phone` (ASC)
- `createdAt` (DESC)
- `accountStatus` (ASC), `createdAt` (DESC)
- `kycStatus` (ASC), `createdAt` (DESC)

### Wallets Collection

Stores user wallet information and balances.

```
wallets/{walletId}
```

**Fields:**
- `userId`: String - Reference to user who owns the wallet
- `currency`: String - Currency code (USD, EUR, etc.)
- `balance`: Number - Current balance
- `availableBalance`: Number - Balance available for transactions
- `pendingBalance`: Number - Balance pending clearance
- `isActive`: Boolean - Whether wallet is active
- `createdAt`: Timestamp - When wallet was created
- `updatedAt`: Timestamp - When wallet was last updated
- `lastTransactionAt`: Timestamp (optional) - When last transaction occurred
- `dailyLimit`: Number - Maximum daily transaction limit
- `monthlyLimit`: Number - Maximum monthly transaction limit
- `walletType`: String - Type of wallet (personal, business)

**Indexes:**
- `userId` (ASC), `currency` (ASC)
- `userId` (ASC), `updatedAt` (DESC)
- `currency` (ASC), `balance` (DESC)

### Transactions Collection

Records all financial transactions in the system.

```
transactions/{transactionId}
```

**Fields:**
- `type`: String - Transaction type (transfer, deposit, withdrawal)
- `senderUserId`: String - User ID of sender
- `recipientUserId`: String - User ID of recipient
- `senderWalletId`: String - Wallet ID of sender
- `recipientWalletId`: String - Wallet ID of recipient
- `amount`: Number - Transaction amount
- `fee`: Number - Fee charged for transaction
- `netAmount`: Number - Net amount after fees
- `currency`: String - Currency code
- `description`: String - Transaction description
- `reference`: String - Unique reference code
- `status`: String - Transaction status (pending, completed, failed, reversed)
- `createdAt`: Timestamp - When transaction was created
- `updatedAt`: Timestamp - When transaction was last updated
- `completedAt`: Timestamp (optional) - When transaction was completed
- `failureReason`: String (optional) - Reason for failure if status is failed
- `metadata`: Map - Additional transaction metadata

**Subcollections:**
- `activities` - Logs all activities related to the transaction

**Indexes:**
- `senderUserId` (ASC), `createdAt` (DESC)
- `recipientUserId` (ASC), `createdAt` (DESC)
- `status` (ASC), `createdAt` (DESC)
- `createdAt` (DESC)
- `type` (ASC), `createdAt` (DESC)

### Transaction Activities Subcollection

Logs all activities related to a transaction.

```
transactions/{transactionId}/activities/{activityId}
```

**Fields:**
- `type`: String - Activity type (created, updated, completed, failed)
- `timestamp`: Timestamp - When activity occurred
- `performedBy`: String (optional) - User ID who performed the activity
- `data`: Map - Activity-specific data

### KYC Documents Collection

Stores KYC verification documents submitted by users.

```
kyc_documents/{documentId}
```

**Fields:**
- `userId`: String - User who submitted the document
- `type`: String - Document type (id_card, passport, driver_license, selfie)
- `documentUrl`: String - URL to stored document
- `status`: String - Verification status (pending, approved, rejected)
- `submittedAt`: Timestamp - When document was submitted
- `updatedAt`: Timestamp - When document status was last updated
- `reviewedBy`: String (optional) - Admin who reviewed the document
- `reviewedAt`: Timestamp (optional) - When document was reviewed
- `rejectionReason`: String (optional) - Reason for rejection if status is rejected
- `expiryDate`: Timestamp (optional) - Document expiry date
- `metadata`: Map - Additional document metadata

**Indexes:**
- `userId` (ASC), `submittedAt` (DESC)
- `status` (ASC), `submittedAt` (ASC)
- `type` (ASC), `status` (ASC)

### Notifications Collection

Stores user notifications.

```
notifications/{notificationId}
```

**Fields:**
- `userId`: String - User the notification is for
- `type`: String - Notification type (transaction, system, kyc, security)
- `title`: String - Notification title
- `body`: String - Notification body
- `data`: Map - Additional notification data
- `isRead`: Boolean - Whether notification has been read
- `createdAt`: Timestamp - When notification was created
- `expiresAt`: Timestamp (optional) - When notification expires
- `priority`: String - Notification priority (low, normal, high)
- `actionUrl`: String (optional) - URL to navigate to when notification is clicked

**Indexes:**
- `userId` (ASC), `createdAt` (DESC)
- `userId` (ASC), `isRead` (ASC), `createdAt` (DESC)
- `userId` (ASC), `type` (ASC), `createdAt` (DESC)

### Support Tickets Collection

Manages customer support tickets.

```
support_tickets/{ticketId}
```

**Fields:**
- `userId`: String - User who created the ticket
- `subject`: String - Ticket subject
- `category`: String - Ticket category
- `status`: String - Ticket status (open, in_progress, resolved, closed)
- `priority`: String - Ticket priority (low, normal, high)
- `createdAt`: Timestamp - When ticket was created
- `updatedAt`: Timestamp - When ticket was last updated
- `resolvedAt`: Timestamp (optional) - When ticket was resolved
- `assignedTo`: String (optional) - Admin assigned to the ticket
- `lastMessageAt`: Timestamp - When last message was sent

**Subcollections:**
- `messages` - Contains all messages in the ticket thread

**Indexes:**
- `userId` (ASC), `updatedAt` (DESC)
- `status` (ASC), `updatedAt` (DESC)
- `assignedTo` (ASC), `status` (ASC), `updatedAt` (DESC)

### Support Ticket Messages Subcollection

Contains all messages in a support ticket thread.

```
support_tickets/{ticketId}/messages/{messageId}
```

**Fields:**
- `senderId`: String - User or admin who sent the message
- `isAdmin`: Boolean - Whether sender is an admin
- `content`: String - Message content
- `attachments`: Array - List of attachment URLs
- `createdAt`: Timestamp - When message was sent
- `isRead`: Boolean - Whether message has been read

### Admin Users Collection

Stores admin user information.

```
admin_users/{adminId}
```

**Fields:**
- `email`: String - Admin email address
- `displayName`: String - Admin name
- `role`: String - Admin role (admin, super_admin)
- `permissions`: Array - List of permissions
- `createdAt`: Timestamp - When admin account was created
- `updatedAt`: Timestamp - When admin account was last updated
- `lastLoginAt`: Timestamp - When admin last logged in
- `isActive`: Boolean - Whether admin account is active

**Indexes:**
- `email` (ASC)
- `role` (ASC)
- `isActive` (ASC)

### Content Collection

Stores CMS content.

```
content/{contentId}
```

**Fields:**
- `title`: String - Content title
- `body`: String - Content body (HTML)
- `type`: String - Content type (terms, privacy, about, faq)
- `version`: Number - Content version
- `isPublished`: Boolean - Whether content is published
- `createdAt`: Timestamp - When content was created
- `updatedAt`: Timestamp - When content was last updated
- `updatedBy`: String - Admin who last updated the content
- `publishedAt`: Timestamp (optional) - When content was published
- `metadata`: Map - Additional content metadata

**Subcollections:**
- `items` - For content types that have multiple items (like FAQ)

### Content Items Subcollection

For content types that have multiple items (like FAQ).

```
content/{contentId}/items/{itemId}
```

**Fields:**
- `question`: String - Question (for FAQ)
- `answer`: String - Answer (for FAQ)
- `order`: Number - Display order
- `category`: String - Item category
- `isPublished`: Boolean - Whether item is published
- `createdAt`: Timestamp - When item was created
- `updatedAt`: Timestamp - When item was last updated
- `updatedBy`: String - Admin who last updated the item

## Security Rules

### Basic Rules

```
service cloud.firestore {
  match /databases/{database}/documents {
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Check if user is accessing their own data
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Check if user is an admin
    function isAdmin() {
      return isAuthenticated() && exists(/databases/$(database)/documents/admin_users/$(request.auth.uid));
    }
    
    // Check if user has completed KYC
    function hasCompletedKYC() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.kycStatus == "verified";
    }
  }
}
```

### User Data Rules

```
match /users/{userId} {
  // Users can read and update their own profiles
  // Admins can read and update any profile
  allow read: if isOwner(userId) || isAdmin();
  allow create: if isAuthenticated() && request.auth.uid == userId;
  allow update: if isOwner(userId) || isAdmin();
  allow delete: if isAdmin();
}
```

### Wallet Rules

```
match /wallets/{walletId} {
  // Users can read their own wallets
  // Only Cloud Functions can create/update wallets
  // Admins can read any wallet
  allow read: if isOwner(resource.data.userId) || isAdmin();
  allow create, update, delete: if false; // Only via Cloud Functions
}
```

### Transaction Rules

```
match /transactions/{transactionId} {
  // Users can read transactions they're involved in
  // Only Cloud Functions can create/update transactions
  // Admins can read any transaction
  allow read: if isOwner(resource.data.senderUserId) || 
              isOwner(resource.data.recipientUserId) || 
              isAdmin();
  allow create, update, delete: if false; // Only via Cloud Functions
  
  match /activities/{activityId} {
    allow read: if isOwner(get(/databases/$(database)/documents/transactions/$(transactionId)).data.senderUserId) || 
                isOwner(get(/databases/$(database)/documents/transactions/$(transactionId)).data.recipientUserId) || 
                isAdmin();
    allow create, update, delete: if false; // Only via Cloud Functions
  }
}
```

### KYC Document Rules

```
match /kyc_documents/{documentId} {
  // Users can read and create their own KYC documents
  // Only admins can update KYC document status
  allow read: if isOwner(resource.data.userId) || isAdmin();
  allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
  allow update: if isAdmin();
  allow delete: if false;
}
```

### Notification Rules

```
match /notifications/{notificationId} {
  // Users can read and update their own notifications
  // Only Cloud Functions can create notifications
  allow read: if isOwner(resource.data.userId);
  allow update: if isOwner(resource.data.userId) && 
                request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isRead']);
  allow create, delete: if false; // Only via Cloud Functions
}
```

### Support Ticket Rules

```
match /support_tickets/{ticketId} {
  // Users can read and create their own support tickets
  // Admins can read and update any ticket
  allow read: if isOwner(resource.data.userId) || isAdmin();
  allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
  allow update: if isAdmin() || 
                (isOwner(resource.data.userId) && 
                 request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']) && 
                 request.resource.data.status == 'closed');
  allow delete: if false;
  
  match /messages/{messageId} {
    allow read: if isOwner(get(/databases/$(database)/documents/support_tickets/$(ticketId)).data.userId) || 
                isAdmin();
    allow create: if isOwner(get(/databases/$(database)/documents/support_tickets/$(ticketId)).data.userId) || 
                  isAdmin();
    allow update, delete: if false;
  }
}
```

### Admin User Rules

```
match /admin_users/{adminId} {
  // Only admins can read admin user data
  // Only super admins can create/update/delete admin users
  allow read: if isAdmin();
  allow create, update, delete: if isAdmin() && 
                                get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.role == "super_admin";
}
```

### Content Rules

```
match /content/{contentId} {
  // Anyone can read published content
  // Only admins can create/update content
  allow read: if resource.data.isPublished || isAdmin();
  allow create, update, delete: if isAdmin();
  
  match /items/{itemId} {
    allow read: if resource.data.isPublished || isAdmin();
    allow create, update, delete: if isAdmin();
  }
}
```

## Data Relationships

### User Relationships

- One user can have multiple wallets (1:N)
- One user can have multiple KYC documents (1:N)
- One user can have multiple notifications (1:N)
- One user can have multiple support tickets (1:N)
- One user can be involved in multiple transactions (M:N)

### Transaction Relationships

- One transaction involves two users (sender and recipient)
- One transaction involves two wallets (sender and recipient)
- One transaction can have multiple activities (1:N)

### Support Ticket Relationships

- One support ticket belongs to one user (N:1)
- One support ticket can have multiple messages (1:N)
- One support ticket can be assigned to one admin (N:1)

## Data Validation

### User Data Validation

- Email must be a valid email format
- Phone must be a valid phone number format
- Account status must be one of: active, suspended, closed
- KYC status must be one of: pending, verified, rejected

### Wallet Data Validation

- Balance must be a non-negative number
- Currency must be a valid currency code
- Daily and monthly limits must be positive numbers

### Transaction Data Validation

- Amount must be a positive number
- Fee must be a non-negative number
- Status must be one of: pending, completed, failed, reversed
- Type must be one of: transfer, deposit, withdrawal

## Data Migration Strategies

### Version Management

- Use document versioning for schema changes
- Include a `schemaVersion` field in documents
- Migrate data incrementally using Cloud Functions

### Backward Compatibility

- Design schema changes to be backward compatible
- Use optional fields for new data
- Deprecate fields before removing them

## Performance Considerations

### Query Optimization

- Design indexes based on common query patterns
- Limit query result sizes
- Use composite indexes for complex queries

### Data Denormalization

- Denormalize frequently accessed data
- Store user display names in transactions for quick access
- Store wallet balances separately from transaction history

### Sharding Strategies

- Shard large collections by user ID
- Use subcollections for user-specific data
- Consider time-based sharding for transaction history

## Backup and Recovery

### Backup Strategy

- Use Firebase's automatic backups
- Implement custom export scripts for critical data
- Store backups in multiple geographic locations

### Recovery Procedures

- Document step-by-step recovery procedures
- Test recovery processes regularly
- Maintain point-in-time recovery capabilities

## Conclusion

This database schema is designed to support all the features of the SawaPay MVP while maintaining scalability, security, and performance. As the application evolves, the schema can be extended to support additional features and use cases.
