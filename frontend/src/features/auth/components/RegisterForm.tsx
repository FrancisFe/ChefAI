import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useRegister } from "../hooks/useRegister";
import { useAuthRedirect } from "../hooks/useAuthRedirect";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return "No se pudo crear la cuenta. Inténtalo de nuevo.";
}

const wrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  padding: "24px",
  backgroundColor: "var(--accent-bg)",
  boxSizing: "border-box",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  boxShadow: "var(--shadow)",
  padding: "40px 32px 32px",
  width: "100%",
  maxWidth: "400px",
  textAlign: "left",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 600,
  color: "var(--text-h)",
  marginBottom: "6px",
};

const baseInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "15px",
  backgroundColor: "var(--bg)",
  color: "var(--text-h)",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.2s",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  backgroundColor: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.2s, box-shadow 0.2s",
};

const linkButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--accent)",
  cursor: "pointer",
  textDecoration: "underline",
  padding: 0,
  fontSize: "inherit",
};

const backLinkStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--text)",
  cursor: "pointer",
  padding: 0,
  fontSize: "inherit",
};

const errorStyle: React.CSSProperties = {
  color: "#e74c3c",
  fontSize: "14px",
  textAlign: "center",
  marginTop: "12px",
};

type FieldName = "userName" | "email" | "password" | "confirmPassword";

export default function RegisterForm() {
  useAuthRedirect();
  const navigate = useNavigate();

  const { mutate, isPending, error } = useRegister();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const [focusedField, setFocusedField] = useState<FieldName | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setValidationError("Las contraseñas no coinciden");
      return;
    }

    setValidationError("");
    mutate({ userName, email, password, confirmPassword });
  };

  const fieldStyle = (field: FieldName): React.CSSProperties => ({
    ...baseInputStyle,
    borderColor: focusedField === field ? "var(--accent-border)" : undefined,
  });

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            ChefAI
          </span>
          <h1 style={{ fontSize: "28px", margin: "8px 0 4px", color: "var(--text-h)" }}>
            Crear cuenta
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text)" }}>
            Unite a ChefAI y empezá a generar tus recetas.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="userName" style={labelStyle}>
              Nombre de usuario
            </label>
            <input
              id="userName"
              type="text"
              placeholder="ChefPrincipal"
              autoComplete="username"
              required
              minLength={3}
              maxLength={50}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onFocus={() => setFocusedField("userName")}
              onBlur={() => setFocusedField(null)}
              style={fieldStyle("userName")}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="email" style={labelStyle}>
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={fieldStyle("email")}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="password" style={labelStyle}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Tu contraseña"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              style={fieldStyle("password")}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="confirmPassword" style={labelStyle}>
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repetí tu contraseña"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
              style={fieldStyle("confirmPassword")}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{
              ...buttonStyle,
              opacity: isPending ? 0.6 : 1,
              cursor: isPending ? "not-allowed" : "pointer",
              boxShadow: isPending ? "none" : undefined,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {isPending ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        {validationError && <p style={errorStyle}>{validationError}</p>}
        {error && <p style={errorStyle}>{getErrorMessage(error)}</p>}

        <p style={{ marginTop: "20px", fontSize: "14px", textAlign: "center", color: "var(--text)" }}>
          ¿Ya tenés cuenta?{" "}
          <button type="button" onClick={() => navigate("/login")} style={linkButtonStyle}>
            Iniciar sesión
          </button>
        </p>
        <p style={{ marginTop: "12px", textAlign: "center" }}>
          <button type="button" onClick={() => navigate("/")} style={backLinkStyle}>
            ← Volver al inicio
          </button>
        </p>
      </div>
    </div>
  );
}
