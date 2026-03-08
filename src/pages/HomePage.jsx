// src/pages/HomePage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Layers, BookOpen,
    CreditCard, Bell, Search,
    ChevronRight, Clock, Menu, X,
    Calendar, LogOut,
    Wallet, UserCheck,
    ArrowUpRight, Shield,
    Award, Phone, MessageCircle,
    Home, Briefcase, Car, GraduationCap,
    CheckCircle, Clock3, ArrowRight,
    User, TrendingUp
} from "lucide-react";
import Swal from "sweetalert2";
import ezLoanLogo from "../assets/logo.jpg";


const API = "http://localhost:5000/api/auth";

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: "Dashboard", id: "home" },
    { icon: Layers, label: "Loan Types", id: "loan-types" },
    { icon: BookOpen, label: "Loan Plans", id: "loanplans" },
    { icon: Wallet, label: "Payment", id: "payments" },
];

const USER_LOANS = [
    { id: "LN-2026-001", type: "Personal Loan", amount: "₱50,000", status: "Active", dateApplied: "Mar 01, 2026", nextPayment: "Apr 01, 2026", remainingBalance: "₱35,000", interestRate: "5.5%", term: "12 months", progress: 42 },
    { id: "LN-2026-002", type: "Business Loan", amount: "₱200,000", status: "Pending", dateApplied: "Feb 28, 2026", nextPayment: "—", remainingBalance: "₱200,000", interestRate: "7.2%", term: "24 months", progress: 0 },
];

const PAYMENT_SCHEDULE = [
    { dueDate: "Apr 01, 2026", amount: "₱4,850", status: "Upcoming" },
    { dueDate: "May 01, 2026", amount: "₱4,850", status: "Scheduled" },
    { dueDate: "Jun 01, 2026", amount: "₱4,850", status: "Scheduled" },
];

const TRANSACTIONS = [
    { date: "Mar 01, 2026", description: "Loan Disbursement", amount: "+₱50,000", type: "credit", status: "Completed" },
    { date: "Feb 15, 2026", description: "Monthly Payment", amount: "-₱4,850", type: "debit", status: "Completed" },
    { date: "Jan 15, 2026", description: "Monthly Payment", amount: "-₱4,850", type: "debit", status: "Completed" },
    { date: "Dec 15, 2025", description: "Monthly Payment", amount: "-₱4,850", type: "debit", status: "Completed" },
    { date: "Nov 15, 2025", description: "Monthly Payment", amount: "-₱4,850", type: "debit", status: "Completed" },
];

const LOAN_PRODUCTS = [
    { icon: UserCheck, name: "Personal Loan", interest: "5.5%", amount: "Up to ₱500,000", term: "6–24 months", color: "#2d7a2d", popular: true },
    { icon: Briefcase, name: "Business Loan", interest: "7.2%", amount: "Up to ₱2,000,000", term: "12–36 months", color: "#2563eb", popular: false },
    { icon: Home, name: "Housing Loan", interest: "4.8%", amount: "Up to ₱5,000,000", term: "12–60 months", color: "#7c3aed", popular: false },
    { icon: Car, name: "Auto Loan", interest: "6.1%", amount: "Up to ₱1,500,000", term: "12–48 months", color: "#c47a00", popular: false },
    { icon: GraduationCap, name: "Education Loan", interest: "4.2%", amount: "Up to ₱300,000", term: "6–24 months", color: "#c42d2d", popular: false },
];

const C = {
    bg: "#f0f4f0",
    sidebar: "#152515",
    green: "#2d7a2d",
    greenLight: "#3a9e3a",
    greenSoft: "rgba(45,122,45,.08)",
    greenBorder: "rgba(45,122,45,.18)",
    white: "#ffffff",
    border: "#e4ebe4",
    text: "#14221a",
    muted: "#6b806b",
    label: "#2a3a2a",
    warning: "#c47a00",
    danger: "#c42d2d",
    card: "#ffffff",
    info: "#2563eb",
    infoLight: "#eff4ff",
};

