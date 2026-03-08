// src/pages/VerificationPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Landmark, User, Briefcase, Calendar, DollarSign, CreditCard,
    Shield, Upload, FileText, CheckCircle, AlertCircle, AlertTriangle,
    TrendingUp, Hash, ChevronDown, ChevronRight, X, LayoutDashboard,
    LogOut, MapPin, Eye
} from "lucide-react";
import Swal from "sweetalert2";

// ─── Credit Score Calculator ─────────────────────────────────────────────────
function calculateCreditScore({ monthlyIncome = 0, existingLoans = 0, employmentStatus = "employed", yearsInBusiness = 0, age = 30 }) {
    let score = 600;
    let incomeValue = 0;
    if (monthlyIncome === "below_10k") incomeValue = 5000;
    else if (monthlyIncome === "10k_20k") incomeValue = 15000;
    else if (monthlyIncome === "20k_30k") incomeValue = 25000;
    else if (monthlyIncome === "30k_40k") incomeValue = 35000;
    else if (monthlyIncome === "40k_50k") incomeValue = 45000;
    else if (monthlyIncome === "50k_60k") incomeValue = 55000;
    else if (monthlyIncome === "60k_70k") incomeValue = 65000;
    else if (monthlyIncome === "70k_80k") incomeValue = 75000;
    else if (monthlyIncome === "80k_90k") incomeValue = 85000;
    else if (monthlyIncome === "90k_100k") incomeValue = 95000;
    else if (monthlyIncome === "above_100k") incomeValue = 120000;

    if (incomeValue >= 100000) score += 100;
    else if (incomeValue >= 50000) score += 70;
    else if (incomeValue >= 25000) score += 40;
    else if (incomeValue >= 15000) score += 20;
    else if (incomeValue < 10000) score -= 30;

    if (existingLoans === 0) score += 40;
    else if (existingLoans === 1) score += 20;
    else if (existingLoans === 2) score -= 10;
    else if (existingLoans >= 3) score -= 30;

    if (employmentStatus === "employed") score += 50;
    else if (employmentStatus === "self-employed") {
        score += 30;
        if (yearsInBusiness >= 5) score += 20;
        else if (yearsInBusiness >= 2) score += 10;
    }
    else if (employmentStatus === "retired") score += 20;
    else if (employmentStatus === "unemployed") score -= 50;

    if (age >= 30 && age <= 55) score += 20;
    else if (age < 25) score -= 10;
    else if (age > 65) score -= 20;

    return Math.min(850, Math.max(500, Math.round(score)));
}

function getRiskLevel(score) {
    if (score >= 750) return { level: "Low Risk", color: "#2d7a2d", bg: "#f0f9f0", border: "#c8e8c8", bar: "#4a9e4a", icon: "✓", recommendation: "Eligible for all loan products at best rates." };
    if (score >= 650) return { level: "Medium Risk", color: "#c47a00", bg: "#fff9ed", border: "#f8e4b0", bar: "#e09a20", icon: "⚠", recommendation: "Approved with conditions — higher interest rates may apply." };
    return { level: "High Risk", color: "#c42d2d", bg: "#fdf0f0", border: "#f8c8c8", bar: "#e05555", icon: "✗", recommendation: "Not eligible for loans at this time." };
}

const ID_RULES = {
    passport: { pattern: /^[A-Z][0-9]{8}$/, desc: "1 letter + 8 digits (e.g. P12345678)" },
    drivers: { pattern: /^[A-Z]\d{2}-\d{7,8}$/, desc: "Format: A12-12345678" },
    umid: { pattern: /^\d{12}$/, desc: "12-digit number" },
    sss: { pattern: /^\d{2}-\d{7}-\d{1}$/, desc: "Format: 12-3456789-0" },
    gsis: { pattern: /^\d{11}$/, desc: "11-digit number" },
    prc: { pattern: /^\d{7,8}$/, desc: "7–8 digit number" },
    voters: { pattern: /^[A-Z0-9]{8,12}$/, desc: "8–12 alphanumeric characters" },
    postal: { pattern: /^\d{6,8}$/, desc: "6–8 digit number" },
    nationalId: { pattern: /^\d{12}$/, desc: "12-digit number (PhilSys ID)" },
};

function validateID(type, number) {
    if (!type || !number) return { valid: false, msg: "" };
    const rule = ID_RULES[type];
    if (!rule) return { valid: false, msg: "Unknown ID type" };
    if (rule.pattern.test(number)) return { valid: true, msg: "Valid format" };
    return { valid: false, msg: `Expected: ${rule.desc}` };
}

const C = {
    bg: "#f4f6f5", sidebar: "#1a2e1a", green: "#2d7a2d", greenLight: "#4a9e4a",
    greenSoft: "rgba(45,122,45,.12)", greenBorder: "rgba(45,122,45,.25)",
    white: "#ffffff", border: "#e8ede8", text: "#1a2e1a", muted: "#7a9a7a",
    label: "#3a5a3a", warning: "#c47a00", danger: "#c42d2d", card: "#ffffff",
};

const inputBase = {
    width: "100%", padding: "10px 12px 10px 38px", border: `1.5px solid ${C.border}`,
    borderRadius: 10, fontSize: ".875rem", color: C.text, fontFamily: "'Outfit', sans-serif",
    background: C.white, outline: "none", transition: "border-color .15s, box-shadow .15s",
};

