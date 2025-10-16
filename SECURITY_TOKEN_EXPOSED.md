# 🚨 SÉCURITÉ - Token API Exposé

## ⚠️ ACTION IMMÉDIATE REQUISE

Un token Replicate API a été détecté dans votre commit. Ce token est maintenant **exposé publiquement**.

## 🔴 ÉTAPES URGENTES

### 1. Révoquer le Token Exposé

1. Allez sur https://replicate.com/account/api-tokens
2. Trouvez le token exposé (celui qui commence par `r8_...`)
3. Cliquez sur **"Revoke"** ou **"Delete"**
4. Confirmez la révocation

### 2. Créer un Nouveau Token

1. Sur la même page: https://replicate.com/account/api-tokens
2. Cliquez sur **"Create token"**
3. Donnez-lui un nom: `Tennis App - Dev`
4. Copiez le nouveau token (il commence par `r8_...`)

### 3. Mettre à Jour .env.local

1. Ouvrez `.env.local`
2. Remplacez l'ancien token:

```bash
# Remplacez cette ligne avec votre ancien token exposé
REPLICATE_API_TOKEN=your_old_exposed_token

# Par le nouveau token:
REPLICATE_API_TOKEN=votre_nouveau_token_ici
```

3. Sauvegardez le fichier
4. **NE COMMITTEZ JAMAIS ce fichier !**

### 4. Vérifier .gitignore

Le fichier `.gitignore` doit contenir:

```
.env.local
.env*.local
```

Vérifiez que c'est bien le cas.

### 5. Nettoyer l'Historique Git

Le token est dans l'historique Git. Vous avez deux options:

#### Option A: Forcer le Push (Simple mais Destructif)

```bash
# Attention: cela écrase l'historique distant !
git add TROUBLESHOOTING.md
git commit -m "fix: remove exposed API token from documentation"
git push --force
```

⚠️ **Attention**: Cela écrase l'historique. Ne faites cela que si vous êtes le seul à travailler sur ce repo.

#### Option B: Supprimer le Commit de l'Historique (Recommandé)

```bash
# 1. Vérifier l'historique
git log --oneline

# 2. Faire un rebase interactif (remplacez N par le nombre de commits)
git rebase -i HEAD~N

# 3. Dans l'éditeur, remplacez "pick" par "drop" pour le commit problématique
# 4. Sauvegardez et fermez

# 5. Force push
git push --force
```

### 6. Redémarrer le Serveur

Après avoir mis à jour le token:

```bash
# Arrêtez le serveur (Ctrl+C)
# Redémarrez
npm run dev
```

## ✅ Vérification

Testez que le nouveau token fonctionne:

1. Allez sur http://localhost:3000
2. Essayez de générer une image
3. Si ça fonctionne, le nouveau token est OK ✅

## 🔒 Bonnes Pratiques de Sécurité

### Ce qu'il faut TOUJOURS faire:

✅ **Garder les tokens dans `.env.local`** (jamais commité)
✅ **Utiliser des variables d'environnement**
✅ **Vérifier `.gitignore` avant chaque commit**
✅ **Révoquer immédiatement les tokens exposés**

### Ce qu'il ne faut JAMAIS faire:

❌ **Mettre des tokens dans le code**
❌ **Committer `.env.local`**
❌ **Partager des tokens publiquement**
❌ **Laisser des tokens dans la documentation**

## 📝 Checklist de Sécurité

Avant chaque commit:

- [ ] ✅ Vérifier qu'aucun fichier `.env*` n'est commité
- [ ] ✅ Vérifier qu'aucun token n'est dans le code
- [ ] ✅ Vérifier `.gitignore` est à jour
- [ ] ✅ Faire un `git diff` avant de commit

## 🛡️ Protection Future

### Ajouter un Pre-commit Hook

Créez `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Vérifier les secrets avant commit
if git diff --cached | grep -E "r8_[A-Za-z0-9]{30,}"; then
    echo "❌ ERROR: Replicate API token detected!"
    echo "Remove the token before committing."
    exit 1
fi

if git diff --cached | grep -E "eyJ[A-Za-z0-9_-]{30,}"; then
    echo "❌ ERROR: Supabase key detected!"
    echo "Remove the key before committing."
    exit 1
fi

exit 0
```

Rendez-le exécutable:
```bash
chmod +x .git/hooks/pre-commit
```

## 🆘 Si le Token a Déjà Été Utilisé par Quelqu'un

1. **Vérifiez votre usage Replicate**:
   - https://replicate.com/account/billing
   - Regardez les appels API récents

2. **Si usage suspect**:
   - Contactez le support Replicate
   - Signalez l'incident

3. **Changez tous vos tokens**:
   - Replicate
   - Supabase
   - Tout autre service

## ✅ Résolution Rapide

```bash
# 1. Corriger le fichier (déjà fait ✅)

# 2. Commit la correction
git add TROUBLESHOOTING.md
git commit -m "fix: remove exposed API token"

# 3. Push avec force (écrase l'ancien commit)
git push --force

# 4. Révoquer l'ancien token sur Replicate ⚠️

# 5. Créer un nouveau token ✅

# 6. Mettre à jour .env.local ✅

# 7. Redémarrer le serveur
npm run dev
```

---

**⚠️ IMPORTANT**: La correction du fichier a été faite, mais vous **DEVEZ** révoquer le token exposé sur Replicate immédiatement !
