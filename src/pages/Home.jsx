import { obtenerRutaPorRol } from "../utils/rutas";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function Home() {
    const { autenticado, usuario, cargando } = useAuth();

    if (cargando)
        return (
            <div className="estado-carga">
                <div className="estado-carga__spinner" aria-hidden="true" />
                <p>Cargando…</p>
            </div>
        );

    if (autenticado && usuario)
        return <Navigate to={obtenerRutaPorRol(usuario.tipo)} replace />;

    return <Navigate to="/login" replace />;
}

export default Home;
