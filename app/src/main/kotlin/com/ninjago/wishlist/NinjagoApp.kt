package com.ninjago.wishlist

import android.app.Application
import android.content.Context
import androidx.room.Room
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.lielu.githubupdater.UpdateConfig
import com.lielu.githubupdater.UpdateManager
import com.ninjago.wishlist.data.SetsRepository
import com.ninjago.wishlist.data.local.AppDatabase
import com.ninjago.wishlist.data.remote.BricksetApi
import com.ninjago.wishlist.data.remote.RebrickableApi
import com.ninjago.wishlist.ui.detail.DetailViewModel
import com.ninjago.wishlist.ui.hearts.HeartsViewModel
import com.ninjago.wishlist.ui.sets.SetsViewModel
import com.ninjago.wishlist.ui.update.AppUpdateViewModel
import com.ninjago.wishlist.ui.update.updatesEnabledFor
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import org.koin.android.ext.koin.androidContext
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.core.context.startKoin
import org.koin.dsl.module
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

class NinjagoApp : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@NinjagoApp)
            modules(appModule)
        }
    }
}

private val appModule = module {
    single { Json { ignoreUnknownKeys = true; coerceInputValues = true } }
    single {
        OkHttpClient.Builder()
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .callTimeout(60, TimeUnit.SECONDS)
            .build()
    }
    single<BricksetApi> {
        Retrofit.Builder()
            .baseUrl("https://brickset.com/api/v3.asmx/")
            .client(get())
            .addConverterFactory(get<Json>().asConverterFactory("application/json".toMediaType()))
            .build()
            .create(BricksetApi::class.java)
    }
    single<RebrickableApi> {
        Retrofit.Builder()
            .baseUrl("https://rebrickable.com/api/v3/")
            .client(get())
            .addConverterFactory(get<Json>().asConverterFactory("application/json".toMediaType()))
            .build()
            .create(RebrickableApi::class.java)
    }
    single {
        Room.databaseBuilder(androidContext(), AppDatabase::class.java, "ninjago.db").build()
    }
    single {
        SetsRepository(
            db = get(),
            brickset = get(),
            rebrickable = get(),
            prefs = androidContext().getSharedPreferences("ninjago_prefs", Context.MODE_PRIVATE),
            json = get(),
        )
    }
    single {
        UpdateManager(
            androidContext(),
            UpdateConfig(githubOwner = "notsogeek87", githubRepository = "lieluwish", checkIntervalHours = 1),
        )
    }
    viewModel { AppUpdateViewModel(get(), updatesEnabledFor(androidContext().packageName)) }
    viewModel { SetsViewModel(get()) }
    viewModel { HeartsViewModel(get()) }
    viewModel { (id: String) -> DetailViewModel(id, get()) }
}
