import { useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function CoachChat({ user, profil }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const finRef = useRef(null)

  useEffect(() => { chargerHistorique() }, [])
  useEffect(() => { finRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function chargerHistorique() {
    const { data } = await supabase
      .from('messages_chat')
      .select('*')
      .eq('utilisateur_id', user.id)
      .order('date', { ascending: true })
      .limit(20)
    setMessages(data || [])
  }

  async function envoyerMessage(e) {
    e.preventDefault()
    if (!input.trim()) return

    setError('')
    const texteUtilisateur = input.trim()
    setInput('')
    setLoading(true)

    const nouveauMsgUser = { role: 'utilisateur', contenu: texteUtilisateur, date: new Date().toISOString() }
    setMessages((m) => [...m, nouveauMsgUser])

    // Sauvegarde immédiate du message de l'utilisateur dans Supabase
    await supabase.from('messages_chat').insert([{
      utilisateur_id: user.id, role: 'utilisateur', contenu: texteUtilisateur,
    }])

    // Formatage de l'historique des 10 derniers messages pour le schéma attendu par l'API
    const historiqueAPI = [...messages, nouveauMsgUser].slice(-10).map(m => ({
      role: m.role === 'utilisateur' ? 'user' : 'assistant',
      content: m.contenu,
    }))

    try {
      // Appel à ton API FastAPI
      const response = await fetch(`${API_URL}/api/coach/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, // 🔥 Ajout de l'identifiant pour permettre au backend d'extraire le contexte réel
          messages: historiqueAPI 
        }),
      })

      if (!response.ok) throw new Error('Réponse backend invalide')

      const data = await response.json()
      const texteReponse = data.reponse || "Je n'ai pas pu répondre, réessaie."

      const nouveauMsgCoach = { role: 'coach', contenu: texteReponse, date: new Date().toISOString() }
      setMessages((m) => [...m, nouveauMsgCoach])

      // Sauvegarde de la réponse de FinCoach dans Supabase
      await supabase.from('messages_chat').insert([{
        utilisateur_id: user.id, role: 'coach', contenu: texteReponse,
      }])
    } catch (err) {
      setError("Erreur de connexion au Coach (backend lancé ?).")
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col h-96">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Coach FinCoach</h2>
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {messages.length === 0 && <p className="text-sm text-gray-400">Pose une question sur tes finances...</p>}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'utilisateur' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              m.role === 'utilisateur' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
            }`}>{m.contenu}</div>
          </div>
        ))}
        <div ref={finRef} />
      </div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <form onSubmit={envoyerMessage} className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Écris ton message..." disabled={loading}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        <button type="submit" disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
          {loading ? '...' : 'Envoyer'}
        </button>
      </form>
    </div>
  )
}

export default CoachChat