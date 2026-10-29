import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { ContextApi } from "./ContextValue";

export const ContextProvider = ({ children }) => {
    const getToken = localStorage.getItem("JWT_TOKEN")
        ? JSON.parse(localStorage.getItem("JWT_TOKEN"))
        : null;

    const [token, setToken] = useState(getToken);

    useEffect(() => {
        const handleUnauthorized = () => setToken(null);

        window.addEventListener("linklytics:unauthorized", handleUnauthorized);

        return () => {
            window.removeEventListener("linklytics:unauthorized", handleUnauthorized);
        };
    }, []);

    const sendData = {
        token,
        setToken,
    };

    return <ContextApi.Provider value={sendData}>{children}</ContextApi.Provider>
};

ContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
