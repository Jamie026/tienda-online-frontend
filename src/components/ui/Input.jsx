import "./Input.css";

function Input({ label, id, error, className = "", as = "input", ...props }) {
    const Component = as;
    const inputId = id ?? props.name;

    return (
        <div className={("field " + className).trim()}>
            {label && (
                <label className="field__label" htmlFor={inputId}>
                    {label}
                </label>
            )}
            <Component
                id={inputId}
                className={("field__control " + (error ? "field__control--error" : "")).trim()}
                {...props}
            />
            {error && <span className="field__error">{error}</span>}
        </div>
    );
}

export default Input;
