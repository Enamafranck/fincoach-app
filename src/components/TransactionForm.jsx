import { useState } from 'react'
import { supabase } from '../services/supabase'

const CATEGORIES = ['Alimentation', 'Transport', 'Logement', 'Santé', 'Éducation', 'Loisirs', 'Stock/Activité', 'Autre']

export function TransactionForm({ user, onSuccess, onCancel }) {
  const [type, setType] = useState('depense')
  const [montant, setMontant] = useState('')
  const [categorie, setCategorie] = useState(CATEGORIES[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const val = parseFloat(montant)
    if (Number.isNaN(val) || val <= 0) {
      setError('Montant invalide.')
      return
    }

    setLoading(true)

    const { error: txError } = await supabase.from('transactions').insert([{
      utilisateur_id: user.id,
      montant: val,
      type,
      categorie,
    }])

    setLoading(false)

    if (txError) {
      setError(txError.message)
      return
    }

    setMontant('')
    onSuccess()
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Déclarer une transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setType('revenu')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${type === 'revenu' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            Revenu
          </button>
          <button type="button" onClick={() => setType('depense')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${type === 'depense' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            Dépense
          </button>
        </div>

        <input type="number" min="1" value={montant} onChange={(e) => setMontant(e.target.value)}
          placeholder="Montant (FCFA)" required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />

        <select value={categorie} onChange={(e) => setCategorie(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50">
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-500 hover:text-gray-700">
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

export default TransactionForm