# Utilisation de l’image officielle Node.js
FROM node:18

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Installation des dépendances
# Supprimer node_modules avant d'installer
RUN npm install && npm rebuild bcrypt --build-from-source

# Copie du reste des fichiers du backend
COPY . .

# Exposition du port utilisé par l’API
EXPOSE 5000

# Commande de démarrage du serveur
CMD ["node", "server.js"]
