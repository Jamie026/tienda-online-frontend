import { useCallback, useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import {
    obtenerDespachosVendedor,
    recibirDespacho
} from "../../services/despachosService";
import { extraerMensajeError } from "../../utils/errores";
import { formatearPrecio } from "../../utils/producto";
import "../../styles/proveedor/Facturas.css";
import "../../styles/vendedor/pedidos.css";

const ETIQUETAS_ESTADO = {
    enviando: "En envío",
    entregado: "Entregado",
    anulado: "Anulado"
};

const formatearFecha = (fecha) =>
    new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(fecha));

function Pedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    const [pedidoRecibir, setPedidoRecibir] = useState(null);
    const [errorRecibir, setErrorRecibir] = useState("");
    const [procesando, setProcesando] = useState(false);

    const cargarPedidos = useCallback(async () => {
        try {
            const data = await obtenerDespachosVendedor();
            setPedidos(data);
        } catch (err) {
            setError(extraerMensajeError(err));
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarPedidos();
    }, [cargarPedidos]);

    useEffect(() => {
        if (!mensajeExito) return undefined;
        const timer = setTimeout(() => setMensajeExito(""), 4000);
        return () => clearTimeout(timer);
    }, [mensajeExito]);

    const abrirModalRecibir = (pedido) => {
        setMensajeExito("");
        setErrorRecibir("");
        setPedidoRecibir(pedido);
    };

    const cerrarModalRecibir = () => {
        setPedidoRecibir(null);
        setErrorRecibir("");
    };

    const handleRecibir = async () => {
        if (!pedidoRecibir) return;

        setMensajeExito("");
        setErrorRecibir("");
        setProcesando(true);
        try {
            await recibirDespacho(pedidoRecibir.id);
            setMensajeExito(
                `Pedido #${pedidoRecibir.id} recibido. Tu inventario fue actualizado.`
            );
            cerrarModalRecibir();
            await cargarPedidos();
        } catch (err) {
            setErrorRecibir(extraerMensajeError(err));
        } finally {
            setProcesando(false);
        }
    };

    return (
        <section className="pedidos">
            <header className="pedidos__header">
                <div>
                    <h1 className="pedidos__titulo">Mis pedidos</h1>
                    <p className="pedidos__subtitulo">
                        Despachos enviados por tus proveedores
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
                    <p>Cargando pedidos…</p>
                </div>
            ) : error ? null : pedidos.length === 0 ? (
                <Card className="pedidos__vacio">
                    <span className="pedidos__vacio-icono" aria-hidden="true">
                        📦
                    </span>
                    <h2>No tienes pedidos en camino</h2>
                    <p>
                        Cuando un proveedor despache una de tus facturas de
                        reabastecimiento, el envío aparecerá aquí.
                    </p>
                </Card>
            ) : (
                <Card>
                    <div className="facturas-tabla__envoltura">
                        <table className="facturas-tabla">
                            <thead>
                                <tr>
                                    <th>N°</th>
                                    <th>Factura</th>
                                    <th>Proveedor</th>
                                    <th>Fecha</th>
                                    <th>Dirección</th>
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
                                {pedidos.map((pedido) => (
                                    <tr key={pedido.id}>
                                        <td className="facturas-tabla__id">
                                            #{pedido.id}
                                        </td>
                                        <td>#{pedido.factura}</td>
                                        <td>
                                            {pedido.Factura?.usuarioProveedor
                                                ?.nombre ?? "—"}
                                        </td>
                                        <td>{formatearFecha(pedido.fecha)}</td>
                                        <td className="pedidos__direccion">
                                            {pedido.direccion}
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    "factura-estado factura-estado--" +
                                                    pedido.estado
                                                }
                                            >
                                                {ETIQUETAS_ESTADO[
                                                    pedido.estado
                                                ] ?? pedido.estado}
                                            </span>
                                        </td>
                                        <td className="facturas-tabla__total">
                                            {pedido.Factura
                                                ? formatearPrecio(
                                                      pedido.Factura.total
                                                  )
                                                : "—"}
                                        </td>
                                        <td>
                                            {pedido.estado === "enviando" && (
                                                <div className="facturas-tabla__acciones">
                                                    <Button
                                                        className="btn--sm"
                                                        disabled={procesando}
                                                        onClick={() =>
                                                            abrirModalRecibir(
                                                                pedido
                                                            )
                                                        }
                                                    >
                                                        Marcar como recibido
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
                abierto={Boolean(pedidoRecibir)}
                titulo={
                    pedidoRecibir
                        ? `Recibir pedido #${pedidoRecibir.id}`
                        : ""
                }
                onCerrar={cerrarModalRecibir}
                tamano="sm"
            >
                {errorRecibir && (
                    <div className="facturas__error" role="alert">
                        {errorRecibir}
                    </div>
                )}

                <p className="factura-form__texto">
                    ¿Confirmas la recepción del pedido de{" "}
                    <strong>
                        {pedidoRecibir?.Factura?.usuarioProveedor?.nombre ??
                            "tu proveedor"}
                    </strong>
                    ? La factura pasará a <strong>Recibida</strong> y las
                    cantidades se sumarán a tu inventario.
                </p>

                <div className="factura-form__acciones">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={cerrarModalRecibir}
                        disabled={procesando}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleRecibir} disabled={procesando}>
                        {procesando ? "Confirmando…" : "Marcar como recibido"}
                    </Button>
                </div>
            </Modal>
        </section>
    );
}

export default Pedidos;
