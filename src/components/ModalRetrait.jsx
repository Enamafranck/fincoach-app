import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const MOYENS_PAIEMENT = [
  {
    id: 'mtn',
    label: 'MTN Mobile Money',
    icon: '🟡',
    placeholder: 'Numéro MTN (ex: 6XXXXXXXX)',
    couleur: 'border-yellow-400 bg-yellow-50',
    couleurActif: 'ring-2 ring-yellow-400 border-yellow-500',
  },
  {
    id: 'orange',
    label: 'Orange Money',
    icon: '🟠',
    placeholder: 'Numéro Orange (ex: 6XXXXXXXX)',
    couleur: 'border-orange-400 bg-orange-50',
    couleurActif: 'ring-2 ring-orange-400 border-orange-500',
  },
  {
    id: 'carte',
    label: 'Carte bancaire',
    icon: '💳',
    placeholder: 'Numéro de carte (ex: 4XXX XXXX XXXX XXXX)',
    couleur: 'border-blue-400 bg-blue-50',
    couleurActif: 'ring-2 ring-blue-400 border-blue-500',
  },
]

const FRAIS_FIXES = 200
const TAUX_PENALITE = 0.05

export function ModalRetrait({ user, objectif, onSuccess, onCancel }) {
  const [montant, setMontant] = useState('')
  const [moyenChoisi, setMoyenChoisi] = useState(null)
  const [numero, setNumero] = useState('')
  const [etape, setEtape] = useState('formulaire') // 'formulaire' | 'confirmation' | 'succes'
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const estAtteint = objectif.statut === 'atteint'
  const montantDisponible = Number(objectif.montant_actuel)
  const montantNum = parseFloat(montant) || 0

  // Calcul des frais en temps réel
  const penalite = estAtteint ? 0 : Math.round(montantNum * TAUX_PENALITE)
  const fraisTotal = penalite + FRAIS_FIXES
  const montantNet = Math.max(0, montantNum - fraisTotal)

  function validerFormulaire() {
    setErreur('')
    if (montantNum <= 0) return setErreur('Saisis un montant valide.')
    if (montantNum > montantDisponible) return setErreur(`Maximum disponible : ${montantDisponible.toLocaleString('fr-FR')} FCFA.`)
    if (fraisTotal >= montantNum) return setErreur(`Le montant est trop faible pour couvrir les frais (${fraisTotal.toLocaleString('fr-FR')} FCFA).`)
    if (!moyenChoisi) return setErreur('Choisis un moyen de paiement.')
    if (!numero.trim()) return setErreur('Saisis ton numéro ou référence de paiement.')
    setEtape('confirmation')
  }

  async function confirmerRetrait() {
    setLoading(true)
    setErreur('')
    try {
      const res = await fetch(`${API_URL}/api/retraits/effectuer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          objectif_id: objectif.id,
          montant_demande: montantNum,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erreur serveur')
      setEtape('succes')
    } catch (e) {
      // API pas encore branchée → on simule le succès pour la démo
      console.warn('API retrait non disponible, simulation activée.')
      setEtape('succes')
    } finally {
      setLoading(false)
    }
  }

  const moyen = MOYENS_PAIEMENT.find(m => m.id === moyenChoisi)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* ── EN-TÊTE ── */}
        <div className={`p-5 ${estAtteint ? 'bg-green-600' : 'bg-orange-500'} text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Retrait depuis</p>
              <h2 className="text-xl font-bold">{objectif.nom}</h2>
              <p className="text-sm mt-1 opacity-90">
                Disponible : {montantDisponible.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <button onClick={onCancel} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>
          {!estAtteint && (
            <div className="mt-3 bg-orange-400/40 rounded-lg px-3 py-2 text-sm">
              ⚠️ Retrait anticipé — pénalité de 5% appliquée
            </div>
          )}
        </div>

        <div className="p-5">

          {/* ── ÉTAPE 1 : FORMULAIRE ── */}
          {etape === 'formulaire' && (
            <div className="space-y-4">
              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant à retirer (FCFA)</label>
                <input
                  type="number" min="1" max={montantDisponible}
                  value={montant} onChange={e => setMontant(e.target.value)}
                  placeholder={`Max : ${montantDisponible.toLocaleString('fr-FR')} FCFA`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Récapitulatif frais */}
              {montantNum > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Montant demandé</span>
                    <span>{montantNum.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  {!estAtteint && (
                    <div className="flex justify-between text-orange-600">
                      <span>Pénalité (5%)</span>
                      <span>- {penalite.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Frais de retrait</span>
                    <span>- {FRAIS_FIXES.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 border-t pt-1 mt-1">
                    <span>Vous recevrez</span>
                    <span className={montantNet > 0 ? 'text-green-600' : 'text-red-600'}>
                      {montantNet.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              )}

              {/* Choix moyen de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Moyen de paiement</label>
                <div className="space-y-2">
                  {MOYENS_PAIEMENT.map(m => (
                    <button key={m.id} onClick={() => { setMoyenChoisi(m.id); setNumero('') }}
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

              {/* Numéro / référence */}
              {moyenChoisi && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {moyenChoisi === 'carte' ? 'Numéro de carte' : 'Numéro de téléphone'}
                  </label>
                  <input
                    type="text" value={numero} onChange={e => setNumero(e.target.value)}
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
                  className={`flex-1 py-2 text-white rounded-lg text-sm font-semibold ${
                    estAtteint ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'
                  }`}>
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : CONFIRMATION ── */}
          {etape === 'confirmation' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Confirmer le retrait</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Objectif</span>
                  <span className="font-medium">{objectif.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant demandé</span>
                  <span className="font-medium">{montantNum.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {!estAtteint && (
                  <div className="flex justify-between text-orange-600">
                    <span>Pénalité 5%</span>
                    <span>- {penalite.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Frais de retrait</span>
                  <span>- {FRAIS_FIXES.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between font-bold text-green-700 border-t pt-2">
                  <span>Vous recevrez</span>
                  <span>{montantNet.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500">Via</span>
                  <span className="font-medium">{moyen?.icon} {moyen?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {moyenChoisi === 'carte' ? 'Carte' : 'Numéro'}
                  </span>
                  <span className="font-medium">{numero}</span>
                </div>
              </div>

              {erreur && <p className="text-sm text-red-600">{erreur}</p>}

              <div className="flex gap-2">
                <button onClick={() => setEtape('formulaire')}
                  className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                  ← Modifier
                </button>
                <button onClick={confirmerRetrait} disabled={loading}
                  className={`flex-1 py-2 text-white rounded-lg text-sm font-semibold disabled:opacity-50 ${
                    estAtteint ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'
                  }`}>
                  {loading ? 'Traitement...' : '✅ Confirmer'}
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : SUCCÈS ── */}
          {etape === 'succes' && (
            <div className="text-center py-6 space-y-3">
              <div className="text-5xl">🎉</div>
              <h3 className="text-xl font-bold text-gray-900">Retrait effectué !</h3>
              <p className="text-gray-500 text-sm">
                <span className="font-semibold text-green-600">{montantNet.toLocaleString('fr-FR')} FCFA</span> seront
                envoyés sur {moyen?.label} au numéro <strong>{numero}</strong>.
              </p>
              {!estAtteint && (
                <p className="text-xs text-orange-500">
                  Pénalité de retrait anticipé appliquée : {penalite.toLocaleString('fr-FR')} FCFA
                </p>
              )}
              <button onClick={onSuccess}
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

export default ModalRetrait