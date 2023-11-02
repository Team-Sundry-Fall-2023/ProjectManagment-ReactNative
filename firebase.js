import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database'; // or 'firebase/firestore' for Firestore


const firebaseConfig = {
  apiKey: "AIzaSyBqyAn28jQnpBJwvgD1vzHu5NKI0i6ENf0",
  authDomain: "projectmanagement-9f9ce.firebaseapp.com",
  databaseURL: "https://projectmanagement-9f9ce-default-rtdb.firebaseio.com",
  projectId: "projectmanagement-9f9ce",
  storageBucket: "projectmanagement-9f9ce.appspot.com",
  messagingSenderId: "148422738224",
  appId: "1:148422738224:web:e340f2de2619c52a6588f5",
  measurementId: "G-BQWZV9MP97"
};

if (!firebase.apps) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
