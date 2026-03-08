// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function AdminRoute({ children }) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isAdmin = userRole === "Admin";

    if (!isLoggedIn) {
        Swal.fire({
            title: "Access Denied",
            text: "Please login first",
            icon: "warning",
            confirmButtonColor: "#1a1a2e"
        });
        return <Navigate to="/login" />;
    }

    if (!isAdmin) {
        Swal.fire({
            title: "Access Denied",
            text: "Admin access only",
            icon: "error",
            confirmButtonColor: "#1a1a2e"
        });
        return <Navigate to="/home" />;
    }

    return children;
}