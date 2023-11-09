import { firebase, auth, database } from './firebase';
import {  ref, orderByChild, query, equalTo, get } from "firebase/database";
import 'firebase/database';

const getUserRoleFromUserTable = async (email) => {
  try {
    console.log('userID' + email);
    const userRef = ref(database,'users');
    console.log('userRef ' + userRef)
    const userQuery = query(ref(database, 'users'), orderByChild('email'),equalTo(email) );
   get(userQuery).then((snapshot) => {
        if (snapshot.exists()) {
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
  } catch (error) {
    console.error('Error fetching user role:'+ error);
    return null;
  }
};


export { getUserRoleFromUserTable };

