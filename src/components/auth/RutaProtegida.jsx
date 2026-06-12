import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { obtenerRutaPorRol } from "../../utils/rutas";

function RutaProtegida({ rolesPermitidos }) {
    const { usuario, cargando } = useAuth();

    if (cargando) {
        return (
            <div className="estado-carga">
                <div className="estado-carga__spinner" aria-hidden="true" />
                <p>Cargando sesión…</p>
            </div>
        );
    }

    if (!usuario) return <Navigate to="/login" replace />;

    if (rolesPermitidos && !rolesPermitidos.includes(usuario.tipo))
        return <Navigate to={obtenerRutaPorRol(usuario.tipo)} replace />;

    return <Outlet />;
}

export default RutaProtegida;
