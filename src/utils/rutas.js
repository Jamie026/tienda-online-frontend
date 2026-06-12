export const RUTAS_POR_ROL = {
    comprador: "/comprador/catalogo",
    vendedor: "/vendedor/proveedores",
    proveedor: "/proveedor/productos",
};

export const obtenerRutaPorRol = (tipo) =>
    RUTAS_POR_ROL[tipo] ?? "/login";

export const ETIQUETAS_ROL = {
    comprador: "Comprador",
    vendedor: "Vendedor",
    proveedor: "Proveedor",
};
