# 💳 Intégration Stripe - Résumé

## ✅ Ce qui a été fait

### 1. Installation des packages
```bash
npm install stripe @stripe/stripe-js micro
```

### 2. Configuration des variables d'environnement
Ajouté dans `.env.local`:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_URL`
- `STRIPE_WEBHOOK_SECRET`

### 3. Nouvelles APIs créées

#### `/api/create-project` 
- Upload l'image originale vers Supabase
- Crée un projet avec `payment_status: 'pending'`
- Retourne le `projectId`

#### `/api/create-checkout-session`
- Crée une session Stripe Checkout (2€)
- Stocke le `stripe_checkout_session_id`
- Redirige vers la page de paiement Stripe

#### `/api/webhooks/stripe`
- Reçoit l'événement `checkout.session.completed`
- **Vérifie la signature webhook** (sécurité)
- Met à jour `payment_status: 'paid'`

#### `/api/process-generation`
- Vérifie que `payment_status === 'paid'`
- Appelle Replicate API (Google Nano Banana)
- Upload l'image générée vers Supabase
- Met à jour le projet avec `output_image_url`

### 4. Modifications de l'interface

#### `ImageEditor.tsx`
- Utilise maintenant `/api/create-project` au lieu de `/api/generate`
- Redirige automatiquement vers le paiement Stripe après création

#### `dashboard.tsx`
- Affiche 3 états pour chaque projet:
  - ⏳ **Paiement requis** → Bouton "Payer 2€"
  - ✓ **Payé - Prêt** → Bouton "Générer"
  - ✓ **Complété** → Bouton "Download"
- Gère le retour après paiement (paramètre `session_id`)
- Fonction `handlePayment()` pour rediriger vers Stripe
- Fonction `handleGenerate()` pour lancer la génération

### 5. Schéma de base de données
La table `projects` utilise maintenant:
- `payment_status`: 'pending' ou 'paid'
- `payment_amount`: 2.00
- `stripe_payment_intent_id`
- `stripe_checkout_session_id`
- `status`: 'pending_payment', 'processing', 'completed', 'failed'

## 🚀 Prochaines étapes

### IMPORTANT: Configuration du webhook

Vous DEVEZ configurer le webhook Stripe avant de tester:

#### Option 1: Développement local (recommandé pour tester)

```bash
# 1. Installer Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: voir https://stripe.com/docs/stripe-cli

# 2. Se connecter
stripe login

# 3. Démarrer le serveur Next.js
npm run dev

# 4. Dans un nouveau terminal, démarrer le forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Stripe CLI affichera un secret comme `whsec_xxxxx`. **Copiez-le et remplacez `STRIPE_WEBHOOK_SECRET` dans `.env.local`**, puis redémarrez le serveur.

#### Option 2: Production

1. Aller sur https://dashboard.stripe.com/test/webhooks
2. Cliquer "Add endpoint"
3. URL: `https://votre-domaine.com/api/webhooks/stripe`
4. Événement: `checkout.session.completed`
5. Copier le "Signing secret" dans `.env.local`

## 🧪 Test du flux complet

1. **Se connecter** à l'application
2. **Uploader une image** + entrer un prompt
3. Cliquer **"Transform Image"**
   - → Projet créé, redirection vers Stripe
4. **Payer avec une carte de test**: `4242 4242 4242 4242`
   - Date: 12/34
   - CVC: 123
5. **Retour sur le dashboard**
   - Le projet affiche "✓ Payé - Prêt"
6. Cliquer **"Générer"**
   - → Génération AI (20-30 secondes)
7. **L'image générée s'affiche**
   - Bouton "Download" disponible

## 📊 Vérifications

### Dans le terminal Stripe CLI
```
✓ checkout.session.completed [evt_xxx]
→ POST http://localhost:3000/api/webhooks/stripe [200]
```

### Dans les logs Next.js
```
✅ Paiement confirmé pour le projet {uuid}
Starting image generation with Replicate...
Generated image URL: ...
Output image uploaded successfully
```

### Dans Supabase
- Vérifier la table `projects`:
  - Ligne avec `payment_status = 'paid'`
  - `output_image_url` rempli après génération

## 🐛 Problèmes courants

### "Webhook signature invalide"
→ Vérifier que `STRIPE_WEBHOOK_SECRET` est correct et redémarrer le serveur

### "Paiement requis pour générer l'image"
→ Le webhook n'a pas été reçu. Vérifier que Stripe CLI est lancé

### L'image ne se génère pas
→ Vérifier les logs Next.js. Le modèle prend 20-30 secondes

## 📄 Documentation

Consultez **`STRIPE_SETUP.md`** pour:
- Guide détaillé de configuration
- Dépannage avancé
- Checklist de déploiement production
- Détails techniques des APIs

## 🎉 Résultat

Votre application a maintenant un système de paiement complet:
- ✅ Création de projet
- ✅ Paiement sécurisé via Stripe
- ✅ Webhook de confirmation
- ✅ Génération AI après paiement
- ✅ Interface utilisateur claire avec états
- ✅ Sécurité (vérification signature + payment_status)

**Prix**: 2€ par génération d'image
**Mode**: Test (utilisez des cartes de test Stripe)
