package com.ninjago.wishlist.ui.sets

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ninjago.wishlist.data.SetsRepository
import com.ninjago.wishlist.data.local.SetEntity
import com.ninjago.wishlist.ui.common.errorMessage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SetsUiState(
    val sets: List<SetEntity> = emptyList(),
    val favoriteIds: Set<String> = emptySet(),
    val years: List<Int> = emptyList(),
    val query: String = "",
    val year: Int? = null,
    val showOld: Boolean = false,
    val refreshing: Boolean = false,
    val error: String? = null,
    val cacheEmpty: Boolean = true,
)

private data class Filters(val query: String = "", val year: Int? = null, val showOld: Boolean = false)
private data class Refresh(val loading: Boolean = false, val error: String? = null)

class SetsViewModel(private val repo: SetsRepository) : ViewModel() {
    private val filters = MutableStateFlow(Filters())
    private val refresh = MutableStateFlow(Refresh())

    val state: StateFlow<SetsUiState> = combine(
        repo.sets, repo.favoriteIds, filters, refresh,
    ) { all, favIds, f, r ->
        val pool = if (f.showOld) all else all.filter { it.isCurrent }
        val q = f.query.trim()
        val shown = pool.filter { s ->
            (f.year == null || s.year == f.year) &&
                (q.isEmpty() || s.name.contains(q, ignoreCase = true) || s.number.contains(q))
        }
        SetsUiState(
            sets = shown,
            favoriteIds = favIds.toSet(),
            years = pool.map { it.year }.distinct().sortedDescending(),
            query = f.query,
            year = f.year,
            showOld = f.showOld,
            refreshing = r.loading,
            error = r.error,
            cacheEmpty = all.isEmpty(),
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), SetsUiState())

    init {
        viewModelScope.launch { if (repo.needsRefresh()) doRefresh() }
    }

    fun onRefresh() {
        if (!refresh.value.loading) viewModelScope.launch { doRefresh() }
    }

    private suspend fun doRefresh() {
        refresh.value = Refresh(loading = true)
        refresh.value = repo.refresh().fold(
            onSuccess = { Refresh() },
            onFailure = { Refresh(error = errorMessage(it)) },
        )
    }

    fun onQueryChange(q: String) = filters.update { it.copy(query = q) }
    fun onYearChange(y: Int?) = filters.update { it.copy(year = y) }
    fun onShowOldChange(v: Boolean) = filters.update { it.copy(showOld = v, year = null) }
    fun onErrorShown() = refresh.update { it.copy(error = null) }
    fun toggleFavorite(id: String) { viewModelScope.launch { repo.toggleFavorite(id) } }
}
