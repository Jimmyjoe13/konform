# 🚀 KonForm - Guide de Développement

Ce document est un guide étape par étape pour développer l'interface web KonForm. Suivez ces instructions séquentiellement pour créer une application fonctionnelle qui enverra les CV au workflow n8n.

## 📋 Objectif du projet

Créer une interface web permettant aux business managers de Klanik d'envoyer des CV au webhook n8n (ID: `03c2874d-473a-4de2-a4bc-3ccde725f1fc`) pour reformatage automatique.

---

## 🔄 Étape 1: Structure de base

### Fichiers à créer
- `index.html` - Page principale
- `styles.css` - Styles et charte graphique Klanik
- `script.js` - Logique de l'application
- `assets/` - Dossier pour les ressources (logo, icônes)

### HTML: Structure minimale
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KonForm - Klanik</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <!-- Logo et titre -->
    </header>
    
    <main>
        <!-- Zone de sélection/upload -->
        <!-- Zone de prévisualisation -->
        <!-- Bouton d'action et statut -->
    </main>
    
    <footer>
        <!-- Informations de copyright -->
    </footer>
    
    <script src="script.js"></script>
</body>
</html>
```

### CSS: Variables de design
```css
:root {
    --klanik-blue: #0046cc;
    --klanik-light-blue: #f0f6ff;
    --klanik-dark: #333333;
    --klanik-light: #ffffff;
    /* Plus de variables à définir */
}

/* Structure de base et styles à implémenter */
```

---

## 🎨 Étape 2: Interface utilisateur

### Header
- Intégrer le logo Klanik (texte "KLANIK" en bleu #0046cc)
- Ajouter le sous-titre "HUMAN MADE TECHNOLOGY"
- Créer une barre bleue avec le texte "KONFORM" en blanc

### Zone principale
- Créer une carte pour la sélection du consultant
- Ajouter un sélecteur de fichier PDF avec drag & drop
- Concevoir une zone de prévisualisation du PDF
- Créer un bouton d'action principal "Transformer"
- Ajouter une zone de statut/progression

### Responsive design
- S'assurer que l'interface s'adapte aux différentes tailles d'écran
- Prioriser l'expérience desktop (usage principal)

---

## 📂 Étape 3: Gestion des fichiers

### Upload de fichiers
- Implémenter la sélection de fichier via input
- Ajouter le drag & drop pour l'upload
- Valider le type de fichier (PDF uniquement)
- Limiter la taille du fichier (max 10MB)

### Prévisualisation
- Intégrer PDF.js pour prévisualiser le document
- Créer une miniature du PDF sélectionné
- Afficher les métadonnées basiques (nom, taille)

```javascript
// Exemple de code pour validation et prévisualisation
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (validateFile(file)) {
        previewPDF(file);
    }
}

function validateFile(file) {
    // Code de validation
}

function previewPDF(file) {
    // Code de prévisualisation avec PDF.js
}
```

---

## 🔌 Étape 4: Intégration webhook

### Préparation des données
- Convertir le PDF en base64
- Préparer la structure de requête

### Communication avec n8n
- Implémenter l'appel API vers le webhook
- Utiliser `fetch` ou `axios` pour l'envoi
- URL du webhook: `https://[votre-domaine-n8n]/webhook/03c2874d-473a-4de2-a4bc-3ccde725f1fc`

```javascript
async function sendToWebhook(fileData) {
    // Préparer les données
    const formData = new FormData();
    formData.append('file', fileData);
    
    // Envoyer au webhook
    try {
        const response = await fetch('https://[votre-domaine-n8n]/webhook/03c2874d-473a-4de2-a4bc-3ccde725f1fc', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.blob();
            // Gérer le PDF reçu
            handleTransformedPDF(result);
        } else {
            // Gérer l'erreur
            showError('Erreur lors du traitement');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur de connexion');
    }
}
```

### Gestion des états
- Afficher l'état "En cours de traitement"
- Gérer les timeouts et les erreurs
- Implémenter une logique de retry

---

## 📥 Étape 5: Réception et téléchargement

### Traitement de la réponse
- Récupérer le PDF transformé
- Gérer les cas d'erreur possibles

### Téléchargement automatique
- Générer un lien de téléchargement pour le fichier reçu
- Déclencher le téléchargement automatique
- Proposer une option pour visualiser avant téléchargement

```javascript
function handleTransformedPDF(pdfBlob) {
    // Créer URL pour le blob
    const url = URL.createObjectURL(pdfBlob);
    
    // Créer élément de téléchargement
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CV_Klanik_Transformé.pdf';
    
    // Déclencher le téléchargement
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Libérer l'URL
    URL.revokeObjectURL(url);
    
    // Mettre à jour l'UI
    updateUIAfterSuccess();
}
```

---

## 📱 Étape 6: Améliorations UX

### Retours visuels
- Animations de chargement
- Notifications de succès/erreur
- Transitions entre les états

### Historique de traitement
- Stocker les 5 derniers CV traités (localStorage)
- Permettre de les retélécharger

### Optimisations de performance
- Compression des ressources
- Chargement asynchrone
- Mise en cache appropriée

---

## 🧪 Étape 7: Tests et validation

### Tests fonctionnels
- Vérifier l'upload de fichiers
- Tester l'envoi au webhook
- Valider le téléchargement

### Tests utilisateurs
- Vérifier que l'interface est intuitive
- S'assurer que les messages d'erreur sont clairs
- Confirmer que le temps de traitement est acceptable

---

## 📈 Étape 8: Déploiement

### Options de déploiement
- Serveur Klanik
- Solution d'hébergement statique (Netlify, Vercel)
- Intégration dans intranet existant

### Finalisation
- Compression des ressources
- Tests de charge
- Documentation utilisateur

---

## 🛠 Notes techniques importantes

### Communication avec le webhook
Le workflow n8n attend un PDF en binaire. Assurez-vous que:
- Le fichier est envoyé correctement dans le corps de la requête
- Les en-têtes Content-Type sont appropriés
- La réponse est traitée comme un blob pour le téléchargement

### Sécurité
- Validez toujours les fichiers avant envoi
- Ne stockez pas d'informations sensibles en localStorage
- Mettez en place des limites appropriées (taille de fichier, nombre de requêtes)

### Compatibilité navigateur
- Ciblez les navigateurs modernes (Chrome, Firefox, Edge)
- Testez sur différentes résolutions d'écran
- Assurez une dégradation gracieuse des fonctionnalités

---

## 🎯 Objectifs de développement

- ✅ Interface complète et fonctionnelle
- ✅ Communication bidirectionnelle avec le webhook
- ✅ Téléchargement automatique des PDF transformés
- ✅ Expérience utilisateur fluide et intuitive
- ✅ Code maintenable et bien documenté

---

*Suivez ce guide étape par étape pour développer l'interface web KonForm. Chaque section représente une phase de développement progressive qui vous amènera à une solution complète et fonctionnelle.*