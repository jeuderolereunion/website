// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Inscription = {
  id: string;
  statut: string;
  table: {
    id: string;
    titre: string;
    jeu: string;
    dateHeure: string;
    lieu: string;
    statut: string;
    mj: { name: string };
  };
};

type MaTable = {
  id: string;
  titre: string;
  jeu: string;
  dateHeure: string;
  lieu: string;
  statut: string;
  placesTotal: number;
  inscriptions: {
    id: string;
    statut: string;
    user: { id: string; name: string; email: string };
  }[];
};

const STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE: "⏳ En attente",
  CONFIRMEE: "✅ Confirmée",
  REFUSEE: "❌ Refusée",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [mesTables, setMesTables] = useState<MaTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inscriptions" | "tables">("inscriptions");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    const [inscRes, tabRes] = await Promise.all([
      fetch("/api/user/inscriptions"),
      fetch("/api/user/tables"),
    ]);
    const inscData = await inscRes.json();
    const tabData = await tabRes.json();
    setInscriptions(inscData.inscriptions || []);
    setMesTables(tabData.tables || []);
    setLoading(false);
  };

  const handleGestionInscription = async (
    tableId: string,
    inscriptionId: string,
    statut: "CONFIRMEE" | "REFUSEE"
  ) => {
    setActionLoading(inscriptionId);
    await fetch(`/api/tables/${tableId}/inscriptions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inscriptionId, statut }),
    });
    await fetchData();
    setActionLoading(null);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (status === "loading" || loading) {
    return (
      <div className="loading-page">
        <div className="loading-anim">🎲</div>
        <p>Chargement de votre espace...</p>
      </div>
    );
  }

  if (!session) return null;

  const isMJ = session.user.role === "MJ" || session.user.role === "ADMIN";

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dash-header">
        <div className="header-inner">
          <div className="header-user">
            <Link href="/tables" className="back-link">← Tables</Link>
            <div className="user-info">
              <div className="user-avatar">{session.user.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="user-name">{session.user.name}</div>
                <div className="user-role">
                  {session.user.role === "MJ" ? "⚔ Maître de Jeu" : "🗡️ Joueur"}
                </div>
              </div>
            </div>
          </div>
          <div className="header-right">
            {isMJ && (
              <Link href="/tables/create" className="btn-create">
                + Nouvelle table
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn-logout"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="dash-tabs">
        <div className="tabs-inner">
          <button
            className={`tab ${activeTab === "inscriptions" ? "active" : ""}`}
            onClick={() => setActiveTab("inscriptions")}
          >
            Mes inscriptions
            {inscriptions.length > 0 && (
              <span className="tab-count">{inscriptions.length}</span>
            )}
          </button>
          {isMJ && (
            <button
              className={`tab ${activeTab === "tables" ? "active" : ""}`}
              onClick={() => setActiveTab("tables")}
            >
              Mes tables
              {mesTables.length > 0 && (
                <span className="tab-count">{mesTables.length}</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="dash-content">
        {/* Onglet inscriptions */}
        {activeTab === "inscriptions" && (
          <div className="section">
            {inscriptions.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🗺️</span>
                <p>Vous n&apos;êtes inscrit à aucune table pour l&apos;instant.</p>
                <Link href="/tables" className="btn-link">
                  Trouver une table
                </Link>
              </div>
            ) : (
              <div className="cards-list">
                {inscriptions.map((insc) => (
                  <div key={insc.id} className={`dash-card statut-border-${insc.statut.toLowerCase()}`}>
                    <div className="dash-card-header">
                      <div>
                        <div className="dash-card-titre">{insc.table.titre}</div>
                        <div className="dash-card-jeu">🎲 {insc.table.jeu}</div>
                      </div>
                      <span className={`statut-pill statut-${insc.statut.toLowerCase()}`}>
                        {STATUT_LABEL[insc.statut]}
                      </span>
                    </div>
                    <div className="dash-card-infos">
                      <span>📅 {formatDate(insc.table.dateHeure)}</span>
                      <span>📍 {insc.table.lieu}</span>
                      <span>👤 MJ : {insc.table.mj.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet mes tables (MJ) */}
        {activeTab === "tables" && isMJ && (
          <div className="section">
            {mesTables.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📖</span>
                <p>Vous n&apos;avez pas encore créé de table.</p>
                <Link href="/tables/create" className="btn-link">
                  Créer ma première table
                </Link>
              </div>
            ) : (
              <div className="cards-list">
                {mesTables.map((table) => {
                  const enAttente = table.inscriptions.filter((i) => i.statut === "EN_ATTENTE");
                  const confirmees = table.inscriptions.filter((i) => i.statut === "CONFIRMEE");

                  return (
                    <div key={table.id} className="mj-card">
                      <div className="mj-card-header">
                        <div>
                          <div className="dash-card-titre">{table.titre}</div>
                          <div className="dash-card-jeu">🎲 {table.jeu}</div>
                        </div>
                        <div className="mj-card-meta">
                          <span className={`statut-pill statut-table-${table.statut.toLowerCase()}`}>
                            {table.statut === "OUVERTE" && "🟢 Ouverte"}
                            {table.statut === "COMPLETE" && "🔴 Complète"}
                            {table.statut === "ANNULEE" && "⚫ Annulée"}
                          </span>
                          <span className="places-info">
                            {confirmees.length}/{table.placesTotal} places confirmées
                          </span>
                        </div>
                      </div>

                      <div className="dash-card-infos">
                        <span>📅 {formatDate(table.dateHeure)}</span>
                        <span>📍 {table.lieu}</span>
                      </div>

                      {/* Demandes en attente */}
                      {enAttente.length > 0 && (
                        <div className="demandes-section">
                          <div className="demandes-title">
                            ⏳ Demandes en attente ({enAttente.length})
                          </div>
                          {enAttente.map((insc) => (
                            <div key={insc.id} className="demande-item">
                              <span className="demande-name">{insc.user.name}</span>
                              <span className="demande-email">{insc.user.email}</span>
                              <div className="demande-actions">
                                <button
                                  className="btn-confirmer"
                                  disabled={actionLoading === insc.id}
                                  onClick={() =>
                                    handleGestionInscription(table.id, insc.id, "CONFIRMEE")
                                  }
                                >
                                  ✓ Confirmer
                                </button>
                                <button
                                  className="btn-refuser"
                                  disabled={actionLoading === insc.id}
                                  onClick={() =>
                                    handleGestionInscription(table.id, insc.id, "REFUSEE")
                                  }
                                >
                                  ✗ Refuser
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Joueurs confirmés */}
                      {confirmees.length > 0 && (
                        <div className="confirmees-section">
                          <div className="demandes-title">✅ Joueurs confirmés</div>
                          <div className="confirmees-list">
                            {confirmees.map((insc) => (
                              <span key={insc.id} className="joueur-chip">
                                {insc.user.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: #0a0a0f;
          color: #f1f0ee;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .loading-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          color: #6b7280;
          gap: 1rem;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .loading-anim { font-size: 3rem; animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        .dash-header {
          background: rgba(15,15,25,0.98);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 1.25rem 2rem;
          backdrop-filter: blur(12px);
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 900px;
          margin: 0 auto;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .back-link {
          color: #6b7280;
          text-decoration: none;
          font-size: 0.82rem;
          display: block;
          margin-bottom: 0.5rem;
          transition: color 0.2s;
        }
        .back-link:hover { color: #a78bfa; }
        .user-info { display: flex; align-items: center; gap: 0.75rem; }
        .user-avatar {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #7c3aed, #f59e0b);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          color: #fff;
          flex-shrink: 0;
        }
        .user-name { font-weight: 600; font-size: 1rem; color: #f1f0ee; }
        .user-role { font-size: 0.8rem; color: #9ca3af; }
        .header-right { display: flex; align-items: center; gap: 0.75rem; }
        .btn-create {
          background: linear-gradient(135deg, #7c3aed, #8b5cf6);
          color: #fff;
          border-radius: 8px;
          padding: 0.55rem 1rem;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .btn-logout {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #6b7280;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0.55rem 1rem;
          transition: all 0.2s;
          font-family: inherit;
        }
        .btn-logout:hover { border-color: rgba(239,68,68,0.4); color: #f87171; }

        .dash-tabs {
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 2rem;
          background: rgba(15,15,25,0.95);
        }
        .tabs-inner {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          gap: 0;
        }
        .tab {
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: #6b7280;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.9rem 1.25rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: inherit;
        }
        .tab:hover { color: #d1d5db; }
        .tab.active { color: #a78bfa; border-bottom-color: #8b5cf6; }
        .tab-count {
          background: rgba(139,92,246,0.2);
          border-radius: 20px;
          color: #a78bfa;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.1rem 0.45rem;
        }

        .dash-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
        }
        .section {}
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .empty-icon { font-size: 2.5rem; }
        .empty-state p { margin: 0; }
        .btn-link {
          color: #a78bfa;
          text-decoration: none;
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 8px;
          padding: 0.55rem 1.1rem;
          font-size: 0.875rem;
          transition: all 0.2s;
          display: inline-block;
        }
        .btn-link:hover { background: rgba(139,92,246,0.08); }

        .cards-list { display: flex; flex-direction: column; gap: 1rem; }

        .dash-card, .mj-card {
          background: rgba(15,15,25,0.9);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .dash-card {
          border-left-width: 3px;
        }
        .statut-border-en_attente { border-left-color: #f59e0b; }
        .statut-border-confirmee { border-left-color: #10b981; }
        .statut-border-refusee { border-left-color: #ef4444; }

        .mj-card { border-color: rgba(245,158,11,0.15); }
        .mj-card:hover { border-color: rgba(245,158,11,0.3); }

        .dash-card-header, .mj-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }
        .dash-card-titre { font-size: 1rem; font-weight: 600; color: #f1f0ee; margin-bottom: 0.2rem; }
        .dash-card-jeu { font-size: 0.8rem; color: #a78bfa; }
        .dash-card-infos { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.8rem; color: #9ca3af; }

        .statut-pill {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .statut-en_attente { background: rgba(245,158,11,0.12); color: #fcd34d; }
        .statut-confirmee { background: rgba(16,185,129,0.12); color: #34d399; }
        .statut-refusee { background: rgba(239,68,68,0.12); color: #fca5a5; }
        .statut-table-ouverte { background: rgba(16,185,129,0.12); color: #34d399; }
        .statut-table-complete { background: rgba(239,68,68,0.12); color: #fca5a5; }
        .statut-table-annulee { background: rgba(107,114,128,0.12); color: #9ca3af; }

        .mj-card-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
        .places-info { font-size: 0.75rem; color: #6b7280; }

        .demandes-section, .confirmees-section {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .demandes-title { font-size: 0.8rem; font-weight: 600; color: #d1d5db; }
        .demande-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          background: rgba(255,255,255,0.02);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
        }
        .demande-name { color: #f1f0ee; font-size: 0.875rem; font-weight: 500; }
        .demande-email { color: #6b7280; font-size: 0.78rem; flex: 1; }
        .demande-actions { display: flex; gap: 0.4rem; }
        .btn-confirmer {
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.4);
          border-radius: 6px;
          color: #34d399;
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.3rem 0.65rem;
          transition: all 0.2s;
          font-family: inherit;
        }
        .btn-confirmer:hover:not(:disabled) { background: rgba(16,185,129,0.25); }
        .btn-refuser {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 6px;
          color: #fca5a5;
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.3rem 0.65rem;
          transition: all 0.2s;
          font-family: inherit;
        }
        .btn-refuser:hover:not(:disabled) { background: rgba(239,68,68,0.2); }
        .btn-confirmer:disabled, .btn-refuser:disabled { opacity: 0.4; cursor: not-allowed; }

        .confirmees-list { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .joueur-chip {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 20px;
          color: #34d399;
          font-size: 0.78rem;
          padding: 0.2rem 0.6rem;
        }

        @media (max-width: 640px) {
          .dash-header { padding: 1rem; }
          .dash-content { padding: 1rem; }
          .header-inner { flex-direction: column; align-items: flex-start; }
          .dash-card-header { flex-direction: column; }
          .mj-card-header { flex-direction: column; }
          .mj-card-meta { align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
