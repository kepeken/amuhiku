import React, { useState, useEffect } from 'react';
import firebase from '../../plugins/firebase';


const twitterAuthProvider = new firebase.auth.TwitterAuthProvider();

const signIn = async () => {
  return await firebase.auth().signInWithPopup(twitterAuthProvider);
};

const Home = () => {
  const [user, setUser] = useState(firebase.auth().currentUser);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  return (
    <div>
      <h2>Home</h2>
      {user ? (
        <div>
          Welcome
          <img src={user.photoURL || undefined} />
          <span>{user.displayName}</span>
          !
        </div>
      ) : (
          <a onClick={() => signIn()}>Sign In</a>
        )}
    </div>
  );
};

export default Home;
