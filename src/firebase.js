import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyDZE9guPwiMNhO8EVKOikHS4EkGclrMmgU",
authDomain: "my-traker-c5c13.firebaseapp.com",
projectId: "my-traker-c5c13",
storageBucket: "my-traker-c5c13.appspot.com",
messagingSenderId: "791475726487",
appId: "1:791475726487:web:2ca07c6415ff219de121d2",
measurementId: "G-2DMBHNYDQF",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();