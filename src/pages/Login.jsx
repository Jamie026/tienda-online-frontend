import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { obtenerRutaPorRol } from "../utils/rutas";
import "../styles/auth.css";

function Login() {
    const { login, autenticado, usuario, cargando } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    if (!cargando && autenticado && usuario)
        return <Navigate to={obtenerRutaPorRol(usuario.tipo)} replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setEnviando(true);

        try {
            const usuarioAutenticado = await login(email.trim(), clave);
            navigate(obtenerRutaPorRol(usuarioAutenticado.tipo));
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <header className="auth-card__header">
                    <div className="auth-card__logo">Tienda Online</div>
                    <p className="auth-card__subtitle">Accede a tu panel B2B</p>
                </header>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-form__error" role="alert">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                        autoComplete="email"
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        name="clave"
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                    />

                    <Button type="submit" disabled={enviando}>
                        {enviando ? "Ingresando…" : "Iniciar sesión"}
                    </Button>

                    <p className="auth-form__footer">
                        ¿No tienes cuenta?{" "}
                        <Link to="/register">Regístrate</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;
