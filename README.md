Projet : Extraire les Informations sur un Produit à Partir d'une Image ou d'un PDF
Description

Cette application React vous permet d'extraire les détails d'un produit, tels que le nom, le prix, la couleur et la nature (catégorie), à partir d'une image ou d'un document PDF téléchargé. Elle utilise les technologies suivantes :

React: Framework d'interface utilisateur frontale pour la construction de l'interface utilisateur.
Tesseract.js: Bibliothèque de reconnaissance optique de caractères (OCR) open-source pour extraire le texte des images.
pdfjs-dist: Bibliothèque JavaScript pour l'analyse et l'extraction du texte des documents PDF.
OpenAI API (Optionnel) : Modèle de langage de grande taille (LLM) basé sur le cloud pour affiner les informations extraites grâce à une invite fine-tuned (nécessite une clé API).
Instructions

Prérequis:

Node.js et npm (ou yarn) installés sur votre système.
Une clé API OpenAI (facultatif, pour une précision accrue).
Installation:

Clonez ce dépôt.
Naviguez dans le répertoire du projet.
Exécutez npm install (ou yarn install) pour installer les dépendances.
Configuration (Optionnel):

Si vous envisagez d'utiliser OpenAI pour le raffinement, créez un fichier .env à la racine du projet et ajoutez la ligne suivante, en remplaçant YOUR_API_KEY par votre clé API OpenAI réelle :

REACT_APP_OPENAI_API_KEY=YOUR_API_KEY
Exécuter l'Application:

Démarrez le serveur de développement : npm start (ou yarn start).
Accédez à l'application dans votre navigateur, généralement à l'adresse http://localhost:3000/.
Utilisation

Cliquez sur le bouton "Choisir un fichier" et sélectionnez une image (.jpg, .jpeg, .png, etc.) ou un document PDF.
Cliquez sur le bouton "Extraire et Traiter le Texte".
Sortie

Si le traitement réussit, l'application affichera les informations extraites sur le produit dans un format JSON, y compris :
productName: Nom du produit (si trouvé).
price: Prix du produit (si trouvé).
color: Couleur du produit (si trouvée).
nature: Catégorie du produit (si trouvée).
En cas d'erreurs ou de problèmes pendant le traitement, l'application affichera des messages d'erreur dans la console.
Remarques supplémentaires

La précision des informations extraites peut varier en fonction de la qualité de l'image ou du PDF téléchargé et de la complexité du contenu.
L'intégration d'OpenAI offre une couche de raffinement optionnelle, susceptible d'améliorer la précision des détails extraits.
