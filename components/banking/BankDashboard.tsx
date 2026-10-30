"use client";

import { ChangeEvent, FormEvent, useMemo, useRef, useState, useSyncExternalStore } from "react";
import "./bank-dashboard.css";

type CardCode = "BOA" | "GAB" | "DTB";
type Currency = "USD" | "KES";
type Statement = {
  id: string;
  card: CardCode;
  name: string;
  category: string;
  amount: number;
  direction: "credit" | "debit";
  currency: Currency;
  date: string;
};

const cardCodes: CardCode[] = ["BOA", "GAB", "DTB"];
const statementStorageKey = "ratl-diary-statement-entries";
const themeStorageKey = "ratl-diary-theme";
const backupFormat = "ratl-diary-local-backup";
const backupVersion = 1;
const initialStatements: Statement[] = [];
const serverStatementSnapshot = JSON.stringify(initialStatements);

function subscribeToStatements(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("ratl-diary-statements-changed", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("ratl-diary-statements-changed", onStoreChange);
  };
}

function getStatementSnapshot() {
  try {
    return window.localStorage.getItem(statementStorageKey) ?? serverStatementSnapshot;
  } catch {
    return serverStatementSnapshot;
  }
}

function getServerStatementSnapshot() {
  return serverStatementSnapshot;
}

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("ratl-diary-theme-changed", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("ratl-diary-theme-changed", onStoreChange);
  };
}

function getThemeSnapshot() {
  try {
    return window.localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function getServerThemeSnapshot() {
  return "light";
}

function isCardCode(value: unknown): value is CardCode {
  return cardCodes.some((card) => card === value);
}

function isCurrency(value: unknown): value is Currency {
  return value === "USD" || value === "KES";
}

function hasRequiredCards(value: unknown): value is CardCode[] {
  return Array.isArray(value)
    && value.length === cardCodes.length
    && value.every(isCardCode)
    && cardCodes.every((card) => value.includes(card));
}

function parseStatements(snapshot: string): Statement[] {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!Array.isArray(parsed)) return initialStatements;
    return parsed.filter((value): value is Statement => {
      if (!value || typeof value !== "object") return false;
      const statement = value as Record<string, unknown>;
      return typeof statement.id === "string"
        && isCardCode(statement.card)
        && typeof statement.name === "string"
        && typeof statement.category === "string"
        && typeof statement.amount === "number"
        && Number.isFinite(statement.amount)
        && (statement.direction === "credit" || statement.direction === "debit")
        && (statement.currency === undefined || isCurrency(statement.currency))
        && typeof statement.date === "string";
    }).map((statement) => ({
      ...statement,
      currency: isCurrency((statement as Record<string, unknown>).currency)
        ? (statement as Record<string, unknown>).currency as Currency
        : statement.card === "BOA" ? "USD" : "KES",
    }));
  } catch {
    return initialStatements;
  }
}

type IconName =
  | "overview"
  | "wallet"
  | "card"
  | "search"
  | "chevron"
  | "arrow-up"
  | "arrow-down"
  | "plus"
  | "download"
  | "upload";

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2.5" /><path d="M3 9h18M16 14h.01" /><path d="M6 5V4a2 2 0 0 1 2-2h10" /></>,
    card: <><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="M3 9h18M7 15h3" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
    chevron: <path d="m7 10 5 5 5-5" />,
    "arrow-up": <><path d="M12 19V5M6 11l6-6 6 6" /></>,
    "arrow-down": <><path d="M12 5v14m6-6-6 6-6-6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 17v4h14v-4" /></>,
    upload: <><path d="M12 16V4m-5 5 5-5 5 5" /><path d="M5 17v4h14v-4" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const navigation: { label: string; icon: IconName }[] = [
  { label: "Overview", icon: "overview" },
  { label: "My cards", icon: "card" },
  { label: "Statements", icon: "wallet" },
  { label: "Local backup", icon: "download" },
];

