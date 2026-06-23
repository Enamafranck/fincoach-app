import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const TAUX_EPARGNE_SUGGERE = 0.20 // 20% du revenu estimé

export function ObjectifForm({ user, profil, soldeLibre, onSuccess, onCancel }) {
  const [nom, setNom] = useState('')
  const [montantCible, setMontantCible] = useState('')
  const [montantInitial, setMontantInitial] = useState('')
  const [modeDuree, setModeDuree] = useState('suggeree') // 'suggeree' | 'manuelle'
  const [duree, setDuree] = useState('')
  const [frequence, setFrequence] = useState('mois')
  const [dateDebut, setDateDebut] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cibleNum = parseFloat(montantCible) || 0
  const initialNum = parseFloat(montantInitial) || 0
  const reste = Math.max(cibleNum - initialNum, 0)

  // Capacité d'épargne mensuelle estimée à partir du profil
  const revenuEstime = Number(profil?.montant_revenu_estime || 0)
  const capaciteMensuelle = revenuEstime * TAUX_EPARGNE_SUGGERE

  // Durée suggérée (en mois), si la capacité est connue
  const dureeSuggereeMois = capaciteMensuelle > 0 ? Math.ceil(reste / capaciteMensuelle) : null

  // Durée effective utilisée pour le calcul final, selon le mode choisi
  const dureeEffective = modeDuree === 'suggeree' ? dureeSuggereeMois : parseFloat(duree) || 0
  const frequenceEffective = modeDuree === 'suggeree' ? 'mois' : frequence

  const montantPeriodique = dureeEffective > 0 ? Math.ceil(reste / dureeEffective) : 0

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (cibleNum <= 0) { setError('Montant cible invalide.'); return }
    if (initialNum <= 0) { setError('Montant initial invalide.'); return }
    if (initialNum > soldeLibre) { setError(`Solde libre insuffisant (${soldeLibre} FCFA).`); return }
    if (!dureeEffective || dureeEffective <= 0) { setError('Durée invalide.'); return }
    if (!dateDebut) { setError('Choisis une date de début de cotisation.'); return }

    setLoading(true)

    const prochaine = new Date(dateDebut)
    if (frequenceEffective === 'jour') prochaine.setDate(prochaine.getDate() + 1)
    if (frequenceEffective === 'semaine') prochaine.setDate(prochaine.getDate() + 7)
    if (frequenceEffective === 'mois') prochaine.setMonth(prochaine.getMonth() + 1)

    const { data: objectif, error: objError } = await supabase
      .from('objectifs')
      .insert([{
        utilisateur_id: user.id,
        nom,
        montant_cible: cibleNum,
        montant_actuel: initialNum,
        montant_periodique: montantPeriodique,
        frequence: frequenceEffective,
        date_debut: dateDebut,
        prochaine_echeance: prochaine.toISOString().slice(0, 10),
        couleur_statut: 'vert',
      }])
      .select()
      .single()

    if (objError) { setError(objError.message); setLoading(false); return }

    const { error: cotError } = await supabase.from('cotisations').insert([{
      utilisateur_id: user.id,
      objectif_id: objectif.id,
      montant: initialNum,
      type: 'affectation',
      statut: 'effectuee',
    }])

    if (cotError) { setError(cotError.message); setLoading(false); return }

    const { error: updateError } = await supabase
      .from('utilisateurs')
      .update({ solde_libre: soldeLibre - initialNum })
      .eq('id', user.id)

    setLoading(false)
    if (updateError) { setError(updateError.message); return }

    onSuccess(soldeLibre - initialNum)
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouvel objectif</h2>
      <p className="text-xs text-gray-500 mb-3">
        Solde libre disponible : {soldeLibre.toLocaleString('fr-FR')} FCFA
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
          placeholder="Nom (ex: Vélo)" required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />

        <input type="number" min="1" value={montantCible} onChange={(e) => setMontantCible(e.target.value)}
          placeholder="Montant cible (FCFA)" required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />

        <input type="number" min="1" value={montantInitial} onChange={(e) => setMontantInitial(e.target.value)}
          placeholder="Montant de départ depuis ton solde libre" required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />

        {/* Choix du mode de durée */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={modeDuree === 'suggeree'} onChange={() => setModeDuree('suggeree')} />
            Laisser FinCoach proposer une durée
          </label>
          {modeDuree === 'suggeree' && (
            <p className="text-sm bg-green-50 text-green-700 rounded-lg px-3 py-2 ml-6">
              {dureeSuggereeMois
                ? <>D'après ton revenu estimé, tu peux cotiser environ <strong>{Math.round(capaciteMensuelle).toLocaleString('fr-FR')} FCFA/mois</strong>. Objectif atteignable en <strong>{dureeSuggereeMois} mois</strong>.</>
                : "Renseigne ton revenu estimé dans ton profil pour avoir une suggestion."}
            </p>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={modeDuree === 'manuelle'} onChange={() => setModeDuree('manuelle')} />
            Choisir moi-même la durée
          </label>
          {modeDuree === 'manuelle' && (
            <div className="flex gap-2 ml-6">
              <input type="number" min="1" value={duree} onChange={(e) => setDuree(e.target.value)}
                placeholder="Durée"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              <select value={frequence} onChange={(e) => setFrequence(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="jour">jours</option>
                <option value="semaine">semaines</option>
                <option value="mois">mois</option>
              </select>
            </div>
          )}
        </div>

        {dureeEffective > 0 && reste > 0 && (
          <p className="text-sm bg-indigo-50 text-indigo-700 rounded-lg px-3 py-2">
            Cotisation prévue : <strong>{montantPeriodique.toLocaleString('fr-FR')} FCFA</strong> / {frequenceEffective}
          </p>
        )}

        <div>
          <label className="block text-xs text-gray-500 mb-1">Date de début de cotisation</label>
          <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50">
            {loading ? 'Création...' : "Créer l'objectif"}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-500 hover:text-gray-700">
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

export default ObjectifForm