import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import emailjs from "emailjs-com";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiCheck, FiRotateCcw } from "react-icons/fi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const projectTypes = ["Website", "Web app", "E-commerce", "Dashboard", "Mobile app", "Something else"];

const fields = [
  { key: "name", label: "Your name", placeholder: "Mr Lágbájá ", hint: "who’s this?" },
  { key: "email", label: "Email", placeholder: "Lágbájá@company.com", hint: "where do I reply?", type: "email" },
  // optional: only collect what's needed to reply (data minimisation, see the Privacy page)
  { key: "role", label: "Your role", placeholder: "Founder, PM, Developer…", hint: "your superpower", optional: true },
  { key: "language", label: "Favorite programming language", placeholder: "JavaScript, obviously", hint: "choose wisely", optional: true },
  { key: "techStack", label: "Tech stack", placeholder: "React, Node, Postgres", hint: "comma separated", optional: true },
];

const errorCopy = {
  name: "No name? Drop your name and make it official!",
  // role, language and techStack are optional now; their messages are kept in case they become required again
  // language: "Are you a JavaScript wizard, or ??? Let me know!",
  // techStack: "Share your tech stack and flex your dev muscles!",
  // role: "Claim your role, what’s your superpower?",
  emailEmpty: "Enter your email so i can keep you in the loop!",
  emailInvalid: "Oops! That email looks off, Lets fix it!",
  message: "Not so pro tip: Take breaks often, send a message.",
};

const emptyForm = { name: "", email: "", role: "", language: "", techStack: "", message: "" };

function validate(form) {
  const errors = {};
  ["name", "message"].forEach((key) => {
    if (!form[key].trim()) errors[key] = errorCopy[key];
  });
  if (!form.email.trim()) errors.email = errorCopy.emailEmpty;
  else if (!EMAIL_REGEX.test(form.email.trim())) errors.email = errorCopy.emailInvalid;
  return errors;
}

/* ---------- live code preview ---------- */

const Str = ({ value, active }) => (
  <>
    <span className="tk-str">"{value}</span>
    {active && <span className="ct-caret" />}
    <span className="tk-str">"</span>
  </>
);

const Hint = ({ show, text }) => (show ? <span className="tk-com">{`  // ${text}`}</span> : null);

function CodePreview({ form, type, focused }) {
  const stack = form.techStack.split(",").map((s) => s.trim()).filter(Boolean);
  const line = (key, children) => ({ key, children });

  const lines = [
    line("c", <span className="tk-com">{"// message.js — writes itself as you type"}</span>),
    line("i", <><span className="tk-kw">import</span> {"{ "}<span className="tk-var">legend</span>{" }"} <span className="tk-kw">from</span> <span className="tk-str">"ovie.dev"</span>;</>),
    line("b1", ""),
    line("o", <><span className="tk-kw">const</span> <span className="tk-var">message</span> <span className="tk-pun">=</span> {"{"}</>),
    ...fields.filter((f) => f.key !== "techStack").map((f) =>
      line(f.key, <>{"  "}<span className="tk-prop">{f.key === "language" ? "favoriteLanguage" : f.key}</span>: <Str value={form[f.key]} active={focused === f.key} />,<Hint show={!form[f.key]} text={f.hint} /></>)
    ),
    line("techStack", <>
      {"  "}<span className="tk-prop">stack</span>: [
      {stack.map((s, i) => (
        <React.Fragment key={i}><span className="tk-str">"{s}"</span>{i < stack.length - 1 && ", "}</React.Fragment>
      ))}
      {focused === "techStack" && <span className="ct-caret" />}],
      <Hint show={!stack.length} text="flex a little" />
    </>),
    line("type", <>{"  "}<span className="tk-prop">projectType</span>: {type ? <span className="tk-str">"{type}"</span> : <span className="tk-kw">null</span>},</>),
    line("message", <>
      {"  "}<span className="tk-prop">body</span>: <span className="tk-str">`{form.message}</span>
      {focused === "message" && <span className="ct-caret" />}
      <span className="tk-str">`</span>,
    </>),
    line("x", "};"),
    line("b2", ""),
    line("s", <><span className="tk-kw">await</span> <span className="tk-var">legend</span>.<span className="tk-fn">send</span>(<span className="tk-var">message</span>);</>),
  ];

  return (
    <ol className="ct-code">
      {lines.map((l) => (
        <li key={l.key} className={focused === l.key ? "is-active" : ""}>
          <code>{l.children}</code>
        </li>
      ))}
    </ol>
  );
}

/* ---------- terminal ---------- */

function Terminal({ phase, errors, firstName }) {
  const errorList = Object.entries(errors);
  const steps = ["validating payload", "encrypting with good vibes", "delivering to Ovie’s inbox"];

  return (
    <div className="ct-terminal" aria-live="polite">
      <p className="ct-term-cmd">
        <span className="tk-fn">$</span> node message.js
      </p>

      {(phase === "idle" || (phase === "invalid" && !errorList.length)) && <p className="tk-com">waiting for you to hit send…<span className="ct-caret" /></p>}

      {phase === "invalid" && errorList.length > 0 && (
        <>
          <p className="ct-term-err">✗ {errorList.length} problem{errorList.length > 1 ? "s" : ""} found</p>
          {errorList.map(([key, msg], i) => (
            <motion.p key={key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <span className="tk-prop">{key}</span> <span className="tk-com">→</span> {msg}
            </motion.p>
          ))}
        </>
      )}

      {["sending", "sent", "error"].includes(phase) &&
        steps.map((step, i) => {
          const done = phase === "sent" || (phase === "error" && i < 2);
          const failed = phase === "error" && i === 2;
          return (
            <motion.p key={step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.35 }}>
              <span className="tk-com">›</span> {step}…{" "}
              {done && <span className="ct-term-ok">✓</span>}
              {failed && <span className="ct-term-err">✗</span>}
              {!done && !failed && <span className="ct-spinner" />}
            </motion.p>
          );
        })}

      {phase === "sent" && (
        <motion.p className="ct-term-ok ct-term-final" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          ✔ 200 OK. Message delivered. Talk soon{firstName ? `, ${firstName}` : ""}! 👋
        </motion.p>
      )}
      {phase === "error" && (
        <motion.p className="ct-term-err ct-term-final" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          ✗ delivery failed. Check your connection and try again.
        </motion.p>
      )}
    </div>
  );
}

