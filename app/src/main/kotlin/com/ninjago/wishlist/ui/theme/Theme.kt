package com.ninjago.wishlist.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val NinjaRed = Color(0xFFE53935)
val NinjaBlue = Color(0xFF2979FF)
val NinjaGreen = Color(0xFF43A047)
val NinjaGold = Color(0xFFFFC107)
val NinjaBackground = Color(0xFF0E1018)
val NinjaSurface = Color(0xFF1A1D2B)
val NinjaSurfaceHigh = Color(0xFF262A3D)

private val scheme = darkColorScheme(
    primary = NinjaRed,
    onPrimary = Color.White,
    secondary = NinjaBlue,
    onSecondary = Color.White,
    tertiary = NinjaGold,
    onTertiary = Color.Black,
    background = NinjaBackground,
    onBackground = Color(0xFFF2F2F7),
    surface = NinjaSurface,
    onSurface = Color(0xFFF2F2F7),
    surfaceVariant = NinjaSurfaceHigh,
    onSurfaceVariant = Color(0xFFC4C7D6),
    error = Color(0xFFFF6B6B),
)

@Composable
fun NinjagoTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = scheme, content = content)
}
