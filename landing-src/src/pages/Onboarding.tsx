import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Check, Copy, ExternalLink, Sparkles } from "lucide-react";

function generateBetterAuthSecret() {
  try {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    let binary = "";
    const len = array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(array[i]);
    }
    return window.btoa(binary);
  } catch (e) {
    return "secret_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export default function Onboarding() {
  // Onboarding States
  const [tursoUrl, setTursoUrl] = useState("");
  const [tursoToken, setTursoToken] = useState("");
  const [betterAuthSecret, setBetterAuthSecret] = useState("");
  const [betterAuthUrl, setBetterAuthUrl] = useState("http://localhost:3000");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  const [resendApiKey, setResendApiKey] = useState("");
  const [resendFrom, setResendFrom] = useState("My Store <onboarding@resend.dev>");
  const [publicBlobToken, setPublicBlobToken] = useState("");
  const [privateBlobToken, setPrivateBlobToken] = useState("");
  const [appUrl, setAppUrl] = useState("http://localhost:3000");

  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  // Generate Better Auth Secret once on mount
  useEffect(() => {
    setBetterAuthSecret(generateBetterAuthSecret());
  }, []);

  const steps = [
    { name: "Database", desc: "Turso SQLite" },
    { name: "Authentication", desc: "Better Auth" },
    { name: "Payments", desc: "Stripe Checkout" },
    { name: "Email", desc: "Resend Delivery" },
    { name: "File Storage", desc: "Vercel Blob" },
    { name: "Export", desc: "Get .env.local" },
  ];

  const envContent = `# Database (Turso)
TURSO_DATABASE_URL=${tursoUrl || "libsql://your-db.turso.io"}
TURSO_AUTH_TOKEN=${tursoToken || "your-turso-auth-token"}

# Auth (Better Auth)
BETTER_AUTH_SECRET=${betterAuthSecret}
BETTER_AUTH_URL=${betterAuthUrl}

# Stripe
STRIPE_SECRET_KEY=${stripeSecretKey || "sk_test_..."}
STRIPE_WEBHOOK_SECRET=${stripeWebhookSecret || "whsec_..."}

# Email (Resend)
RESEND_API_KEY=${resendApiKey || "re_..."}
RESEND_FROM_EMAIL=${resendFrom}

# Vercel Blob — public store (product images)
PUBLIC_BLOB_READ_WRITE_TOKEN=${publicBlobToken || "vercel_blob_rw_..."}

# Vercel Blob — private store (download files)
PRIVATE_BLOB_READ_WRITE_TOKEN=${privateBlobToken || "vercel_blob_rw_..."}

# App
APP_URL=${appUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyText = (text: string, callbackStateSetter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    callbackStateSetter(true);
    setTimeout(() => callbackStateSetter(false), 1500);
  };

  const [copiedKey, setCopiedKey] = useState(false);

  return (
    <div
      style={{
        fontFamily: "'Geist', sans-serif",
        color: "oklch(0.12 0 0)",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Header */}
      <header
        style={{
          height: "64px",
          borderBottom: "1px solid oklch(0.88 0 0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            to="/"
            style={{
              background: "transparent",
              border: "none",
              textDecoration: "none",
              cursor: "pointer",
              padding: "8px 12px 8px 8px",
              display: "flex",
              alignItems: "center",
              color: "oklch(0.48 0 0)",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.12 0 0)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.48 0 0)")}
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            <span style={{ marginLeft: "4px", fontSize: "0.875rem", fontWeight: 500 }}>Back</span>
          </Link>
          <div style={{ width: "1px", height: "16px", backgroundColor: "oklch(0.88 0 0)" }} />
          <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Payshelf Configuration</span>
        </div>
        <span style={{ fontSize: "0.8125rem", color: "oklch(0.48 0 0)", fontWeight: 500 }}>
          Step {activeStep + 1} of {steps.length}
        </span>
      </header>

      {/* Content Container */}
      <div style={{ flex: 1, display: "flex" }}>
        {/* Left Sidebar Steps */}
        <aside
          style={{
            width: "280px",
            borderRight: "1px solid oklch(0.88 0 0)",
            backgroundColor: "oklch(0.98 0 0)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {steps.map((step, idx) => {
            const isActive = idx === activeStep;
            const isCompleted = idx < activeStep;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                style={{
                  background: isActive ? "oklch(0.93 0 0)" : "transparent",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "oklch(0.96 0 0)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: isActive
                      ? "oklch(0.12 0 0)"
                      : isCompleted
                      ? "oklch(0.2 0.1 140)"
                      : "oklch(0.88 0 0)",
                    color: isActive
                      ? "#ffffff"
                      : isCompleted
                      ? "#ffffff"
                      : "oklch(0.48 0 0)",
                  }}
                >
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : idx + 1}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "oklch(0.12 0 0)" : "oklch(0.3 0 0)",
                    }}
                  >
                    {step.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "oklch(0.48 0 0)" }}>{step.desc}</div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Main Panel */}
        <main style={{ flex: 1, padding: "48px max(24px, 6%)", overflowY: "auto" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            {activeStep === 0 && (
              <div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "8px", letterSpacing: "-0.02em" }}>
                  Set up Turso Database
                </h2>
                <p style={{ color: "oklch(0.48 0 0)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "24px" }}>
                  Payshelf uses Turso (a serverless SQLite database) to store products, users, sessions, and order history. Follow these steps to configure your database:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "28px" }}>
                  <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                    <strong style={{ display: "block", marginBottom: "6px" }}>Option A: Turso Dashboard (Web)</strong>
                    <ol style={{ margin: "0 0 0 20px", padding: 0, color: "oklch(0.3 0 0)" }}>
                      <li>Go to <a href="https://turso.tech" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>turso.tech</a> and create a free account.</li>
                      <li>Click <strong>Create Database</strong>, name it <code>payshelf</code>, and select your nearest region.</li>
                      <li>Click <strong>Connect</strong> to view your database connection string (begins with <code>libsql://</code>) and paste it below.</li>
                      <li>In the connect drawer or under the <strong>Tokens</strong> tab, click <strong>Generate Token</strong> and paste it below.</li>
                    </ol>
                  </div>

                  <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                    <strong style={{ display: "block", marginBottom: "6px" }}>Option B: Turso CLI</strong>
                    <ol style={{ margin: "0 0 0 20px", padding: 0, color: "oklch(0.3 0 0)" }}>
                      <li>Install the CLI: <code>curl -sSfL https://get.tur.so/install.sh | bash</code></li>
                      <li>Authenticate: <code>turso auth login</code></li>
                      <li>Create the database: <code>turso db create payshelf</code></li>
                      <li>Retrieve connection URL: <code>turso db show payshelf</code></li>
                      <li>Create auth token: <code>turso db tokens create payshelf</code></li>
                    </ol>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      Turso Database URL (TURSO_DATABASE_URL)
                    </label>
                    <input
                      type="text"
                      placeholder="libsql://your-db-name.turso.io"
                      value={tursoUrl}
                      onChange={(e) => setTursoUrl(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid oklch(0.88 0 0)",
                        fontFamily: "inherit",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      Turso Auth Token (TURSO_AUTH_TOKEN)
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOi..."
                      value={tursoToken}
                      onChange={(e) => setTursoToken(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid oklch(0.88 0 0)",
                        fontFamily: "inherit",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "8px", letterSpacing: "-0.02em" }}>
                  Configure Better Auth
                </h2>
                <p style={{ color: "oklch(0.48 0 0)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "24px" }}>
                  Better Auth secures your dashboard login, sessions, and seller routes.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "28px", fontSize: "0.9rem", lineHeight: "1.6" }}>
                  <ol style={{ margin: "0 0 0 20px", padding: 0, color: "oklch(0.3 0 0)" }}>
                    <li><strong>Secret Key</strong>: We have pre-filled a high-entropy 32-byte Base64 key. Keep it secret.</li>
                    <li><strong>Auth URL</strong>: The backend URL where Better Auth handles API requests. For local development, keep it as <code>http://localhost:3000</code>. In production, change this to your deployed domain.</li>
                  </ol>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      Generated Secret Key (BETTER_AUTH_SECRET)
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        readOnly
                        value={betterAuthSecret}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid oklch(0.88 0 0)",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          backgroundColor: "oklch(0.98 0 0)",
                        }}
                      />
                      <button
                        onClick={() => copyText(betterAuthSecret, setCopiedKey)}
                        style={{
                          padding: "10px 16px",
                          borderRadius: "8px",
                          border: "1px solid oklch(0.88 0 0)",
                          backgroundColor: "#ffffff",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "background 0.2s",
                        }}
                      >
                        {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                        {copiedKey ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      Better Auth URL (BETTER_AUTH_URL)
                    </label>
                    <input
                      type="text"
                      value={betterAuthUrl}
                      onChange={(e) => setBetterAuthUrl(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid oklch(0.88 0 0)",
                        fontFamily: "inherit",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "8px", letterSpacing: "-0.02em" }}>
                  Set up Stripe Payments & Webhooks
                </h2>
                <p style={{ color: "oklch(0.48 0 0)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "20px" }}>
                  Connect to Stripe to authorize purchases. Enable **Test Mode** in your Stripe dashboard to perform test checkouts.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "28px" }}>
                  <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                    <strong style={{ display: "block", marginBottom: "6px" }}>1. Retrieve API Keys</strong>
                    <ol style={{ margin: "0 0 0 20px", padding: 0, color: "oklch(0.3 0 0)" }}>
                      <li>Log in to the <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>Stripe Dashboard</a> and turn on **Test Mode** (top right).</li>
                      <li>Go to <strong>Developers → API keys</strong>.</li>
                      <li>Copy the <strong>Secret Key</strong> (starts with <code>sk_test_...</code>) and paste it into the secret key field below.</li>
                    </ol>
                  </div>

                  <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                    <strong style={{ display: "block", marginBottom: "6px" }}>2. Configure Webhooks</strong>
                    <p style={{ margin: "0 0 8px 0", color: "oklch(0.3 0 0)" }}>
                      Webhooks notify Payshelf of purchase events so it can deliver files and revoke access.
                    </p>
                    <div style={{ paddingLeft: "12px", borderLeft: "2px solid oklch(0.88 0 0)", color: "oklch(0.4 0 0)", fontSize: "0.85rem", marginBottom: "12px" }}>
                      <strong>Required Webhook Scopes / Event Listeners:</strong>
                      <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                        <li><code>checkout.session.completed</code> — fires when checkouts succeed to trigger email delivery</li>
                        <li><code>charge.refunded</code> — revokes customer access when a refund occurs</li>
                        <li><code>charge.dispute.created</code> — immediately suspends customer access on dispute or chargeback</li>
                      </ul>
                    </div>

                    <ol style={{ margin: "0 0 0 20px", padding: 0, color: "oklch(0.3 0 0)" }}>
                      <li><strong>Local Development</strong>: Install Stripe CLI, run <code>stripe login</code>, then run <code>stripe listen --forward-to localhost:3000/api/stripe/webhook</code>. Copy the printed webhook signing secret (starts with <code>whsec_...</code>) and paste it below.</li>
                      <li><strong>Production Webhook</strong>: In Stripe Developers → Webhooks, click <strong>Add endpoint</strong>. Set Endpoint URL to <code>https://your-domain.com/api/stripe/webhook</code>. Select the 3 required events listed above, add the endpoint, then reveal and copy the Signing Secret.</li>
                    </ol>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Stripe Secret Key (STRIPE_SECRET_KEY)</label>
                      <a
                        href="https://dashboard.stripe.com/test/apikeys"
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: "0.8125rem", color: "oklch(0.48 0 0)", textDecoration: "underline", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        Go to API Keys <ExternalLink size={12} />
                      </a>
                    </div>
                    <input
                      type="password"
                      placeholder="sk_test_..."
                      value={stripeSecretKey}
                      onChange={(e) => setStripeSecretKey(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid oklch(0.88 0 0)",
                        fontFamily: "inherit",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Stripe Webhook Secret (STRIPE_WEBHOOK_SECRET)</label>
                      <a
                        href="https://dashboard.stripe.com/test/webhooks"
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: "0.8125rem", color: "oklch(0.48 0 0)", textDecoration: "underline", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        Go to Webhooks <ExternalLink size={12} />
                      </a>
                    </div>
                    <input
                      type="password"
                      placeholder="whsec_..."
                      value={stripeWebhookSecret}
                      onChange={(e) => setStripeWebhookSecret(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid oklch(0.88 0 0)",
                        fontFamily: "inherit",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "8px", letterSpacing: "-0.02em" }}>
                  Configure Resend Email
                </h2>
                <p style={{ color: "oklch(0.48 0 0)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "24px" }}>
                  Resend manages emailing magic download links and receipt confirmations to customers on successful orders.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "28px", fontSize: "0.9rem", lineHeight: "1.6" }}>
                  <ol style={{ margin: "0 0 0 20px", padding: 0, color: "oklch(0.3 0 0)" }}>
                    <li>Create an account on <a href="https://resend.com" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>resend.com</a>.</li>
                    <li>Go to the <strong>API Keys</strong> page, click <strong>Create API Key</strong> with <strong>Sending</strong> permissions, copy it, and paste below.</li>
                    <li><strong>Sender Address</strong>: Until you verify a custom domain under the <strong>Domains</strong> tab on Resend, you must use <code>onboarding@resend.dev</code> as the sender domain (e.g. <code>My Shop &lt;onboarding@resend.dev&gt;</code>).</li>
                  </ol>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Resend API Key (RESEND_API_KEY)</label>
                      <a
                        href="https://resend.com/api-keys"
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: "0.8125rem", color: "oklch(0.48 0 0)", textDecoration: "underline", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        Go to Resend API Keys <ExternalLink size={12} />
                      </a>
                    </div>
                    <input
                      type="password"
                      placeholder="re_..."
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid oklch(0.88 0 0)",
                        fontFamily: "inherit",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      Sender Email (RESEND_FROM_EMAIL)
                    </label>
                    <input
                      type="text"
                      value={resendFrom}
                      onChange={(e) => setResendFrom(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid oklch(0.88 0 0)",
                        fontFamily: "inherit",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "8px", letterSpacing: "-0.02em" }}>
                  Set up Vercel Blob Storage
                </h2>
                <p style={{ color: "oklch(0.48 0 0)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "24px" }}>
                  Payshelf uses two distinct Vercel Blob stores to separate publicly readable assets from private user download content:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "28px", fontSize: "0.9rem", lineHeight: "1.6" }}>
                  <ol style={{ margin: "0 0 0 20px", padding: 0, color: "oklch(0.3 0 0)" }}>
                    <li>Open your project dashboard in Vercel. Go to the <strong>Storage</strong> tab.</li>
                    <li>Click <strong>Create Database</strong> and select <strong>Blob</strong>.</li>
                    <li><strong>Public Store</strong>: Create a store named <code>payshelf-public</code>. Once initialized, go to Settings, copy the <code>BLOB_READ_WRITE_TOKEN</code>, and paste it as the Public Token below.</li>
                    <li><strong>Private Store</strong>: Create a second store named <code>payshelf-private</code>. Copy its <code>BLOB_READ_WRITE_TOKEN</code> and paste it as the Private Token below.</li>
                  </ol>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      Public Blob Token (PUBLIC_BLOB_READ_WRITE_TOKEN)
                    </label>
                    <input
                      type="text"
                      placeholder="vercel_blob_rw_..."
                      value={publicBlobToken}
                      onChange={(e) => setPublicBlobToken(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid oklch(0.88 0 0)",
                        fontFamily: "inherit",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      Private Blob Token (PRIVATE_BLOB_READ_WRITE_TOKEN)
                    </label>
                    <input
                      type="text"
                      placeholder="vercel_blob_rw_..."
                      value={privateBlobToken}
                      onChange={(e) => setPrivateBlobToken(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid oklch(0.88 0 0)",
                        fontFamily: "inherit",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 5 && (() => {
              const defaultsObj = {
                TURSO_DATABASE_URL: tursoUrl,
                TURSO_AUTH_TOKEN: tursoToken,
                BETTER_AUTH_SECRET: betterAuthSecret,
                BETTER_AUTH_URL: betterAuthUrl,
                STRIPE_SECRET_KEY: stripeSecretKey,
                STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
                RESEND_API_KEY: resendApiKey,
                RESEND_FROM_EMAIL: resendFrom,
                PUBLIC_BLOB_READ_WRITE_TOKEN: publicBlobToken,
                PRIVATE_BLOB_READ_WRITE_TOKEN: privateBlobToken,
                APP_URL: appUrl
              };
              const envDefaultsString = encodeURIComponent(JSON.stringify(defaultsObj));
              const vercelDeployUrl = `https://vercel.com/new/clone?repository-url=https://github.com/ksawery29/payshelf&root-directory=store-src&env=TURSO_DATABASE_URL,TURSO_AUTH_TOKEN,BETTER_AUTH_SECRET,BETTER_AUTH_URL,STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET,RESEND_API_KEY,RESEND_FROM_EMAIL,PUBLIC_BLOB_READ_WRITE_TOKEN,PRIVATE_BLOB_READ_WRITE_TOKEN,APP_URL&envDefaults=${envDefaultsString}`;

              return (
                <div>
                  <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "8px", letterSpacing: "-0.02em" }}>
                    Export your .env.local
                  </h2>
                  <p style={{ color: "oklch(0.48 0 0)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "24px" }}>
                    Copy the configuration below and save it as <code>.env.local</code> in your project root, or deploy directly to Vercel with all your configured variables pre-filled:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                          Store App URL
                        </label>
                        <input
                          type="text"
                          value={appUrl}
                          onChange={(e) => setAppUrl(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid oklch(0.88 0 0)",
                            fontFamily: "inherit",
                            fontSize: "0.9rem",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                      <a
                        href={vercelDeployUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          height: "40px",
                          boxSizing: "border-box",
                          backgroundColor: "#000000",
                          color: "#ffffff",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "8px",
                          padding: "0 20px",
                          fontFamily: "'Geist', sans-serif",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#222222";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#000000";
                        }}
                      >
                        <svg width="14" height="12" viewBox="0 0 116 100" fill="currentColor">
                          <path d="M57.5 0L115 100H0L57.5 0Z" />
                        </svg>
                        Deploy to Vercel
                      </a>
                    </div>

                    <div style={{ position: "relative", marginTop: "12px" }}>
                    <pre
                      style={{
                        backgroundColor: "oklch(0.98 0 0)",
                        border: "1px solid oklch(0.88 0 0)",
                        borderRadius: "8px",
                        padding: "20px",
                        fontFamily: "monospace",
                        fontSize: "0.8125rem",
                        overflowX: "auto",
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {envContent}
                    </pre>
                    <button
                      onClick={copyToClipboard}
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "1px solid oklch(0.85 0 0)",
                        backgroundColor: "#ffffff",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied!" : "Copy config"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

            {/* Navigation Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "40px",
                paddingTop: "24px",
                borderTop: "1px solid oklch(0.88 0 0)",
              }}
            >
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid oklch(0.88 0 0)",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  opacity: activeStep === 0 ? 0.4 : 1,
                  pointerEvents: activeStep === 0 ? "none" : "auto",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "oklch(0.98 0 0)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
              >
                Previous
              </button>
              {activeStep < steps.length - 1 ? (
                <button
                  onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "oklch(0.12 0 0)",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(24, 24, 27, 0.9)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "oklch(0.12 0 0)")}
                >
                  Next Step
                </button>
              ) : (
                <Link
                  to="/"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "oklch(0.2 0.1 140)",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "oklch(0.18 0.08 140)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "oklch(0.2 0.1 140)")}
                >
                  <Sparkles size={14} />
                  Finish Setup
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