/* ---------- form ---------- */

function ContactForm() {
  const [form, setForm] = useState(emptyForm);
  const [type, setType] = useState("");
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | invalid | sending | sent | error
  const [sentName, setSentName] = useState("");
  const [trap, setTrap] = useState(""); // honeypot: hidden from people, bots fill it in
  const editorRef = useRef(null);

  const update = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const revealEditor = () => {
    if (window.matchMedia("(max-width: 900px)").matches) {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phase === "sending") return;

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setPhase("invalid");
      revealEditor();
      return;
    }

    setPhase("sending");
    revealEditor();

    const message = type ? `Project type: ${type}\n\n${form.message}` : form.message;
    const minDelay = new Promise((r) => setTimeout(r, 1200)); // let the terminal animation breathe
    const orDash = (value) => value.trim() || "—"; // optional fields left empty

    // a filled honeypot means a bot: show the normal success state but send nothing
    const delivery = trap
      ? Promise.resolve()
      : emailjs.send(
          "service_hniivlv", // EmailJS Service ID
          "template_nukzfpm", // EmailJS Template ID
          {
            name: form.name,
            language: orDash(form.language),
            techStack: orDash(form.techStack),
            role: orDash(form.role),
            email: form.email,
            message,
          },
          "3qoTfXCjF2_xgMKYz" // EmailJS public key
        );

    Promise.all([delivery, minDelay])
      .then(() => {
        setSentName(form.name.trim().split(" ")[0]);
        setPhase("sent");
        setForm(emptyForm);
        setType("");
      })
      .catch(() => setPhase("error"));
  };

  const reset = () => {
    setPhase("idle");
    setErrors({});
  };

  return (
    <div className="ct-workspace">
      <form className="ct-form" onSubmit={handleSubmit} noValidate>
        <div className="ct-chips-group">
          <p className="ct-label">What are we building?</p>
          <div className="ct-chips">
            {projectTypes.map((t) => (
              <button
                key={t}
                type="button"
                className={`ct-chip ${type === t ? "is-active" : ""}`}
                aria-pressed={type === t}
                onClick={() => setType(type === t ? "" : t)}
                onFocus={() => setFocused("type")}
                onBlur={() => setFocused(null)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="ct-fields">
          {fields.map((f) => (
            <div key={f.key} className={`ct-field ${errors[f.key] ? "has-error" : ""}`}>
              <label htmlFor={`ct-${f.key}`}>
                {f.label}
                {f.optional && <span className="ct-optional">optional</span>}
              </label>
              <input
                id={`ct-${f.key}`}
                type={f.type ?? "text"}
                value={form[f.key]}
                placeholder={f.placeholder}
                onChange={update(f.key)}
                onFocus={() => setFocused(f.key)}
                onBlur={() => setFocused(null)}
                autoComplete={f.key === "name" ? "name" : f.key === "email" ? "email" : "off"}
                aria-invalid={!!errors[f.key]}
              />
              <AnimatePresence>
                {errors[f.key] && (
                  <motion.p className="ct-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    {errors[f.key]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}

          <div className={`ct-field ct-field-full ${errors.message ? "has-error" : ""}`}>
            <label htmlFor="ct-message">Tell me about it</label>
            <textarea
              id="ct-message"
              rows={5}
              value={form.message}
              placeholder="Goals, timeline, links, anything that helps…"
              onChange={update("message")}
              onFocus={() => setFocused("message")}
              onBlur={() => setFocused(null)}
              aria-invalid={!!errors.message}
            />
            <AnimatePresence>
              {errors.message && (
                <motion.p className="ct-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  {errors.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="ct-trap" aria-hidden="true">
            <label htmlFor="ct-website">Leave this field empty</label>
            <input id="ct-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
          </div>
        </div>

        <div className="ct-submit-row">
          {phase === "sent" || phase === "error" ? (
            <button type="button" className="ct-send" onClick={reset}>
              {phase === "sent" ? <><FiCheck /> Send another</> : <><FiRotateCcw /> Try again</>}
            </button>
          ) : (
            <button type="submit" className="ct-send" disabled={phase === "sending"}>
              {phase === "sending" ? <><span className="ct-spinner" /> Sending…</> : <><FiSend /> Run &amp; send</>}
            </button>
          )}
          <p className="ct-kbd-hint">Watch the editor write your message as code →</p>
        </div>

        <p className="ct-privacy-note">
          By sending this, you agree I’ll use your details only to reply to you. See the{" "}
          <Link to="/Privacy">Privacy Policy</Link>.
        </p>
      </form>

      <div className="ct-editor" ref={editorRef}>
        <div className="ct-editor-bar">
          <span className="ct-dots"><i /><i /><i /></span>
          <span className="ct-tab">message.js</span>
          <span className="ct-live"><span className="ct-live-dot" /> live</span>
        </div>
        <CodePreview form={form} type={type} focused={focused} />
        <div className="ct-editor-split">TERMINAL</div>
        <Terminal phase={phase} errors={errors} firstName={sentName} />
      </div>
    </div>
  );
}

export default ContactForm;
