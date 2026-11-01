# Lieluwish 🎁

Application web (PWA) pour gérer les listes de cadeaux des enfants : les parents ajoutent les idées
(à deux, chacun avec son compte), les grands-parents consultent via un **lien public en lecture
seule**, sans compte, sur le modèle du lien de partage de [Kigardeki](https://github.com/notsogeek87/kigardeki).

> Avant novembre 2026, Lieluwish était une app Android de wishlist LEGO Ninjago (Kotlin/Compose).
> Ce code reste disponible dans l'historique Git (commit `dd94a1c` et avant).

## Fonctionnalités

- **Enfants** : prénom + couleur.
- **Cadeaux** par enfant : nom, lien (http/https uniquement), prix, occasion (« Noël 2026 » proposé par
  défaut, « Anniversaire »…), statut **Idée / Prévu / Acheté**, « offert par », notes privées,
  ❤️ coup de cœur, 🙈 surprise (masqué du lien public).
- Filtres par enfant et par occasion, résumé par enfant (nombre, encore libres, budget total).
  Changement de statut en un clic depuis la liste.
- **Deux parents** : le premier crée la famille, puis invite l'autre (*Réglages* → lien personnel à
  usage unique, valable 7 jours). Tous les comptes ont les mêmes droits.
- **Partager** : lien `/share/<jeton>` pour les grands-parents. Gros texte, sans JavaScript requis,
  « Encore disponible » en premier, « Déjà prévu / Déjà acheté » barrés. Jamais les notes privées
  ni les cadeaux 🙈. Révocable à tout moment. Ajout à l'écran d'accueil possible (manifest propre au lien).

Les grands-parents ne réservent pas eux-mêmes un cadeau : la page leur dit de prévenir les parents,
qui le passent en « Prévu » avec leur nom.

## Stack

Même socle que Kigardeki : **Next.js 14** (App Router, Server Actions) + TypeScript strict,
**PostgreSQL (Neon)** via **Prisma**, **NextAuth v5** (email + mot de passe, JWT), **Tailwind**, PWA.
Déploiement cible : **Vercel**.

## Sécurité

- Authentification obligatoire partout (middleware) sauf `/login`, `/register`, `/invite/:token`,
  `/share/:token`.
- Chaque fonction de `src/lib/data/*` passe par `requireSession()` et filtre par `familyId`
  (`assertSameFamily`). Les fonctions `…ForFamily` sans session ne servent qu'à `/share/:token`,
  après validation du jeton.
- Chiffrement applicatif AES-256-GCM (`src/lib/crypto.ts`) : nom de famille, prénoms, titres, liens,
  occasions, « offert par », notes. Les prix restent en clair (sommes de budget).
- Jetons de partage et d'invitation stockés en HMAC (recherche) + chiffré (réaffichage), jamais en clair.
- CSP stricte avec nonce, liens externes en `rel="noopener noreferrer nofollow"`.

## Démarrage local

```bash
cp .env.example .env    # DATABASE_URL, NEXTAUTH_SECRET, ENCRYPTION_KEY…
npm install
npm run prisma:deploy   # applique prisma/migrations
npm run seed            # démo : papa@demo.lieluwish.app / Demo1234!
npm run dev
```

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (génère aussi le client Prisma) |
| `npm run lint` / `npm run typecheck` / `npm test` | Qualité (lancés par la CI) |
| `npm run prisma:migrate` | Nouvelle migration en développement |
| `npm run prisma:deploy` | Applique les migrations (staging/production) |
| `npm run seed` | Données de démonstration (jamais en production) |

## Mise en production (Vercel + Neon)

1. Créer un projet Neon `lieluwish` (une branche par environnement : production, staging…).
2. Créer le projet Vercel depuis ce dépôt, avec les variables :
   `DATABASE_URL`, `NEXTAUTH_SECRET` (`openssl rand -base64 32`), `NEXTAUTH_URL` et
   `NEXT_PUBLIC_APP_URL` (URL publique, utilisée dans les liens de partage :
   `https://wish.lielu.eu` en production), `ENCRYPTION_KEY`
   (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`, différente par
   environnement, **à ne jamais perdre** : sans elle les données chiffrées sont illisibles).
3. Domaine `wish.lielu.eu` : l'ajouter au projet Vercel, puis un CNAME `wish` chez Infomaniak
   vers la cible indiquée par Vercel. Les URL `*.vercel.app` restent protégées par Vercel : seul ce
   domaine est public (nécessaire pour les grands-parents).
4. Appliquer les migrations : `DATABASE_URL=… npm run prisma:deploy`.
5. Ouvrir l'URL, **Créer notre famille**, ajouter les enfants, inviter l'autre parent
   (*Réglages*), puis *Partager* → créer le lien et l'envoyer aux grands-parents.

## CI

`.github/workflows/ci.yml` : lint, typecheck, tests (Vitest), build, à chaque push et sur les PR
vers `staging` / `main`.
