// src/pages/HomePage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Landmark, LayoutDashboard, Layers, BookOpen,
    Users, CreditCard, FileText, Bell, Search,
    TrendingUp, DollarSign, AlertTriangle,
    ChevronRight, MoreHorizontal,
    Clock, Menu, X, BarChart3,
    Calendar, Download, LogOut,
    Activity, Wallet, UserCheck, Database,
    Settings, LogOut as LogOutIcon, ChevronDown,
    ArrowUpRight, Filter, RefreshCw, HelpCircle,
    Shield, Target, PieChart, Award, Gift,
    Phone, Mail, MessageCircle, PiggyBank,
    Home, Briefcase, Car, GraduationCap,
    CheckCircle, Clock3, AlertCircle, ArrowRight
} from "lucide-react";
import Swal from "sweetalert2";

const API = "http://localhost:5000/api/auth";

// ── Updated Navigation Items ──────────────────────────────────────────────────
const NAV_ITEMS = [
    { icon: LayoutDashboard, label: "Dashboard", id: "home" },
    { icon: Layers, label: "Loan Types", id: "loan-types" },
    { icon: BookOpen, label: "Loan Plans", id: "loanplans" },
    { icon: Wallet, label: "Payment", id: "payments" },
];

// Sample user loan data
const USER_LOANS = [
    {
        id: "LN-2026-001",
        type: "Personal Loan",
        amount: "₱50,000",
        status: "Active",
        dateApplied: "Mar 01, 2026",
        nextPayment: "Apr 01, 2026",
        remainingBalance: "₱35,000",
        interestRate: "5.5%",
        term: "12 months",
        progress: 42
    },
    {
        id: "LN-2026-002",
        type: "Business Loan",
        amount: "₱200,000",
        status: "Pending",
        dateApplied: "Feb 28, 2026",
        nextPayment: "—",
        remainingBalance: "₱200,000",
        interestRate: "7.2%",
        term: "24 months",
        progress: 0
    },
];

// Payment schedule
const PAYMENT_SCHEDULE = [
    { dueDate: "Apr 01, 2026", amount: "₱4,850", status: "Upcoming", type: "Monthly Payment" },
    { dueDate: "May 01, 2026", amount: "₱4,850", status: "Scheduled", type: "Monthly Payment" },
    { dueDate: "Jun 01, 2026", amount: "₱4,850", status: "Scheduled", type: "Monthly Payment" },
];

// Transaction history
const TRANSACTIONS = [
    { date: "Mar 01, 2026", description: "Loan Disbursement", amount: "+₱50,000", type: "credit", status: "Completed" },
    { date: "Feb 15, 2026", description: "Monthly Payment", amount: "-₱4,850", type: "debit", status: "Completed" },
    { date: "Jan 15, 2026", description: "Monthly Payment", amount: "-₱4,850", type: "debit", status: "Completed" },
    { date: "Dec 15, 2025", description: "Monthly Payment", amount: "-₱4,850", type: "debit", status: "Completed" },
    { date: "Nov 15, 2025", description: "Monthly Payment", amount: "-₱4,850", type: "debit", status: "Completed" },
];

// Available loan products
const LOAN_PRODUCTS = [
    { icon: UserCheck, name: "Personal Loan", interest: "5.5%", amount: "Up to ₱500,000", term: "6-24 months", color: "#2d7a2d", popular: true },
    { icon: Briefcase, name: "Business Loan", interest: "7.2%", amount: "Up to ₱2,000,000", term: "12-36 months", color: "#2563eb", popular: false },
    { icon: Home, name: "Housing Loan", interest: "4.8%", amount: "Up to ₱5,000,000", term: "12-60 months", color: "#7c3aed", popular: false },
    { icon: Car, name: "Auto Loan", interest: "6.1%", amount: "Up to ₱1,500,000", term: "12-48 months", color: "#c47a00", popular: false },
    { icon: GraduationCap, name: "Education Loan", interest: "4.2%", amount: "Up to ₱300,000", term: "6-24 months", color: "#c42d2d", popular: false },
];

