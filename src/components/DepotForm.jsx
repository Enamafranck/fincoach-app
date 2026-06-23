import { useState } from 'react'
import { supabase } from '../services/supabase'

const MOYENS_PAIEMENT = [
  {
    id: 'mtn',
    label: 'MTN Mobile Money',
    icon: '🟡',
    placeholder: 'Numéro MTN (ex: 6XXXXXXXX)',
    couleurActif: 'ring-2 ring-yellow-400 border-yellow-500',
  },
  {
    id: 'orange',
    label: 'Orange Money',
    icon: '🟠',
    placeholder: 'Numéro Orange (ex: 6XXXXXXXX)',
    couleurActif: 'ring-2 ring-orange-400 border-orange-500',
  },
  {
    id: 'carte',
    label: 'Carte bancaire',
    icon: '💳',
    placeholder: 'Numéro de carte (ex: 4XXX XXXX XXXX XXXX)',
    couleurActif: 'ring-2 ring-blue-400 border-blue-500',
  },
]

export function DepotForm({ user, soldeActuel, onSuccess, onCancel }) {
  const [montant, setMontant]         = useState('')
  const [moyenChoisi, setMoyenChoisi] = useState(null)
  const [numero, setNumero]           = useState('')
  const [etape, setEtape]             = useState('formulaire') // 'formulaire' | 'confirmation' | 'succes'
  const [loading, setLoading]         = useState(false)
  const [erreur, setErreur]           = useState('')

  const montantNum = parseFloat(montant) || 0
  const moyen = MOYENS_PAIEMENT.find(m => m.id === moyenChoisi)

  function validerFormulaire() {
    setErreur('')
    if (montantNum <= 0)        return setErreur('Saisis un montant valide.')
    if (!moyenChoisi)           return setErreur('Choisis un moyen de paiement.')
    if (!numero.trim())         return setErreur('Saisis ton numéro ou référence de paiement.')
    setEtape('confirmation')
  }

  async function confirmerDepot() {
    setLoading(true)
    setErreur('')

    const { error: cotError } = await supabase.from('cotisations').insert([{
      utilisateur_id : user.id,
      objectif_id    : null,
      montant        : montantNum,
      type           : 'mise_de_cote',
      statut         : 'effectuee',
    }])

    if (cotError) { setErreur(cotError.message); setLoading(false); return }

    const { error: updateError } = await supabase
      .from('utilisateurs')
      .update({ solde_libre: soldeActuel + montantNum })
      .eq('id', user.id)

    setLoading(false)
    if (updateError) { setErreur(updateError.message); return }

    setEtape('succes')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* ── EN-TÊTE ── */}
        <div className="bg-indigo-600 text-white p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Solde actuel</p>
              <h2 className="text-xl font-bold">Mettre de côté</h2>
              <p className="text-sm mt-1 opacity-90">
                {soldeActuel.toLocaleString('fr-FR')} FCFA disponibles
              </p>
            </div>
            <button onClick={onCancel} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>
        </div>

        <div className="p-5">

          {/* ── ÉTAPE 1 : FORMULAIRE ── */}
          {etape === 'formulaire' && (
            <div className="space-y-4">

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant à déposer (FCFA)
                </label>
                <input
                  type="number" min="1" value={montant}
                  onChange={e => setMontant(e.target.value)}
                  placeholder="Ex : 5 000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Récapitulatif */}
              {montantNum > 0 && (
                <div className="bg-indigo-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between font-bold text-indigo-800">
                    <span>Nouveau solde après dépôt</span>
                    <span>{(soldeActuel + montantNum).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              )}

              {/* Choix moyen de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moyen de paiement
                </label>
                <div className="space-y-2">
                  {MOYENS_PAIEMENT.map(m => (
                    <button key={m.id}
                      onClick={() => { setMoyenChoisi(m.id); setNumero('') }}
                      className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-all ${
                        moyenChoisi === m.id ? m.couleurActif : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <span className="text-xl">{m.icon}</span>
                      <span className="font-medium text-gray-800 text-sm">{m.label}</span>
                      {moyenChoisi === m.id && <span className="ml-auto text-indigo-600">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Numéro */}
              {moyenChoisi && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {moyenChoisi === 'carte' ? 'Numéro de carte' : 'Numéro de téléphone'}
                  </label>
                  <input
                    type="text" value={numero}
                    onChange={e => setNumero(e.target.value)}
                    placeholder={moyen?.placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {erreur && <p className="text-sm text-red-600">{erreur}</p>}

              <div className="flex gap-2 pt-1">
                <button onClick={onCancel}
                  className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Annuler
                </button>
                <button onClick={validerFormulaire}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold">
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : CONFIRMATION ── */}
          {etape === 'confirmation' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Confirmer le dépôt</h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant</span>
                  <span className="font-medium">{montantNum.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Via</span>
                  <span className="font-medium">{moyen?.icon} {moyen?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {moyenChoisi === 'carte' ? 'Carte' : 'Numéro'}
                  </span>
                  <span className="font-medium">{numero}</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-700 border-t pt-2">
                  <span>Nouveau solde</span>
                  <span>{(soldeActuel + montantNum).toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {erreur && <p className="text-sm text-red-600">{erreur}</p>}

              <div className="flex gap-2">
                <button onClick={() => setEtape('formulaire')}
                  className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                  ← Modifier
                </button>
                <button onClick={confirmerDepot} disabled={loading}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                  {loading ? 'Traitement...' : '✅ Confirmer'}
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : SUCCÈS ── */}
          {etape === 'succes' && (
            <div className="text-center py-6 space-y-3">
              <div className="text-5xl">💰</div>
              <h3 className="text-xl font-bold text-gray-900">Dépôt effectué !</h3>
              <p className="text-gray-500 text-sm">
                <span className="font-semibold text-indigo-600">
                  {montantNum.toLocaleString('fr-FR')} FCFA
                </span> ont été ajoutés à ton solde via {moyen?.label}.
              </p>
              <p className="text-sm font-semibold text-gray-700">
                Nouveau solde : {(soldeActuel + montantNum).toLocaleString('fr-FR')} FCFA
              </p>
              <button onClick={() => onSuccess(soldeActuel + montantNum)}
                className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm">
                Fermer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default DepotForm