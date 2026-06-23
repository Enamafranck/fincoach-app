import { useState } from 'react'
import { supabase } from '../services/supabase'

export function Onboarding({ user, onComplete }) {
  const [prenom, setPrenom] = useState('')
  const [typeRevenu, setTypeRevenu] = useState('fixe')
  const [montant, setMontant] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const labelMontant = typeRevenu === 'fixe' ? 'Revenu mensuel' : 'Minimum mensuel estimé'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!user?.id) {
      setError('Utilisateur non connecté.')
return
    }

    const montantValue = parseFloat(montant.replace(',', '.'))
    if (Number.isNaN(montantValue) || montantValue <= 0) {
      setError('Veuillez saisir un montant valide.')
      return
    }

    setLoading(true)

    const { error: insertError } = await supabase.from('utilisateurs').insert([
      {
        id: user.id,
        prenom: prenom.trim(),
        type_revenu: typeRevenu,
        montant_revenu_estime: montantValue,
      },
    ])

    setLoading(false)

    if (insertError) {
      setError(insertError.message || 'Une erreur est survenue lors de l’enregistrement.')
      return
    }

    onComplete()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Bienvenue sur FinCoach</h1>
        <p className="text-gray-600 mb-6">Quelques informations pour configurer ton espace.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ton prénom"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Type de revenu</span>
            <div className="grid grid-cols-2 gap-3">
              <label className={`cursor-pointer rounded-xl border px-4 py-3 text-center ${typeRevenu === 'fixe' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700'}`}>
                <input
                  type="radio"
                  name="typeRevenu"
                  value="fixe"
                  checked={typeRevenu === 'fixe'}
                  onChange={() => setTypeRevenu('fixe')}
                  className="sr-only"
                />
                Revenu fixe
              </label>
              <label className={`cursor-pointer rounded-xl border px-4 py-3 text-center ${typeRevenu === 'variable' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700'}`}>
                <input
                  type="radio"
                  name="typeRevenu"
                  value="variable"
                  checked={typeRevenu === 'variable'}
                  onChange={() => setTypeRevenu('variable')}
                  className="sr-only"
                />
                Revenu variable
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{labelMontant}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="0"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Valider'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Onboarding
