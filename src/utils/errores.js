export const extraerMensajeError = (error) => {
    const data = error?.response?.data;

    if (!data) return "Error de conexión con el servidor";

    if (typeof data.error === "string") return data.error;

    if (Array.isArray(data.errores) && data.errores.length > 0) {
        return data.errores.join(". ");
    }

    return "Ocurrió un error inesperado";
};
