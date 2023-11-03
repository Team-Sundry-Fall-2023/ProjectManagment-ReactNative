// Import the necessary Firebase modules at the beginning of your file
import { firebase, auth, database } from './firebase';
import {  ref, orderByChild, query, equalTo, get } from "firebase/database";
import 'firebase/database';

// Define the function to get the user's role from the user table
const getUserRoleFromUserTable = async (email) => {
  try {
    // Reference to the user document in the user table
    console.log('userID' + email);
    const userRef = ref(database,'users');
    console.log('userRef ' + userRef)
    const userQuery = query(ref(database, 'users'), orderByChild('email'),equalTo(email) );
   get(userQuery).then((snapshot) => {
        if (snapshot.exists()) {
          // The snapshot contains the user data matching the email
          const user = snapshot.val();
          console.log('User found:', user.category);
          return user.category;
        } else {
          console.log('User not found.');
          return null;
        }
      }).catch((error) => {
        
        console.error('Error finding user:'+ error);
        return null;
      });
    // // Get the user document
    // const userDoc = await userRef.get();
    // console.log('userDoc ' + userDoc)
    // if (userDoc.exists) {
    //   // Extract the user's role (category field)
    //   const userRole = userDoc.data().category;

    //   return userRole; // Return the user's role
    // } else {
    //   // Handle the case where the user document does not exist
    //   console.error('User document not found for ID:', userId);
    //   return null; // Or you can return a default role or handle it differently
    // }
  } catch (error) {
    // Handle any errors that may occur during the database query
    console.error('Error fetching user role:'+ error);
    return null; // You can return a default role or handle it differently
  }
};


export { getUserRoleFromUserTable }; // Export the function for use in your login component

