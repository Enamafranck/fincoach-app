# Guide Intégration Supabase

## Configuration Supabase pour FinCoach

### 1. Créer un projet Supabase

1. Aller sur https://supabase.com
2. Cliquer sur "New Project"
3. Remplir les détails:
   - **Project Name**: fincoach
   - **Database Password**: Générer un mot de passe fort
   - **Region**: Choisir la région la plus proche

### 2. Configurer l'Authentification

#### Setup Authentification
1. Aller dans "Authentication" > "Providers"
2. Activer "Email" (actif par défaut)
3. Configurer les paramètres:
   - Enable Email Confirmations (recommandé)
   - Auto-confirm users (optionnel, pour développement)

#### Configuration Email
- Supabase fournit un provider SMTP par défaut
- Pour la production, configurer votre propre SMTP

### 3. Créer les Tables de Base de Données

Exécuter ces commandes SQL dans l'éditeur SQL de Supabase:

```sql
-- Table utilisateurs (géré par Supabase Auth)
-- La table auth.users existe déjà

-- Table transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  description TEXT,
  category VARCHAR(50),
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('income', 'expense', 'transfer')),
  date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  limit_amount DECIMAL NOT NULL,
  spent_amount DECIMAL DEFAULT 0,
  month VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Ajouter des index
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_month ON budgets(month);
```

### 4. Configurer les Row Level Security (RLS)

Pour sécuriser l'accès aux données:

```sql
-- Activer RLS sur transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs ne voient que leurs propres transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Activer RLS sur budgets
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Récupérer les Clés API

1. Aller dans "Settings" > "API"
2. Copier les clés:
   - **Project URL**: `VITE_SUPABASE_URL`
   - **anon key**: `VITE_SUPABASE_ANON_KEY`
   - **service_role key**: À garder secret (backend seulement)

### 6. Configurer Frontend (.env)

Créer `.env` dans le dossier `src/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:8000/api
```

### 7. Configurer Backend (.env)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-from-settings
```

### 8. Intégration Authentification Frontend

Utiliser le service Supabase déjà créé:

```javascript
import { authService } from './services/supabase'

// Inscription
const { data, error } = await authService.signUp(email, password)

// Connexion
const { data, error } = await authService.signIn(email, password)

// Monitorer les changements d'authentification
const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, 'Session:', session)
})
```

### 9. Intégration Backend avec Supabase

Utiliser le client Supabase dans le backend:

```python
from supabase import create_client
from app.config import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Vérifier le token JWT
def verify_supabase_token(token: str):
    try:
        user = supabase.auth.get_user(token)
        return user
    except Exception as e:
        return None
```

### 10. Sauvegardes et Récupération

#### Activer les sauvegardes automatiques
1. Aller dans "Backups"
2. S'assurer que les sauvegardes sont activées
3. Configurer la fréquence (quotidienne recommandée)

#### Exporter les données
```bash
# Exporter avec pg_dump
pg_dump --host db.your-project.supabase.co \
  --username postgres \
  --password \
  --format custom \
  fincoach > fincoach_backup.dump
```

## Checklist de Configuration

- [ ] Créer un projet Supabase
- [ ] Configurer l'authentification email
- [ ] Créer les tables (transactions, budgets)
- [ ] Configurer le RLS
- [ ] Récupérer les clés API
- [ ] Configurer `.env` frontend
- [ ] Configurer `.env` backend
- [ ] Tester la connexion
- [ ] Configurer les sauvegardes

## Ressources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Python Client](https://supabase.com/docs/reference/python/introduction)

## Support

- Support Supabase: https://supabase.com/support
- Discord Community: https://discord.supabase.com
