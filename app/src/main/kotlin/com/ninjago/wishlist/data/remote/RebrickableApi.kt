package com.ninjago.wishlist.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Query

/** Rebrickable API v3 (https://rebrickable.com/api/v3/docs/). Auth : "Authorization: key XXX". */
interface RebrickableApi {
    @GET("lego/themes/")
    suspend fun themes(
        @Header("Authorization") auth: String,
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 1000,
    ): RbPage<RbTheme>

    @GET("lego/sets/")
    suspend fun sets(
        @Header("Authorization") auth: String,
        @Query("theme_id") themeId: Int,
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 1000,
    ): RbPage<RbSet>
}

@Serializable
data class RbPage<T>(
    val count: Int = 0,
    val next: String? = null,
    val results: List<T> = emptyList(),
)

@Serializable
data class RbTheme(
    val id: Int,
    @SerialName("parent_id") val parentId: Int? = null,
    val name: String = "",
)

@Serializable
data class RbSet(
    @SerialName("set_num") val setNum: String = "",
    val name: String = "",
    val year: Int = 0,
    @SerialName("num_parts") val numParts: Int? = null,
    @SerialName("set_img_url") val setImgUrl: String? = null,
)
