// src/app/tables/create/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const JEU_PRESETS = [
  "Donjons & Dragons 5e",
  "Pathfinder 2e",
  "Appel de Cthulhu",
  "Warhammer Fantasy",
  "Shadowrun",
  "Vampire: La Mascarade",
  "Star Wars RPG",
  "Chroniques Oubliées",
  "Autre",
];

export default function CreateTablePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    titre: "",
    jeu: "",
    jeuCustom: "",
    description: "",
    lieu: "",
    dateHeure: "",
    placesTotal: 4,
    niveauRequis: "TOUS_NIVEAUX",
  });
  const [useCustomJeu, setUseCustomJeu] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "loading") return null;

  if (!session || (session.user.role !== "MJ" && session.user.role !== "ADMIN")) {
    return (
      <div className="access-denied">
        <div className="denied-icon">🔒</div>
        <h2>Accès réservé aux Maîtres de Jeu</h2>
        <p>Seuls les comptes MJ peuvent créer des tables.</p>
        <Link href="/tables" className="btn-back">Voir les tables</Link>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleJeuSelect = (jeu: string) => {
    if (jeu === "Autre") {
      setUseCustomJeu(true);
      setForm((prev) => ({ ...prev, jeu: "" }));
    } else {
      setUseCustomJeu(false);
      setForm((prev) => ({ ...prev, jeu }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const jeuFinal = useCustomJeu ? form.jeuCustom : form.jeu;
    if (!jeuFinal) {
      setError("Veuillez sélectionner ou saisir un jeu");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: form.titre,
          jeu: jeuFinal,
          description: form.description,
          lieu: form.lieu,
          dateHeure: new Date(form.dateHeure).toISOString(),
          placesTotal: Number(form.placesTotal),
          niveauRequis: form.niveauRequis,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création");
        setLoading(false);
        return;
      }

      router.push("/tables");
    } catch {
      setError("Erreur réseau, réessayez");
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <div className="create-card">
        <div className="create-header">
          <Link href="/tables" className="back-link">← Retour aux tables</Link>
          <div className="header-icon">📖</div>
          <h1>Créer une table</h1>
          <p>Préparez votre prochaine session de jeu</p>
        </div>

        {error && (
          <div className="form-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-form">
          {/* Titre */}
          <div className="form-group">
            <label htmlFor="titre">Titre de la table *</label>
            <input
              id="titre"
              name="titre"
              type="text"
              value={form.titre}
              onChange={handleChange}
              placeholder="ex: La Crypte des Anciens"
              required
              minLength={3}
            />
          </div>

          {/* Jeu */}
          <div className="form-group">
            <label>Système de jeu *</label>
            <div className="jeu-grid">
              {JEU_PRESETS.map((jeu) => (
                <button
                  key={jeu}
                  type="button"
                  className={`jeu-btn ${
                    (jeu === "Autre" && useCustomJeu) ||
                    (jeu === form.jeu && !useCustomJeu)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleJeuSelect(jeu)}
                >
                  {jeu}
                </button>
              ))}
            </div>
            {useCustomJeu && (
              <input
                name="jeuCustom"
                type="text"
                value={form.jeuCustom}
                onChange={handleChange}
                placeholder="Nom du jeu..."
                className="jeu-custom-input"
                required={useCustomJeu}
              />
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Synopsis / Description *</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Décrivez votre aventure, l'ambiance, le scénario..."
              required
              minLength={20}
              rows={4}
            />
          </div>

          {/* Date + Lieu */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateHeure">Date et heure *</label>
              <input
                id="dateHeure"
                name="dateHeure"
                type="datetime-local"
                value={form.dateHeure}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lieu">Lieu *</label>
              <input
                id="lieu"
                name="lieu"
                type="text"
                value={form.lieu}
                onChange={handleChange}
                placeholder="ex: Médiathèque de St-Denis"
                required
                minLength={3}
              />
            </div>
          </div>

          {/* Places + Niveau */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="placesTotal">
                Nombre de joueurs *
                <span className="label-hint"> (2–10)</span>
              </label>
              <div className="places-control">
                <button
                  type="button"
                  className="places-btn"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      placesTotal: Math.max(2, prev.placesTotal - 1),
                    }))
                  }
                >
                  −
                </button>
                <span className="places-value">{form.placesTotal}</span>
                <button
                  type="button"
                  className="places-btn"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      placesTotal: Math.min(10, prev.placesTotal + 1),
                    }))
                  }
                >
                  +
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="niveauRequis">Niveau requis</label>
              <select
                id="niveauRequis"
                name="niveauRequis"
                value={form.niveauRequis}
                onChange={handleChange}
              >
                <option value="TOUS_NIVEAUX">🟣 Tous niveaux</option>
                <option value="DEBUTANT">🟢 Débutant</option>
                <option value="INTERMEDIAIRE">🟡 Intermédiaire</option>
                <option value="CONFIRME">🔴 Confirmé</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" /> Publication...
              </span>
            ) : (
              "✨ Publier la table"
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        .create-page {
          min-height: 100vh;
          background: #0a0a0f;
          background-image:
            radial-gradient(ellipse at 30% 30%, rgba(245,158,11,0.06) 0%, transparent 60%);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .access-denied {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          color: #f1f0ee;
          gap: 1rem;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .denied-icon { font-size: 3rem; }
        .access-denied h2 { margin: 0; }
        .access-denied p { color: #6b7280; margin: 0; }
        .btn-back {
          color: #a78bfa;
          text-decoration: none;
          border: 1px solid rgba(139,92,246,0.4);
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .btn-back:hover { background: rgba(139,92,246,0.1); }

        .create-card {
          background: rgba(15,15,25,0.95);
          border: 1px solid rgba(245,158,11,0.25);
          border-radius: 12px;
          padding: 2.5rem;
          width: 100%;
          max-width: 680px;
          box-shadow: 0 0 40px rgba(245,158,11,0.06), 0 20px 60px rgba(0,0,0,0.5);
        }
        .create-header {
          margin-bottom: 2rem;
        }
        .back-link {
          color: #6b7280;
          text-decoration: none;
          font-size: 0.85rem;
          display: block;
          margin-bottom: 1rem;
          transition: color 0.2s;
        }
        .back-link:hover { color: #fcd34d; }
        .header-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
        .create-header h1 {
          color: #f1f0ee;
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0 0 0.3rem;
        }
        .create-header p { color: #9ca3af; font-size: 0.875rem; margin: 0; }
        .form-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .create-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        label {
          color: #d1d5db;
          font-size: 0.82rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .label-hint { color: #6b7280; font-weight: 400; text-transform: none; letter-spacing: 0; }
        input[type="text"],
        input[type="datetime-local"],
        select,
        textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 8px;
          color: #f1f0ee;
          font-size: 0.9rem;
          padding: 0.7rem 0.9rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        input:focus, select:focus, textarea:focus {
          border-color: rgba(245,158,11,0.6);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.08);
        }
        input::placeholder, textarea::placeholder { color: #4b5563; }
        textarea { resize: vertical; min-height: 100px; }
        select option { background: #1a1a2e; }
        select { cursor: pointer; }

        .jeu-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .jeu-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          color: #9ca3af;
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0.4rem 0.75rem;
          transition: all 0.2s;
          font-family: inherit;
        }
        .jeu-btn:hover {
          border-color: rgba(245,158,11,0.4);
          color: #fcd34d;
          background: rgba(245,158,11,0.06);
        }
        .jeu-btn.selected {
          border-color: #f59e0b;
          color: #fcd34d;
          background: rgba(245,158,11,0.12);
        }
        .jeu-custom-input {
          margin-top: 0.5rem;
          width: 100%;
          box-sizing: border-box;
        }

        .places-control {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          width: fit-content;
        }
        .places-btn {
          background: rgba(245,158,11,0.15);
          border: none;
          border-radius: 4px;
          color: #fcd34d;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 700;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .places-btn:hover { background: rgba(245,158,11,0.3); }
        .places-value {
          color: #f1f0ee;
          font-size: 1.1rem;
          font-weight: 700;
          min-width: 1.5rem;
          text-align: center;
        }

        .btn-submit {
          background: linear-gradient(135deg, #d97706, #f59e0b);
          border: none;
          border-radius: 8px;
          color: #000;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 700;
          padding: 0.9rem;
          margin-top: 0.5rem;
          transition: opacity 0.2s, transform 0.1s, box-shadow 0.2s;
        }
        .btn-submit:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245,158,11,0.4);
        }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-loading { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 600px) {
          .create-page { padding: 1rem; }
          .create-card { padding: 1.5rem; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
