// src/pages/RegisterPage.jsx
import { Link, useNavigate } from "react-router-dom";
import {
    Landmark, ArrowRight, User, Calendar, Phone,
    MapPin, Home, Mail, Lock, Eye, EyeOff, Shield,
    ChevronDown, Globe, X, CheckCircle, AlertCircle, KeyRound, RefreshCw,
    TrendingUp, CreditCard, FileCheck
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import Swal from "sweetalert2";

import regionData from "../address_data/region.json";
import provinceData from "../address_data/province.json";
import cityData from "../address_data/city.json";
import barangayData from "../address_data/barangay.json";
import cityZipMap from "../address_data/city_zip_map.json";

const C = {
    bg: "#f4f6f5",
    surface: "#ffffff",
    sidebar: "#1a2e1a",
    green: "#2d7a2d",
    greenLight: "#4a9e4a",
    greenSoft: "rgba(45,122,45,.12)",
    border: "#e8ede8",
    text: "#1a2e1a",
    muted: "#7a9a7a",
    label: "#3a5a3a",
    body: "#5a7a5a",
    danger: "#c42d2d",
    dangerSoft: "rgba(196,45,45,.08)",
    error: "#c42d2d",
    errorBg: "#fde8e8",
    errorBorder: "#f5b8b8",
    success: "#2d7a2d",
    successBg: "#e8f5e8",
    successBorder: "#a8d8a8",
};

const inputBase = {
    width: "100%",
    height: "44px",
    padding: "0 14px 0 40px",
    border: `1.5px solid ${C.border}`,
    borderRadius: 9,
    fontSize: ".875rem",
    color: C.text,
    fontFamily: "'Outfit', sans-serif",
    background: C.surface,
    outline: "none",
    transition: "border-color .15s, box-shadow .15s",
    boxSizing: "border-box",
    lineHeight: "44px",
};
const inputDisabled = { ...inputBase, background: "#f0f4f0", color: C.muted, cursor: "not-allowed" };
const inputErr = { ...inputBase, borderColor: C.error, boxShadow: `0 0 0 3px ${C.dangerSoft}` };

const BLOCKED = ["09123456789", "09564789213", "09111112235", "09554178900"];

const V = {
    name(v, label = "This field") {
        if (!v || !v.trim()) return `${label} is required.`;
        const t = v.trim();
        if (t.length < 5) return "Minimum 5 characters.";
        if (t.length > 20) return "Maximum 20 characters.";
        if (!/^[A-Z]/.test(t)) return "Must start with a capital letter.";
        if (!/^[A-Za-z ]+$/.test(t)) return "Letters and spaces only.";
        return "";
    },
    middleName(v) {
        if (!v || !v.trim()) return "";
        const t = v.trim();
        if (t.length < 2) return "Minimum 2 characters.";
        if (t.length > 20) return "Maximum 20 characters.";
        if (!/^[A-Z]/.test(t)) return "Must start with a capital letter.";
        if (!/^[A-Za-z ]+$/.test(t)) return "Letters and spaces only.";
        return "";
    },
    dob(v) {
        if (!v) return "Date of birth is required.";
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const birth = new Date(v);
        if (birth >= today) return "Cannot be today or in the future.";
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        if (age < 18) return "Must be at least 18 years old.";
        if (age > 80) return "Must be 80 years old or below.";
        return "";
    },
    contact(v) {
        if (!v) return "Contact number is required.";
        if (!/^\d+$/.test(v)) return "Numbers only.";
        if (!v.startsWith("09")) return "Must start with 09.";
        if (v.length !== 11) return "Must be exactly 11 digits.";
        if (BLOCKED.includes(v)) return "Not a valid Philippine mobile number.";
        return "";
    },
    username(v) {
        if (!v) return "Username is required.";
        if (v.length < 5) return "Minimum 5 characters.";
        if (v.length > 20) return "Maximum 20 characters.";
        if (!/^[A-Z]/.test(v)) return "Must start with a capital letter.";
        if (/\s/.test(v)) return "No spaces allowed.";
        if (!/^[A-Za-z0-9]+$/.test(v)) return "Letters and numbers only.";
        return "";
    },
    email(v) {
        if (!v) return "Email is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address.";
        const domain = v.split("@")[1] || "";
        if (!domain.includes(".")) return "Email domain is incomplete.";
        const tld = domain.split(".").pop().toLowerCase();
        const BAD = ["co", "cm", "om", "ne", "or"];
        if (tld.length < 2) return "Domain extension is too short.";
        if (BAD.includes(tld)) return `".${tld}" looks incomplete. Did you mean .com?`;
        return "";
    },
    password(v) {
        if (!v) return "Password is required.";
        if (v.length < 8) return "Minimum 8 characters.";
        if (!/[A-Za-z]/.test(v)) return "Must contain at least one letter.";
        if (!/[0-9]/.test(v)) return "Must contain at least one number.";
        if (!/[^A-Za-z0-9]/.test(v)) return "Must contain at least one special character.";
        return "";
    },
    confirmPw(v, pw) {
        if (!v) return "Please confirm your password.";
        if (v !== pw) return "Passwords do not match.";
        return "";
    },
    required(v, label) { return !v ? `${label} is required.` : ""; },
};

function computeErrors(f) {
    return {
        firstName: V.name(f.firstName, "First name"),
        middleName: V.middleName(f.middleName),
        lastName: V.name(f.lastName, "Last name"),
        dateOfBirth: V.dob(f.dateOfBirth),
        contactNumber: V.contact(f.contactNumber),
        region: V.required(f.region, "Region"),
        province: V.required(f.province, "Province"),
        city: V.required(f.city, "City"),
        barangay: V.required(f.barangay, "Barangay"),
        username: V.username(f.username),
        email: V.email(f.email),
        password: V.password(f.password),
        confirmPassword: V.confirmPw(f.confirmPassword, f.password),
    };
}

function ErrMsg({ msg }) {
    if (!msg) return null;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
            <AlertCircle style={{ width: 11, height: 11, color: C.error, flexShrink: 0 }} />
            <span style={{ fontSize: ".72rem", color: C.error, lineHeight: 1.4 }}>{msg}</span>
        </div>
    );
}

