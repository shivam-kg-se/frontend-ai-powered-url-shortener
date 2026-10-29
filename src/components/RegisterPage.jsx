import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiEye, FiEyeOff, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/api";
import { getApiErrorMessage } from "../api/errorMessage";
import AuthLayout from "./AuthLayout";
import OtpInput from "./OtpInput";

const RESEND_COOLDOWN_SECONDS = 30;
const STEP_LABELS = ["Verify email", "Enter code", "Set up account"];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registrationToken, setRegistrationToken] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setTimeout(
      () => setCooldown((value) => value - 1),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const sendOtp = async (resend = false) => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Enter your email address to continue.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/public/send-otp", { email: normalizedEmail });
      setEmail(normalizedEmail);
      setOtp("");
      setRegistrationToken("");
      setStep(2);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success(resend ? "A new verification code was sent." : "Check your inbox for a verification code.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We couldn’t send a code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/public/verify-otp", {
        email: email.trim(),
        otp: otp.trim(),
      });

      if (data?.verified !== true) {
        setError("That code could not be verified. Request a new code and try again.");
        return;
      }

      const token = data?.registrationToken ?? data?.data?.registrationToken;
      if (typeof token !== "string" || !token.trim()) {
        setError("We couldn’t finish setting up your account. Please verify your email again.");
        return;
      }

      setRegistrationToken(token.trim());
      setStep(3);
      toast.success("Email verified.");
    } catch (requestError) {
      setError(getApiErrorMessage(
        requestError,
        "The code may be invalid or expired. Request a new one and try again."
      ));
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async (event) => {
    event.preventDefault();
    if (!registrationToken.trim()) {
      setError("Verify your email again to continue.");
      setStep(2);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/public/complete-registration", {
        email: email.trim(),
        username: username.trim(),
        password,
        registrationToken: registrationToken.trim(),
      });
      setRegistrationToken("");
      toast.success("Account created. Sign in to continue.");
      navigate("/login");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We couldn’t complete registration. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="A BETTER LINK WORKFLOW"
      headline="Create your space for the links you share."
      description="Verify your email, set up your account, and keep your short URLs organized in one workspace."
    >
      <section className="auth-card registration-card" aria-labelledby="registration-heading">
        <div className="auth-card-heading">
          <span className="auth-step-label">STEP {step} OF 3</span>
          <h2 className="auth-heading" id="registration-heading">
            {step === 1 ? "Create your account" : step === 2 ? "Check your email" : "Set up your sign-in"}
          </h2>
          <p className="auth-subheading">
            {step === 1
              ? "Start with your email address. We’ll send a one-time verification code."
              : step === 2
                ? `Enter the six-digit code sent to ${email}.`
                : "Your email is verified. Choose a username and password."}
          </p>
        </div>

        <ol className="registration-progress" aria-label={`Registration progress: ${STEP_LABELS[step - 1]}`}>
          {STEP_LABELS.map((label, index) => (
            <li className={index + 1 <= step ? "is-complete" : ""} key={label}>
              <span>{index + 1 < step ? "✓" : index + 1}</span>
              <small>{label}</small>
            </li>
          ))}
        </ol>

        {error && <p className="form-alert" role="alert">{error}</p>}

        {step === 1 && (
          <form
            className="auth-fields"
            onSubmit={(event) => {
              event.preventDefault();
              void sendOtp();
            }}
          >
            <div className="field-group">
              <label className="field-label" htmlFor="registration-email">Email address</label>
              <div className="input-with-icon">
                <FiMail aria-hidden="true" />
                <input
                  autoComplete="email"
                  className="field-input"
                  id="registration-email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </div>
            </div>
            <button className="auth-submit" disabled={loading} type="submit">
              {loading ? "Sending code…" : "Continue with email"}
              {!loading && <FiArrowRight aria-hidden="true" />}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="auth-fields" onSubmit={verifyOtp}>
            <div className="field-group">
              <span className="field-label">Verification code</span>
              <OtpInput
                autoFocus
                disabled={loading}
                idPrefix="registration-otp"
                onChange={setOtp}
                value={otp}
              />
              <span className="field-help">Paste the six-digit code from your email.</span>
            </div>
            <button className="auth-submit" disabled={loading || otp.length !== 6} type="submit">
              {loading ? "Verifying…" : "Verify email"}
              {!loading && <FiArrowRight aria-hidden="true" />}
            </button>
            <div className="auth-inline-actions">
              <button className="text-button" disabled={loading || cooldown > 0} onClick={() => void sendOtp(true)} type="button">
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
              <button
                className="text-button"
                disabled={loading}
                onClick={() => {
                  setRegistrationToken("");
                  setStep(1);
                  setError("");
                }}
                type="button"
              >
                Change email
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form className="auth-fields" onSubmit={completeRegistration}>
            <div className="field-group">
              <label className="field-label" htmlFor="registration-username">Username</label>
              <input
                autoComplete="username"
                className="field-input"
                id="registration-username"
                maxLength={50}
                minLength={3}
                onChange={(event) => setUsername(event.target.value)}
                pattern="[A-Za-z0-9._-]+"
                placeholder="Choose a username"
                required
                value={username}
              />
              <span className="field-help">3–50 characters: letters, numbers, dots, underscores, or hyphens.</span>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="registration-password">Password</label>
              <div className="input-with-action">
                <input
                  autoComplete="new-password"
                  className="field-input"
                  id="registration-password"
                  maxLength={128}
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  required
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                  className="input-icon-action"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  type="button"
                >
                  {passwordVisible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
              </div>
              <span className="field-help">Use 8–128 characters.</span>
            </div>
            <button className="auth-submit" disabled={loading || !registrationToken} type="submit">
              {loading ? "Creating account…" : "Create account"}
              {!loading && <FiArrowRight aria-hidden="true" />}
            </button>
            <button className="text-button auth-back-step" disabled={loading} onClick={() => setStep(2)} type="button">
              <FiArrowLeft aria-hidden="true" /> Back to verification
            </button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </AuthLayout>
  );
};

export default RegisterPage;
