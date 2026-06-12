import clienteAxios from "./clienteAxios";

export const obtenerMiInventario = async () => {
    const { data } = await clienteAxios.get("/inventario/");
    return data;
};

export const liberarInventario = async (id) => {
    const { data } = await clienteAxios.delete("/inventario/" + id);
    return data;
};

export const obtenerInventarioDisponible = async () => {
    const { data } = await clienteAxios.get("/inventario/disponible");
    return data;
};
