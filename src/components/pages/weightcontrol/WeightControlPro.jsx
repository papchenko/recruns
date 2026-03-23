// import { useEffect, useState, useMemo } from "react";
// import {
//   collection,
//   addDoc,
//   query,
//   where,
//   onSnapshot,
//   serverTimestamp,
// } from "firebase/firestore";
// import { db, auth } from "../../../firebase";

// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";

// import { motion } from "framer-motion";
// import './1.scss'

// // ================= AI =================
// const calculateTDEE = (weight, activity) => {
//   const base = weight * 22;
//   const factor = activity === "high" ? 1.7 : activity === "medium" ? 1.5 : 1.3;
//   return Math.round(base * factor);
// };

// const calculateMacros = (tdee, goal) => {
//   let calories = tdee;
//   if (goal === "lose") calories -= 400;
//   if (goal === "gain") calories += 300;
//   return {
//     calories,
//     protein: Math.round((calories * 0.3) / 4),
//     fat: Math.round((calories * 0.25) / 9),
//     carbs: Math.round((calories * 0.45) / 4),
//   };
// };

// const detectPlateau = (entries) => {
//   if (entries.length < 5) return false;
//   const last = entries.slice(-5).map((e) => e.weight);
//   return Math.max(...last) - Math.min(...last) < 0.3;
// };

// const detectWater = (entries) => {
//   if (entries.length < 3) return false;
//   const last = entries.slice(-3).map((e) => e.weight);
//   return last[2] > last[1] && last[1] > last[0];
// };


// const buildAI = (entries, week) => {
//   if (!entries.length) return null;
//   const current = entries.at(-1).weight;
//   const tdee = calculateTDEE(current, week.activityLevel);
//   const macros = calculateMacros(tdee, week.goal);
//   let message = "🔥 Good progress";
//   if (detectWater(entries)) message = "💧 Water retention detected";
//   else if (detectPlateau(entries)) message = "⏸ Plateau — reduce calories";
//   return { macros, message };
// };

// // ================= UI =================
// const Card = ({ children }) => (
//   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border border-[#222] rounded-2xl p-4">
//     {children}
//   </motion.div>
// );

// const ProgressBar = ({ current, goal }) => {
//   const pct = Math.min(Math.round((current / goal) * 100), 100);
//   const blocks = Math.round(pct / 10);
//   return (
//     <div className="mt-2">
//       <p>Goal: {goal} kg</p>
//       <p>Progress: {"█".repeat(blocks) + "░".repeat(10 - blocks)} {pct}%</p>
//     </div>
//   );
// };

// // ================= MAIN =================
// export default function WeightAI() {
//   const [week, setWeek] = useState(null);
//   const [entries, setEntries] = useState([]);
//   const [kg, setKg] = useState(70);
//   const [g, setG] = useState(0);

//   const startWeek = async () => {
//   const weight = kg ? parseFloat(`${kg}.${g || 0}`) : 70;

//   await addDoc(collection(db, "weight_weeks"), {
//       uid: auth.currentUser.uid,
//       startWeight: weight,
//       goal: "lose",
//       activityLevel: "medium",
//       completed: false,
//       createdAt: serverTimestamp(),
//     });
//   };

//   useEffect(() => {
//     const q = query(
//       collection(db, "weight_weeks"),
//       where("uid", "==", auth.currentUser.uid),
//       where("completed", "==", false)
//     );
//     return onSnapshot(q, (snap) => {
//       if (!snap.empty) setWeek({ id: snap.docs[0].id, ...snap.docs[0].data() });
//     });
//   }, []);

//   useEffect(() => {
//     if (!week) return;
//     const q = query(collection(db, "weight_entries"), where("weekId", "==", week.id));
//     return onSnapshot(q, (snap) => {
//       setEntries(snap.docs.map((d) => d.data()));
//     });
//   }, [week]);

//   const addWeight = async () => {
//     const weight = parseFloat(`${kg}.${g}`);
//     await addDoc(collection(db, "weight_entries"), {
//       uid: auth.currentUser.uid,
//       weekId: week.id,
//       weight,
//       createdAt: serverTimestamp(),
//     });
//   };