// Color palette (softer, user-friendly theme)
const C = {
    bg: "#f8faf8",
    sidebar: "#1a2e1a",
    sidebarActive: "#2d5a2d",
    green: "#2d7a2d",
    greenLight: "#4a9e4a",
    greenSoft: "rgba(45,122,45,.1)",
    greenBorder: "rgba(45,122,45,.2)",
    white: "#ffffff",
    border: "#e2e8e2",
    text: "#1e2e1e",
    muted: "#647a64",
    label: "#2d3a2d",
    success: "#2d7a2d",
    warning: "#c47a00",
    danger: "#c42d2d",
    card: "#ffffff",
    primary: "#2d7a2d",
    primaryLight: "#e8f2e8",
    info: "#2563eb",
    infoLight: "#e8f0fe",
};

// ── Status Badge ──────────────────────────────────────────────────────────────
function Badge({ status }) {
    const map = {
        Active: { bg: "#e8f5e8", color: "#2d7a2d", icon: CheckCircle },
        Pending: { bg: "#fff8e1", color: "#c47a00", icon: Clock3 },
        Overdue: { bg: "#fde8e8", color: "#c42d2d", icon: AlertCircle },
        Completed: { bg: "#e8f5e8", color: "#2d7a2d", icon: CheckCircle },
        Upcoming: { bg: "#e8f0fe", color: "#2563eb", icon: Clock3 },
        Scheduled: { bg: "#f3f4f6", color: "#647a64", icon: Clock },
        "Paid": { bg: "#e8f5e8", color: "#2d7a2d", icon: CheckCircle },
        credit: { bg: "#e8f5e8", color: "#2d7a2d", icon: ArrowUpRight },
        debit: { bg: "#fde8e8", color: "#c42d2d", icon: ArrowRight },
    };
    const s = map[status] || { bg: "#f3f4f6", color: "#647a64", icon: Clock };
    const Icon = s.icon;

    return (
        <span style={{
            fontSize: ".72rem",
            fontWeight: 600,
            color: s.color,
            background: s.bg,
            padding: "4px 10px",
            borderRadius: 20,
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
        }}>
            <Icon style={{ width: 12, height: 12 }} />
            {status}
        </span>
    );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ progress, color = C.green }) {
    return (
        <div style={{ width: "100%", height: 6, background: "#e8ede8", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: color, borderRadius: 99, transition: "width .6s cubic-bezier(.16,1,.3,1)" }} />
        </div>
    );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, trend, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                background: C.card,
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: ".75rem",
                cursor: onClick ? "pointer" : "default",
                transition: "all .2s ease",
            }}
            onMouseEnter={e => {
                if (onClick) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,.06)";
                    e.currentTarget.style.borderColor = C.green;
                }
            }}
            onMouseLeave={e => {
                if (onClick) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = C.border;
                }
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: 18, height: 18, color }} />
                </div>
                {trend && (
                    <span style={{ fontSize: ".7rem", fontWeight: 600, color: C.green, background: C.greenSoft, padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
                        <ArrowUpRight style={{ width: 10, height: 10 }} />{trend}
                    </span>
                )}
            </div>
            <div>
                <p style={{ fontSize: "1.6rem", fontWeight: 700, color: C.text, fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: ".78rem", fontWeight: 600, color: C.label, marginTop: 4 }}>{label}</p>
                {sub && <p style={{ fontSize: ".7rem", color: C.muted, marginTop: 2 }}>{sub}</p>}
            </div>
        </div>
    );
}

