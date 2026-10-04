package com.ninjago.wishlist.ui.settings

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lielu.githubupdater.UpdateState
import com.ninjago.wishlist.BuildConfig
import com.ninjago.wishlist.ui.update.AppUpdateViewModel
import com.ninjago.wishlist.ui.update.updateErrorMessage

@Composable
fun SettingsScreen(
    updateViewModel: AppUpdateViewModel,
    modifier: Modifier = Modifier,
) {
    val state by updateViewModel.state.collectAsStateWithLifecycle()

    Column(modifier.fillMaxSize().padding(16.dp)) {
        Text("Paramètres", style = MaterialTheme.typography.headlineMedium)

        Text(
            "Version ${BuildConfig.VERSION_NAME}",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 16.dp),
        )

        if (updateViewModel.updatesEnabled) {
            Text("Mise à jour", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 24.dp))
            Text(updateStatus(state), style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 8.dp))
            if (state is UpdateState.Downloading) {
                val percentage = (state as UpdateState.Downloading).progress.percentage ?: 0
                LinearProgressIndicator(
                    progress = { percentage / 100f },
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                )
            }
            Button(
                onClick = updateViewModel::checkNow,
                enabled = state !is UpdateState.Checking && state !is UpdateState.Downloading &&
                    state !is UpdateState.Installing,
                modifier = Modifier.padding(top = 12.dp),
            ) { Text("Rechercher une mise à jour") }
        }
    }
}

private fun updateStatus(state: UpdateState): String =
    when (state) {
        UpdateState.Idle -> "Vérifie si une nouvelle version est publiée sur GitHub."
        UpdateState.Checking -> "Recherche de mise à jour…"
        UpdateState.UpToDate -> "Vous utilisez la dernière version."
        is UpdateState.UpdateAvailable -> "Version ${state.update.versionName} disponible."
        is UpdateState.Downloading -> "Téléchargement… ${state.progress.percentage?.let { "$it %" }.orEmpty()}"
        is UpdateState.Downloaded -> "Mise à jour téléchargée, prête à installer."
        UpdateState.Installing -> "Installation en cours…"
        is UpdateState.Error -> updateErrorMessage(state.error)
    }
