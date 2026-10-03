package com.ninjago.wishlist.data.local

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.RoomDatabase
import kotlinx.coroutines.flow.Flow

@Dao
interface SetDao {
    @Query("SELECT * FROM sets ORDER BY year DESC, number DESC")
    fun observeSets(): Flow<List<SetEntity>>

    @Query("SELECT * FROM sets WHERE id = :id")
    fun observeSet(id: String): Flow<SetEntity?>

    @Query("SELECT s.*, f.addedAt AS addedAt FROM sets s INNER JOIN favorites f ON f.setId = s.id")
    fun observeFavorites(): Flow<List<FavoriteRow>>

    @Query("SELECT setId FROM favorites")
    fun observeFavoriteIds(): Flow<List<String>>

    @Query("SELECT COUNT(*) FROM sets")
    suspend fun count(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertSets(sets: List<SetEntity>)

    @Query("DELETE FROM sets WHERE id NOT IN (SELECT setId FROM favorites)")
    suspend fun deleteNonFavoriteSets()

    @Query("SELECT EXISTS(SELECT 1 FROM favorites WHERE setId = :id)")
    suspend fun isFavorite(id: String): Boolean

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun addFavorite(favorite: FavoriteEntity)

    @Query("DELETE FROM favorites WHERE setId = :id")
    suspend fun removeFavorite(id: String)
}

@Database(entities = [SetEntity::class, FavoriteEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun setDao(): SetDao
}
