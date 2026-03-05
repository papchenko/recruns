import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

import AddFriendButton from "../../users/AddFriendButton";

import "../../account/personalaccount.scss";

export default function ProfilePage({ usersData }) {
  const { uid } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (usersData?.[uid]) {
          setUserData(usersData[uid]);
        } else {
          const docRef = doc(db, "users", uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) setUserData(snap.data());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [uid, usersData]);

  if (loading) return <p className="loading">Loading...</p>;
  if (!userData) return <p className="not-found">User not found.</p>;

  return (
    <div className="main-wrapper">
      <div className="personal__account-container">
        <div className="avatar-wrapper">
          <img
            className="personal__account-avatar avatar"
            src={userData.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt={userData.username || "Unknown"}
          />
          <AddFriendButton targetUid={uid} />
        </div>

        <div className="username-block">
          <h2 className="username-display">
            {userData.username || "Unknown"}
          </h2>
        </div>

        <p>Email: {userData.email || "—"}</p>

        {userData.teamRuns?.length > 0 && (
          <div className="teamruns text-white">
            <h4>✅ Registered team runs:</h4>
            <ul>
              {userData.teamRuns.map((date, i) => (
                <li key={i}>{date}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}