export default function BankDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [favoriteCar, setFavoriteCar] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginStep, setLoginStep] = useState<"password" | "question">("password");
  const [loginPending, setLoginPending] = useState(false);
  const [activePage, setActivePage] = useState("Overview");
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardCode | "all">("all");
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const importInput = useRef<HTMLInputElement>(null);
  const statementSnapshot = useSyncExternalStore(subscribeToStatements, getStatementSnapshot, getServerStatementSnapshot);
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
  const statements = useMemo(() => parseStatements(statementSnapshot), [statementSnapshot]);

  const filteredStatements = useMemo(() => statements
    .filter((statement) => selectedCard === "all" || statement.card === selectedCard)
    .filter((statement) => `${statement.name} ${statement.category} ${statement.card} ${statement.direction} ${statement.date}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((first, second) => second.date.localeCompare(first.date)), [search, selectedCard, statements]);
  const totals = useMemo(() => (["USD", "KES"] as const).map((currency) => {
    const entries = statements.filter((statement) => statement.currency === currency);
    return {
      currency,
      credits: entries.filter((statement) => statement.direction === "credit").reduce((sum, statement) => sum + statement.amount, 0),
      debits: entries.filter((statement) => statement.direction === "debit").reduce((sum, statement) => sum + statement.amount, 0),
    };
  }), [statements]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loginStep === "password") {
      if (!password) {
        setLoginError("Enter your password to continue.");
        return;
      }
      setLoginError("");
      setLoginStep("question");
      return;
    }
    if (!favoriteCar.trim()) {
      setLoginError("Answer your security question to continue.");
      return;
    }

    setLoginPending(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, favoriteCar }),
      });
      const result = await response.json() as {
        authenticated?: boolean;
        error?: string;
        notificationSent?: boolean;
        notificationStatus?: "not_configured" | "send_failed";
      };
      if (!response.ok || !result.authenticated) {
        setLoginError(result.error || "Login failed. Please try again.");
        if (response.status === 429) setLoginStep("password");
        return;
      }
      setLoginError("");
      setIsAuthenticated(true);
      if (result.notificationSent) showToast("Login alert sent to ratlstores1@gmail.com.");
      else if (result.notificationStatus === "not_configured") showToast("Login alert not sent: configure email settings on this device.");
      else showToast("Signed in, but the login alert could not be sent.");
    } catch {
      setLoginError("Could not verify login. Check your connection and try again.");
    } finally {
      setLoginPending(false);
    }
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(themeStorageKey, nextTheme);
      window.dispatchEvent(new Event("ratl-diary-theme-changed"));
    } catch {
      showToast("Theme preference could not be saved in this browser.");
    }
  }

  function submitStatement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const card = formData.get("card");
    const direction = formData.get("direction");
    const name = formData.get("name");
    const category = formData.get("category");
    const currency = formData.get("currency");
    const amount = Number(formData.get("amount"));
    const date = formData.get("date");
    if (!isCardCode(card) || !isCurrency(currency) || (direction !== "credit" && direction !== "debit") || typeof name !== "string" || !name.trim() || typeof category !== "string" || !category.trim() || typeof date !== "string" || !Number.isFinite(amount) || amount <= 0) {
      showToast("Enter a card, description, date, and amount greater than zero.");
      return;
    }

    const nextStatements = [{
      id: `${Date.now()}`,
      card,
      name: name.trim(),
      category: category.trim(),
      amount,
      direction,
      currency,
      date,
    }, ...statements];
    try {
      window.localStorage.setItem(statementStorageKey, JSON.stringify(nextStatements));
      window.dispatchEvent(new Event("ratl-diary-statements-changed"));
    } catch {
      showToast("Your browser could not save this statement entry. Please check storage settings and try again.");
      return;
    }
    setSelectedCard(card);
    setSearch("");
    setModal(false);
    showToast(`${direction === "credit" ? "Credit" : "Debit"} added to your ${card} statement.`);
  }

  function exportBackup() {
    try {
      const backup = {
        format: backupFormat,
        version: backupVersion,
        exportedAt: new Date().toISOString(),
        cards: cardCodes,
        theme,
        statements,
      };
      const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `ratl-diary-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("Local backup exported.");
    } catch {
      showToast("Backup export failed. Please try again.");
    }
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const backup: unknown = JSON.parse(await file.text());
      if (!backup || typeof backup !== "object") throw new Error("The selected file is not a RATL DIARY backup.");
      const data = backup as Record<string, unknown>;
      if (file.size > 5_000_000) throw new Error("Backup files must be smaller than 5 MB.");
      if (data.format !== backupFormat || data.version !== backupVersion || !Array.isArray(data.statements) || !hasRequiredCards(data.cards)) {
        throw new Error("This file is not a supported RATL DIARY backup.");
      }
      if (data.statements.length > 10000) throw new Error("This backup contains too many statement entries.");
      const entries: Statement[] = [];
      for (const raw of data.statements) {
        if (!raw || typeof raw !== "object") throw new Error("Backup contains an invalid statement entry.");
        const row = raw as Record<string, unknown>;
        if (
          typeof row.id !== "string"
          || !isCardCode(row.card)
          || typeof row.name !== "string"
          || !row.name.trim()
          || typeof row.category !== "string"
          || typeof row.amount !== "number"
          || !Number.isFinite(row.amount)
          || row.amount <= 0
          || (row.direction !== "credit" && row.direction !== "debit")
          || (row.currency !== undefined && !isCurrency(row.currency))
          || typeof row.date !== "string"
          || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)
          || Number.isNaN(Date.parse(`${row.date}T00:00:00.000Z`))
          || new Date(`${row.date}T00:00:00.000Z`).toISOString().slice(0, 10) !== row.date
        ) throw new Error("Backup contains an invalid statement entry.");
        entries.push({
          id: row.id,
          card: row.card,
          name: row.name,
          category: row.category,
          amount: row.amount,
          direction: row.direction,
          currency: isCurrency(row.currency) ? row.currency : row.card === "BOA" ? "USD" : "KES",
          date: row.date,
        });
      }
      if (!window.confirm(`Replace your current ${statements.length} entries with ${entries.length} imported entries? Export a backup first if you want to keep the current data.`)) return;
      window.localStorage.setItem(statementStorageKey, JSON.stringify(entries));
      if (data.theme === "dark" || data.theme === "light") window.localStorage.setItem(themeStorageKey, data.theme);
      window.dispatchEvent(new Event("ratl-diary-statements-changed"));
      window.dispatchEvent(new Event("ratl-diary-theme-changed"));
      setSelectedCard("all");
      setSearch("");
      showToast(`Restored ${entries.length} statement ${entries.length === 1 ? "entry" : "entries"}.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Backup import failed. Please check the file and try again.");
    } finally {
      event.target.value = "";
    }
  }

  if (!isAuthenticated) {
    return (
      <main className={`ratl-login${theme === "dark" ? " theme-dark" : ""}`}>
        <form className="ratl-login-card" onSubmit={signIn}>
          <button className="theme-toggle login-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} aria-pressed={theme === "dark"}>
            <span className="theme-toggle-track"><span className="theme-toggle-thumb" /></span>
            <span className="theme-toggle-label">{theme === "dark" ? "Dark" : "Light"}</span>
          </button>
          <div className="ratl-login-mark">RD</div>
          <div className="ratl-login-brand">RATL DIARY</div>
          <h1>Welcome back, HUSSAM</h1>
          <p>{loginStep === "password" ? "Enter your password to continue." : "Answer your security question to continue."}</p>
          <label className="ratl-password-label" htmlFor="ratl-login-answer">{loginStep === "password" ? "Password" : "What is your favorite car?"}</label>
          <input autoFocus id="ratl-login-answer" type={loginStep === "password" ? "password" : "text"} autoComplete="off" value={loginStep === "password" ? password : favoriteCar} onChange={(event) => loginStep === "password" ? setPassword(event.target.value) : setFavoriteCar(event.target.value)} placeholder={loginStep === "password" ? "Enter password" : "Your answer"} />
          {loginError && <span className="ratl-login-error" role="alert">{loginError}</span>}
          <button className="primary-button ratl-login-submit" type="submit" disabled={loginPending}>{loginPending ? "Checking..." : loginStep === "password" ? "Continue" : "Open RATL DIARY"}</button>
        </form>
      </main>
    );
  }

  return (
    <div className={`bank-app${theme === "dark" ? " theme-dark" : ""}`}>
      <aside className="bank-sidebar">
        <a className="bank-brand" href="#overview" aria-label="RATL DIARY home">
          <span className="brand-mark"><span /></span>
          <span>RATL DIARY</span>
        </a>

        <div className="sidebar-label">YOUR MONEY</div>
        <nav className="bank-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              className={`bank-nav-item${activePage === item.label ? " is-active" : ""}`}
              key={item.label}
              onClick={() => {
                setActivePage(item.label);
                if (item.label === "My cards") document.getElementById("bank-cards")?.scrollIntoView({ behavior: "smooth" });
                if (item.label === "Statements") document.getElementById("statement-timeline")?.scrollIntoView({ behavior: "smooth" });
                if (item.label === "Local backup") document.getElementById("local-backup")?.scrollIntoView({ behavior: "smooth" });
              }}
              type="button"
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="profile-avatar">HU</div>
            <div className="profile-copy"><strong>HUSSAM</strong><span>Personal account</span></div>
          </div>
        </div>
      </aside>

      <main className="bank-main" id="overview">
        <header className="bank-topbar">
          <div className="mobile-brand"><span className="brand-mark"><span /></span> RATL DIARY</div>
          <label className="search-box">
            <Icon name="search" size={18} />
            <input aria-label="Search statements" placeholder="Search statements..." value={search} onChange={(event) => setSearch(event.target.value)} />
            <kbd>Search</kbd>
          </label>
          <div className="topbar-actions">
            <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} aria-pressed={theme === "dark"}>
              <span className="theme-toggle-track"><span className="theme-toggle-thumb" /></span>
              <span className="theme-toggle-label">{theme === "dark" ? "Dark" : "Light"}</span>
            </button>
            <button className="topbar-avatar" aria-label="HUSSAM" type="button">HU</button>
          </div>
        </header>

        <div className="bank-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">{new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()).toUpperCase()}</div>
              <h1>{activePage === "Overview" ? "Good morning, HUSSAM" : activePage}<span className="wave">✳</span></h1>
              <p className="welcome-subtitle">Your personal card and statement diary.</p>
            </div>
            <button className="primary-button" onClick={() => setModal(true)} type="button"><Icon name="plus" size={17} /> Add entry</button>
          </section>

          <section className="overview-grid summary-grid" aria-label="Statement summary">
            {totals.map(({ currency, credits, debits }) => (
              <article className="summary-card" key={currency}>
                <span>{currency === "USD" ? "US DOLLAR" : "KENYAN SHILLING"}</span>
                <strong>{new Intl.NumberFormat(currency === "KES" ? "en-KE" : "en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(credits - debits)}</strong>
                <small>Net from {currency} entries · {statements.filter((entry) => entry.currency === currency).length} entries</small>
              </article>
            ))}
          </section>

          <section className="panel cards-panel" id="bank-cards">
            <div className="panel-header cards-heading">
              <div><h2>Your cards</h2><p>Choose a card to view its statement</p></div>
              <button className="primary-button add-entry-button" onClick={() => setModal(true)} type="button"><Icon name="plus" size={16} /> Add entry</button>
            </div>
            <div className="bank-card-list">
              {cardCodes.map((code) => (
                <button
                  aria-pressed={selectedCard === code}
                  className={`bank-card bank-card-${code.toLowerCase()}${selectedCard === code ? " selected" : ""}`}
                  key={code}
                  onClick={() => { setSelectedCard(selectedCard === code ? "all" : code); setActivePage("My cards"); }}
                  type="button"
                >
                  <span className="bank-card-top"><span className="bank-card-chip" /><span className="bank-card-network">CARD</span></span>
                  <strong className="bank-card-code">{code}</strong>
                  <span className="bank-card-name">USD · KES</span>
                  <span className="bank-card-footer"><span>RATL DIARY</span><span>{selectedCard === code ? "Viewing" : "Statement"} ↗</span></span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel backup-panel" id="local-backup">
            <div>
              <h2>Local backup</h2>
              <p>Export your cards and statements to a JSON file, or restore them from a saved backup.</p>
            </div>
            <div className="backup-actions">
              <button className="secondary-button" onClick={() => importInput.current?.click()} type="button"><Icon name="upload" size={16} /> Import backup</button>
              <button className="primary-button" onClick={exportBackup} type="button"><Icon name="download" size={16} /> Export backup</button>
              <input ref={importInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={importBackup} aria-label="Choose RATL DIARY backup file" />
            </div>
          </section>

          <section className="panel statement-panel" id="statement-timeline">
            <div className="panel-header statement-heading">
              <div><h2>Statement timeline</h2><p>{selectedCard === "all" ? "Transactions across all three cards" : `Transactions on your ${selectedCard} card`}</p></div>
              <div className="statement-tools">
                <label className="statement-card-filter"><span className="visually-hidden">Filter statements by card</span><select aria-label="Filter statements by card" value={selectedCard} onChange={(event) => setSelectedCard(event.target.value === "all" ? "all" : isCardCode(event.target.value) ? event.target.value : "all")}><option value="all">All cards</option>{cardCodes.map((code) => <option key={code} value={code}>{code}</option>)}</select><Icon name="chevron" size={14} /></label>
                <label className="statement-search"><Icon name="search" size={15} /><input aria-label="Search statements" placeholder="Search statements..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
                <button className="icon-button add-entry-icon" aria-label="Add statement entry" onClick={() => setModal(true)} type="button"><Icon name="plus" size={18} /></button>
              </div>
            </div>
            <div className="statement-list">
              {filteredStatements.length ? filteredStatements.map((statement, index) => (
                <div className="statement-row" key={statement.id}>
                  <div className="statement-rail"><span className={`statement-marker ${statement.direction}`} />{index < filteredStatements.length - 1 && <span className="statement-connector" />}</div>
                  <div className="statement-date">{new Date(`${statement.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  <div className={`statement-icon ${statement.direction}`}><Icon name={statement.direction === "credit" ? "arrow-down" : "arrow-up"} size={17} /></div>
                  <div className="statement-description"><strong>{statement.name}</strong><span>{statement.category} <i /> {statement.card} card</span></div>
                  <span className={`statement-kind ${statement.direction}`}>{statement.direction}</span>
                  <strong className={`statement-amount ${statement.direction}`}>{statement.direction === "credit" ? "+" : "−"}{new Intl.NumberFormat(statement.currency === "KES" ? "en-KE" : "en-US", { style: "currency", currency: statement.currency, maximumFractionDigits: 2 }).format(statement.amount)}</strong>
                </div>
              )) : <div className="empty-transactions">No statements match your filters.</div>}
            </div>
          </section>
          <footer className="bank-footer"><span>© {new Date().getFullYear()} RATL DIARY</span><span>Stored on this device</span></footer>
        </div>
      </main>

      {modal && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(false); }}>
          <form className="bank-modal" onSubmit={submitStatement}>
            <button className="modal-close" aria-label="Close dialog" onClick={() => setModal(false)} type="button">×</button>
            <span className="modal-icon"><Icon name="plus" size={20} /></span>
                <h2>Add statement entry</h2>
                <p>Record a credit or debit for one of your cards.</p>
                <label className="modal-field">Card<select name="card" defaultValue={selectedCard === "all" ? "BOA" : selectedCard}>{cardCodes.map((code) => <option key={code} value={code}>{code}</option>)}</select></label>
                <label className="modal-field">Currency<select name="currency" defaultValue={selectedCard === "BOA" ? "USD" : "KES"}><option value="USD">US Dollar (USD)</option><option value="KES">Kenyan Shilling (KES)</option></select></label>
                <label className="modal-field">Entry type<select name="direction" defaultValue="debit"><option value="debit">Debit — money out</option><option value="credit">Credit — money in</option></select></label>
                <label className="modal-field">Description<input name="name" required maxLength={70} placeholder="e.g. Grocery shopping" /></label>
                <label className="modal-field">Category<input name="category" required maxLength={40} placeholder="e.g. Groceries" /></label>
                <label className="modal-field">Amount<div className="amount-input"><span>¤</span><input name="amount" aria-label="Amount" type="number" min="0.01" step="0.01" required placeholder="0.00" /></div></label>
                <label className="modal-field">Date<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label>
                <button className="primary-button modal-submit" type="submit">Add to statement</button>
                <span className="demo-caption">Saved only in this browser.</span>
          </form>
        </div>
      )}
      {toast && <div className="bank-toast" role="status">{toast}</div>}
    </div>
  );
}
