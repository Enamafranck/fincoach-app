import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export function AlertesCotisations({ user, onRefresh }) {
  const [alertes, setAlertes] = useState([])

  useEffect(() => {
    chargerAlertes()
  }, [])

  async function chargerAlertes() {
    const { data } = await supabase
      .from('cotisations')
      .select('*, objectifs(nom, montant_periodique, frequence)')
      .eq('utilisateur_id', user.id)
      .eq('statut', 'en_attente')
      .order('created_at', { ascending: false })

    setAlertes(data || [])
  }

  if (alertes.length === 0) return null

  return (
    <div className="mb-6 space-y-2">
      {alertes.map((a) => (
        <div key={a.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 items-start">
          <span className="text-orange-500 text-xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-orange-800 font-semibold text-sm">
              Cotisation non effectuée — {a.objectifs?.nom}
            </p>
            <p className="text-orange-700 text-xs mt-1">
              La cotisation prévue de <strong>{Number(a.montant_prevu).toLocaleString('fr-FR')} FCFA / {a.objectifs?.frequence}</strong> n'a pas pu être effectuée : solde insuffisant au moment de l'échéance.
            </p>
            <p className="text-orange-600 text-xs mt-1">
              ✅ Elle sera exécutée automatiquement dès que ton solde sera suffisant.
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AlertesCotisations