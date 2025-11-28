import { accountClient, databaseClient, DATABASE_ID, COLLECTIONS } from "./settings.config";
import { Query } from "appwrite";

/**
 * Get current user's full profile including role
 */
export async function getCurrentUserProfile() {
  try {
    // Get account info
    const account = await accountClient.get();
    console.log("Account info:", account);
    
    // Try to find user in providers collection by email (since we might not have userId set)
    try {
      const doctorDocs = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOCTORS
      );

      console.log("All provider documents:", doctorDocs.documents);

      // Find by email OR userId
      const doctorProfile = doctorDocs.documents.find(
        doc => doc.email === account.email || doc.userId === account.$id
      );

      if (doctorProfile) {
        console.log("Found provider profile:", doctorProfile);
        return {
          account,
          profile: doctorProfile,
          role: doctorProfile.role || 'provider',
          userType: 'provider'
        };
      }
    } catch (error) {
      console.error('Error checking providers collection:', error);
    }

    // Try to find user in clients collection
    try {
      const patientDocs = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PATIENTS
      );

      const patientProfile = patientDocs.documents.find(
        doc => doc.userId === account.$id || doc.email === account.email
      );

      if (patientProfile) {
        console.log("Found client profile:", patientProfile);
        return {
          account,
          profile: patientProfile,
          role: 'client',
          userType: 'client'
        };
      }
    } catch (error) {
      console.error('Error checking clients collection:', error);
    }

    // User exists in auth but not in any collection
    console.warn("User not found in any collection, defaulting to client role");
    return {
      account,
      profile: null,
      role: 'client',
      userType: 'unknown'
    };

  } catch (error) {
    // Not logged in
    console.error("Not logged in:", error);
    throw error;
  }
}

/**
 * Check if current user is admin
 */
export async function isAdmin() {
  try {
    const userProfile = await getCurrentUserProfile();
    return userProfile.role === 'admin';
  } catch (error) {
    return false;
  }
}

/**
 * Check if current user is a provider
 */
export async function isProvider() {
  try {
    const userProfile = await getCurrentUserProfile();
    return userProfile.role === 'provider' || userProfile.role === 'admin';
  } catch (error) {
    return false;
  }
}

/**
 * Get redirect path based on user role
 */
export function getRoleBasedRedirect(role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'provider':
      return '/provider/dashboard';
    case 'client':
      return '/home';
    default:
      return '/home';
  }
}
