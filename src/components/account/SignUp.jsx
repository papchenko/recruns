import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";

export default function SignUp({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        username,
        email,
        createdAt: serverTimestamp(),
        readAnnouncements: [],
      });

      await setDoc(doc(db, "usernames", username), { email });

      const notifRef = collection(db, "notifications");
      await addDoc(collection(db, "notifications"), {
        userId: uid,
        title: "👋 Welcome to Our Platform!",
        message: `Hi ${username}!

      Welcome to our community! Here you can:
      - Record and share your achievements.
      - Challenge yourself and others.
      - Participate in competitions and team tournaments.
      - Track your workouts for running, cycling, and swimming with detailed stats.
      - Find like-minded friends and get inspired by new records.
      - Set goals, collect points, and climb the rankings.`,
        createdAt: new Date(),
        read: false,
      });

      onSuccess?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}