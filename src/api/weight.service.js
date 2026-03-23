import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

export const createWeek = async (uid, weight) => {
  return addDoc(collection(db, "weight_weeks"), {
    uid,
    startWeight: weight,
    goal: "lose",
    activityLevel: "medium",
    completed: false,
    createdAt: serverTimestamp(),
  });
};

export const subscribeWeek = (uid, callback) => {
  const q = query(
    collection(db, "weight_weeks"),
    where("uid", "==", uid),
    where("completed", "==", false)
  );

  return onSnapshot(q, (snap) => {
    if (!snap.empty) {
      callback({ id: snap.docs[0].id, ...snap.docs[0].data() });
    }
  });
};

export const subscribeEntries = (weekId, callback) => {
  const q = query(
    collection(db, "weight_entries"),
    where("weekId", "==", weekId),
    orderBy("createdAt")
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data()));
  });
};

export const addWeightEntry = async (uid, weekId, weight) => {
  return addDoc(collection(db, "weight_entries"), {
    uid,
    weekId,
    weight,
    createdAt: serverTimestamp(),
  });
};