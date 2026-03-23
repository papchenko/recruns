import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../firebase";

import { createWeek, addWeightEntry } from "../../api/weight.service";
import { useWeightWeek } from "../../hooks/useWeightWeek";
import { useWeightEntries } from "../../hooks/useWeightEntries";

import { buildAI } from "../../utils/ai";
import { formatChartData, calculateWeeklyStats } from "../../utils/analytics";

import WeightChart from "../weightcontrol/WeightChart";
import WeeklyStats from "../weightcontrol/WeeklyStats";
import ProgressCard from "../weightcontrol/ProgressCard";
import { FaFireAlt, FaPizzaSlice, FaCarrot } from "react-icons/fa";
import { FaCheese } from "react-icons/fa6";

export default function WeightDashboard() {
  const week = useWeightWeek();
  const entries = useWeightEntries(week?.id);

  const [kg, setKg] = useState(0);
  const [g, setG] = useState(0);

  const start = async () => {
    if (!kg) return;
    const weight = parseFloat(`${kg}.${g || 0}`);
    await createWeek(auth.currentUser.uid, weight);
    setG("");
  };

  const add = async () => {
    if (!kg) return;
    const weight = parseFloat(`${kg}.${g || 0}`);
    await addWeightEntry(auth.currentUser.uid, week.id, weight);
    setG("");
  };

  const chartData = useMemo(() => formatChartData(entries), [entries]);
  const stats = useMemo(() => calculateWeeklyStats(entries), [entries]);
  const ai = useMemo(() => buildAI(entries, week), [entries, week]);

  if (!week) {
    return (
      <div className="weight__container">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white mb-4"
        >
          Start Tracking
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-dark text-white shadow-lg p-4"
        >
          <div className="row g-3 mb-3">
            <div className="col">
              <label className="form-label">kg</label>
              <input
                type="number"
                className="form-control text-center"
                value={kg}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                  setKg(val);
                }}
                placeholder="0"
              />
            </div>
            <div className="col">
              <label className="form-label">.kg</label>
              <input
                type="number"
                className="form-control text-center"
                value={g}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
                  setG(val);
                }}
                placeholder="0"
              />
            </div>
          </div>

          <button
            onClick={start}
            disabled={!kg}
            className={`btn btn-custome text-white rounded-5 px-5 py-2 fs-6 fw-semibold mt-2 ${kg ? "" : "disabled"}`}
          >
            Start
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="weight__container">

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <div className="card bg-dark text-white shadow-lg p-4">
        <ProgressCard
          current={entries.at(-1)?.weight || week.startWeight}
          start={week.startWeight}
        />
        </div>

      </motion.div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="card bg-dark text-white shadow-lg p-4 mb-4"
        >
          <p className="text-muted mb-3">Add today's weight</p>
          <div className="row g-3 mb-3">
            <div className="col">
              <label className="form-label">kg</label>
              <input
                type="number"
                className="form-control text-center"
                value={kg}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                  setKg(val);
                }}
                placeholder="0"
              />
            </div>
            <div className="col">
              <label className="form-label">.kg</label>
              <input
                type="number"
                className="form-control text-center"
                value={g}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
                  setG(val);
                }}
                placeholder="0"
              />
            </div>
          </div>

          <motion.button
            onClick={add}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={!kg}
            className={`btn btn-custome text-white rounded-5 px-5 py-2 fs-6 fw-semibold mt-2 ${kg ? "" : "disabled"}`}
          >
            Add weight
          </motion.button>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4 text-white"
      >
        <WeightChart data={chartData} />
      </motion.div>

    <div className="card bg-dark text-white shadow-lg p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-4 text-white"
      >
        <WeeklyStats stats={stats} />
      </motion.div>
      </div>

      {ai && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card bg-dark text-white shadow-lg p-4"
        >
          <p className="h5 mb-2 d-flex align-items-center gap-2">
            <span></span> AI Assistant
          </p>
          <p className="fs-6 fw-semibold text-uppercase" style={{ color: "var(--first-color)" }}>{ai.message}</p>
          <div className="d-flex flex-wrap gap-3 text-secondary mt-2">
            <span><FaFireAlt style={{ color: "var(--first-color)" }} /> Calories: {ai.macros.calories}</span>
            <span><FaCarrot style={{ color: "var(--first-color)" }} /> Protein: {ai.macros.protein}g</span>
            <span><FaCheese style={{ color: "var(--first-color)" }} /> Fat: {ai.macros.fat}g</span>
            <span><FaPizzaSlice style={{ color: "var(--first-color)" }} /> Carbs: {ai.macros.carbs}g</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}