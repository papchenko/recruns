import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import "./chatwindow.scss";

export default function ChatWindow({ currentUserId, friendId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [friendData, setFriendData] = useState({
    username: "Unknown",
    avatarUrl: "",
  });

  useEffect(() => {
    if (!friendId) return;

    const fetchFriend = async () => {
      const docSnap = await getDoc(doc(db, "users", friendId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFriendData({
          username: data.username || "Unknown",
          avatarUrl:
            data.avatarUrl ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        });
      }
    };
    fetchFriend();
  }, [friendId]);

  useEffect(() => {
    if (!currentUserId || !friendId) return;

    const chatId =
      currentUserId < friendId
        ? `${currentUserId}_${friendId}`
        : `${friendId}_${currentUserId}`;

    const messagesRef = collection(db, "messages", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp"));
    const unsub = onSnapshot(q, async (snap) => {
      const newMessages = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setMessages(newMessages);

      const unread = snap.docs.filter(
        (d) =>
          d.data().receiverId === currentUserId && d.data().seen === false
      );
      for (const m of unread) {
        const msgRef = doc(db, "messages", chatId, "messages", m.id);
        await updateDoc(msgRef, { seen: true });
      }
    });

    return () => unsub();
  }, [currentUserId, friendId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const chatId =
      currentUserId < friendId
        ? `${currentUserId}_${friendId}`
        : `${friendId}_${currentUserId}`;

    const messagesRef = collection(db, "messages", chatId, "messages");
    await addDoc(messagesRef, {
      text,
      senderId: currentUserId,
      receiverId: friendId,
      timestamp: new Date(),
      seen: false,
    });
    setText("");
  };

  if (!friendId) return null;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img
          className="friend-avatar"
          src={friendData.avatarUrl}
          alt={friendData.username}
        />
        <h4>{friendData.username}</h4>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="chat-body">
        {messages.map((m) => {
          const isSent = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className={`chat-message ${isSent ? "sent" : "received"}`}
            >
              {!isSent && (
                <img
                  className="message-avatar"
                  src={friendData.avatarUrl}
                  alt={friendData.username}
                />
              )}
              <p>{m.text}</p>
            </div>
          );
        })}
      </div>

      <div className="chat-footer">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}