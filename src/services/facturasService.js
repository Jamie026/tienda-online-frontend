import clienteAxios from "./clienteAxios";

export const crearFactura = async (factura) => {
    const { data } = await clienteAxios.post("/facturas/", factura);
    return data;
};

export const obtenerFacturasProveedor = async () => {
    const { data } = await clienteAxios.get("/facturas/proveedor");
    return data;
};

export const obtenerFactura = async (id) => {
    const { data } = await clienteAxios.get("/facturas/" + id);
    return data;
};

export const anularFactura = async (id) => {
    const { data } = await clienteAxios.put("/facturas/" + id + "/anular");
    return data;
};

export const obtenerVentas = async () => {
    const { data } = await clienteAxios.get("/facturas/ventas");
    return data;
};