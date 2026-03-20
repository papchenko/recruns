import { useAuth } from '../../account/AuthContext';
import { useState, useEffect } from 'react';
import { db } from "../../../firebase";
import { doc, updateDoc, collection, getDocs, getDoc } from "firebase/firestore";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QRCode from "react-qr-code";

// import raceImg from "../../../assets/race-image.jpg";

import "./race.scss";

const News = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [category, setCategory] = useState("");
  const [qrValue, setQrValue] = useState("");

  const raceDate = "not planned"; // date
  const maxParticipants = 0; //40

  const handleConfirmRegistration = async () => {
    if (!user || !agreed || !category) return;

    if (participants.length >= maxParticipants) {
      toast.error("Registration is closed. Max limit reached.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentRuns = userData.teamRuns || [];

        if (currentRuns.includes(raceDate)) {
          alert("You are already registered for this run.");
          setAlreadyRegistered(true);
        } else {
          await updateDoc(userRef, {
            teamRuns: [...currentRuns, raceDate],
            runCategory: category,
          });

          const qrLink = `${window.location.origin}/check-in?uid=${user.uid}&category=${category}`;
          setQrValue(qrLink);

          toast.success("You are successfully registered for the team run!");
          setAlreadyRegistered(true);
          fetchParticipants();
        }
      }
    } catch (err) {
      console.error("Error registering:", err);
      toast.error("Registration failed!");
    } finally {
      setShowPopup(false);
      setAgreed(false);
      setCategory("");
    }
  };

  const fetchParticipants = async () => {
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const list = snapshot.docs
        .map((doc) => doc.data())
        .filter((u) => u.teamRuns && u.teamRuns.includes(raceDate));
      setParticipants(list);
    } catch (err) {
      console.error("Error fetching participants:", err);
    }
  };

  const checkIfRegistered = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists() && docSnap.data().teamRuns?.includes(raceDate)) {
        setAlreadyRegistered(true);
        const data = docSnap.data();
        if (data.runCategory) {
          const qrLink = `${window.location.origin}/check-in?uid=${user.uid}&category=${data.runCategory}`;
          setQrValue(qrLink);
        }
      }
    } catch (err) {
      console.error("Error checking registration:", err);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    checkIfRegistered();
  }, [user]);

  return (
    <>
      <section className="news-section main-wrapper text-white">
        <div className="container">
          <div className="row">
            {/* <div className="col-lg-6 mb-4">
              <img
                src={raceImg}
                alt=""
                className="news-section_main-img rounded"
              />
            </div> */}
            {/* <div className="col-lg-6"> */}
            <div>
              <div className="news-section_post mb-4">
                <h5 className="first-color">Date</h5>
                <h6 className="date-teamrun news-section_card-title">{raceDate}</h6>
                <div className="d-flex justify-content-between news-section_meta small">
                  <span>not planned</span>
                  <span>Max: {maxParticipants} runners</span>
                </div>
              </div>

              <div className="news-section_post mb-4">
                <h5 className="first-color">Base</h5>
                <h6 className="news-section_card-title"><span>Team none by none participants.</span></h6>
              </div>

              <div className="news-section_post mb-4">
                <h5 className="first-color">Event Concept:</h5>
                <p className='m-0'>
                  {/* The run is designed to test not only individual strength but also team spirit. Each participant contributes to the overall performance of their group. Categories include Men, Women, and Junior (16–20 years). */}
                  none
                </p>
                <h5 className="first-color pt-4">Main Rules:</h5>
                {/* <p className='m-0'>Minimum age: 16 years old</p>
                <p className='m-0'>Arrive at least 30 minutes before the start for check-in</p>
                <p className='m-0'>Follow fair play and respect other participants</p>
                <p className='m-0'>Use your personal QR code for entry and race validation</p> */}
                none
              </div>

              <div className="registration-section">
                {!user && (
                  <p style={{ color: "red", opacity: "0.8" }}>
                    Only registered users can participate. Please either register or log in to your account.
                  </p>
                )}
                {user && !alreadyRegistered && (
                  <button className="btn btn-custome" onClick={() => setShowPopup(true)}>
                    Registration
                  </button>
                )}
                {user && alreadyRegistered && (
                  <div>
                    <p style={{ color: "lightgreen", fontWeight: "bold" }}>
                      ✅ You already registered
                    </p>
                    {qrValue && (
                      <div className="mt-2">
                        <QRCode value={qrValue} size={180} />
                        <div className="text-white mt-1">
                          <small>Scan or open: <br />{qrValue}</small>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="spoller mt-5">
              <h1>List of Participants ({participants.length}/{maxParticipants})</h1>
              <button
                className="btn btn-custome text-start"
                onClick={() => setOpen(!open)}
              >
                {open ? "Hide" : "Show"}
              </button>

              {open && (
              <div className="mt-2 p-3 border rounded">
                {participants.length === 0 ? (
                  <p>Empty</p>
                ) : (
                  <ul className="list-unstyled">
                    {participants.map((p, i) => (
                      <li
                        key={i}
                        className="mb-3 d-flex align-items-center gap-3 border-bottom pb-2"
                      >
                        <img
                          src={
                            p.avatarUrl ||
                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          }
                          alt="avatar"
                          className='avatar'
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <strong>{p.username || p.email}</strong>
                          <div style={{ opacity: 0.8, fontSize: "0.9em" }}>
                            {p.runCategory || "No category"}
                          </div>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                          <QRCode
                            value={`${window.location.origin}/check-in?uid=${p.uid}&category=${
                              p.runCategory || "No category"
                            }`}
                            size={80}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Popup */}
      {showPopup && (
        <div className="popup-overlay-race">
          <div className="popup-content-race bg-dark text-white p-4 rounded">
            <h3>Team Run Rules</h3>
            <ul>
              <li>Each participant must be at least 16 years old.</li>
              <li>Arrive 30 minutes before the start.</li>
              <li>Respect other runners.</li>
            </ul>

            <div className="mb-3">
              <label className="form-label">Choose Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Junior">Junior (16-20)</option>
              </select>
            </div>

            <div className="form-check my-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="agreeCheck"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="agreeCheck" className="form-check-label">
                I agree to the rules of participation
              </label>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn"
                disabled={!agreed || !category}
                onClick={handleConfirmRegistration}
                style={{backgroundColor: "#db3206", border: "none", color: "#fff"}}
              >
                Confirm
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default News;