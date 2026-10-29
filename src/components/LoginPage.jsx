import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/api";
import { getApiErrorMessage } from "../api/errorMessage";
import { useStoreContext } from "../contextApi/ContextValue";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setToken } = useStoreContext();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { username: "", password: "" },
    mode: "onTouched",
  });

  const loginHandler = async (data) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const { data: response } = await api.post("/api/auth/public/login", data);
      setToken(response.token);
      localStorage.setItem("JWT_TOKEN", JSON.stringify(response.token));
      toast.success("You’re signed in.");
      reset();
      navigate("/dashboard");
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Sign-in failed. Check your username and password."
      );
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      headline="Pick up where your links left off."
      description="Your short URLs, destinations, and click activity are ready when you are."
    >
      <section className="auth-card" aria-labelledby="login-heading">
        <div className="auth-card-heading">
          <span className="auth-step-label">YOUR WORKSPACE</span>
          <h2 className="auth-heading" id="login-heading">Sign in to Linkora-AI</h2>
          <p className="auth-subheading">Enter your account details to continue.</p>
        </div>
        {errorMessage && <p className="form-alert" role="alert">{errorMessage}</p>}
        <form className="auth-fields" onSubmit={handleSubmit(loginHandler)}>
          <TextField
            autoComplete="username"
            label="Username"
            required
            id="username"
            type="text"
            message="Enter your username"
            placeholder="Your username"
            register={register}
            errors={errors}
          />
          <div className="password-field-wrap">
            <TextField
              autoComplete="current-password"
              label="Password"
              required
              id="password"
              type={passwordVisible ? "text" : "password"}
              message="Enter your password"
              placeholder="Your password"
              register={register}
              min={6}
              errors={errors}
            />
            <button
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              className="password-visibility"
              onClick={() => setPasswordVisible((visible) => !visible)}
              type="button"
            >
              {passwordVisible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
              <span>{passwordVisible ? "Hide" : "Show"}</span>
            </button>
          </div>
          <button className="auth-submit" disabled={loading} type="submit">
            {loading ? "Signing in…" : "Continue"}
            {!loading && <FiArrowRight aria-hidden="true" />}
          </button>
        </form>
        <p className="auth-switch">
          New to Linkora-AI? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </AuthLayout>
  );
};

export default LoginPage;
