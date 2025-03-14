# Projet Web Final

Ce dépôt contient le projet final réalisé dans le cadre du cours **Projet Web**. L'application développée permet de gérer des réservations pour un établissement (restaurant ou autre), avec deux types d'utilisateurs : les administrateurs et les clients réguliers.

## Fonctionnalités principales

- **Gestion des réservations :** création, modification, suppression.
- **Gestion des tables :** ajout, modification, suppression des tables disponibles.
- **Gestion des utilisateurs :** inscription, connexion, gestion du profil utilisateur.
- **Interface administrateur :** vue d'ensemble des réservations, gestion des utilisateurs et des tables.
- **Système d'authentification sécurisé** avec gestion des rôles (administrateur/client).
- **Réassignation automatique des tables** pour optimiser l'occupation.

## Pré-requis techniques

- Node.js
- Angular
- PostgreSQL
- Express

## Installation

1. Cloner le dépôt :

```bash
git clone (https://github.com/gregreborn/Projet-Web-Final.git)
cd Projet-Web-Final
```

2. Installer les dépendances :

```bash
npm install
```

3. Configurer la base de données PostgreSQL avec les scripts SQL fournis.

4. Démarrer le serveur :

```bash
npm run start
```

## Utilisateurs prédéfinis pour les tests

Deux comptes utilisateurs sont disponibles par défaut pour faciliter les tests :

| Rôle             | Email               | Mot de passe |
|------------------|---------------------|--------------|
| Administrateur   | `admin@example.com` | `adminpass`  |
| Utilisateur régulier | `user@example.com`  | `regularpass` |

Ces utilisateurs sont insérés automatiquement via le script suivant :
init.sql
## Structure du projet

- `/frontend` : Application Angular côté client
- `/backend` : Serveur Node.js (Express)
- `init.sql` : Scripts SQL pour initialiser la base de données

## Technologies utilisées

- Angular
- Node.js & Express
- PostgreSQL
- JWT pour l'authentification

## Auteur

Gregory Ronald St Facile

## Licence

Ce projet est sous licence MIT.
