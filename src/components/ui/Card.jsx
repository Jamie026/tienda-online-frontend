import "./Card.css";

function Card({ children, className = "", hover = false, ...props }) {
    return (
        <article
            className={("card " + (hover ? "card--hover" : "") + " " + className).trim()}
            {...props}
        >
            {children}
        </article>
    );
}

export default Card;
