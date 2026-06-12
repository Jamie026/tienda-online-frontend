import { useCallback, useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import {
    anularFactura,
    obtenerFactura,
    obtenerVentas
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

const formatearFecha = (fecha) =>
    new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(fecha));

function Ventas() {
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
    const [detalle, setDetalle] = useState(null);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const [errorDetalle, setErrorDetalle] = useState("");

    const [ventaAnular, setVentaAnular] = useState(null);
    const [errorAnular, setErrorAnular] = useState("");
    const [ventaDespachar, setVentaDespachar] = useState(null);
    const [direccion, setDireccion] = useState("");
    const [errorDireccion, setErrorDireccion] = useState("");
    const [errorDespacho, setErrorDespacho] = useState("");
    const [procesando, setProcesando] = useState(false);

    const cargarVentas = useCallback(async () => {
        try {
            const data = await obtenerVentas();
            setVentas(data);
        } catch (err) {
            setError(extraerMensajeError(err));
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarVentas();
    }, [cargarVentas]);

    useEffect(() => {
        if (!mensajeExito) return undefined;
        const timer = setTimeout(() => setMensajeExito(""), 4000);
        return () => clearTimeout(timer);
    }, [mensajeExito]);

    const abrirDetalle = async (venta) => {
        setVentaSeleccionada(venta);
        setDetalle(null);
        setErrorDetalle("");
        setCargandoDetalle(true);
        try {
            const data = await obtenerFactura(venta.id);
            setDetalle(data);
        } catch (err) {
            setErrorDetalle(extraerMensajeError(err));
        } finally {
            setCargandoDetalle(false);
        }
    };

    const cerrarDetalle = () => {
        setVentaSeleccionada(null);
        setDetalle(null);
        setErrorDetalle("");
    };

    const abrirModalAnular = (venta) => {
        setMensajeExito("");
        setErrorAnular("");
        setVentaAnular(venta);
    };

    const cerrarModalAnular = () => {
        setVentaAnular(null);
        setErrorAnular("");
    };

    const abrirModalDespachar = (venta) => {
        setMensajeExito("");
        setErrorDespacho("");
        setErrorDireccion("");
        setDireccion("");
        setVentaDespachar(venta);
    };

    const cerrarModalDespachar = () => {
        setVentaDespachar(null);
        setDireccion("");
        setErrorDireccion("");
        setErrorDespacho("");
    };

    const handleAnular = async () => {
        if (!ventaAnular) return;

        setMensajeExito("");
        setErrorAnular("");
        setProcesando(true);
        try {
            await anularFactura(ventaAnular.id);
            setMensajeExito(
                `Venta #${ventaAnular.id} anulada. El stock fue devuelto a tu inventario.`
            );
            cerrarModalAnular();
            await cargarVentas();
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
                factura: ventaDespachar.id,
                direccion: direccion.trim()
            });
            setMensajeExito(`Venta #${ventaDespachar.id} despachada`);
            cerrarModalDespachar();
            await cargarVentas();
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
                    <h1 className="facturas__titulo">Mis ventas</h1>
                    <p className="facturas__subtitulo">
                        Compras realizadas por los compradores
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
                    <p>Cargando ventas…</p>
                </div>
            ) : error ? null : ventas.length === 0 ? (
                <Card className="facturas__vacio">
                    <span className="facturas__vacio-icono" aria-hidden="true">
                        💰
                    </span>
                    <h2>No tienes ventas</h2>
                    <p>
                        Cuando un comprador realice una compra de tu
                        inventario, la factura aparecerá aquí.
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
                                    <th>Comprador</th>
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
                                {ventas.map((venta) => (
                                    <tr
                                        key={venta.id}
                                        className="facturas-tabla__fila"
                                        tabIndex={0}
                                        onClick={() => abrirDetalle(venta)}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                            ) {
                                                e.preventDefault();
                                                abrirDetalle(venta);
                                            }
                                        }}
                                        aria-label={
                                            "Ver detalles de la venta " +
                                            venta.id
                                        }
                                    >
                                        <td className="facturas-tabla__id">
                                            #{venta.id}
                                        </td>
                                        <td>{formatearFecha(venta.fecha)}</td>
                                        <td>
                                            {venta.usuarioComprador?.nombre ??
                                                "—"}
                                        </td>
                                        <td>{renderEstado(venta.estado)}</td>
                                        <td className="facturas-tabla__total">
                                            {formatearPrecio(venta.total)}
                                        </td>
                                        <td>
                                            {venta.estado === "pendiente" && (
                                                <div className="facturas-tabla__acciones">
                                                    <Button
                                                        className="btn--sm"
                                                        disabled={procesando}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            abrirModalDespachar(
                                                                venta
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
                                                                venta
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
                abierto={Boolean(ventaSeleccionada)}
                titulo={
                    ventaSeleccionada ? `Venta #${ventaSeleccionada.id}` : ""
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
                                <dt>Comprador</dt>
                                <dd>
                                    {detalle.usuarioComprador?.nombre ?? "—"}
                                    {detalle.usuarioComprador?.email && (
                                        <span className="factura-detalle__email">
                                            {detalle.usuarioComprador.email}
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
                abierto={Boolean(ventaDespachar)}
                titulo={
                    ventaDespachar
                        ? `Despachar venta #${ventaDespachar.id}`
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
                        La compra de{" "}
                        <strong>
                            {ventaDespachar?.usuarioComprador?.nombre ??
                                "el comprador"}
                        </strong>{" "}
                        pasará a estado <strong>Despachada</strong> y se creará
                        el envío correspondiente.
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
                abierto={Boolean(ventaAnular)}
                titulo={ventaAnular ? `Anular venta #${ventaAnular.id}` : ""}
                onCerrar={cerrarModalAnular}
                tamano="sm"
            >
                {errorAnular && (
                    <div className="facturas__error" role="alert">
                        {errorAnular}
                    </div>
                )}

                <p className="factura-form__texto">
                    ¿Anular la venta <strong>#{ventaAnular?.id}</strong> por{" "}
                    <strong>
                        {ventaAnular && formatearPrecio(ventaAnular.total)}
                    </strong>
                    ? Las cantidades volverán a tu inventario.
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

export default Ventas;
