import clienteAxios from "./clienteAxios";

export const obtenerDespachosProveedor = async () => {
    const { data } = await clienteAxios.get("/despachos/");
    return data;
};

export const crearDespacho = async (despacho) => {
    const { data } = await clienteAxios.post("/despachos/", despacho);
    return data;
};

export const anularDespacho = async (id) => {
    const { data } = await clienteAxios.put("/despachos/" + id + "/anular");
    return data;
};

export const obtenerDespachosVendedor = async () => {
    const { data } = await clienteAxios.get("/despachos/vendedor");
    return data;
};

export const recibirDespacho = async (id) => {
    const { data } = await clienteAxios.put("/despachos/" + id + "/recibir");
    return data;
};

export const obtenerDespachosComprador = async () => {
    const { data } = await clienteAxios.get("/despachos/comprador");
    return data;
};

export const obtenerDespachosVentas = async () => {
    const { data } = await clienteAxios.get("/despachos/ventas");
    return data;
};
