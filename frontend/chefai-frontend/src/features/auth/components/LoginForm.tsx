import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useAuthRedirect } from "../hooks/useAuthRedirect";


export default function LoginForm() {
    useAuthRedirect();
    
    const {mutate,isPending,error} = useLogin();

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        mutate({email,password});
    }
    return (
        <form onSubmit={handleSubmit}>

                <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)}required />

            <div>
                <label htmlFor="password">Contraseña:</label>
                <input type="password" placeholder="Contraseña" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={isPending}>
                {isPending ? "Cargando..." : "Iniciar sesión"}
            </button>
            {error && <p>Error al loguear</p>}
        </form>
    );
}