import { useState } from 'react'
import DepotForm from './DepotForm'
import ObjectifForm from './ObjectifForm'
import ModalRetrait from './ModalRetrait'

export function VueCaisse({ user, profil, objectifs, soldeLibre, onDepotSuccess, onObjectifSuccess, onRetraitSuccess }) {
  const [showDepot, setShowDepot] = useState(false)
  const [showObjectif, setShowObjectif] = useState(false)
  const [objectifSelectionne, setObjectifSelectionne] = useState(null) // ← objectif ciblé

  function fermerTout() {
    setShowDepot(false)
    setShowObjectif(false)
    setObjectifSelectionne(null)
  }

  function ouvrirRetrait(objectif) {
    fermerTout()
    setObjectifSelectionne(objectif)
  }

  return (
    <div>
      {/* ── CARTE SOLDE ── */}
      <div className="bg-indigo-600 text-white rounded-xl p-6 mb-6 shadow">
        <p className="text-indigo-100 text-sm">Solde disponible</p>
        <p className="text-4xl font-bold mt-1">{soldeLibre.toLocaleString('fr-FR')} FCFA</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          <button onClick={() => { fermerTout(); setShowDepot(true) }}
            className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg text-sm">
            + Mettre de côté
          </button>
          {soldeLibre > 0 && (
            <button onClick={() => { fermerTout(); setShowObjectif(true) }}
              className="bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm border border-white/30">
              + Créer un objectif
            </button>
          )}
        </div>
      </div>

      {showDepot && <DepotForm user={user} soldeActuel={soldeLibre} onSuccess={onDepotSuccess} onCancel={fermerTout} />}
      {showObjectif && <ObjectifForm user={user} profil={profil} soldeLibre={soldeLibre} onSuccess={onObjectifSuccess} onCancel={fermerTout} />}

      {/* ── LISTE DES OBJECTIFS ── */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes objectifs</h2>
        {objectifs.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun objectif. Affecte ton solde libre pour en créer un.</p>
        ) : (
          <div className="space-y-4">
            {objectifs.map((obj) => {
              const progression = Math.min(100, Math.round((obj.montant_actuel / obj.montant_cible) * 100))
              const estAtteint = obj.statut === 'atteint'
              return (
                <div key={obj.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{obj.nom}</span>
                    <div className="flex items-center gap-2">
                      {/* Badge statut */}
                      {estAtteint ? (
                        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          ✅ Atteint
                        </span>
                      ) : (
                        <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                          ⏳ En cours
                        </span>
                      )}
                      <span className={`w-2.5 h-2.5 rounded-full ${obj.couleur_statut === 'rouge' ? 'bg-red-500' : 'bg-green-500'}`} />
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progression}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {Number(obj.montant_actuel).toLocaleString('fr-FR')} / {Number(obj.montant_cible).toLocaleString('fr-FR')} FCFA ({progression}%)
                  </p>

                  {/* Bouton retrait sur chaque objectif */}
                  <button
                    onClick={() => ouvrirRetrait(obj)}
                    className={`w-full text-sm font-semibold py-1.5 rounded-lg border transition-colors ${
                      estAtteint
                        ? 'border-green-500 text-green-600 hover:bg-green-50'
                        : 'border-orange-400 text-orange-500 hover:bg-orange-50'
                    }`}
                  >
                    {estAtteint ? '💰 Retirer les fonds' : '⚠️ Retrait anticipé (-5%)'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── MODALE RETRAIT ── */}
      {objectifSelectionne && (
        <ModalRetrait
          user={user}
          objectif={objectifSelectionne}
          onSuccess={() => { fermerTout(); onRetraitSuccess() }}
          onCancel={fermerTout}
        />
      )}
    </div>
  )
}

export default VueCaisse