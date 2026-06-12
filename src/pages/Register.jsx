import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { obtenerRutaPorRol } from "../utils/rutas";
import "../styles/auth.css";

const ROLES = [
    { valor: "comprador", etiqueta: "Comprador" },
    { valor: "vendedor", etiqueta: "Vendedor" },
    { valor: "proveedor", etiqueta: "Proveedor" }
];

function Register() {
    const { register, autenticado, usuario, cargando } = useAuth();
    const navigate = useNavigate();
    const [formulario, setFormulario] = useState({
        nombre: "",
        email: "",
        clave: "",
        tipo: "comprador"
    });
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    if (!cargando && autenticado && usuario)
        return <Navigate to={obtenerRutaPorRol(usuario.tipo)} replace />;

    const actualizarCampo = (campo, valor) => {
        setFormulario((prev) => ({ ...prev, [campo]: valor }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setEnviando(true);
        try {
            const usuarioRegistrado = await register({
                nombre: formulario.nombre.trim(),
                email: formulario.email.trim(),
                clave: formulario.clave,
                tipo: formulario.tipo
            });
            navigate(obtenerRutaPorRol(usuarioRegistrado.tipo));
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
                    <div className="auth-card__logo">
                        <span className="auth-card__logo-icon">◆</span>
                        Tienda Online
                    </div>
                    <p className="auth-card__subtitle">
                        Crea tu cuenta en el ecosistema B2B
                    </p>
                </header>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-form__error" role="alert">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Nombre"
                        name="nombre"
                        value={formulario.nombre}
                        onChange={(e) =>
                            actualizarCampo("nombre", e.target.value)
                        }
                        placeholder="Tu nombre"
                        required
                        autoComplete="name"
                    />

                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formulario.email}
                        onChange={(e) =>
                            actualizarCampo("email", e.target.value)
                        }
                        placeholder="tu@email.com"
                        required
                        autoComplete="email"
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        name="clave"
                        value={formulario.clave}
                        onChange={(e) =>
                            actualizarCampo("clave", e.target.value)
                        }
                        placeholder="••••••••"
                        required
                        minLength={6}
                        autoComplete="new-password"
                    />

                    <div className="role-selector">
                        <span className="role-selector__label">
                            Tipo de cuenta
                        </span>
                        <div className="role-selector__options">
                            {ROLES.map((rol) => (
                                <button
                                    key={rol.valor}
                                    type="button"
                                    className={(
                                        "role-chip " +
                                        (formulario.tipo === rol.valor
                                            ? "role-chip--active role-chip--" +
                                              rol.valor
                                            : "")
                                    ).trim()}
                                    onClick={() =>
                                        actualizarCampo("tipo", rol.valor)
                                    }
                                >
                                    {rol.etiqueta}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" disabled={enviando}>
                        {enviando ? "Creando cuenta…" : "Crear cuenta"}
                    </Button>

                    <p className="auth-form__footer">
                        ¿Ya tienes cuenta?{" "}
                        <Link to="/login">Inicia sesión</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;
