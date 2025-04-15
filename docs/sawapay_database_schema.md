# SawaPay MVP Database Schema

This document outlines the detailed database schema for the SawaPay MVP using Firebase Firestore. The schema is designed to support all required features while maintaining scalability, security, and performance.

## Firestore Collections Overview

Firestore is a NoSQL document database that organizes data into collections and documents. For SawaPay, we'll use the following collections:

1. `users` - User profiles and account information
2. `wallets` - User wallet information and balances
3. `transactions` - Money transfer records between users
4. `kyc_documents` - KYC verification documents and status
5. `notifications` - User notifications
6. `support_tickets` - Customer support requests
7. `content` - CMS content for terms, FAQs, etc.
8. `admin_users` - Admin user accounts and permissions

## Collection Schemas

### Users Collection

```
users/{userId}
```

| Field | Type | Description |
|-------|------|-------------|
| uid | string | User ID (matches Firebase Auth UID) |
| email | string | User's email address |
| phone | string | User's phone number |
| displayName | string | User's display name |
| firstName | string | User's first name |
| lastName | string | User's last name |
| profileImageUrl | string | URL to profile image in Firebase Storage |
| dateOfBirth | timestamp | User's date of birth |
| address | map | User's address information |
| address.street | string | Street address |
| address.city | string | City |
| address.state | string | State/Province |
| address.country | string | Country |
| address.postalCode | string | Postal/ZIP code |
| kycStatus | string | KYC verification status (pending, verified, rejected) |
| kycVerifiedAt | timestamp | When KYC was verified (null if not verified) |
| twoFactorEnabled | boolean | Whether 2FA is enabled |
| twoFactorMethod | string | 2FA method (sms, app) |
| accountStatus | string | Account status (active, suspended, closed) |
| createdAt | timestamp | Account creation timestamp |
| updatedAt | timestamp | Last update timestamp |
| lastLoginAt | timestamp | Last login timestamp |
| notificationPreferences | map | User notification preferences |
| notificationPreferences.email | boolean | Email notifications enabled |
| notificationPreferences.push | boolean | Push notifications enabled |
| notificationPreferences.sms | boolean | SMS notifications enabled |
| authProviders | array | List of linked auth providers (email, google, apple, phone) |

### Wallets Collection

```
wallets/{walletId}
```

| Field | Type | Description |
|-------|------|-------------|
| walletId | string | Unique wallet ID |
| userId | string | Owner's user ID (reference to users collection) |
| balance | number | Current wallet balance |
| currency | string | Currency code (e.g., USD) |
| isDefault | boolean | Whether this is the user's default wallet |
| dailyLimit | number | Daily transaction limit |
| monthlyLimit | number | Monthly transaction limit |
| status | string | Wallet status (active, frozen, closed) |
| createdAt | timestamp | Wallet creation timestamp |
| updatedAt | timestamp | Last update timestamp |
| lastTransactionAt | timestamp | Last transaction timestamp |

### Transactions Collection

```
transactions/{transactionId}
```

| Field | Type | Description |
|-------|------|-------------|
| transactionId | string | Unique transaction ID |
| type | string | Transaction type (transfer, deposit, withdrawal, request) |
| status | string | Transaction status (pending, completed, failed, cancelled) |
| amount | number | Transaction amount |
| currency | string | Currency code |
| fee | number | Transaction fee (if any) |
| senderUserId | string | Sender's user ID |
| senderWalletId | string | Sender's wallet ID |
| recipientUserId | string | Recipient's user ID |
| recipientWalletId | string | Recipient's wallet ID |
| description | string | Transaction description/note |
| createdAt | timestamp | Transaction creation timestamp |
| updatedAt | timestamp | Last status update timestamp |
| completedAt | timestamp | When transaction was completed (null if not completed) |
| failureReason | string | Reason for failure (if status is failed) |
| reference | string | External reference number (for deposits/withdrawals) |

#### Transaction Subcollections

```
transactions/{transactionId}/activities/{activityId}
```

| Field | Type | Description |
|-------|------|-------------|
| activityId | string | Unique activity ID |
| type | string | Activity type (status_change, note_added) |
| status | string | New transaction status (for status_change) |
| note | string | Activity note |
| performedBy | string | User ID who performed the activity |
| isAdmin | boolean | Whether performed by admin |
| timestamp | timestamp | Activity timestamp |

### KYC Documents Collection

```
kyc_documents/{documentId}
```

| Field | Type | Description |
|-------|------|-------------|
| documentId | string | Unique document ID |
| userId | string | User ID (reference to users collection) |
| type | string | Document type (id_card, passport, driver_license, selfie) |
| status | string | Verification status (pending, approved, rejected) |
| documentUrl | string | URL to document in Firebase Storage |
| documentNumber | string | ID/passport/license number |
| expiryDate | timestamp | Document expiry date |
| issuingCountry | string | Country that issued the document |
| submittedAt | timestamp | Submission timestamp |
| reviewedAt | timestamp | Review timestamp |
| reviewedBy | string | Admin user ID who reviewed the document |
| rejectionReason | string | Reason for rejection (if rejected) |
| notes | string | Admin notes |

### Notifications Collection

```
notifications/{notificationId}
```

