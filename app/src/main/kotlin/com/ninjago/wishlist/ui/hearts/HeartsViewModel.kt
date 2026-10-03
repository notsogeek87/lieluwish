package com.ninjago.wishlist.ui.hearts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ninjago.wishlist.data.SetsRepository
import com.ninjago.wishlist.data.local.FavoriteRow
import com.ninjago.wishlist.data.local.SetEntity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class HeartSort(val label: String) {
    DATE("Date d'ajout"),
    PRICE("Prix"),
}

data class HeartsUiState(
    val items: List<SetEntity> = emptyList(),
    val sort: HeartSort = HeartSort.DATE,
)

class HeartsViewModel(private val repo: SetsRepository) : ViewModel() {
    private val sort = MutableStateFlow(HeartSort.DATE)

    val state: StateFlow<HeartsUiState> = combine(repo.favorites, sort) { rows, s ->
        val sorted = when (s) {
            HeartSort.DATE -> rows.sortedByDescending { it.addedAt }
            // Prix croissant, sets sans prix à la fin.
            HeartSort.PRICE -> rows.sortedWith(compareBy<FavoriteRow>({ it.set.price == null }, { it.set.price }))
        }
        HeartsUiState(sorted.map { it.set }, s)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HeartsUiState())

    fun onSortChange(s: HeartSort) { sort.value = s }
    fun toggleFavorite(id: String) { viewModelScope.launch { repo.toggleFavorite(id) } }
}
