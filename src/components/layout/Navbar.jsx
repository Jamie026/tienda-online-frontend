import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { ETIQUETAS_ROL } from "../../utils/rutas";
import "./Navbar.css";

const ENLACES_POR_ROL = {
    comprador: [
        { to: "/comprador/catalogo", label: "Catálogo" },
        { to: "/comprador/pedidos", label: "Mis pedidos" },
        { to: "/comprador/carrito", label: "Carrito", contador: true }
    ],
    vendedor: [
        { to: "/vendedor/proveedores", label: "Proveedores" },
        { to: "/vendedor/pedidos", label: "Mis pedidos" },
        { to: "/vendedor/inventario", label: "Inventario" },
        {
            label: "Gestión",
            submenu: [
                { to: "/vendedor/ventas", label: "Mis ventas" },
                { to: "/vendedor/despachos", label: "Mis despachos" }
            ]
        },
        { to: "/vendedor/carrito", label: "Carrito", contador: true }
    ],
    proveedor: [
        { to: "/proveedor/productos", label: "Mis productos" },
        {
            label: "Gestión",
            submenu: [
                { to: "/proveedor/facturas", label: "Ver facturas" },
                { to: "/proveedor/despachos", label: "Ver despachos" }
            ]
        }
    ]
};

function Navbar() {
    const { usuario, logout } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [submenuAbierto, setSubmenuAbierto] = useState(false);
    const submenuRef = useRef(null);

    useEffect(() => {
        setMenuAbierto(false);
        setSubmenuAbierto(false);
    }, [location.pathname, location.state]);

    useEffect(() => {
        if (!submenuAbierto) return undefined;

        const handleClickFuera = (evento) => {
            if (
                submenuRef.current &&
                !submenuRef.current.contains(evento.target)
            ) {
                setSubmenuAbierto(false);
            }
        };

        document.addEventListener("mousedown", handleClickFuera);
        return () =>
            document.removeEventListener("mousedown", handleClickFuera);
    }, [submenuAbierto]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch {
            navigate("/login");
        }
    };

    if (!usuario) return null;

    const enlaces = ENLACES_POR_ROL[usuario.tipo] ?? [];
    const primerEnlace = enlaces[0]?.to ?? enlaces[0]?.submenu?.[0]?.to ?? "/";

    const renderEnlace = (enlace, claseBase) => (
        <NavLink
            key={enlace.label}
            to={enlace.to}
            state={enlace.state}
            onClick={() => setMenuAbierto(false)}
            className={({ isActive }) =>
                (
                    claseBase +
                    " " +
                    (isActive ? claseBase + "--active" : "")
                ).trim()
            }
        >
            {enlace.label}
            {enlace.contador && totalItems > 0 && (
                <span className="navbar__contador">{totalItems}</span>
            )}
        </NavLink>
    );

    const renderSubmenu = (enlace) => {
        const submenuActivo = enlace.submenu.some((sub) =>
            location.pathname.startsWith(sub.to)
        );

        return (
            <div
                key={enlace.label}
                className="navbar__submenu"
                ref={submenuRef}
            >
                <button
                    type="button"
                    className={
                        "navbar__link navbar__submenu-boton" +
                        (submenuActivo ? " navbar__link--active" : "")
                    }
                    aria-expanded={submenuAbierto}
                    aria-haspopup="true"
                    onClick={() => setSubmenuAbierto((prev) => !prev)}
                >
                    {enlace.label}
                    <span
                        className={
                            "navbar__submenu-flecha" +
                            (submenuAbierto
                                ? " navbar__submenu-flecha--abierta"
                                : "")
                        }
                        aria-hidden="true"
                    >
                        ▾
                    </span>
                </button>

                {submenuAbierto && (
                    <div className="navbar__submenu-panel" role="menu">
                        {enlace.submenu.map((sub) => (
                            <NavLink
                                key={sub.label}
                                to={sub.to}
                                role="menuitem"
                                onClick={() => setSubmenuAbierto(false)}
                                className={({ isActive }) =>
                                    (
                                        "navbar__submenu-link " +
                                        (isActive
                                            ? "navbar__submenu-link--active"
                                            : "")
                                    ).trim()
                                }
                            >
                                {sub.label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const enlacesPlanos = enlaces.flatMap(
        (enlace) => enlace.submenu ?? [enlace]
    );

    return (
        <header className="navbar">
            <div className="navbar__superior">
                <NavLink to={primerEnlace} className="navbar__brand">
                    <span className="navbar__logo">◆</span>
                    Tienda Online
                </NavLink>

                <div className="navbar__actions">
                    <div className="navbar__usuario">
                        <span className="navbar__nombre">{usuario.nombre}</span>
                        <Badge variant={usuario.tipo}>
                            {ETIQUETAS_ROL[usuario.tipo]}
                        </Badge>
                    </div>
                    <Button variant="ghost" onClick={handleLogout}>
                        Salir
                    </Button>
                </div>

                <button
                    type="button"
                    className="navbar__hamburguesa"
                    aria-expanded={menuAbierto}
                    aria-controls="navbar-panel"
                    aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
                    onClick={() => setMenuAbierto((prev) => !prev)}
                >
                    {menuAbierto ? "✕" : "☰"}
                </button>
            </div>

            <nav className="navbar__nav" aria-label="Principal">
                {enlaces.map((enlace) =>
                    enlace.submenu
                        ? renderSubmenu(enlace)
                        : renderEnlace(enlace, "navbar__link")
                )}
            </nav>

            <div
                id="navbar-panel"
                className={
                    "navbar__panel" +
                    (menuAbierto ? " navbar__panel--abierto" : "")
                }
            >
                <nav className="navbar__panel-nav" aria-label="Principal móvil">
                    {enlacesPlanos.map((enlace) =>
                        renderEnlace(enlace, "navbar__panel-link")
                    )}
                </nav>

                <div className="navbar__panel-pie">
                    <div className="navbar__panel-usuario">
                        <span className="navbar__panel-nombre">
                            {usuario.nombre}
                        </span>
                        <Badge variant={usuario.tipo}>
                            {ETIQUETAS_ROL[usuario.tipo]}
                        </Badge>
                    </div>
                    <Button variant="ghost" onClick={handleLogout}>
                        Salir
                    </Button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
