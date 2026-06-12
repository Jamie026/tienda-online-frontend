import "./Badge.css";

const VARIANTES = {
    comprador: "badge--cyan",
    vendedor: "badge--magenta",
    proveedor: "badge--green",
    default: "badge--default",
};

function Badge({ children, variant = "default", className = "" }) {
    return (
        <span
            className={("badge " + (VARIANTES[variant] ?? VARIANTES.default) + " " + className).trim()}
        >
            {children}
        </span>
    );
}

export default Badge;
