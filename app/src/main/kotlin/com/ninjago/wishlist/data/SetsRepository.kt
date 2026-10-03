package com.ninjago.wishlist.data

import android.content.SharedPreferences
import android.util.Log
import androidx.room.withTransaction
import com.ninjago.wishlist.BuildConfig
import com.ninjago.wishlist.data.local.AppDatabase
import com.ninjago.wishlist.data.local.FavoriteEntity
import com.ninjago.wishlist.data.local.FavoriteRow
import com.ninjago.wishlist.data.local.SetEntity
import com.ninjago.wishlist.data.remote.BricksetApi
import com.ninjago.wishlist.data.remote.BricksetParams
import com.ninjago.wishlist.data.remote.BricksetRegion
import com.ninjago.wishlist.data.remote.BricksetSet
import com.ninjago.wishlist.data.remote.RebrickableApi
import com.ninjago.wishlist.data.remote.RbSet
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.IOException
import java.util.Calendar

/** Aucune clé API configurée (voir README). */
class MissingApiKeysException : Exception("Aucune clé API configurée")

class SetsRepository(
    private val db: AppDatabase,
    private val brickset: BricksetApi,
    private val rebrickable: RebrickableApi,
    private val prefs: SharedPreferences,
    private val json: Json,
) {
    private val dao = db.setDao()

    val sets: Flow<List<SetEntity>> = dao.observeSets()
    val favoriteIds: Flow<List<String>> = dao.observeFavoriteIds()
    val favorites: Flow<List<FavoriteRow>> = dao.observeFavorites()

    fun observeSet(id: String): Flow<SetEntity?> = dao.observeSet(id)

    suspend fun toggleFavorite(id: String) {
        db.withTransaction {
            if (dao.isFavorite(id)) dao.removeFavorite(id)
            else dao.addFavorite(FavoriteEntity(id, System.currentTimeMillis()))
        }
    }

    /** Vrai si le cache est vide ou a plus de 24 h. */
    suspend fun needsRefresh(): Boolean {
        if (dao.count() == 0) return true
        val last = prefs.getLong(KEY_LAST_REFRESH, 0L)
        return System.currentTimeMillis() - last > REFRESH_INTERVAL_MS
    }

    /**
     * Récupère les sets depuis Brickset, avec Rebrickable en secours.
     * En cas d'échec, le cache existant reste intact.
     */
    suspend fun refresh(): Result<Unit> {
        val hasBrickset = BuildConfig.BRICKSET_API_KEY.isNotBlank()
        val hasRebrickable = BuildConfig.REBRICKABLE_API_KEY.isNotBlank()
        if (!hasBrickset && !hasRebrickable) return Result.failure(MissingApiKeysException())

        var firstError: Throwable? = null
        if (hasBrickset) {
            try {
                return store(fetchFromBrickset())
            } catch (e: Exception) {
                Log.e(TAG, "Brickset a échoué", e)
                firstError = e
            }
        }
        if (hasRebrickable) {
            try {
                return store(fetchFromRebrickable())
            } catch (e: Exception) {
                Log.e(TAG, "Rebrickable a échoué", e)
                return Result.failure(firstError ?: e)
            }
        }
        return Result.failure(firstError ?: IOException("Échec du chargement"))
    }

    private suspend fun store(list: List<SetEntity>): Result<Unit> {
        if (list.isEmpty()) return Result.failure(IOException("Aucun set reçu"))
        db.withTransaction {
            dao.deleteNonFavoriteSets()
            dao.upsertSets(list)
        }
        prefs.edit().putLong(KEY_LAST_REFRESH, System.currentTimeMillis()).apply()
        return Result.success(Unit)
    }

    // ---- Brickset -------------------------------------------------------------------------

    private suspend fun fetchFromBrickset(): List<SetEntity> {
        val all = mutableListOf<BricksetSet>()
        var page = 1
        while (true) {
            val params = json.encodeToString(
                BricksetParams(theme = "Ninjago", pageSize = 500, pageNumber = page, orderBy = "YearFromDESC"),
            )
            val response = brickset.getSets(BuildConfig.BRICKSET_API_KEY, "", params)
            Log.i(TAG, "Brickset page $page : status=${response.status} matches=${response.matches} sets=${response.sets.size}")
            if (!response.status.equals("success", ignoreCase = true)) {
                throw IOException("Brickset : ${response.message ?: response.status}")
            }
            all += response.sets
            if (response.sets.isEmpty() || all.size >= response.matches) break
            page++
        }
        val minCurrentYear = Calendar.getInstance().get(Calendar.YEAR) - 1
        return all.filter { it.name.isNotBlank() && it.number.isNotBlank() }
            .map { it.toEntity(minCurrentYear) }
            .distinctBy { it.id }
    }

    private fun BricksetSet.toEntity(minCurrentYear: Int): SetEntity {
        val regions = listOf(
            LEGOCom?.DE to "EUR",
            LEGOCom?.UK to "GBP",
            LEGOCom?.US to "USD",
            LEGOCom?.CA to "CAD",
        )
        val priced = regions.firstOrNull { it.first?.retailPrice != null }
        // En vente = au moins une boutique LEGO.com a une date de début sans date de fin.
        val onSale = regions.any { (r: BricksetRegion?, _) ->
            r != null && r.dateFirstAvailable != null && r.dateLastAvailable == null
        }
        return SetEntity(
            id = "$number-$numberVariant",
            number = number,
            name = name,
            year = year,
            pieces = pieces,
            minifigs = minifigs,
            price = priced?.first?.retailPrice,
            currency = priced?.second,
            imageUrl = image?.imageURL.https(),
            thumbUrl = (image?.thumbnailURL ?: image?.imageURL).https(),
            subtheme = subtheme,
            isCurrent = onSale || year >= minCurrentYear,
        )
    }

    // ---- Rebrickable (secours) ------------------------------------------------------------

    private suspend fun fetchFromRebrickable(): List<SetEntity> {
        val auth = "key ${BuildConfig.REBRICKABLE_API_KEY}"

        val themes = mutableListOf<com.ninjago.wishlist.data.remote.RbTheme>()
        var page = 1
        while (true) {
            val p = rebrickable.themes(auth, page)
            themes += p.results
            if (p.next == null) break
            page++
            delay(RATE_LIMIT_MS)
        }
        // Thème "Ninjago" + tous ses sous-thèmes (récursif).
        val roots = themes.filter { it.name.equals("Ninjago", ignoreCase = true) }
        val topRoots = roots.filter { it.parentId == null }.ifEmpty { roots }
        val ids = mutableSetOf<Int>()
        val queue = ArrayDeque(topRoots.map { it.id })
        while (queue.isNotEmpty()) {
            val id = queue.removeFirst()
            if (ids.add(id)) queue.addAll(themes.filter { it.parentId == id }.map { it.id })
        }
        if (ids.isEmpty()) throw IOException("Thème Ninjago introuvable sur Rebrickable")

        val minCurrentYear = Calendar.getInstance().get(Calendar.YEAR) - 1
        val result = mutableListOf<SetEntity>()
        for (themeId in ids) {
            var p = 1
            while (true) {
                delay(RATE_LIMIT_MS)
                val resp = rebrickable.sets(auth, themeId, p)
                result += resp.results.map { it.toEntity(minCurrentYear) }
                if (resp.next == null) break
                p++
            }
        }
        return result.filter { it.name.isNotBlank() }.distinctBy { it.id }
    }

    private fun RbSet.toEntity(minCurrentYear: Int) = SetEntity(
        id = setNum,
        number = setNum.substringBefore("-"),
        name = name,
        year = year,
        pieces = numParts,
        minifigs = null,
        price = null, // Rebrickable ne fournit pas les prix
        currency = null,
        imageUrl = setImgUrl.https(),
        thumbUrl = setImgUrl.https(),
        subtheme = null,
        isCurrent = year >= minCurrentYear, // pas d'info de disponibilité : on se base sur l'année
    )

    private fun String?.https(): String? = this?.replaceFirst("http://", "https://")

    private companion object {
        const val TAG = "NinjagoSets"
        const val KEY_LAST_REFRESH = "last_refresh"
        const val REFRESH_INTERVAL_MS = 24L * 60 * 60 * 1000
        const val RATE_LIMIT_MS = 1100L
    }
}
