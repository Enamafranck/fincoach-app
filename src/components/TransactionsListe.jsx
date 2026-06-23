import { useState, useEffect, useRef } from 'react'
import TransactionForm from './TransactionForm'
import { Chart, registerables } from 'chart.js'
import {
  ShoppingCart, Car, Home, Heart, BookOpen,
  Gamepad2, Package, CircleDollarSign, Briefcase, ArrowUpRight, ArrowDownLeft
} from 'lucide-react'

Chart.register(...registerables)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CATEGORIE_ICONES = {
  'Alimentation'   : ShoppingCart,
  'Transport'      : Car,
  'Logement'       : Home,
  'Santé'          : Heart,
  'Éducation'      : BookOpen,
  'Loisirs'        : Gamepad2,
  'Stock/Activité' : Package,
  'Autre'          : CircleDollarSign,
  'Épargne'        : ArrowUpRight,
  'Retrait'        : ArrowDownLeft,
}

const CATEGORIE_COULEURS = {
  'Alimentation'   : '#D85A30',
  'Transport'      : '#BA7517',
  'Logement'       : '#534AB7',
  'Santé'          : '#993556',
  'Éducation'      : '#185FA5',
  'Loisirs'        : '#1D9E75',
  'Stock/Activité' : '#0F6E56',
  'Autre'          : '#888780',
  'Épargne'        : '#4F46E5',
  'Retrait'        : '#1D9E75',
}

