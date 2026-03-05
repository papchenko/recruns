import { useEffect, useState } from "react";
import { db, auth } from "../../../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";

import './likes.scss';

export default function Likes({ routeId, usersData, currentUser }) {
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "routes", routeId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLikes(data.likes || []);
        setHasLiked(data.likes?.some((l) => l.uid === (currentUser?.uid || auth.currentUser?.uid)));
      }
    });
    return () => unsub();
  }, [routeId, currentUser]);

  const toggleLike = async () => {
    const user = currentUser || auth.currentUser;
    if (!user?.uid) {
      console.warn("User not logged in");
      return;
    }

    const userData = usersData?.[user.uid] || {};

    const userLike = {
      uid: user.uid,
      username: userData.username || user.displayName || user.email?.split("@")[0] || "Anonymous",
      avatarUrl: userData.avatarUrl || user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };

    const docRef = doc(db, "routes", routeId);
    const oldLike = likes.find(l => l.uid === user.uid);

    if (oldLike) await updateDoc(docRef, { likes: arrayRemove(oldLike) });
    if (!hasLiked) await updateDoc(docRef, { likes: arrayUnion(userLike) });
  };

  return (
    <div className="likes-wrapper">
      <button onClick={toggleLike} className="like-btn">
        {hasLiked ? <AiFillLike color="red" size={24} /> : <AiOutlineLike size={24} />}
      </button>

      <span className="likes-count" onClick={() => likes.length > 0 && setShowPopup(true)}>
        {likes.length} {likes.length === 1 ? "Like" : "Likes"}
      </span>

      {showPopup && (
        <div className="likes-popup">
          <div className="popup-content">
            <h4>Liked by</h4>
            <button className="close-btn" onClick={() => setShowPopup(false)}>&times;</button>
            <div className="popup-list">
              {likes.map((l, i) => {
                const latestUser = usersData?.[l.uid] || {};
                return (
                  <div key={i} className="popup-user">
                    <img src={latestUser.avatarUrl || l.avatarUrl} alt={l.username} />
                    <span>{latestUser.username || l.username}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}