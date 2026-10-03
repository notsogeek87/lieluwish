package com.ninjago.wishlist.data.local

import androidx.room.ColumnInfo
import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.PrimaryKey

/** Un set LEGO Ninjago (cache local de l'API). */
@Entity(tableName = "sets")
data class SetEntity(
    /** Numéro complet avec variante, ex. "71799-1". */
    @PrimaryKey val id: String,
    /** Numéro affiché, ex. "71799". */
    val number: String,
    val name: String,
    val year: Int,
    val pieces: Int?,
    val minifigs: Int?,
    val price: Double?,
    /** Code ISO de la devise (EUR, GBP, USD…). */
    val currency: String?,
    val imageUrl: String?,
    val thumbUrl: String?,
    val subtheme: String?,
    /** Vrai si le set est (probablement) encore en vente ou récent. */
    val isCurrent: Boolean,
)

/** Sets "likés". Table séparée, sans clé étrangère : les cœurs survivent aux rafraîchissements. */
@Entity(tableName = "favorites")
data class FavoriteEntity(
    @PrimaryKey val setId: String,
    @ColumnInfo(defaultValue = "0") val addedAt: Long,
)

data class FavoriteRow(
    @Embedded val set: SetEntity,
    val addedAt: Long,
)
