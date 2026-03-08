// src/pages/UserProfilePage.jsx
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Landmark, User, Mail, Phone, MapPin, Calendar,
    Shield, LogOut, ArrowLeft, ChevronDown, CheckCircle,
    AlertCircle, Save, Globe, Home, Hash, TrendingUp,
    ShieldAlert, ShieldCheck, FileText, Edit2,
    BadgeCheck, Fingerprint, CreditCard, Lock, Eye, EyeOff, KeyRound,
    ChevronRight, Bell, LayoutDashboard
} from "lucide-react";
import Swal from "sweetalert2";

import regionData from "../address_data/region.json";
import provinceData from "../address_data/province.json";
import cityData from "../address_data/city.json";
import barangayData from "../address_data/barangay.json";
import cityZipMap from "../address_data/city_zip_map.json";

const C = {
    bg: "#f4f6f5",
    sidebar: "#1a2e1a",
    sidebarActive: "#2d5a2d",
    green: "#2d7a2d",
    greenLight: "#4a9e4a",
    greenSoft: "rgba(45,122,45,.12)",
    greenBorder: "rgba(45,122,45,.25)",
    white: "#ffffff",
    border: "#e8ede8",
    text: "#1a2e1a",
    muted: "#7a9a7a",
    label: "#3a5a3a",
    success: "#2d7a2d",
    warning: "#c47a00",
    danger: "#c42d2d",
    card: "#ffffff",
    blueSoft: "rgba(37,99,235,.08)",
    blue: "#2563eb",
};

// ── Profile field validators (mirrors RegisterPage) ───────────────────────────
const BLOCKED = ["09123456789", "09564789213", "09111112235", "09554178900"];

const VP = {
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
};

function getRiskLevel(score) {
    if (score >= 750) return { level: "Excellent", color: "#2d7a2d", bg: "#f0f9f0", bar: "#4a9e4a", border: "#c8e8c8", text: "Low Risk" };
    if (score >= 650) return { level: "Good", color: "#c47a00", bg: "#fff8e8", bar: "#e09a20", border: "#f8e4b0", text: "Medium Risk" };
    return { level: "Fair", color: "#c42d2d", bg: "#fdf0f0", bar: "#e05555", border: "#f8c8c8", text: "High Risk" };
}

const inputBase = {
    width: "100%",
    padding: "10px 12px 10px 38px",
    border: `1.5px solid ${C.border}`,
    borderRadius: 10,
    fontSize: ".875rem",
    color: C.text,
    fontFamily: "'Outfit', sans-serif",
    background: C.white,
    outline: "none",
    transition: "border-color .15s, box-shadow .15s",
};
const inputRO = {
    ...inputBase,
    background: C.bg,
    color: C.label,
    cursor: "default",
    border: `1.5px solid ${C.border}`,
};
const inputErr = {
    ...inputBase,
    borderColor: C.danger,
    boxShadow: "0 0 0 3px rgba(196,45,45,.08)",
};

// ── Field wrapper with optional error display ─────────────────────────────────
function Field({ label, required, icon: Icon, children, error }) {
    return (
        <div>
            <label style={{ display: "block", fontSize: ".7rem", fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: ".07em", textTransform: "uppercase" }}>
                {label}{required && <span style={{ color: C.green, marginLeft: 2 }}>*</span>}
            </label>
            <div style={{ position: "relative" }}>
                <Icon style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: error ? C.danger : C.muted, zIndex: 1, pointerEvents: "none" }} />
                {children}
            </div>
            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                    <AlertCircle style={{ width: 11, height: 11, color: C.danger, flexShrink: 0 }} />
                    <span style={{ fontSize: ".72rem", color: C.danger, lineHeight: 1.4 }}>{error}</span>
                </div>
            )}
        </div>
    );
}

function TextInput({ name, value, onChange, placeholder, type = "text", required, readOnly, hasError }) {
    const [focused, setFocused] = useState(false);
    const style = readOnly ? inputRO
        : hasError ? inputErr
            : { ...inputBase, borderColor: focused ? C.green : C.border, boxShadow: focused ? `0 0 0 3px ${C.greenSoft}` : "none" };
    return (
        <input
            type={type} name={name} value={value || ""} onChange={onChange}
            placeholder={placeholder} required={required} readOnly={readOnly}
            style={style}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    );
}

function SelectInput({ name, value, onChange, disabled, hasError, children }) {
    const [focused, setFocused] = useState(false);
    const style = disabled ? { ...inputRO, paddingRight: 36, appearance: "none" }
        : hasError ? { ...inputErr, paddingRight: 36, appearance: "none", cursor: "pointer" }
            : {
                ...inputBase, paddingRight: 36, appearance: "none",
                borderColor: focused ? C.green : C.border,
                boxShadow: focused ? `0 0 0 3px ${C.greenSoft}` : "none",
                cursor: "pointer",
            };
    return (
        <>
            <select name={name} value={value || ""} onChange={onChange} disabled={disabled}
                style={style}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}>
                {children}
            </select>
            <ChevronDown style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: C.muted, pointerEvents: "none", zIndex: 1 }} />
        </>
    );
}

