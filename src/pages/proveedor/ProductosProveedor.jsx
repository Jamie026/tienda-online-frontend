import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import {
    actualizarProducto,
    crearProducto,
    eliminarProducto,
    obtenerMisProductos
} from "../../services/productosService";
import { extraerMensajeError } from "../../utils/errores";
import {
    formatearPrecio,
    formularioProductoVacio,
    productoAFormulario,
    validarProducto
} from "../../utils/producto";
import "../../styles/proveedor/Productos.css";

function ProductosProveedor() {
    const location = useLocation();
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorLista, setErrorLista] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    const [modalFormulario, setModalFormulario] = useState(false);
    const [modalEliminar, setModalEliminar] = useState(false);
    const [productoEditando, setProductoEditando] = useState(null);
    const [productoEliminar, setProductoEliminar] = useState(null);

    const [formulario, setFormulario] = useState(formularioProductoVacio());
    const [erroresForm, setErroresForm] = useState({});
    const [errorForm, setErrorForm] = useState("");
    const [enviando, setEnviando] = useState(false);

    const cargarProductos = useCallback(async () => {
        try {
            setCargando(true);
            const data = await obtenerMisProductos();
            setProductos(data);
            setErrorLista("");
        } catch (error) {
            setErrorLista(extraerMensajeError(error));
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarProductos();
    }, [cargarProductos]);

    useEffect(() => {
        if (!location.state?.abrirModal) return;

        setProductoEditando(null);
        setFormulario(formularioProductoVacio());
        setErroresForm({});
        setErrorForm("");
        setModalFormulario(true);
        window.history.replaceState({}, document.title);
    }, [location.state]);

    useEffect(() => {
        if (!mensajeExito) return undefined;
        const timer = setTimeout(() => setMensajeExito(""), 4000);
        return () => clearTimeout(timer);
    }, [mensajeExito]);

    const abrirModalCrear = () => {
        setProductoEditando(null);
        setFormulario(formularioProductoVacio());
        setErroresForm({});
        setErrorForm("");
        setModalFormulario(true);
    };

    const abrirModalEditar = (producto) => {
        setProductoEditando(producto);
        setFormulario(productoAFormulario(producto));
        setErroresForm({});
        setErrorForm("");
        setModalFormulario(true);
    };

    const cerrarModalFormulario = () => {
        setModalFormulario(false);
        setProductoEditando(null);
        setFormulario(formularioProductoVacio());
        setErroresForm({});
        setErrorForm("");
    };

    const abrirModalEliminar = (producto) => {
        setProductoEliminar(producto);
        setModalEliminar(true);
    };

    const cerrarModalEliminar = () => {
        setProductoEliminar(null);
        setModalEliminar(false);
    };

    const actualizarCampo = (campo, valor) => {
        setFormulario((prev) => ({ ...prev, [campo]: valor }));
        setErroresForm((prev) => ({ ...prev, [campo]: undefined }));
    };

    const handleSubmit = async (evento) => {
        evento.preventDefault();
        setErrorForm("");
        setMensajeExito("");

        const errores = validarProducto(formulario);
        if (Object.keys(errores).length > 0) {
            setErroresForm(errores);
            return;
        }

        const payload = {
            nombre: formulario.nombre.trim(),
            descripcion: formulario.descripcion.trim(),
            precio: Number(formulario.precio)
        };

        setEnviando(true);
        try {
            if (productoEditando) {
                await actualizarProducto(productoEditando.id, payload);
                setMensajeExito("Producto actualizado correctamente");
            } else {
                await crearProducto(payload);
                setMensajeExito("Producto registrado correctamente");
            }
            cerrarModalFormulario();
            await cargarProductos();
        } catch (error) {
            setErrorForm(extraerMensajeError(error));
        } finally {
            setEnviando(false);
        }
    };

    const handleEliminar = async () => {
        if (!productoEliminar) return;

        setMensajeExito("");
        setErrorLista("");
        setEnviando(true);
        try {
            await eliminarProducto(productoEliminar.id);
            setMensajeExito("Producto eliminado correctamente");
            cerrarModalEliminar();
            await cargarProductos();
        } catch (error) {
            setErrorLista(extraerMensajeError(error));
            cerrarModalEliminar();
        } finally {
            setEnviando(false);
        }
    };

    return (
        <section className="productos">
            <header className="productos__header">
                <div>
                    <h1 className="productos__titulo">Mis productos</h1>
                    <p className="productos__subtitulo">
                        Gestiona el catálogo que verán los vendedores
                    </p>
                </div>
                <Button onClick={abrirModalCrear}>+ Registrar producto</Button>
            </header>

            {mensajeExito && (
                <div className="productos__exito" role="status">
                    {mensajeExito}
                </div>
            )}

            {errorLista && (
                <div className="productos__error" role="alert">
                    {errorLista}
                </div>
            )}

            {cargando ? (
                <div className="estado-carga">
                    <div className="estado-carga__spinner" aria-hidden="true" />
                    <p>Cargando productos…</p>
                </div>
            ) : errorLista && productos.length === 0 ? (
                null
            ) : productos.length === 0 ? (
                <Card className="productos__vacio">
                    <span className="productos__vacio-icono">📋</span>
                    <h2>Aún no tienes productos</h2>
                    <p>
                        Registra tu primer producto para que los vendedores
                        puedan incluirlo en su inventario.
                    </p>
                    <Button onClick={abrirModalCrear}>
                        Registrar producto
                    </Button>
                </Card>
            ) : (
                <div className="productos__grid">
                    {productos.map((producto) => (
                        <Card key={producto.id} hover className="producto-card">
                            <div className="producto-card__precio">
                                {formatearPrecio(producto.precio)}
                            </div>
                            <h3 className="producto-card__nombre">
                                {producto.nombre}
                            </h3>
                            <p className="producto-card__descripcion">
                                {producto.descripcion}
                            </p>
                            <div className="producto-card__acciones">
                                <Button
                                    variant="secondary"
                                    className="btn--sm"
                                    onClick={() => abrirModalEditar(producto)}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="danger"
                                    className="btn--sm"
                                    onClick={() => abrirModalEliminar(producto)}
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                abierto={modalFormulario}
                titulo={
                    productoEditando ? "Editar producto" : "Registrar producto"
                }
                onCerrar={cerrarModalFormulario}
            >
                <form className="producto-form" onSubmit={handleSubmit}>
                    {errorForm && (
                        <div className="producto-form__error" role="alert">
                            {errorForm}
                        </div>
                    )}

                    <Input
                        label="Nombre"
                        name="nombre"
                        value={formulario.nombre}
                        onChange={(e) =>
                            actualizarCampo("nombre", e.target.value)
                        }
                        placeholder="Ej. Auriculares Pro X"
                        error={erroresForm.nombre}
                        required
                    />

                    <Input
                        label="Descripción"
                        as="textarea"
                        name="descripcion"
                        value={formulario.descripcion}
                        onChange={(e) =>
                            actualizarCampo("descripcion", e.target.value)
                        }
                        placeholder="Describe las características del producto"
                        error={erroresForm.descripcion}
                        required
                    />

                    <Input
                        label="Precio"
                        type="number"
                        name="precio"
                        value={formulario.precio}
                        onChange={(e) =>
                            actualizarCampo("precio", e.target.value)
                        }
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        error={erroresForm.precio}
                        required
                    />

                    <div className="producto-form__acciones">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={cerrarModalFormulario}
                            disabled={enviando}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={enviando}>
                            {enviando
                                ? "Guardando…"
                                : productoEditando
                                  ? "Guardar cambios"
                                  : "Registrar"}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                abierto={modalEliminar}
                titulo="Eliminar producto"
                onCerrar={cerrarModalEliminar}
                tamano="sm"
            >
                <p className="producto-eliminar__texto">
                    ¿Eliminar <strong>{productoEliminar?.nombre}</strong>? Esta
                    acción no se puede deshacer.
                </p>
                <div className="producto-form__acciones">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={cerrarModalEliminar}
                        disabled={enviando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleEliminar}
                        disabled={enviando}
                    >
                        {enviando ? "Eliminando…" : "Eliminar"}
                    </Button>
                </div>
            </Modal>
        </section>
    );
}

export default ProductosProveedor;
