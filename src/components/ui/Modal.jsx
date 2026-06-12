import { useEffect } from "react";
import "./Modal.css";

function Modal({ abierto, titulo, children, onCerrar, tamano = "md" }) {
    useEffect(() => {
        if (!abierto) return undefined;

        const handleTecla = (evento) => {
            if (evento.key === "Escape") onCerrar();
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleTecla);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleTecla);
        };
    }, [abierto, onCerrar]);

    if (!abierto) return null;

    return (
        <div className="modal-overlay" onClick={onCerrar} role="presentation">
            <div
                className={"modal modal--" + tamano}
                onClick={(evento) => evento.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-titulo"
            >
                <header className="modal__header">
                    <h2 id="modal-titulo" className="modal__titulo">
                        {titulo}
                    </h2>
                    <button
                        type="button"
                        className="modal__cerrar"
                        onClick={onCerrar}
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </header>
                <div className="modal__contenido">{children}</div>
            </div>
        </div>
    );
}

export default Modal;
