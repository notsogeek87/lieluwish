package com.ninjago.wishlist

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.ninjago.wishlist.ui.NinjagoRoot
import com.ninjago.wishlist.ui.theme.NinjagoTheme
import com.ninjago.wishlist.ui.update.AppUpdateViewModel
import com.ninjago.wishlist.ui.update.UpdatePrompt
import org.koin.androidx.compose.koinViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NinjagoTheme {
                val updateViewModel: AppUpdateViewModel = koinViewModel()
                NinjagoRoot(updateViewModel)
                UpdatePrompt(updateViewModel)
            }
        }
    }
}
