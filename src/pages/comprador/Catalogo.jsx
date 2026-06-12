import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { useCart } from "../../context/CartContext";
import { obtenerInventarioDisponible } from "../../services/inventarioService";
import { extraerMensajeError } from "../../utils/errores";
import { formatearPrecio } from "../../utils/producto";
import "../../styles/comprador/catalogo.css";

function Catalogo() {
    const { agregarItem } = useCart();
    const [inventario, setInventario] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState("1");
    const [errorCantidad, setErrorCantidad] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await obtenerInventarioDisponible();
                setInventario(data);
            } catch (err) {
                setError(extraerMensajeError(err));
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, []);

    useEffect(() => {
        if (!mensajeExito) return undefined;
        const timer = setTimeout(() => setMensajeExito(""), 3000);
        return () => clearTimeout(timer);
    }, [mensajeExito]);

    const inventarioFiltrado = useMemo(() => {
        if (!busqueda.trim()) return inventario;
        const termino = busqueda.toLowerCase();
        return inventario.filter(
            (item) =>
                (item.Producto?.nombre ?? "")
                    .toLowerCase()
                    .includes(termino) ||
                (item.Producto?.descripcion ?? "")
                    .toLowerCase()
                    .includes(termino) ||
                (item.Usuario?.nombre ?? "").toLowerCase().includes(termino)
        );
    }, [inventario, busqueda]);

    const abrirModalCantidad = (item) => {
        setMensajeExito("");
        setErrorCantidad("");
        setCantidad("1");
        setItemSeleccionado(item);
    };

    const cerrarModalCantidad = () => {
        setItemSeleccionado(null);
        setCantidad("1");
        setErrorCantidad("");
    };

    const handleAgregar = (evento) => {
        evento.preventDefault();
        setMensajeExito("");
        setErrorCantidad("");

        const cantidadNum = Number(cantidad);
        if (!Number.isInteger(cantidadNum) || cantidadNum <= 0) {
            setErrorCantidad("Ingresa una cantidad entera mayor a 0");
            return;
        }
        if (cantidadNum > itemSeleccionado.cantidad) {
            setErrorCantidad(
                "Solo hay " +
                    itemSeleccionado.cantidad +
                    " unidad(es) disponibles"
            );
            return;
        }

        agregarItem(
            {
                id: itemSeleccionado.Producto.id,
                nombre: itemSeleccionado.Producto.nombre,
                precio: itemSeleccionado.Producto.precio,
                grupoId: itemSeleccionado.Usuario.id,
                grupoNombre: itemSeleccionado.Usuario.nombre,
                stockMax: itemSeleccionado.cantidad
            },
            cantidadNum
        );
        setMensajeExito(
            itemSeleccionado.Producto.nombre +
                " ×" +
                cantidadNum +
                " agregado al carrito"
        );
        cerrarModalCantidad();
    };

    return (
        <section className="catalogo">
            <header className="catalogo__header">
                <div>
                    <h1 className="catalogo__titulo">Catálogo</h1>
                    <p className="catalogo__subtitulo">
                        Productos con stock disponible de nuestros vendedores
                    </p>
                </div>
                <input
                    className="catalogo__busqueda"
                    type="search"
                    placeholder="Buscar producto o vendedor…"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    aria-label="Buscar producto o vendedor"
                />
            </header>

            {mensajeExito && (
                <div className="catalogo__exito" role="status">
                    {mensajeExito}
                </div>
            )}

            {error && (
                <div className="catalogo__error" role="alert">
                    {error}
                </div>
            )}

            {cargando ? (
                <div className="estado-carga">
                    <div className="estado-carga__spinner" aria-hidden="true" />
                    <p>Cargando catálogo…</p>
                </div>
            ) : error ? null : inventarioFiltrado.length === 0 ? (
                <Card className="catalogo__vacio">
                    <span className="catalogo__vacio-icono" aria-hidden="true">
                        🛒
                    </span>
                    <h2>
                        {busqueda ? "Sin resultados" : "El catálogo está vacío"}
                    </h2>
                    <p>
                        {busqueda
                            ? "No hay productos que coincidan con " + busqueda
                            : "Aún no hay productos con stock disponible."}
                    </p>
                </Card>
            ) : (
                <div className="catalogo__grid">
                    {inventarioFiltrado.map((item) => (
                        <Card
                            key={item.id}
                            hover
                            className="producto-catalogo"
                        >
                            <div className="producto-catalogo__precio">
                                {formatearPrecio(item.Producto?.precio)}
                            </div>
                            <h3 className="producto-catalogo__nombre">
                                {item.Producto?.nombre}
                            </h3>
                            <p className="producto-catalogo__descripcion">
                                {item.Producto?.descripcion}
                            </p>
                            <div className="producto-catalogo__footer">
                                <span className="producto-catalogo__proveedor">
                                    {item.Usuario?.nombre ?? "—"}
                                </span>
                                <span className="producto-catalogo__stock">
                                    {item.cantidad} disponible
                                    {item.cantidad === 1 ? "" : "s"}
                                </span>
                            </div>
                            <div className="producto-catalogo__acciones">
                                <Button
                                    className="btn--sm"
                                    onClick={() => abrirModalCantidad(item)}
                                >
                                    Agregar al carrito
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                abierto={Boolean(itemSeleccionado)}
                titulo="Agregar al carrito"
                onCerrar={cerrarModalCantidad}
                tamano="sm"
            >
                <form className="carrito-form" onSubmit={handleAgregar}>
                    <p className="carrito-form__producto">
                        <strong>{itemSeleccionado?.Producto?.nombre}</strong> —{" "}
                        {itemSeleccionado &&
                            formatearPrecio(
                                itemSeleccionado.Producto?.precio
                            )}{" "}
                        c/u · vendido por{" "}
                        <strong>{itemSeleccionado?.Usuario?.nombre}</strong> ·{" "}
                        {itemSeleccionado?.cantidad} en stock
                    </p>

                    <Input
                        label="Cantidad"
                        type="number"
                        name="cantidad"
                        value={cantidad}
                        onChange={(e) => {
                            setCantidad(e.target.value);
                            setErrorCantidad("");
                        }}
                        min="1"
                        max={itemSeleccionado?.cantidad}
                        step="1"
                        error={errorCantidad}
                        required
                    />

                    <div className="carrito-form__acciones">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={cerrarModalCantidad}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">Agregar</Button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}

export default Catalogo;