//   const ai = useMemo(() => buildAI(entries, week || {}), [entries, week]);

//   // chart + прогнозна лінія
//   const chartData = useMemo(() => {
//     if (!entries.length) return [];
//     const last = entries.at(-1).weight;
//     // прогноз на 3 дні вперед
//     const future = [last + 0.1, last + 0.2, last + 0.3];
//     return [...entries.map((e, i) => ({ day: i + 1, weight: e.weight })), 
//             ...future.map((w, i) => ({ day: entries.length + i + 1, weight: w, forecast: true }))];
//   }, [entries]);

// return (
//   <div className="we min-h-screen bg-[#0b0b0b] text-white p-4">
//     <div className="max-w-xl mx-auto space-y-4">

//       {/* ===== START STATE ===== */}
//       {!week && (
//         <Card>
//           <h2 className="text-lg font-semibold mb-2">Start tracking</h2>

//           <div className="flex gap-2 justify-center">
//             <input
//               type="number"
//               placeholder="kg"
//               value={kg}
//               onChange={(e) => setKg(e.target.value.slice(0, 2))}
//               className="w-2/3 p-3 rounded text-center text-xl"
//             />
//             <input
//               type="number"
//               placeholder="g"
//               value={g}
//               onChange={(e) => setG(e.target.value.slice(0, 1))}
//               className="w-1/3 p-3 rounded text-center text-xl"
//             />
//           </div>

//           <button
//             onClick={startWeek}
//             className="w-full mt-3 bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded font-semibold"
//           >
//             Start Tracking
//           </button>
//         </Card>
//       )}

//       {/* ===== ACTIVE WEEK ===== */}
//       {week && (
//         <>
//           <Card>
//             <h2 className="text-lg font-semibold">Progress</h2>
//             <ProgressBar
//               current={entries.at(-1)?.weight || week.startWeight}
//               goal={week.startWeight}
//             />
//           </Card>

//           <Card>
//             <div className="flex gap-2 justify-center">
//               <input
//                 type="number"
//                 value={kg}
//                 onChange={(e) => setKg(e.target.value.slice(0, 2))}
//                 className="w-2/3 p-3 rounded text-center text-xl"
//               />
//               <input
//                 type="number"
//                 value={g}
//                 onChange={(e) => setG(e.target.value.slice(0, 1))}
//                 className="w-1/3 p-3 rounded text-center text-xl"
//               />
//             </div>

//             <button
//               onClick={addWeight}
//               className="w-full mt-2 bg-orange-500 p-3 rounded"
//             >
//               Add
//             </button>
//           </Card>

//           {chartData.length > 0 && (
//             <Card>
//               <ResponsiveContainer width="100%" height={220}>
//                 <LineChart data={chartData}>
//                   <CartesianGrid stroke="#222" />
//                   <XAxis dataKey="day" stroke="#888" />
//                   <YAxis stroke="#888" />
//                   <Tooltip />

//                   {/* Реальна */}
//                   <Line
//                     type="monotone"
//                     dataKey="weight"
//                     stroke="#ff3c00"
//                     strokeWidth={3}
//                     dot={{ r: 4 }}
//                   />

//                   {/* Прогноз */}
//                   <Line
//                     type="monotone"
//                     dataKey="weight"
//                     stroke="#ff3c00"
//                     strokeWidth={2}
//                     strokeDasharray="5 5"
//                     data={chartData.filter((d) => d.forecast)}
//                     dot={false}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </Card>
//           )}

//           {ai && (
//             <Card>
//               <p className="text-lg">{ai.message}</p>
//               <p>Calories: {ai.macros.calories}</p>
//               <p>Protein: {ai.macros.protein}g</p>
//               <p>Fat: {ai.macros.fat}g</p>
//               <p>Carbs: {ai.macros.carbs}g</p>
//             </Card>
//           )}
//         </>
//       )}

//     </div>
//   </div>
// );
// }