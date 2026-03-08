// backend/controllers/authControllers.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "../db.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateToken() {
    return crypto.randomBytes(64).toString("hex");
}

function getIP(req) {
    return (
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        null
    );
}

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const SESSION_DAYS = 7;

// ── Blocked contact numbers (mirrors client-side BLOCKED list) ────────────────
const BLOCKED_CONTACTS = ["09123456789", "09564789213", "09111112235", "09554178900"];


// ══════════════════════════════════════════════════════════════════════════════
// SERVER-SIDE VALIDATORS  (mirrors src/pages/RegisterPage.jsx › V object)
// ══════════════════════════════════════════════════════════════════════════════
const V = {

    // First name / Last name
    name(v, label = "This field") {
        if (!v || !v.trim()) return `${label} is required.`;
        const t = v.trim();
        if (t.length < 5) return "Minimum 5 characters.";
        if (t.length > 20) return "Maximum 20 characters.";
        if (!/^[A-Z]/.test(t)) return "Must start with a capital letter.";
        if (!/^[A-Za-z ]+$/.test(t)) return "Letters and spaces only — no numbers or special characters.";
        return "";
    },

    // Middle name (optional — only validated when provided)
    middleName(v) {
        if (!v || !v.trim()) return "";          // optional
        const t = v.trim();
        if (t.length < 2) return "Minimum 2 characters.";
        if (t.length > 20) return "Maximum 20 characters.";
        if (!/^[A-Z]/.test(t)) return "Must start with a capital letter.";
        if (!/^[A-Za-z ]+$/.test(t)) return "Letters and spaces only — no numbers or special characters.";
        return "";
    },

    // Date of birth
    dob(v) {
        if (!v) return "Date of birth is required.";
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const birth = new Date(v);
        if (isNaN(birth.getTime())) return "Invalid date format.";
        if (birth >= today) return "Date of birth cannot be today or in the future.";
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        if (age < 18) return "You must be at least 18 years old.";
        if (age > 80) return "Age must be 80 years old or below.";
        return "";
    },

    // Contact number
    contact(v) {
        if (!v) return "Contact number is required.";
        if (!/^\d+$/.test(v)) return "Numbers only — no spaces or dashes.";
        if (!v.startsWith("09")) return "Must start with 09.";
        if (v.length !== 11) return "Must be exactly 11 digits.";
        if (BLOCKED_CONTACTS.includes(v)) return "This is not a valid Philippine mobile number.";
        return "";
    },

    // Username
    username(v) {
        if (!v) return "Username is required.";
        if (v.length < 5) return "Minimum 5 characters.";
        if (v.length > 20) return "Maximum 20 characters.";
        if (!/^[A-Z]/.test(v)) return "Must start with a capital letter.";
        if (/\s/.test(v)) return "No spaces allowed.";
        if (!/^[A-Za-z0-9]+$/.test(v)) return "Letters and numbers only — no special characters or spaces.";
        return "";
    },

    // Email
    email(v) {
        if (!v) return "Email is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address (e.g. you@example.com).";
        const parts = v.split("@");
        const domain = parts[1] || "";
        if (!domain.includes(".")) return "Email domain is incomplete.";
        const tld = domain.split(".").pop().toLowerCase();
        const BAD = ["co", "cm", "om", "ne", "or"];
        if (tld.length < 2) return "Email domain extension is too short.";
        if (BAD.includes(tld)) return `.${tld} is not a complete domain. Did you mean .com?`;
        return "";
    },

    // Password
    password(v) {
        if (!v) return "Password is required.";
        if (v.length < 8) return "Minimum 8 characters.";
        if (!/[A-Za-z]/.test(v)) return "Must contain at least one letter.";
        if (!/[0-9]/.test(v)) return "Must contain at least one number.";
        if (!/[^A-Za-z0-9]/.test(v)) return "Must contain at least one special character (e.g. @, #, !).";
        return "";
    },

    // Required (address fields)
    required(v, label) {
        return !v || !String(v).trim() ? `${label} is required.` : "";
    },
};