function Badge({ status }) {
    const map = {
        Active: { bg: "#e6f4e6", color: "#2d7a2d", icon: CheckCircle },
        Pending: { bg: "#fff8e1", color: "#b36b00", icon: Clock3 },
        Completed: { bg: "#e6f4e6", color: "#2d7a2d", icon: CheckCircle },
        Upcoming: { bg: "#eff4ff", color: "#2563eb", icon: Clock3 },
        Scheduled: { bg: "#f3f4f6", color: "#6b7280", icon: Clock },
        credit: { bg: "#e6f4e6", color: "#2d7a2d", icon: ArrowUpRight },
        debit: { bg: "#fde8e8", color: "#c42d2d", icon: ArrowRight },
    };
    const s = map[status] || { bg: "#f3f4f6", color: "#6b7280", icon: Clock };
    const Icon = s.icon;
    return (
        <span style={{ fontSize: ".7rem", fontWeight: 700, color: s.color, background: s.bg, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon size={11} />{status}
        </span>
    );
}

function ProgressBar({ progress, color = C.green }) {
    return (
        <div style={{ width: "100%", height: 5, background: "#dceadc", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: color, borderRadius: 99, transition: "width .7s cubic-bezier(.16,1,.3,1)" }} />
        </div>
    );
}

function SectionTitle({ children, action, onAction }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: C.text, letterSpacing: "-.01em" }}>{children}</h2>
            {action && (
                <button onClick={onAction} style={{ background: "none", border: "none", color: C.green, fontSize: ".8rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, padding: 0 }}>
                    {action}<ChevronRight size={13} />
                </button>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, sub, color, trend }) {
    return (
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "1.25rem 1.4rem", display: "flex", flexDirection: "column", gap: ".9rem", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={17} color={color} />
                </div>
                {trend && (
                    <span style={{ fontSize: ".68rem", fontWeight: 700, color: "#2d7a2d", background: "rgba(45,122,45,.1)", padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 2 }}>
                        <TrendingUp size={9} />{trend}
                    </span>
                )}
            </div>
            <div>
                <p style={{ fontSize: "1.55rem", fontWeight: 800, color: C.text, lineHeight: 1, fontFamily: "'DM Sans',sans-serif", letterSpacing: "-.02em" }}>{value}</p>
                <p style={{ fontSize: ".78rem", fontWeight: 600, color: C.label, marginTop: 5 }}>{label}</p>
                {sub && <p style={{ fontSize: ".7rem", color: C.muted, marginTop: 2 }}>{sub}</p>}
            </div>
        </div>
    );
}

function LoanProductCard({ product }) {
    const Icon = product.icon;
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ background: C.card, borderRadius: 16, border: `1.5px solid ${hovered ? product.color : C.border}`, padding: "1.25rem", display: "flex", flexDirection: "column", gap: ".9rem", position: "relative", transition: "all .22s ease", cursor: "pointer", boxShadow: hovered ? `0 8px 24px ${product.color}18` : "0 1px 3px rgba(0,0,0,.04)", transform: hovered ? "translateY(-3px)" : "none" }}>
            {product.popular && (
                <span style={{ position: "absolute", top: -9, right: 14, background: C.green, color: "#fff", fontSize: ".62rem", fontWeight: 700, padding: "2px 9px", borderRadius: 20, letterSpacing: ".04em", textTransform: "uppercase" }}>Popular</span>
            )}
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${product.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} color={product.color} />
            </div>
            <div>
                <h3 style={{ fontSize: ".95rem", fontWeight: 700, color: C.text }}>{product.name}</h3>
                <p style={{ fontSize: ".75rem", color: C.muted, marginTop: 2 }}>{product.interest} interest rate</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".35rem", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem" }}>
                    <span style={{ color: C.muted }}>Max Amount</span>
                    <span style={{ fontWeight: 700, color: C.text }}>{product.amount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem" }}>
                    <span style={{ color: C.muted }}>Term</span>
                    <span style={{ fontWeight: 700, color: C.text }}>{product.term}</span>
                </div>
            </div>
            <button style={{ width: "100%", padding: "9px", borderRadius: 9, border: `1.5px solid ${product.color}`, background: hovered ? product.color : "transparent", color: hovered ? "#fff" : product.color, fontSize: ".8rem", fontWeight: 700, cursor: "pointer", transition: "all .22s" }}>
                Apply Now
            </button>
        </div>
    );
}

function PagePlaceholder({ label, icon: Icon }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "1rem" }}>
            <div style={{ width: 68, height: 68, borderRadius: 18, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={28} color={C.green} />
            </div>
            <p style={{ fontFamily: "'Lora',serif", fontSize: "1.1rem", fontWeight: 600, color: C.text }}>{label}</p>
            <p style={{ fontSize: ".82rem", color: C.muted }}>This page is under construction.</p>
        </div>
    );
}

