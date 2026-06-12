import clienteAxios from "./clienteAxios";

export const obtenerMisProductos = async () => {
    const { data } = await clienteAxios.get("/productos/");
    return data;
};

export const crearProducto = async (producto) => {
    const { data } = await clienteAxios.post("/productos/", producto);
    return data;
};

export const actualizarProducto = async (id, producto) => {
    const { data } = await clienteAxios.put("/productos/" + id, producto);
    return data;
};

export const eliminarProducto = async (id) => {
    const { data } = await clienteAxios.delete("/productos/" + id);
    return data;
};
