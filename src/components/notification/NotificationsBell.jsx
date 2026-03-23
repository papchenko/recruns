import { useEffect, useState, useRef } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { MdOutlineNotifications } from "react-icons/md";
import { FaRegBell } from "react-icons/fa6";
import { useAuth } from "../account/AuthContext";

import "./notifications.scss";

export default function NotificationsBell() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [personalNotifs, setPersonalNotifs] = useState([]);
  const [unread, setUnread] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const userCreatedAt = userData?.createdAt?.toDate?.() || new Date(0);
      const readIds = userData?.readAnnouncements || [];

      const q = collection(db, "announcements");
      const unsub = onSnapshot(q, (snap) => {
        const all = snap.docs
          .map((d) => ({ id: d.id, ...d.data(), type: "announcement" }))
          .filter((a) => a.timestamp?.toDate() > userCreatedAt);

        const unreadOnes = all.filter((a) => !readIds.includes(a.id));
        setAnnouncements(unreadOnes);
      });

      return unsub;
    };

    load();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "notifications"), where("userId", "==", user.uid));

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setPersonalNotifs([]);
        return;
      }

      const all = snap.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
          type: "personal",
        }))
        .sort((a, b) => {
          const t1 = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const t2 = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return t2 - t1;
        });

      const unread = all.filter((n) => n.read === false || n.read === undefined);

      setPersonalNotifs(unread);
    });

    return unsub;
  }, [user]);

  useEffect(() => {
    setUnread([...announcements, ...personalNotifs]);
  }, [announcements, personalNotifs]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup(false);
      }
    };
    if (showPopup) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopup]);

  const markAsRead = async (notif) => {
    if (notif.type === "announcement") {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const read = snap.data()?.readAnnouncements || [];
      if (!read.includes(notif.id)) {
        await updateDoc(userRef, { readAnnouncements: [...read, notif.id] });
        setAnnouncements((prev) => prev.filter((a) => a.id !== notif.id));
      }
    } else if (notif.type === "personal") {
      await updateDoc(doc(db, "notifications", notif.id), { read: true });
      setPersonalNotifs((prev) => prev.filter((n) => n.id !== notif.id));
    }
  };

  return (
    <div className="notifications-bell" ref={popupRef}>
      <div className="bell-icon" onClick={() => setShowPopup((prev) => !prev)}>
        {/* <MdOutlineNotifications className="text-white fs-1" /> */}
       < FaRegBell />
        {unread.length > 0 && <span className="unread-badge"></span>}
      </div>

      {showPopup && (
        <div className="notifications-popup">
          <div className="popup-header">
            <h5>Notifications</h5>
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              ✕
            </button>
          </div>

          <div className="popup-body">
            {unread.length === 0 && <p className="empty">All notifications read</p>}
            {/* <div className="notifications-scroll">
              {unread.map((n) => (
                <div key={n.id} className="announcement" onClick={() => markAsRead(n)}>
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                </div>
              ))}
            </div> */}
            <div className="notifications-scroll">
              {unread.map((n) => (
                <div key={n.id} className="announcement" onClick={() => markAsRead(n)}>
                  <div className="notif-header">
                    <strong>{n.title}</strong>
                    {!n.read && <span className="new-badge">NEW</span>}
                  </div>
                  <p>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}