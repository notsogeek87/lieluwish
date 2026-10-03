package com.ninjago.wishlist.ui.hearts

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.ninjago.wishlist.ui.common.SetCard
import com.ninjago.wishlist.ui.common.shareWishlist
import com.ninjago.wishlist.ui.theme.NinjaGreen
import org.koin.androidx.compose.koinViewModel

@Composable
fun HeartsScreen(
    onOpenSet: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: HeartsViewModel = koinViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current

    Column(modifier.fillMaxSize()) {
        Text(
            "Mes cœurs ❤️",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(start = 16.dp, top = 16.dp, end = 16.dp),
        )
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
        ) {
            Text("Trier par", style = MaterialTheme.typography.bodyLarge)
            HeartSort.entries.forEach { s ->
                FilterChip(
                    selected = state.sort == s,
                    onClick = { viewModel.onSortChange(s) },
                    label = { Text(s.label) },
                )
            }
        }

        if (state.items.isEmpty()) {
            Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Text(
                    "Tu n'as pas encore mis de cœur.\nAppuie sur ❤ sur les sets que tu veux !",
                    style = MaterialTheme.typography.titleMedium,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(24.dp),
                )
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 160.dp),
                contentPadding = PaddingValues(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f).fillMaxWidth(),
            ) {
                items(state.items, key = { it.id }) { set ->
                    SetCard(
                        set = set,
                        liked = true,
                        onClick = { onOpenSet(set.id) },
                        onToggleHeart = { viewModel.toggleFavorite(set.id) },
                    )
                }
            }
            Button(
                onClick = { shareWishlist(context, state.items) },
                colors = ButtonDefaults.buttonColors(containerColor = NinjaGreen),
                modifier = Modifier.fillMaxWidth().padding(16.dp).height(60.dp),
            ) {
                Icon(Icons.Filled.Share, contentDescription = null)
                Text(
                    "  Envoyer ma liste aux parents",
                    style = MaterialTheme.typography.titleMedium,
                )
            }
        }
    }
}
