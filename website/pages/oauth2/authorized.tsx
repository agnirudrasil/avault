export const Authorized = () => {
    return (
        <button
            onClick={async () => {
                await fetch("http://localhost:8000/");
            }}
        >
            Authorized
        </button>
    );
};

export default Authorized;
