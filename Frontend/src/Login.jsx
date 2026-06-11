import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { MyContext } from "./MyContext";

const CloseIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 1L13 13M13 1L1 13"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="1"
        y1="1"
        x2="23"
        y2="23"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );

function InputField({
  type,
  value,
  onChange,
  placeholder,
  focusKey,
  focusedField,
  setFocusedField,
  ariaLabel,
  children,
}) {
  const isFocused = focusedField === focusKey;
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(focusKey)}
        onBlur={() => setFocusedField(null)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`
          w-full rounded-xl px-4 text-sm font-light text-white outline-none
          transition-all duration-200
          py-3.5 md:py-3
          ${children ? "pr-11" : ""}
          ${
            isFocused
              ? "bg-white/[0.07] border border-white/25 shadow-[0_0_0_3px_rgba(255,255,255,0.04)]"
              : "bg-white/4 border border-white/9"
          }
        `}
        style={{ color: "#fff", caretColor: "#fff" }}
      />
      {children && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Login({ onClose, visible, setVisible }) {
  const { setUser, setToken } = useContext(MyContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isSignup, setIsSignup] = useState(false);

  const handleClose = () => {
    setVisible(false);
    switchMode();
    setTimeout(() => onClose?.(), 250);
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/login`,
        { email, password },
      );
      if (response.status === 200) {
        handleClose();
        toast.success("Login successful!");
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
      }
    } catch (error) {
      if (error.response?.status === 401)
        toast.error(error.response?.data?.message || "Login failed");
      console.error(error.response?.data || error.message);
    }
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/signup`,
        { name, email, password },
      );
      if (response.status === 200) {
        handleClose();
        toast.success("Signup successful!");
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
      }
    } catch (error) {
      if (error.response?.status === 401)
        toast.error(error.response?.data?.message || "Signup failed");
      console.error(error.response?.data || error.message);
    }
  };

  const handleSubmit = () => {
    if (isSignup) {
      if (email.trim() && password.trim() && name.trim()) handleSignup();
    } else {
      if (email.trim() && password.trim()) handleLogin();
    }
  };

  const switchMode = () => {
    setIsSignup((v) => !v);
    setEmail("");
    setPassword("");
    setName("");
    setFocusedField(null);
  };

  if (!visible) return null;

  const handleOverlayKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        handleClose();
      }
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');
        .login-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .login-title { font-family: 'Instrument Serif', serif; }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: translateY(18px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .overlay-anim { animation: overlayIn 0.3s ease forwards; }
        .modal-anim { animation: modalIn 0.38s cubic-bezier(0.16,1,0.3,1) forwards; }
        .close-spin { transition: transform 0.25s ease, background 0.2s ease; }
        .close-spin:hover { transform: rotate(90deg); background: rgba(255,255,255,0.06); }
        .close-spin:active { transform: rotate(90deg) scale(0.92); }
        .glow-ring { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; border: 1px solid transparent; background: radial-gradient(circle at 50% -20%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 65%) border-box; }
        .grain { position: absolute; inset: 0; pointer-events: none; opacity: 0.015; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3联%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); }
        .login-btn { transition: transform 0.15s ease, background-color 0.15s ease, opacity 0.15s ease; box-shadow: 0 4px 12px rgba(255,255,255,0.05); }
        .login-btn:hover { background-color: #f0f0f2; transform: translateY(-1px); }
        .login-btn:active { transform: translateY(0) scale(0.98); }
        .link-hover { transition: color 0.15s ease, opacity 0.15s ease; }
        .link-hover:hover { color: #fff !important; opacity: 0.9 !important; }
      `}</style>

      <div
        className="login-root overlay-anim fixed inset-0 flex items-center justify-center px-4 z-50"
        style={{
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
        onKeyDown={handleOverlayKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close login modal overlay"
      >
        <div
          className="modal-anim relative w-full max-w-88 rounded-2xl p-8 overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #141415 0%, #0f0f10 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="grain" />
          <div className="glow-ring" />

          <div className="relative z-10">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close modal"
              className="close-spin absolute -top-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-white/70 bg-transparent border-none cursor-pointer"
            >
              <CloseIcon />
            </button>

            <div className="text-center mb-7">
              <h2 className="login-title text-white text-[1.75rem] leading-tight mb-2.5">
                {isSignup ? "Create an account" : "Log in or sign up"}
              </h2>
              <p
                className="text-[0.8rem] leading-relaxed font-light"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Get smarter responses and upload
                <br />
                files, images, and more.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mb-3">
              {isSignup && (
                <InputField
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  focusKey="name"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                  ariaLabel="Full name"
                />
              )}

              <InputField
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                focusKey="email"
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                ariaLabel="Email address"
              />

              <InputField
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                focusKey="password"
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                ariaLabel="Password"
              >
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="text-white/30 hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center p-1 rounded-md"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPass} />
                </button>
              </InputField>
            </div>

            {!isSignup && (
              <div className="flex justify-end mb-5">
                <button
                  type="button"
                  className="link-hover text-[0.73rem] font-light text-white/30 bg-transparent border-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className={isSignup ? "mt-5" : ""}>
              <button
                type="button"
                onClick={handleSubmit}
                className="login-btn w-full rounded-xl px-4 py-3 text-sm font-semibold text-[#0f0f10] tracking-tight bg-white cursor-pointer"
              >
                {isSignup ? "Sign up" : "Continue"}
              </button>
            </div>

            <p
              className="text-center mt-4 text-[0.75rem] font-light"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="link-hover underline underline-offset-2 bg-transparent border-none cursor-pointer text-[0.75rem]"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {isSignup ? "Log in" : "Sign up"}
              </button>
            </p>

            <p
              className="text-center mt-4 text-[0.7rem] font-light leading-relaxed"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              By continuing, you agree to our{" "}
              <button
                type="button"
                className="link-hover underline underline-offset-2 bg-transparent border-none text-[0.7rem] p-0 font-light cursor-pointer"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                Terms
              </button>{" "}
              and{" "}
              <button
                type="button"
                className="link-hover underline underline-offset-2 bg-transparent border-none text-[0.7rem] p-0 font-light cursor-pointer"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
