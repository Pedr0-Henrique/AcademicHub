<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Requests\UpdateEnrollmentRequest;
use App\Models\Enrollment;
use App\Models\Turma;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class EnrollmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Enrollment::class);

        $query = Enrollment::with(['student', 'course', 'turma']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by course
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        // Pagination
        $perPage = $request->input('per_page', 10);
        $enrollments = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $enrollments,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $enrollment = Enrollment::with(['student', 'course', 'turma'])->findOrFail($id);
        $this->authorize('view', $enrollment);

        return response()->json([
            'success' => true,
            'data' => $enrollment,
        ]);
    }

    public function store(StoreEnrollmentRequest $request): JsonResponse
    {
        $this->authorize('create', Enrollment::class);
        $data = $request->validated();

        // Check for duplicate active enrollment
        $turma = Turma::findOrFail($data['turma_id']);
        $existing = Enrollment::where('student_id', $data['student_id'])
            ->where('turma_id', $turma->id)
            ->where('status', 'active')
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'enrollment' => ['O aluno já possui uma matrícula ativa neste curso.'],
            ]);
        }

        $data['course_id'] = $turma->course_id;
        $enrollment = Enrollment::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Matrícula realizada com sucesso.',
            'data' => $enrollment->load(['student', 'course', 'turma']),
        ], 201);
    }

    public function update(UpdateEnrollmentRequest $request, int $id): JsonResponse
    {
        $enrollment = Enrollment::findOrFail($id);
        $this->authorize('update', $enrollment);

        $data = $request->validated();
        $turmaId = $data['turma_id'] ?? $enrollment->turma_id;
        $studentId = $data['student_id'] ?? $enrollment->student_id;
        $status = $data['status'] ?? $enrollment->status;

        if (isset($data['turma_id'])) {
            $data['course_id'] = Turma::findOrFail($data['turma_id'])->course_id;
        }

        if ($status === 'active') {
            $existing = Enrollment::where('student_id', $studentId)
                ->where('turma_id', $turmaId)
                ->where('status', 'active')
                ->where('id', '!=', $enrollment->id)
                ->first();

            if ($existing) {
                throw ValidationException::withMessages([
                    'status' => ['O aluno já possui uma matrícula ativa neste curso.'],
                ]);
            }
        }

        $enrollment->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Matrícula atualizada com sucesso.',
            'data' => $enrollment->load(['student', 'course', 'turma']),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $enrollment = Enrollment::findOrFail($id);
        $this->authorize('delete', $enrollment);
        $enrollment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Matrícula removida com sucesso.',
        ]);
    }
}
