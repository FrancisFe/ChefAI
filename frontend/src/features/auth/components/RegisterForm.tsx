import { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { useAuthRedirect } from "../hooks/useAuthRedirect";

export default function RegisterForm() {
  useAuthRedirect();

  const { mutate, isPending, error } = useRegister();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setValidationError("Las contraseñas no coinciden");
      return;
    }

    setValidationError("");
    mutate({ userName, email, password, confirmPassword });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrarse</h2>

      <input
        type="text"
        placeholder="Nombre de usuario"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button type="submit" disabled={isPending}>
        {isPending ? "Creando..." : "Registrarse"}
      </button>

      {validationError && <p>{validationError}</p>}
      {error && <p>Error al registrarse</p>}
    </form>
  );
}