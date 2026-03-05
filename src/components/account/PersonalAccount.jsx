import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import { FaPencilAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

import FriendsList from "../users/FriendsList";
import ChatWindow from "../users/ChatWindow";
// import { MdWorkspacePremium } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";

import "./personalaccount.scss";

export default function PersonalAccount() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [teamRuns, setTeamRuns] = useState([]);


  const [newUsername, setNewUsername] = useState("");
  const [canChangeName, setCanChangeName] = useState(true);
  const [daysLeftName, setDaysLeftName] = useState(0);
  const [editingName, setEditingName] = useState(false);

  const [activeChat, setActiveChat] = useState(null);

  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  );
  const [canChangeAvatar, setCanChangeAvatar] = useState(true);
  const [daysLeftAvatar, setDaysLeftAvatar] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTeamRuns(data.teamRuns || []);
        setAvatarUrl(data.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png");

        if (data.lastNameUpdate) {
          const diffDays = (new Date() - new Date(data.lastNameUpdate)) / (1000 * 60 * 60 * 24);
          if (diffDays >= 7) {
            setCanChangeName(true);
            setDaysLeftName(0);
          } else {
            setCanChangeName(false);
            setDaysLeftName(Math.max(0, Math.ceil(7 - diffDays)));
          }
        } else {
          setCanChangeName(true);
          setDaysLeftName(0);
        }

        if (data.lastAvatarUpdate) {
          const diffHours = (new Date() - new Date(data.lastAvatarUpdate)) / (1000 * 60 * 60);
          if (diffHours >= 24) {
            setCanChangeAvatar(true);
            setDaysLeftAvatar(0);
          } else {
            setCanChangeAvatar(false);
            setDaysLeftAvatar(Math.max(0, Math.ceil(24 - diffHours)));
          }
        } else {
          setCanChangeAvatar(true);
          setDaysLeftAvatar(0);
        }
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleUsernameChange = async () => {
    if (!canChangeName) return toast.dark(`Change available in ${daysLeftName} days`);
    if (!newUsername.trim()) return toast.dark("Enter username");

    await updateDoc(doc(db, "users", user.uid), {
      username: newUsername.trim(),
      lastNameUpdate: new Date(),
    });

    user.username = newUsername.trim();

    setNewUsername("");
    setCanChangeName(false);
    setDaysLeftName(7);
    setEditingName(false);
    toast.success("Username updated");
  };

  const handleFileChange = async (e) => {
    if (!canChangeAvatar) return toast.dark(`Change available in ${daysLeftAvatar} hours`);

    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "y8wvdb5c");
    const cloudName = "dggvnbw4a";

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: (e) => {
            setUploadProgress(Math.round((e.loaded * 100) / e.total));
          },
        }
      );

      const url = res.data.secure_url;
      setAvatarUrl(url);

      await updateDoc(doc(db, "users", user.uid), {
        avatarUrl: url,
        lastAvatarUpdate: new Date(),
      });

      user.avatarUrl = url;

      setCanChangeAvatar(false);
      setDaysLeftAvatar(24);
      toast.success("Avatar updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="main-wrapper">
      <div className="personal__account-container">
        <div className="avatar-wrapper">
          <img
            className="personal__account-avatar avatar"
            src={avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt="avatar"
          />
          {user?.premiumPackage?.active && user.premiumPackage.title === "Pro" && (
            <RiVerifiedBadgeFill
              style={{
                position: "absolute",
                top: "-5px",
                right: "-10px",
                color: "#ffd700",
                fontSize: "2rem",
                backgroundColor: "#000a",
                borderRadius: "50%",
                padding: "3px"
              }}
            />
          )}
          {canChangeAvatar && (
            <label className="avatar-edit">
              +
              <input
                type="file"
                onChange={handleFileChange}
                disabled={!canChangeAvatar || uploading}
                hidden
              />
            </label>
          )}
                  </div>
          {!canChangeAvatar && (
            <p className="info-text">Change avatar in {daysLeftAvatar} hour(s)</p>
          )}
          {uploading && (
            <div className="upload-bar">
              <div
                className="upload-progress"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}


        <div className="username-block">
          {editingName ? (
            <div className="username-edit">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                disabled={!canChangeName}
              />
              <button
                onClick={handleUsernameChange}
                disabled={!canChangeName}
                className="btn-save"
              >
                Save
              </button>
              <IoMdClose
                className="icon-cancel"
                onClick={() => setEditingName(false)}
              />
            </div>
          ) : (
            <h2 className="username-display">
              Welcome, <span>{user.username || user.email}</span>
              {canChangeName && (
                <FaPencilAlt
                  className="icon-edit"
                  onClick={() => setEditingName(true)}
                />
              )}
            </h2>
          )}
          {!canChangeName && (
            <p className="info-text">Change username in {daysLeftName} day(s)</p>
          )}
        </div>
        <p style={{fontSize: "0.8rem", opacity: "0.2"}}>Email: {user.email}</p>
        <br />
        {user?.premiumPackage?.active ? (
          <div className="premium-status active">
            <h4 className="text-white">Premium: {user.premiumPackage.title}</h4>
            {user.premiumPackage.features && (
              <ul className="premium-features">
                {user.premiumPackage.features.map((f, i) => (
                  <li key={i}>
                    <i className={f.icon}></i> {f.text}
                  </li>
                ))}
              </ul>
            )}
            <h6 className="text-white">Expires: {new Date(user.premiumPackage.expiresAt).toLocaleDateString()}</h6>
          </div>
        ) : (
          <div className="premium-status expired">
            <p>No active premium</p>
          </div>
        )}
        {teamRuns.length > 0 && (
          <div className="teamruns text-white">
            <h4>✅ Your registered team runs:</h4>
            <ul>
              {teamRuns.map((date, i) => (
                <li key={i}>{date}</li>
              ))}
            </ul>
          </div>
        )}
          <div className="friends-chat-section text-white">
            <FriendsList onSelectUser={setActiveChat} />
            {activeChat && (
              <ChatWindow
                currentUserId={user.uid}
                friendId={activeChat}
                onClose={() => setActiveChat(null)}
              />
            )}
          </div>
          <br />
        <button className="btn btn-primary" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}