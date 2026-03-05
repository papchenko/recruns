import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  collection,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../account/AuthContext";

import "./friendslist.scss";

export default function FriendsList({ onSelectUser }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [usersData, setUsersData] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (!user) return;

    const userDoc = doc(db, "friends", user.uid);
    const unsub = onSnapshot(userDoc, async (snap) => {
      const data = snap.data() || { friends: [], requests: [] };
      setFriends(data.friends || []);
      setRequests(data.requests || []);

      const allUids = [...(data.friends || []), ...(data.requests || [])];
      const userDataTemp = {};

      await Promise.all(
        allUids.map(async (uid) => {
          const uSnap = await getDoc(doc(db, "users", uid));
          if (uSnap.exists()) userDataTemp[uid] = uSnap.data();
        })
      );
      setUsersData(userDataTemp);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || friends.length === 0) return;

    const unsubs = [];

    friends.forEach((fid) => {
      const chatId =
        user.uid < fid ? `${user.uid}_${fid}` : `${fid}_${user.uid}`;
      const messagesRef = collection(db, "messages", chatId, "messages");

      const q = query(messagesRef, where("receiverId", "==", user.uid), where("seen", "==", false));

      const unsub = onSnapshot(q, (snap) => {
        setUnreadCounts((prev) => ({
          ...prev,
          [fid]: snap.size,
        }));
      });

      unsubs.push(unsub);
    });

    return () => unsubs.forEach((u) => u());
  }, [user, friends]);

  const acceptRequest = async (fromUid) => {
    try {
      const userDoc = doc(db, "friends", user.uid);
      const otherDoc = doc(db, "friends", fromUid);

      await updateDoc(userDoc, {
        friends: arrayUnion(fromUid),
        requests: arrayRemove(fromUid),
      });
      await updateDoc(otherDoc, {
        friends: arrayUnion(user.uid),
      });
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  return (
    <div className="friends-list">
      <h4>Friends</h4>

      {friends.length === 0 && <p>No friends yet</p>}

      <div className="friends-grid">
      {friends.map((fid) => {
        const userData = usersData[fid] || {};
        const unread = unreadCounts[fid] || 0;

        return (
          <button
            key={fid}
            className="friend-btn"
            onClick={() => onSelectUser(fid)}
          >
            <img
              src={
                userData.avatarUrl ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={userData.username || fid}
              className="friend-avatar"
            />
            <span className="friend-name">
              {userData.username || "Unknown"}
            </span>
            {unread > 0 && <span className="unread-badge">{unread}</span>}
          </button>
        );
      })}
      </div>
      <h5>Friend Requests</h5>
      {requests.length === 0 && <p>No friend requests</p>}
      {requests.map((rid) => (
        <div key={rid} className="friend-request">
          <img
            src={
              usersData[rid]?.avatarUrl ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt={usersData[rid]?.username || "User"}
            className="friend-avatar"
          />
          <span>{usersData[rid]?.username || rid}</span>
          <button onClick={() => acceptRequest(rid)}>Accept</button>
        </div>
      ))}
    </div>
  );
}