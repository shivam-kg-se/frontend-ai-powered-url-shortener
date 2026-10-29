import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useStoreContext } from "./contextApi/ContextValue";

export default function PrivateRoute({ children, publicPage}) {
    const { token } = useStoreContext();

    if (publicPage) {
        return token ? <Navigate to="/dashboard" /> : children;
    }

    PrivateRoute.propTypes = {
        children: PropTypes.node.isRequired,
        publicPage: PropTypes.bool.isRequired,
    };

    return !token ? <Navigate to="/login" /> : children;
}