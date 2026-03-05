import { createContext, useContext } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../account/AuthContext";

const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
  const { user } = useAuth();

  const sendMessage = async (receiverId, text) => {
    if (!user) return;

    const chatId = [user.uid, receiverId].sort().join("_");
    const msgRef = collection(db, "messages", chatId, "messages");

    await addDoc(msgRef, {
      senderId: user.uid,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      seen: false,
    });
  };

  const listenToChat = (receiverId, callback) => {
    if (!user) return;
    const chatId = [user.uid, receiverId].sort().join("_");
    const q = query(collection(db, "messages", chatId, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(msgs);
    });
    return unsub;
  };

  return (
    <MessagesContext.Provider value={{ sendMessage, listenToChat }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => useContext(MessagesContext);