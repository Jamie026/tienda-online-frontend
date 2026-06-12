import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const claveStorage = (usuarioId) => "carrito_" + usuarioId;

const ROLES_CON_CARRITO = ["vendedor", "comprador"];

const tieneCarrito = (usuario) =>
    Boolean(usuario) && ROLES_CON_CARRITO.includes(usuario.tipo);

// Un mismo producto puede venderlo más de un grupo (p. ej. dos vendedores
// con el mismo producto en inventario), por eso la identidad es grupo+producto.
const claveItem = (grupoId, productoId) => grupoId + "-" + productoId;

const limitarCantidad = (cantidad, stockMax) =>
    typeof stockMax === "number" ? Math.min(cantidad, stockMax) : cantidad;

export const CartProvider = ({ children }) => {
    const { usuario } = useAuth();
    const [items, setItems] = useState([]);
    const [inicializado, setInicializado] = useState(false);

    useEffect(() => {
        setInicializado(false);
        if (!tieneCarrito(usuario)) {
            setItems([]);
            return;
        }
        try {
            const guardado = localStorage.getItem(claveStorage(usuario.id));
            setItems(guardado ? JSON.parse(guardado) : []);
        } catch {
            setItems([]);
        } finally {
            setInicializado(true);
        }
    }, [usuario]);

    useEffect(() => {
        if (!inicializado || !tieneCarrito(usuario)) return;
        try {
            localStorage.setItem(
                claveStorage(usuario.id),
                JSON.stringify(items)
            );
        } catch (err) {
            void 0;
        }
    }, [items, usuario, inicializado]);

    const agregarItem = useCallback((producto, cantidad) => {
        setItems((prev) => {
            const clave = claveItem(producto.grupoId, producto.id);
            const existente = prev.find((item) => item.clave === clave);
            if (existente) {
                return prev.map((item) =>
                    item.clave === clave
                        ? {
                              ...item,
                              cantidad: limitarCantidad(
                                  item.cantidad + cantidad,
                                  item.stockMax
                              )
                          }
                        : item
                );
            }
            return [
                ...prev,
                {
                    ...producto,
                    clave,
                    cantidad: limitarCantidad(cantidad, producto.stockMax)
                }
            ];
        });
    }, []);

    const actualizarCantidad = useCallback((clave, cantidad) => {
        setItems((prev) =>
            prev.map((item) =>
                item.clave === clave
                    ? {
                          ...item,
                          cantidad: limitarCantidad(cantidad, item.stockMax)
                      }
                    : item
            )
        );
    }, []);

    const quitarItem = useCallback((clave) => {
        setItems((prev) => prev.filter((item) => item.clave !== clave));
    }, []);

    const vaciarCarrito = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = useMemo(
        () => items.reduce((acc, item) => acc + item.cantidad, 0),
        [items]
    );

    const totalCarrito = useMemo(
        () =>
            items.reduce(
                (acc, item) => acc + Number(item.precio) * item.cantidad,
                0
            ),
        [items]
    );

    const value = useMemo(
        () => ({
            items,
            totalItems,
            totalCarrito,
            agregarItem,
            actualizarCantidad,
            quitarItem,
            vaciarCarrito
        }),
        [
            items,
            totalItems,
            totalCarrito,
            agregarItem,
            actualizarCantidad,
            quitarItem,
            vaciarCarrito
        ]
    );

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
    return context;
};
