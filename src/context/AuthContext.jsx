import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import {
    cerrarSesion,
    iniciarSesion,
    obtenerSesion,
    registrarUsuario
} from "../services/authService";
import { extraerMensajeError } from "../utils/errores";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    const verificarSesion = useCallback(async () => {
        try {
            setCargando(true);
            const sesion = await obtenerSesion();
            setUsuario(sesion);
        } catch {
            setUsuario(null);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        verificarSesion();
    }, [verificarSesion]);

    const login = useCallback(async (email, clave) => {
        try {
            const usuarioAutenticado = await iniciarSesion(email, clave);
            setUsuario(usuarioAutenticado);
            return usuarioAutenticado;
        } catch (error) {
            throw new Error(extraerMensajeError(error));
        }
    }, []);

    const register = useCallback(async (datos) => {
        try {
            const usuarioRegistrado = await registrarUsuario(datos);
            setUsuario(usuarioRegistrado);
            return usuarioRegistrado;
        } catch (error) {
            throw new Error(extraerMensajeError(error));
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await cerrarSesion();
        } finally {
            setUsuario(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            usuario,
            cargando,
            autenticado: Boolean(usuario),
            login,
            register,
            logout,
            verificarSesion
        }),
        [usuario, cargando, login, register, logout, verificarSesion]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return context;
};
