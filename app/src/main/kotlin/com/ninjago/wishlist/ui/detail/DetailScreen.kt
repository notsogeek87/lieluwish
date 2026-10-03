package com.ninjago.wishlist.ui.detail

import android.content.Context
import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.ninjago.wishlist.data.local.SetEntity
import com.ninjago.wishlist.ui.common.HeartButton
import com.ninjago.wishlist.ui.common.displayName
import com.ninjago.wishlist.ui.common.displayPrice
import com.ninjago.wishlist.ui.common.legoSearchUrl
import com.ninjago.wishlist.ui.theme.NinjaGold
import org.koin.androidx.compose.koinViewModel
import org.koin.core.parameter.parametersOf

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetailScreen(
    id: String,
    onBack: () -> Unit,
    viewModel: DetailViewModel = koinViewModel(parameters = { parametersOf(id) }),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current

    // Les insets système sont déjà gérés par le Scaffold racine.
    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        contentWindowInsets = WindowInsets(0),
        topBar = {
            TopAppBar(
                title = { Text(state.set?.displayName ?: "", maxLines = 1) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Retour")
                    }
                },
                actions = {
                    state.set?.let { set ->
                        IconButton(onClick = { shareSet(context, set) }) {
                            Icon(Icons.Filled.Share, contentDescription = "Partager")
                        }
                    }
                },
                windowInsets = WindowInsets(0),
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background),
            )
        },
    ) { padding ->
        val set = state.set
        when {
            !state.loaded -> Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            set == null -> Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("Ce set n'existe plus.", style = MaterialTheme.typography.titleMedium)
            }
            else -> Column(
                Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()),
            ) {
                Box {
                    AsyncImage(
                        model = set.imageUrl ?: set.thumbUrl,
                        contentDescription = set.displayName,
                        contentScale = ContentScale.Fit,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(300.dp)
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .padding(12.dp),
                    )
                    HeartButton(
                        liked = state.liked,
                        onToggle = viewModel::toggleFavorite,
                        size = 72.dp,
                        modifier = Modifier.align(Alignment.TopEnd).padding(12.dp),
                    )
                }
                Column(Modifier.padding(16.dp)) {
                    Text(set.displayName, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    Text(
                        set.displayPrice(),
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.ExtraBold,
                        color = NinjaGold,
                        modifier = Modifier.padding(vertical = 8.dp),
                    )
                    InfoRow("Numéro du set", set.number)
                    InfoRow("Année", set.year.toString())
                    InfoRow("Pièces", set.pieces?.toString() ?: "?")
                    set.minifigs?.let { InfoRow("Minifigurines", it.toString()) }
                    set.subtheme?.let { InfoRow("Série", it) }
                    InfoRow("Disponibilité", if (set.isCurrent) "En vente ou récent" else "Ancien set")
                }
            }
        }
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
        Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
        Text(value, fontWeight = FontWeight.SemiBold)
    }
}

private fun shareSet(context: Context, set: SetEntity) {
    val text = "${set.displayName} (${set.number})\n${legoSearchUrl(set.number)}"
    val send = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, text)
    }
    context.startActivity(Intent.createChooser(send, "Partager"))
}
