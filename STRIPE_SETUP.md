# Configuration Stripe - Guide Complet

## ✅ Étape 1: Variables d'environnement (Déjà fait)

Les clés Stripe ont été ajoutées au fichier `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SIp9SEke5ZzoN4r...
STRIPE_SECRET_KEY=sk_test_51SIp9SEke5ZzoN4r...
NEXT_PUBLIC_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

## 🚀 Étape 2: Configuration du Webhook Stripe

### En développement local (avec Stripe CLI)

1. **Installer Stripe CLI**:
   ```bash
   # Windows (avec Scoop)
   scoop install stripe
   
   # Ou télécharger depuis: https://stripe.com/docs/stripe-cli
   ```

2. **Se connecter à Stripe**:
   ```bash
   stripe login
   ```

3. **Démarrer le serveur Next.js**:
   ```bash
   npm run dev
   ```

4. **Dans un nouveau terminal, démarrer le webhook forwarding**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

5. **Copier le webhook secret**:
   - Stripe CLI affichera quelque chose comme: `whsec_xxxxxxxxxxxxx`
   - Remplacer `STRIPE_WEBHOOK_SECRET` dans `.env.local` avec cette valeur
   - Redémarrer le serveur Next.js

### En production (Stripe Dashboard)

1. **Aller sur Stripe Dashboard**: https://dashboard.stripe.com/test/webhooks

2. **Cliquer sur "Add endpoint"**

3. **Configurer l'endpoint**:
   - **URL**: `https://votre-domaine.com/api/webhooks/stripe`
   - **Description**: "Tennis AI Image Generation Payments"
   - **Events to listen**: Sélectionner `checkout.session.completed`

4. **Copier le Webhook Secret**:
   - Après création, cliquer sur l'endpoint
   - Révéler le "Signing secret"
   - Remplacer `STRIPE_WEBHOOK_SECRET` dans `.env.local` en production

## 🔄 Flux de paiement

### 1. Création du projet
```
Utilisateur → Upload image + prompt → /api/create-project
  ↓
Projet créé avec status: "pending_payment", payment_status: "pending"
```

### 2. Paiement
```
Utilisateur clique "Payer 2€" → /api/create-checkout-session
  ↓
Redirection vers Stripe Checkout (carte bancaire)
  ↓
Paiement réussi → Redirection vers /dashboard?session_id={ID}
```

### 3. Webhook de confirmation
```
Stripe → /api/webhooks/stripe (checkout.session.completed)
  ↓
Vérification de la signature
  ↓
Mise à jour: payment_status: "paid"
```

### 4. Génération de l'image
```
Utilisateur clique "Générer" → /api/process-generation
  ↓
Vérification: payment_status === "paid"
  ↓
Appel Replicate API (Google Nano Banana)
  ↓
Upload image générée → Supabase Storage
  ↓
Mise à jour: status: "completed", output_image_url
```

## 🛡️ Sécurité

### Vérification de la signature webhook
Le webhook vérifie automatiquement la signature Stripe pour prévenir les attaques:

```typescript
event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

⚠️ **CRITIQUE**: Ne JAMAIS désactiver cette vérification en production!

### Vérification du paiement
L'API `/api/process-generation` vérifie que `payment_status === 'paid'` avant de générer:

```typescript
if (project.payment_status !== 'paid') {
  return res.status(403).json({ error: 'Paiement requis' });
}
```

## 🧪 Test du flux complet

### 1. Tester avec une carte de test Stripe

Cartes de test recommandées:
- **Succès**: `4242 4242 4242 4242`
- **Échec**: `4000 0000 0000 0002`
- **Date d'expiration**: N'importe quelle date future (ex: 12/34)
- **CVC**: N'importe quel 3 chiffres (ex: 123)

### 2. Scénario de test complet

1. Se connecter à l'application
2. Uploader une image + entrer un prompt
3. Cliquer sur "Transform Image" (création du projet)
4. Être redirigé vers le paiement Stripe
5. Entrer la carte de test: `4242 4242 4242 4242`
6. Confirmer le paiement
7. Être redirigé vers `/dashboard`
8. Le projet affiche "✓ Payé - Prêt"
9. Cliquer sur "Générer"
10. Attendre 20-30 secondes (génération AI)
11. L'image générée s'affiche avec le bouton "Download"

### 3. Vérifier les webhooks

Dans le terminal Stripe CLI, vous devriez voir:
```
✓ checkout.session.completed [evt_xxx]
→ POST http://localhost:3000/api/webhooks/stripe [200]
```

Dans les logs Next.js:
```
✅ Paiement confirmé pour le projet {projectId}
```

## 📊 Base de données

### Structure de la table `projects`

```sql
id: uuid (PK)
user_id: uuid (FK -> auth.users)
input_image_url: text
output_image_url: text (NULL si non généré)
prompt: text
status: text ('pending_payment', 'processing', 'completed', 'failed')
payment_status: text ('pending', 'paid')
payment_amount: numeric (2.00)
stripe_payment_intent_id: text
stripe_checkout_session_id: text
created_at: timestamp
```

### États possibles

| payment_status | status | output_image_url | Action disponible |
|---------------|--------|------------------|-------------------|
| `pending` | `pending_payment` | `null` | "Payer 2€" |
| `paid` | `pending_payment` | `null` | "Générer" |
| `paid` | `processing` | `null` | (Génération en cours) |
| `paid` | `completed` | URL | "Download" |

## 🐛 Dépannage

### Erreur: "Webhook signature invalide"
- Vérifier que `STRIPE_WEBHOOK_SECRET` est correct dans `.env.local`
- Redémarrer le serveur Next.js après modification
- En dev: vérifier que Stripe CLI est bien lancé

### Erreur: "Paiement requis pour générer l'image"
- Vérifier que le webhook a bien été reçu
- Regarder les logs Stripe CLI
- Vérifier dans Supabase que `payment_status = 'paid'`

### Le webhook ne reçoit rien
- Vérifier que Stripe CLI est lancé avec la bonne URL
- Vérifier que l'endpoint est accessible (pas de pare-feu)
- En production: vérifier que l'URL webhook est publique (HTTPS)

### L'image ne se génère pas
- Vérifier les logs Next.js pour les erreurs Replicate
- Vérifier que `REPLICATE_API_TOKEN` est valide
- Le modèle Google Nano Banana prend 20-30 secondes

## 💰 Tarification

- **Prix par génération**: 2.00 EUR
- **Mode**: Test (cartes de test uniquement)
- **Conversion**: 200 cents (unité Stripe)

Pour passer en production:
1. Activer le compte Stripe (vérification d'identité)
2. Remplacer les clés test (`pk_test_`, `sk_test_`) par les clés live (`pk_live_`, `sk_live_`)
3. Configurer le webhook en production (HTTPS requis)

## 📝 APIs créées

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/create-project` | POST | Crée un projet et upload l'image originale |
| `/api/create-checkout-session` | POST | Crée une session Stripe Checkout |
| `/api/webhooks/stripe` | POST | Reçoit les confirmations de paiement |
| `/api/process-generation` | POST | Lance la génération AI (après paiement) |

## ✅ Checklist de déploiement

- [ ] Vérifier les variables d'environnement en production
- [ ] Configurer le webhook Stripe en production (HTTPS)
- [ ] Tester avec une vraie carte en mode test
- [ ] Vérifier les logs de webhook dans Stripe Dashboard
- [ ] Configurer les alertes d'erreur (Sentry, LogRocket, etc.)
- [ ] Activer les emails de confirmation Stripe
- [ ] Configurer la politique de remboursement
- [ ] Ajouter les mentions légales (CGV, politique de confidentialité)
