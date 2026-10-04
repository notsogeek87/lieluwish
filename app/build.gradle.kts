import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
    id("com.google.devtools.ksp")
}

// Clés API : lues dans local.properties (non commité) ou dans les variables d'environnement.
val localProps = Properties().apply {
    val f = rootProject.file("local.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}

fun apiKey(name: String): String =
    (localProps.getProperty(name) ?: System.getenv(name) ?: "").trim()

// Versionnement : versionCode et versionName augmentent à chaque build CI (BUILD_NUMBER = run_number).
// Le tag de release est v<versionName> (ex. v1.0.152) : il doit se lire comme une version supérieure à
// celle installée, sinon la bibliothèque ne propose pas la mise à jour.
val buildNumber = (System.getenv("BUILD_NUMBER") ?: providers.gradleProperty("buildNumber").orNull)
    ?.toIntOrNull() ?: 1
val appVersionBase = providers.gradleProperty("appVersionBase").get()

android {
    namespace = "com.ninjago.wishlist"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.ninjago.wishlist"
        minSdk = 26
        targetSdk = 35
        versionCode = buildNumber
        versionName = "$appVersionBase.$buildNumber"

        buildConfigField("String", "BRICKSET_API_KEY", "\"${apiKey("BRICKSET_API_KEY")}\"")
        buildConfigField("String", "REBRICKABLE_API_KEY", "\"${apiKey("REBRICKABLE_API_KEY")}\"")
    }

    // Signature release : keystore fournie par l'environnement (CI), sinon clé de debug
    // (APK installable, mais à ne pas publier sur le Play Store).
    val releaseKeystore = System.getenv("RELEASE_KEYSTORE_FILE")?.takeIf { it.isNotBlank() }
    signingConfigs {
        if (releaseKeystore != null) {
            create("release") {
                storeFile = file(releaseKeystore)
                // Valeurs par défaut "ninjago" : seul le fichier keystore (secret) protège la clé.
                storePassword = System.getenv("RELEASE_KEYSTORE_PASSWORD")?.takeIf { it.isNotBlank() } ?: "ninjago"
                keyAlias = System.getenv("RELEASE_KEY_ALIAS")?.takeIf { it.isNotBlank() } ?: "ninjago"
                keyPassword = System.getenv("RELEASE_KEY_PASSWORD")?.takeIf { it.isNotBlank() } ?: "ninjago"
            }
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName(if (releaseKeystore != null) "release" else "debug")
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.navigation:navigation-compose:2.8.3")

    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-core")
    debugImplementation("androidx.compose.ui:ui-tooling")

    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-kotlinx-serialization:2.11.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    implementation("io.coil-kt:coil-compose:2.7.0")

    implementation("io.insert-koin:koin-android:3.5.6")
    implementation("io.insert-koin:koin-androidx-compose:3.5.6")

    // Mises à jour automatiques depuis les GitHub Releases (dépôt Maven vendoré dans libs/lielugit-maven).
    implementation("com.lielu:lielugit-updater:1.0.0")
}