function Field({ label, required, icon: Icon, children, error, hint }) {
    return (
        <div style={{ marginBottom: "1.1rem" }}>
            <label style={{ display: "block", fontSize: ".7rem", fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: ".07em", textTransform: "uppercase" }}>
                {label}{required && <span style={{ color: C.green, marginLeft: 2 }}>*</span>}
            </label>
            {hint && <p style={{ fontSize: ".72rem", color: C.muted, marginBottom: 5 }}>{hint}</p>}
            <div style={{ position: "relative" }}>
                {Icon && <Icon style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: error ? C.danger : C.muted, zIndex: 1, pointerEvents: "none" }} />}
                {children}
            </div>
            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                    <AlertCircle style={{ width: 12, height: 12, color: C.danger, flexShrink: 0 }} />
                    <span style={{ fontSize: ".72rem", color: C.danger }}>{error}</span>
                </div>
            )}
        </div>
    );
}

function TInput({ name, value, onChange, placeholder, type = "text", error }) {
    const [focused, setFocused] = useState(false);
    return (
        <input type={type} name={name} value={value || ""} onChange={onChange} placeholder={placeholder}
            style={{ ...inputBase, borderColor: error ? C.danger : focused ? C.green : C.border, boxShadow: error ? `0 0 0 3px rgba(196,45,45,.08)` : focused ? `0 0 0 3px ${C.greenSoft}` : "none" }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
    );
}

function SInput({ name, value, onChange, error, children }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ position: "relative" }}>
            <select name={name} value={value || ""} onChange={onChange}
                style={{ ...inputBase, paddingRight: 36, appearance: "none", borderColor: error ? C.danger : focused ? C.green : C.border, boxShadow: error ? `0 0 0 3px rgba(196,45,45,.08)` : focused ? `0 0 0 3px ${C.greenSoft}` : "none", cursor: "pointer" }}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
                {children}
            </select>
            <ChevronDown style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: C.muted, pointerEvents: "none" }} />
        </div>
    );
}

function SectionDivider({ children }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "1.5rem 0 1.1rem" }}>
            <span style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.green, whiteSpace: "nowrap" }}>{children}</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
    );
}

