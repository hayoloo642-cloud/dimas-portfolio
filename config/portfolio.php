<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Admin panel secret path
    |--------------------------------------------------------------------------
    | The admin panel is not linked publicly. It only appears when this exact
    | path is opened. Change ADMIN_PATH in .env to your own secret.
    */
    'admin_path' => env('ADMIN_PATH', 'panel-dim4s'),

    /* Default admin password, only used on first seed. */
    'default_password' => env('ADMIN_PASSWORD', 'admin123'),

    /* How many content revisions to keep. */
    'revisions' => 20,

    /* Max upload size in bytes. */
    'max_upload' => 8 * 1024 * 1024,
];
