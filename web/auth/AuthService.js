// AuthService.js
// This service handles all authentication-related functionality for SawaPay

import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  RecaptchaVerifier,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  linkWithCredential,
  linkWithPopup,
  unlink,
  updateEmail,
  signOut
} from 'firebase/auth';

class AuthService {
  constructor() {
    this.auth = getAuth();
    this.googleProvider = new GoogleAuthProvider();
    this.appleProvider = new OAuthProvider('apple.com');
    
    // Configure Google provider
    this.googleProvider.addScope('profile');
    this.googleProvider.addScope('email');
    
    // Configure Apple provider
    this.appleProvider.addScope('email');
    this.appleProvider.addScope('name');
  }

  // Email/Password Authentication
  
  /**
   * Register a new user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} displayName - User's display name
   * @returns {Promise} - Firebase user credential
   */
  async registerWithEmailPassword(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      return userCredential;
    } catch (error) {
      console.error('Error registering with email/password:', error);
      throw error;
    }
  }
  
  /**
   * Sign in with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Firebase user credential
   */
  async signInWithEmailPassword(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Error signing in with email/password:', error);
      throw error;
    }
  }
  
  /**
   * Send password reset email
   * @param {string} email - User's email
   * @returns {Promise} - Void
   */
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
  
  /**
   * Update user's password
   * @param {string} currentPassword - User's current password
   * @param {string} newPassword - User's new password
   * @returns {Promise} - Void
   */
  async updateUserPassword(currentPassword, newPassword) {
    try {
      const user = this.auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
  
  // Google Authentication
  
  /**
   * Sign in with Google
   * @returns {Promise} - Firebase user credential
   */
  async signInWithGoogle() {
    try {
      const userCredential = await signInWithPopup(this.auth, this.googleProvider);
      return userCredential;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }
  
  /**
   * Link current user account with Google
   * @returns {Promise} - Firebase user credential
   */
  async linkWithGoogle() {
    try {
      const user = this.auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      const userCredential = await linkWithPopup(user, this.googleProvider);
      return userCredential;
    } catch (error) {
      console.error('Error linking with Google:', error);
      throw error;
    }
  }
  
  // Apple Authentication
  
  /**
   * Sign in with Apple
   * @returns {Promise} - Firebase user credential
   */
  async signInWithApple() {
    try {
      const userCredential = await signInWithPopup(this.auth, this.appleProvider);
      return userCredential;
    } catch (error) {
      console.error('Error signing in with Apple:', error);
      throw error;
    }
  }
  
  /**
   * Link current user account with Apple
   * @returns {Promise} - Firebase user credential
   */
  async linkWithApple() {
    try {
      const user = this.auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      const userCredential = await linkWithPopup(user, this.appleProvider);
      return userCredential;
    } catch (error) {
      console.error('Error linking with Apple:', error);
      throw error;
    }
  }
  
  // Phone Authentication
  
  /**
   * Initialize phone authentication with reCAPTCHA
   * @param {string} elementId - DOM element ID for reCAPTCHA container
   * @returns {Object} - RecaptchaVerifier instance
   */
  initPhoneAuth(elementId) {
    try {
      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, elementId, {
        'size': 'normal',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
        }
      });
      
      return this.recaptchaVerifier;
    } catch (error) {
      console.error('Error initializing phone auth:', error);
      throw error;
    }
  }
  
  /**
   * Initialize invisible phone authentication with reCAPTCHA
   * @returns {Object} - RecaptchaVerifier instance
   */
  initInvisiblePhoneAuth() {
    try {
      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, 'recaptcha-container-invisible', {
        'size': 'invisible'
      });
      
      return this.recaptchaVerifier;
    } catch (error) {
      console.error('Error initializing invisible phone auth:', error);
      throw error;
    }
  }
  
  /**
   * Send verification code to phone number
   * @param {string} phoneNumber - User's phone number (with country code)
   * @param {Object} recaptchaVerifier - RecaptchaVerifier instance
   * @returns {Promise} - Confirmation result
   */
  async sendPhoneVerificationCode(phoneNumber, recaptchaVerifier) {
    try {
      const verifier = recaptchaVerifier || this.recaptchaVerifier;
      
      if (!verifier) {
        throw new Error('RecaptchaVerifier not initialized');
      }
      
      const confirmationResult = await signInWithPhoneNumber(this.auth, phoneNumber, verifier);
      return confirmationResult;
    } catch (error) {
      console.error('Error sending phone verification code:', error);
      throw error;
    }
  }
  
  /**
   * Verify phone number with code
   * @param {Object} confirmationResult - Confirmation result from sendPhoneVerificationCode
   * @param {string} verificationCode - Verification code received by user
   * @returns {Promise} - Firebase user credential
   */
  async verifyPhoneCode(confirmationResult, verificationCode) {
    try {
      const userCredential = await confirmationResult.confirm(verificationCode);
      return userCredential;
    } catch (error) {
      console.error('Error verifying phone code:', error);
      throw error;
    }
  }
  
  /**
   * Link current user account with phone number
   * @param {string} phoneNumber - User's phone number (with country code)
   * @param {Object} recaptchaVerifier - RecaptchaVerifier instance
   * @returns {Promise} - Confirmation result for later verification
   */
  async linkWithPhone(phoneNumber, recaptchaVerifier) {
    try {
      const user = this.auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      const verifier = recaptchaVerifier || this.recaptchaVerifier;
      
      if (!verifier) {
        throw new Error('RecaptchaVerifier not initialized');
      }
      
      const confirmationResult = await signInWithPhoneNumber(this.auth, phoneNumber, verifier);
      
      // Store for later use in verifyPhoneCodeForLink
      this.phoneConfirmationResult = confirmationResult;
      
      return confirmationResult;
    } catch (error) {
      console.error('Error linking with phone:', error);
      throw error;
    }
  }
  
  /**
   * Verify phone code for linking
   * @param {string} verificationCode - Verification code received by user
   * @returns {Promise} - Firebase user credential
   */
  async verifyPhoneCodeForLink(verificationCode) {
    try {
      if (!this.phoneConfirmationResult) {
        throw new Error('No phone confirmation result found');
      }
      
      const credential = PhoneAuthProvider.credential(
        this.phoneConfirmationResult.verificationId, 
        verificationCode
      );
      
      const user = this.auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      const userCredential = await linkWithCredential(user, credential);
      return userCredential;
    } catch (error) {
      console.error('Error verifying phone code for link:', error);
      throw error;
    }
  }
  
  // User Profile Management
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} - Void
   */
  async updateUserProfile(profileData) {
    try {
      const user = this.auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      await updateProfile(user, profileData);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Update user email
   * @param {string} newEmail - New email address
   * @param {string} password - Current password for verification
   * @returns {Promise} - Void
   */
  async updateUserEmail(newEmail, password) {
    try {
      const user = this.auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      // Re-authenticate user before changing email
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Update email
      await updateEmail(user, newEmail);
      
      // Send verification email
      await sendEmailVerification(user);
      
      return true;
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }
  
  /**
   * Unlink authentication provider
   * @param {string} providerId - Provider ID to unlink
   * @returns {Promise} - Updated user
   */
  async unlinkProvider(providerId) {
    try {
      const user = this.auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      // Check if user has multiple providers before unlinking
      if (user.providerData.length <= 1) {
        throw new Error('Cannot unlink the only authentication provider');
      }
      
      const updatedUser = await unlink(user, providerId);
      return updatedUser;
    } catch (error) {
      console.error('Error unlinking provider:', error);
      throw error;
    }
  }
  
  // Session Management
  
  /**
   * Get current user
   * @returns {Object|null} - Current user or null if not signed in
   */
  getCurrentUser() {
    return this.auth.currentUser;
  }
  
  /**
   * Check if user is signed in
   * @returns {boolean} - True if user is signed in
   */
  isUserSignedIn() {
    return !!this.auth.currentUser;
  }
  
  /**
   * Sign out current user
   * @returns {Promise} - Void
   */
  async signOutUser() {
    try {
      await signOut(this.auth);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
  
  /**
   * Set up authentication state observer
   * @param {Function} callback - Callback function with user parameter
   * @returns {Function} - Unsubscribe function
   */
  onAuthStateChanged(callback) {
    return this.auth.onAuthStateChanged(callback);
  }
  
  /**
   * Get user token for API calls
   * @param {boolean} forceRefresh - Force token refresh
   * @returns {Promise} - ID token
   */
  async getUserToken(forceRefresh = false) {
    try {
      const user = this.auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      const token = await user.getIdToken(forceRefresh);
      return token;
    } catch (error) {
      console.error('Error getting user token:', error);
      throw error;
    }
  }
  
  // Two-Factor Authentication
  
  /**
   * Enroll user in two-factor authentication
   * This is a placeholder as Firebase doesn't directly support 2FA management
   * In a real implementation, this would be handled through Cloud Functions
   * @param {string} method - 2FA method (sms, app)
   * @returns {Promise} - Success status
   */
  async enrollTwoFactor(method) {
    try {
      // This would call a Cloud Function to update user's 2FA settings
      // For now, we'll just return a placeholder
      console.log(`Enrolling user in 2FA with method: ${method}`);
      return { success: true, method };
    } catch (error) {
      console.error('Error enrolling in 2FA:', error);
      throw error;
    }
  }
  
  /**
   * Disable two-factor authentication
   * This is a placeholder as Firebase doesn't directly support 2FA management
   * In a real implementation, this would be handled through Cloud Functions
   * @returns {Promise} - Success status
   */
  async disableTwoFactor() {
    try {
      // This would call a Cloud Function to update user's 2FA settings
      // For now, we'll just return a placeholder
      console.log('Disabling 2FA for user');
      return { success: true };
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  }
}

export default new AuthService();
