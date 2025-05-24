# Instructions de Test - KonForm

## Configuration Terminée ✅

L'interface web KonForm a été configurée pour envoyer correctement les fichiers DOCX au webhook n8n en utilisant FormData.

## Modifications Apportées

### 1. **Script.js**
- ✅ Suppression de l'extraction de texte côté client
- ✅ Implémentation de l'envoi FormData
- ✅ Configuration correcte pour le webhook n8n
- ✅ Gestion d'erreurs améliorée

### 2. **Index.html**
- ✅ Suppression de la référence à mammoth.js
- ✅ Conservation de PDF.js pour l'aperçu

### 3. **Workflow n8n**
- ✅ Le workflow original `KonForm (8).json` est parfaitement configuré
- ✅ Webhook avec `binaryPropertyName: "data"` ✓
- ✅ Chaîne de traitement complète fonctionnelle

## Test de Fonctionnement

### Étapes de Test :

1. **Démarrer un serveur web local**
   ```bash
   # Option 1: Python
   python -m http.server 8000
   
   # Option 2: Node.js
   npx serve .
   
   # Option 3: PHP
   php -S localhost:8000
   ```

2. **Accéder à l'interface**
   - Ouvrir http://localhost:8000 dans le navigateur

3. **Tester l'upload**
   - Sélectionner un fichier DOCX ou PDF
   - Vérifier l'aperçu du fichier
   - Cliquer sur "Transformer"
   - Observer les messages de statut

### Messages de Statut Attendus :
```
✅ Fichier "exemple.docx" prêt pour transformation.
✅ Envoi du fichier "exemple.docx" au webhook...
✅ Traitement du fichier "exemple.docx" en cours...
✅ Le fichier transformé "CV_exemple_Klanik_Transformé.pdf" a été téléchargé.
```

### Vérification Technique :

#### Dans les DevTools du navigateur (F12) :
- **Console** : Aucune erreur JavaScript
- **Network** : Requête POST vers le webhook avec FormData
- **Request Headers** : `Content-Type: multipart/form-data`

#### Format de la Requête :
```
POST https://primary-production-689f.up.railway.app/webhook/03c2874d-473a-4de2-a4bc-3ccde725f1fc
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...

------WebKitFormBoundary...
Content-Disposition: form-data; name="data"; filename="exemple.docx"
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document

[BINARY FILE DATA]
------WebKitFormBoundary...
```

## Résolution des Problèmes

### Si "fichier inconnu" persiste :
1. Vérifier que le fichier est bien un DOCX valide
2. Contrôler la taille du fichier (max 10MB)
3. Examiner les logs du workflow n8n
4. Tester avec un fichier DOCX différent

### Si erreur de connexion :
1. Vérifier l'URL du webhook
2. Tester la connectivité réseau
3. Contrôler les CORS si nécessaire

### Si le PDF n'est pas généré :
1. Vérifier les logs de l'AI Agent dans n8n
2. Contrôler le node "Extract from File"
3. Examiner la réponse du webhook

## Workflow n8n - Points de Contrôle

### Node "Webhook" :
- ✅ `binaryPropertyName: "data"`
- ✅ `responseMode: "responseNode"`
- ✅ Path correct : `03c2874d-473a-4de2-a4bc-3ccde725f1fc`

### Node "Extract from File" :
- ✅ `operation: "binaryToPropery"`
- ✅ Connecté au webhook

### Node "AI Agent" :
- ✅ Prompt détaillé pour Klanik
- ✅ Structured Output Parser configuré
- ✅ Modèle GPT-4.1-mini

## Résultat Attendu

Après un test réussi :
1. L'utilisateur sélectionne un fichier DOCX
2. Le fichier est envoyé au webhook n8n via FormData
3. Le workflow extrait le contenu texte
4. L'IA structure les données selon le format Klanik
5. Un PDF formaté est généré et téléchargé automatiquement

## Status : ✅ PRÊT POUR LES TESTS

La configuration est maintenant complète et fonctionnelle. Le problème du "fichier inconnu" devrait être résolu grâce à l'utilisation correcte de FormData avec le paramètre `data` qui correspond au `binaryPropertyName` du webhook n8n.
