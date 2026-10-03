package com.ninjago.wishlist

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.ninjago.wishlist.ui.NinjagoRoot
import com.ninjago.wishlist.ui.theme.NinjagoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NinjagoTheme { NinjagoRoot() }
        }
    }
}
