import { useEffect, useState } from "react";
import {
  FiCheck,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiKey,
  FiMail,
  FiShield,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/api";
import OtpInput from "./OtpInput";
import AccountPageNav from "./AccountPageNav";

const EMAIL_RESEND_SECONDS = 30;

const SecuritySettingsPage = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [visiblePassword, setVisiblePassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentEmailLoading, setCurrentEmailLoading] = useState(true);
  const [currentEmailError, setCurrentEmailError] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailStep, setEmailStep] = useState("email");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api.get("/api/users/me", { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setCurrentEmail(data.email || "");
      })
      .catch((requestError) => {
        if (
          !controller.signal.aborted
          && requestError.name !== "CanceledError"
          && requestError.code !== "ERR_CANCELED"
        ) {
          setCurrentEmailError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCurrentEmailLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMismatch(false);
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    setPasswordLoading(true);
    try {
      const { currentPassword, newPassword } = passwords;
      await api.patch("/api/users/me/password", {
        currentPassword,
        newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setVisiblePassword("");
      toast.success("Password changed successfully.");
    } catch (requestError) {
      setPasswordError(requestError.response?.status === 401
        ? "Your session may have expired. Sign in again to update your password."
        : "We couldn't update your password. Check your current password and try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const sendEmailOtp = async (event) => {
    event.preventDefault();
    setEmailError("");
    const normalizedEmail = email.trim();
    setEmail(normalizedEmail);
    setEmailLoading(true);
    try {
      await api.post("/api/users/me/email-change/send-otp", { email: normalizedEmail });
      setEmailStep("otp");
      setOtp("");
      setCooldown(EMAIL_RESEND_SECONDS);
      toast.success("A verification code was sent to your new email.");
    } catch (requestError) {
      setEmailError(requestError.response?.status === 401
        ? "Your session may have expired. Sign in again to change your email."
        : "We couldn't send a verification code. Check the email address and try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const verifyEmailOtp = async (event) => {
    event.preventDefault();
    setEmailError("");
    setEmailLoading(true);
    try {
      const { data } = await api.post("/api/users/me/email-change/verify-otp", {
        email,
        otp,
      });

      if (data?.verified !== true || data.email !== email) {
        setEmailError("The server did not confirm this email change. Request a new code and try again.");
        return;
      }

      setCurrentEmail(data.email);
      setEmailStep("success");
      setOtp("");
      setCooldown(0);
      toast.success("Email address updated.");
    } catch {
      setEmailError("The code could not be verified. It may be invalid or expired; request a new code and try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const resendEmailOtp = async () => {
    setEmailError("");
    setEmailLoading(true);
    try {
      await api.post("/api/users/me/email-change/send-otp", { email });
      setOtp("");
      setCooldown(EMAIL_RESEND_SECONDS);
      toast.success("A new verification code was sent.");
    } catch (requestError) {
      setEmailError(requestError.response?.status === 401
        ? "Your session may have expired. Sign in again to change your email."
        : "We couldn't resend the code. Try again shortly.");
    } finally {
      setEmailLoading(false);
    }
  };

  const startEmailChange = () => {
    setEmail("");
    setOtp("");
    setEmailError("");
    setEmailStep("email");
  };

  return (
    <main className="dashboard-shell profile-shell">
      <div className="dashboard-content">
        <header className="dashboard-heading account-page-heading">
          <div>
            <span className="dashboard-eyebrow">ACCOUNT SETTINGS</span>
            <h1>Security</h1>
            <p>Manage your password and verified email address.</p>
          </div>
        </header>

        <AccountPageNav />

        <div className="settings-grid security-settings-grid">
          <section className="settings-card security-card" aria-labelledby="password-title" aria-busy={passwordLoading}>
            <div className="security-section-heading">
              <span className="settings-icon"><FiKey aria-hidden="true" /></span>
              <div>
                <h2 id="password-title">Change password</h2>
                <p>Enter your current password, then choose a new one.</p>
              </div>
            </div>

            {passwordError && <p className="security-form-error" id="password-error" role="alert">{passwordError}</p>}

            <form className="auth-fields security-form" onSubmit={changePassword}>
              {[
                ["currentPassword", "Current password", "current-password"],
                ["newPassword", "New password", "new-password"],
                ["confirmPassword", "Confirm new password", "new-password"],
              ].map(([field, label, autocomplete]) => {
                const isNewPassword = field !== "currentPassword";
                const hasMismatch = field === "confirmPassword" && passwordMismatch;

                return (
                  <div className="field-group" key={field}>
                    <label className="field-label" htmlFor={field}>{label}</label>
                    <div className="input-with-icon input-with-action">
                      <input
                        autoComplete={autocomplete}
                        aria-describedby={hasMismatch ? "password-mismatch" : undefined}
                        aria-invalid={hasMismatch || undefined}
                        className="field-input"
                        disabled={passwordLoading}
                        id={field}
                        maxLength={isNewPassword ? 128 : undefined}
                        minLength={isNewPassword ? 8 : undefined}
                        onChange={(event) => {
                          setPasswords((current) => ({ ...current, [field]: event.target.value }));
                          setPasswordError("");
                          if (field === "confirmPassword" || field === "newPassword") {
                            setPasswordMismatch(false);
                          }
                        }}
                        required
                        type={visiblePassword === field ? "text" : "password"}
                        value={passwords[field]}
                      />
                      <button
                        aria-label={`${visiblePassword === field ? "Hide" : "Show"} ${label.toLowerCase()}`}
                        className="input-icon-action"
                        disabled={passwordLoading}
                        onClick={() => setVisiblePassword((current) => current === field ? "" : field)}
                        type="button"
                      >
                        {visiblePassword === field ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                      </button>
                    </div>
                    {field === "newPassword" && (
                      <span className="field-help">8–128 characters, matching the existing form limits. Additional server validation may apply.</span>
                    )}
                    {hasMismatch && (
                      <span className="security-field-error" id="password-mismatch" role="alert">
                        The new password and confirmation do not match.
                      </span>
                    )}
                  </div>
                );
              })}
              <div className="security-password-note">
                <FiShield aria-hidden="true" />
                <span>Password fields are used in this form only and are not written to local storage.</span>
              </div>
              <button className="button-primary security-submit" disabled={passwordLoading} type="submit">
                {passwordLoading ? "Updating password…" : "Update password"}
                {!passwordLoading && <FiCheck aria-hidden="true" />}
              </button>
            </form>
          </section>

          <section className="settings-card security-card" aria-labelledby="email-title" aria-busy={emailLoading}>
            <div className="security-section-heading">
              <span className="settings-icon"><FiMail aria-hidden="true" /></span>
              <div>
                <h2 id="email-title">Email address</h2>
                <p>Your new address takes effect after you verify it.</p>
              </div>
            </div>

            <div className="security-current-email" aria-live="polite">
              <span className="security-info-label">CURRENT EMAIL</span>
              <strong>
                {currentEmailLoading
                  ? "Loading current email…"
                  : currentEmail || (currentEmailError ? "Current email unavailable" : "No email available")}
              </strong>
            </div>

            {emailError && <p className="security-form-error" id="email-error" role="alert">{emailError}</p>}

            {emailStep === "email" && (
              <form className="auth-fields security-form" onSubmit={sendEmailOtp}>
                <div className="field-group">
                  <label className="field-label" htmlFor="new-email">New email address</label>
                  <input
                    autoComplete="email"
                    aria-describedby="email-change-help"
                    aria-invalid={Boolean(emailError)}
                    className="field-input"
                    disabled={emailLoading}
                    id="new-email"
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailError("");
                    }}
                    required
                    type="email"
                    value={email}
                  />
                  <span className="field-help" id="email-change-help">We’ll send a one-time verification code to this address.</span>
                </div>
                <div className="security-email-note">
                  <FiShield aria-hidden="true" />
                  <span>Your current address remains active until the new one is verified.</span>
                </div>
                <button className="button-primary security-submit" disabled={emailLoading} type="submit">
                  {emailLoading ? "Sending code…" : "Send verification code"}
                  {!emailLoading && <FiMail aria-hidden="true" />}
                </button>
              </form>
            )}

            {emailStep === "otp" && (
              <form className="auth-fields security-form" onSubmit={verifyEmailOtp}>
                <p className="settings-recipient">Enter the six-digit code sent to <strong>{email}</strong>.</p>
                <div className="field-group">
                  <label className="field-label" htmlFor="email-change-otp-1">Verification code</label>
                  <OtpInput
                    disabled={emailLoading}
                    idPrefix="email-change-otp"
                    onChange={(value) => {
                      setOtp(value);
                      setEmailError("");
                    }}
                    value={otp}
                  />
                  <span className="field-help">If the message is delayed, check your spam folder.</span>
                </div>
                <button className="button-primary security-submit" disabled={emailLoading || otp.length !== 6} type="submit">
                  {emailLoading ? "Verifying email…" : "Verify and update email"}
                  {!emailLoading && <FiCheck aria-hidden="true" />}
                </button>
                <div className="security-inline-actions">
                  <button
                    className="text-button"
                    disabled={emailLoading || cooldown > 0}
                    onClick={() => void resendEmailOtp()}
                    type="button"
                  >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                  </button>
                  <button
                    className="text-button"
                    disabled={emailLoading}
                    onClick={startEmailChange}
                    type="button"
                  >
                    Change address
                  </button>
                </div>
              </form>
            )}

            {emailStep === "success" && (
              <div className="security-email-success" role="status">
                <FiCheckCircle aria-hidden="true" />
                <div>
                  <strong>Email address verified</strong>
                  <p>{currentEmail} is now the email associated with your account.</p>
                </div>
                <button className="text-button" onClick={startEmailChange} type="button">Change email again</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default SecuritySettingsPage;