function PasswordStrengthBar({ password }) {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Za-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
        { label: "Too weak", color: "#c42d2d" },
        { label: "Weak", color: "#c47a00" },
        { label: "Fair", color: "#e09a20" },
        { label: "Strong", color: C.green },
        { label: "Strong", color: C.green },
    ];
    const { label, color } = levels[score];
    return (
        <div style={{ marginTop: 7 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= score ? color : C.border, transition: "background .25s" }} />
                ))}
            </div>
            <span style={{ fontSize: ".7rem", fontWeight: 700, color, letterSpacing: ".02em" }}>{label}</span>
        </div>
    );
}

function PasswordInput({ name, value, onChange, placeholder, readOnly }) {
    const [show, setShow] = useState(false);
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ position: "relative" }}>
            <Lock style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: C.muted, zIndex: 1, pointerEvents: "none" }} />
            <input
                type={show ? "text" : "password"}
                name={name} value={value || ""} onChange={onChange}
                placeholder={placeholder} readOnly={readOnly}
                style={readOnly ? { ...inputRO, paddingRight: 38 } : {
                    ...inputBase, paddingRight: 38,
                    borderColor: focused ? C.green : C.border,
                    boxShadow: focused ? `0 0 0 3px ${C.greenSoft}` : "none",
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
            {!readOnly && (
                <button type="button" onClick={() => setShow(s => !s)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex", padding: 2, borderRadius: 4, transition: "color .15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                    {show ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                </button>
            )}
        </div>
    );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: `1.5px solid ${C.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: 16, height: 16, color: C.green }} />
            </div>
            <div>
                <p style={{ fontSize: ".9rem", fontWeight: 700, color: C.text, fontFamily: "'Lora', serif", lineHeight: 1.2 }}>{title}</p>
                {subtitle && <p style={{ fontSize: ".73rem", color: C.muted, marginTop: 2 }}>{subtitle}</p>}
            </div>
        </div>
    );
}

function Card({ children, style = {} }) {
    return (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "1.75rem", ...style }}>
            {children}
        </div>
    );
}

function CreditScoreCard({ score = 600 }) {
    const risk = getRiskLevel(score);
    const pct = Math.min(100, Math.max(0, ((score - 500) / 350) * 100));
    const segments = [
        { label: "Low Risk", range: "750–850", color: C.green },
        { label: "Med Risk", range: "650–749", color: "#c47a00" },
        { label: "High Risk", range: "500–649", color: C.danger },
    ];
    return (
        <Card style={{ background: `linear-gradient(135deg, ${risk.bg} 0%, #fff 100%)`, border: `1.5px solid ${risk.border}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${risk.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TrendingUp style={{ width: 18, height: 18, color: risk.color }} />
                    </div>
                    <div>
                        <p style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted }}>Credit Score</p>
                        <p style={{ fontSize: ".8rem", fontWeight: 600, color: risk.color }}>{risk.text}</p>
                    </div>
                </div>
                <span style={{ fontSize: ".7rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: `${risk.color}15`, color: risk.color, border: `1px solid ${risk.border}` }}>
                    {risk.level}
                </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: "1rem" }}>
                <span style={{ fontFamily: "'Lora', serif", fontSize: "3.2rem", fontWeight: 600, color: risk.color, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: ".9rem", color: C.muted, fontWeight: 500 }}>/850</span>
            </div>
            <div style={{ height: 7, borderRadius: 99, background: `${risk.color}18`, overflow: "hidden", marginBottom: ".75rem" }}>
                <div style={{ height: "100%", borderRadius: 99, background: risk.bar, width: `${pct}%`, transition: "width 1.2s cubic-bezier(.16,1,.3,1)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {segments.map(s => (
                    <div key={s.label} style={{ padding: "6px 7px", borderRadius: 8, background: `${s.color}0d`, border: `1px solid ${s.color}25`, textAlign: "center" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, margin: "0 auto 3px" }} />
                        <p style={{ fontSize: ".62rem", fontWeight: 700, color: s.color }}>{s.label}</p>
                        <p style={{ fontSize: ".58rem", color: C.muted }}>{s.range}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function VerificationBanner({ isVerified, verifiedAt, idType, onVerifyClick }) {
    if (isVerified) {
        return (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "1rem 1.5rem", background: "#f0f9f0", border: `1.5px solid #c8e8c8`, borderRadius: 12, marginBottom: "1.5rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ShieldCheck style={{ width: 19, height: 19, color: C.green }} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: ".875rem", fontWeight: 700, color: C.text, fontFamily: "'Lora', serif" }}>Identity Verified</p>
                    <p style={{ fontSize: ".73rem", color: C.muted, marginTop: 2 }}>
                        Verified {verifiedAt ? new Date(verifiedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} · {idType?.replace('_', ' ')}
                    </p>
                </div>
                <BadgeCheck style={{ width: 22, height: 22, color: C.green, flexShrink: 0 }} />
            </div>
        );
    }
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "1rem 1.5rem", background: "#fff9ed", border: "1.5px solid #f8e4b0", borderRadius: 12, marginBottom: "1.5rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff3cd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldAlert style={{ width: 19, height: 19, color: "#c47a00" }} />
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: ".875rem", fontWeight: 700, color: C.text, fontFamily: "'Lora', serif" }}>Account Not Verified</p>
                <p style={{ fontSize: ".73rem", color: C.muted, marginTop: 2 }}>Verify your identity to unlock all loan features</p>
            </div>
            <button onClick={onVerifyClick} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 18px", borderRadius: 8, border: "none",
                background: "#c47a00", color: "#fff",
                fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: ".8rem", cursor: "pointer",
                flexShrink: 0, transition: "background .15s", whiteSpace: "nowrap"
            }}
                onMouseEnter={e => e.currentTarget.style.background = "#a06000"}
                onMouseLeave={e => e.currentTarget.style.background = "#c47a00"}>
                <Fingerprint style={{ width: 14, height: 14 }} /> Verify Now
            </button>
        </div>
    );
}

