package com.ninjago.wishlist.ui.common

import android.content.Context
import android.content.Intent
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.ninjago.wishlist.data.local.SetEntity
import com.ninjago.wishlist.ui.theme.NinjaRed
import java.text.NumberFormat
import java.util.Currency
import java.util.Locale

fun formatPrice(price: Double?, currency: String?): String {
    if (price == null) return "Prix inconnu"
    val nf = NumberFormat.getCurrencyInstance(Locale.FRANCE)
    runCatching { nf.currency = Currency.getInstance(currency ?: "EUR") }
    return nf.format(price)
}

/** Brickset nomme "{?}" les sets annoncés dont le nom n'est pas encore connu. */
val SetEntity.isUnannounced: Boolean get() = name.trim().let { it == "{?}" || it.isEmpty() }

val SetEntity.displayName: String get() = if (isUnannounced) "Set mystère 🥷" else name

fun SetEntity.displayPrice(): String =
    if (price == null && isUnannounced) "Prix à venir" else formatPrice(price, currency)

fun buildShareText(items: List<SetEntity>): String {
    val lines = items.joinToString("\n") { "• ${it.displayName} (n° ${it.number}) – ${it.displayPrice()}" }
    val currencies = items.mapNotNull { it.currency }.distinct()
    val total = if (items.isNotEmpty() && items.all { it.price != null } && currencies.size == 1) {
        "\n\nTotal : ${formatPrice(items.sumOf { it.price ?: 0.0 }, currencies.first())}"
    } else ""
    return "Coucou ! Voici ma liste de souhaits LEGO Ninjago ❤️\n\n$lines$total"
}

fun shareWishlist(context: Context, items: List<SetEntity>) {
    val send = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, "Ma liste LEGO Ninjago")
        putExtra(Intent.EXTRA_TEXT, buildShareText(items))
    }
    context.startActivity(Intent.createChooser(send, "Envoyer ma liste aux parents"))
}

@Composable
fun HeartButton(
    liked: Boolean,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = 48.dp,
) {
    val scale = remember { Animatable(1f) }
    var firstComposition by remember { mutableStateOf(true) }
    LaunchedEffect(liked) {
        if (firstComposition) {
            firstComposition = false
        } else {
            scale.snapTo(0.5f)
            scale.animateTo(1f, spring(dampingRatio = Spring.DampingRatioHighBouncy, stiffness = Spring.StiffnessMedium))
        }
    }
    Box(
        modifier = modifier
            .size(size)
            .scale(scale.value)
            .clip(CircleShape)
            .background(Color.Black.copy(alpha = 0.55f))
            .clickable(role = Role.Button, onClick = onToggle),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            imageVector = if (liked) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
            contentDescription = if (liked) "Retirer des cœurs" else "Ajouter aux cœurs",
            tint = if (liked) NinjaRed else Color.White,
            modifier = Modifier.size(size * 0.6f),
        )
    }
}

@Composable
fun ErrorView(message: String, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("😕", style = MaterialTheme.typography.displayMedium)
        Text(
            message,
            style = MaterialTheme.typography.titleMedium,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(vertical = 16.dp),
        )
        Button(onClick = onRetry) { Text("Réessayer", style = MaterialTheme.typography.titleMedium) }
    }
}

fun errorMessage(t: Throwable): String = when (t) {
    is com.ninjago.wishlist.data.MissingApiKeysException ->
        "Clés API manquantes. Demande à tes parents de suivre le README pour les ajouter."
    is java.net.UnknownHostException, is java.net.ConnectException ->
        "Pas de connexion internet. Vérifie ton réseau et réessaie."
    is java.net.SocketTimeoutException, is java.io.InterruptedIOException ->
        "Le serveur met trop de temps à répondre. Réessaie dans un instant."
    is retrofit2.HttpException ->
        if (t.code() == 401 || t.code() == 403) "Clé API refusée par le serveur."
        else "Le serveur ne répond pas correctement (erreur ${t.code()})."
    // Cas inattendu : on affiche la cause technique pour pouvoir la diagnostiquer.
    else -> "Impossible de charger les sets.\n(${t::class.simpleName}: ${t.message?.take(160)})"
}
