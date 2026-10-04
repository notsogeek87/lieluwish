# Ninjago Wishlist 🥷❤️

App Android native (Kotlin + Jetpack Compose, minSdk 26) : tous les sets LEGO Ninjago, et un cœur pour
dire à ses parents ce qu'on veut. Aucune pub, aucun tracker, aucun compte, seule permission : `INTERNET`.

## 1. Obtenir les clés API (gratuit)

| Service | Rôle | Où l'obtenir |
|---|---|---|
| **Brickset** (principal) | sets, images, année, prix, pièces, dispo | Créer un compte sur <https://brickset.com>, puis demander une clé sur <https://brickset.com/tools/webservices/requestkey> |
| **Rebrickable** (secours) | utilisé si Brickset échoue | Compte sur <https://rebrickable.com>, puis *Settings → API* pour générer une clé |

Une seule des deux clés suffit (Rebrickable seul = pas de prix).

## 2. Où les mettre

```bash
cp local.properties.example local.properties
```

Dans `local.properties` (ignoré par git, ne jamais le commiter) :

```properties
sdk.dir=/chemin/vers/Android/Sdk
BRICKSET_API_KEY=ta_clef_brickset
REBRICKABLE_API_KEY=ta_clef_rebrickable
```

Les clés peuvent aussi venir de variables d'environnement du même nom. Elles sont injectées dans
`BuildConfig` : elles se retrouvent dans l'APK, donc ne distribue pas l'APK publiquement.

## 3. Builder

Prérequis : JDK 17+ et le SDK Android (platform 35, build-tools). Avec Android Studio, ouvrir le dossier et lancer.
En ligne de commande :

```bash
./gradlew assembleDebug
# APK : app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## Fonctionnement des données

- Rafraîchissement automatique au lancement si le cache a plus de 24 h, et par pull-to-refresh. Cache Room :
  l'app reste utilisable hors ligne.
- Brickset : « en vente » = une boutique LEGO.com a une date de début de vente sans date de fin, ou année ≥ année
  courante − 1. Les autres sets sont masqués, avec un toggle **« Afficher les anciens sets »** et un filtre par année.
- Rebrickable (secours, thème Ninjago + sous-thèmes) ne donne ni prix ni disponibilité : seul le critère d'année s'applique.
- Les cœurs sont dans une table Room séparée et survivent aux rafraîchissements.

## Architecture

MVVM · Retrofit + kotlinx.serialization · Room · Coil · Koin · Navigation Compose.

## CI : APK release à chaque push

`.github/workflows/release-apk.yml` construit `release.main.apk` / `release.staging.apk` à chaque push sur
`main` ou `staging` (onglet *Releases* du dépôt, ou *Actions* → run → *Artifacts*).

Secrets du dépôt (*Settings → Secrets and variables → Actions*) :
- `BRICKSET_API_KEY` (et optionnellement `REBRICKABLE_API_KEY`).
- `RELEASE_KEYSTORE_BASE64` : keystore de signature en base64. **Indispensable pour installer une nouvelle
  version par-dessus l'ancienne** : sans elle, chaque build est signé avec une clé de debug différente.
  Alias et mots de passe valent `ninjago` par défaut (surchargeables via `RELEASE_KEYSTORE_PASSWORD`,
  `RELEASE_KEY_ALIAS`, `RELEASE_KEY_PASSWORD`).

Générer la keystore : `keytool -genkeypair -keystore ninjago.jks -alias ninjago -keyalg RSA -keysize 2048
-validity 10000 -storepass ninjago -keypass ninjago`, puis `base64 -w0 ninjago.jks`.
Ne jamais la commiter (le dépôt est public).

## Mises à jour automatiques

L'app utilise [lielugit-updater](https://github.com/notsogeek87/lielugit-updater) 1.0.0 : à **chaque ouverture**
elle cherche la dernière release GitHub (non pré-release) et guide l'utilisateur (Installer → autoriser
l'installation d'apps inconnues si Android le demande → « Mettre à jour »). Bouton manuel :
*Paramètres → Rechercher une mise à jour*.

- Dépendance sans jeton ni secret : dépôt Maven de la release vendoré dans `libs/lielugit-maven` (versionné).
  Mise à jour de la lib : remplacer le dossier par le contenu du zip `lielugit-updater-<version>-maven.zip`
  (sans `maven-metadata-local.xml`) et changer la version dans `app/build.gradle.kts`.
- Versions : `versionName = <appVersionBase>.<run_number CI>` (`appVersionBase` dans `gradle.properties`),
  `versionCode = run_number`, tag de release `v<versionName>`, APK `NinjagoWishlist-<versionName>.apk`.
- Même `applicationId` et **même clé de signature** pour tous les APK (secret `RELEASE_KEYSTORE_BASE64`).
- Mises à jour désactivées si l'`applicationId` finit par `.staging`.
- La première installation est manuelle ; les instructions figurent dans le texte de chaque release.
