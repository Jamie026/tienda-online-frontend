import clienteAxios from "./clienteAxios";

export const obtenerSesion = async () => {
    try {
        const { data } = await clienteAxios.get("/usuarios/me");
        return data;
    } catch (error) {
        if (error.response?.status === 401) return null;
        throw error;
    }
};

export const iniciarSesion = async (email, clave) => {
    const { data } = await clienteAxios.post("/usuarios/login", {
        email,
        clave
    });
    return data;
};

export const registrarUsuario = async (datos) => {
    const { data } = await clienteAxios.post("/usuarios/register", datos);
    return data;
};

export const cerrarSesion = async () => {
    await clienteAxios.post("/usuarios/logout");
};
