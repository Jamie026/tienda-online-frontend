import { useCallback, useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import {
    anularDespacho,
    obtenerDespachosVentas
} from "../../services/despachosService";
import { extraerMensajeError } from "../../utils/errores";
import "../../styles/proveedor/Facturas.css";
import "../../styles/proveedor/Despachos.css";

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

function DespachosVendedor() {
    const [despachos, setDespachos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    const [despachoAnular, setDespachoAnular] = useState(null);
    const [errorAnular, setErrorAnular] = useState("");
    const [procesando, setProcesando] = useState(false);

    const cargarDespachos = useCallback(async () => {
        try {
            const data = await obtenerDespachosVentas();
            setDespachos(data);
        } catch (err) {
            setError(extraerMensajeError(err));
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarDespachos();
    }, [cargarDespachos]);

    useEffect(() => {
        if (!mensajeExito) return undefined;
        const timer = setTimeout(() => setMensajeExito(""), 4000);
        return () => clearTimeout(timer);
    }, [mensajeExito]);

    const abrirModalAnular = (despacho) => {
        setMensajeExito("");
        setErrorAnular("");
        setDespachoAnular(despacho);
    };

    const cerrarModalAnular = () => {
        setDespachoAnular(null);
        setErrorAnular("");
    };

    const handleAnular = async () => {
        if (!despachoAnular) return;

        setMensajeExito("");
        setErrorAnular("");
        setProcesando(true);
        try {
            await anularDespacho(despachoAnular.id);
            setMensajeExito(
                `Despacho #${despachoAnular.id} anulado. La venta volvió a estado pendiente.`
            );
            cerrarModalAnular();
            await cargarDespachos();
        } catch (err) {
            setErrorAnular(extraerMensajeError(err));
        } finally {
            setProcesando(false);
        }
    };

    return (
        <section className="despachos">
            <header className="despachos__header">
                <div>
                    <h1 className="despachos__titulo">Mis despachos</h1>
                    <p className="despachos__subtitulo">
                        Envíos de tus ventas a los compradores
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
                    <p>Cargando despachos…</p>
                </div>
            ) : error ? null : despachos.length === 0 ? (
                <Card className="despachos__vacio">
                    <span className="despachos__vacio-icono" aria-hidden="true">
                        🚚
                    </span>
                    <h2>No tienes despachos</h2>
                    <p>
                        Cuando despaches una venta pendiente, el envío
                        aparecerá aquí.
                    </p>
                </Card>
            ) : (
                <Card>
                    <div className="facturas-tabla__envoltura">
                        <table className="facturas-tabla">
                            <thead>
                                <tr>
                                    <th>N°</th>
                                    <th>Venta</th>
                                    <th>Comprador</th>
                                    <th>Fecha</th>
                                    <th>Dirección</th>
                                    <th>Estado</th>
                                    <th>
                                        <span className="sr-only">
                                            Acciones
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {despachos.map((despacho) => (
                                    <tr key={despacho.id}>
                                        <td className="facturas-tabla__id">
                                            #{despacho.id}
                                        </td>
                                        <td>#{despacho.factura}</td>
                                        <td>
                                            {despacho.Factura?.usuarioComprador
                                                ?.nombre ?? "—"}
                                        </td>
                                        <td>
                                            {formatearFecha(despacho.fecha)}
                                        </td>
                                        <td className="despachos__direccion">
                                            {despacho.direccion}
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    "factura-estado factura-estado--" +
                                                    despacho.estado
                                                }
                                            >
                                                {ETIQUETAS_ESTADO[
                                                    despacho.estado
                                                ] ?? despacho.estado}
                                            </span>
                                        </td>
                                        <td>
                                            {despacho.estado === "enviando" && (
                                                <div className="facturas-tabla__acciones">
                                                    <Button
                                                        variant="danger"
                                                        className="btn--sm"
                                                        disabled={procesando}
                                                        onClick={() =>
                                                            abrirModalAnular(
                                                                despacho
                                                            )
                                                        }
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
                abierto={Boolean(despachoAnular)}
                titulo={
                    despachoAnular
                        ? `Anular despacho #${despachoAnular.id}`
                        : ""
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
                    ¿Anular el envío de la venta{" "}
                    <strong>#{despachoAnular?.factura}</strong>? La venta
                    volverá a estado <strong>Pendiente</strong> y podrás
                    despacharla de nuevo.
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

export default DespachosVendedor;
