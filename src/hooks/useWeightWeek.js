import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { subscribeWeek } from "../api/weight.service";

export const useWeightWeek = () => {
  const [week, setWeek] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsub = subscribeWeek(auth.currentUser.uid, setWeek);
    return () => unsub();
  }, []);

  return week;
};