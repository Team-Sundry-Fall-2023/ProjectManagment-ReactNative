// Import the necessary Firebase modules at the beginning of your file
import { firebase } from './firebase';

// Define the function to get the user's role from the user table
const getUserRoleFromUserTable = async (userId) => {
  try {
    // Reference to the user document in the user table
    const userRef = firebase.firestore().collection('users').doc(userId);

    // Get the user document
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // Extract the user's role (category field)
      const userRole = userDoc.data().category;

      return userRole; // Return the user's role
    } else {
      // Handle the case where the user document does not exist
      console.error('User document not found for ID:', userId);
      return null; // Or you can return a default role or handle it differently
    }
  } catch (error) {
    // Handle any errors that may occur during the database query
    console.error('Error fetching user role:', error);
    return null; // You can return a default role or handle it differently
  }
};


export { getUserRoleFromUserTable }; // Export the function for use in your login component

