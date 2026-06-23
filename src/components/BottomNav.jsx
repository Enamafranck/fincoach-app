export function BottomNav({ ongletActif, onChange }) {
  const onglets = [
    { id: 'caisse', label: 'Caisse', icon: '🏦' },
    { id: 'transactions', label: 'Mouvements', icon: '📊' },
    { id: 'coach', label: 'Coach', icon: '💬' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 max-w-3xl mx-auto">
      {onglets.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`flex flex-col items-center px-4 py-1 text-xs ${
            ongletActif === o.id ? 'text-indigo-600 font-semibold' : 'text-gray-400'
          }`}
        >
          <span className="text-xl">{o.icon}</span>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default BottomNav
