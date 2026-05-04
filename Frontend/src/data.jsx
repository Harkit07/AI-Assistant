export default function Login({ onClose, visible, setVisible }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isSignup, setIsSignup] = useState(false);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 250);
  };

  const handleSubmit = () => {
    if (isSignup) {
      if (email.trim() && password.trim() && confirmPassword.trim()) {
        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        }
        alert(`Signing up as: ${email}`);
      }
    } else {
      if (email.trim() && password.trim()) {
        alert(`Logging in as: ${email}`);
      }
    }
  };

  const switchMode = () => {
    setIsSignup((v) => !v);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFocusedField(null);
  };

  if (!visible) return null;

  return (
    <>
      <div
        className="login-root overlay-anim fixed inset-0 flex items-center justify-center px-4 z-50"
        style={{
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div
          className="modal-anim relative w-full max-w-88 rounded-2xl p-8 overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #141415 0%, #0f0f10 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          <div className="grain" />
          <div className="glow-ring" />

          <div className="relative z-10">
            <button
              onClick={handleClose}
              className="close-spin absolute -top-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-white/70"
              style={{ background: "transparent" }}
            >
              <CloseIcon />
            </button>

            <div className="text-center mb-7">
              <h2 className="login-title text-white text-[1.75rem] leading-tight mb-2.5">
                {isSignup ? "Create an account" : "Log in or sign up"}
              </h2>
              <p className="text-white/35 text-[0.8rem] leading-relaxed font-light">
                Get smarter responses and upload
                <br />
                files, images, and more.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mb-3">
              <InputField
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                focusKey="email"
                focusedField={focusedField}
                setFocusedField={setFocusedField}
              />
              <InputField
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                focusKey="password"
                focusedField={focusedField}
                setFocusedField={setFocusedField}
              >
                <button
                  onClick={() => setShowPass((v) => !v)}
                  className="eye-btn"
                  tabIndex={-1}
                  type="button"
                >
                  <EyeIcon open={showPass} />
                </button>
              </InputField>

              {isSignup && (
                <InputField
                  type={showConfirmPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  focusKey="confirmPassword"
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                >
                  <button
                    onClick={() => setShowConfirmPass((v) => !v)}
                    className="eye-btn"
                    tabIndex={-1}
                    type="button"
                  >
                    <EyeIcon open={showConfirmPass} />
                  </button>
                </InputField>
              )}
            </div>

            {!isSignup && (
              <div className="flex justify-end mb-5">
                <a
                  href="#"
                  className="link-hover text-[0.73rem] font-light"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Forgot password?
                </a>
              </div>
            )}

            <div className={isSignup ? "mt-5" : ""}>
              <button
                onClick={handleSubmit}
                className="login-btn w-full rounded-xl px-4 py-3 text-sm font-semibold text-[#0f0f10] tracking-tight"
                style={{ background: "#ffffff" }}
              >
                {isSignup ? "Sign up" : "Continue"}
              </button>
            </div>

            {/* Switch mode */}
            <p
              className="text-center mt-4 text-[0.75rem] font-light"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
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
              <a
                href="#"
                className="link-hover underline underline-offset-2"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                Terms
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="link-hover underline underline-offset-2"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
