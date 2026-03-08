// src/pages/LoginPage.jsx
import { Link, useNavigate } from "react-router-dom";
import {
    Landmark, Mail, Lock, Eye, EyeOff,
    ArrowRight, Shield, AlertCircle, CheckCircle,
    TrendingUp, Users, CreditCard
} from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

const C = {
    bg: "#f4f6f5",
    sidebar: "#1a2e1a",
    green: "#2d7a2d",
    greenLight: "#4a9e4a",
    greenSoft: "rgba(45,122,45,.12)",
    greenBorder: "rgba(45,122,45,.25)",
    white: "#ffffff",
    border: "#e8ede8",
    text: "#1a2e1a",
    muted: "#7a9a7a",
    label: "#3a5a3a",
    danger: "#c42d2d",
    dangerSoft: "rgba(196,45,45,.08)",
    success: "#2d7a2d",
    successSoft: "rgba(45,122,45,.08)",
};

const inputBase = {
    width: "100%",
    height: "44px",
    padding: "0 40px 0 40px",
    border: `1.5px solid ${C.border}`,
    borderRadius: 9,
    fontSize: ".875rem",
    color: C.text,
    fontFamily: "'Outfit', sans-serif",
    background: C.white,
    outline: "none",
    transition: "border-color .15s, box-shadow .15s",
    boxSizing: "border-box",
};

function getStyle(focused, error, valid) {
    if (error) return { ...inputBase, borderColor: C.danger, boxShadow: `0 0 0 3px ${C.dangerSoft}` };
    if (valid) return { ...inputBase, borderColor: C.green, boxShadow: focused ? `0 0 0 3px ${C.greenSoft}` : "none" };
    return { ...inputBase, borderColor: focused ? C.green : C.border, boxShadow: focused ? `0 0 0 3px ${C.greenSoft}` : "none" };
}

const validators = {
    identifier: v => v.trim().length >= 1 || "Username or email is required",
    password: v => v.length >= 1 || "Password is required",
};

function validate(field, value) {
    const r = validators[field]?.(value);
    return r === true ? null : r;
}

