// src/pages/LandingPage.jsx
import { Link } from "react-router-dom";
import {
    Landmark, ArrowRight, BarChart3, Calculator,
    Shield, Users, FileText, CheckCircle, Lock,
    LayoutDashboard, Layers, BookOpen, CreditCard,
    UserCheck, AlertTriangle, Download, TrendingUp,
    Zap, Star, Globe
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

function useInView(threshold = 0.12) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setInView(true); obs.disconnect(); }
        }, { threshold });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
}

const PAGES = [
    { icon: Lock, label: "Login Page" },
    { icon: LayoutDashboard, label: "Home Page" },
    { icon: Layers, label: "Loan Types" },
    { icon: BookOpen, label: "Loan Plans" },
    { icon: Users, label: "Borrowers" },
    { icon: CreditCard, label: "Loans" },
    { icon: FileText, label: "Payments" },
    { icon: UserCheck, label: "Users" },
];

const FEATURES = [
    {
        icon: BarChart3, title: "Financial Analytics",
        desc: "Real-time visibility across your entire portfolio.",
        items: ["Total active loans overview", "Total interest earned", "Monthly revenue chart", "Loan default rate analytics"],
    },
    {
        icon: Calculator, title: "Loan Calculator",
        desc: "Precise amortization and payment scheduling.",
        items: ["Amortization schedule table", "Early payment recalculation", "Variable interest support", "Auto penalty computation"],
    },
    {
        icon: AlertTriangle, title: "Risk Management",
        desc: "Proactive risk detection and smart alerts.",
        items: ["Credit score rating system", "Risk level tagging (Low / Medium / High)", "Overdue alert notifications"],
    },
    {
        icon: Download, title: "Reports & Exports",
        desc: "Generate and share professional reports instantly.",
        items: ["Export amortization schedule (PDF)", "Loan performance report", "Borrower payment history"],
    },
    {
        icon: Shield, title: "Security & Access",
        desc: "Bank-grade protection for your data.",
        items: ["Admin activity logs", "Role-based access control", "Data encryption & hashed records"],
    },
    {
        icon: TrendingUp, title: "Growth Tools",
        desc: "Scale your lending business with confidence.",
        items: ["Borrower portfolio tracking", "Interest trend analysis", "Collection rate monitoring"],
    },
];

