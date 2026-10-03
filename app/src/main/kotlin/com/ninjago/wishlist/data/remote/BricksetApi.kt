package com.ninjago.wishlist.data.remote

import kotlinx.serialization.Serializable
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

/**
 * Brickset API v3 (https://brickset.com/tools/webservices/v3).
 * getSets(apiKey, userHash, params) : userHash peut être vide pour des données publiques.
 * `params` est un objet JSON passé sous forme de chaîne.
 */
interface BricksetApi {
    @FormUrlEncoded
    @POST("getSets")
    suspend fun getSets(
        @Field("apiKey") apiKey: String,
        @Field("userHash") userHash: String,
        @Field("params") params: String,
    ): BricksetResponse
}

@Serializable
data class BricksetParams(
    val theme: String,
    val pageSize: Int,
    val pageNumber: Int,
    val orderBy: String,
)

@Serializable
data class BricksetResponse(
    val status: String = "",
    val message: String? = null,
    val matches: Int = 0,
    val sets: List<BricksetSet> = emptyList(),
)

@Serializable
data class BricksetSet(
    val number: String = "",
    val numberVariant: Int = 1,
    val name: String = "",
    val year: Int = 0,
    val subtheme: String? = null,
    val pieces: Int? = null,
    val minifigs: Int? = null,
    val image: BricksetImage? = null,
    val LEGOCom: BricksetLegoCom? = null,
)

@Serializable
data class BricksetImage(
    val thumbnailURL: String? = null,
    val imageURL: String? = null,
)

@Serializable
data class BricksetLegoCom(
    val US: BricksetRegion? = null,
    val UK: BricksetRegion? = null,
    val CA: BricksetRegion? = null,
    val DE: BricksetRegion? = null,
)

@Serializable
data class BricksetRegion(
    val retailPrice: Double? = null,
    val dateFirstAvailable: String? = null,
    val dateLastAvailable: String? = null,
)
