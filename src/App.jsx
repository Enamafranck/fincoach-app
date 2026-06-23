import { useState, useEffect } from 'react'
import { authService, supabase } from './services/supabase'
import AuthForm from './components/AuthForm'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [profilExiste, setProfilExiste] = useState(null) // null = pas encore vérifié
  const [chargement, setChargement] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    let initialisationTerminee = false

    async function verifierSession() {
      const { user } = await authService.getCurrentUser()
      setUser(user)
      if (user) {
        await verifierProfil(user.id)
      }
      setChargement(false)
      initialisationTerminee = true  // ✅ On signale que le chargement initial est fini
    }

    verifierSession()

    const { data: listener } = authService.onAuthStateChange(async (_event, session) => {
      // ⛔ On ignore les événements qui arrivent pendant le chargement initial
      // pour éviter que Supabase double-appelle verifierProfil au montage
      if (!initialisationTerminee) return

      const newUser = session?.user ?? null
      setUser(newUser)
      if (newUser) {
        await verifierProfil(newUser.id)
      } else {
        setProfilExiste(null)
      }
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  // Vérifie si une ligne existe déjà dans la table "utilisateurs" pour cet id
  async function verifierProfil(userId) {
    console.log('🔍 Vérification du profil pour userId:', userId)
    const { data, error } = await supabase
      .from('utilisateurs')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    console.log('🔍 Résultat verifierProfil — data:', data, 'error:', error)
    setProfilExiste(!error && !!data)
  }

  // Gère la soumission du formulaire AuthForm (connexion OU inscription)
  async function handleAuthSubmit({ email, password, isSignUp }) {
    setAuthLoading(true)
    setAuthError(null)

    const { data, error } = isSignUp
      ? await authService.signUp(email, password)
      : await authService.signIn(email, password)

    if (error) {
      setAuthError(error.message)
    } else if (data?.user) {
      setUser(data.user)
      await verifierProfil(data.user.id)
    }

    setAuthLoading(false)
  }

  async function handleLogout() {
    await authService.signOut()
    setUser(null)
  }

  if (chargement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!user ? (
        <>
          <AuthForm onSubmit={handleAuthSubmit} loading={authLoading} />
          {authError && (
            <p className="text-center text-red-600 text-sm mt-[-1rem]">{authError}</p>
          )}
        </>
      ) : profilExiste === false ? (
        <Onboarding user={user} onComplete={() => setProfilExiste(true)} />
      ) : profilExiste === true ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Vérification du profil...</p>
        </div>
      )}
    </div>
  )
}

export default App