function SideStatTile({ label, value, icon: Icon, color }) {
    return (
        <div style={{ padding: "10px 12px", borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: 14, height: 14, color }} />
            </div>
            <div>
                <p style={{ fontSize: ".63rem", fontWeight: 700, color: C.muted, letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</p>
                <p style={{ fontSize: ".85rem", fontWeight: 600, color: C.text, marginTop: 1 }}>{value || "—"}</p>
            </div>
        </div>
    );
}

export default function UserProfilePage() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [formData, setFormData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [visible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");

    // ── Profile field errors ──────────────────────────────────────────────────
    const [profileErrors, setProfileErrors] = useState({});

    const [pwData, setPwData] = useState({ current: "", newPw: "", confirm: "" });
    const [pwErrors, setPwErrors] = useState({});
    const [pwTouched, setPwTouched] = useState({});

    const filteredProvinces = useMemo(() => provinceData.filter(p => p.region_code === formData.region), [formData.region]);
    const filteredCities = useMemo(() => cityData.filter(c => c.province_code === formData.province), [formData.province]);
    const filteredBarangays = useMemo(() => barangayData.filter(b => b.city_code === formData.city), [formData.city]);

    useEffect(() => {
        loadProfile();
        setIsVerified(localStorage.getItem("isVerified") === "true");
        const t = setTimeout(() => setVisible(true), 60);
        return () => clearTimeout(t);
    }, []);

    // Age and zip are now computed inline in handleChange and loadProfile — no useEffects needed

    // ── Helper: compute age from a YYYY-MM-DD string ──────────────────────────
    const calcAge = (dob) => {
        if (!dob) return "";
        const today = new Date(), birth = new Date(dob);
        if (isNaN(birth.getTime())) return "";
        let a = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
        return a >= 0 ? a.toString() : "";
    };

    const loadProfile = () => {
        try {
            const raw = JSON.parse(localStorage.getItem("registrationData") || "{}");
            const regionObj = regionData.find(r => r.region_name === raw.regionName);
            const provinceObj = provinceData.find(p => p.province_name === raw.provinceName);
            const cityObj = cityData.find(c => c.city_name === raw.cityName);
            const barangayObj = barangayData.find(b => b.brgy_name === raw.barangayName);
            const profile = {
                firstName: raw.firstName || "",
                middleName: raw.middleName || "",
                lastName: raw.lastName || "",
                dateOfBirth: raw.dateOfBirth || "",
                age: calcAge(raw.dateOfBirth),   // always recalculate from DOB
                contactNumber: raw.contactNumber || "",
                email: raw.email || "",
                username: raw.username || "",
                region: regionObj?.region_code || "",
                province: provinceObj?.province_code || "",
                city: cityObj?.city_code || "",
                barangay: barangayObj?.brgy_code || "",
                regionName: raw.regionName || "",
                provinceName: raw.provinceName || "",
                cityName: raw.cityName || "",
                barangayName: raw.barangayName || "",
                zipCode: raw.zipCode || "",
                role: raw.role || "User",
                joined: raw.joined || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
                creditScore: raw.creditScore || 600,
                verifiedAt: raw.verifiedAt || null,
                idType: raw.idType || "",
                idNumber: raw.idNumber || "",
                password: raw.password || "",
            };
            setFormData(profile);
            setOriginalData(profile);
        } catch (e) { console.error(e); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileErrors(prev => ({ ...prev, [name]: undefined }));
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === "dateOfBirth") {
                next.age = calcAge(value);
            }
            if (name === "region") { next.province = ""; next.city = ""; next.barangay = ""; next.provinceName = ""; next.cityName = ""; next.barangayName = ""; next.zipCode = ""; next.regionName = regionData.find(r => r.region_code === value)?.region_name || ""; }
            if (name === "province") { next.city = ""; next.barangay = ""; next.cityName = ""; next.barangayName = ""; next.zipCode = ""; next.provinceName = provinceData.find(p => p.province_code === value)?.province_name || ""; }
            if (name === "city") { next.barangay = ""; next.barangayName = ""; next.cityName = cityData.find(c => c.city_code === value)?.city_name || ""; next.zipCode = cityZipMap[value] || ""; }
            if (name === "barangay") { next.barangayName = barangayData.find(b => b.brgy_code === value)?.brgy_name || ""; }
            return next;
        });
    };

    // ── TAB that owns each field, for auto-navigation on error ────────────────
    const TAB_MAP = {
        firstName: "personal", middleName: "personal", lastName: "personal",
        dateOfBirth: "personal", contactNumber: "personal",
        region: "address", province: "address", city: "address", barangay: "address",
        username: "account", email: "account",
    };

    const handleUpdate = async () => {
        if (!isEditing) { setIsEditing(true); return; }

        // ── 1. Profile field validation ───────────────────────────────────────
        const pe = {};
        const fn = VP.name(formData.firstName, "First name"); if (fn) pe.firstName = fn;
        const mn = VP.middleName(formData.middleName); if (mn) pe.middleName = mn;
        const ln = VP.name(formData.lastName, "Last name"); if (ln) pe.lastName = ln;
        const dob = VP.dob(formData.dateOfBirth); if (dob) pe.dateOfBirth = dob;
        const con = VP.contact(formData.contactNumber); if (con) pe.contactNumber = con;
        const usr = VP.username(formData.username); if (usr) pe.username = usr;
        const eml = VP.email(formData.email); if (eml) pe.email = eml;
        if (!formData.region) pe.region = "Region is required.";
        if (!formData.province) pe.province = "Province is required.";
        if (!formData.city) pe.city = "City is required.";
        if (!formData.barangay) pe.barangay = "Barangay is required.";

        setProfileErrors(pe);

        if (Object.keys(pe).length > 0) {
            // Auto-navigate to the tab containing the first error
            const firstKey = Object.keys(pe)[0];
            setActiveTab(TAB_MAP[firstKey] || "personal");
            await Swal.fire({
                title: "Fix Profile Errors",
                html: `<p style="font-size:.9rem;color:#6b7280;line-height:1.6;">Please correct the highlighted fields before saving.</p>`,
                icon: "warning", confirmButtonText: "OK", confirmButtonColor: C.green,
                allowOutsideClick: false,
                customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" }
            });
            return;
        }

        // ── 2. Password validation ────────────────────────────────────────────
        const pwFilled = pwData.current || pwData.newPw || pwData.confirm;
        const newPwErrors = {};
        if (pwFilled) {
            const stored = JSON.parse(localStorage.getItem("registrationData") || "{}");
            if (!pwData.current) newPwErrors.current = "Current password is required.";
            else if (pwData.current !== stored.password) newPwErrors.current = "Current password is incorrect.";
            if (!pwData.newPw) newPwErrors.newPw = "New password is required.";
            else if (pwData.newPw.length < 8) newPwErrors.newPw = "Minimum 8 characters.";
            else if (!/[A-Za-z]/.test(pwData.newPw)) newPwErrors.newPw = "Must contain at least one letter.";
            else if (!/[0-9]/.test(pwData.newPw)) newPwErrors.newPw = "Must contain at least one number.";
            else if (!/[^A-Za-z0-9]/.test(pwData.newPw)) newPwErrors.newPw = "Must contain at least one special character.";
            if (!pwData.confirm) newPwErrors.confirm = "Please confirm your new password.";
            else if (pwData.confirm !== pwData.newPw) newPwErrors.confirm = "Passwords do not match.";
        }
        if (Object.keys(newPwErrors).length > 0) {
            setPwErrors(newPwErrors);
            setPwTouched({ current: true, newPw: true, confirm: true });
            setActiveTab("security");
            await Swal.fire({
                title: "Fix Password Errors",
                html: `<p style="font-size:.9rem;color:#6b7280;line-height:1.6;">Please correct the password fields before saving.</p>`,
                icon: "warning", confirmButtonText: "OK", confirmButtonColor: C.green,
                allowOutsideClick: false,
                customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" }
            });
            return;
        }

        // ── 3. No changes? Just exit edit mode ────────────────────────────────
        const profileChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
        if (!profileChanged && !pwFilled) { setIsEditing(false); return; }

        // ── 4. Confirm & save ─────────────────────────────────────────────────
        const result = await Swal.fire({
            title: "Save Changes?",
            html: `<p style="font-size:.9rem;color:#6b7280;line-height:1.6;">Are you sure you want to update your profile information?</p>`,
            icon: "question", showCancelButton: true,
            confirmButtonText: "Yes, save", cancelButtonText: "Cancel",
            confirmButtonColor: C.green, reverseButtons: true, allowOutsideClick: false,
            customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm", cancelButton: "swal-cancel" }
        });

        if (result.isConfirmed) {
            const updated = {
                ...formData,
                creditScore: originalData.creditScore,
                verifiedAt: originalData.verifiedAt,
                idType: originalData.idType,
                idNumber: originalData.idNumber,
                password: pwFilled ? pwData.newPw : originalData.password,
            };
            localStorage.setItem("registrationData", JSON.stringify(updated));
            await Swal.fire({
                title: "Profile Updated!",
                html: `<p style="font-size:.9rem;color:#6b7280;line-height:1.6;">${pwFilled ? "Your profile and password have been saved." : "Your profile has been updated successfully."}</p>`,
                icon: "success", confirmButtonText: "Done", confirmButtonColor: C.green,
                allowOutsideClick: false,
                customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" }
            });
            setOriginalData(updated);
            setFormData(updated);
            setPwData({ current: "", newPw: "", confirm: "" });
            setPwErrors({});
            setPwTouched({});
            setProfileErrors({});
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
        setPwData({ current: "", newPw: "", confirm: "" });
        setPwErrors({});
        setPwTouched({});
        setProfileErrors({});
        setIsEditing(false);
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "Logging out?",
            html: `<p style="font-size:.9rem;color:#6b7280;">Are you sure you want to sign out?</p>`,
            icon: "warning", showCancelButton: true,
            confirmButtonText: "Yes, log out", cancelButtonText: "Cancel",
            confirmButtonColor: C.green, reverseButtons: true, allowOutsideClick: false,
            customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm", cancelButton: "swal-cancel" }
        });
        if (result.isConfirmed) {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userRole");
            await Swal.fire({
                title: "Logged out!", icon: "success", confirmButtonText: "Back to Login",
                confirmButtonColor: C.green, allowOutsideClick: false,
                customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" }
            });
            navigate("/login");
        }
    };

    const anim = (d = 0) => ({
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity .45s ease ${d}ms, transform .45s cubic-bezier(.16,1,.3,1) ${d}ms`
    });

    const fullName = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(" ") || "User";
    const initials = [(formData.firstName || "")[0], (formData.lastName || "")[0]].filter(Boolean).join("").toUpperCase() || "U";

    const TABS = [
        { id: "personal", label: "Personal", icon: User },
        { id: "address", label: "Address", icon: MapPin },
        { id: "account", label: "Account", icon: Shield },
        { id: "security", label: "Security", icon: KeyRound },
    ];

    // Helper: does this tab have any active errors?
    const tabHasError = (tabId) => {
        return Object.keys(profileErrors).some(k => TAB_MAP[k] === tabId && profileErrors[k]);
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Outfit:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Outfit', sans-serif; background: ${C.bg}; color: ${C.text}; }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #c8d8c8; border-radius: 99px; }
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
                .swal-popup  { border-radius: 16px !important; font-family: 'Outfit', sans-serif !important; padding: 2rem !important; }
                .swal-title  { font-family: 'Lora', serif !important; font-size: 1.3rem !important; color: ${C.text} !important; }
                .swal-confirm{ font-family: 'Outfit', sans-serif !important; font-weight: 600 !important; border-radius: 8px !important; padding: 10px 22px !important; }
                .swal-cancel { font-family: 'Outfit', sans-serif !important; font-weight: 500 !important; border-radius: 8px !important; padding: 10px 22px !important; color: ${C.label} !important; border: 1.5px solid ${C.border} !important; background: #fff !important; }
                .swal2-actions { gap: .6rem !important; }
                input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
            `}</style>

            <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg }}>

                {/* ── SIDEBAR ── */}
                <aside style={{ width: 220, minWidth: 220, background: C.sidebar, display: "flex", flexDirection: "column", zIndex: 30 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,.08)", minHeight: 64 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Landmark style={{ width: 17, height: 17, color: "#fff" }} />
                        </div>
                        <span style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>LoanShark</span>
                    </div>
                    <nav style={{ flex: 1, padding: ".75rem .6rem", display: "flex", flexDirection: "column", gap: 2 }}>
                        <button onClick={() => navigate("/home")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,.5)", fontFamily: "'Outfit',sans-serif", fontSize: ".83rem", fontWeight: 400, transition: "all .18s", width: "100%" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.color = "rgba(255,255,255,.85)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}>
                            <LayoutDashboard style={{ width: 16, height: 16, flexShrink: 0 }} />Dashboard
                        </button>
                        <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: "rgba(45,122,45,.35)", color: "#9de89d", fontFamily: "'Outfit',sans-serif", fontSize: ".83rem", fontWeight: 600, transition: "all .18s", width: "100%", position: "relative" }}>
                            <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: "0 3px 3px 0", background: "#9de89d" }} />
                            <User style={{ width: 16, height: 16, flexShrink: 0 }} />My Profile
                        </button>
                    </nav>
                    <div style={{ padding: ".75rem .6rem 1rem", borderTop: "1px solid rgba(255,255,255,.08)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 9, background: "rgba(255,255,255,.06)" }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: ".68rem", fontWeight: 700, color: "#fff" }}>{initials}</span>
                            </div>
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <p style={{ fontSize: ".75rem", fontWeight: 600, color: "#fff", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{formData.firstName || "User"}</p>
                                <p style={{ fontSize: ".63rem", color: "rgba(255,255,255,.45)", marginTop: 2 }}>{formData.role || "—"}</p>
                            </div>
                            <button onClick={handleLogout} title="Logout" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.35)", display: "flex", padding: 3, borderRadius: 5, flexShrink: 0, transition: "color .15s" }}
                                onMouseEnter={e => e.currentTarget.style.color = "#ff8080"}
                                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.35)"}>
                                <LogOut style={{ width: 13, height: 13 }} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* ── MAIN ── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                    {/* Top Bar */}
                    <header style={{ height: 64, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.75rem", gap: "1rem", flexShrink: 0, zIndex: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: ".78rem", color: C.muted }}>LoanShark</span>
                            <ChevronRight style={{ width: 13, height: 13, color: "#c8d8c8" }} />
                            <span style={{ fontSize: ".78rem", color: C.muted, cursor: "pointer" }} onClick={() => navigate("/home")}>Dashboard</span>
                            <ChevronRight style={{ width: 13, height: 13, color: "#c8d8c8" }} />
                            <span style={{ fontSize: ".78rem", fontWeight: 600, color: C.text }}>My Profile</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                            {isEditing && (
                                <button onClick={handleCancel} style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, color: C.label, fontFamily: "'Outfit',sans-serif", fontSize: ".8rem", fontWeight: 500, cursor: "pointer" }}>
                                    Cancel
                                </button>
                            )}
                            <button onClick={handleUpdate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, border: "none", background: isEditing ? C.green : C.text, color: "#fff", fontFamily: "'Outfit',sans-serif", fontSize: ".8rem", fontWeight: 600, cursor: "pointer", transition: "background .15s" }}
                                onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                                {isEditing ? <><Save style={{ width: 13, height: 13 }} /> Save Changes</> : <><Edit2 style={{ width: 13, height: 13 }} /> Edit Profile</>}
                            </button>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 5px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.white }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <span style={{ fontSize: ".68rem", fontWeight: 700, color: "#fff" }}>{initials}</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: ".76rem", fontWeight: 600, color: C.text, lineHeight: 1 }}>{fullName}</p>
                                    <p style={{ fontSize: ".63rem", color: C.muted, lineHeight: 1, marginTop: 2 }}>{formData.role}</p>
                                </div>
                                <div style={{ width: 1, height: 20, background: C.border, margin: "0 2px" }} />
                                <button onClick={handleLogout} title="Log out" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 5, color: C.muted, display: "flex" }}
                                    onMouseEnter={e => e.currentTarget.style.color = C.danger}
                                    onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                                    <LogOut style={{ width: 13, height: 13 }} />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main style={{ flex: 1, overflowY: "auto", padding: "1.75rem" }}>

                        {/* Profile Hero Banner */}
                        <div style={{ ...anim(0), background: `linear-gradient(135deg, ${C.sidebar} 0%, #2d4a2d 100%)`, borderRadius: 16, padding: "2rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(45,122,45,.2)", pointerEvents: "none" }} />
                            <div style={{ position: "absolute", bottom: -20, right: 120, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />
                            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", position: "relative" }}>
                                <div style={{ position: "relative", flexShrink: 0 }}>
                                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${C.green} 0%, #4a9e4a 100%)`, display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(255,255,255,.2)", boxShadow: "0 8px 30px rgba(0,0,0,.3)" }}>
                                        <span style={{ fontFamily: "'Lora', serif", fontSize: "1.9rem", fontWeight: 600, color: "#fff" }}>{initials}</span>
                                    </div>
                                    {isVerified && (
                                        <div style={{ position: "absolute", bottom: 2, right: 2, width: 22, height: 22, borderRadius: "50%", background: "#4a9e4a", border: "2.5px solid #1a2e1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <CheckCircle style={{ width: 12, height: 12, color: "#fff" }} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h1 style={{ fontFamily: "'Lora', serif", fontSize: "1.6rem", fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{fullName}</h1>
                                    <p style={{ fontSize: ".82rem", color: "rgba(255,255,255,.55)", marginTop: 4 }}>@{formData.username} · {formData.role}</p>
                                    <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem", flexWrap: "wrap" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: ".75rem", color: "rgba(255,255,255,.6)", background: "rgba(255,255,255,.07)", padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,.1)" }}>
                                            <Mail style={{ width: 11, height: 11 }} />{formData.email || "—"}
                                        </span>
                                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: ".75rem", color: "rgba(255,255,255,.6)", background: "rgba(255,255,255,.07)", padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,.1)" }}>
                                            <Phone style={{ width: 11, height: 11 }} />{formData.contactNumber || "—"}
                                        </span>
                                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: ".75rem", color: "rgba(255,255,255,.6)", background: "rgba(255,255,255,.07)", padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,.1)" }}>
                                            <Calendar style={{ width: 11, height: 11 }} />Member since {formData.joined}
                                        </span>
                                        {isVerified && (
                                            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: ".75rem", color: "#9de89d", background: "rgba(45,122,45,.3)", padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(45,122,45,.4)" }}>
                                                <BadgeCheck style={{ width: 11, height: 11 }} />Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem", alignItems: "start" }}>

                            {/* LEFT COLUMN */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", ...anim(80) }}>
                                <Card>
                                    <p style={{ fontSize: ".7rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".85rem" }}>Account Overview</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
                                        <SideStatTile label="Account Role" value={formData.role} icon={Shield} color={C.green} />
                                        <SideStatTile label="Member Since" value={formData.joined} icon={Calendar} color="#2563eb" />
                                        <SideStatTile label="Contact" value={formData.contactNumber} icon={Phone} color="#7c3aed" />
                                        <SideStatTile label="Location" value={formData.cityName || "—"} icon={MapPin} color={C.warning} />
                                    </div>
                                </Card>
                                {isVerified && <CreditScoreCard score={formData.creditScore} />}
                            </div>

                            {/* RIGHT COLUMN */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", ...anim(140) }}>

                                <VerificationBanner isVerified={isVerified} verifiedAt={formData.verifiedAt} idType={formData.idType} onVerifyClick={() => navigate("/verify")} />

                                {/* Tab Navigation — red dot on tabs with errors */}
                                <div style={{ display: "flex", gap: ".3rem", background: C.white, borderRadius: 12, padding: ".35rem", border: `1px solid ${C.border}` }}>
                                    {TABS.map(tab => {
                                        const active = activeTab === tab.id;
                                        const hasErr = isEditing && tabHasError(tab.id);
                                        return (
                                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: active ? C.sidebar : "transparent", color: active ? "#9de89d" : hasErr ? C.danger : C.muted, fontFamily: "'Outfit',sans-serif", fontSize: ".8rem", fontWeight: active ? 600 : 400, transition: "all .18s", whiteSpace: "nowrap", position: "relative" }}>
                                                <tab.icon style={{ width: 13, height: 13 }} />
                                                {tab.label}
                                                {hasErr && (
                                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.danger, position: "absolute", top: 6, right: 8 }} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* ── Tab: Personal ── */}
                                {activeTab === "personal" && (
                                    <Card>
                                        <SectionHeader icon={User} title="Personal Information" subtitle="Your basic personal details" />
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                                            <Field label="First Name" required icon={User} error={isEditing ? profileErrors.firstName : undefined}>
                                                <TextInput name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" required readOnly={!isEditing} hasError={isEditing && !!profileErrors.firstName} />
                                            </Field>
                                            <Field label="Middle Name" icon={User} error={isEditing ? profileErrors.middleName : undefined}>
                                                <TextInput name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Middle name" readOnly={!isEditing} hasError={isEditing && !!profileErrors.middleName} />
                                            </Field>
                                            <Field label="Last Name" required icon={User} error={isEditing ? profileErrors.lastName : undefined}>
                                                <TextInput name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" required readOnly={!isEditing} hasError={isEditing && !!profileErrors.lastName} />
                                            </Field>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                                            <Field label="Date of Birth" required icon={Calendar} error={isEditing ? profileErrors.dateOfBirth : undefined}>
                                                <TextInput name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} type="date" required readOnly={!isEditing} hasError={isEditing && !!profileErrors.dateOfBirth} />
                                            </Field>
                                            <Field label="Age" icon={User}>
                                                <TextInput value={formData.age} placeholder="Auto-calculated" readOnly />
                                            </Field>
                                            <Field label="Contact Number" required icon={Phone} error={isEditing ? profileErrors.contactNumber : undefined}>
                                                <TextInput name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="09XXXXXXXXX" type="tel" required readOnly={!isEditing} hasError={isEditing && !!profileErrors.contactNumber} />
                                            </Field>
                                        </div>
                                    </Card>
                                )}

                                {/* ── Tab: Address ── */}
                                {activeTab === "address" && (
                                    <Card>
                                        <SectionHeader icon={MapPin} title="Address Information" subtitle="Your current residential address" />
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                                            <Field label="Region" required icon={Globe} error={isEditing ? profileErrors.region : undefined}>
                                                {isEditing ? (
                                                    <SelectInput name="region" value={formData.region} onChange={handleChange} hasError={!!profileErrors.region}>
                                                        <option value="">Select Region</option>
                                                        {regionData.map(r => <option key={r.region_code} value={r.region_code}>{r.region_name}</option>)}
                                                    </SelectInput>
                                                ) : <TextInput value={formData.regionName} placeholder="Region" readOnly />}
                                            </Field>
                                            <Field label="Province" required icon={MapPin} error={isEditing ? profileErrors.province : undefined}>
                                                {isEditing ? (
                                                    <SelectInput name="province" value={formData.province} onChange={handleChange} disabled={!formData.region} hasError={!!profileErrors.province}>
                                                        <option value="">{formData.region ? "Select Province" : "Select Region first"}</option>
                                                        {filteredProvinces.map(p => <option key={p.province_code} value={p.province_code}>{p.province_name}</option>)}
                                                    </SelectInput>
                                                ) : <TextInput value={formData.provinceName} placeholder="Province" readOnly />}
                                            </Field>
                                            <Field label="City / Municipality" required icon={MapPin} error={isEditing ? profileErrors.city : undefined}>
                                                {isEditing ? (
                                                    <SelectInput name="city" value={formData.city} onChange={handleChange} disabled={!formData.province} hasError={!!profileErrors.city}>
                                                        <option value="">{formData.province ? "Select City" : "Select Province first"}</option>
                                                        {filteredCities.map(c => <option key={c.city_code} value={c.city_code}>{c.city_name}</option>)}
                                                    </SelectInput>
                                                ) : <TextInput value={formData.cityName} placeholder="City" readOnly />}
                                            </Field>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                            <Field label="Barangay" required icon={Home} error={isEditing ? profileErrors.barangay : undefined}>
                                                {isEditing ? (
                                                    <SelectInput name="barangay" value={formData.barangay} onChange={handleChange} disabled={!formData.city} hasError={!!profileErrors.barangay}>
                                                        <option value="">{formData.city ? "Select Barangay" : "Select City first"}</option>
                                                        {filteredBarangays.map(b => <option key={b.brgy_code} value={b.brgy_code}>{b.brgy_name}</option>)}
                                                    </SelectInput>
                                                ) : <TextInput value={formData.barangayName} placeholder="Barangay" readOnly />}
                                            </Field>
                                            <Field label="Zip Code" icon={MapPin}>
                                                <TextInput value={formData.zipCode} placeholder="Auto-filled" readOnly />
                                            </Field>
                                        </div>
                                    </Card>
                                )}

                                {/* ── Tab: Account ── */}
                                {activeTab === "account" && (
                                    <Card>
                                        <SectionHeader icon={Shield} title="Account Details" subtitle="Your login credentials and account info" />
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                            <Field label="Username" required icon={Hash} error={isEditing ? profileErrors.username : undefined}>
                                                <TextInput name="username" value={formData.username} onChange={handleChange} placeholder="Username" required readOnly={!isEditing} hasError={isEditing && !!profileErrors.username} />
                                            </Field>
                                            <Field label="Email Address" required icon={Mail} error={isEditing ? profileErrors.email : undefined}>
                                                <TextInput name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" type="email" required readOnly={!isEditing} hasError={isEditing && !!profileErrors.email} />
                                            </Field>
                                        </div>
                                    </Card>
                                )}

                                {/* ── Tab: Security ── */}
                                {activeTab === "security" && (
                                    <Card>
                                        <SectionHeader icon={KeyRound} title="Password & Security" subtitle={isEditing ? "Leave blank to keep your current password" : "Manage your account password"} />
                                        {!isEditing ? (
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: ".7rem", fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: ".07em", textTransform: "uppercase" }}>Current Password</label>
                                                    <div style={{ position: "relative" }}>
                                                        <Lock style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: C.muted, zIndex: 1, pointerEvents: "none" }} />
                                                        <input type="password" value="placeholder" readOnly style={{ ...inputRO }} />
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "flex-end" }}>
                                                    <div style={{ padding: "10px 14px", borderRadius: 9, background: C.greenSoft, border: `1px solid ${C.greenBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
                                                        <Shield style={{ width: 14, height: 14, color: C.green, flexShrink: 0 }} />
                                                        <span style={{ fontSize: ".78rem", color: C.green, fontWeight: 500 }}>Click <strong>Edit Profile</strong> to change your password</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                                <div style={{ padding: "10px 14px", borderRadius: 9, background: "#fff9ed", border: "1px solid #f8e4b0", display: "flex", alignItems: "center", gap: 8 }}>
                                                    <AlertCircle style={{ width: 14, height: 14, color: "#c47a00", flexShrink: 0 }} />
                                                    <span style={{ fontSize: ".78rem", color: "#7a5000" }}>Only fill these fields if you want to change your password.</span>
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: ".7rem", fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: ".07em", textTransform: "uppercase" }}>Current Password</label>
                                                    <PasswordInput name="current" value={pwData.current}
                                                        onChange={e => { setPwData(p => ({ ...p, current: e.target.value })); setPwTouched(p => ({ ...p, current: true })); setPwErrors(p => ({ ...p, current: "" })); }}
                                                        placeholder="Enter your current password" />
                                                    {pwTouched.current && pwErrors.current && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                                                            <AlertCircle style={{ width: 12, height: 12, color: C.danger, flexShrink: 0 }} />
                                                            <span style={{ fontSize: ".72rem", color: C.danger }}>{pwErrors.current}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                                    <div>
                                                        <label style={{ display: "block", fontSize: ".7rem", fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: ".07em", textTransform: "uppercase" }}>New Password</label>
                                                        <PasswordInput name="newPw" value={pwData.newPw}
                                                            onChange={e => { setPwData(p => ({ ...p, newPw: e.target.value })); setPwTouched(p => ({ ...p, newPw: true })); setPwErrors(p => ({ ...p, newPw: "" })); }}
                                                            placeholder="Create new password" />
                                                        <PasswordStrengthBar password={pwData.newPw} />
                                                        {pwTouched.newPw && pwErrors.newPw && (
                                                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                                                                <AlertCircle style={{ width: 12, height: 12, color: C.danger, flexShrink: 0 }} />
                                                                <span style={{ fontSize: ".72rem", color: C.danger }}>{pwErrors.newPw}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label style={{ display: "block", fontSize: ".7rem", fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: ".07em", textTransform: "uppercase" }}>Confirm New Password</label>
                                                        <PasswordInput name="confirm" value={pwData.confirm}
                                                            onChange={e => { setPwData(p => ({ ...p, confirm: e.target.value })); setPwTouched(p => ({ ...p, confirm: true })); setPwErrors(p => ({ ...p, confirm: "" })); }}
                                                            placeholder="Repeat new password" />
                                                        {pwData.confirm && !pwErrors.confirm && pwData.confirm === pwData.newPw && (
                                                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
                                                                <CheckCircle style={{ width: 12, height: 12, color: C.green }} />
                                                                <span style={{ fontSize: ".72rem", color: C.green, fontWeight: 600 }}>Passwords match</span>
                                                            </div>
                                                        )}
                                                        {pwTouched.confirm && pwErrors.confirm && (
                                                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                                                                <AlertCircle style={{ width: 12, height: 12, color: C.danger, flexShrink: 0 }} />
                                                                <span style={{ fontSize: ".72rem", color: C.danger }}>{pwErrors.confirm}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                )}

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: ".75rem" }}>
                                    <Shield style={{ width: 12, height: 12, color: C.muted }} />
                                    <span style={{ fontSize: ".73rem", color: C.muted }}>All data is encrypted and stored securely</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}