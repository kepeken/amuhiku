import * as firebase from 'firebase/app';

import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyBdVOLH_z5N0EEwNIrnAhavb-XaoM3dndk",
  authDomain: "amuhiku-test.firebaseapp.com",
  databaseURL: "https://amuhiku-test.firebaseio.com",
  projectId: "amuhiku-test",
  storageBucket: "amuhiku-test.appspot.com",
  messagingSenderId: "900206169182",
  appId: "1:900206169182:web:ab54ac2193557476"
};

firebase.initializeApp(firebaseConfig);

firebase.functions().useFunctionsEmulator("http://localhost:5000");

export default firebase;
