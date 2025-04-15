# SawaPay MVP - Deployment Instructions

This document provides detailed instructions for deploying the SawaPay MVP application, including the web application, admin dashboard, and mobile apps.

## Prerequisites

Before beginning deployment, ensure you have the following:

- Node.js 16.x or later installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Git installed
- GitHub account with access to the SawaPay repository
- Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Google Play Developer account (for Android deployment)
- Apple Developer account (for iOS deployment)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/sawapay.git
cd sawapay
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install web app dependencies
cd web
npm install
cd ..

# Install admin dashboard dependencies
cd admin
npm install
cd ..

# Install mobile app dependencies
cd mobile
npm install
```

### 3. Configure Firebase

#### Login to Firebase

```bash
firebase login
```

#### Initialize Firebase in the Project

```bash
firebase init
```

Select the following features:
- Firestore
- Functions
- Hosting
- Storage
- Emulators

When prompted, select your Firebase project and follow the configuration steps.

#### Update Firebase Configuration

Copy the Firebase configuration files to their respective locations:

1. Web application: `web/src/firebase/config.js`
2. Admin dashboard: `admin/src/firebase/config.js`
3. Mobile application: `mobile/src/firebase/config.js`

Make sure to update the configuration with the values from your Firebase project.

## Web Application Deployment

### 1. Configure Firebase Hosting

Create or update the `firebase.json` file in the project root with the following configuration:

```json
{
  "hosting": [
    {
      "target": "web",
      "public": "web/build",
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
      ]
    }
  ]
}
```

### 2. Set Up Hosting Target

```bash
firebase target:apply hosting web sawapay-web
```

### 3. Build the Web Application

```bash
cd web
npm run build
cd ..
```

### 4. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting:web
```

### 5. Set Up GitHub Actions for CI/CD

1. Create a `.github/workflows` directory in your repository if it doesn't exist.
2. Copy the `web-deployment.yml` file to this directory.
3. Add the required secrets to your GitHub repository:
   - `FIREBASE_SERVICE_ACCOUNT_STAGING`: Firebase service account JSON for staging
   - `FIREBASE_SERVICE_ACCOUNT_PRODUCTION`: Firebase service account JSON for production

To generate these service account keys:
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file and add its contents to GitHub secrets

## Admin Dashboard Deployment

### 1. Configure Firebase Hosting for Admin

Update the `firebase.json` file to include the admin target:

```json
{
  "hosting": [
    {
      "target": "web",
      "public": "web/build",
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
      ]
    },
    {
      "target": "admin",
      "public": "admin/build",
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
      ]
    }
  ]
}
```

### 2. Set Up Hosting Target for Admin

```bash
firebase target:apply hosting admin sawapay-admin
```

### 3. Build the Admin Dashboard

```bash
cd admin
npm run build
cd ..
```

### 4. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting:admin
```

### 5. Set Up GitHub Actions for CI/CD

1. Copy the `admin-deployment.yml` file to the `.github/workflows` directory.
2. Ensure the required secrets are added to your GitHub repository (same as web application).

## Mobile Application Deployment

### Android Deployment

#### 1. Configure Android Project

1. Update the package name in `mobile/android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.sawapay.app"
    // other config
}
```

2. Generate a signing key:

```bash
keytool -genkey -v -keystore sawapay.keystore -alias sawapay -keyalg RSA -keysize 2048 -validity 10000
```

3. Move the keystore file to `mobile/android/app/sawapay.keystore`

4. Create a `keystore.properties` file in `mobile/android`:

```properties
storeFile=sawapay.keystore
storePassword=your-store-password
keyAlias=sawapay
keyPassword=your-key-password
```

5. Update `mobile/android/app/build.gradle` to use the signing config:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {
    // other config
    
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // other config
        }
    }
}
```

#### 2. Build Android App

```bash
cd mobile
npm run build:android
```

This will generate the APK file at `mobile/android/app/build/outputs/apk/release/app-release.apk`

#### 3. Deploy to Google Play Store

1. Create a new application in the Google Play Console
2. Set up the app details, store listing, and content rating
3. Upload the APK to the internal testing track
4. Add testers and release the app to them

#### 4. Set Up GitHub Actions for CI/CD

1. Copy the `mobile-deployment.yml` file to the `.github/workflows` directory.
2. Add the required secrets to your GitHub repository:
   - `ANDROID_SIGNING_KEY`: Base64-encoded keystore file
   - `ANDROID_ALIAS`: Key alias
   - `ANDROID_KEY_STORE_PASSWORD`: Keystore password
   - `ANDROID_KEY_PASSWORD`: Key password
   - `FIREBASE_ANDROID_APP_ID`: Firebase Android app ID
   - `FIREBASE_SERVICE_ACCOUNT_DISTRIBUTION`: Firebase service account for App Distribution
   - `PLAY_STORE_SERVICE_ACCOUNT_JSON`: Google Play service account JSON

### iOS Deployment

#### 1. Configure iOS Project

1. Open the Xcode project:

```bash
cd mobile/ios
pod install
open SawaPay.xcworkspace
```

2. Update the Bundle Identifier to `com.sawapay.app`
3. Set up signing certificates and provisioning profiles in Xcode

#### 2. Build iOS App

```bash
cd mobile
npm run build:ios
```

This will generate the app in the `mobile/ios/build` directory.

#### 3. Deploy to TestFlight

1. Archive the app in Xcode
2. Upload to App Store Connect
3. Set up TestFlight testing
4. Add testers and release the app to them

#### 4. Set Up GitHub Actions for CI/CD

