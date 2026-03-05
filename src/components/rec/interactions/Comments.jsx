import { useEffect, useState } from "react";
import { db, auth } from "../../../firebase";
import { doc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { FaRegComments } from "react-icons/fa";

import './comments.scss';

export default function Comments({ routeId, usersData, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "routes", routeId), (snap) => {
      if (snap.exists()) setComments(snap.data().comments || []);
    });
    return () => unsub();
  }, [routeId]);

  const addComment = async () => {
    if (!newComment.trim()) return;

    const user = currentUser || auth.currentUser;
    if (!user?.uid) {
      console.warn("User not logged in");
      return;
    }

    const userData = usersData?.[user.uid] || {};

    const userComment = {
      uid: user.uid,
      username: userData.username || user.displayName || user.email?.split("@")[0] || "Anonymous",
      avatarUrl: userData.avatarUrl || user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    const docRef = doc(db, "routes", routeId);
    await updateDoc(docRef, { comments: arrayUnion(userComment) });

    setNewComment("");
  };

  return (
    <div className="comments-wrapper">
      <button onClick={() => setShowPopup(true)} className="comment-btn">
        <FaRegComments size={22} /> {comments.length}
      </button>

      {showPopup && (
        <div className="comments-popup">
          <div className="popup-content">
            <h4>Comments</h4>
            <button className="close-btn" onClick={() => setShowPopup(false)}>&times;</button>

            <div className="popup-list">
              {comments.length === 0 && <p>No comments yet.</p>}
              {comments.map((c, i) => {
                const latestUser = usersData?.[c.uid] || {};
                return (
                  <div key={i} className="comment-item">
                    <img
                      src={latestUser.avatarUrl || c.avatarUrl}
                      alt={c.username}
                      className="comment-avatar"
                    />
                    <div>
                      <strong>{latestUser.username || c.username}</strong>
                      <p>{c.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="comment-input">
              <input
                type="text"
                value={newComment}
                placeholder="Write a comment..."
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
              />
              <button onClick={addComment}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}