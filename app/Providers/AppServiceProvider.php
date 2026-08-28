<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Railway terminates TLS at the edge; force https so redirects,
        // form actions and assets are generated with the correct scheme.
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
