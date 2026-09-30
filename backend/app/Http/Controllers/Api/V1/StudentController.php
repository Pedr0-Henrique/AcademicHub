<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        $query = Student::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('cpf', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Pagination
        $perPage = $request->input('per_page', 10);
        $students = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'user', 403);

        $student = Student::with(['enrollments.course', 'enrollments.turma.course'])
            ->where('user_id', $request->user()->id)
            ->first();

        return response()->json([
            'success' => true,
            'data' => ['student' => $student],
        ]);
    }

    public function completeMyProfile(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'user', 403);

        $existingStudent = Student::where('email', $request->user()->email)->first();

        if ($existingStudent?->user_id !== null && $existingStudent->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Este perfil acadêmico já está vinculado a outra conta.',
            ], 409);
        }

        $validated = $request->validate([
            'cpf' => ['required', 'string', 'max:14', Rule::unique('students', 'cpf')->ignore($existingStudent?->id)],
            'phone' => 'required|string|max:20',
            'birth_date' => 'required|date|before_or_equal:today',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|size:2',
            'zip_code' => 'required|string|max:9',
        ]);

        if ($existingStudent) {
            $existingCpf = preg_replace('/\D/', '', $existingStudent->cpf);
            $providedCpf = preg_replace('/\D/', '', $validated['cpf']);

            if (!hash_equals($existingCpf, $providedCpf)) {
                throw ValidationException::withMessages([
                    'cpf' => ['O CPF informado não corresponde ao cadastro acadêmico existente.'],
                ]);
            }

            $existingStudent->user_id = $request->user()->id;
            $existingStudent->save();
            $student = $existingStudent;
        } else {
            $student = Student::create([
                ...$validated,
                'user_id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'status' => 'active',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Perfil acadêmico preenchido com sucesso.',
            'data' => ['student' => $student],
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $student = Student::with('enrollments.course')->findOrFail($id);
        $this->authorize('view', $student);

        return response()->json([
            'success' => true,
            'data' => $student,
        ]);
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $this->authorize('create', Student::class);
        $student = Student::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Aluno cadastrado com sucesso.',
            'data' => $student,
        ], 201);
    }

    public function update(UpdateStudentRequest $request, int $id): JsonResponse
    {
        $student = Student::findOrFail($id);
        $this->authorize('update', $student);
        $student->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Aluno atualizado com sucesso.',
            'data' => $student,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $student = Student::findOrFail($id);
        $this->authorize('delete', $student);
        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'Aluno removido com sucesso.',
        ]);
    }
}