export function TransactionsListe({ user }) {
  const [transactions, setTransactions] = useState([])
  const [showForm, setShowForm]         = useState(false)
  const [chargement, setChargement]     = useState(true)
  const [periode, setPeriode]           = useState('semaine')
  const [erreur, setErreur]             = useState(null)
  
  // ✅ État des statistiques synchronisé avec le backend FastAPI
  const [stats, setStats] = useState({
    entrees_totales: 0,
    sorties_totales: 0,
    solde_disponible_net: 0,
    efficacite_epargne: '0%'
  })

  const courbeRef   = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => { charger() }, [user.id])
  useEffect(() => { if (!chargement) buildChart() }, [transactions, periode])

  async function charger() {
    try {
      setChargement(true)
      setErreur(null)
      
      // 1. Récupération de l'historique global
      const response = await fetch(`${API_URL}/api/transactions/historique/${user.id}`)
      if (!response.ok) {
        throw new Error("Impossible de récupérer l'historique global.")
      }
      const data = await response.json()
      setTransactions(data || [])

      // ✅ 2. Récupération des compteurs certifiés depuis le serveur
      try {
        const resStats = await fetch(`${API_URL}/api/transactions/stats/${user.id}`)
        if (resStats.ok) {
          const statsData = await resStats.json()
          setStats(statsData)
        }
      } catch (statsErr) {
        console.warn('Stats backend non disponibles, utilisation des compteurs locaux.', statsErr)
      }

    } catch (err) {
      console.error("❌ Erreur lors du chargement :", err)
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  // Répartition analytique des dépenses pour les graphiques (Dépenses manuelles incluses pour analyse)
  const depensesParCategorie = transactions
    .filter(t => t.type === 'depense')
    .reduce((acc, t) => {
      acc[t.categorie] = (acc[t.categorie] || 0) + Number(t.montant)
      return acc
    }, {})

  const categoriesTriees = Object.entries(depensesParCategorie)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const maxCategorie = categoriesTriees[0]?.[1] || 1

  function getDonneesCourbe() {
  const aujourdhui = new Date()
  const nbJours = periode === 'semaine' ? 7 : 30
  const labels = []
  const revenus = []
  const depenses = []

  for (let i = nbJours - 1; i >= 0; i--) {
    const d = new Date(aujourdhui)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10) // Format YYYY-MM-DD

    if (periode === 'semaine') {
      labels.push(d.toLocaleDateString('fr-FR', { weekday: 'short' }))
    } else {
      labels.push(d.getDate() % 5 === 1
        ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        : '')
    }

    // Filtrer les transactions du jour J
    const txJour = transactions.filter(t => t.date === dateStr)
    
    // 🧠 LOGIQUE SYNCHRONISÉE AVEC LE BACKEND :
    // Les entrées en caisse réelle sont les dépôts d'épargne (cotisations effectuées)
    const totalEntreesJour = txJour
      .filter(t => t.type === 'epargne')
      .reduce((s, t) => s + Number(t.montant), 0)

    // Les sorties de caisse réelle sont les retraits officiels
    const totalSortiesJour = txJour
      .filter(t => t.type === 'retrait')
      .reduce((s, t) => s + Number(t.montant), 0)
    
    revenus.push(totalEntreesJour)
    depenses.push(totalSortiesJour)
  }

  return { labels, revenus, depenses }
}

  function buildChart() {
    if (!courbeRef.current) return
    const { labels, revenus, depenses } = getDonneesCourbe()
    if (chartInstance.current) chartInstance.current.destroy()

    chartInstance.current = new Chart(courbeRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Entrées / Épargne',
            data: revenus,
            borderColor: '#1D9E75',
            backgroundColor: 'rgba(29,158,117,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#1D9E75',
            pointRadius: 4,
            borderWidth: 2,
          },
          {
            label: 'Sorties / Dépenses',
            data: depenses,
            borderColor: '#D85A30',
            backgroundColor: 'rgba(216,90,48,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#D85A30',
            pointRadius: 4,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12 }, boxWidth: 12, padding: 16 },
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label} : ${ctx.raw.toLocaleString('fr-FR')} FCFA`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 11 },
              callback: v => v >= 1000 ? Math.round(v / 1000) + 'k' : v,
            },
            grid: { color: 'rgba(128,128,128,0.1)' },
          },
          x: {
            ticks: { font: { size: 11 } },
            grid: { display: false },
          },
        },
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
        <button onClick={() => setShowForm(v => !v)}
          className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
          {showForm ? 'Fermer' : '+ Déclarer'}
        </button>
      </div>

      {showForm && (
        <TransactionForm
          user={user}
          onSuccess={() => { setShowForm(false); charger() }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {erreur && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center">
          ⚠️ {erreur} <button onClick={charger} className="underline font-medium ml-2">Réessayer</button>
        </div>
      )}

      {chargement ? (
        <p className="text-sm text-gray-400 text-center py-8">Chargement de l'historique global...</p>
      ) : (
        <>
          {/* ✅ ── COMPTEURS CERTIFIÉS (DESIGN PROFESSIONNEL FINTECH) ── */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 p-1">
            
            {/* ENTRÉES */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Entrées totales</p>
              <p className="text-xl font-bold text-emerald-600">
                {stats.entrees_totales.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">FCFA</span>
              </p>
            </div>

            {/* SORTIES */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Sorties totales</p>
              <p className="text-xl font-bold text-rose-600">
                {stats.sorties_totales.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">FCFA</span>
              </p>
            </div>

            {/* SOLDE DISPONIBLE NET */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Solde disponible net</p>
              <p className={`text-xl font-bold ${stats.solde_disponible_net >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                {stats.solde_disponible_net >= 0 ? '+' : ''}
                {stats.solde_disponible_net.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">FCFA</span>
              </p>
            </div>

            {/* EFFICACITÉ ÉPARGNE */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Efficacité Épargne</p>
              <p className={`text-xl font-bold ${parseInt(stats.efficacite_epargne) >= 20 ? 'text-emerald-600' : 'text-amber-500'}`}>
                {stats.efficacite_epargne}
              </p>
            </div>
          </div>

          {/* ── COURBE DES FLUX ── */}
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Flux financiers réels</h3>
              <div className="flex gap-2">
                {['semaine', 'mois'].map(p => (
                  <button key={p} onClick={() => setPeriode(p)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      periode === p
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 text-gray-500 hover:border-gray-400'
                    }`}>
                    {p === 'semaine' ? '7 jours' : '30 jours'}
                  </button>
                ))}
              </div>
            </div>
            <canvas ref={courbeRef} height={180} />
          </div>

          {/* ── ANALYSE ET ACTIVITÉS ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Analyse des sorties</h3>
              {categoriesTriees.length === 0 ? (
                <p className="text-xs text-gray-400">Aucune dépense enregistrée.</p>
              ) : (
                <div className="space-y-3">
                  {categoriesTriees.map(([cat, montant]) => {
                    const Icone = CATEGORIE_ICONES[cat] || CircleDollarSign
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span className="flex items-center gap-1.5">
                            <Icone size={13} color={CATEGORIE_COULEURS[cat] || '#888780'} />
                            {cat}
                          </span>
                          <span className="font-medium">{montant.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.round((montant / maxCategorie) * 100)}%`,
                              backgroundColor: CATEGORIE_COULEURS[cat] || '#888780'
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Dernières activités (Global)</h3>
              {transactions.length === 0 ? (
                <p className="text-xs text-gray-400">Aucune activité financière trouvée.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {transactions.slice(0, 15).map(t => {
                    let Icone = CATEGORIE_ICONES[t.categorie] || CircleDollarSign
                    if (t.type === 'revenu') Icone = Briefcase
                    if (t.type === 'retrait') Icone = ArrowDownLeft
                    if (t.type === 'epargne') Icone = ArrowUpRight

                    const estUneEntree = t.type === 'revenu' || t.type === 'retrait'
                    const couleurIcone = estUneEntree 
                      ? (t.type === 'retrait' ? '#1D9E75' : '#3B6D11')
                      : (t.type === 'epargne' ? '#4F46E5' : (CATEGORIE_COULEURS[t.categorie] || '#888780'))
                    
                    const bgIcone = t.type === 'revenu' ? '#EAF3DE' : (t.type === 'retrait' ? '#E6F6F0' : (t.type === 'epargne' ? '#EEF2FF' : '#FAECE7'))

                    return (
                      <div key={t.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: bgIcone }}>
                          <Icone size={16} color={couleurIcone} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{t.description}</p>
                          <p className="text-xs text-gray-400">{t.date}</p>
                        </div>
                        <span className={`text-xs font-semibold flex-shrink-0 ${
                          t.type === 'revenu' || t.type === 'retrait' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {t.type === 'revenu' || t.type === 'retrait' ? '+' : '-'}{Number(t.montant).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TransactionsListe