const C = {
    sidebar: "#1a2e1a",
    sidebarMid: "#2a4a2a",
    green: "#2d7a2d",
    greenLight: "#4a9e4a",
    greenSoft: "rgba(45,122,45,.1)",
    greenBorder: "rgba(45,122,45,.25)",
    accentText: "#9de89d",
    border: "#e8ede8",
    bg: "#f4f6f5",
    surface: "#ffffff",
    text: "#1a2e1a",
    muted: "#7a9a7a",
    label: "#3a5a3a",
};

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(false);
    const [statsRef, statsInView] = useInView(0.1);
    const [pagesRef, pagesInView] = useInView(0.08);
    const [featRef, featInView] = useInView(0.05);
    const [whyRef, whyInView] = useInView(0.1);
    const [ctaRef, ctaInView] = useInView(0.15);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 60);
        const s = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", s);
        return () => { clearTimeout(t); window.removeEventListener("scroll", s); };
    }, []);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,500&family=Outfit:wght@300;400;500;600;700&family=DM+Sans:wght@400;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html  { scroll-behavior: smooth; }
                body  { font-family: 'Outfit', sans-serif; background: #fff; color: ${C.text}; }

                @keyframes up     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fade   { from{opacity:0} to{opacity:1} }
                @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }

                .a1 { animation: up .65s cubic-bezier(.16,1,.3,1) .05s both; }
                .a2 { animation: up .65s cubic-bezier(.16,1,.3,1) .15s both; }
                .a3 { animation: up .65s cubic-bezier(.16,1,.3,1) .25s both; }
                .a4 { animation: fade .8s ease .5s both; }

                a { text-decoration: none; }

                .nav-link { color:${C.label}; font-size:.875rem; font-weight:500; transition:color .2s; }
                .nav-link:hover { color:${C.green}; }

                .btn-dark {
                    display:inline-flex; align-items:center; gap:8px;
                    padding:10px 22px; border-radius:9px;
                    background:${C.sidebar}; color:#fff;
                    font-family:'Outfit',sans-serif; font-size:.875rem; font-weight:600;
                    border:none; cursor:pointer;
                    transition:background .2s, transform .15s, box-shadow .2s;
                }
                .btn-dark:hover { background:${C.green}; transform:translateY(-1px); box-shadow:0 8px 28px rgba(45,122,45,.3); }

                .btn-green {
                    display:inline-flex; align-items:center; gap:8px;
                    padding:12px 28px; border-radius:9px;
                    background:${C.green}; color:#fff;
                    font-family:'Outfit',sans-serif; font-size:.9rem; font-weight:600;
                    border:none; cursor:pointer;
                    transition:background .2s, transform .15s, box-shadow .2s;
                }
                .btn-green:hover { background:${C.greenLight}; transform:translateY(-1px); box-shadow:0 8px 28px rgba(45,122,45,.35); }

                .btn-ghost {
                    display:inline-flex; align-items:center; gap:6px;
                    padding:12px 22px; border-radius:9px;
                    border:1.5px solid ${C.border}; color:${C.label}; background:${C.surface};
                    font-family:'Outfit',sans-serif; font-size:.9rem; font-weight:500;
                    transition:border-color .2s, color .2s, background .2s;
                }
                .btn-ghost:hover { border-color:${C.green}; color:${C.green}; background:${C.greenSoft}; }

                .btn-outline-white {
                    display:inline-flex; align-items:center; gap:6px;
                    padding:12px 22px; border-radius:9px;
                    border:1.5px solid rgba(255,255,255,.2); color:rgba(255,255,255,.7);
                    font-family:'Outfit',sans-serif; font-size:.9rem; font-weight:500;
                    transition:border-color .2s, color .2s, background .2s;
                }
                .btn-outline-white:hover { border-color:rgba(255,255,255,.5); color:#fff; background:rgba(255,255,255,.06); }

                .page-pill {
                    display:flex; align-items:center; gap:10px;
                    padding:13px 16px; border-radius:10px;
                    border:1.5px solid ${C.border}; background:${C.surface};
                    font-size:.85rem; font-weight:500; color:${C.label};
                    transition:border-color .2s, background .2s, transform .2s, box-shadow .2s;
                    cursor:default;
                }
                .page-pill:hover { border-color:${C.green}; background:${C.greenSoft}; color:${C.green}; transform:translateY(-2px); box-shadow:0 6px 18px rgba(45,122,45,.1); }

                .feat-card {
                    padding:1.75rem; border-radius:14px;
                    border:1.5px solid ${C.border}; background:${C.surface};
                    display:flex; flex-direction:column;
                    transition:border-color .2s, box-shadow .2s, transform .2s; cursor:default;
                }
                .feat-card:hover { border-color:${C.green}; box-shadow:0 10px 36px rgba(45,122,45,.1); transform:translateY(-3px); }

                .stat-box {
                    background:${C.surface}; border-radius:12px; border:1.5px solid ${C.border};
                    padding:1.25rem 1.5rem; text-align:center;
                    transition:border-color .2s, transform .2s, box-shadow .2s;
                }
                .stat-box:hover { border-color:${C.green}; transform:translateY(-2px); box-shadow:0 6px 18px rgba(45,122,45,.1); }

                .why-row {
                    display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:10px;
                    border:1.5px solid ${C.border}; background:${C.surface};
                    transition:border-color .2s, background .2s;
                }
                .why-row:hover { border-color:${C.green}; background:${C.greenSoft}; }

                ::-webkit-scrollbar { width:4px; }
                ::-webkit-scrollbar-thumb { background:#c8d8c8; border-radius:99px; }
            `}</style>

            {/* ── NAVBAR ──────────────────────────────────────────────────── */}
            <header style={{
                position: "sticky", top: 0, zIndex: 50,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 4rem", height: 64,
                background: scrolled ? "rgba(255,255,255,.97)" : C.surface,
                borderBottom: `1px solid ${C.border}`,
                backdropFilter: scrolled ? "blur(12px)" : "none",
                transition: "background .3s",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.sidebar, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(26,46,26,.25)" }}>
                        <Landmark style={{ width: 18, height: 18, color: "#fff" }} />
                    </div>
                    <span style={{ fontFamily: "'Lora',serif", fontSize: "1.2rem", fontWeight: 600, color: C.text }}>LoanShark</span>
                </div>
                <nav style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
                    <a href="#pages" className="nav-link">Pages</a>
                    <a href="#features" className="nav-link">Features</a>
                    <Link to="/login" className="nav-link">Sign In</Link>
                    <Link to="/register" className="btn-dark">Get Started</Link>
                </nav>
            </header>

            {/* ── HERO — dark left + light right (mirrors Login/Register) ─── */}
            <section style={{ display: "flex", minHeight: "calc(100vh - 64px)", opacity: visible ? 1 : 0, transition: "opacity .4s ease" }}>

                {/* LEFT dark panel — identical DNA to LoginPage left panel */}
                <div style={{
                    width: "36%", minWidth: 300, flexShrink: 0,
                    background: `linear-gradient(160deg, ${C.sidebar} 0%, ${C.sidebarMid} 100%)`,
                    display: "flex", flexDirection: "column", padding: "3.5rem 3rem",
                    position: "relative", overflow: "hidden",
                }}>
                    {/* Decorative circles — same as LoginPage */}
                    <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(45,122,45,.18)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: 80, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(45,122,45,.1)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: -30, right: 60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />

                    {/* Live badge */}
                    <div className="a1" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(45,122,45,.25)", border: "1px solid rgba(45,122,45,.4)", borderRadius: 20, padding: "5px 14px", marginBottom: "auto", width: "fit-content", position: "relative" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accentText, animation: "pulse 2s infinite" }} />
                        <span style={{ fontSize: ".7rem", fontWeight: 700, color: C.accentText, letterSpacing: ".08em", textTransform: "uppercase" }}>Live System</span>
                    </div>

                    {/* Copy */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", paddingTop: "1.5rem" }}>
                        <h1 className="a2" style={{ fontFamily: "'Lora',serif", fontSize: "clamp(2rem,3.2vw,2.8rem)", fontWeight: 600, color: "#fff", lineHeight: 1.18, marginBottom: "1.25rem" }}>
                            Smart Lending,<br />
                            <span style={{ color: C.accentText }}>Simply Done.</span>
                        </h1>
                        <p className="a3" style={{ fontSize: ".88rem", color: "rgba(255,255,255,.5)", lineHeight: 1.75, maxWidth: 280, marginBottom: "2.5rem", fontWeight: 300 }}>
                            Manage loans, track payments, and monitor borrower portfolios — all in one place.
                        </p>

                        {/* Feature pills — same style as LoginPage */}
                        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                            {[
                                { icon: TrendingUp, label: "Real-time credit scoring" },
                                { icon: Shield, label: "Bank-grade encryption" },
                                { icon: Users, label: "Borrower management" },
                                { icon: CreditCard, label: "Automated loan tracking" },
                                { icon: BarChart3, label: "Financial analytics" },
                                { icon: FileText, label: "PDF report exports" },
                            ].map((f, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(45,122,45,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <f.icon style={{ width: 13, height: 13, color: C.accentText }} />
                                    </div>
                                    <span style={{ fontSize: ".82rem", color: "rgba(255,255,255,.6)" }}>{f.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="a4" style={{ fontSize: ".72rem", color: "rgba(255,255,255,.25)", position: "relative" }}>
                        © 2026 LoanShark. All rights reserved.
                    </p>
                </div>

                {/* RIGHT light panel — mirrors Register right panel */}
                <div style={{ flex: 1, background: C.bg, display: "flex", flexDirection: "column", padding: "0 4rem 3rem", overflowY: "auto" }}>

                    {/* Top bar — same as LoginPage / RegisterPage */}
                    <div style={{ display: "flex", justifyContent: "flex-end", padding: "1.25rem 0", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: ".82rem", color: C.muted }}>Already have an account?</span>
                            <Link to="/login" style={{ padding: "7px 18px", borderRadius: 8, background: C.surface, border: `1.5px solid ${C.border}`, color: C.label, fontFamily: "'Outfit',sans-serif", fontSize: ".82rem", fontWeight: 600, transition: "all .15s" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.color = C.green; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.label; }}>
                                Sign In
                            </Link>
                        </div>
                    </div>

                    {/* Hero content */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div className="a1" style={{ display: "inline-block", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.green, background: C.greenSoft, padding: "3px 12px", borderRadius: 20, marginBottom: "1rem", width: "fit-content" }}>
                            Loan Management System
                        </div>

                        <h2 className="a2" style={{ fontFamily: "'Lora',serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 600, color: C.text, lineHeight: 1.18, letterSpacing: "-.02em", marginBottom: "1rem" }}>
                            Manage your loans<br />
                            <em style={{ color: C.green, fontStyle: "italic" }}>with clarity.</em>
                        </h2>

                        <p className="a3" style={{ fontSize: ".95rem", color: C.muted, lineHeight: 1.8, fontWeight: 300, maxWidth: 460, marginBottom: "2.5rem" }}>
                            A complete lending platform for managing borrowers, loan types, repayment plans, payments, and financial analytics — built for lenders who mean business.
                        </p>

                        <div className="a3" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}>
                            <Link to="/register" className="btn-green">
                                Create Free Account <ArrowRight style={{ width: 16, height: 16 }} />
                            </Link>
                            <a href="#features" className="btn-ghost">See Features</a>
                        </div>

                        <div className="a4" style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                            {["Role-based Access", "PDF Reports", "Auto Calculations", "Risk Alerts"].map(t => (
                                <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".8rem", color: C.muted }}>
                                    <CheckCircle style={{ width: 14, height: 14, color: C.green }} />
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS STRIP ─────────────────────────────────────────────── */}
            <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "2.25rem 4rem" }}>
                <div ref={statsRef} style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
                    {[
                        { val: "1,245+", label: "Active Borrowers", icon: Users },
                        { val: "₱230M+", label: "Loans Managed", icon: CreditCard },
                        { val: "3,550", label: "Verified Members", icon: UserCheck },
                        { val: "99.8%", label: "System Uptime", icon: Zap },
                    ].map(({ val, label, icon: Icon }, i) => (
                        <div key={label} className="stat-box" style={{
                            opacity: statsInView ? 1 : 0,
                            transform: statsInView ? "translateY(0)" : "translateY(14px)",
                            transition: `opacity .5s ease ${i * 70}ms, transform .5s cubic-bezier(.16,1,.3,1) ${i * 70}ms`,
                        }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto .75rem" }}>
                                <Icon style={{ width: 16, height: 16, color: C.green }} />
                            </div>
                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: C.text, lineHeight: 1 }}>{val}</p>
                            <p style={{ fontSize: ".76rem", color: C.muted, marginTop: 4 }}>{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── PAGES ───────────────────────────────────────────────────── */}
            <section id="pages" ref={pagesRef} style={{ maxWidth: 900, margin: "0 auto", padding: "6rem 2rem" }}>
                <div style={{ marginBottom: "2.5rem" }}>
                    <div style={{ display: "inline-block", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.green, background: C.greenSoft, padding: "3px 12px", borderRadius: 20, marginBottom: ".85rem" }}>System Pages</div>
                    <h2 style={{ fontFamily: "'Lora',serif", fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 600, color: C.text, letterSpacing: "-.015em", marginBottom: ".5rem" }}>Eight pages. One platform.</h2>
                    <p style={{ fontSize: ".88rem", color: C.muted, fontWeight: 300, maxWidth: 420 }}>Every screen is purpose-built — from borrower onboarding to financial reporting.</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: ".85rem" }}>
                    {PAGES.map(({ icon: Icon, label }, i) => (
                        <div key={label} className="page-pill" style={{
                            opacity: pagesInView ? 1 : 0,
                            transform: pagesInView ? "translateY(0)" : "translateY(16px)",
                            transition: `opacity .5s ease ${i * 55}ms, transform .5s cubic-bezier(.16,1,.3,1) ${i * 55}ms`,
                        }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Icon style={{ width: 16, height: 16, color: C.green }} />
                            </div>
                            {label}
                        </div>
                    ))}
                </div>
            </section>

            <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem" }}><div style={{ height: 1, background: C.border }} /></div>

            {/* ── FEATURES ────────────────────────────────────────────────── */}
            <section id="features" ref={featRef} style={{ maxWidth: 900, margin: "0 auto", padding: "6rem 2rem" }}>
                <div style={{ marginBottom: "2.5rem" }}>
                    <div style={{ display: "inline-block", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.green, background: C.greenSoft, padding: "3px 12px", borderRadius: 20, marginBottom: ".85rem" }}>Core Features</div>
                    <h2 style={{ fontFamily: "'Lora',serif", fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 600, color: C.text, letterSpacing: "-.015em", marginBottom: ".5rem" }}>Everything you need, built in.</h2>
                    <p style={{ fontSize: ".88rem", color: C.muted, fontWeight: 300, maxWidth: 420 }}>Powerful tools for every stage of the lending process — from application to final payment.</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
                    {FEATURES.map(({ icon: Icon, title, desc, items }, i) => (
                        <div key={title} className="feat-card" style={{
                            opacity: featInView ? 1 : 0,
                            transform: featInView ? "translateY(0)" : "translateY(20px)",
                            transition: `opacity .55s ease ${i * 80}ms, transform .55s cubic-bezier(.16,1,.3,1) ${i * 80}ms`,
                        }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                                <Icon style={{ width: 20, height: 20, color: C.green }} />
                            </div>
                            <h3 style={{ fontFamily: "'Lora',serif", fontSize: "1rem", fontWeight: 600, color: C.text, marginBottom: ".35rem" }}>{title}</h3>
                            <p style={{ fontSize: ".78rem", color: C.muted, marginBottom: "1rem", lineHeight: 1.55 }}>{desc}</p>
                            <div style={{ height: 1, background: C.border, marginBottom: ".9rem" }} />
                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: ".5rem" }}>
                                {items.map(item => (
                                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: ".81rem", color: C.muted, lineHeight: 1.5 }}>
                                        <CheckCircle style={{ width: 12, height: 12, color: C.green, marginTop: 2, flexShrink: 0 }} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem" }}><div style={{ height: 1, background: C.border }} /></div>

            {/* ── WHY SECTION ─────────────────────────────────────────────── */}
            <section ref={whyRef} style={{ maxWidth: 900, margin: "0 auto", padding: "6rem 2rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>
                    <div style={{ opacity: whyInView ? 1 : 0, transform: whyInView ? "translateX(0)" : "translateX(-20px)", transition: "opacity .6s ease, transform .6s cubic-bezier(.16,1,.3,1)" }}>
                        <div style={{ display: "inline-block", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.green, background: C.greenSoft, padding: "3px 12px", borderRadius: 20, marginBottom: ".85rem" }}>Why LoanShark</div>
                        <h2 style={{ fontFamily: "'Lora',serif", fontSize: "clamp(1.5rem,2.8vw,2rem)", fontWeight: 600, color: C.text, lineHeight: 1.25, marginBottom: "1rem" }}>
                            Built for lenders<br />who mean business.
                        </h2>
                        <p style={{ fontSize: ".88rem", color: C.muted, lineHeight: 1.8, fontWeight: 300, marginBottom: "1.75rem" }}>
                            LoanShark is designed from the ground up for small to medium lending institutions that need professional-grade tools without the complexity.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                            {[
                                { icon: Shield, text: "All data encrypted and stored securely" },
                                { icon: Zap, text: "Real-time updates across all modules" },
                                { icon: Globe, text: "Accessible from any device, anywhere" },
                                { icon: Star, text: "Trusted by hundreds of lending businesses" },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className="why-row">
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <Icon style={{ width: 14, height: 14, color: C.green }} />
                                    </div>
                                    <span style={{ fontSize: ".84rem", color: C.label }}>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: ".85rem", opacity: whyInView ? 1 : 0, transform: whyInView ? "translateX(0)" : "translateX(20px)", transition: "opacity .6s ease .1s, transform .6s cubic-bezier(.16,1,.3,1) .1s" }}>
                        {[
                            { label: "Active Loans", val: "142", sub: "↑ 12% this month", color: C.green },
                            { label: "Total Collections", val: "₱4.2M", sub: "↑ 8% vs last month", color: "#2563eb" },
                            { label: "At-Risk Accounts", val: "7", sub: "Flagged for review", color: "#c47a00" },
                            { label: "Payments Due Today", val: "23", sub: "₱184,500 expected", color: C.green },
                        ].map(({ label, val, sub, color }, i) => (
                            <div key={label} style={{
                                background: C.surface, borderRadius: 12, border: `1.5px solid ${C.border}`,
                                padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between",
                                transition: "border-color .2s, box-shadow .2s",
                                opacity: whyInView ? 1 : 0, transform: whyInView ? "translateY(0)" : "translateY(12px)",
                                transitionDelay: `${0.15 + i * 0.07}s`,
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.boxShadow = "0 4px 14px rgba(45,122,45,.1)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
                            >
                                <div>
                                    <p style={{ fontSize: ".73rem", color: C.muted, marginBottom: 3 }}>{label}</p>
                                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1.5rem", fontWeight: 800, color: C.text, lineHeight: 1 }}>{val}</p>
                                </div>
                                <span style={{ fontSize: ".72rem", fontWeight: 600, color, background: `${color}18`, padding: "3px 10px", borderRadius: 20 }}>{sub}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem" }}><div style={{ height: 1, background: C.border }} /></div>

            {/* ── CTA — dark panel, same gradient + circles as left panel ─── */}
            <section ref={ctaRef} style={{ maxWidth: 900, margin: "0 auto", padding: "6rem 2rem 7rem" }}>
                <div style={{
                    background: `linear-gradient(160deg, ${C.sidebar} 0%, ${C.sidebarMid} 100%)`,
                    borderRadius: 18, padding: "4rem", textAlign: "center",
                    position: "relative", overflow: "hidden",
                    opacity: ctaInView ? 1 : 0,
                    transform: ctaInView ? "translateY(0)" : "translateY(24px)",
                    transition: "opacity .65s ease, transform .65s cubic-bezier(.16,1,.3,1)",
                }}>
                    {/* Same decorative circles */}
                    <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(45,122,45,.18)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: 80, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(45,122,45,.1)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: -30, right: 60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />

                    <div style={{ position: "relative", zIndex: 1 }}>
                        {/* Same badge as LoginPage */}
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(45,122,45,.25)", border: "1px solid rgba(45,122,45,.4)", borderRadius: 20, padding: "5px 14px", marginBottom: "1.5rem" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accentText, animation: "pulse 2s infinite" }} />
                            <span style={{ fontSize: ".7rem", fontWeight: 700, color: C.accentText, letterSpacing: ".08em", textTransform: "uppercase" }}>Get Started Today</span>
                        </div>

                        <h2 style={{ fontFamily: "'Lora',serif", fontSize: "clamp(1.7rem,3vw,2.5rem)", fontWeight: 600, color: "#fff", lineHeight: 1.2, letterSpacing: "-.015em", marginBottom: "1rem" }}>
                            Ready to take control<br />of your portfolio?
                        </h2>
                        <p style={{ color: "rgba(255,255,255,.45)", fontSize: ".92rem", fontWeight: 300, maxWidth: 380, margin: "0 auto 2.5rem", lineHeight: 1.75 }}>
                            Join hundreds of lenders already using LoanShark to streamline their operations.
                        </p>

                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2.25rem" }}>
                            <Link to="/register" className="btn-green">
                                Create Account <ArrowRight style={{ width: 16, height: 16 }} />
                            </Link>
                            <Link to="/login" className="btn-outline-white">Sign In</Link>
                        </div>

                        <div style={{ display: "flex", gap: "1.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                            {["Free to register", "No setup fees", "Secure & encrypted"].map(t => (
                                <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".78rem", color: "rgba(255,255,255,.4)" }}>
                                    <CheckCircle style={{ width: 12, height: 12, color: C.accentText }} />
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────────── */}
            <footer style={{ borderTop: `1px solid ${C.border}`, background: C.bg, padding: "1.75rem 4rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: C.sidebar, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Landmark style={{ width: 14, height: 14, color: "#fff" }} />
                    </div>
                    <span style={{ fontFamily: "'Lora',serif", fontSize: "1rem", fontWeight: 600, color: C.text }}>LoanShark</span>
                </div>
                <p style={{ fontSize: ".78rem", color: C.muted }}>© 2026 LoanShark. All rights reserved.</p>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                    {["Privacy", "Terms", "Contact"].map(l => (
                        <a key={l} href="#" style={{ fontSize: ".78rem", color: C.muted, transition: "color .2s" }}
                            onMouseEnter={e => e.currentTarget.style.color = C.green}
                            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                            {l}
                        </a>
                    ))}
                </div>
            </footer>
        </>
    );
}