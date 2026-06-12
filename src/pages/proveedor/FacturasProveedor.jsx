import { useCallback, useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import {
    anularFactura,
    obtenerFactura,
    obtenerFacturasProveedor
} from "../../services/facturasService";
import { crearDespacho } from "../../services/despachosService";
import { extraerMensajeError } from "../../utils/errores";
import { formatearPrecio } from "../../utils/producto";
import "../../styles/proveedor/Facturas.css";

const ETIQUETAS_ESTADO = {
    pendiente: "Pendiente",
    recibida: "Recibida",
    despachada: "Despachada",
    anulada: "Anulada"
};

const ETIQUETAS_TIPO = {
    reabastecimiento: "Reabastecimiento",
    venta: "Venta"
};

const formatearFecha = (fecha) =>
    new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(fecha));

function FacturasProveedor() {
    const [facturas, setFacturas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
    const [detalle, setDetalle] = useState(null);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const [errorDetalle, setErrorDetalle] = useState("");

    const [mensajeExito, setMensajeExito] = useState("");
    const [facturaAnular, setFacturaAnular] = useState(null);
    const [errorAnular, setErrorAnular] = useState("");
    const [facturaDespachar, setFacturaDespachar] = useState(null);
    const [direccion, setDireccion] = useState("");
    const [errorDireccion, setErrorDireccion] = useState("");
    const [errorDespacho, setErrorDespacho] = useState("");
    const [procesando, setProcesando] = useState(false);

    const cargarFacturas = useCallback(async () => {
        try {
            const data = await obtenerFacturasProveedor();
            setFacturas(data);
        } catch (err) {
            setError(extraerMensajeError(err));
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarFacturas();
    }, [cargarFacturas]);

    useEffect(() => {
        if (!mensajeExito) return undefined;
        const timer = setTimeout(() => setMensajeExito(""), 4000);
        return () => clearTimeout(timer);
    }, [mensajeExito]);

    const abrirDetalle = async (factura) => {
        setFacturaSeleccionada(factura);
        setDetalle(null);
        setErrorDetalle("");
        setCargandoDetalle(true);
        try {
            const data = await obtenerFactura(factura.id);
            setDetalle(data);
        } catch (err) {
            setErrorDetalle(extraerMensajeError(err));
        } finally {
            setCargandoDetalle(false);
        }
    };

    const cerrarDetalle = () => {
        setFacturaSeleccionada(null);
        setDetalle(null);
        setErrorDetalle("");
    };

    const abrirModalAnular = (factura) => {
        setMensajeExito("");
        setErrorAnular("");
        setFacturaAnular(factura);
    };

    const cerrarModalAnular = () => {
        setFacturaAnular(null);
        setErrorAnular("");
    };

    const abrirModalDespachar = (factura) => {
        setMensajeExito("");
        setErrorDespacho("");
        setErrorDireccion("");
        setDireccion("");
        setFacturaDespachar(factura);
    };

    const cerrarModalDespachar = () => {
        setFacturaDespachar(null);
        setDireccion("");
        setErrorDireccion("");
        setErrorDespacho("");
    };

    const handleAnular = async () => {
        if (!facturaAnular) return;

        setMensajeExito("");
        setErrorAnular("");
        setProcesando(true);
        try {
            await anularFactura(facturaAnular.id);
            setMensajeExito(`Factura #${facturaAnular.id} anulada`);
            cerrarModalAnular();
            await cargarFacturas();
        } catch (err) {
            setErrorAnular(extraerMensajeError(err));
        } finally {
            setProcesando(false);
        }
    };

    const handleDespachar = async (evento) => {
        evento.preventDefault();

        setMensajeExito("");
        setErrorDespacho("");
        setErrorDireccion("");

        if (!direccion.trim()) {
            setErrorDireccion("La dirección de entrega es obligatoria");
            return;
        }

        setProcesando(true);
        try {
            await crearDespacho({
                factura: facturaDespachar.id,
                direccion: direccion.trim()
            });
            setMensajeExito(`Factura #${facturaDespachar.id} despachada`);
            cerrarModalDespachar();
            await cargarFacturas();
        } catch (err) {
            setErrorDespacho(extraerMensajeError(err));
        } finally {
            setProcesando(false);
        }
    };

    const renderEstado = (estado) => (
        <span className={"factura-estado factura-estado--" + estado}>
            {ETIQUETAS_ESTADO[estado] ?? estado}
        </span>
    );

    return (
        <section className="facturas">
            <header className="facturas__header">
                <div>
                    <h1 className="facturas__titulo">Mis facturas</h1>
                    <p className="facturas__subtitulo">
                        Pedidos de reabastecimiento recibidos de los vendedores
                    </p>
                </div>
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
                    <p>Cargando facturas…</p>
                </div>
            ) : error ? null : facturas.length === 0 ? (
                <Card className="facturas__vacio">
                    <span className="facturas__vacio-icono" aria-hidden="true">
                        🧾
                    </span>
                    <h2>No tienes facturas</h2>
                    <p>
                        Cuando un vendedor realice un pedido de reabastecimiento
                        con tus productos, la factura aparecerá aquí.
                    </p>
                </Card>
            ) : (
                <Card className="facturas__tarjeta">
                    <div className="facturas-tabla__envoltura">
                        <table className="facturas-tabla">
                            <thead>
                                <tr>
                                    <th>N°</th>
                                    <th>Fecha</th>
                                    <th>Vendedor</th>
                                    <th>Tipo</th>
                                    <th>Estado</th>
                                    <th>Total</th>
                                    <th>
                                        <span className="sr-only">
                                            Acciones
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {facturas.map((factura) => (
                                    <tr
                                        key={factura.id}
                                        className="facturas-tabla__fila"
                                        tabIndex={0}
                                        onClick={() => abrirDetalle(factura)}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                            ) {
                                                e.preventDefault();
                                                abrirDetalle(factura);
                                            }
                                        }}
                                        aria-label={`Ver detalles de la factura ${factura.id}`}
                                    >
                                        <td className="facturas-tabla__id">
                                            #{factura.id}
                                        </td>
                                        <td>{formatearFecha(factura.fecha)}</td>
                                        <td>
                                            {factura.usuarioVendedor?.nombre ??
                                                "—"}
                                        </td>
                                        <td>
                                            {ETIQUETAS_TIPO[factura.tipo] ??
                                                factura.tipo}
                                        </td>
                                        <td>{renderEstado(factura.estado)}</td>
                                        <td className="facturas-tabla__total">
                                            {formatearPrecio(factura.total)}
                                        </td>
                                        <td>
                                            {factura.estado === "pendiente" && (
                                                <div className="facturas-tabla__acciones">
                                                    <Button
                                                        className="btn--sm"
                                                        disabled={procesando}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            abrirModalDespachar(
                                                                factura
                                                            );
                                                        }}
                                                    >
                                                        Despachar
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        className="btn--sm"
                                                        disabled={procesando}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            abrirModalAnular(
                                                                factura
                                                            );
                                                        }}
                                                    >
                                                        Anular
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <Modal
                abierto={Boolean(facturaSeleccionada)}
                titulo={
                    facturaSeleccionada
                        ? `Factura #${facturaSeleccionada.id}`
                        : ""
                }
                onCerrar={cerrarDetalle}
            >
                {cargandoDetalle ? (
                    <div className="estado-carga factura-detalle__carga">
                        <div
                            className="estado-carga__spinner"
                            aria-hidden="true"
                        />
                        <p>Cargando detalles…</p>
                    </div>
                ) : errorDetalle ? (
                    <div className="facturas__error" role="alert">
                        {errorDetalle}
                    </div>
                ) : detalle ? (
                    <div className="factura-detalle">
                        <dl className="factura-detalle__datos">
                            <div>
                                <dt>Estado</dt>
                                <dd>{renderEstado(detalle.estado)}</dd>
                            </div>
                            <div>
                                <dt>Fecha</dt>
                                <dd>{formatearFecha(detalle.fecha)}</dd>
                            </div>
                            <div>
                                <dt>Tipo</dt>
                                <dd>
                                    {ETIQUETAS_TIPO[detalle.tipo] ??
                                        detalle.tipo}
                                </dd>
                            </div>
                            <div>
                                <dt>Vendedor</dt>
                                <dd>
                                    {detalle.usuarioVendedor?.nombre ?? "—"}
                                    {detalle.usuarioVendedor?.email && (
                                        <span className="factura-detalle__email">
                                            {detalle.usuarioVendedor.email}
                                        </span>
                                    )}
                                </dd>
                            </div>
                        </dl>

                        <table className="facturas-tabla factura-detalle__tabla">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio unitario</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(detalle.DetalleFacturas ?? []).map(
                                    (renglon) => (
                                        <tr key={renglon.id}>
                                            <td>{renglon.nombreProducto}</td>
                                            <td>{renglon.cantidad}</td>
                                            <td>
                                                {formatearPrecio(
                                                    renglon.precioProducto
                                                )}
                                            </td>
                                            <td className="facturas-tabla__total">
                                                {formatearPrecio(
                                                    Number(
                                                        renglon.precioProducto
                                                    ) * renglon.cantidad
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>

                        <div className="factura-detalle__total">
                            <span>Total</span>
                            <strong>{formatearPrecio(detalle.total)}</strong>
                        </div>
                    </div>
                ) : null}
            </Modal>

            <Modal
                abierto={Boolean(facturaDespachar)}
                titulo={
                    facturaDespachar
                        ? `Despachar factura #${facturaDespachar.id}`
                        : ""
                }
                onCerrar={cerrarModalDespachar}
                tamano="sm"
            >
                <form className="factura-form" onSubmit={handleDespachar}>
                    {errorDespacho && (
                        <div className="facturas__error" role="alert">
                            {errorDespacho}
                        </div>
                    )}

                    <p className="factura-form__texto">
                        El pedido de{" "}
                        <strong>
                            {facturaDespachar?.usuarioVendedor?.nombre ??
                                "el vendedor"}
                        </strong>{" "}
                        pasará a estado <strong>Despachada</strong> y se creará
                        el despacho correspondiente.
                    </p>

                    <Input
                        label="Dirección de entrega"
                        name="direccion"
                        value={direccion}
                        onChange={(e) => {
                            setDireccion(e.target.value);
                            setErrorDireccion("");
                        }}
                        placeholder="Calle, número, ciudad…"
                        error={errorDireccion}
                        required
                    />

                    <div className="factura-form__acciones">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={cerrarModalDespachar}
                            disabled={procesando}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={procesando}>
                            {procesando ? "Despachando…" : "Despachar"}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                abierto={Boolean(facturaAnular)}
                titulo={
                    facturaAnular ? `Anular factura #${facturaAnular.id}` : ""
                }
                onCerrar={cerrarModalAnular}
                tamano="sm"
            >
                {errorAnular && (
                    <div className="facturas__error" role="alert">
                        {errorAnular}
                    </div>
                )}

                <p className="factura-form__texto">
                    ¿Anular la factura{" "}
                    <strong>#{facturaAnular?.id}</strong> por{" "}
                    <strong>
                        {facturaAnular && formatearPrecio(facturaAnular.total)}
                    </strong>
                    ? Esta acción no se puede deshacer.
                </p>

                <div className="factura-form__acciones">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={cerrarModalAnular}
                        disabled={procesando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleAnular}
                        disabled={procesando}
                    >
                        {procesando ? "Anulando…" : "Anular"}
                    </Button>
                </div>
            </Modal>
        </section>
    );
}

export default FacturasProveedor;
