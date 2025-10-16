# ✅ Checklist Configuration Supabase

## 🔐 1. Variables d'Environnement (.env.local)

Vérifier que ces variables sont définies:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
REPLICATE_API_TOKEN=votre-replicate-token
```

## 🗄️ 2. Table `projects`

### Créer la table:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  input_image_url TEXT NOT NULL,
  output_image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

## 🔒 3. Row Level Security (RLS)

### Activer RLS:

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
```

### Créer les politiques:

```sql
-- Policy: Les utilisateurs peuvent voir leurs propres projets
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent insérer leurs propres projets
CREATE POLICY "Users can insert own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent mettre à jour leurs propres projets
CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent supprimer leurs propres projets
CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = user_id);
```

## 📦 4. Storage Buckets

### Créer les buckets:

1. **input-images**
   - Public: ✅ Oui
   - Allowed MIME types: `image/*`
   - Max file size: 10 MB

2. **output-images**
   - Public: ✅ Oui
   - Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`
   - Max file size: 10 MB

### Politiques de Storage:

```sql
-- Bucket: input-images
-- Policy: Tout le monde peut lire
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'input-images');

-- Policy: Utilisateurs authentifiés peuvent uploader
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'input-images' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Service role peut tout faire
CREATE POLICY "Service role full access"
  ON storage.objects FOR ALL
  USING (bucket_id = 'input-images');

-- Bucket: output-images (mêmes policies)
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'output-images');

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'output-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Service role full access"
  ON storage.objects FOR ALL
  USING (bucket_id = 'output-images');
```

## 📧 5. Authentification Email

### Configuration dans Supabase Dashboard:

1. Aller dans **Authentication** → **Settings**
2. **Email Auth** doit être activé ✅
3. **Confirm email** : ❌ Désactivé pour dev (optionnel en prod)
4. **Secure email change** : ✅ Activé (recommandé)

### URLs de redirection:

Ajouter ces URLs autorisées dans **Authentication** → **URL Configuration**:

```
http://localhost:3000
http://localhost:3000/dashboard
http://localhost:3000/login
http://localhost:3000/signup
```

## 🧪 6. Tester la Configuration

### Test 1: Connexion à Supabase

Créer un fichier `test-supabase-config.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  // Test 1: Connection
  const { data, error } = await supabase.from('projects').select('count');
  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Connected to Supabase!');
  }

  // Test 2: Storage buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error('❌ Storage error:', bucketsError);
  } else {
    console.log('✅ Storage buckets:', buckets.map(b => b.name).join(', '));
  }
}

testConnection();
```

Exécuter:
```bash
node test-supabase-config.js
```

### Test 2: Inscription d'un utilisateur

1. Aller sur http://localhost:3000
2. Cliquer sur "Get Started"
3. Remplir:
   - Email: `test@example.com`
   - Password: `test123456`
4. Vérifier dans Supabase Dashboard → Authentication → Users

### Test 3: Création d'un projet

1. Se connecter avec le compte test
2. Aller sur /dashboard
3. Uploader une image
4. Entrer un prompt: "make it colorful"
5. Cliquer sur "Generate Image"
6. Vérifier dans Supabase Dashboard → Table Editor → projects

## 🔧 Résolution de Problèmes

### Erreur: "relation 'projects' does not exist"
**Solution**: Créer la table `projects` avec le SQL ci-dessus

### Erreur: "new row violates row-level security policy"
**Solution**: Vérifier que les politiques RLS sont créées et que user_id correspond

### Erreur: "Failed to upload to storage bucket"
**Solution**: 
1. Vérifier que les buckets existent
2. Vérifier les politiques de storage
3. Vérifier que les buckets sont publics

### Erreur: "Invalid API key"
**Solution**: 
1. Vérifier `.env.local`
2. Redémarrer le serveur Next.js (`npm run dev`)
3. Vérifier que les clés viennent du bon projet Supabase

## ✨ Configuration Complète !

Si tous les tests passent ✅, votre configuration Supabase est prête !

### Commandes Rapides

```bash
# Créer la table + RLS en une fois
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase-setup.sql

# Ou copier-coller dans SQL Editor de Supabase Dashboard
```

### Script Complet (supabase-setup.sql déjà fourni)

Le fichier `supabase-setup.sql` à la racine du projet contient tout le SQL nécessaire.
