<?php

namespace App\Http\Controllers;

use App\Support\AdminAuth;
use App\Support\ContentRepository;

class AdminController extends Controller
{
    public function index(AdminAuth $auth, ContentRepository $content)
    {
        $auth->ensureSeeded();

        return view('site.admin', [
            'content' => $content->all(),
            'adminPath' => '/'.config('portfolio.admin_path'),
        ]);
    }
}
