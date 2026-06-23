import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import VueCaisse from './VueCaisse'
import TransactionsListe from './TransactionsListe'
import CoachChat from './CoachChat'
import BottomNav from './BottomNav'
import AlertesCotisations from './AlertesCotisations'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function Dashboard({ user, onLogout }) {
  const [profil, setProfil] = useState(null)
  const [objectifs, setObjectifs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [onglet, setOnglet] = useState('caisse')
  const [refreshAlertes, setRefreshAlertes] = useState(0)

  useEffect(() => {
    chargerDonnees().then(() => traiterCotisations())
  }, [])

  async function traiterCotisations() {
    try {
      const res = await fetch(`${API_URL}/api/cotisations/traiter/${user.id}`, { method: 'POST' })
      const data = await res.json()
      if (data.resultats && data.resultats.length > 0) {
        await chargerDonnees()
        setRefreshAlertes(r => r + 1)
      }
    } catch {
      // Backend non lancé — silencieux
    }
  }

  async function chargerDonnees() {
    setChargement(true)
    setErreur(null)

    const { data: profilData, error: profilError } = await supabase
      .from('utilisateurs').select('*').eq('id', user.id).single()

    if (profilError) { setErreur("Profil introuvable."); setChargement(false); return }
    setProfil(profilData)

    const { data: objectifsData } = await supabase
      .from('objectifs').select('*').eq('utilisateur_id', user.id).order('created_at', { ascending: false })
    setObjectifs(objectifsData || [])

    setChargement(false)
  }

  function majSolde(nouveauSolde) {
    setProfil((p) => ({ ...p, solde_libre: nouveauSolde }))
    setRefreshAlertes(r => r + 1) // recheck alertes après dépôt
  }

  if (chargement) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Chargement...</p></div>
  }

  const soldeLibre = Number(profil?.solde_libre || 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto p-6">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Salut {profil?.prenom || 'là'} 👋</h1>
          <button onClick={onLogout} className="text-sm text-gray-500 hover:text-red-600 font-medium">
            Se déconnecter
          </button>
        </div>

        {erreur && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">{erreur}</div>}

        {/* Alertes cotisations en attente — visibles sur tous les onglets */}
        <AlertesCotisations key={refreshAlertes} user={user} />

        {onglet === 'caisse' && (
          <VueCaisse
            user={user} profil={profil} objectifs={objectifs} soldeLibre={soldeLibre}
            onDepotSuccess={(s) => { majSolde(s); chargerDonnees() }}
            onObjectifSuccess={(s) => { majSolde(s); chargerDonnees() }}
            onRetraitSuccess={() => chargerDonnees()}
          />
        )}

        {onglet === 'transactions' && <TransactionsListe user={user} />}

        {onglet === 'coach' && <CoachChat user={user} profil={profil} />}

      </div>

      <BottomNav ongletActif={onglet} onChange={setOnglet} />
    </div>
  )
}

export default Dashboard