const validarProducto = ({ nombre, descripcion, precio }) => {
    const errores = {};

    if (!nombre?.trim()) errores.nombre = "El nombre es obligatorio";
    if (!descripcion?.trim())
        errores.descripcion = "La descripción es obligatoria";

    const precioNum = Number(precio);
    if (precio === "" || precio === null || Number.isNaN(precioNum)) {
        errores.precio = "Ingresa un precio válido";
    } else if (precioNum <= 0) {
        errores.precio = "El precio debe ser mayor a 0";
    }

    return errores;
};

export const formularioProductoVacio = () => ({
    nombre: "",
    descripcion: "",
    precio: "",
});

export const productoAFormulario = (producto) => ({
    nombre: producto.nombre ?? "",
    descripcion: producto.descripcion ?? "",
    precio: String(producto.precio ?? ""),
});

export { validarProducto };

export const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
    }).format(Number(precio));
