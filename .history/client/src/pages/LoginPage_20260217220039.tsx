import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/LandingPage.css";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  // ⭐ THIS LINE REMEMBERS WHERE USER CAME FROM
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      await login(data.email, data.password);

      // ⭐ REDIRECT BACK TO ORIGINAL PAGE
      navigate(from, { replace: true });

    } catch (err: any) {
      alert(err?.response?.data?.message || "Invalid email or password");
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Welcome back</h2>
        <p style={subtitleStyle}>
          Log in to continue taking care of your mental well-being.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
<<<<<<< HEAD
=======
          {/* Email */}
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
          <div>
            <label>Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              style={inputStyle}
            />
            {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
          </div>

<<<<<<< HEAD
=======
          {/* Password */}
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
          <div>
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                style={inputStyle}
              />
              <span
                style={toggleStyle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
            {errors.password && (
              <p style={errorStyle}>{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={isSubmitting}
            style={{ marginTop: "0.5rem" }}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={footerTextStyle}>
          Don’t have an account?{" "}
          <Link to="/register" style={linkStyle}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f9fafb",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  background: "white",
  padding: "2rem",
  borderRadius: "1rem",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const titleStyle = { fontSize: "1.8rem", fontWeight: 700 };
const subtitleStyle = { color: "#6b7280", marginBottom: "1.5rem" };
const formStyle = { display: "grid", gap: "1rem" };

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid #d1d5db",
  fontSize: "0.95rem",
};

const toggleStyle: React.CSSProperties = {
  position: "absolute",
  right: "0.75rem",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: "0.8rem",
  color: "#2563eb",
  cursor: "pointer",
};

const errorStyle = { color: "#dc2626", fontSize: "0.8rem" };
const footerTextStyle = { marginTop: "1rem", fontSize: "0.9rem" };
const linkStyle = { color: "#2563eb", textDecoration: "none" };
