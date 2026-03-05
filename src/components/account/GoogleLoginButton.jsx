import { useState } from "react";
import { auth, db, googleProvider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function GoogleLoginButton({ onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const email = user.email;
      const username = email.split("@")[0];

      const usernameDoc = await getDoc(doc(db, "usernames", username));
      if (!usernameDoc.exists()) {
        await setDoc(doc(db, "usernames", username), { email });
        await setDoc(doc(db, "users", user.uid), { username, email });
      }

      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="google-btn" onClick={handleGoogleSignIn} disabled={loading}>
      {loading ? "Loading..." : "Sign in with Google"}
    </button>
  );
}