Ensure the following secrets are added to your GitHub repository:
- `IOS_P12_CERTIFICATE`: Base64-encoded P12 certificate
- `IOS_P12_PASSWORD`: P12 certificate password
- `IOS_PROVISIONING_PROFILE`: Base64-encoded provisioning profile
- `APPSTORE_ISSUER_ID`: App Store Connect issuer ID
- `APPSTORE_API_KEY_ID`: App Store Connect API key ID
- `APPSTORE_API_PRIVATE_KEY`: App Store Connect API private key

## Firebase Cloud Functions Deployment

### 1. Set Up Cloud Functions

```bash
cd functions
npm install
```

### 2. Deploy Cloud Functions

```bash
firebase deploy --only functions
```

### 3. Set Up GitHub Actions for CI/CD

Add the following to your web-deployment.yml file:

```yaml
deploy-functions:
  needs: build-and-test
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  
  steps:
  - uses: actions/checkout@v3
  
  - name: Set up Node.js
    uses: actions/setup-node@v3
    with:
      node-version: '16.x'
      cache: 'npm'
      cache-dependency-path: 'functions/package-lock.json'
  
  - name: Install dependencies
    working-directory: ./functions
    run: npm ci
  
  - name: Deploy to Firebase Functions
    uses: w9jds/firebase-action@master
    with:
      args: deploy --only functions
    env:
      FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## Firestore and Storage Rules Deployment

### 1. Configure Firestore Rules

Create or update `firestore.rules` in the project root:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Basic rules
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && exists(/databases/$(database)/documents/admin_users/$(request.auth.uid));
    }
    
    // User rules
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Add other collection rules as documented in the database schema
  }
}
```

### 2. Configure Storage Rules

Create or update `storage.rules` in the project root:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Basic rules
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && exists(/databases/$(database)/documents/admin_users/$(request.auth.uid));
    }
    
    // Profile images
    match /profile/{userId}/{fileName} {
      allow read: if true;
      allow write: if isOwner(userId) || isAdmin();
    }
    
    // KYC documents
    match /kyc/{userId}/{fileName} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId) || isAdmin();
    }
    
    // Support ticket attachments
    match /support/{ticketId}/{fileName} {
      allow read: if isAuthenticated() && (
        isOwner(resource.data.userId) || isAdmin()
      );
      allow write: if isAuthenticated() && (
        isOwner(resource.data.userId) || isAdmin()
      );
    }
  }
}
```

### 3. Deploy Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

## Environment Configuration

### 1. Set Up Environment Variables

Create `.env` files for each environment:

Web application:
```
# .env.development
REACT_APP_FIREBASE_ENV=development
REACT_APP_API_URL=https://dev-api.sawapay.com

# .env.production
REACT_APP_FIREBASE_ENV=production
REACT_APP_API_URL=https://api.sawapay.com
```

Admin dashboard:
```
# .env.development
REACT_APP_FIREBASE_ENV=development
REACT_APP_API_URL=https://dev-admin-api.sawapay.com

# .env.production
REACT_APP_FIREBASE_ENV=production
REACT_APP_API_URL=https://admin-api.sawapay.com
```

Mobile application:
```
# .env.development
FIREBASE_ENV=development
API_URL=https://dev-api.sawapay.com

# .env.production
FIREBASE_ENV=production
API_URL=https://api.sawapay.com
```

### 2. Configure Firebase Functions Environment Variables

```bash
firebase functions:config:set stripe.key="your-stripe-key" twilio.sid="your-twilio-sid" twilio.token="your-twilio-token"
```

## Post-Deployment Verification

### 1. Verify Web Application

1. Visit your deployed web application URL
2. Test user registration and login
3. Test wallet creation and management
4. Test transaction functionality
5. Test KYC upload
6. Test support ticket creation

### 2. Verify Admin Dashboard

1. Visit your deployed admin dashboard URL
2. Test admin login
3. Test user management features
4. Test KYC approval workflow
5. Test transaction monitoring
6. Test analytics dashboard
7. Test CMS functionality
8. Test support ticket management

### 3. Verify Mobile Application

1. Install the app on test devices
2. Test user registration and login
3. Test all user features
4. Test push notifications
5. Test offline functionality

## Monitoring and Maintenance

### 1. Set Up Firebase Monitoring

1. Enable Firebase Crashlytics for crash reporting
2. Enable Firebase Performance Monitoring
3. Set up Firebase Analytics for user behavior tracking

### 2. Set Up Alerts

Configure Firebase alerts for:
1. Crash rate increases
2. Performance degradation
3. Security rule violations
4. Function errors

### 3. Regular Maintenance Tasks

1. Review and update security rules
2. Monitor database usage and optimize queries
3. Update dependencies regularly
4. Perform regular security audits

## Rollback Procedures

### 1. Web and Admin Rollback

To rollback to a previous version:

```bash
firebase hosting:clone sawapay-web:live sawapay-web:previous-version
firebase hosting:clone sawapay-admin:live sawapay-admin:previous-version
```

### 2. Functions Rollback

```bash
firebase functions:rollback
```

### 3. Mobile App Rollback

For Android:
1. Go to Google Play Console
2. Select your app
3. Go to Release Management > App Releases
4. Select the previous version and roll back

For iOS:
1. Go to App Store Connect
2. Select your app
3. Go to TestFlight
4. Remove the current version and add testers to the previous version

## Conclusion

Following these deployment instructions will ensure a smooth deployment of the SawaPay MVP. Remember to test thoroughly after each deployment and monitor the application for any issues.

For any questions or issues, please contact the development team.
