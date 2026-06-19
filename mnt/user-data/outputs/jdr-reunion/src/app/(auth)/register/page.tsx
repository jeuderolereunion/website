// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "JOUEUR",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Erreur réseau, réessayez");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-rune">🎲</div>
          <h1>Créer un compte</h1>
          <p>Rejoignez la communauté JDR Réunion</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nom / Pseudo</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Votre nom ou pseudo"
              required
              minLength={2}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="votre@email.re"
              required
            />
          </div>

          <div className="form-group">
            <label>Je suis</label>
            <div className="role-selector">
              <label className={`role-option ${form.role === "JOUEUR" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="JOUEUR"
                  checked={form.role === "JOUEUR"}
                  onChange={handleChange}
                />
                <span className="role-icon">🗡️</span>
                <span className="role-label">Joueur</span>
                <span className="role-desc">Je cherche des tables</span>
              </label>
              <label className={`role-option ${form.role === "MJ" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="MJ"
                  checked={form.role === "MJ"}
                  onChange={handleChange}
                />
                <span className="role-icon">📖</span>
                <span className="role-label">Maître de Jeu</span>
                <span className="role-desc">Je crée des tables</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="8 caractères minimum"
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirmer le mot de passe</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" /> Création...
              </span>
            ) : (
              "Créer mon compte"
            )}
          </button>
        </form>

        <div className="auth-footer">
          Déjà un compte ?{" "}
          <Link href="/login">Se connecter</Link>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          background-image:
            radial-gradient(ellipse at 80% 50%, rgba(16, 185, 129, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 20% 80%, rgba(245, 158, 11, 0.06) 0%, transparent 50%);
          padding: 2rem;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .auth-card {
          background: rgba(15, 15, 25, 0.95);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          padding: 2.5rem;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.08), 0 20px 60px rgba(0,0,0,0.5);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-rune {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          display: block;
        }
        .auth-header h1 {
          color: #f1f0ee;
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.4rem;
        }
        .auth-header p { color: #9ca3af; font-size: 0.9rem; margin: 0; }
        .auth-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group label {
          color: #d1d5db;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .form-group input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 8px;
          color: #f1f0ee;
          font-size: 0.95rem;
          padding: 0.75rem 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .form-group input:focus {
          border-color: rgba(16, 185, 129, 0.6);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .form-group input::placeholder { color: #4b5563; }
        .role-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .role-option {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 1rem 0.75rem;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          text-transform: none !important;
          letter-spacing: 0 !important;
          font-size: 1rem !important;
        }
        .role-option input { display: none; }
        .role-option:hover {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.05);
        }
        .role-option.selected {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }
        .role-icon { font-size: 1.5rem; display: block; margin-bottom: 0.3rem; }
        .role-label {
          display: block;
          color: #f1f0ee;
          font-weight: 600;
          font-size: 0.85rem;
          margin-bottom: 0.2rem;
        }
        .role-desc { display: block; color: #6b7280; font-size: 0.75rem; }
        .btn-primary {
          background: linear-gradient(135deg, #059669, #10b981);
          border: none;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 0.85rem;
          margin-top: 0.5rem;
          transition: opacity 0.2s, transform 0.1s, box-shadow 0.2s;
        }
        .btn-primary:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-loading { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-footer { text-align: center; margin-top: 1.5rem; color: #6b7280; font-size: 0.875rem; }
        .auth-footer a { color: #34d399; text-decoration: none; font-weight: 500; }
        .auth-footer a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
