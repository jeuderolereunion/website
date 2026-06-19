// src/app/tables/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Table = {
  id: string;
  titre: string;
  jeu: string;
  description: string;
  lieu: string;
  dateHeure: string;
  placesTotal: number;
  niveauRequis: string;
  statut: string;
  mj: { id: string; name: string };
  inscriptions: { user: { id: string; name: string }; statut: string }[];
};

const NIVEAU_LABELS: Record<string, string> = {
  DEBUTANT: "Débutant",
  INTERMEDIAIRE: "Intermédiaire",
  CONFIRME: "Confirmé",
  TOUS_NIVEAUX: "Tous niveaux",
};

const NIVEAU_COLORS: Record<string, string> = {
  DEBUTANT: "#10b981",
  INTERMEDIAIRE: "#f59e0b",
  CONFIRME: "#ef4444",
  TOUS_NIVEAUX: "#8b5cf6",
};

export default function TablesPage() {
  const { data: session } = useSession();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [inscriptionLoading, setInscriptionLoading] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, { text: string; type: "success" | "error" }>>({});
  const [filtreJeu, setFiltreJeu] = useState("");
  const [filtreNiveau, setFiltreNiveau] = useState("");

  const fetchTables = async () => {
    const params = new URLSearchParams();
    if (filtreJeu) params.set("jeu", filtreJeu);
    if (filtreNiveau) params.set("niveau", filtreNiveau);

    const res = await fetch(`/api/tables?${params}`);
    const data = await res.json();
    setTables(data.tables || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTables();
  }, [filtreJeu, filtreNiveau]);

  const isInscrit = (table: Table) =>
    table.inscriptions.some((i) => i.user.id === session?.user?.id);

  const monInscription = (table: Table) =>
    table.inscriptions.find((i) => i.user.id === session?.user?.id);

  const placesOccupees = (table: Table) =>
    table.inscriptions.filter((i) => ["EN_ATTENTE", "CONFIRMEE"].includes(i.statut)).length;

  const handleInscrire = async (tableId: string) => {
    if (!session) return;
    setInscriptionLoading(tableId);

    const res = await fetch(`/api/tables/${tableId}/inscriptions`, {
      method: "POST",
    });
    const data = await res.json();

    setMessages((prev) => ({
      ...prev,
      [tableId]: {
        text: res.ok ? "Inscription envoyée ! En attente de confirmation." : data.error,
        type: res.ok ? "success" : "error",
      },
    }));

    if (res.ok) fetchTables();
    setInscriptionLoading(null);
  };

  const handleDesinscrire = async (tableId: string) => {
    if (!session) return;
    setInscriptionLoading(tableId);

    const res = await fetch(`/api/tables/${tableId}/inscriptions`, {
      method: "DELETE",
    });
    const data = await res.json();

    setMessages((prev) => ({
      ...prev,
      [tableId]: {
        text: res.ok ? "Désinscription effectuée." : data.error,
        type: res.ok ? "success" : "error",
      },
    }));

    if (res.ok) fetchTables();
    setInscriptionLoading(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="tables-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <Link href="/" className="back-link">← Accueil</Link>
            <h1>
              <span className="header-icon">⚔</span> Tables de JDR
            </h1>
            <p>Trouvez votre prochaine aventure à La Réunion</p>
          </div>
          <div className="header-actions">
            {session?.user?.role === "MJ" && (
              <Link href="/tables/create" className="btn-create">
                + Créer une table
              </Link>
            )}
            {!session && (
              <Link href="/login" className="btn-login">
                Se connecter
              </Link>
            )}
            {session && (
              <Link href="/dashboard" className="btn-dashboard">
                Mon espace
              </Link>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="filtres">
          <input
            type="text"
            placeholder="🔍 Filtrer par jeu (D&D, Pathfinder...)"
            value={filtreJeu}
            onChange={(e) => setFiltreJeu(e.target.value)}
            className="filtre-input"
          />
          <select
            value={filtreNiveau}
            onChange={(e) => setFiltreNiveau(e.target.value)}
            className="filtre-select"
          >
            <option value="">Tous les niveaux</option>
            <option value="DEBUTANT">Débutant</option>
            <option value="INTERMEDIAIRE">Intermédiaire</option>
            <option value="CONFIRME">Confirmé</option>
            <option value="TOUS_NIVEAUX">Tous niveaux</option>
          </select>
        </div>
      </div>

      {/* Contenu */}
      <div className="tables-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-dice">🎲</div>
            <p>Chargement des tables...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📜</div>
            <h2>Aucune table disponible</h2>
            <p>Soyez le premier à proposer une aventure !</p>
            {session?.user?.role === "MJ" && (
              <Link href="/tables/create" className="btn-create">
                Créer la première table
              </Link>
            )}
          </div>
        ) : (
          <div className="tables-grid">
            {tables.map((table) => {
              const inscrit = isInscrit(table);
              const monI = monInscription(table);
              const places = placesOccupees(table);
              const complet = places >= table.placesTotal;
              const estMJ = session?.user?.id === table.mj.id;
              const msg = messages[table.id];

              return (
                <div key={table.id} className={`table-card ${table.statut === "COMPLETE" ? "complete" : ""}`}>
                  {/* Badge statut */}
                  <div className="card-badges">
                    <span
                      className="badge-niveau"
                      style={{ borderColor: NIVEAU_COLORS[table.niveauRequis] + "60", color: NIVEAU_COLORS[table.niveauRequis] }}
                    >
                      {NIVEAU_LABELS[table.niveauRequis]}
                    </span>
                    {table.statut === "COMPLETE" && (
                      <span className="badge-complet">Complet</span>
                    )}
                    {estMJ && <span className="badge-mj">Ma table</span>}
                  </div>

                  {/* Titre & jeu */}
                  <h2 className="table-titre">{table.titre}</h2>
                  <div className="table-jeu">🎲 {table.jeu}</div>

                  {/* Description */}
                  <p className="table-description">{table.description}</p>

                  {/* Infos */}
                  <div className="table-infos">
                    <div className="info-item">
                      <span className="info-icon">📅</span>
                      <span>{formatDate(table.dateHeure)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">📍</span>
                      <span>{table.lieu}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">👤</span>
                      <span>MJ : {table.mj.name}</span>
                    </div>
                  </div>

                  {/* Jauge places */}
                  <div className="places-section">
                    <div className="places-label">
                      <span>Places</span>
                      <span className={complet ? "places-complet" : "places-dispo"}>
                        {places}/{table.placesTotal}
                      </span>
                    </div>
                    <div className="places-bar">
                      <div
                        className="places-fill"
                        style={{ width: `${(places / table.placesTotal) * 100}%` }}
                      />
                    </div>
                    {/* Joueurs inscrits */}
                    {table.inscriptions.length > 0 && (
                      <div className="joueurs-list">
                        {table.inscriptions.slice(0, 4).map((i) => (
                          <span key={i.user.id} className={`joueur-tag statut-${i.statut.toLowerCase()}`}>
                            {i.user.name}
                          </span>
                        ))}
                        {table.inscriptions.length > 4 && (
                          <span className="joueur-tag">+{table.inscriptions.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message feedback */}
                  {msg && (
                    <div className={`card-message ${msg.type}`}>
                      {msg.text}
                    </div>
                  )}

                  {/* Action */}
                  {!estMJ && session && (
                    <div className="card-action">
                      {inscrit ? (
                        <div className="inscrit-section">
                          <span className={`inscrit-badge statut-${monI?.statut.toLowerCase()}`}>
                            {monI?.statut === "EN_ATTENTE" && "⏳ En attente de confirmation"}
                            {monI?.statut === "CONFIRMEE" && "✅ Inscription confirmée"}
                            {monI?.statut === "REFUSEE" && "❌ Inscription refusée"}
                          </span>
                          <button
                            onClick={() => handleDesinscrire(table.id)}
                            disabled={inscriptionLoading === table.id}
                            className="btn-desinscrire"
                          >
                            Se désinscrire
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleInscrire(table.id)}
                          disabled={complet || inscriptionLoading === table.id}
                          className="btn-inscrire"
                        >
                          {inscriptionLoading === table.id
                            ? "..."
                            : complet
                            ? "Table complète"
                            : "Rejoindre la table"}
                        </button>
                      )}
                    </div>
                  )}

                  {!session && (
                    <div className="card-action">
                      <Link href="/login" className="btn-inscrire-link">
                        Connectez-vous pour rejoindre
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .tables-page {
          min-height: 100vh;
          background: #0a0a0f;
          color: #f1f0ee;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .page-header {
          background: rgba(15,15,25,0.98);
          border-bottom: 1px solid rgba(139,92,246,0.2);
          padding: 1.5rem 2rem;
          position: sticky;
          top: 0;
          z-index: 10;
          backdrop-filter: blur(12px);
        }
        .header-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          max-width: 1200px;
          margin: 0 auto;
          flex-wrap: wrap;
        }
        .back-link {
          color: #6b7280;
          text-decoration: none;
          font-size: 0.85rem;
          display: block;
          margin-bottom: 0.4rem;
          transition: color 0.2s;
        }
        .back-link:hover { color: #a78bfa; }
        .header-left h1 {
          font-size: 1.6rem;
          font-weight: 800;
          margin: 0 0 0.25rem;
          color: #f1f0ee;
        }
        .header-icon { color: #f59e0b; margin-right: 0.4rem; }
        .header-left p { color: #6b7280; font-size: 0.875rem; margin: 0; }
        .header-actions { display: flex; gap: 0.75rem; align-items: center; padding-top: 0.5rem; }
        .btn-create {
          background: linear-gradient(135deg, #7c3aed, #8b5cf6);
          color: #fff;
          border-radius: 8px;
          padding: 0.6rem 1.2rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          transition: opacity 0.2s, transform 0.1s;
        }
        .btn-create:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-login, .btn-dashboard {
          border: 1px solid rgba(139,92,246,0.4);
          color: #a78bfa;
          border-radius: 8px;
          padding: 0.6rem 1.2rem;
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .btn-login:hover, .btn-dashboard:hover {
          background: rgba(139,92,246,0.1);
          border-color: rgba(139,92,246,0.7);
        }
        .filtres {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          flex-wrap: wrap;
        }
        .filtre-input, .filtre-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 8px;
          color: #f1f0ee;
          padding: 0.55rem 0.9rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .filtre-input { flex: 1; min-width: 200px; }
        .filtre-select { min-width: 160px; cursor: pointer; }
        .filtre-input:focus, .filtre-select:focus { border-color: rgba(139,92,246,0.6); }
        .filtre-select option { background: #1a1a2e; }

        .tables-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .loading-state, .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          color: #6b7280;
        }
        .loading-dice, .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .empty-state h2 { color: #d1d5db; margin-bottom: 0.5rem; }
        .empty-state .btn-create { display: inline-block; margin-top: 1rem; }

        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.5rem;
        }
        .table-card {
          background: rgba(15,15,25,0.9);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .table-card:hover {
          border-color: rgba(139,92,246,0.5);
          box-shadow: 0 8px 30px rgba(139,92,246,0.1);
          transform: translateY(-2px);
        }
        .table-card.complete {
          opacity: 0.7;
          border-color: rgba(255,255,255,0.08);
        }
        .card-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .badge-niveau {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          border: 1px solid;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge-complet {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.4);
          color: #fca5a5;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge-mj {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          background: rgba(245,158,11,0.15);
          border: 1px solid rgba(245,158,11,0.4);
          color: #fcd34d;
        }
        .table-titre { font-size: 1.15rem; font-weight: 700; margin: 0; color: #f1f0ee; line-height: 1.3; }
        .table-jeu { color: #a78bfa; font-size: 0.875rem; font-weight: 500; }
        .table-description {
          color: #9ca3af;
          font-size: 0.875rem;
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .table-infos { display: flex; flex-direction: column; gap: 0.4rem; }
        .info-item { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.8rem; color: #d1d5db; }
        .info-icon { flex-shrink: 0; }

        .places-section { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.25rem; }
        .places-label { display: flex; justify-content: space-between; font-size: 0.8rem; color: #9ca3af; }
        .places-dispo { color: #34d399; font-weight: 600; }
        .places-complet { color: #f87171; font-weight: 600; }
        .places-bar {
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .places-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #f59e0b);
          border-radius: 2px;
          transition: width 0.4s ease;
        }
        .joueurs-list { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.25rem; }
        .joueur-tag {
          font-size: 0.72rem;
          padding: 0.15rem 0.5rem;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          color: #9ca3af;
          background: rgba(255,255,255,0.03);
        }
        .joueur-tag.statut-confirmee { border-color: rgba(16,185,129,0.4); color: #34d399; }
        .joueur-tag.statut-en_attente { border-color: rgba(245,158,11,0.3); color: #fcd34d; }

        .card-message {
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
        }
        .card-message.success { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
        .card-message.error { background: rgba(239,68,68,0.1); color: #fca5a5; border: 1px solid rgba(239,68,68,0.2); }

        .card-action { margin-top: auto; }
        .btn-inscrire {
          width: 100%;
          background: linear-gradient(135deg, #7c3aed, #8b5cf6);
          border: none;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.7rem;
          transition: opacity 0.2s, transform 0.1s;
        }
        .btn-inscrire:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-inscrire:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-inscrire-link {
          display: block;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 8px;
          color: #a78bfa;
          text-decoration: none;
          font-size: 0.875rem;
          padding: 0.7rem;
          transition: all 0.2s;
        }
        .btn-inscrire-link:hover { background: rgba(139,92,246,0.1); }
        .inscrit-section { display: flex; flex-direction: column; gap: 0.5rem; }
        .inscrit-badge { font-size: 0.8rem; font-weight: 500; }
        .inscrit-badge.statut-en_attente { color: #fcd34d; }
        .inscrit-badge.statut-confirmee { color: #34d399; }
        .inscrit-badge.statut-refusee { color: #fca5a5; }
        .btn-desinscrire {
          background: transparent;
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 6px;
          color: #f87171;
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0.4rem 0.75rem;
          transition: all 0.2s;
        }
        .btn-desinscrire:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.5); }

        @media (max-width: 640px) {
          .tables-container { padding: 1rem; }
          .page-header { padding: 1rem; }
          .tables-grid { grid-template-columns: 1fr; }
          .header-content { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