| Field | Type | Description |
|-------|------|-------------|
| notificationId | string | Unique notification ID |
| userId | string | Recipient user ID |
| type | string | Notification type (transaction, kyc, security, system) |
| title | string | Notification title |
| body | string | Notification body |
| data | map | Additional notification data |
| isRead | boolean | Whether notification has been read |
| createdAt | timestamp | Creation timestamp |
| readAt | timestamp | When notification was read (null if unread) |
| relatedEntityType | string | Related entity type (transaction, kyc_document) |
| relatedEntityId | string | ID of related entity |

### Support Tickets Collection

```
support_tickets/{ticketId}
```

| Field | Type | Description |
|-------|------|-------------|
| ticketId | string | Unique ticket ID |
| userId | string | User ID who created the ticket |
| subject | string | Ticket subject |
| status | string | Ticket status (open, in_progress, resolved, closed) |
| priority | string | Ticket priority (low, medium, high) |
| category | string | Ticket category (account, transaction, technical) |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |
| resolvedAt | timestamp | When ticket was resolved (null if not resolved) |
| assignedTo | string | Admin user ID assigned to the ticket |

#### Support Ticket Messages Subcollection

```
support_tickets/{ticketId}/messages/{messageId}
```

| Field | Type | Description |
|-------|------|-------------|
| messageId | string | Unique message ID |
| senderId | string | User ID who sent the message |
| isAdmin | boolean | Whether sender is admin |
| content | string | Message content |
| attachments | array | Array of attachment URLs |
| createdAt | timestamp | Message timestamp |
| isRead | boolean | Whether message has been read |

### Content Collection

```
content/{contentId}
```

| Field | Type | Description |
|-------|------|-------------|
| contentId | string | Unique content ID (e.g., terms_of_service, privacy_policy) |
| title | string | Content title |
| body | string | Content body (HTML) |
| version | number | Content version number |
| publishedAt | timestamp | When content was published |
| updatedAt | timestamp | Last update timestamp |
| updatedBy | string | Admin user ID who updated the content |
| isPublished | boolean | Whether content is published |

#### FAQ Subcollection

```
content/faq/items/{faqId}
```

| Field | Type | Description |
|-------|------|-------------|
| faqId | string | Unique FAQ item ID |
| question | string | FAQ question |
| answer | string | FAQ answer (HTML) |
| category | string | FAQ category |
| order | number | Display order |
| isPublished | boolean | Whether FAQ item is published |
| updatedAt | timestamp | Last update timestamp |
| updatedBy | string | Admin user ID who updated the item |

### Admin Users Collection

```
admin_users/{adminId}
```

| Field | Type | Description |
|-------|------|-------------|
| adminId | string | Admin user ID (matches Firebase Auth UID) |
| email | string | Admin email address |
| displayName | string | Admin display name |
| role | string | Admin role (super_admin, admin, support, viewer) |
| permissions | array | Array of permission strings |
| isActive | boolean | Whether admin account is active |
| lastLoginAt | timestamp | Last login timestamp |
| createdAt | timestamp | Account creation timestamp |
| createdBy | string | Admin who created this admin account |

## Indexes

To support efficient queries, the following composite indexes will be required:

### Transactions Collection Indexes

1. `[senderUserId, createdAt DESC]` - For listing user's sent transactions
2. `[recipientUserId, createdAt DESC]` - For listing user's received transactions
3. `[status, createdAt DESC]` - For filtering transactions by status
4. `[senderUserId, status, createdAt DESC]` - For filtering user's sent transactions by status
5. `[recipientUserId, status, createdAt DESC]` - For filtering user's received transactions by status

### KYC Documents Collection Indexes

1. `[status, submittedAt ASC]` - For listing pending KYC documents in order of submission
2. `[userId, type]` - For finding specific document types for a user

### Notifications Collection Indexes

1. `[userId, isRead, createdAt DESC]` - For listing user's unread notifications
2. `[userId, createdAt DESC]` - For listing all user's notifications

### Support Tickets Collection Indexes

1. `[status, createdAt ASC]` - For listing tickets by status
2. `[userId, status, createdAt DESC]` - For listing user's tickets by status
3. `[assignedTo, status, priority DESC]` - For listing tickets assigned to specific admin

## Security Rules

Firestore security rules will be implemented to ensure data security:

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

## Data Validation

Data validation will be implemented at multiple levels:

1. **Client-side validation**: Form validation in web and mobile apps
2. **Firebase Functions validation**: Server-side validation before writing to Firestore
3. **Firestore Security Rules**: Additional validation in security rules

## Data Relationships

The schema uses document references to establish relationships between collections:

1. User → Wallet (one-to-many): A user can have multiple wallets
2. User → Transactions (one-to-many): A user can have multiple transactions
3. User → KYC Documents (one-to-many): A user can submit multiple KYC documents
4. User → Notifications (one-to-many): A user can have multiple notifications
5. User → Support Tickets (one-to-many): A user can create multiple support tickets
6. Support Ticket → Messages (one-to-many): A ticket can have multiple messages

## Scalability Considerations

The schema is designed with scalability in mind:

1. **Denormalization**: Strategic duplication of data to minimize joins
2. **Subcollections**: Used for one-to-many relationships with high volume
3. **Composite Indexes**: Defined for common query patterns
4. **Sharding**: Collection structure allows for future sharding if needed

## Data Migration Strategy

For future migrations, the following strategies will be employed:

1. **Version Fields**: Track schema versions for documents
2. **Migration Functions**: Cloud Functions to update documents to new schema
3. **Backward Compatibility**: Maintain compatibility with older schema versions during migration

This database schema provides a solid foundation for the SawaPay MVP while allowing for future growth and feature expansion.
