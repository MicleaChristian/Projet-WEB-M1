# 📚 Projet Web - Secure Docs

## 🔐 Plateforme sécurisée de gestion documentaire

### 👨‍💻 Réalisé par :
- **Wassim BACHA**
- **Christian MICLEA**
- **Jimmy LETTE-VOUETO**

### 🎓 Formation :
Master 1 EFREI – Parcours Développement Fullstack & Management

---

## 📌 Objectif du projet

Créer une **application sécurisée** de gestion documentaire, permettant aux utilisateurs :
- de **s'authentifier**,
- de **créer, consulter et supprimer des documents** numériques,
- avec **gestion de rôles**, **file d’attente de traitement**, **API GraphQL**,
- et un **déploiement automatisé** via CI/CD.

---

## ⚙️ Stack technique

| Technologie         | Rôle                                                 |
|---------------------|------------------------------------------------------|
| **NestJS**          | Backend API (architecture modulaire)                |
| **GraphQL**         | API déclarative avec `@nestjs/graphql` (code-first) |
| **Redis + BullMQ**  | File de message pour traitement asynchrone          |
| **Docker**          | Conteneurisation et déploiement                     |
| **GitHub Actions**  | Intégration et déploiement continu                  |
| **Jest**            | Tests unitaires et d’intégration                    |
| **Prisma + PostgreSQL** | ORM et base de données relationnelle            |
| **Passport.js + JWT** | Authentification sécurisée                        |
| **React (bonus)**   | Interface utilisateur (création/visualisation docs) |

---

## 🧠 Architecture générale

User → Frontend (React)
→ Backend NestJS (GraphQL)
↳ Services / Resolvers
↳ Prisma ORM (PostgreSQL)
↳ BullMQ → Redis (job queue)


---

## ✅ Fonctionnalités principales

- Authentification par JWT
- Rôles utilisateurs : `user`, `admin`
- Création / lecture / suppression de documents
- Notification via BullMQ (log, audit, analytics)
- Tests automatisés
- CI/CD : Build, Test, Deploy avec GitHub Actions
- Déploiement Docker (Render ou Heroku)
- Upload de fichiers (optionnel)

---

## 🧪 Qualité logicielle

- Convention de code NestJS
- Tests unitaires (services, resolvers)
- Tests d’intégration (base en mémoire)
- Collection Postman + tests automatisés (Newman)
- Pipeline CI complète

---

## 🚀 Lancement local

```bash
# Installation
npm install

# Lancement Redis (nécessite docker)
docker-compose up -d

# Démarrage de l'application
npm run start

# Accès GraphQL Playground
http://localhost:3000/graphql
```
