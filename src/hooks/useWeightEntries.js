import { useEffect, useState } from "react";
import { subscribeEntries } from "../api/weight.service";

export const useWeightEntries = (weekId) => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (!weekId) return;

    const unsub = subscribeEntries(weekId, setEntries);
    return () => unsub();
  }, [weekId]);

  return entries;
};