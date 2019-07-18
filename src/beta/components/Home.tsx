import React, { useState, useEffect } from 'react';
import firebase from '../../plugins/firebase';


const twitterAuthProvider = new firebase.auth.TwitterAuthProvider();

const signIn = async () => {
  await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
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
        <span>Signed in as {user.displayName}</span>
      ) : (
          <a onClick={() => signIn()}>Sign In</a>
        )}
    </div>
  );
};

export default Home;
