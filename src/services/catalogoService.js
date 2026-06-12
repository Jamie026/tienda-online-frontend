import clienteAxios from "./clienteAxios";

export const obtenerTodosLosProductos = async () => {
    const { data } = await clienteAxios.get("/productos/all");
    return data;
};
