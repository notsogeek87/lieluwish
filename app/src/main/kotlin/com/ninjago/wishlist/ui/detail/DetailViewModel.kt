package com.ninjago.wishlist.ui.detail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ninjago.wishlist.data.SetsRepository
import com.ninjago.wishlist.data.local.SetEntity
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class DetailUiState(
    val loaded: Boolean = false,
    val set: SetEntity? = null,
    val liked: Boolean = false,
)

class DetailViewModel(private val id: String, private val repo: SetsRepository) : ViewModel() {
    val state: StateFlow<DetailUiState> = combine(repo.observeSet(id), repo.favoriteIds) { set, favs ->
        DetailUiState(loaded = true, set = set, liked = id in favs)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), DetailUiState())

    fun toggleFavorite() { viewModelScope.launch { repo.toggleFavorite(id) } }
}
