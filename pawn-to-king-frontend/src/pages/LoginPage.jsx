import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "../components/StatusMessage";
import { consumeFlashMessage, setFlashMessage } from "../utils/flashMessage";

const initialForm = {
  email: "",
  password: ""
};

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [flashMessage, setFlashMessageState] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectPath = useMemo(() => location.state?.from || "/dashboard", [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const flash = consumeFlashMessage();
    if (flash?.text) {
      setFlashMessageState(flash);
    }
  }, []);

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Password is required";
    } else if (form.password.trim().length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await login({
        email: form.email.trim(),
        password: form.password
      });
      setFlashMessage({
        type: "success",
        text: response?.message
          ? `${response.message}. Welcome back to Pawn to King Academy.`
          : "Login successful. Welcome back to Pawn to King Academy."
      });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      if (!error?.response) {
        setServerError("Cannot connect to server. Ensure backend is running on http://localhost:5000.");
      } else {
        setServerError(
          error?.response?.status === 401 ? "Invalid email or password." : "Unable to sign in right now."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-5xl items-center px-4 py-14 md:px-6">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-gold/20 bg-card/80 p-7 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Welcome Back</p>
        <h1 className="mt-3 font-display text-3xl">Login to Academy</h1>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <StatusMessage
            type={flashMessage?.type || "info"}
            text={flashMessage?.text}
          />

          <div>
            <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-wider text-text/65">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gold/20 bg-bg/70 px-4 py-2.5 text-sm outline-none transition focus:border-gold"
              placeholder="you@example.com"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-300">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs uppercase tracking-wider text-text/65">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-gold/20 bg-bg/70 px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-gold"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gold hover:text-gold-hover transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1 text-xs text-red-300">{fieldErrors.password}</p>}
          </div>

          <StatusMessage type="error" text={serverError} />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg border border-gold bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold transition hover:border-gold-hover hover:text-gold-hover disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-sm text-text/70">
          New to the academy?{" "}
          <Link to="/join" className="text-gold hover:text-gold-hover">
            Join
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
