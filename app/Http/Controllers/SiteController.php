<?php

namespace App\Http\Controllers;

use App\Support\ContentRepository;

class SiteController extends Controller
{
    public function index(ContentRepository $content)
    {
        return view('site.index', [
            'content' => $content->all(),
            'adminPath' => '/'.trim((string) config('portfolio.admin_path'), '/'),
        ]);
    }
}
