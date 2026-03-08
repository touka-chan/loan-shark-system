// src/components/admin/AdminLayout.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Users, CreditCard, Shield, Settings,
    LogOut, Menu, X, Bell, Search, User, Home,
    BarChart3, FileText, ChevronDown, Landmark
} from "lucide-react";

export default function AdminLayout({ children, title }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [adminName, setAdminName] = useState("Admin");

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("registrationData") || "{}");
        if (data.firstName) {
            setAdminName(`${data.firstName} ${data.lastName || ''}`.trim());
        }
    }, []);

    const menuItems = [
        { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/admin/users", icon: Users, label: "Users" },
        { path: "/admin/borrowers", icon: Users, label: "Borrowers" },
        { path: "/admin/loans", icon: CreditCard, label: "Loans" },
        { path: "/admin/verifications", icon: Shield, label: "Verifications" },
        { path: "/admin/reports", icon: BarChart3, label: "Reports" },
        { path: "/admin/settings", icon: Settings, label: "Settings" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userRole");
        navigate("/login");
    };

    return (
        <div style={{ display: "flex", height: "100vh", background: "#f3f4f6" }}>
            {/* Sidebar */}
            <aside style={{
                width: sidebarOpen ? 260 : 80,
                background: "#1a1a2e",
                color: "#fff",
                transition: "width 0.3s",
                position: "relative"
            }}>
                {/* Logo */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: sidebarOpen ? "1.5rem" : "1.5rem 1rem",
                    borderBottom: "1px solid rgba(255,255,255,0.1)"
                }}>
                    <Landmark size={24} color="#60a5fa" />
                    {sidebarOpen && <span style={{ fontWeight: 600 }}>LoanShark Admin</span>}
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{
                        position: "absolute",
                        right: -12,
                        top: 70,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#2563eb",
                        border: "2px solid #1a1a2e",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    {sidebarOpen ? <X size={12} /> : <Menu size={12} />}
                </button>

                {/* Menu Items */}
                <nav style={{ padding: "1rem" }}>
                    {menuItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: sidebarOpen ? "0.8rem 1rem" : "0.8rem",
                                    marginBottom: "0.5rem",
                                    borderRadius: 8,
                                    background: isActive ? "rgba(37,99,235,0.2)" : "transparent",
                                    color: isActive ? "#60a5fa" : "#9ca3af",
                                    textDecoration: "none",
                                    justifyContent: sidebarOpen ? "flex-start" : "center"
                                }}
                            >
                                <item.icon size={20} />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Admin Profile */}
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    padding: "1rem",
                    borderTop: "1px solid rgba(255,255,255,0.1)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "#2563eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <User size={20} />
                        </div>
                        {sidebarOpen && (
                            <>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>{adminName}</p>
                                    <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>Admin</p>
                                </div>
                                <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>
                                    <LogOut size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Top Bar */}
                <header style={{
                    height: 70,
                    background: "#fff",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 2rem"
                }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>{title}</h2>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <div style={{ position: "relative" }}>
                            <Search style={{
                                position: "absolute",
                                left: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: 16,
                                height: 16,
                                color: "#9ca3af"
                            }} />
                            <input
                                placeholder="Search..."
                                style={{
                                    padding: "0.5rem 1rem 0.5rem 2.5rem",
                                    borderRadius: 8,
                                    border: "1px solid #e5e7eb",
                                    width: 250
                                }}
                            />
                        </div>
                        <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer" }}>
                            <Bell size={20} />
                            <span style={{
                                position: "absolute",
                                top: -5,
                                right: -5,
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#ef4444"
                            }} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}