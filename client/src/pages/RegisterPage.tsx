import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/LandingPage.css";

const registerSchema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    try {
      await registerUser(data.name, data.email, data.password);
      navigate("/dashboard");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Create your account</h2>
        <p style={subtitleStyle}>
          Start your journey toward better mental wellness.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
          <div>
            <label>Full name</label>
            <input {...register("name")} style={inputStyle} />
            {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
          </div>

          <div>
            <label>Email</label>
            <input {...register("email")} style={inputStyle} />
            {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
          </div>

          <div>
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
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

          <div>
            <label>Confirm password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              style={inputStyle}
            />
            {errors.confirmPassword && (
              <p style={errorStyle}>{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p style={footerTextStyle}>
          Already have an account?{" "}
          <Link to="/login" style={linkStyle}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

/* same styles as login page */
const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f9fafb",
};

const cardStyle = {
  width: "100%",
  maxWidth: "460px",
  background: "white",
  padding: "2rem",
  borderRadius: "1rem",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const titleStyle = { fontSize: "1.8rem", fontWeight: 700 };
const subtitleStyle = { color: "#6b7280", marginBottom: "1.5rem" };
const formStyle = { display: "grid", gap: "1rem" };

const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid #d1d5db",
};

const toggleStyle = {
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
