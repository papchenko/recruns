import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./admin-announcement.scss";

export default function AdminAnnouncementPanel() {
  // Field name: isAdmin
  // Type: boolean
  // Value: true
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendAnnouncement = async () => {
    if (!title.trim() || !message.trim())
      return toast.dark("Fill in all fields");

    setLoading(true);
    try {
      const notifRef = await addDoc(collection(db, "announcements"), {
        title,
        message,
        timestamp: serverTimestamp(),
      });


      const usersSnap = await getDocs(collection(db, "users"));

      const promises = usersSnap.docs.map((userDoc) =>
        setDoc(doc(db, "userAnnouncements", `${userDoc.id}_${notifRef.id}`), {
          userId: userDoc.id,
          announcementId: notifRef.id,
          read: false,
        })
      );

      await Promise.all(promises);

      toast.success("News sent to all existing users!");
      setTitle("");
      setMessage("");
    } catch (err) {
      console.error("Error sending announcement:", err);
      toast.error("Failed to send announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-announcement-panel">
      <h4>Create Notification</h4>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Notification text..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendAnnouncement} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}