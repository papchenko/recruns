// ================= ARCHIVES COMPONENT =================
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { motion } from "framer-motion";

const Card = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#111] border border-[#222] rounded-2xl p-4"
  >
    {children}
  </motion.div>
);

export default function Archives() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "weight_weeks"),
      where("uid", "==", auth.currentUser.uid),
      where("completed", "==", true)
    );

    return onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Archives</h3>
      <div className="space-y-2 mt-2">
        {history.map((w) => (
          <Card key={w.id}>
            <p className="text-sm text-gray-400">Start: {w.startWeight} kg</p>
            <p className="text-xs text-gray-500">Goal: {w.goal}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}