function CreditScoreCard({ score, compact = false }) {
    const risk = getRiskLevel(score);
    const pct = Math.min(100, Math.max(0, ((score - 500) / 350) * 100));
    return (
        <div style={{ background: risk.bg, borderRadius: 14, border: `1.5px solid ${risk.border}`, padding: compact ? "1rem 1.25rem" : "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: `${risk.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TrendingUp style={{ width: 16, height: 16, color: risk.color }} />
                    </div>
                    <div>
                        <p style={{ fontSize: ".65rem", fontWeight: 700, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase" }}>Credit Score</p>
                        {!compact && <p style={{ fontSize: ".75rem", fontWeight: 600, color: risk.color }}>{risk.level}</p>}
                    </div>
                </div>
                <span style={{ fontSize: ".7rem", fontWeight: 700, color: risk.color, background: `${risk.color}15`, border: `1px solid ${risk.border}`, borderRadius: 20, padding: "4px 12px" }}>
                    {risk.level}
                </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: ".75rem" }}>
                <span style={{ fontFamily: "'Lora', serif", fontSize: compact ? "2rem" : "3rem", fontWeight: 600, color: risk.color, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: ".9rem", color: C.muted, fontWeight: 500 }}>/850</span>
            </div>
            {!compact && (
                <p style={{ fontSize: ".8rem", color: risk.color, fontWeight: 500, marginBottom: "1rem", lineHeight: 1.5 }}>
                    {risk.icon} {risk.recommendation}
                </p>
            )}
            <div style={{ height: 7, borderRadius: 99, background: `${risk.color}18`, overflow: "hidden", marginBottom: compact ? 0 : ".5rem" }}>
                <div style={{ height: "100%", borderRadius: 99, background: risk.bar, width: `${pct}%`, transition: "width 1.2s cubic-bezier(.16,1,.3,1)" }} />
            </div>
            {!compact && (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                    <span style={{ fontSize: ".62rem", color: C.muted }}>500 · Poor</span>
                    <span style={{ fontSize: ".62rem", color: C.muted }}>850 · Excellent</span>
                </div>
            )}
        </div>
    );
}

const STEPS = [
    { n: 1, label: "Financial Info", icon: DollarSign },
    { n: 2, label: "ID Verification", icon: CreditCard },
    { n: 3, label: "Submit", icon: CheckCircle },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VerificationPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [profile, setProfile] = useState({});
    const [computedScore, setComputedScore] = useState(600);
    const [idVal, setIdVal] = useState({ valid: false, msg: "" });
    const [visible, setVisible] = useState(false);

    const [form, setForm] = useState({
        employmentStatus: "", occupation: "", monthlyIncome: "",
        existingLoans: "0", yearsInBusiness: "0",
        idType: "", idNumber: "", idFront: null, idBack: null,
    });

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("registrationData") || "{}");
        setProfile(data);
        if (data.isVerified) navigate("/profile");
        const t = setTimeout(() => setVisible(true), 60);
        return () => clearTimeout(t);
    }, [navigate]);

    useEffect(() => {
        const score = calculateCreditScore({
            monthlyIncome: form.monthlyIncome || "",
            existingLoans: Number(form.existingLoans) || 0,
            employmentStatus: form.employmentStatus,
            yearsInBusiness: Number(form.yearsInBusiness) || 0,
            age: Number(profile.age) || 30,
        });
        setComputedScore(score);
    }, [form.monthlyIncome, form.existingLoans, form.employmentStatus, form.yearsInBusiness, profile.age]);

    useEffect(() => { setIdVal(validateID(form.idType, form.idNumber)); }, [form.idType, form.idNumber]);

    const anim = (d = 0) => ({
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity .45s ease ${d}ms, transform .45s cubic-bezier(.16,1,.3,1) ${d}ms`
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        setErrors(p => ({ ...p, [name]: undefined }));
    };

    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { Swal.fire({ title: "File Too Large", text: "Maximum 5MB.", icon: "error", confirmButtonColor: C.green }); return; }
        if (!file.type.startsWith("image/")) { Swal.fire({ title: "Invalid File", text: "Please upload JPEG or PNG.", icon: "error", confirmButtonColor: C.green }); return; }
        const reader = new FileReader();
        reader.onloadend = () => { setForm(p => ({ ...p, [field]: reader.result })); setErrors(p => ({ ...p, [field]: undefined })); };
        reader.readAsDataURL(file);
    };

    const validateStep1 = () => {
        const e = {};
        if (!form.employmentStatus) e.employmentStatus = "Required";
        if (!form.occupation?.trim()) e.occupation = "Required";
        if (!form.monthlyIncome) e.monthlyIncome = "Required";
        if (form.employmentStatus === "self-employed" && !form.yearsInBusiness) e.yearsInBusiness = "Required";
        setErrors(e); return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e = {};
        if (!form.idType) e.idType = "Required";
        if (!form.idNumber) e.idNumber = "Required";
        else if (!idVal.valid) e.idNumber = idVal.msg || "Invalid ID format";
        if (!form.idFront) e.idFront = "Front photo required";
        if (!form.idBack) e.idBack = "Back photo required";
        setErrors(e); return Object.keys(e).length === 0;
    };

    const next = () => {
        if (step === 1) {
            if (!validateStep1()) { Swal.fire({ title: "Missing Information", text: "Please fill in all required fields.", icon: "warning", confirmButtonColor: C.green, customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" } }); return; }
            setStep(2);
        } else if (step === 2) {
            if (!validateStep2()) { Swal.fire({ title: "ID Incomplete", text: "Please complete all ID requirements.", icon: "warning", confirmButtonColor: C.green, customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" } }); return; }
            setStep(3);
        }
    };

    const goBack = () => { if (step > 1) { setStep(step - 1); setErrors({}); } };

    // ── FIXED handleSubmit: API-first, no silent catch ────────────────────────
    const handleSubmit = async () => {
        const risk = getRiskLevel(computedScore);

        if (!validateStep1() || !validateStep2()) {
            Swal.fire({ title: "Validation Error", text: "Please complete all required fields correctly.", icon: "error", confirmButtonColor: C.green });
            return;
        }

        if (computedScore < 650) {
            await Swal.fire({
                title: "Verification Unsuccessful",
                html: `<div style="text-align:center;padding:.5rem 0"><p style="font-size:.95rem;color:#374151;margin-bottom:.75rem">Your credit score is <strong style="color:#c42d2d">${computedScore}</strong> — classified as <strong style="color:#c42d2d">High Risk</strong>.</p><div style="background:#fdf0f0;border:1px solid #f8c8c8;border-radius:10px;padding:1rem;text-align:left"><p style="font-size:.8rem;color:#7a1a1a;line-height:1.7">❌ You are not eligible for loans at this time.<br/>You may reapply after <strong>3 months</strong> or improve your financial standing.</p></div></div>`,
                icon: "error", confirmButtonText: "Return to Profile", confirmButtonColor: C.green,
                customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" }
            });
            navigate("/profile");
            return;
        }

        const confirm = await Swal.fire({
            title: "Submit Verification?",
            html: `<p style="font-size:.9rem;color:#6b7280">Your credit score: <strong style="color:${risk.color}">${computedScore} — ${risk.level}</strong></p>`,
            icon: "question", showCancelButton: true,
            confirmButtonText: "Yes, submit", cancelButtonText: "Cancel",
            confirmButtonColor: C.green, reverseButtons: true,
            customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm", cancelButton: "swal-cancel" }
        });
        if (!confirm.isConfirmed) return;

        // Show loading
        Swal.fire({
            title: "Submitting…",
            html: `<p style="font-size:.9rem;color:#6b7280">Saving your verification to the server…</p>`,
            allowOutsideClick: false, showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
            customClass: { popup: "swal-popup", title: "swal-title" }
        });

        try {
            // ✅ Step 1: Call API — do NOT touch localStorage yet
            const response = await fetch("http://localhost:5000/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: profile.id,
                    employmentStatus: form.employmentStatus,
                    occupation: form.occupation,
                    monthlyIncome: form.monthlyIncome,   // range string e.g. "20k_30k"
                    existingLoans: form.existingLoans,
                    yearsInBusiness: form.yearsInBusiness,
                    idType: form.idType,
                    idNumber: form.idNumber,
                    creditScore: computedScore,
                    riskLevel: risk.level
                }),
            });

            const data = await response.json();

            // ✅ Step 2: If API failed, show real error and STOP — don't update localStorage
            if (!response.ok) {
                await Swal.fire({
                    title: "Verification Failed",
                    html: `<p style="font-size:.9rem;color:#6b7280">${data.message || "Something went wrong. Please try again."}</p>
                           ${data.debug ? `<p style="font-size:.75rem;color:#c42d2d;margin-top:.5rem;font-family:monospace">${data.debug}</p>` : ""}`,
                    icon: "error", confirmButtonText: "Try Again", confirmButtonColor: C.green,
                    customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" }
                });
                return;
            }

            // ✅ Step 3: API succeeded — update localStorage from DB response (source of truth)
            const updatedUser = data.user;
            const updated = {
                ...profile,
                ...updatedUser,
                isVerified: Boolean(updatedUser.isVerified),
                verifiedAt: updatedUser.verifiedAt || new Date().toISOString(),
                creditScore: data.creditScore,
                riskLevel: data.riskLevel,
                idType: form.idType,
                idNumber: `****${form.idNumber.slice(-4)}`,
            };
            localStorage.setItem("registrationData", JSON.stringify(updated));
            localStorage.setItem("isVerified", String(Boolean(updatedUser.isVerified)));
            localStorage.setItem("creditScore", String(data.creditScore));

            // ✅ Step 4: Show success
            await Swal.fire({
                title: "Verification Complete!",
                html: `<div style="text-align:center;padding:.5rem 0">
                         <p style="font-size:1rem;color:#374151;margin-bottom:.5rem">Credit Score: <strong style="color:${risk.color};font-size:1.2rem">${data.creditScore}</strong></p>
                         <p style="font-size:.85rem;font-weight:600;color:${risk.color};margin-bottom:.75rem">${data.riskLevel}</p>
                         <p style="font-size:.82rem;color:#6b7280;line-height:1.6">${risk.recommendation}</p>
                       </div>`,
                icon: "success", confirmButtonText: "Go to My Profile", confirmButtonColor: C.green,
                allowOutsideClick: false,
                customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" }
            });
            navigate("/profile");

        } catch (err) {
            // ✅ Network/server unreachable — show real error
            await Swal.fire({
                title: "Cannot Connect to Server",
                html: `<p style="font-size:.9rem;color:#6b7280">Make sure the backend is running and try again.</p>
                       <p style="font-size:.75rem;color:#c42d2d;margin-top:.5rem;font-family:monospace">${err.message}</p>`,
                icon: "error", confirmButtonText: "OK", confirmButtonColor: C.green,
                customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" }
            });
        }
    };

    const risk = getRiskLevel(computedScore);
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "User";
    const initials = [(profile.firstName || "")[0], (profile.lastName || "")[0]].filter(Boolean).join("").toUpperCase() || "U";

    const getIncomeDisplayText = (value) => {
        const ranges = {
            "below_10k": "Below ₱10,000", "10k_20k": "₱10,000 - ₱20,000",
            "20k_30k": "₱20,000 - ₱30,000", "30k_40k": "₱30,000 - ₱40,000",
            "40k_50k": "₱40,000 - ₱50,000", "50k_60k": "₱50,000 - ₱60,000",
            "60k_70k": "₱60,000 - ₱70,000", "70k_80k": "₱70,000 - ₱80,000",
            "80k_90k": "₱80,000 - ₱90,000", "90k_100k": "₱90,000 - ₱100,000",
            "above_100k": "Above ₱100,000"
        };
        return ranges[value] || value;
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Outfit:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Outfit', sans-serif; background: ${C.bg}; color: ${C.text}; }
                ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #c8d8c8; border-radius: 99px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .swal-popup  { border-radius: 16px !important; font-family: 'Outfit', sans-serif !important; padding: 2rem !important; }
                .swal-title  { font-family: 'Lora', serif !important; font-size: 1.3rem !important; color: ${C.text} !important; }
                .swal-confirm{ font-family: 'Outfit', sans-serif !important; font-weight: 600 !important; border-radius: 8px !important; padding: 10px 22px !important; }
                .swal-cancel { font-family: 'Outfit', sans-serif !important; font-weight: 500 !important; border-radius: 8px !important; padding: 10px 22px !important; color: ${C.label} !important; border: 1.5px solid ${C.border} !important; background: #fff !important; }
                .swal2-actions { gap: .6rem !important; }
            `}</style>

            <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg }}>

                {/* ── SIDEBAR ── */}
                <aside style={{ width: 220, minWidth: 220, background: C.sidebar, display: "flex", flexDirection: "column", zIndex: 30 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,.08)", minHeight: 64 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Landmark style={{ width: 17, height: 17, color: "#fff" }} />
                        </div>
                        <span style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>LoanShark</span>
                    </div>
                    <nav style={{ flex: 1, padding: ".75rem .6rem", display: "flex", flexDirection: "column", gap: 2 }}>
                        <button onClick={() => navigate("/home")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,.5)", fontFamily: "'Outfit',sans-serif", fontSize: ".83rem", width: "100%", transition: "all .18s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.color = "rgba(255,255,255,.85)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}>
                            <LayoutDashboard style={{ width: 16, height: 16 }} />Dashboard
                        </button>
                        <button onClick={() => navigate("/profile")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,.5)", fontFamily: "'Outfit',sans-serif", fontSize: ".83rem", width: "100%", transition: "all .18s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.color = "rgba(255,255,255,.85)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}>
                            <User style={{ width: 16, height: 16 }} />My Profile
                        </button>
                        <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: "rgba(45,122,45,.35)", color: "#9de89d", fontFamily: "'Outfit',sans-serif", fontSize: ".83rem", fontWeight: 600, width: "100%", position: "relative" }}>
                            <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: "0 3px 3px 0", background: "#9de89d" }} />
                            <Shield style={{ width: 16, height: 16 }} />Verification
                        </button>
                    </nav>
                    <div style={{ padding: ".75rem .6rem 1rem", borderTop: "1px solid rgba(255,255,255,.08)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 9, background: "rgba(255,255,255,.06)" }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: ".68rem", fontWeight: 700, color: "#fff" }}>{initials}</span>
                            </div>
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <p style={{ fontSize: ".75rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.firstName || "User"}</p>
                                <p style={{ fontSize: ".63rem", color: "rgba(255,255,255,.45)", marginTop: 1 }}>{profile.role || "—"}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── MAIN ── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <header style={{ height: 64, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.75rem", flexShrink: 0, zIndex: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: ".78rem", color: C.muted }}>LoanShark</span>
                            <ChevronRight style={{ width: 13, height: 13, color: "#c8d8c8" }} />
                            <span style={{ fontSize: ".78rem", color: C.muted, cursor: "pointer" }} onClick={() => navigate("/profile")}>My Profile</span>
                            <ChevronRight style={{ width: 13, height: 13, color: "#c8d8c8" }} />
                            <span style={{ fontSize: ".78rem", fontWeight: 600, color: C.text }}>Identity Verification</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 5px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.white }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: ".68rem", fontWeight: 700, color: "#fff" }}>{initials}</span>
                            </div>
                            <div>
                                <p style={{ fontSize: ".76rem", fontWeight: 600, color: C.text, lineHeight: 1 }}>{fullName}</p>
                                <p style={{ fontSize: ".63rem", color: C.muted, marginTop: 2 }}>{profile.role || "—"}</p>
                            </div>
                        </div>
                    </header>

                    <main style={{ flex: 1, overflowY: "auto", padding: "1.75rem" }}>
                        {/* Hero Banner */}
                        <div style={{ ...anim(0), background: `linear-gradient(135deg, ${C.sidebar} 0%, #2d4a2d 100%)`, borderRadius: 16, padding: "1.75rem 2rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(45,122,45,.2)", pointerEvents: "none" }} />
                            <div style={{ position: "absolute", bottom: -10, right: 100, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                                <div>
                                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(196,122,0,.25)", border: "1px solid rgba(196,122,0,.4)", borderRadius: 20, padding: "4px 12px", marginBottom: ".75rem" }}>
                                        <AlertTriangle style={{ width: 12, height: 12, color: "#f0c040" }} />
                                        <span style={{ fontSize: ".7rem", fontWeight: 700, color: "#f0c040", letterSpacing: ".05em", textTransform: "uppercase" }}>Unverified Account</span>
                                    </div>
                                    <h1 style={{ fontFamily: "'Lora', serif", fontSize: "1.55rem", fontWeight: 600, color: "#fff", lineHeight: 1.25 }}>Identity Verification</h1>
                                    <p style={{ fontSize: ".82rem", color: "rgba(255,255,255,.55)", marginTop: ".4rem", maxWidth: 440, lineHeight: 1.6 }}>
                                        Complete this process to receive your <strong style={{ color: "#9de89d" }}>credit score</strong> and unlock full loan eligibility. Takes 3–5 minutes.
                                    </p>
                                </div>
                                <div style={{ flexShrink: 0, textAlign: "center" }}>
                                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(45,122,45,.3)", border: "2px solid rgba(45,122,45,.5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto .5rem" }}>
                                        <Shield style={{ width: 28, height: 28, color: "#9de89d" }} />
                                    </div>
                                    <p style={{ fontSize: ".68rem", color: "rgba(255,255,255,.4)", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>Step {step} of 3</p>
                                </div>
                            </div>
                        </div>

                        {/* Step Progress */}
                        <div style={{ ...anim(60), background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "1.25rem 1.5rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 0 }}>
                            {STEPS.map((s, i) => {
                                const done = step > s.n, active = step === s.n;
                                return (
                                    <div key={s.n} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "none" }}>
                                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: done ? C.green : active ? C.sidebar : C.bg, border: `2px solid ${done || active ? C.green : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s" }}>
                                                {done ? <CheckCircle style={{ width: 16, height: 16, color: "#fff" }} /> : <s.icon style={{ width: 15, height: 15, color: active ? "#9de89d" : C.muted }} />}
                                            </div>
                                            <span style={{ fontSize: ".68rem", fontWeight: 700, color: done || active ? C.green : C.muted, letterSpacing: ".04em", whiteSpace: "nowrap" }}>{s.label}</span>
                                        </div>
                                        {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: step > s.n ? C.green : C.border, transition: "background .3s", margin: "0 8px", marginBottom: 22 }} />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Two-column layout */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.25rem", alignItems: "start" }}>
                            <div style={anim(100)}>

                                {/* Step 1 */}
                                {step === 1 && (
                                    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "1.75rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: `1px solid ${C.border}` }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <Briefcase style={{ width: 16, height: 16, color: C.green }} />
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: "'Lora', serif", fontSize: ".9rem", fontWeight: 600, color: C.text }}>Financial Information</p>
                                                <p style={{ fontSize: ".73rem", color: C.muted, marginTop: 2 }}>Tell us about your employment and income</p>
                                            </div>
                                        </div>
                                        <SectionDivider>Employment</SectionDivider>
                                        <Field label="Employment Status" required icon={Briefcase} error={errors.employmentStatus}>
                                            <SInput name="employmentStatus" value={form.employmentStatus} onChange={handleChange} error={errors.employmentStatus}>
                                                <option value="">Select status</option>
                                                <option value="employed">Employed</option>
                                                <option value="self-employed">Self-Employed</option>
                                                <option value="retired">Retired</option>
                                                <option value="unemployed">Unemployed</option>
                                            </SInput>
                                        </Field>
                                        <Field label="Occupation / Job Title" required icon={User} error={errors.occupation}>
                                            <TInput name="occupation" value={form.occupation} onChange={handleChange} placeholder="e.g. Software Engineer, Business Owner" error={errors.occupation} />
                                        </Field>
                                        {form.employmentStatus === "self-employed" && (
                                            <Field label="Years in Business" required icon={Calendar} error={errors.yearsInBusiness}>
                                                <TInput name="yearsInBusiness" value={form.yearsInBusiness} onChange={handleChange} type="number" placeholder="e.g. 3" error={errors.yearsInBusiness} />
                                            </Field>
                                        )}
                                        <SectionDivider>Financial Standing</SectionDivider>
                                        <Field label="Monthly Income" required icon={DollarSign} error={errors.monthlyIncome}>
                                            <SInput name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} error={errors.monthlyIncome}>
                                                <option value="">Select income range</option>
                                                <option value="below_10k">Below ₱10,000</option>
                                                <option value="10k_20k">₱10,000 - ₱20,000</option>
                                                <option value="20k_30k">₱20,000 - ₱30,000</option>
                                                <option value="30k_40k">₱30,000 - ₱40,000</option>
                                                <option value="40k_50k">₱40,000 - ₱50,000</option>
                                                <option value="50k_60k">₱50,000 - ₱60,000</option>
                                                <option value="60k_70k">₱60,000 - ₱70,000</option>
                                                <option value="70k_80k">₱70,000 - ₱80,000</option>
                                                <option value="80k_90k">₱80,000 - ₱90,000</option>
                                                <option value="90k_100k">₱90,000 - ₱100,000</option>
                                                <option value="above_100k">Above ₱100,000</option>
                                            </SInput>
                                        </Field>
                                        <Field label="Number of Existing Loans" required icon={CreditCard}>
                                            <SInput name="existingLoans" value={form.existingLoans} onChange={handleChange}>
                                                <option value="0">None</option>
                                                <option value="1">1 Active Loan</option>
                                                <option value="2">2 Active Loans</option>
                                                <option value="3">3 or More Loans</option>
                                            </SInput>
                                        </Field>
                                        <div style={{ display: "flex", gap: "1rem", marginTop: ".75rem" }}>
                                            <button onClick={() => navigate("/profile")} style={{ flex: 1, padding: "13px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, color: C.label, fontWeight: 600, fontSize: ".9rem", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Cancel</button>
                                            <button onClick={next} style={{ flex: 2, padding: "13px", borderRadius: 10, background: C.green, color: "#fff", border: "none", fontWeight: 600, fontSize: ".9rem", cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "background .18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                                                onMouseEnter={e => e.currentTarget.style.background = C.greenLight}
                                                onMouseLeave={e => e.currentTarget.style.background = C.green}>
                                                Continue to ID Verification <ChevronRight style={{ width: 15, height: 15 }} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2 */}
                                {step === 2 && (
                                    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "1.75rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: `1px solid ${C.border}` }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <CreditCard style={{ width: 16, height: 16, color: C.green }} />
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: "'Lora', serif", fontSize: ".9rem", fontWeight: 600, color: C.text }}>ID Verification</p>
                                                <p style={{ fontSize: ".73rem", color: C.muted, marginTop: 2 }}>Provide a valid government-issued ID</p>
                                            </div>
                                        </div>
                                        <div style={{ padding: "10px 14px", background: C.greenSoft, border: `1px solid ${C.greenBorder}`, borderRadius: 9, marginBottom: "1.25rem", display: "flex", gap: 8, alignItems: "flex-start" }}>
                                            <Shield style={{ width: 14, height: 14, color: C.green, flexShrink: 0, marginTop: 2 }} />
                                            <p style={{ fontSize: ".78rem", color: C.label, lineHeight: 1.5 }}>Accepted: Passport · Driver's License · UMID · SSS · GSIS · PRC · Voter's ID · Postal ID · National ID</p>
                                        </div>
                                        <SectionDivider>Government ID</SectionDivider>
                                        <Field label="ID Type" required icon={FileText} error={errors.idType}>
                                            <SInput name="idType" value={form.idType} onChange={handleChange} error={errors.idType}>
                                                <option value="">Select ID type</option>
                                                <option value="passport">Philippine Passport</option>
                                                <option value="drivers">Driver's License</option>
                                                <option value="umid">UMID</option>
                                                <option value="sss">SSS ID</option>
                                                <option value="gsis">GSIS ID</option>
                                                <option value="prc">PRC ID</option>
                                                <option value="voters">Voter's ID</option>
                                                <option value="postal">Postal ID</option>
                                                <option value="nationalId">National ID (PhilSys)</option>
                                            </SInput>
                                        </Field>
                                        {form.idType && <p style={{ fontSize: ".72rem", color: C.muted, marginTop: -8, marginBottom: 10, paddingLeft: 4 }}>Format: {ID_RULES[form.idType]?.desc}</p>}
                                        <Field label="ID Number" required icon={Hash} error={errors.idNumber}>
                                            <TInput name="idNumber" value={form.idNumber} onChange={handleChange} placeholder="Enter your ID number" error={errors.idNumber} />
                                        </Field>
                                        {form.idNumber && form.idType && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: -8, marginBottom: 12 }}>
                                                {idVal.valid
                                                    ? <><CheckCircle style={{ width: 13, height: 13, color: C.green }} /><span style={{ fontSize: ".73rem", color: C.green, fontWeight: 600 }}>Valid format</span></>
                                                    : <><AlertCircle style={{ width: 13, height: 13, color: C.danger }} /><span style={{ fontSize: ".73rem", color: C.danger }}>{idVal.msg}</span></>
                                                }
                                            </div>
                                        )}
                                        <SectionDivider>ID Photos</SectionDivider>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: ".75rem" }}>
                                            {[{ field: "idFront", label: "Front of ID" }, { field: "idBack", label: "Back of ID" }].map(({ field, label }) => (
                                                <div key={field}>
                                                    <label style={{ display: "block", fontSize: ".7rem", fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: ".07em", textTransform: "uppercase" }}>{label} <span style={{ color: C.green }}>*</span></label>
                                                    <div onClick={() => document.getElementById(field).click()}
                                                        style={{ border: `2px dashed ${errors[field] ? C.danger : form[field] ? C.green : C.border}`, borderRadius: 12, padding: "1.5rem 1rem", textAlign: "center", background: errors[field] ? "#fdf0f0" : form[field] ? C.greenSoft : C.bg, cursor: "pointer", transition: "all .2s" }}
                                                        onMouseEnter={e => { if (!form[field]) e.currentTarget.style.borderColor = C.green; }}
                                                        onMouseLeave={e => { if (!form[field]) e.currentTarget.style.borderColor = errors[field] ? C.danger : C.border; }}>
                                                        {form[field]
                                                            ? <><CheckCircle style={{ width: 26, height: 26, color: C.green, marginBottom: ".4rem" }} /><p style={{ fontSize: ".76rem", color: C.green, fontWeight: 600 }}>Uploaded ✓</p><p style={{ fontSize: ".68rem", color: C.muted, marginTop: 2 }}>Click to replace</p></>
                                                            : <><Upload style={{ width: 26, height: 26, color: C.muted, marginBottom: ".4rem" }} /><p style={{ fontSize: ".76rem", color: C.label, fontWeight: 500 }}>Click to upload</p><p style={{ fontSize: ".68rem", color: C.muted, marginTop: 2 }}>JPEG or PNG · Max 5MB</p></>
                                                        }
                                                        <input id={field} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e, field)} />
                                                    </div>
                                                    {errors[field] && <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}><AlertCircle style={{ width: 12, height: 12, color: C.danger }} /><span style={{ fontSize: ".72rem", color: C.danger }}>{errors[field]}</span></div>}
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                            <button onClick={goBack} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, color: C.label, cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 500, fontSize: ".875rem" }}>← Back</button>
                                            <button onClick={next} style={{ flex: 2, padding: "12px", borderRadius: 10, background: C.green, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: ".875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background .18s" }}
                                                onMouseEnter={e => e.currentTarget.style.background = C.greenLight}
                                                onMouseLeave={e => e.currentTarget.style.background = C.green}>
                                                Continue to Submit <ChevronRight style={{ width: 14, height: 14 }} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3 */}
                                {step === 3 && (
                                    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "1.75rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: `1px solid ${C.border}` }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <CheckCircle style={{ width: 16, height: 16, color: C.green }} />
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: "'Lora', serif", fontSize: ".9rem", fontWeight: 600, color: C.text }}>Ready to Submit</p>
                                                <p style={{ fontSize: ".73rem", color: C.muted, marginTop: 2 }}>Your information is complete</p>
                                            </div>
                                        </div>
                                        <CreditScoreCard score={computedScore} />
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.25rem" }}>
                                            <div style={{ padding: "1rem 1.25rem", background: C.bg, borderRadius: 12, border: `1px solid ${C.border}` }}>
                                                <p style={{ fontSize: ".68rem", fontWeight: 700, color: C.green, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: ".75rem" }}>Financial</p>
                                                {[["Status", form.employmentStatus], ["Occupation", form.occupation], ["Income", getIncomeDisplayText(form.monthlyIncome)], ["Active Loans", form.existingLoans === "0" ? "None" : form.existingLoans === "1" ? "1 Loan" : form.existingLoans === "2" ? "2 Loans" : "3+ Loans"]].map(([k, v]) => (
                                                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
                                                        <span style={{ fontSize: ".76rem", color: C.muted }}>{k}</span>
                                                        <span style={{ fontSize: ".76rem", color: C.text, fontWeight: 600, textTransform: "capitalize" }}>{v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ padding: "1rem 1.25rem", background: C.bg, borderRadius: 12, border: `1px solid ${C.border}` }}>
                                                <p style={{ fontSize: ".68rem", fontWeight: 700, color: C.green, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: ".75rem" }}>Identity</p>
                                                {[["ID Type", form.idType], ["ID Number", `****${form.idNumber?.slice(-4)}`], ["Front", form.idFront ? "✓ Uploaded" : "—"], ["Back", form.idBack ? "✓ Uploaded" : "—"]].map(([k, v]) => (
                                                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
                                                        <span style={{ fontSize: ".76rem", color: C.muted }}>{k}</span>
                                                        <span style={{ fontSize: ".76rem", color: v?.includes("✓") ? C.green : C.text, fontWeight: 600, textTransform: "capitalize" }}>{v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ marginTop: "1.25rem", padding: "1rem 1.25rem", background: risk.bg, border: `1.5px solid ${risk.border}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
                                            {computedScore >= 650
                                                ? <CheckCircle style={{ width: 18, height: 18, color: risk.color, flexShrink: 0 }} />
                                                : <AlertTriangle style={{ width: 18, height: 18, color: risk.color, flexShrink: 0 }} />
                                            }
                                            <div>
                                                <p style={{ fontSize: ".82rem", fontWeight: 700, color: risk.color }}>{risk.level}</p>
                                                <p style={{ fontSize: ".76rem", color: risk.color, opacity: .85, marginTop: 2 }}>{risk.recommendation}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
                                            <button onClick={goBack} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, color: C.label, cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 500, fontSize: ".875rem" }}>← Back</button>
                                            <button onClick={handleSubmit} style={{ flex: 2, padding: "13px", borderRadius: 10, background: C.green, color: "#fff", border: "none", fontWeight: 600, fontSize: ".9rem", cursor: "pointer", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "background .18s" }}
                                                onMouseEnter={e => e.currentTarget.style.background = C.greenLight}
                                                onMouseLeave={e => e.currentTarget.style.background = C.green}>
                                                <Shield style={{ width: 15, height: 15 }} /> Submit Verification
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Sidebar */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", ...anim(160) }}>
                                {form.monthlyIncome && (
                                    <div>
                                        <p style={{ fontSize: ".68rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".6rem" }}>Live Score Preview</p>
                                        <CreditScoreCard score={computedScore} compact />
                                    </div>
                                )}
                                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "1.25rem" }}>
                                    <p style={{ fontSize: ".72rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".85rem" }}>What to Expect</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                                        {[
                                            { icon: DollarSign, label: "Financial Info", desc: "Employment & income details" },
                                            { icon: CreditCard, label: "ID Verification", desc: "Government-issued ID + photos" },
                                            { icon: TrendingUp, label: "Credit Score", desc: "Instant score calculation" },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                                <div style={{ width: 30, height: 30, borderRadius: 8, background: step > i + 1 ? C.greenSoft : step === i + 1 ? C.sidebar : C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <item.icon style={{ width: 13, height: 13, color: step > i + 1 ? C.green : step === i + 1 ? "#9de89d" : C.muted }} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: ".78rem", fontWeight: 600, color: step >= i + 1 ? C.text : C.muted }}>{item.label}</p>
                                                    <p style={{ fontSize: ".68rem", color: C.muted, marginTop: 1 }}>{item.desc}</p>
                                                </div>
                                                {step > i + 1 && <CheckCircle style={{ width: 14, height: 14, color: C.green, flexShrink: 0, marginLeft: "auto", marginTop: 3 }} />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "1.25rem" }}>
                                    <p style={{ fontSize: ".72rem", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".85rem" }}>Score Guide</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
                                        {[
                                            { range: "750–850", label: "Low Risk", color: C.green },
                                            { range: "650–749", label: "Medium Risk", color: C.warning },
                                            { range: "500–649", label: "High Risk", color: C.danger },
                                        ].map(s => (
                                            <div key={s.range} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                                                <span style={{ fontSize: ".75rem", color: C.label }}>{s.label}</span>
                                                <span style={{ fontSize: ".72rem", color: C.muted, marginLeft: "auto", fontFamily: "monospace" }}>{s.range}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", background: C.greenSoft, borderRadius: 9, border: `1px solid ${C.greenBorder}` }}>
                                    <Shield style={{ width: 13, height: 13, color: C.green, flexShrink: 0 }} />
                                    <span style={{ fontSize: ".72rem", color: C.label }}>Your data is encrypted and stored securely.</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}