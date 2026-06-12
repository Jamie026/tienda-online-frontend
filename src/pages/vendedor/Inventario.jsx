import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import {
    liberarInventario,
    obtenerMiInventario
} from "../../services/inventarioService";
import { extraerMensajeError } from "../../utils/errores";
import { formatearPrecio } from "../../utils/producto";
import "../../styles/proveedor/Facturas.css";
import "../../styles/vendedor/inventario.css";

function Inventario() {
    const [inventario, setInventario] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const [itemLiberar, setItemLiberar] = useState(null);
    const [errorLiberar, setErrorLiberar] = useState("");
    const [procesando, setProcesando] = useState(false);

    const cargarInventario = useCallback(async () => {
        try {
            const data = await obtenerMiInventario();
            setInventario(data);
        } catch (err) {
            setError(extraerMensajeError(err));
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarInventario();
    }, [cargarInventario]);

    useEffect(() => {
        if (!mensajeExito) return undefined;
        const timer = setTimeout(() => setMensajeExito(""), 4000);
        return () => clearTimeout(timer);
    }, [mensajeExito]);

    const inventarioFiltrado = useMemo(() => {
        if (!busqueda.trim()) return inventario;
        const termino = busqueda.toLowerCase();
        return inventario.filter((item) =>
            (item.Producto?.nombre ?? "").toLowerCase().includes(termino)
        );
    }, [inventario, busqueda]);

    const abrirModalLiberar = (item) => {
        setMensajeExito("");
        setErrorLiberar("");
        setItemLiberar(item);
    };

    const cerrarModalLiberar = () => {
        setItemLiberar(null);
        setErrorLiberar("");
    };

    const handleLiberar = async () => {
        if (!itemLiberar) return;

        setMensajeExito("");
        setErrorLiberar("");
        setProcesando(true);
        try {
            await liberarInventario(itemLiberar.id);
            setMensajeExito(
                `Dejaste de trabajar "${itemLiberar.Producto?.nombre ?? "el producto"}"`
            );
            cerrarModalLiberar();
            await cargarInventario();
        } catch (err) {
            setErrorLiberar(extraerMensajeError(err));
        } finally {
            setProcesando(false);
        }
    };

    return (
        <section className="inventario">
            <header className="inventario__header">
                <div>
                    <h1 className="inventario__titulo">Mi inventario</h1>
                    <p className="inventario__subtitulo">
                        Stock disponible de los productos que trabajas
                    </p>
                </div>
                <input
                    className="inventario__busqueda"
                    type="search"
                    placeholder="Buscar producto…"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    aria-label="Buscar producto en inventario"
                />
            </header>

            {mensajeExito && (
                <div className="facturas__exito" role="status">
                    {mensajeExito}
                </div>
            )}

            {error && (
                <div className="facturas__error" role="alert">
                    {error}
                </div>
            )}

            {cargando ? (
                <div className="estado-carga">
                    <div className="estado-carga__spinner" aria-hidden="true" />
                    <p>Cargando inventario…</p>
                </div>
            ) : error ? null : inventarioFiltrado.length === 0 ? (
                <Card className="inventario__vacio">
                    <span
                        className="inventario__vacio-icono"
                        aria-hidden="true"
                    >
                        📋
                    </span>
                    <h2>
                        {busqueda ? "Sin resultados" : "Tu inventario está vacío"}
                    </h2>
                    <p>
                        {busqueda
                            ? `No hay productos que coincidan con "${busqueda}".`
                            : "Cuando recibas pedidos de reabastecimiento, el stock aparecerá aquí."}
                    </p>
                </Card>
            ) : (
                <Card>
                    <div className="facturas-tabla__envoltura">
                        <table className="facturas-tabla">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Descripción</th>
                                    <th>Precio</th>
                                    <th>Cantidad</th>
                                    <th>
                                        <span className="sr-only">
                                            Acciones
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventarioFiltrado.map((item) => (
                                    <tr key={item.id}>
                                        <td className="facturas-tabla__id">
                                            {item.Producto?.nombre ?? "—"}
                                        </td>
                                        <td className="inventario__descripcion">
                                            {item.Producto?.descripcion ?? "—"}
                                        </td>
                                        <td>
                                            {item.Producto
                                                ? formatearPrecio(
                                                      item.Producto.precio
                                                  )
                                                : "—"}
                                        </td>
                                        <td className="inventario__cantidad">
                                            {item.cantidad}
                                        </td>
                                        <td>
                                            <div className="facturas-tabla__acciones">
                                                <Button
                                                    variant="danger"
                                                    className="btn--sm"
                                                    disabled={procesando}
                                                    onClick={() =>
                                                        abrirModalLiberar(item)
                                                    }
                                                >
                                                    Liberar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <Modal
                abierto={Boolean(itemLiberar)}
                titulo="Liberar inventario"
                onCerrar={cerrarModalLiberar}
                tamano="sm"
            >
                {errorLiberar && (
                    <div className="facturas__error" role="alert">
                        {errorLiberar}
                    </div>
                )}

                <p className="factura-form__texto">
                    ¿Dejar de trabajar{" "}
                    <strong>{itemLiberar?.Producto?.nombre}</strong>? Se
                    eliminará el registro con{" "}
                    <strong>{itemLiberar?.cantidad}</strong>{" "}
                    {itemLiberar?.cantidad === 1 ? "unidad" : "unidades"} en
                    stock. Esta acción no se puede deshacer.
                </p>

                <div className="factura-form__acciones">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={cerrarModalLiberar}
                        disabled={procesando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleLiberar}
                        disabled={procesando}
                    >
                        {procesando ? "Liberando…" : "Liberar"}
                    </Button>
                </div>
            </Modal>
        </section>
    );
}

export default Inventario;
