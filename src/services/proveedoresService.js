import clienteAxios from "./clienteAxios";

export const obtenerProveedores = async () => {
    const { data } = await clienteAxios.get("/usuarios/proveedores");
    return data;
};

export const obtenerProductosConProveedor = async () => {
    const { data } = await clienteAxios.get("/productos/all");
    return data;
};