function FieldLabel({ children, required }) {
    return (
        <label style={{
            display: "block",
            fontSize: ".7rem", fontWeight: 700,
            color: C.muted, marginBottom: 7,
            letterSpacing: ".07em", textTransform: "uppercase",
        }}>
            {children}
            {required && <span style={{ color: C.green, marginLeft: 2 }}>*</span>}
        </label>
    );
}

function IconWrap({ icon: Icon, hasError }) {
    return (
        <Icon style={{
            position: "absolute", left: 13,
            top: "50%", transform: "translateY(-50%)",
            width: 14, height: 14,
            color: hasError ? C.error : C.muted,
            pointerEvents: "none", zIndex: 1,
        }} />
    );
}

function Field({ label, required, icon, error, children }) {
    return (
        <div>
            <FieldLabel required={required}>{label}</FieldLabel>
            <div style={{ position: "relative" }}>
                <IconWrap icon={icon} hasError={!!error} />
                {children}
            </div>
            <ErrMsg msg={error} />
        </div>
    );
}

function TextInput({ name, value, onChange, onBlur, placeholder, type = "text", required, readOnly, hasError }) {
    const [focused, setFocused] = useState(false);
    const style = readOnly ? inputDisabled
        : hasError ? inputErr
            : { ...inputBase, borderColor: focused ? C.green : C.border, boxShadow: focused ? `0 0 0 3px ${C.greenSoft}` : "none" };
    return (
        <input type={type} name={name} value={value} onChange={onChange}
            placeholder={placeholder} required={required} readOnly={readOnly}
            style={style}
            onFocus={() => setFocused(true)}
            onBlur={e => { setFocused(false); onBlur?.(e); }}
        />
    );
}

function SelectInput({ name, value, onChange, onBlur, disabled, hasError, children }) {
    const [focused, setFocused] = useState(false);
    const base = disabled ? inputDisabled
        : hasError ? inputErr
            : { ...inputBase, borderColor: focused ? C.green : C.border, boxShadow: focused ? `0 0 0 3px ${C.greenSoft}` : "none" };
    return (
        <>
            <select name={name} value={value} onChange={onChange} disabled={disabled}
                style={{ ...base, paddingRight: 36, appearance: "none", cursor: disabled ? "not-allowed" : "pointer" }}
                onFocus={() => setFocused(true)}
                onBlur={e => { setFocused(false); onBlur?.(e); }}>
                {children}
            </select>
            <ChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: C.muted, pointerEvents: "none" }} />
        </>
    );
}

function SectionLabel({ children }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "1.75rem 0 1.25rem" }}>
            <span style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.green, whiteSpace: "nowrap" }}>
                {children}
            </span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
    );
}

