import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let unsubDoc = null;

  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid);

unsubDoc = onSnapshot(docRef, async (docSnap) => {
  if (docSnap.exists()) {
    const data = docSnap.data();

    if (data.premiumPackage?.active && data.premiumPackage.expiresAt) {
      const now = new Date();
      const expiry = new Date(data.premiumPackage.expiresAt);

      if (now >= expiry) {
        await updateDoc(docRef, {
          "premiumPackage.active": false,
        });
        console.log("Premium expired — status removed");
        data.premiumPackage.active = false;
      }
    }

    setUser({
      ...currentUser,
      username: data.username || currentUser.email,
      avatarUrl:
        data.avatarUrl ||
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      lastAvatarUpdate: data.lastAvatarUpdate || null,
      lastNameUpdate: data.lastNameUpdate || null,
      teamRuns: data.teamRuns || [],
      premiumPackage: data.premiumPackage || null,
    });
  } else {
    setUser(currentUser);
  }
  setLoading(false);
});

    } else {
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }
      setUser(null);
      setLoading(false);
    }
  });

  return () => {
    if (unsubDoc) unsubDoc();
    unsubscribe();
  };
}, []);


  return (
    <AuthContext.Provider value={{ user, loading, signOut: () => signOut(auth) }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);