// ── Helper: collect all validation errors into one object ─────────────────────
function validateRegistration(body) {
    const {
        firstName, middleName, lastName, dateOfBirth, contactNumber,
        region, province, city, barangay,
        username, email, password,
    } = body;

    const errs = {};

    const fn = V.name(firstName, "First name"); if (fn) errs.firstName = fn;
    const mn = V.middleName(middleName); if (mn) errs.middleName = mn;
    const ln = V.name(lastName, "Last name"); if (ln) errs.lastName = ln;
    const dob = V.dob(dateOfBirth); if (dob) errs.dateOfBirth = dob;
    const con = V.contact(contactNumber); if (con) errs.contactNumber = con;
    const reg = V.required(region, "Region"); if (reg) errs.region = reg;
    const prv = V.required(province, "Province"); if (prv) errs.province = prv;
    const cty = V.required(city, "City"); if (cty) errs.city = cty;
    const brg = V.required(barangay, "Barangay"); if (brg) errs.barangay = brg;
    const usr = V.username(username); if (usr) errs.username = usr;
    const eml = V.email(email); if (eml) errs.email = eml;
    const pw = V.password(password); if (pw) errs.password = pw;

    return errs;   // empty object = all valid
}


// ── REGISTER ──────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
    try {
        const {
            firstName, middleName, lastName, dateOfBirth, age, contactNumber,
            region, province, city, barangay, zipCode,
            regionName, provinceName, cityName, barangayName,
            username, email, password,
        } = req.body;

        // ── 1. Server-side validation ─────────────────────────────────────────
        const validationErrors = validateRegistration(req.body);
        if (Object.keys(validationErrors).length > 0) {
            return res.status(422).json({
                message: "Validation failed. Please correct the highlighted fields.",
                errors: validationErrors,
            });
        }

        // ── 2. Uniqueness checks ──────────────────────────────────────────────
        const [byUsername] = await pool.query(
            "SELECT id FROM users WHERE username = ?", [username]
        );
        if (byUsername.length > 0)
            return res.status(409).json({
                message: "Username is already taken.",
                errors: { username: "Username is already taken." },
            });

        const [byEmail] = await pool.query(
            "SELECT id FROM users WHERE email = ?", [email]
        );
        if (byEmail.length > 0)
            return res.status(409).json({
                message: "Email is already registered.",
                errors: { email: "Email is already registered." },
            });

        // ── 3. Hash password & insert ─────────────────────────────────────────
        const hashedPassword = await bcrypt.hash(password, 12);
        const joined = new Date().toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
        });

        const [result] = await pool.query(
            `INSERT INTO users
             (firstName, middleName, lastName, dateOfBirth, age, contactNumber,
              region, province, city, barangay, zipCode,
              regionName, provinceName, cityName, barangayName,
              username, email, password, role,
              isVerified, creditScore, riskLevel, joined)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,NULL,NULL,?)`,
            [
                firstName.trim(), middleName?.trim() || "", lastName.trim(),
                dateOfBirth, age, contactNumber,
                region || "", province || "", city || "", barangay || "", zipCode || "",
                regionName || "", provinceName || "", cityName || "", barangayName || "",
                username, email.toLowerCase(), hashedPassword, "User", joined,
            ]
        );

        // ── 4. Activity log ───────────────────────────────────────────────────
        await pool.query(
            "INSERT INTO activity_logs (userId, action, entity, entityId, detail, ipAddress) VALUES (?,?,?,?,?,?)",
            [result.insertId, "user.register", "user", result.insertId,
            JSON.stringify({ username, email }), getIP(req)]
        );

        // ── 5. Return created user (no password) ──────────────────────────────
        const [rows] = await pool.query(
            `SELECT id, firstName, middleName, lastName, dateOfBirth, age, contactNumber,
                    regionName, provinceName, cityName, barangayName, zipCode,
                    username, email, role, isVerified, creditScore, riskLevel, joined, createdAt
             FROM users WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({ message: "Account created successfully.", user: rows[0] });

    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};


// ── LOGIN ─────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
    const ip = getIP(req);
    const userAgent = req.headers["user-agent"] || null;

    try {
        const { username, password } = req.body;

        // ── Basic presence check ──────────────────────────────────────────────
        if (!username || !username.trim())
            return res.status(400).json({ message: "Username or email is required." });
        if (!password)
            return res.status(400).json({ message: "Password is required." });

        const identifier = username.trim().toLowerCase();

        // ── Rate-limit check ──────────────────────────────────────────────────
        const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
            .toISOString().slice(0, 19).replace("T", " ");

        const [recentFails] = await pool.query(
            `SELECT COUNT(*) AS cnt FROM login_attempts
             WHERE identifier = ? AND status = 'failed' AND attemptedAt >= ?`,
            [identifier, windowStart]
        );

        if (recentFails[0].cnt >= MAX_ATTEMPTS) {
            await pool.query(
                "INSERT INTO login_attempts (userId, identifier, status, failReason, ipAddress, userAgent) VALUES (?,?,?,?,?,?)",
                [null, identifier, "blocked", "too_many_attempts", ip, userAgent]
            );
            return res.status(429).json({
                message: `Too many failed attempts. Please try again after ${WINDOW_MINUTES} minutes.`,
                blocked: true,
            });
        }

        // ── Lookup user ───────────────────────────────────────────────────────
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            [identifier, identifier]
        );

        if (rows.length === 0) {
            await pool.query(
                "INSERT INTO login_attempts (userId, identifier, status, failReason, ipAddress, userAgent) VALUES (?,?,?,?,?,?)",
                [null, identifier, "failed", "user_not_found", ip, userAgent]
            );
            return res.status(401).json({ message: "Invalid username/email or password." });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            await pool.query(
                "INSERT INTO login_attempts (userId, identifier, status, failReason, ipAddress, userAgent) VALUES (?,?,?,?,?,?)",
                [user.id, identifier, "failed", "wrong_password", ip, userAgent]
            );
            const remaining = MAX_ATTEMPTS - (recentFails[0].cnt + 1);
            const message = remaining > 0
                ? `Invalid username/email or password. ${remaining} attempt(s) remaining.`
                : `Invalid username/email or password. You will be locked out on the next failure.`;
            return res.status(401).json({ message });
        }

        // ── Create session ────────────────────────────────────────────────────
        const token = generateToken();
        const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
            .toISOString().slice(0, 19).replace("T", " ");

        await pool.query(
            `INSERT INTO user_sessions (userId, token, ipAddress, userAgent, isActive, expiresAt, lastActivityAt)
             VALUES (?,?,?,?,1,?,NOW())`,
            [user.id, token, ip, userAgent, expiresAt]
        );

        await pool.query(
            "INSERT INTO login_attempts (userId, identifier, status, ipAddress, userAgent) VALUES (?,?,?,?,?)",
            [user.id, identifier, "success", ip, userAgent]
        );

        await pool.query("UPDATE users SET lastLoginAt = NOW() WHERE id = ?", [user.id]);

        await pool.query(
            "INSERT INTO activity_logs (userId, action, entity, entityId, ipAddress) VALUES (?,?,?,?,?)",
            [user.id, "user.login", "user", user.id, ip]
        );

        const [verRows] = await pool.query(
            "SELECT employmentStatus, occupation, monthlyIncome, existingLoans, idType, status FROM verifications WHERE userId = ?",
            [user.id]
        );

        const { password: _pw, ...userData } = user;

        res.status(200).json({
            message: "Login successful.",
            token,
            expiresAt,
            user: {
                ...userData,
                isVerified: Boolean(userData.isVerified),
                isActive: Boolean(userData.isActive),
                isBanned: Boolean(userData.isBanned),
                verification: verRows[0] || null,
            },
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};


// ── LOGOUT ────────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
    try {
        const token = req.headers["authorization"]?.replace("Bearer ", "");
        if (!token) return res.status(400).json({ message: "No token provided." });

        await pool.query(
            "UPDATE user_sessions SET isActive = 0 WHERE token = ?", [token]
        );

        res.status(200).json({ message: "Logged out successfully." });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "Server error." });
    }
};


// ── SUBMIT VERIFICATION ───────────────────────────────────────────────────────
export const submitVerification = async (req, res) => {
    try {
        const {
            userId,
            employmentStatus, occupation, monthlyIncome, existingLoans, yearsInBusiness,
            idType, idNumber,
            idFrontPath, idBackPath,
            creditScore, riskLevel,
        } = req.body;

        // ── Validation ────────────────────────────────────────────────────────
        const verErrors = {};

        if (!userId) verErrors.userId = "User ID is required.";
        if (!employmentStatus) verErrors.employmentStatus = "Employment status is required.";
        if (!occupation || !occupation.trim()) verErrors.occupation = "Occupation is required.";
        if (!monthlyIncome) verErrors.monthlyIncome = "Monthly income is required.";
        if (!idType) verErrors.idType = "ID type is required.";
        if (!idNumber || !String(idNumber).trim()) verErrors.idNumber = "ID number is required.";
        if (!creditScore || isNaN(Number(creditScore)))
            verErrors.creditScore = "A valid credit score is required.";
        if (!riskLevel) verErrors.riskLevel = "Risk level is required.";

        if (Object.keys(verErrors).length > 0)
            return res.status(422).json({
                message: "Validation failed.",
                errors: verErrors,
            });

        // ── Existence & duplicate checks ──────────────────────────────────────
        const [userRows] = await pool.query(
            "SELECT id, isVerified FROM users WHERE id = ?", [userId]
        );
        if (userRows.length === 0)
            return res.status(404).json({ message: "User not found." });
        if (userRows[0].isVerified)
            return res.status(409).json({ message: "User is already verified." });

        const status = creditScore >= 650 ? "approved" : "rejected";
        const maskedId = `****${String(idNumber).slice(-4)}`;

        await pool.query(
            `INSERT INTO verifications
             (userId, employmentStatus, occupation, monthlyIncome, existingLoans, yearsInBusiness,
              idType, idNumber, idFrontPath, idBackPath, creditScore, riskLevel, status)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE
               employmentStatus = VALUES(employmentStatus),
               occupation       = VALUES(occupation),
               monthlyIncome    = VALUES(monthlyIncome),
               existingLoans    = VALUES(existingLoans),
               yearsInBusiness  = VALUES(yearsInBusiness),
               idType           = VALUES(idType),
               idNumber         = VALUES(idNumber),
               idFrontPath      = VALUES(idFrontPath),
               idBackPath       = VALUES(idBackPath),
               creditScore      = VALUES(creditScore),
               riskLevel        = VALUES(riskLevel),
               status           = VALUES(status),
               updatedAt        = CURRENT_TIMESTAMP`,
            [
                userId,
                employmentStatus, occupation.trim(), monthlyIncome,
                Number(existingLoans) || 0, Number(yearsInBusiness) || 0,
                idType, maskedId,
                idFrontPath || null, idBackPath || null,
                creditScore, riskLevel, status,
            ]
        );

        await pool.query(
            `UPDATE users SET isVerified = ?, creditScore = ?, riskLevel = ?, verifiedAt = NOW() WHERE id = ?`,
            [status === "approved" ? 1 : 0, creditScore, riskLevel, userId]
        );

        const notifTitle = status === "approved" ? "Verification Approved" : "Verification Rejected";
        const notifMessage = status === "approved"
            ? `Your account has been verified. Credit score: ${creditScore} (${riskLevel}).`
            : `Your verification was rejected. Credit score: ${creditScore} (${riskLevel}). You may reapply after 3 months.`;
        const notifType = status === "approved" ? "verification_approved" : "verification_rejected";

        await pool.query(
            "INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)",
            [userId, notifTitle, notifMessage, notifType]
        );

        await pool.query(
            "INSERT INTO activity_logs (userId, action, entity, entityId, detail, ipAddress) VALUES (?,?,?,?,?,?)",
            [userId, "user.verify", "verification", userId,
                JSON.stringify({ creditScore, riskLevel, status }), getIP(req)]
        );

        const [updatedRows] = await pool.query(
            "SELECT id, firstName, lastName, username, email, role, isVerified, creditScore, riskLevel, verifiedAt FROM users WHERE id = ?",
            [userId]
        );

        res.status(200).json({
            message: status === "approved" ? "Verification approved." : "Verification rejected — high risk.",
            status, creditScore, riskLevel,
            user: { ...updatedRows[0], isVerified: Boolean(updatedRows[0].isVerified) },
        });

    } catch (err) {
        console.error("Verification error:", err);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};


// ── GET USER PROFILE ──────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id)))
            return res.status(400).json({ message: "Invalid user ID." });

        const [rows] = await pool.query(
            `SELECT id, firstName, middleName, lastName, dateOfBirth, age, contactNumber,
                    regionName, provinceName, cityName, barangayName, zipCode,
                    username, email, role, isVerified, creditScore, riskLevel,
                    joined, lastLoginAt, createdAt
             FROM users WHERE id = ?`,
            [id]
        );

        if (rows.length === 0)
            return res.status(404).json({ message: "User not found." });

        const [verRows] = await pool.query(
            "SELECT employmentStatus, occupation, monthlyIncome, existingLoans, idType, creditScore, riskLevel, status, submittedAt FROM verifications WHERE userId = ?",
            [id]
        );

        res.status(200).json({
            user: {
                ...rows[0],
                isVerified: Boolean(rows[0].isVerified),
                verification: verRows[0] || null,
            },
        });

    } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ message: "Server error." });
    }
};