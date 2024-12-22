<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class PostController extends Controller
{
    public function editor()
    {
        return Inertia::render('Editor');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:posts',
            'content' => 'required|string'
        ]);

        try {
            // Create the post in database
            $post = Post::create($validated);

            // Create MDX file in the temp directory
            $mdxContent = $request->content;
            $fileName = $request->slug . '.mdx';
            Storage::put('temp/' . $fileName, $mdxContent);

            // Initialize GitHub API client
            $token = config('services.github.token');
            $repo = config('services.github.repo');
            $branch = 'posts/' . $request->slug;

            // Create new branch
            $response = Http::withToken($token)
                ->post("https://api.github.com/repos/{$repo}/git/refs", [
                    'ref' => "refs/heads/{$branch}",
                    'sha' => 'main-branch-sha' // You'll need to get this dynamically
                ]);

            // Upload file
            $response = Http::withToken($token)
                ->put("https://api.github.com/repos/{$repo}/contents/posts/{$fileName}", [
                    'message' => "Add {$fileName}",
                    'content' => base64_encode($mdxContent),
                    'branch' => $branch
                ]);

            // Create pull request
            $response = Http::withToken($token)
                ->post("https://api.github.com/repos/{$repo}/pulls", [
                    'title' => "Add blog post: {$request->title}",
                    'head' => $branch,
                    'base' => 'main',
                    'body' => "Adds new blog post: {$request->title}"
                ]);

            return response()->json(['message' => 'Post created successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->message], 500);
        }
    }
}
