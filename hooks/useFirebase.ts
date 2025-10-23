
import { useState, useEffect } from 'react';
// FIX: Use Firebase v8 compat imports to resolve module errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// --- FIREBASE SETUP ---

// These would be injected by the environment.
declare const __app_id: string | undefined;
declare const __firebase_config: string | undefined;

// Helper to define Firestore paths
export const getPrivateCollectionPath = (userId: string, collectionName: string) => 
  `artifacts/${appId}/users/${userId}/${collectionName}`;

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

export const useFirebase = () => {
  // FIX: Use Firebase v8 compat types.
  const [db, setDb] = useState<firebase.firestore.Firestore | null>(null);
  const [auth, setAuth] = useState<firebase.auth.Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (!firebaseConfig.apiKey) {
        console.error("Firebase config is missing API key.");
        setLoading(false);
        return;
      }
      
      // FIX: Use Firebase v8 compat initialization pattern.
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      const firestore = firebase.firestore();
      const authInstance = firebase.auth();

      setDb(firestore);
      setAuth(authInstance);

      // Authentication Listener
      // FIX: Use Firebase v8 compat method and type.
      const unsubscribe = authInstance.onAuthStateChanged((user: firebase.User | null) => {
        if (user) {
          setUserId(user.uid);
          setLoading(false);
        } else {
          // FIX: Use Firebase v8 compat method.
          authInstance.signInAnonymously()
            .then((credential) => {
              if (credential.user) {
                setUserId(credential.user.uid);
              }
            })
            .catch(e => {
              console.error("Anonymous sign-in failed:", e);
              // Fallback to a random ID if anonymous sign-in fails
              setUserId(crypto.randomUUID()); 
            })
            .finally(() => setLoading(false));
        }
      });
      
      return () => unsubscribe();

    } catch (e) {
      console.error("Error initializing Firebase:", e);
      setLoading(false);
    }
  }, []);

  return { db, auth, userId, loading };
};