// ── Loan Product Card ─────────────────────────────────────────────────────────
function LoanProductCard({ product }) {
    const Icon = product.icon;
    return (
        <div style={{
            background: C.white,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            position: "relative",
            transition: "all .2s ease",
            cursor: "pointer",
            height: "100%",
            minHeight: "280px",
            maxHeight: "320px",
        }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,.06)";
                e.currentTarget.style.borderColor = product.color;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = C.border;
            }}
        >
            {product.popular && (
                <span style={{
                    position: "absolute",
                    top: -8,
                    right: 16,
                    background: C.green,
                    color: "#fff",
                    fontSize: ".68rem",
                    fontWeight: 600,
                    padding: "2px 10px",
                    borderRadius: 20,
                    zIndex: 2,
                }}>
                    Popular
                </span>
            )}

            <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `${product.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}>
                <Icon style={{ width: 22, height: 22, color: product.color }} />
            </div>

            <div style={{ minHeight: "60px" }}>
                <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: ".25rem",
                    lineHeight: 1.3,
                }}>{product.name}</h3>
                <p style={{ fontSize: ".8rem", color: C.muted }}>Interest: {product.interest}</p>
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: ".4rem",
                flex: 1,
                justifyContent: "center",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem" }}>
                    <span style={{ color: C.muted }}>Max Amount</span>
                    <span style={{ fontWeight: 600, color: C.text }}>{product.amount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem" }}>
                    <span style={{ color: C.muted }}>Term</span>
                    <span style={{ fontWeight: 600, color: C.text }}>{product.term}</span>
                </div>
            </div>

            <button style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: `1.5px solid ${product.color}`,
                background: "transparent",
                color: product.color,
                fontSize: ".85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .2s",
                marginTop: "auto",
                flexShrink: 0,
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = product.color;
                    e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = product.color;
                }}
            >
                Apply Now
            </button>
        </div>
    );
}

// ── Page Placeholder ──────────────────────────────────────────────────────────
function PagePlaceholder({ label, icon: Icon }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "1rem" }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon style={{ width: 32, height: 32, color: C.green }} />
            </div>
            <p style={{ fontFamily: "'Lora', serif", fontSize: "1.2rem", fontWeight: 600, color: C.text }}>{label}</p>
            <p style={{ fontSize: ".85rem", color: C.muted }}>This page is under construction.</p>
        </div>
    );
}

// ── User Dashboard ────────────────────────────────────────────────────────────
function UserDashboard({ userName, userLoading }) {
    const [visible, setVisible] = useState(false);
    const [showAllLoans, setShowAllLoans] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 60);
        return () => clearTimeout(t);
    }, []);

    const anim = (d = 0) => ({
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity .4s ease ${d}ms, transform .4s cubic-bezier(.16,1,.3,1) ${d}ms`
    });

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    const totalLoans = USER_LOANS.length;
    const activeLoans = USER_LOANS.filter(l => l.status === "Active").length;
    const totalBorrowed = USER_LOANS.reduce((sum, loan) => sum + parseInt(loan.amount.replace(/[₱,]/g, '')), 0);
    const nextPayment = USER_LOANS[0]?.nextPayment || "No payments due";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* Welcome Header */}
            <div style={anim(0)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "1.8rem", fontWeight: 600, color: C.text }}>
                            {greeting}, {userLoading ? "…" : userName}! 👋
                        </h1>
                        <p style={{ fontSize: ".9rem", color: C.muted, marginTop: ".3rem" }}>
                            Welcome back to your LoanShark dashboard. Here's your financial overview.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: ".6rem" }}>
                        <button style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 18px",
                            borderRadius: 10,
                            border: "none",
                            background: C.green,
                            color: "#fff",
                            fontFamily: "'Outfit',sans-serif",
                            fontSize: ".85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all .2s"
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = C.greenLight}
                            onMouseLeave={e => e.currentTarget.style.background = C.green}
                        >
                            <CreditCard style={{ width: 16, height: 16 }} /> Apply for New Loan
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", ...anim(60) }}>
                <StatCard
                    icon={Wallet}
                    label="Total Borrowed"
                    value={`₱${(totalBorrowed / 1000).toFixed(1)}K`}
                    sub="Across all loans"
                    color={C.green}
                />
                <StatCard
                    icon={CreditCard}
                    label="Active Loans"
                    value={activeLoans.toString()}
                    sub={`${totalLoans} total loans`}
                    color="#2563eb"
                />
                <StatCard
                    icon={Calendar}
                    label="Next Payment"
                    value={nextPayment}
                    sub={USER_LOANS[0]?.amount || "—"}
                    color="#7c3aed"
                />
                <StatCard
                    icon={Award}
                    label="Credit Score"
                    value="720"
                    sub="Good standing"
                    color="#c47a00"
                    trend="+15"
                />
            </div>

            {/* Active Loans Section */}
            <div style={anim(120)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: C.text }}>My Active Loans</h2>
                    <button
                        onClick={() => setShowAllLoans(!showAllLoans)}
                        style={{
                            background: "none",
                            border: "none",
                            color: C.green,
                            fontSize: ".85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4
                        }}
                    >
                        {showAllLoans ? "Show Less" : "View All"}
                        <ChevronRight style={{ width: 14, height: 14 }} />
                    </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                    {(showAllLoans ? USER_LOANS : USER_LOANS.filter(l => l.status === "Active")).map((loan, idx) => (
                        <div key={idx} style={{
                            background: C.white,
                            borderRadius: 14,
                            border: `1px solid ${C.border}`,
                            padding: "1.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.25rem"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <p style={{ fontSize: ".8rem", color: C.muted }}>Loan #{loan.id}</p>
                                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: C.text }}>{loan.type}</h3>
                                </div>
                                <Badge status={loan.status} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <p style={{ fontSize: ".7rem", color: C.muted, marginBottom: ".2rem" }}>Amount</p>
                                    <p style={{ fontSize: "1.3rem", fontWeight: 800, color: C.green }}>{loan.amount}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: ".7rem", color: C.muted, marginBottom: ".2rem" }}>Interest Rate</p>
                                    <p style={{ fontSize: "1.1rem", fontWeight: 600, color: C.text }}>{loan.interestRate}</p>
                                </div>
                            </div>

                            {loan.status === "Active" && (
                                <>
                                    <div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
                                            <span style={{ fontSize: ".75rem", color: C.muted }}>Repayment Progress</span>
                                            <span style={{ fontSize: ".75rem", fontWeight: 600, color: C.green }}>{loan.progress}%</span>
                                        </div>
                                        <ProgressBar progress={loan.progress} />
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", padding: ".75rem 0", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
                                        <div>
                                            <p style={{ fontSize: ".7rem", color: C.muted }}>Remaining</p>
                                            <p style={{ fontSize: "1rem", fontWeight: 700, color: C.text }}>{loan.remainingBalance}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: ".7rem", color: C.muted }}>Next Payment</p>
                                            <p style={{ fontSize: "1rem", fontWeight: 700, color: C.text }}>{loan.nextPayment}</p>
                                        </div>
                                    </div>

                                    <button style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: 8,
                                        border: `1.5px solid ${C.green}`,
                                        background: "transparent",
                                        color: C.green,
                                        fontSize: ".85rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all .2s"
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = C.green;
                                            e.currentTarget.style.color = "#fff";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.color = C.green;
                                        }}
                                    >
                                        Make a Payment
                                    </button>
                                </>
                            )}

                            {loan.status === "Pending" && (
                                <div style={{
                                    background: C.infoLight,
                                    borderRadius: 8,
                                    padding: "1rem",
                                    textAlign: "center"
                                }}>
                                    <p style={{ fontSize: ".85rem", color: C.info, fontWeight: 500 }}>
                                        Your application is being reviewed. We'll notify you within 2-3 business days.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}

                    {USER_LOANS.filter(l => l.status === "Active").length === 0 && !showAllLoans && (
                        <div style={{
                            gridColumn: "1 / -1",
                            background: C.white,
                            borderRadius: 14,
                            border: `1px solid ${C.border}`,
                            padding: "3rem",
                            textAlign: "center"
                        }}>
                            <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                                <CreditCard style={{ width: 32, height: 32, color: C.green }} />
                            </div>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: C.text, marginBottom: ".5rem" }}>No Active Loans</h3>
                            <p style={{ fontSize: ".9rem", color: C.muted, marginBottom: "1.5rem" }}>Ready to get started? Apply for a loan that suits your needs.</p>
                            <button style={{
                                padding: "10px 24px",
                                borderRadius: 8,
                                border: "none",
                                background: C.green,
                                color: "#fff",
                                fontSize: ".9rem",
                                fontWeight: 600,
                                cursor: "pointer"
                            }}>
                                Browse Loan Options
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Payments & Recent Transactions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1rem", ...anim(180) }}>

                {/* Upcoming Payments */}
                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: C.text, marginBottom: "1rem" }}>📅 Upcoming Payments</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {PAYMENT_SCHEDULE.map((payment, idx) => (
                            <div key={idx} style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: ".75rem",
                                background: idx === 0 ? C.greenSoft : "transparent",
                                borderRadius: 8
                            }}>
                                <div>
                                    <p style={{ fontSize: ".9rem", fontWeight: 600, color: C.text }}>{payment.amount}</p>
                                    <p style={{ fontSize: ".75rem", color: C.muted }}>{payment.dueDate}</p>
                                </div>
                                <Badge status={payment.status} />
                            </div>
                        ))}
                    </div>
                    <button style={{
                        width: "100%",
                        marginTop: "1rem",
                        padding: "10px",
                        borderRadius: 8,
                        border: `1px solid ${C.border}`,
                        background: "transparent",
                        color: C.green,
                        fontSize: ".8rem",
                        fontWeight: 600,
                        cursor: "pointer"
                    }}>
                        View Full Schedule
                    </button>
                </div>

                {/* Recent Transactions */}
                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: C.text, marginBottom: "1rem" }}>💰 Recent Transactions</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                        {TRANSACTIONS.map((txn, idx) => (
                            <div key={idx} style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: ".5rem 0",
                                borderBottom: idx < TRANSACTIONS.length - 1 ? `1px solid ${C.border}` : "none"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        background: txn.type === 'credit' ? C.greenSoft : '#fde8e8',
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        {txn.type === 'credit' ?
                                            <ArrowUpRight style={{ width: 14, height: 14, color: C.green }} /> :
                                            <ArrowRight style={{ width: 14, height: 14, color: C.danger }} />
                                        }
                                    </div>
                                    <div>
                                        <p style={{ fontSize: ".85rem", fontWeight: 600, color: C.text }}>{txn.description}</p>
                                        <p style={{ fontSize: ".7rem", color: C.muted }}>{txn.date}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{
                                        fontSize: ".9rem",
                                        fontWeight: 700,
                                        color: txn.type === 'credit' ? C.green : C.danger
                                    }}>
                                        {txn.amount}
                                    </p>
                                    <Badge status={txn.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recommended Loan Products */}
            <div style={anim(240)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: C.text }}>🎯 Recommended for You</h2>
                    <button style={{ background: "none", border: "none", color: C.green, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" }}>
                        View All Products →
                    </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
                    {LOAN_PRODUCTS.map((product, idx) => (
                        <LoanProductCard key={idx} product={product} />
                    ))}
                </div>
            </div>

            {/* Need Help Section */}
            <div style={{
                background: C.green,
                borderRadius: 14,
                padding: "2rem",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                ...anim(300)
            }}>
                <div>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: ".5rem" }}>Need help with your loans?</h3>
                    <p style={{ opacity: 0.9 }}>Our support team is available 24/7 to assist you with any questions.</p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button style={{
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: "2px solid #fff",
                        background: "transparent",
                        color: "#fff",
                        fontSize: ".9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                    }}>
                        <MessageCircle style={{ width: 16, height: 16 }} /> Live Chat
                    </button>
                    <button style={{
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: "none",
                        background: "#fff",
                        color: C.green,
                        fontSize: ".9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                    }}>
                        <Phone style={{ width: 16, height: 16 }} /> Call Support
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function HomePage() {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState("home");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifOpen, setNotifOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

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
            } catch (err) {
                console.error("Failed to load user:", err);
            } finally {
                setUserLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const fullName = currentUser ? [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") : "—";
    const initials = currentUser ? [(currentUser.firstName || "")[0], (currentUser.lastName || "")[0]].filter(Boolean).join("").toUpperCase() : "—";
    const userRole = currentUser?.role || "—";
    const activeItem = NAV_ITEMS.find(n => n.id === activePage);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "Logging out?",
            html: `<p style="font-size:.9rem;color:#6b7280;">Are you sure you want to sign out?</p>`,
            icon: "warning", showCancelButton: true,
            confirmButtonText: "Yes, log out", cancelButtonText: "Cancel",
            confirmButtonColor: C.green, reverseButtons: true, allowOutsideClick: false,
            customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" },
        });
        if (!result.isConfirmed) return;
        try {
            const token = localStorage.getItem("token");
            if (token) await fetch(`${API}/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        } catch (e) { }
        ["token", "userId", "isLoggedIn", "userRole"].forEach(k => localStorage.removeItem(k));
        await Swal.fire({ title: "Logged out!", icon: "success", confirmButtonText: "Back to Login", confirmButtonColor: C.green, allowOutsideClick: false, customClass: { popup: "swal-popup", title: "swal-title", confirmButton: "swal-confirm" } });
        navigate("/login");
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
                .swal-popup  { border-radius: 16px !important; font-family: 'Outfit', sans-serif !important; padding: 2rem !important; }
                .swal-title  { font-family: 'Lora', serif !important; font-size: 1.3rem !important; color: ${C.text} !important; }
                .swal-confirm{ font-family: 'Outfit', sans-serif !important; font-weight: 600 !important; border-radius: 8px !important; }
            `}</style>

            <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg }}>

                {/* ── SIDEBAR ── */}
                <aside style={{ width: sidebarOpen ? 220 : 66, minWidth: sidebarOpen ? 220 : 66, background: C.sidebar, display: "flex", flexDirection: "column", transition: "width .3s cubic-bezier(.16,1,.3,1), min-width .3s", overflow: "hidden", zIndex: 30 }}>
                    {/* Logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "1.25rem 1.25rem 1rem" : "1.25rem 1rem 1rem", borderBottom: "1px solid rgba(255,255,255,.08)", minHeight: 64 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Landmark style={{ width: 17, height: 17, color: "#fff" }} />
                        </div>
                        {sidebarOpen && <span style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>LoanShark</span>}
                    </div>

                    {/* Nav */}
                    <nav style={{ flex: 1, padding: ".75rem .6rem", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
                        {NAV_ITEMS.map(({ icon: Icon, label, id }) => {
                            const active = activePage === id;
                            return (
                                <button key={id} onClick={() => setActivePage(id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "9px 12px" : "9px", justifyContent: sidebarOpen ? "flex-start" : "center", borderRadius: 9, border: "none", cursor: "pointer", background: active ? "rgba(45,122,45,.35)" : "transparent", color: active ? "#9de89d" : "rgba(255,255,255,.5)", fontFamily: "'Outfit',sans-serif", fontSize: ".83rem", fontWeight: active ? 600 : 400, transition: "all .18s", width: "100%", whiteSpace: "nowrap", position: "relative" }}
                                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.color = "rgba(255,255,255,.85)"; } }}
                                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; } }}>
                                    {active && <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: "0 3px 3px 0", background: "#9de89d" }} />}
                                    <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                                    {sidebarOpen && label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Bottom */}
                    <div style={{ padding: ".75rem .6rem", borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", flexDirection: "column", gap: 2 }}>
                        <button style={{ display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "9px 12px" : "9px", justifyContent: sidebarOpen ? "flex-start" : "center", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,.5)", fontFamily: "'Outfit',sans-serif", fontSize: ".83rem", width: "100%" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}>
                        </button>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "9px 12px" : "9px", justifyContent: sidebarOpen ? "flex-start" : "center", borderRadius: 9, border: "none", cursor: "pointer", background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.4)", fontFamily: "'Outfit',sans-serif", fontSize: ".8rem", width: "100%" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(255,255,255,.4)"; }}>
                            {sidebarOpen ? <X style={{ width: 15, height: 15, flexShrink: 0 }} /> : <Menu style={{ width: 15, height: 15 }} />}
                            {sidebarOpen && "Collapse"}
                        </button>
                    </div>
                </aside>

                {/* ── MAIN ── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                    {/* Top Bar */}
                    <header style={{ height: 64, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.75rem", gap: "1rem", flexShrink: 0, zIndex: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: ".78rem", color: C.muted }}>LoanShark</span>
                            <ChevronRight style={{ width: 13, height: 13, color: "#c8d8c8" }} />
                            <span style={{ fontSize: ".78rem", fontWeight: 600, color: C.text }}>{activeItem?.label || "Dashboard"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                            {/* Search */}
                            <div style={{ position: "relative" }}>
                                <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: C.muted, pointerEvents: "none" }} />
                                <input placeholder="Search transactions..." style={{ padding: "7px 12px 7px 30px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: ".8rem", fontFamily: "'Outfit',sans-serif", outline: "none", width: 200, color: C.text, background: C.bg }}
                                    onFocus={e => { e.target.style.borderColor = C.green; e.target.style.boxShadow = `0 0 0 3px ${C.greenSoft}`; e.target.style.background = C.white; }}
                                    onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }} />
                            </div>

                            {/* Notif */}
                            <div style={{ position: "relative" }}>
                                <button onClick={() => setNotifOpen(!notifOpen)} style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                                    <Bell style={{ width: 15, height: 15, color: C.label }} />
                                    <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", background: C.danger, border: "1.5px solid #fff" }} />
                                </button>
                                {notifOpen && (
                                    <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 300, background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: "0 12px 40px rgba(0,0,0,.08)", zIndex: 50, overflow: "hidden" }}>
                                        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: ".8rem", fontWeight: 600, color: C.text }}>Notifications</span>
                                            <span style={{ fontSize: ".7rem", color: C.green, fontWeight: 600, cursor: "pointer" }}>Mark all read</span>
                                        </div>
                                        {[
                                            { text: "Your payment of ₱4,850 is due in 3 days", time: "2h ago", dot: C.warning, bg: "#fff8e1" },
                                            { text: "Loan application status updated", time: "1d ago", dot: C.green, bg: "#e8f5e8" },
                                            { text: "New loan offers available for you", time: "2d ago", dot: "#2563eb", bg: "#e8f0fe" },
                                        ].map((n, i) => (
                                            <div key={i} style={{ padding: "11px 16px", display: "flex", gap: 10, alignItems: "flex-start", background: n.bg, borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}>
                                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: n.dot, marginTop: 5, flexShrink: 0 }} />
                                                <div>
                                                    <p style={{ fontSize: ".78rem", color: C.label, fontWeight: 500 }}>{n.text}</p>
                                                    <p style={{ fontSize: ".68rem", color: C.muted, marginTop: 2 }}>{n.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* User pill */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 5px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.white }}>
                                <button onClick={() => navigate("/profile")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 7 }}
                                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        {userLoading
                                            ? <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite", display: "block" }} />
                                            : <span style={{ fontSize: ".68rem", fontWeight: 700, color: "#fff" }}>{initials}</span>}
                                    </div>
                                    <div style={{ textAlign: "left" }}>
                                        <p style={{ fontSize: ".76rem", fontWeight: 600, color: C.text, lineHeight: 1 }}>{userLoading ? "Loading…" : fullName}</p>
                                        <p style={{ fontSize: ".63rem", color: C.muted, lineHeight: 1, marginTop: 2 }}>Borrower</p>
                                    </div>
                                </button>
                                <div style={{ width: 1, height: 20, background: C.border }} />
                                <button onClick={handleLogout} title="Log out" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 5, color: C.muted, display: "flex" }}
                                    onMouseEnter={e => e.currentTarget.style.color = C.danger}
                                    onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                                    <LogOut style={{ width: 13, height: 13 }} />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1.75rem" }}>
                        {activePage === "home" ? (
                            <UserDashboard userName={currentUser?.firstName || "User"} userLoading={userLoading} />
                        ) : (
                            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, minHeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <PagePlaceholder label={activeItem?.label} icon={activeItem?.icon || LayoutDashboard} />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}