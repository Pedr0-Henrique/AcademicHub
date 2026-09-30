<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTurmaRequest;
use App\Http\Requests\UpdateTurmaRequest;
use App\Models\Turma;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TurmaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Turma::class);

        $query = Turma::with('course')->withCount('enrollments');

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->integer('course_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderByDesc('created_at')->paginate($request->integer('per_page', 10)),
        ]);
    }

    public function show(Turma $turma): JsonResponse
    {
        $this->authorize('view', $turma);

        return response()->json([
            'success' => true,
            'data' => $turma->load('course')->loadCount('enrollments'),
        ]);
    }

    public function store(StoreTurmaRequest $request): JsonResponse
    {
        $this->authorize('create', Turma::class);
        $turma = Turma::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Turma cadastrada com sucesso.',
            'data' => $turma->load('course')->loadCount('enrollments'),
        ], 201);
    }

    public function update(UpdateTurmaRequest $request, Turma $turma): JsonResponse
    {
        $this->authorize('update', $turma);
        $turma->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Turma atualizada com sucesso.',
            'data' => $turma->fresh()->load('course')->loadCount('enrollments'),
        ]);
    }

    public function destroy(Turma $turma): JsonResponse
    {
        $this->authorize('delete', $turma);

        if ($turma->enrollments()->exists()) {
            throw ValidationException::withMessages([
                'turma' => ['Não é possível remover uma turma que possui matrículas.'],
            ]);
        }

        $turma->delete();

        return response()->json([
            'success' => true,
            'message' => 'Turma removida com sucesso.',
        ]);
    }
}