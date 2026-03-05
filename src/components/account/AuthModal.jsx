import { useState } from "react";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import GoogleLoginButton from "./GoogleLoginButton";

import "./AuthModal.scss";

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("signup");

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container position-relative">
         <button className="close-btn btn fs-1" onClick={onClose} style={{color: "#000"}}>&times;</button>
        <div className="modal-header pt-4">
          <div className="modal-tabs">
            <button
              className={mode === "signup" ? "active" : ""}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
            <button
              className={mode === "signin" ? "active" : ""}
              onClick={() => setMode("signin")}
            >
              Sign In
            </button>
          </div>
         
        </div>

        <div className="modal-content">
          {mode === "signup" ? (
            <SignUp onSuccess={onClose} />
          ) : (
            <SignIn onSuccess={onClose} />
          )}
          <div style={{ marginTop: 10 }}>
            <GoogleLoginButton onSuccess={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}