function PasswordStrength({ password }) {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Za-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
        { label: "Too weak", color: "#c42d2d" },
        { label: "Weak", color: "#c47a00" },
        { label: "Fair", color: "#b8a000" },
        { label: "Strong", color: C.green },
        { label: "Strong", color: C.green },
    ];
    const { label, color } = levels[score];
    return (
        <div style={{ marginTop: 7 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? color : C.border, transition: "background .3s" }} />
                ))}
            </div>
            <span style={{ fontSize: ".71rem", color, fontWeight: 600 }}>{label}</span>
        </div>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }}>
            <div style={{ background: C.surface, borderRadius: 16, maxWidth: 580, width: "100%", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,.18)", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: `1px solid ${C.border}` }}>
                    <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.1rem", fontWeight: 600, color: C.text }}>{title}</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: C.muted }}
                        onMouseEnter={e => e.currentTarget.style.background = C.greenSoft}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        <X style={{ width: 18, height: 18 }} />
                    </button>
                </div>
                <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>{children}</div>
                <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${C.border}` }}>
                    <button onClick={onClose} style={{ width: "100%", padding: "10px", borderRadius: 8, background: C.sidebar, color: "#fff", fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: ".875rem", border: "none", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = C.green}
                        onMouseLeave={e => e.currentTarget.style.background = C.sidebar}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function ModalSection({ number, title, children }) {
    return (
        <div style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: ".85rem", fontWeight: 600, color: C.text, marginBottom: ".4rem" }}>{number}. {title}</h3>
            <p style={{ fontSize: ".83rem", color: C.body, lineHeight: 1.65 }}>{children}</p>
        </div>
    );
}

function OTPModal({ email, onVerified, onClose }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(300);
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef([]);
    const timerRef = useRef(null);
    const cooldownRef = useRef(null);

    useEffect(() => {
        timerRef.current = setInterval(() => setTimeLeft(t => t <= 1 ? (clearInterval(timerRef.current), 0) : t - 1), 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const handleOtpChange = (i, val) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...otp]; next[i] = val.slice(-1); setOtp(next); setOtpError("");
        if (val && i < 5) inputRefs.current[i + 1]?.focus();
    };
    const handleKeyDown = (i, e) => { if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus(); };
    const handlePaste = e => {
        e.preventDefault();
        const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (p.length === 6) { setOtp(p.split("")); inputRefs.current[5]?.focus(); }
    };

    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length !== 6) { setOtpError("Please enter all 6 digits."); return; }
        if (timeLeft === 0) { setOtpError("Code has expired. Please request a new one."); return; }
        setVerifying(true);
        try {
            const res = await fetch("http://localhost:5000/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp: code }) });
            const data = await res.json();
            if (res.ok) onVerified();
            else { setOtpError(data.message || "Invalid code."); setOtp(["", "", "", "", "", ""]); inputRefs.current[0]?.focus(); }
        } catch { setOtpError("Network error."); } finally { setVerifying(false); }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setResending(true); setOtpError("");
        try {
            const res = await fetch("http://localhost:5000/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
            if (res.ok) {
                setOtp(["", "", "", "", "", ""]); setTimeLeft(300);
                clearInterval(timerRef.current);
                timerRef.current = setInterval(() => setTimeLeft(t => t <= 1 ? (clearInterval(timerRef.current), 0) : t - 1), 1000);
                setResendCooldown(60); clearInterval(cooldownRef.current);
                cooldownRef.current = setInterval(() => setResendCooldown(c => c <= 1 ? (clearInterval(cooldownRef.current), 0) : c - 1), 1000);
                inputRefs.current[0]?.focus();
            } else setOtpError("Failed to resend.");
        } catch { setOtpError("Network error."); } finally { setResending(false); }
    };

    const expired = timeLeft === 0;
    const filled = otp.every(d => d !== "");

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,.4)", backdropFilter: "blur(4px)" }}>
            <div style={{ background: C.surface, borderRadius: 16, maxWidth: 420, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,.12)", border: `1px solid ${C.border}`, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: C.sidebar, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <KeyRound style={{ width: 16, height: 16, color: "#fff" }} />
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1rem", fontWeight: 600, color: C.text }}>Email Verification</h2>
                            <p style={{ fontSize: ".7rem", color: C.muted, marginTop: 1 }}>Enter the code sent to your email</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 7, color: C.muted, display: "flex" }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.greenSoft; e.currentTarget.style.color = C.text; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.muted; }}>
                        <X style={{ width: 16, height: 16 }} />
                    </button>
                </div>
                <div style={{ padding: "1.5rem" }}>
                    <div style={{ padding: "10px 14px", background: C.bg, borderRadius: 9, border: `1px solid ${C.border}`, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8 }}>
                        <Mail style={{ width: 14, height: 14, color: C.muted, flexShrink: 0 }} />
                        <span style={{ fontSize: ".8rem", color: C.body }}>Code sent to <strong style={{ color: C.text }}>{email}</strong></span>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, marginBottom: "1.25rem", background: expired ? C.errorBg : timeLeft <= 60 ? "#fff8e8" : C.successBg, border: `1px solid ${expired ? C.errorBorder : timeLeft <= 60 ? "#f5d8a0" : C.successBorder}` }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: expired ? C.error : timeLeft <= 60 ? "#c47a00" : C.success }} />
                        <span style={{ fontSize: ".75rem", fontWeight: 600, color: expired ? C.error : timeLeft <= 60 ? "#8a5200" : "#1a5c1a" }}>
                            {expired ? "Code expired — request a new one" : `Expires in ${fmt(timeLeft)}`}
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: "1rem" }} onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                            <input key={i} ref={el => inputRefs.current[i] = el}
                                type="text" inputMode="numeric" maxLength={1} value={digit}
                                onChange={e => handleOtpChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                autoFocus={i === 0} disabled={expired}
                                style={{ width: 48, height: 52, textAlign: "center", fontSize: "1.3rem", fontWeight: 700, fontFamily: "'Outfit', sans-serif", border: `1.5px solid ${otpError ? C.error : digit ? C.green : C.border}`, borderRadius: 9, background: digit ? C.greenSoft : expired ? C.bg : "#fff", color: C.text, outline: "none", cursor: expired ? "not-allowed" : "text" }}
                                onFocus={e => { if (!expired) { e.target.style.borderColor = C.green; e.target.style.boxShadow = `0 0 0 3px ${C.greenSoft}`; } }}
                                onBlur={e => { e.target.style.borderColor = otpError ? C.error : digit ? C.green : C.border; e.target.style.boxShadow = "none"; }}
                            />
                        ))}
                    </div>
                    {otpError && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 8, marginBottom: "1rem" }}>
                            <AlertCircle style={{ width: 13, height: 13, color: C.error, flexShrink: 0 }} />
                            <span style={{ fontSize: ".78rem", color: C.error }}>{otpError}</span>
                        </div>
                    )}
                    <p style={{ fontSize: ".73rem", color: C.muted, marginBottom: "1.25rem" }}>Check your spam folder if you don't see the email.</p>
                    <button onClick={handleVerify} disabled={!filled || verifying || expired}
                        style={{ width: "100%", padding: "11px", borderRadius: 8, background: (!filled || expired) ? C.border : C.sidebar, color: (!filled || expired) ? C.muted : "#fff", border: "none", cursor: (!filled || verifying || expired) ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: ".9rem", marginBottom: ".75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                        onMouseEnter={e => { if (filled && !expired && !verifying) e.currentTarget.style.background = C.green; }}
                        onMouseLeave={e => { if (filled && !expired && !verifying) e.currentTarget.style.background = C.sidebar; }}>
                        <CheckCircle style={{ width: 15, height: 15 }} />
                        {verifying ? "Verifying..." : "Verify Email"}
                    </button>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <span style={{ fontSize: ".8rem", color: C.muted }}>Didn't receive it?</span>
                        <button onClick={handleResend} disabled={resendCooldown > 0 || resending}
                            style={{ background: "none", border: "none", cursor: resendCooldown > 0 ? "not-allowed" : "pointer", color: resendCooldown > 0 ? C.muted : C.green, fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: ".8rem", display: "inline-flex", alignItems: "center", gap: 4, padding: 0 }}>
                            <RefreshCw style={{ width: 11, height: 11 }} />
                            {resending ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                        </button>
                    </div>
                </div>
                <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.bg }}>
                    <Shield style={{ width: 12, height: 12, color: C.muted }} />
                    <span style={{ fontSize: ".72rem", color: C.muted }}>Your information is encrypted and secure</span>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    const navigate = useNavigate();

    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [pendingPayload, setPendingPayload] = useState(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [pwFocused, setPwFocused] = useState(false);
    const [confirmFocused, setConfirmFocused] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "", middleName: "", lastName: "",
        dateOfBirth: "", age: "", contactNumber: "",
        region: "", province: "", city: "", barangay: "", zipCode: "",
        username: "", email: "", password: "", confirmPassword: "",
    });

    const filteredProvinces = useMemo(() => provinceData.filter(p => p.region_code === formData.region), [formData.region]);
    const filteredCities = useMemo(() => cityData.filter(c => c.province_code === formData.province), [formData.province]);
    const filteredBarangays = useMemo(() => barangayData.filter(b => b.city_code === formData.city), [formData.city]);

    useEffect(() => {
        if (!formData.dateOfBirth) { setFormData(p => ({ ...p, age: "" })); return; }
        const today = new Date(), birth = new Date(formData.dateOfBirth);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        setFormData(prev => ({ ...prev, age: age >= 0 ? age.toString() : "" }));
    }, [formData.dateOfBirth]);

    useEffect(() => {
        setFormData(prev => ({ ...prev, zipCode: cityZipMap[formData.city] ?? "" }));
    }, [formData.city]);

    const errors = useMemo(() => computeErrors(formData), [formData]);
    const touch = name => setTouched(p => ({ ...p, [name]: true }));
    const err = name => touched[name] ? errors[name] : "";

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === "region") { next.province = ""; next.city = ""; next.barangay = ""; next.zipCode = ""; }
            if (name === "province") { next.city = ""; next.barangay = ""; next.zipCode = ""; }
            if (name === "city") { next.barangay = ""; }
            return next;
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const ce = computeErrors(formData);
        setTouched(Object.fromEntries(Object.keys(ce).map(k => [k, true])));
        if (Object.values(ce).some(Boolean)) {
            await Swal.fire({ title: "Please fix the errors", text: "Some fields have invalid values.", icon: "warning", confirmButtonText: "Review Form", confirmButtonColor: C.sidebar, customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" } });
            return;
        }
        if (!agreedToTerms) {
            await Swal.fire({ title: "Agreement Required", text: "Please agree to the Terms of Service and Privacy Policy.", icon: "warning", confirmButtonText: "Got it", confirmButtonColor: C.sidebar, customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" } });
            return;
        }
        const regionObj = regionData.find(r => r.region_code === formData.region);
        const provinceObj = provinceData.find(p => p.province_code === formData.province);
        const cityObj = cityData.find(c => c.city_code === formData.city);
        const barangayObj = barangayData.find(b => b.brgy_code === formData.barangay);
        const payload = {
            firstName: formData.firstName, middleName: formData.middleName, lastName: formData.lastName,
            dateOfBirth: formData.dateOfBirth, age: formData.age, contactNumber: formData.contactNumber,
            region: formData.region, province: formData.province, city: formData.city, barangay: formData.barangay, zipCode: formData.zipCode,
            regionName: regionObj?.region_name || "", provinceName: provinceObj?.province_name || "",
            cityName: cityObj?.city_name || "", barangayName: barangayObj?.brgy_name || "",
            username: formData.username, email: formData.email, password: formData.password,
        };
        try {
            setLoading(true);
            const otpRes = await fetch("http://localhost:5000/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: formData.email, firstName: formData.firstName }) });
            if (!otpRes.ok) {
                const d = await otpRes.json();
                await Swal.fire({ title: "Failed to Send Code", text: d.message || "Could not send verification email.", icon: "error", confirmButtonText: "OK", confirmButtonColor: C.sidebar, customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" } });
                return;
            }
        } catch {
            await Swal.fire({ title: "Network Error", text: "Cannot reach the server.", icon: "error", confirmButtonText: "OK", confirmButtonColor: C.sidebar, customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" } });
            return;
        } finally { setLoading(false); }
        setPendingPayload(payload);
        setShowOTPModal(true);
    };

    // ── FIX: Save to localStorage after successful registration ───────────────
    const handleOTPVerified = async () => {
        setShowOTPModal(false);
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pendingPayload),
            });
            const data = await res.json();
            if (!res.ok) {
                await Swal.fire({
                    title: "Registration Failed",
                    text: data.message || "Something went wrong.",
                    icon: "error", confirmButtonText: "Try Again", confirmButtonColor: C.sidebar,
                    customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" }
                });
                return;
            }

            // ── Save full profile to localStorage so UserProfilePage can read it ──
            const saved = {
                ...pendingPayload,
                id: data.user.id,
                role: data.user.role || "User",
                joined: data.user.joined,
                isVerified: false,
                creditScore: null,
                verifiedAt: null,
                idType: "",
                idNumber: "",
            };
            localStorage.setItem("registrationData", JSON.stringify(saved));

        } catch {
            await Swal.fire({
                title: "Network Error", text: "Cannot reach the server.",
                icon: "error", confirmButtonText: "OK", confirmButtonColor: C.sidebar,
                customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" }
            });
            return;
        } finally { setLoading(false); }

        await Swal.fire({
            title: "Account Created!",
            html: `<p style="font-size:.9rem;color:#5a7a5a;line-height:1.6;">Welcome to LoanShark, <strong style="color:#1a2e1a">${pendingPayload.firstName}</strong>!<br/>Your email has been verified and your account is ready.</p>`,
            icon: "success", confirmButtonText: "Go to Sign In", confirmButtonColor: C.sidebar,
            allowOutsideClick: false,
            customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" }
        });
        navigate("/login");
    };

    const pwInputStyle = (hasErr, focused) => hasErr
        ? { ...inputErr, paddingRight: 44 }
        : { ...inputBase, paddingRight: 44, borderColor: focused ? C.green : C.border, boxShadow: focused ? `0 0 0 3px ${C.greenSoft}` : "none" };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Outfit:wght@300;400;500;600;700&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Outfit', sans-serif; background: ${C.bg}; color: ${C.text}; }
                @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
                .fade-up  { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
                .fade-up2 { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) .1s both; }
                .slide-in { animation: slideIn .55s cubic-bezier(.16,1,.3,1) both; }
                a { text-decoration: none; }
                .swal-popup   { border-radius: 16px !important; font-family: 'Outfit', sans-serif !important; padding: 2rem !important; }
                .swal-title   { font-family: 'Lora', serif !important; font-size: 1.3rem !important; color: ${C.text} !important; }
                .swal-confirm { font-family: 'Outfit', sans-serif !important; font-weight: 600 !important; border-radius: 8px !important; padding: 10px 22px !important; }
                .swal2-actions { gap: .6rem !important; }
                .rp::-webkit-scrollbar { width: 4px; }
                .rp::-webkit-scrollbar-thumb { background: #c8d8c8; border-radius: 99px; }
                input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
            `}</style>

            {showOTPModal && <OTPModal email={formData.email} onVerified={handleOTPVerified} onClose={() => setShowOTPModal(false)} />}
            {showTermsModal && (
                <Modal title="Terms of Service" onClose={() => setShowTermsModal(false)}>
                    <ModalSection number="1" title="Acceptance of Terms">By accessing LoanShark's services, you agree to these Terms.</ModalSection>
                    <ModalSection number="2" title="Loan Services">LoanShark provides a platform for loan management and processing.</ModalSection>
                    <ModalSection number="3" title="Account Registration">You must provide accurate and complete information when creating an account.</ModalSection>
                    <ModalSection number="4" title="Eligibility">You must be at least 18 years old to use our services.</ModalSection>
                    <ModalSection number="5" title="Fees and Payments">Any fees will be clearly disclosed before transaction completion.</ModalSection>
                    <ModalSection number="6" title="Prohibited Activities">You agree not to engage in fraudulent or illegal activities.</ModalSection>
                    <ModalSection number="7" title="Termination">LoanShark may suspend accounts that violate these terms.</ModalSection>
                    <ModalSection number="8" title="Limitation of Liability">LoanShark is not liable for indirect or consequential damages.</ModalSection>
                    <ModalSection number="9" title="Changes to Terms">We may modify terms at any time. Continued use constitutes acceptance.</ModalSection>
                    <ModalSection number="10" title="Contact">For questions: support@loanshark.ph</ModalSection>
                    <p style={{ fontSize: ".75rem", color: C.muted, marginTop: "1rem" }}>Last updated: March 6, 2026</p>
                </Modal>
            )}
            {showPrivacyModal && (
                <Modal title="Privacy Policy" onClose={() => setShowPrivacyModal(false)}>
                    <ModalSection number="1" title="Information We Collect">Personal info including name, contact, date of birth, address, and financial details.</ModalSection>
                    <ModalSection number="2" title="How We Use Your Information">Loan processing, identity verification, credit checks, and legal compliance.</ModalSection>
                    <ModalSection number="3" title="Data Security">Industry-standard encryption, secure servers, and regular audits.</ModalSection>
                    <ModalSection number="4" title="Information Sharing">May share with lending partners, credit bureaus, and regulatory authorities.</ModalSection>
                    <ModalSection number="5" title="Cookies">We use cookies to enhance experience and analyze traffic.</ModalSection>
                    <ModalSection number="6" title="Your Rights">You may access, correct, or delete your personal information.</ModalSection>
                    <ModalSection number="7" title="Data Retention">Typically 5–7 years after account closure.</ModalSection>
                    <ModalSection number="8" title="Third-Party Links">We are not responsible for third-party privacy practices.</ModalSection>
                    <ModalSection number="9" title="Children's Privacy">Services are not directed to individuals under 18.</ModalSection>
                    <ModalSection number="10" title="Policy Updates">Significant changes will be notified via email or platform notice.</ModalSection>
                    <p style={{ fontSize: ".75rem", color: C.muted, marginTop: "1rem" }}>Last updated: March 6, 2026</p>
                </Modal>
            )}

            <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

                {/* ── LEFT PANEL ── */}
                <div className="slide-in" style={{
                    width: "36%", minWidth: 300,
                    background: `linear-gradient(160deg, ${C.sidebar} 0%, #2a4a2a 100%)`,
                    display: "flex", flexDirection: "column", padding: "3rem",
                    position: "relative", overflow: "hidden", flexShrink: 0,
                }}>
                    <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(45,122,45,.18)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: 80, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(45,122,45,.1)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: -30, right: 60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />

                    <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(45,122,45,.4)" }}>
                            <Landmark style={{ width: 19, height: 19, color: "#fff" }} />
                        </div>
                        <span style={{ fontFamily: "'Lora', serif", fontSize: "1.25rem", fontWeight: 600, color: "#fff" }}>LoanShark</span>
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(45,122,45,.25)", border: "1px solid rgba(45,122,45,.4)", borderRadius: 20, padding: "5px 14px", marginBottom: "1.5rem", width: "fit-content" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#9de89d", animation: "pulse 2s infinite" }} />
                            <span style={{ fontSize: ".7rem", fontWeight: 700, color: "#9de89d", letterSpacing: ".08em", textTransform: "uppercase" }}>Free Registration</span>
                        </div>
                        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "2.2rem", fontWeight: 600, color: "#fff", lineHeight: 1.2, marginBottom: "1rem" }}>
                            Join LoanShark<br />
                            <span style={{ color: "#9de89d" }}>in minutes.</span>
                        </h1>
                        <p style={{ fontSize: ".9rem", color: "rgba(255,255,255,.55)", lineHeight: 1.7, maxWidth: 300, marginBottom: "2.5rem" }}>
                            Create your account and start managing loans, payments, and your credit score — all in one place.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                            {[
                                { icon: FileCheck, label: "Quick and easy application" },
                                { icon: Shield, label: "Bank-grade encryption" },
                                { icon: TrendingUp, label: "Real-time credit scoring" },
                                { icon: CreditCard, label: "Flexible loan options" },
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
                    <p style={{ fontSize: ".72rem", color: "rgba(255,255,255,.28)", position: "relative" }}>© 2026 LoanShark. All rights reserved.</p>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="rp" style={{ flex: 1, overflowY: "auto", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center" }}>

                    <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", padding: "1.25rem 2.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: ".82rem", color: C.muted }}>Already have an account?</span>
                            <Link to="/login" style={{ padding: "7px 18px", borderRadius: 8, background: C.surface, border: `1.5px solid ${C.border}`, color: C.label, fontFamily: "'Outfit',sans-serif", fontSize: ".82rem", fontWeight: 600 }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.color = C.green; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.label; }}>
                                Sign In
                            </Link>
                        </div>
                    </div>

                    <div style={{ width: "100%", maxWidth: 660, padding: "0 2.5rem 4rem" }}>

                        <div className="fade-up" style={{ marginBottom: "2rem" }}>
                            <p style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.green, marginBottom: ".5rem" }}>Get Started</p>
                            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.9rem", fontWeight: 600, color: C.text, marginBottom: ".4rem" }}>Create your account</h2>
                            <p style={{ fontSize: ".85rem", color: C.muted, fontWeight: 300 }}>
                                Fill in your details below. Fields marked with <span style={{ color: C.green }}>*</span> are required.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="fade-up2"
                            style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: "2rem", boxShadow: "0 4px 24px rgba(26,46,26,.06)" }}
                            noValidate>

                            <SectionLabel>Personal Information</SectionLabel>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.1rem", marginBottom: "1.1rem" }}>
                                <Field label="First Name" required icon={User} error={err("firstName")}>
                                    <TextInput name="firstName" value={formData.firstName} onChange={handleChange} onBlur={() => touch("firstName")} placeholder="e.g. Juan" required hasError={!!err("firstName")} />
                                </Field>
                                <Field label="Middle Name" icon={User} error={err("middleName")}>
                                    <TextInput name="middleName" value={formData.middleName} onChange={handleChange} onBlur={() => touch("middleName")} placeholder="e.g. Dela" hasError={!!err("middleName")} />
                                </Field>
                                <Field label="Last Name" required icon={User} error={err("lastName")}>
                                    <TextInput name="lastName" value={formData.lastName} onChange={handleChange} onBlur={() => touch("lastName")} placeholder="e.g. Cruz" required hasError={!!err("lastName")} />
                                </Field>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.1rem" }}>
                                <Field label="Date of Birth" required icon={Calendar} error={err("dateOfBirth")}>
                                    <TextInput name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} onBlur={() => touch("dateOfBirth")} type="date" required hasError={!!err("dateOfBirth")} />
                                </Field>
                                <Field label="Age" icon={User}>
                                    <TextInput value={formData.age} placeholder="Auto-calculated" readOnly />
                                </Field>
                                <Field label="Contact Number" required icon={Phone} error={err("contactNumber")}>
                                    <TextInput name="contactNumber" value={formData.contactNumber} onChange={handleChange} onBlur={() => touch("contactNumber")} placeholder="09XXXXXXXXX" type="tel" required hasError={!!err("contactNumber")} />
                                </Field>
                            </div>

                            <SectionLabel>Address</SectionLabel>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.1rem", marginBottom: "1.1rem" }}>
                                <Field label="Region" required icon={Globe} error={err("region")}>
                                    <SelectInput name="region" value={formData.region} onChange={handleChange} onBlur={() => touch("region")} hasError={!!err("region")}>
                                        <option value="">Select Region</option>
                                        {regionData.map(r => <option key={r.region_code} value={r.region_code}>{r.region_name}</option>)}
                                    </SelectInput>
                                </Field>
                                <Field label="Province" required icon={MapPin} error={err("province")}>
                                    <SelectInput name="province" value={formData.province} onChange={handleChange} onBlur={() => touch("province")} disabled={!formData.region} hasError={!!err("province")}>
                                        <option value="">{formData.region ? "Select Province" : "Select Region first"}</option>
                                        {filteredProvinces.map(p => <option key={p.province_code} value={p.province_code}>{p.province_name}</option>)}
                                    </SelectInput>
                                </Field>
                                <Field label="City / Municipality" required icon={MapPin} error={err("city")}>
                                    <SelectInput name="city" value={formData.city} onChange={handleChange} onBlur={() => touch("city")} disabled={!formData.province} hasError={!!err("city")}>
                                        <option value="">{formData.province ? "Select City" : "Select Province first"}</option>
                                        {filteredCities.map(c => <option key={c.city_code} value={c.city_code}>{c.city_name}</option>)}
                                    </SelectInput>
                                </Field>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.1rem" }}>
                                <Field label="Barangay" required icon={Home} error={err("barangay")}>
                                    <SelectInput name="barangay" value={formData.barangay} onChange={handleChange} onBlur={() => touch("barangay")} disabled={!formData.city} hasError={!!err("barangay")}>
                                        <option value="">{formData.city ? "Select Barangay" : "Select City first"}</option>
                                        {filteredBarangays.map(b => <option key={b.brgy_code} value={b.brgy_code}>{b.brgy_name}</option>)}
                                    </SelectInput>
                                </Field>
                                <Field label="Zip Code" icon={MapPin}>
                                    <TextInput value={formData.zipCode} placeholder="Auto-filled" readOnly />
                                </Field>
                            </div>

                            <SectionLabel>Account Details</SectionLabel>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem", marginBottom: "1.1rem" }}>
                                <Field label="Username" required icon={User} error={err("username")}>
                                    <TextInput name="username" value={formData.username} onChange={handleChange} onBlur={() => touch("username")} placeholder="e.g. JuanCruz01" required hasError={!!err("username")} />
                                </Field>
                                <Field label="Email Address" required icon={Mail} error={err("email")}>
                                    <TextInput name="email" value={formData.email} onChange={handleChange} onBlur={() => touch("email")} placeholder="you@example.com" type="email" required hasError={!!err("email")} />
                                </Field>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem" }}>
                                <div>
                                    <FieldLabel required>Password</FieldLabel>
                                    <div style={{ position: "relative" }}>
                                        <Lock style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: err("password") ? C.error : C.muted, pointerEvents: "none", zIndex: 1 }} />
                                        <input type={showPw ? "text" : "password"} name="password" value={formData.password}
                                            onChange={handleChange} placeholder="Create a password" required
                                            style={pwInputStyle(!!err("password"), pwFocused)}
                                            onFocus={() => setPwFocused(true)}
                                            onBlur={() => { setPwFocused(false); touch("password"); }}
                                        />
                                        <button type="button" onClick={() => setShowPw(!showPw)}
                                            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
                                            {showPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                                        </button>
                                    </div>
                                    <PasswordStrength password={formData.password} />
                                    <ErrMsg msg={err("password")} />
                                </div>

                                <div>
                                    <FieldLabel required>Confirm Password</FieldLabel>
                                    <div style={{ position: "relative" }}>
                                        <Lock style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: err("confirmPassword") ? C.error : C.muted, pointerEvents: "none", zIndex: 1 }} />
                                        <input type={showConfirmPw ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword}
                                            onChange={handleChange} placeholder="Confirm your password" required
                                            style={pwInputStyle(!!err("confirmPassword"), confirmFocused)}
                                            onFocus={() => setConfirmFocused(true)}
                                            onBlur={() => { setConfirmFocused(false); touch("confirmPassword"); }}
                                        />
                                        <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                                            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
                                            {showConfirmPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                                        </button>
                                    </div>
                                    {formData.confirmPassword && !errors.confirmPassword && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 7 }}>
                                            <CheckCircle style={{ width: 11, height: 11, color: C.success }} />
                                            <span style={{ fontSize: ".71rem", color: C.success, fontWeight: 600 }}>Passwords match</span>
                                        </div>
                                    )}
                                    <ErrMsg msg={err("confirmPassword")} />
                                </div>
                            </div>

                            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "1.5rem", marginTop: "2rem" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: "1rem" }}>
                                    <input type="checkbox" id="terms" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                                        style={{ marginTop: 3, width: 15, height: 15, accentColor: C.green, cursor: "pointer", flexShrink: 0 }} />
                                    <label htmlFor="terms" style={{ fontSize: ".85rem", color: C.body, lineHeight: 1.55, cursor: "pointer" }}>
                                        I agree to the{" "}
                                        <button type="button" onClick={() => setShowTermsModal(true)} style={{ background: "none", border: "none", color: C.green, fontWeight: 600, fontSize: ".85rem", cursor: "pointer", padding: 0, fontFamily: "'Outfit',sans-serif" }}>Terms of Service</button>
                                        {" "}and{" "}
                                        <button type="button" onClick={() => setShowPrivacyModal(true)} style={{ background: "none", border: "none", color: C.green, fontWeight: 600, fontSize: ".85rem", cursor: "pointer", padding: 0, fontFamily: "'Outfit',sans-serif" }}>Privacy Policy</button>
                                    </label>
                                </div>

                                {agreedToTerms && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: 8, marginBottom: "1rem" }}>
                                        <CheckCircle style={{ width: 14, height: 14, color: C.success, flexShrink: 0 }} />
                                        <span style={{ fontSize: ".82rem", color: "#1a5c1a" }}>You have agreed to the Terms and Privacy Policy</span>
                                    </div>
                                )}

                                <div style={{ height: 1, background: C.border, marginBottom: "1.25rem" }} />

                                <button type="submit" disabled={loading} style={{
                                    width: "100%", height: "46px",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    borderRadius: 10, background: loading ? C.muted : C.green,
                                    color: "#fff", fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: ".9rem",
                                    border: "none", cursor: loading ? "not-allowed" : "pointer",
                                    transition: "background .18s, transform .15s", marginBottom: "1rem",
                                }}
                                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = C.greenLight; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                                    onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = C.green; e.currentTarget.style.transform = "translateY(0)"; } }}>
                                    {loading
                                        ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} /> Sending verification…</>
                                        : <>Create Account <ArrowRight style={{ width: 15, height: 15 }} /></>
                                    }
                                </button>

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                    <Shield style={{ width: 12, height: 12, color: C.muted }} />
                                    <span style={{ fontSize: ".75rem", color: C.muted }}>Your connection is encrypted and secure</span>
                                </div>
                            </div>
                        </form>

                        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: ".83rem", color: C.muted }}>
                            Already have an account?{" "}
                            <Link to="/login" style={{ color: C.green, fontWeight: 600 }}
                                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}