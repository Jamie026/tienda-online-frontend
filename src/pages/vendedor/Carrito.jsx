import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { crearFactura } from "../../services/facturasService";
import { extraerMensajeError } from "../../utils/errores";
import { formatearPrecio } from "../../utils/producto";
import "../../styles/vendedor/carrito.css";

const TEXTOS_POR_ROL = {
    vendedor: {
        subtitulo: "Revisa tu pedido de reabastecimiento antes de finalizar",
        vacioTexto:
            "Agrega productos desde la vista de proveedores para armar tu pedido de reabastecimiento.",
        vacioRuta: "/vendedor/proveedores",
        vacioBoton: "Ver proveedores",
        nota: "Se generará una factura por cada proveedor",
        exito: "Pedido(s) de reabastecimiento emitido(s)"
    },
    comprador: {
        subtitulo: "Revisa tu compra antes de finalizar",
        vacioTexto:
            "Agrega productos desde el catálogo para armar tu compra.",
        vacioRuta: "/comprador/catalogo",
        vacioBoton: "Ver catálogo",
        nota: "Se generará una factura por cada vendedor",
        exito: "Compra(s) realizada(s) correctamente"
    }
};

function Carrito() {
    const { usuario } = useAuth();
    const {
        items,
        totalCarrito,
        actualizarCantidad,
        quitarItem,
        vaciarCarrito
    } = useCart();

    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");

    const esVendedor = usuario?.tipo === "vendedor";
    const textos =
        TEXTOS_POR_ROL[usuario?.tipo] ?? TEXTOS_POR_ROL.comprador;

    const grupos = useMemo(() => {
        const mapa = {};
        items.forEach((item) => {
            if (!mapa[item.grupoId]) {
                mapa[item.grupoId] = {
                    id: item.grupoId,
                    nombre: item.grupoNombre,
                    items: []
                };
            }
            mapa[item.grupoId].items.push(item);
        });
        return Object.values(mapa);
    }, [items]);

    const subtotalGrupo = (grupo) =>
        grupo.items.reduce(
            (acc, item) => acc + Number(item.precio) * item.cantidad,
            0
        );

    const handleCantidad = (clave, valor) => {
        const cantidad = Number(valor);
        if (!Number.isInteger(cantidad) || cantidad <= 0) return;
        actualizarCantidad(clave, cantidad);
    };

    const handleFinalizar = async () => {
        setError("");
        setExito("");
        setEnviando(true);
        const facturadas = [];
        try {
            for (const grupo of grupos) {
                const productos = grupo.items.map((item) => ({
                    id: item.id,
                    cantidad: item.cantidad
                }));
                const payload = esVendedor
                    ? {
                          tipo: "reabastecimiento",
                          proveedor: grupo.id,
                          productos
                      }
                    : { tipo: "venta", vendedor: grupo.id, productos };

                await crearFactura(payload);
                facturadas.push(grupo);
                grupo.items.forEach((item) => quitarItem(item.clave));
            }
            vaciarCarrito();
            setExito(textos.exito);
        } catch (err) {
            setError(extraerMensajeError(err));
        } finally {
            setEnviando(false);
        }
    };

    return (
        <section className="carrito">
            <header className="carrito__header">
                <div>
                    <h1 className="carrito__titulo">Mi carrito</h1>
                    <p className="carrito__subtitulo">{textos.subtitulo}</p>
                </div>
                {items.length > 0 && (
                    <Button
                        variant="ghost"
                        onClick={vaciarCarrito}
                        disabled={enviando}
                    >
                        Vaciar carrito
                    </Button>
                )}
            </header>

            {exito && (
                <div className="carrito__exito" role="status">
                    {exito}
                </div>
            )}

            {error && (
                <div className="carrito__error" role="alert">
                    {error}
                </div>
            )}

            {items.length === 0 ? (
                <Card className="carrito__vacio">
                    <span className="carrito__vacio-icono" aria-hidden="true">
                        🛒
                    </span>
                    <h2>Tu carrito está vacío</h2>
                    <p>{textos.vacioTexto}</p>
                    <Link to={textos.vacioRuta}>
                        <Button>{textos.vacioBoton}</Button>
                    </Link>
                </Card>
            ) : (
                <>
                    <div className="carrito__grupos">
                        {grupos.map((grupo) => (
                            <Card key={grupo.id} className="carrito-grupo">
                                <header className="carrito-grupo__cabecera">
                                    <h2 className="carrito-grupo__nombre">
                                        {grupo.nombre}
                                    </h2>
                                    <span className="carrito-grupo__subtotal">
                                        Subtotal:{" "}
                                        {formatearPrecio(subtotalGrupo(grupo))}
                                    </span>
                                </header>

                                <div className="carrito-tabla__envoltura">
                                    <table className="carrito-tabla">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Precio unitario</th>
                                                <th>Cantidad</th>
                                                <th>Total</th>
                                                <th>
                                                    <span className="sr-only">
                                                        Acciones
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {grupo.items.map((item) => (
                                                <tr key={item.clave}>
                                                    <td className="carrito-tabla__nombre">
                                                        {item.nombre}
                                                    </td>
                                                    <td>
                                                        {formatearPrecio(
                                                            item.precio
                                                        )}
                                                    </td>
                                                    <td>
                                                        <input
                                                            className="carrito-tabla__cantidad"
                                                            type="number"
                                                            min="1"
                                                            max={item.stockMax}
                                                            step="1"
                                                            value={
                                                                item.cantidad
                                                            }
                                                            onChange={(e) =>
                                                                handleCantidad(
                                                                    item.clave,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={enviando}
                                                            aria-label={
                                                                "Cantidad de " +
                                                                item.nombre
                                                            }
                                                        />
                                                    </td>
                                                    <td className="carrito-tabla__total">
                                                        {formatearPrecio(
                                                            Number(
                                                                item.precio
                                                            ) * item.cantidad
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="carrito-tabla__quitar"
                                                            onClick={() =>
                                                                quitarItem(
                                                                    item.clave
                                                                )
                                                            }
                                                            disabled={enviando}
                                                            aria-label={
                                                                "Quitar " +
                                                                item.nombre
                                                            }
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card className="carrito__resumen">
                        <div className="carrito__total">
                            <span>Total final</span>
                            <strong>{formatearPrecio(totalCarrito)}</strong>
                        </div>
                        {grupos.length > 1 && (
                            <p className="carrito__nota">
                                {textos.nota} ({grupos.length} en total).
                            </p>
                        )}
                        <Button onClick={handleFinalizar} disabled={enviando}>
                            {enviando ? "Procesando…" : "Finalizar compra"}
                        </Button>
                    </Card>
                </>
            )}
        </section>
    );
}

export default Carrito;
