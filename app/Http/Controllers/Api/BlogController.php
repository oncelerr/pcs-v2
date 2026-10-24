<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Services\AdminActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

// Public read endpoints plus admin CRUD for blog posts
class BlogController extends Controller
{
    /**
     * Public: paginated listing of published posts, newest first.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 7);
        $perPage = max(1, min($perPage, 50));

        $query = Blog::published()->with('author:id,name');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        if ($request->filled('tag')) {
            $tag = $request->input('tag');
            $query->whereJsonContains('tags', $tag);
        }

        $blogs = $query->orderByDesc('published_at')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $blogs->items(),
            'pagination' => [
                'total' => $blogs->total(),
                'per_page' => $blogs->perPage(),
                'current_page' => $blogs->currentPage(),
                'last_page' => $blogs->lastPage(),
            ],
        ]);
    }

    /**
     * Public: a single published post by slug, plus a few related posts.
     */
    public function show(string $slug)
    {
        $blog = Blog::published()->with('author:id,name')->where('slug', $slug)->first();

        if (!$blog) {
            return response()->json([
                'success' => false,
                'message' => 'Blog post not found',
            ], 404);
        }

        $related = Blog::published()
            ->where('id', '!=', $blog->id)
            ->orderByDesc('published_at')
            ->limit(3)
            ->get(['id', 'title', 'slug', 'excerpt', 'cover_image', 'tags', 'published_at']);

        return response()->json([
            'success' => true,
            'data' => $blog,
            'related' => $related,
        ]);
    }

    /**
     * Admin: paginated listing of all posts regardless of status.
     */
    public function adminIndex(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $query = Blog::with('author:id,name');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $blogs = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $blogs->items(),
            'pagination' => [
                'total' => $blogs->total(),
                'per_page' => $blogs->perPage(),
                'current_page' => $blogs->currentPage(),
                'last_page' => $blogs->lastPage(),
            ],
        ]);
    }

    /**
     * Admin: a single post regardless of status, for editing.
     */
    public function adminShow(Blog $blog)
    {
        return response()->json([
            'success' => true,
            'data' => $blog,
        ]);
    }

    /**
     * Admin: create a new post.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'status' => 'required|in:draft,published',
            'cover_image' => 'nullable|image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $blog = new Blog($validator->validated());
        $blog->slug = Blog::uniqueSlugFromTitle($request->input('title'));
        $blog->author_id = $request->user()->id;

        if ($request->hasFile('cover_image')) {
            $blog->cover_image = $request->file('cover_image')->store('blog_covers', 'public');
        }

        if ($blog->status === 'published') {
            $blog->published_at = now();
        }

        $blog->save();

        AdminActivityLogger::log(
            'blog_created',
            "Created blog post \"{$blog->title}\"",
            $blog,
            ['status' => $blog->status]
        );

        return response()->json([
            'success' => true,
            'message' => 'Blog post created successfully',
            'data' => $blog,
        ], 201);
    }

    /**
     * Admin: update an existing post.
     */
    public function update(Request $request, Blog $blog)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'status' => 'required|in:draft,published',
            'cover_image' => 'nullable|image|max:5120',
            'remove_cover_image' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $wasPublished = $blog->status === 'published';

        $blog->fill($validator->safe()->only(['title', 'excerpt', 'content', 'tags', 'status']));

        if ($request->input('title') !== $blog->getOriginal('title')) {
            $blog->slug = Blog::uniqueSlugFromTitle($request->input('title'), $blog->id);
        }

        if ($request->hasFile('cover_image')) {
            if ($blog->cover_image) {
                Storage::disk('public')->delete($blog->cover_image);
            }
            $blog->cover_image = $request->file('cover_image')->store('blog_covers', 'public');
        } elseif ($request->boolean('remove_cover_image') && $blog->cover_image) {
            Storage::disk('public')->delete($blog->cover_image);
            $blog->cover_image = null;
        }

        if (!$wasPublished && $blog->status === 'published') {
            $blog->published_at = now();
        } elseif ($blog->status !== 'published') {
            $blog->published_at = null;
        }

        $blog->save();

        AdminActivityLogger::log(
            'blog_updated',
            "Updated blog post \"{$blog->title}\"",
            $blog,
            ['status' => $blog->status]
        );

        return response()->json([
            'success' => true,
            'message' => 'Blog post updated successfully',
            'data' => $blog,
        ]);
    }

    /**
     * Admin: delete a post and its cover image.
     */
    public function destroy(Blog $blog)
    {
        if ($blog->cover_image) {
            Storage::disk('public')->delete($blog->cover_image);
        }

        $title = $blog->title;
        $blog->delete();

        AdminActivityLogger::log(
            'blog_deleted',
            "Deleted blog post \"{$title}\"",
            null,
            ['blog_id' => $blog->id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Blog post deleted successfully',
        ]);
    }
}
