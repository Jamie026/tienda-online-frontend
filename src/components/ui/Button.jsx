import "./Button.css";

const VARIANTES = {
    primary: "btn--primary",
    secondary: "btn--secondary",
    ghost: "btn--ghost",
    danger: "btn--danger",
};

function Button({
    children,
    variant = "primary",
    type = "button",
    className = "",
    disabled = false,
    ...props
}) {
    return (
        <button
            type={type}
            className={("btn " + (VARIANTES[variant] ?? VARIANTES.primary) + " " + className).trim()}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;