function UserDashboard({ userName, userLoading }) {
    const [visible, setVisible] = useState(false);
    const [showAllLoans, setShowAllLoans] = useState(false);
    useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

    const fade = (d = 0) => ({
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: `opacity .45s ease ${d}ms, transform .45s cubic-bezier(.16,1,.3,1) ${d}ms`,
    });

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const activeLoans = USER_LOANS.filter(l => l.status === "Active").length;
    const totalBorrowed = USER_LOANS.reduce((s, l) => s + parseInt(l.amount.replace(/[₱,]/g, "")), 0);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", maxWidth: 1200 }}>

            {/* Hero greeting */}
            <div style={{ ...fade(0), display: "flex", alignItems: "center", justifyContent: "space-between", background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: "1.25rem 1.75rem", boxShadow: "0 1px 4px rgba(0,0,0,.04)", gap: "1rem" }}>
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: ".7rem", fontWeight: 700, color: C.green, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".35rem" }}>Welcome back</p>
                    <h1 style={{ fontFamily: "'Lora',serif", fontSize: "1.3rem", fontWeight: 600, color: C.text, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {greeting}, {userLoading ? "…" : userName}! 👋
                    </h1>
                    <p style={{ fontSize: ".8rem", color: C.muted, marginTop: ".3rem" }}>Here's what's happening with your loans today.</p>
                </div>
                <button
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 11, border: "none", background: C.green, color: "#fff", fontFamily: "'Outfit',sans-serif", fontSize: ".83rem", fontWeight: 600, cursor: "pointer", transition: "background .2s", flexShrink: 0, whiteSpace: "nowrap" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.greenLight}
                    onMouseLeave={e => e.currentTarget.style.background = C.green}>
                    <CreditCard size={15} /> Apply for New Loan
                </button>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", ...fade(60) }}>
                <StatCard icon={Wallet} label="Total Borrowed" value={`₱${(totalBorrowed / 1000).toFixed(1)}K`} sub="Across all loans" color={C.green} />
                <StatCard icon={CreditCard} label="Active Loans" value={String(activeLoans)} sub={`${USER_LOANS.length} total`} color="#2563eb" />
                <StatCard icon={Calendar} label="Next Payment" value={USER_LOANS[0]?.nextPayment || "None"} sub={USER_LOANS[0]?.amount} color="#7c3aed" />
                <StatCard icon={Award} label="Credit Score" value="720" sub="Good standing" color="#c47a00" trend="+15 pts" />
            </div>

            {/* Active loans */}
            <div style={fade(120)}>
                <SectionTitle action={showAllLoans ? "Show Less" : "View All"} onAction={() => setShowAllLoans(!showAllLoans)}>
                    My Active Loans
                </SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem" }}>
                    {(showAllLoans ? USER_LOANS : USER_LOANS.filter(l => l.status === "Active")).map((loan, idx) => (
                        <div key={idx} style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <p style={{ fontSize: ".65rem", color: C.muted, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>Loan #{loan.id}</p>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: C.text, marginTop: 3 }}>{loan.type}</h3>
                                </div>
                                <Badge status={loan.status} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".75rem", background: C.bg, borderRadius: 10, padding: ".9rem" }}>
                                <div>
                                    <p style={{ fontSize: ".62rem", color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Amount</p>
                                    <p style={{ fontSize: "1.1rem", fontWeight: 800, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>{loan.amount}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: ".62rem", color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Rate</p>
                                    <p style={{ fontSize: "1.1rem", fontWeight: 700, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>{loan.interestRate}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: ".62rem", color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Term</p>
                                    <p style={{ fontSize: ".9rem", fontWeight: 700, color: C.text }}>{loan.term}</p>
                                </div>
                            </div>

                            {loan.status === "Active" && (
                                <>
                                    <div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
                                            <span style={{ fontSize: ".72rem", color: C.muted, fontWeight: 500 }}>Repayment Progress</span>
                                            <span style={{ fontSize: ".72rem", fontWeight: 700, color: C.green }}>{loan.progress}%</span>
                                        </div>
                                        <ProgressBar progress={loan.progress} />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: ".9rem", borderTop: `1px solid ${C.border}` }}>
                                        <div>
                                            <p style={{ fontSize: ".62rem", color: C.muted, textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>Remaining</p>
                                            <p style={{ fontSize: ".95rem", fontWeight: 700, color: C.text, marginTop: 3 }}>{loan.remainingBalance}</p>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <p style={{ fontSize: ".62rem", color: C.muted, textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>Next Payment</p>
                                            <p style={{ fontSize: ".95rem", fontWeight: 700, color: C.text, marginTop: 3 }}>{loan.nextPayment}</p>
                                        </div>
                                    </div>
                                    <button
                                        style={{ width: "100%", padding: "10px", borderRadius: 9, border: `1.5px solid ${C.green}`, background: "transparent", color: C.green, fontSize: ".83rem", fontWeight: 700, cursor: "pointer", transition: "all .2s" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = C.green; e.currentTarget.style.color = "#fff"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.green; }}>
                                        Make a Payment
                                    </button>
                                </>
                            )}

                            {loan.status === "Pending" && (
                                <div style={{ background: C.infoLight, borderRadius: 10, padding: ".9rem 1rem", display: "flex", alignItems: "flex-start", gap: 10 }}>
                                    <Clock3 size={15} color={C.info} style={{ marginTop: 1, flexShrink: 0 }} />
                                    <p style={{ fontSize: ".8rem", color: C.info, fontWeight: 500, lineHeight: 1.5 }}>Application under review — we'll notify you within 2–3 business days.</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Payments + Transactions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "1rem", ...fade(180) }}>
                <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "1.4rem", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                    <SectionTitle>📅 Upcoming Payments</SectionTitle>
                    <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
                        {PAYMENT_SCHEDULE.map((p, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".75rem 1rem", background: idx === 0 ? "rgba(45,122,45,.07)" : C.bg, borderRadius: 10, border: `1px solid ${idx === 0 ? C.greenBorder : "transparent"}` }}>
                                <div>
                                    <p style={{ fontSize: ".88rem", fontWeight: 700, color: C.text }}>{p.amount}</p>
                                    <p style={{ fontSize: ".7rem", color: C.muted, marginTop: 1 }}>{p.dueDate}</p>
                                </div>
                                <Badge status={p.status} />
                            </div>
                        ))}
                    </div>
                    <button style={{ width: "100%", marginTop: "1rem", padding: "9px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: C.green, fontSize: ".78rem", fontWeight: 600, cursor: "pointer" }}>
                        View Full Schedule
                    </button>
                </div>

                <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "1.4rem", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                    <SectionTitle>💰 Recent Transactions</SectionTitle>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {TRANSACTIONS.map((txn, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".7rem 0", borderBottom: idx < TRANSACTIONS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 9, background: txn.type === "credit" ? "rgba(45,122,45,.09)" : "rgba(196,45,45,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        {txn.type === "credit" ? <ArrowUpRight size={15} color={C.green} /> : <ArrowRight size={15} color={C.danger} />}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: ".83rem", fontWeight: 600, color: C.text }}>{txn.description}</p>
                                        <p style={{ fontSize: ".68rem", color: C.muted, marginTop: 1 }}>{txn.date}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: ".88rem", fontWeight: 700, color: txn.type === "credit" ? C.green : C.danger }}>{txn.amount}</p>
                                    <Badge status={txn.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loan products */}
            <div style={fade(240)}>
                <SectionTitle>🎯 Recommended for You</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "1rem" }}>
                    {LOAN_PRODUCTS.map((p, i) => <LoanProductCard key={i} product={p} />)}
                </div>
            </div>

            {/* Support banner */}
            <div style={{ ...fade(300), background: "linear-gradient(135deg,#1f5c1f 0%,#2d7a2d 100%)", borderRadius: 18, padding: "1.75rem 2rem", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <p style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", opacity: .65, marginBottom: ".4rem" }}>Support Center</p>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Need help with your loans?</h3>
                    <p style={{ fontSize: ".82rem", opacity: .8, marginTop: ".3rem" }}>Our team is available 24/7 to assist you.</p>
                </div>
                <div style={{ display: "flex", gap: ".75rem", flexShrink: 0 }}>
                    <button style={{ padding: "10px 18px", borderRadius: 9, border: "1.5px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.1)", color: "#fff", fontSize: ".82rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "background .2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}>
                        <MessageCircle size={14} /> Live Chat
                    </button>
                    <button style={{ padding: "10px 18px", borderRadius: 9, border: "none", background: "#fff", color: C.green, fontSize: ".82rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "opacity .2s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        <Phone size={14} /> Call Support
                    </button>
                </div>
            </div>

        </div>
    );
}

export default function HomePage() {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState("home");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const hoverTimeoutRef = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");
                if (!token || !userId) { navigate("/login"); return; }
                const res = await fetch(`${API}/profile/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) { localStorage.removeItem("token"); localStorage.removeItem("userId"); navigate("/login"); return; }
                const data = await res.json();
                setCurrentUser(data.user);
            } catch (err) { console.error(err); }
            finally { setUserLoading(false); }
        };
        fetchUser();
    }, [navigate]);

    const fullName = currentUser ? [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") : "—";
    const initials = currentUser ? [(currentUser.firstName || "")[0], (currentUser.lastName || "")[0]].filter(Boolean).join("").toUpperCase() : "—";
    const activeItem = NAV_ITEMS.find(n => n.id === activePage);

    const handleMouseEnterProfile = () => { clearTimeout(hoverTimeoutRef.current); setProfileOpen(true); };
    const handleMouseLeaveProfile = () => { hoverTimeoutRef.current = setTimeout(() => setProfileOpen(false), 150); };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "Logging out?",
            html: `<p style="font-size:.9rem;color:#6b7280;">Are you sure you want to sign out?</p>`,
            icon: "warning", showCancelButton: true, confirmButtonText: "Yes, log out", cancelButtonText: "Cancel",
            confirmButtonColor: C.green, reverseButtons: true, allowOutsideClick: false,
            customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" },
        });
        if (!result.isConfirmed) return;
        try {
            const token = localStorage.getItem("token");
            if (token) await fetch(`${API}/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        } catch (_) { }
        ["token", "userId", "isLoggedIn", "userRole"].forEach(k => localStorage.removeItem(k));
        await Swal.fire({ title: "Logged out!", icon: "success", confirmButtonText: "Back to Login", confirmButtonColor: C.green, allowOutsideClick: false, customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" } });
        navigate("/login");
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Outfit:wght@300;400;500;600;700&family=DM+Sans:wght@500;700;800&family=Dancing+Script:wght@600&display=swap');
                *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
                body{font-family:'Outfit',sans-serif;background:${C.bg};color:${C.text}}
                ::-webkit-scrollbar{width:4px;height:4px}
                ::-webkit-scrollbar-track{background:transparent}
                ::-webkit-scrollbar-thumb{background:#c4d4c4;border-radius:99px}
                @keyframes spin{to{transform:rotate(360deg)}}
                @keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
                .swal-popup{border-radius:16px!important;font-family:'Outfit',sans-serif!important;padding:2rem!important}
                .swal-title{font-family:'Lora',serif!important;font-size:1.3rem!important;color:${C.text}!important}
                .swal-confirm{font-family:'Outfit',sans-serif!important;font-weight:600!important;border-radius:8px!important}
            `}</style>

            <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg }}>

                {/* ══ SIDEBAR ══ */}
                <aside style={{ width: sidebarOpen ? 224 : 64, minWidth: sidebarOpen ? 224 : 64, background: C.sidebar, display: "flex", flexDirection: "column", transition: "width .3s cubic-bezier(.16,1,.3,1),min-width .3s", overflow: "hidden", zIndex: 30 }}>

                    {/* Logo */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 1rem", borderBottom: "1px solid rgba(255,255,255,.07)", height: 72, overflow: "hidden", flexShrink: 0, background: C.sidebar }}>
                        {sidebarOpen ? (
                            <img
                                src={ezLoanLogo}
                                alt="EzLoan"
                                style={{ height: 48, width: "auto", objectFit: "contain", display: "block" }}
                            />
                        ) : (
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(232,223,192,.1)", border: "1px solid rgba(232,223,192,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontFamily: "'Georgia', serif", fontSize: ".88rem", fontWeight: 700, fontStyle: "italic", color: "#e8dfc0" }}>Ez</span>
                            </div>
                        )}
                    </div>

                    {/* Nav items */}
                    <nav style={{ flex: 1, padding: ".6rem .5rem", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
                        {sidebarOpen && (
                            <p style={{ fontSize: ".58rem", fontWeight: 700, color: "rgba(255,255,255,.22)", letterSpacing: ".12em", textTransform: "uppercase", padding: "8px 12px 4px" }}>Menu</p>
                        )}
                        {NAV_ITEMS.map(({ icon: Icon, label, id }) => {
                            const active = activePage === id;
                            return (
                                <button key={id} onClick={() => setActivePage(id)}
                                    style={{ display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "9px 12px" : "10px", justifyContent: sidebarOpen ? "flex-start" : "center", borderRadius: 9, border: "none", cursor: "pointer", background: active ? "rgba(255,255,255,.1)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,.42)", fontFamily: "'Outfit',sans-serif", fontSize: ".83rem", fontWeight: active ? 600 : 400, transition: "all .18s", width: "100%", whiteSpace: "nowrap", position: "relative" }}
                                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(255,255,255,.75)"; } }}
                                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.42)"; } }}>
                                    {active && <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: "0 3px 3px 0", background: "#7dda7d" }} />}
                                    <Icon size={15} style={{ flexShrink: 0 }} />
                                    {sidebarOpen && label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Collapse toggle */}
                    <div style={{ padding: ".5rem", borderTop: "1px solid rgba(255,255,255,.07)" }}>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{ display: "flex", alignItems: "center", gap: 9, padding: sidebarOpen ? "8px 12px" : "9px", justifyContent: sidebarOpen ? "flex-start" : "center", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,.28)", fontFamily: "'Outfit',sans-serif", fontSize: ".78rem", width: "100%", transition: "all .18s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(255,255,255,.65)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.28)"; }}>
                            {sidebarOpen ? <><X size={13} style={{ flexShrink: 0 }} /> Collapse</> : <Menu size={13} />}
                        </button>
                    </div>
                </aside>

                {/* ══ MAIN AREA ══ */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                    {/* Topbar */}
                    <header style={{ height: 62, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.75rem", gap: "1rem", flexShrink: 0, zIndex: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: ".74rem", color: C.muted, fontStyle: "italic", fontFamily: "'Georgia', serif", fontWeight: 700 }}>EzLoan</span>
                            <ChevronRight size={12} color="#b8ccb8" />
                            <span style={{ fontSize: ".74rem", fontWeight: 700, color: C.text }}>{activeItem?.label || "Dashboard"}</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: ".65rem" }}>

                            {/* Search */}
                            <div style={{ position: "relative" }}>
                                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }} />
                                <input placeholder="Search transactions…"
                                    style={{ padding: "7px 12px 7px 30px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: ".78rem", fontFamily: "'Outfit',sans-serif", outline: "none", width: 210, color: C.text, background: C.bg, transition: "all .2s" }}
                                    onFocus={e => { e.target.style.borderColor = C.green; e.target.style.background = C.white; e.target.style.boxShadow = "0 0 0 3px rgba(45,122,45,.08)"; }}
                                    onBlur={e => { e.target.style.borderColor = C.border; e.target.style.background = C.bg; e.target.style.boxShadow = "none"; }} />
                            </div>

                            {/* Notifications */}
                            <div style={{ position: "relative" }}>
                                <button onClick={() => setNotifOpen(!notifOpen)}
                                    style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${notifOpen ? C.green : C.border}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transition: "border-color .15s" }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = C.green}
                                    onMouseLeave={e => { if (!notifOpen) e.currentTarget.style.borderColor = C.border; }}>
                                    <Bell size={15} color={C.label} />
                                    <span style={{ position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: "50%", background: C.danger, border: "1.5px solid #fff" }} />
                                </button>
                                {notifOpen && (
                                    <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 300, background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 16px 48px rgba(0,0,0,.1)", zIndex: 50, overflow: "hidden", animation: "dropIn .18s ease" }}>
                                        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: ".82rem", fontWeight: 700, color: C.text }}>Notifications</span>
                                            <span style={{ fontSize: ".7rem", color: C.green, fontWeight: 600, cursor: "pointer" }}>Mark all read</span>
                                        </div>
                                        {[
                                            { text: "Payment of ₱4,850 due in 3 days", time: "2h ago", dot: C.warning },
                                            { text: "Loan application status updated", time: "1d ago", dot: C.green },
                                            { text: "New loan offers available", time: "2d ago", dot: C.info },
                                        ].map((n, i) => (
                                            <div key={i} style={{ padding: "11px 16px", display: "flex", gap: 10, alignItems: "flex-start", borderBottom: i < 2 ? `1px solid ${C.border}` : "none", cursor: "pointer", transition: "background .15s" }}
                                                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: n.dot, marginTop: 5, flexShrink: 0 }} />
                                                <div>
                                                    <p style={{ fontSize: ".78rem", color: C.label, fontWeight: 500 }}>{n.text}</p>
                                                    <p style={{ fontSize: ".67rem", color: C.muted, marginTop: 2 }}>{n.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Profile pill */}
                            <div style={{ position: "relative" }} onMouseEnter={handleMouseEnterProfile} onMouseLeave={handleMouseLeaveProfile}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px", borderRadius: 10, border: `1.5px solid ${profileOpen ? C.green : C.border}`, background: C.white, cursor: "default", transition: "all .18s", boxShadow: profileOpen ? "0 0 0 3px rgba(45,122,45,.08)" : "none" }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2d7a2d,#4a9e4a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        {userLoading
                                            ? <span style={{ width: 11, height: 11, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite", display: "block" }} />
                                            : <span style={{ fontSize: ".65rem", fontWeight: 800, color: "#fff" }}>{initials}</span>}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: ".74rem", fontWeight: 700, color: C.text, lineHeight: 1 }}>{userLoading ? "Loading…" : fullName}</p>
                                        <p style={{ fontSize: ".62rem", color: C.muted, marginTop: 1 }}>Borrower</p>
                                    </div>
                                    <div style={{ width: 1, height: 18, background: C.border, marginLeft: 2 }} />
                                    <button onClick={handleLogout} title="Log out"
                                        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 3px", borderRadius: 5, color: C.muted, display: "flex", transition: "color .15s" }}
                                        onMouseEnter={e => e.currentTarget.style.color = C.danger}
                                        onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                                        <LogOut size={13} />
                                    </button>
                                </div>

                                {profileOpen && (
                                    <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, width: 205, background: C.white, borderRadius: 13, border: `1px solid ${C.border}`, boxShadow: "0 16px 48px rgba(0,0,0,.12)", zIndex: 50, overflow: "hidden", animation: "dropIn .18s ease" }}
                                        onMouseEnter={handleMouseEnterProfile} onMouseLeave={handleMouseLeaveProfile}>
                                        <div style={{ padding: "10px 13px", background: C.sidebar }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#2d7a2d,#4a9e4a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <span style={{ fontSize: ".65rem", fontWeight: 800, color: "#fff" }}>{initials}</span>
                                                </div>
                                                <div style={{ overflow: "hidden" }}>
                                                    <p style={{ fontSize: ".76rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fullName}</p>
                                                    <p style={{ fontSize: ".62rem", color: "rgba(255,255,255,.4)", marginTop: 1 }}>Borrower</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ padding: ".3rem" }}>
                                            {[
                                                { icon: User, label: "My Profile", fn: () => { setProfileOpen(false); navigate("/profile"); } },
                                                { icon: Shield, label: "Verification", fn: () => { setProfileOpen(false); navigate("/verify"); } },
                                            ].map(({ icon: Icon, label, fn }, i) => (
                                                <button key={i} onClick={fn}
                                                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 7, border: "none", cursor: "pointer", background: "transparent", fontFamily: "'Outfit',sans-serif", fontSize: ".8rem", color: C.text, transition: "all .15s", textAlign: "left" }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = C.greenSoft; e.currentTarget.style.color = C.green; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.text; }}>
                                                    <Icon size={13} style={{ flexShrink: 0 }} />{label}
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ height: 1, background: C.border }} />
                                        <div style={{ padding: ".3rem" }}>
                                            <button onClick={() => { setProfileOpen(false); handleLogout(); }}
                                                style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 7, border: "none", cursor: "pointer", background: "transparent", fontFamily: "'Outfit',sans-serif", fontSize: ".8rem", color: C.danger, transition: "background .15s", textAlign: "left" }}
                                                onMouseEnter={e => e.currentTarget.style.background = "#fde8e8"}
                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                <LogOut size={13} style={{ flexShrink: 0 }} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1.75rem" }}>
                        {activePage === "home" ? (
                            <UserDashboard userName={currentUser?.firstName || "User"} userLoading={userLoading} />
                        ) : (
                            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, minHeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <PagePlaceholder label={activeItem?.label} icon={activeItem?.icon || LayoutDashboard} />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}