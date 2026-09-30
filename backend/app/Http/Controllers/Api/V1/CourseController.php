<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Course::class);

        $query = Course::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Pagination
        $perPage = $request->input('per_page', 10);
        $courses = $query->withCount('enrollments')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $courses,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $course = Course::with('enrollments.student')->withCount('enrollments')->findOrFail($id);
        $this->authorize('view', $course);

        return response()->json([
            'success' => true,
            'data' => $course,
        ]);
    }

    public function store(StoreCourseRequest $request): JsonResponse
    {
        $this->authorize('create', Course::class);
        $course = Course::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Curso cadastrado com sucesso.',
            'data' => $course,
        ], 201);
    }

    public function update(UpdateCourseRequest $request, int $id): JsonResponse
    {
        $course = Course::findOrFail($id);
        $this->authorize('update', $course);
        $course->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Curso atualizado com sucesso.',
            'data' => $course,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $course = Course::findOrFail($id);
        $this->authorize('delete', $course);
        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Curso removido com sucesso.',
        ]);
    }
}
