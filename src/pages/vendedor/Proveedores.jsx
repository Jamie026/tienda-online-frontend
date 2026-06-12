import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { useCart } from "../../context/CartContext";
import { obtenerProductosConProveedor } from "../../services/proveedoresService";
import { extraerMensajeError } from "../../utils/errores";
import { formatearPrecio } from "../../utils/producto";
import "../../styles/vendedor/proveedores.css";

function Proveedores() {
    const { agregarItem } = useCart();
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState("1");
    const [errorCantidad, setErrorCantidad] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await obtenerProductosConProveedor();
                setProductos(data);
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

    const grupos = useMemo(() => {
        const mapa = {};
        productos.forEach((p) => {
            const id = p.proveedor;
            if (!mapa[id]) {
                mapa[id] = {
                    id,
                    nombre: p.Usuario?.nombre ?? "Proveedor desconocido",
                    productos: []
                };
            }
            mapa[id].productos.push(p);
        });
        return Object.values(mapa);
    }, [productos]);

    const gruposFiltrados = useMemo(() => {
        if (!busqueda.trim()) return grupos;
        const termino = busqueda.toLowerCase();
        return grupos
            .map((g) => ({
                ...g,
                productos: g.productos.filter(
                    (p) =>
                        p.nombre.toLowerCase().includes(termino) ||
                        g.nombre.toLowerCase().includes(termino)
                )
            }))
            .filter((g) => g.productos.length > 0);
    }, [grupos, busqueda]);

    const abrirModalCantidad = (producto, grupo) => {
        setProductoSeleccionado({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            grupoId: grupo.id,
            grupoNombre: grupo.nombre
        });
        setCantidad("1");
        setErrorCantidad("");
    };

    const cerrarModalCantidad = () => {
        setProductoSeleccionado(null);
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

        const { id, nombre, precio, grupoId, grupoNombre } =
            productoSeleccionado;
        agregarItem({ id, nombre, precio, grupoId, grupoNombre }, cantidadNum);
        setMensajeExito(nombre + "×" + cantidadNum + " agregado al carrito");
        cerrarModalCantidad();
    };

    return (
        <section className="proveedores">
            <header className="proveedores__header">
                <div>
                    <h1 className="proveedores__titulo">Proveedores</h1>
                    <p className="proveedores__subtitulo">
                        Explora el catálogo de cada proveedor para gestionar tu
                        inventario
                    </p>
                </div>
                <input
                    className="proveedores__busqueda"
                    type="search"
                    placeholder="Buscar proveedor o producto…"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    aria-label="Buscar proveedor o producto"
                />
            </header>

            {mensajeExito && (
                <div className="proveedores__exito" role="status">
                    {mensajeExito}
                </div>
            )}

            {error && (
                <div className="proveedores__error" role="alert">
                    {error}
                </div>
            )}

            {cargando ? (
                <div className="estado-carga">
                    <div className="estado-carga__spinner" aria-hidden="true" />
                    <p>Cargando proveedores…</p>
                </div>
            ) : error ? null : gruposFiltrados.length === 0 ? (
                <Card className="proveedores__vacio">
                    <span
                        className="proveedores__vacio-icono"
                        aria-hidden="true"
                    >
                        📦
                    </span>
                    <h2>
                        {busqueda ? "Sin resultados" : "No hay proveedores"}
                    </h2>
                    <p>
                        {busqueda
                            ? "No se encontraron resultados para " + busqueda
                            : "Aún no hay proveedores con productos registrados."}
                    </p>
                </Card>
            ) : (
                <div className="proveedores__lista">
                    {gruposFiltrados.map((grupo) => (
                        <article key={grupo.id} className="proveedor-seccion">
                            <header className="proveedor-seccion__cabecera">
                                <h2 className="proveedor-seccion__nombre">
                                    {grupo.nombre}
                                </h2>
                                <span className="proveedor-seccion__conteo">
                                    {grupo.productos.length}{" "}
                                    {grupo.productos.length === 1
                                        ? "producto"
                                        : "productos"}
                                </span>
                            </header>

                            <div className="proveedor-seccion__grid">
                                {grupo.productos.map((producto) => (
                                    <Card
                                        key={producto.id}
                                        hover
                                        className="producto-proveedor"
                                    >
                                        <div className="producto-proveedor__precio">
                                            {formatearPrecio(producto.precio)}
                                        </div>
                                        <h3 className="producto-proveedor__nombre">
                                            {producto.nombre}
                                        </h3>
                                        <p className="producto-proveedor__descripcion">
                                            {producto.descripcion}
                                        </p>
                                        <div className="producto-proveedor__acciones">
                                            <Button
                                                className="btn--sm"
                                                onClick={() =>
                                                    abrirModalCantidad(
                                                        producto,
                                                        grupo
                                                    )
                                                }
                                            >
                                                Agregar al carrito
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <Modal
                abierto={Boolean(productoSeleccionado)}
                titulo="Agregar al carrito"
                onCerrar={cerrarModalCantidad}
                tamano="sm"
            >
                <form className="carrito-form" onSubmit={handleAgregar}>
                    <p className="carrito-form__producto">
                        <strong>{productoSeleccionado?.nombre}</strong> —{" "}
                        {productoSeleccionado &&
                            formatearPrecio(productoSeleccionado.precio)}{" "}
                        c/u
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

export default Proveedores;