export default function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ identifier: "", password: "" });
    const [focused, setFocused] = useState({});
    const [touched, setTouched] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
        setTouched(p => ({ ...p, [name]: true }));
        setAuthError("");
    };

    const handleFocus = name => setFocused(p => ({ ...p, [name]: true }));
    const handleBlur = name => { setFocused(p => ({ ...p, [name]: false })); setTouched(p => ({ ...p, [name]: true })); };

    const errors = {};
    Object.keys(validators).forEach(f => {
        const err = validate(f, formData[f]);
        if (err && (touched[f] || submitted)) errors[f] = err;
    });

    const isValid = f => (touched[f] || submitted) && !errors[f] && formData[f] !== "";
    const hasClientErrors = Object.keys(validators).some(f => validate(f, formData[f]));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTouched({ identifier: true, password: true });
        setAuthError("");
        if (hasClientErrors) return;
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: formData.identifier.trim(), password: formData.password }),
            });
            const data = await response.json();

            if (response.status === 429) {
                await Swal.fire({ title: "Account Temporarily Locked", html: `<div style="text-align:left;padding:.5rem 0"><p style="font-size:.9rem;color:#374151;margin-bottom:.75rem">${data.message}</p><div style="background:#fdf0f0;border:1px solid #f8c8c8;border-radius:8px;padding:.875rem"><p style="font-size:.8rem;color:#7a1a1a;line-height:1.6">🔒 Too many failed attempts. Wait <strong>15 minutes</strong> before trying again.</p></div></div>`, icon: "error", confirmButtonText: "I Understand", confirmButtonColor: C.green, customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" } });
                setLoading(false); return;
            }
            if (response.status === 403) {
                await Swal.fire({ title: "Account Restricted", text: data.message, icon: "warning", confirmButtonText: "Contact Support", confirmButtonColor: C.green, customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" } });
                setLoading(false); return;
            }
            if (response.status === 401) { setAuthError(data.message); setLoading(false); return; }
            if (!response.ok) { setAuthError(data.message || "Something went wrong."); setLoading(false); return; }

            const { user, token, expiresAt } = data;
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userRole", user.role);
            localStorage.setItem("isVerified", String(Boolean(user.isVerified)));
            localStorage.setItem("token", token);
            localStorage.setItem("userId", String(user.id));
            localStorage.setItem("sessionExpiresAt", expiresAt);
            localStorage.setItem("registrationData", JSON.stringify(user));
            if (user.creditScore) localStorage.setItem("creditScore", String(user.creditScore));

            if (user.role === "Admin" || user.role === "Staff") {
                await Swal.fire({ title: `Welcome, ${user.firstName}!`, html: `<p style="font-size:.9rem;color:#6b7280">Signed in as <strong>${user.role}</strong>. Redirecting…</p>`, icon: "success", timer: 2000, showConfirmButton: false, customClass: { popup: "swal-popup", title: "swal-title" } });
                navigate("/home"); return;
            }
            if (!user.isVerified) {
                const result = await Swal.fire({ title: `Welcome, ${user.firstName}!`, html: `<div style="text-align:center;padding:.25rem 0"><p style="font-size:.9rem;color:#374151;margin-bottom:.75rem">Your account is <strong style="color:#c47a00">not yet verified</strong>.</p><div style="background:#fff9ed;border:1px solid #f8e4b0;border-radius:10px;padding:1rem;text-align:left"><p style="font-size:.8rem;color:#7a5000;line-height:1.7">⚠️ Complete your <strong>identity verification</strong> to unlock loan eligibility.</p></div></div>`, icon: "warning", showCancelButton: true, confirmButtonText: "Verify Now", cancelButtonText: "Go to Dashboard", confirmButtonColor: C.green, reverseButtons: true, allowOutsideClick: false, customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm", cancelButton: "swal-cancel" } });
                navigate(result.isConfirmed ? "/verify" : "/home"); return;
            }
            await Swal.fire({ title: `Welcome back, ${user.firstName}!`, html: `<p style="font-size:.9rem;color:#6b7280">Signed in successfully. Redirecting…</p>`, icon: "success", timer: 1800, showConfirmButton: false, customClass: { popup: "swal-popup", title: "swal-title" } });
            navigate("/home");
        } catch (err) {
            console.error(err);
            setAuthError("Cannot reach the server. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Outfit:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Outfit', sans-serif; background: ${C.bg}; color: ${C.text}; }
                @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
                .fade-up   { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
                .fade-up-2 { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) .12s both; }
                .fade-up-3 { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) .22s both; }
                .slide-in  { animation: slideIn .55s cubic-bezier(.16,1,.3,1) both; }
                a { text-decoration: none; }
                .swal-popup  { border-radius: 16px !important; font-family: 'Outfit', sans-serif !important; padding: 2rem !important; }
                .swal-title  { font-family: 'Lora', serif !important; font-size: 1.3rem !important; color: ${C.text} !important; }
                .swal-confirm{ font-family: 'Outfit', sans-serif !important; font-weight: 600 !important; border-radius: 8px !important; padding: 10px 22px !important; }
                .swal-cancel { font-family: 'Outfit', sans-serif !important; font-weight: 500 !important; border-radius: 8px !important; padding: 10px 22px !important; color: ${C.label} !important; border: 1.5px solid ${C.border} !important; background: #fff !important; }
                .swal2-actions { gap: .6rem !important; }
                .lp::-webkit-scrollbar { width: 4px; }
                .lp::-webkit-scrollbar-thumb { background: #c8d8c8; border-radius: 99px; }
            `}</style>

            <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

                {/* ── LEFT PANEL ── */}
                <div className="slide-in" style={{
                    width: "36%", minWidth: 300,
                    background: `linear-gradient(160deg, ${C.sidebar} 0%, #2a4a2a 100%)`,
                    display: "flex", flexDirection: "column", padding: "3rem",
                    position: "relative", overflow: "hidden", flexShrink: 0,
                }}>
                    {/* Decorative circles */}
                    <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(45,122,45,.18)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: 80, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(45,122,45,.1)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: -30, right: 60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />

                    {/* Logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(45,122,45,.4)" }}>
                            <Landmark style={{ width: 19, height: 19, color: "#fff" }} />
                        </div>
                        <span style={{ fontFamily: "'Lora', serif", fontSize: "1.25rem", fontWeight: 600, color: "#fff" }}>LoanShark</span>
                    </div>

                    {/* Main copy */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(45,122,45,.25)", border: "1px solid rgba(45,122,45,.4)", borderRadius: 20, padding: "5px 14px", marginBottom: "1.5rem", width: "fit-content" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#9de89d", animation: "pulse 2s infinite" }} />
                            <span style={{ fontSize: ".7rem", fontWeight: 700, color: "#9de89d", letterSpacing: ".08em", textTransform: "uppercase" }}>Secure Portal</span>
                        </div>

                        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "2.4rem", fontWeight: 600, color: "#fff", lineHeight: 1.2, marginBottom: "1rem" }}>
                            Smart Lending,<br />
                            <span style={{ color: "#9de89d" }}>Simply Done.</span>
                        </h1>
                        <p style={{ fontSize: ".9rem", color: "rgba(255,255,255,.55)", lineHeight: 1.7, maxWidth: 300, marginBottom: "2.5rem" }}>
                            Manage loans, track payments, and monitor borrower portfolios all in one place.
                        </p>

                        {/* Feature pills */}
                        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                            {[
                                { icon: TrendingUp, label: "Real-time credit scoring" },
                                { icon: Shield, label: "Bank-grade encryption" },
                                { icon: Users, label: "Borrower management" },
                                { icon: CreditCard, label: "Automated loan tracking" },
                            ].map((f, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(45,122,45,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <f.icon style={{ width: 13, height: 13, color: "#9de89d" }} />
                                    </div>
                                    <span style={{ fontSize: ".82rem", color: "rgba(255,255,255,.65)" }}>{f.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p style={{ fontSize: ".72rem", color: "rgba(255,255,255,.28)", position: "relative" }}>
                        © 2026 LoanShark. All rights reserved.
                    </p>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="lp" style={{
                    flex: 1, overflowY: "auto", background: C.bg,
                    display: "flex", flexDirection: "column", alignItems: "center",
                }}>

                    {/* Top bar — matches RegisterPage exactly */}
                    <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", padding: "1.25rem 2.5rem", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: ".82rem", color: C.muted }}>No account yet?</span>
                            <Link to="/register" style={{ padding: "7px 18px", borderRadius: 8, background: C.white, border: `1.5px solid ${C.border}`, color: C.label, fontFamily: "'Outfit',sans-serif", fontSize: ".82rem", fontWeight: 600, transition: "all .15s" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.color = C.green; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.label; }}>
                                Sign Up
                            </Link>
                        </div>
                    </div>

                    {/* Centered form content */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "0 2.5rem 4rem" }}>
                        <div style={{ width: "100%", maxWidth: 400 }}>

                            {/* Heading */}
                            <div className="fade-up" style={{ marginBottom: "2rem" }}>
                                <p style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.green, marginBottom: ".6rem" }}>
                                    Welcome Back
                                </p>
                                <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.9rem", fontWeight: 600, color: C.text, marginBottom: ".4rem" }}>
                                    Sign in to your account
                                </h2>
                                <p style={{ fontSize: ".85rem", color: C.muted, fontWeight: 300 }}>
                                    Enter your credentials to access your dashboard.
                                </p>
                            </div>

                            {/* Form card */}
                            <form onSubmit={handleSubmit} className="fade-up-2"
                                style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "2rem", boxShadow: "0 4px 24px rgba(26,46,26,.06)" }}
                                noValidate>

                                {/* Auth error banner */}
                                {authError && (
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", background: "#fdf0f0", border: `1px solid rgba(196,45,45,.25)`, borderRadius: 9, marginBottom: "1.25rem" }}>
                                        <AlertCircle style={{ width: 14, height: 14, color: C.danger, flexShrink: 0, marginTop: 1 }} />
                                        <span style={{ fontSize: ".8rem", color: C.danger, lineHeight: 1.5 }}>{authError}</span>
                                    </div>
                                )}

                                {/* Username / Email */}
                                <div style={{ marginBottom: "1.1rem" }}>
                                    <label style={{ display: "block", fontSize: ".7rem", fontWeight: 700, color: C.muted, marginBottom: 7, letterSpacing: ".07em", textTransform: "uppercase" }}>
                                        Username or Email <span style={{ color: C.green }}>*</span>
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <Mail style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: errors.identifier ? C.danger : isValid("identifier") ? C.green : C.muted, pointerEvents: "none" }} />
                                        <input type="text" name="identifier" value={formData.identifier}
                                            onChange={handleChange} placeholder="Username or email address"
                                            required autoComplete="username"
                                            style={getStyle(focused.identifier, errors.identifier, isValid("identifier"))}
                                            onFocus={() => handleFocus("identifier")}
                                            onBlur={() => handleBlur("identifier")}
                                        />
                                        {(errors.identifier || isValid("identifier")) && (
                                            <div style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                                {errors.identifier
                                                    ? <AlertCircle style={{ width: 14, height: 14, color: C.danger }} />
                                                    : <CheckCircle style={{ width: 14, height: 14, color: C.green }} />}
                                            </div>
                                        )}
                                    </div>
                                    {errors.identifier && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                                            <AlertCircle style={{ width: 11, height: 11, color: C.danger }} />
                                            <span style={{ fontSize: ".72rem", color: C.danger }}>{errors.identifier}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Password */}
                                <div style={{ marginBottom: "1.5rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                                        <label style={{ fontSize: ".7rem", fontWeight: 700, color: C.muted, letterSpacing: ".07em", textTransform: "uppercase" }}>
                                            Password <span style={{ color: C.green }}>*</span>
                                        </label>
                                        <a href="#" style={{ fontSize: ".75rem", color: C.green, fontWeight: 500 }}
                                            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                                            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                                            Forgot password?
                                        </a>
                                    </div>
                                    <div style={{ position: "relative" }}>
                                        <Lock style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: errors.password ? C.danger : C.muted, pointerEvents: "none" }} />
                                        <input type={showPassword ? "text" : "password"}
                                            name="password" value={formData.password}
                                            onChange={handleChange} placeholder="Enter your password"
                                            required autoComplete="current-password"
                                            style={getStyle(focused.password, errors.password, isValid("password"))}
                                            onFocus={() => handleFocus("password")}
                                            onBlur={() => handleBlur("password")}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex", transition: "color .15s" }}
                                            onMouseEnter={e => e.currentTarget.style.color = C.text}
                                            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                                            {showPassword ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                                            <AlertCircle style={{ width: 11, height: 11, color: C.danger }} />
                                            <span style={{ fontSize: ".72rem", color: C.danger }}>{errors.password}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div style={{ height: 1, background: C.border, marginBottom: "1.5rem" }} />

                                {/* Submit */}
                                <button type="submit" disabled={loading}
                                    style={{ width: "100%", height: "46px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, background: loading ? C.muted : C.green, color: "#fff", fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: ".9rem", border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background .18s, transform .15s", marginBottom: "1rem" }}
                                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = C.greenLight; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                                    onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = C.green; e.currentTarget.style.transform = "translateY(0)"; } }}>
                                    {loading
                                        ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} /> Signing in…</>
                                        : <>Sign In <ArrowRight style={{ width: 15, height: 15 }} /></>
                                    }
                                </button>

                                {/* Security note */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                    <Shield style={{ width: 12, height: 12, color: C.muted }} />
                                    <span style={{ fontSize: ".75rem", color: C.muted }}>Your connection is encrypted and secure</span>
                                </div>
                            </form>

                            {/* Sign up link */}
                            <p className="fade-up-3" style={{ textAlign: "center", marginTop: "1.5rem", fontSize: ".83rem", color: C.muted }}>
                                Don't have an account?{" "}
                                <Link to="/register" style={{ color: C.green, fontWeight: 600 }}
                                    onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                                    onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                                    Create one free
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}