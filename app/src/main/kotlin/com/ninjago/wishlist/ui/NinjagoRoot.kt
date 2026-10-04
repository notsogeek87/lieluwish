package com.ninjago.wishlist.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.ninjago.wishlist.ui.detail.DetailScreen
import com.ninjago.wishlist.ui.hearts.HeartsScreen
import com.ninjago.wishlist.ui.sets.SetsScreen
import com.ninjago.wishlist.ui.settings.SettingsScreen
import com.ninjago.wishlist.ui.theme.NinjaRed
import com.ninjago.wishlist.ui.update.AppUpdateViewModel

private const val SETS = "sets"
private const val HEARTS = "hearts"
private const val SETTINGS = "settings"
private const val DETAIL = "detail"

private data class Tab(val route: String, val label: String, val icon: ImageVector)

private val tabs = listOf(
    Tab(SETS, "Les sets", Icons.Filled.Home),
    Tab(HEARTS, "Mes cœurs", Icons.Filled.Favorite),
    Tab(SETTINGS, "Paramètres", Icons.Filled.Settings),
)

@Composable
fun NinjagoRoot(updateViewModel: AppUpdateViewModel) {
    val nav = rememberNavController()
    val entry by nav.currentBackStackEntryAsState()
    val route = entry?.destination?.route

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            if (route == SETS || route == HEARTS || route == SETTINGS) {
                NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                    tabs.forEach { tab ->
                        NavigationBarItem(
                            selected = route == tab.route,
                            onClick = {
                                nav.navigate(tab.route) {
                                    popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(tab.icon, contentDescription = null) },
                            label = { Text(tab.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = NinjaRed,
                                selectedTextColor = NinjaRed,
                            ),
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(nav, startDestination = SETS, modifier = Modifier.padding(padding)) {
            composable(SETS) { SetsScreen(onOpenSet = { nav.navigate("$DETAIL/$it") }) }
            composable(HEARTS) { HeartsScreen(onOpenSet = { nav.navigate("$DETAIL/$it") }) }
            composable(SETTINGS) { SettingsScreen(updateViewModel) }
            composable(
                "$DETAIL/{id}",
                arguments = listOf(navArgument("id") { type = NavType.StringType }),
            ) { backStack ->
                DetailScreen(
                    id = backStack.arguments?.getString("id").orEmpty(),
                    onBack = { nav.popBackStack() },
                )
            }
        }
    }
}
