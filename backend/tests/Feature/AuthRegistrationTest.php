<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Turma;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AuthRegistrationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'database.default' => 'sqlite',
            'database.connections.sqlite.database' => ':memory:',
        ]);
        DB::purge('sqlite');

        Schema::connection('sqlite')->create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('role');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::connection('sqlite')->create('personal_access_tokens', function (Blueprint $table): void {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::connection('sqlite')->create('students', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique();
            $table->string('name');
            $table->string('cpf', 14)->unique();
            $table->string('email')->unique();
            $table->string('phone', 20);
            $table->date('birth_date');
            $table->string('address');
            $table->string('city');
            $table->string('state', 2);
            $table->string('zip_code', 9);
            $table->string('status');
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::connection('sqlite')->create('courses', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('code')->unique();
            $table->integer('workload');
            $table->string('status');
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::connection('sqlite')->create('turmas', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('course_id');
            $table->string('name', 100);
            $table->string('term', 20)->nullable();
            $table->string('shift', 20)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->string('status');
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::connection('sqlite')->create('enrollments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id');
            $table->foreignId('course_id');
            $table->foreignId('turma_id')->nullable();
            $table->date('enrollment_date');
            $table->string('status');
            $table->timestamps();
        });
    }

    public function test_student_can_register_and_receives_an_authenticated_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ana Silva',
            'email' => 'ana@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'manager',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.name', 'Ana Silva')
            ->assertJsonPath('data.user.email', 'ana@example.com')
            ->assertJsonPath('data.user.role', 'user')
            ->assertJsonStructure(['data' => ['user' => ['id', 'name', 'email', 'role'], 'token']]);

        $this->assertDatabaseHas('users', [
            'email' => 'ana@example.com',
            'role' => 'user',
        ]);
        $this->assertTrue(Hash::check('password123', User::where('email', 'ana@example.com')->value('password')));
    }

    public function test_manager_can_log_in_with_a_provisioned_account(): void
    {
        User::factory()->create([
            'email' => 'manager@example.com',
            'password' => 'password123',
            'role' => 'manager',
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'manager@example.com',
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('data.user.role', 'manager')
            ->assertJsonStructure(['data' => ['token']]);
    }

    public function test_student_can_only_read_their_own_academic_data(): void
    {
        $user = User::factory()->create([
            'email' => 'ana@example.com',
            'role' => 'user',
        ]);
        $ownStudent = $this->createStudent('Ana Silva', 'ana@example.com', '111.111.111-11', $user->id);
        $otherUser = User::factory()->create(['email' => 'outro@example.com', 'role' => 'user']);
        $otherStudent = $this->createStudent('Outro aluno', 'outro@example.com', '222.222.222-22', $otherUser->id);
        $ownCourse = $this->createCourse('Matemática', 'MAT-101');
        $ownTurma = $this->createTurma($ownCourse, 'Turma A');
        $otherCourse = $this->createCourse('História', 'HIS-101');
        $otherTurma = $this->createTurma($otherCourse, 'Turma B');
        $ownEnrollment = $this->createEnrollment($ownStudent, $ownCourse, $ownTurma);
        $otherEnrollment = $this->createEnrollment($otherStudent, $otherCourse, $otherTurma);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/students/me')
            ->assertOk()
            ->assertJsonPath('data.student.id', $ownStudent->id)
            ->assertJsonPath('data.student.enrollments.0.id', $ownEnrollment->id)
            ->assertJsonPath('data.student.enrollments.0.turma.name', 'Turma A')
            ->assertJsonPath('data.student.enrollments.0.turma.course.name', 'Matemática')
            ->assertDontSee('Outro aluno')
            ->assertDontSee('História')
            ->assertDontSee('Turma B');

        foreach ([
            '/api/v1/students',
            '/api/v1/students/' . $otherStudent->id,
            '/api/v1/courses',
            '/api/v1/courses/' . $otherCourse->id,
            '/api/v1/enrollments',
            '/api/v1/enrollments/' . $otherEnrollment->id,
            '/api/v1/turmas',
            '/api/v1/turmas/' . $otherTurma->id,
        ] as $endpoint) {
            $this->getJson($endpoint)->assertForbidden();
        }
    }

    public function test_student_can_complete_their_own_academic_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Ana Silva',
            'email' => 'ana@example.com',
            'role' => 'user',
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/students/me')
            ->assertOk()
            ->assertJsonPath('data.student', null);

        $this->putJson('/api/v1/students/me/profile', [
            'cpf' => '111.111.111-11',
            'phone' => '11999999999',
            'birth_date' => '2000-01-01',
            'address' => 'Rua das Flores, 10',
            'city' => 'São Paulo',
            'state' => 'SP',
            'zip_code' => '01000-000',
        ])->assertCreated()
            ->assertJsonPath('data.student.name', 'Ana Silva')
            ->assertJsonPath('data.student.email', 'ana@example.com');

        $this->assertDatabaseHas('students', [
            'email' => 'ana@example.com',
            'cpf' => '111.111.111-11',
            'user_id' => $user->id,
        ]);
    }

    public function test_legacy_student_profile_requires_matching_cpf_before_linking(): void
    {
        $user = User::factory()->create([
            'email' => 'ana@example.com',
            'role' => 'user',
        ]);
        $student = $this->createStudent('Ana Silva', 'ana@example.com', '111.111.111-11');

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/students/me/profile', [
                'cpf' => '999.999.999-99',
                'phone' => '11999999999',
                'birth_date' => '2000-01-01',
                'address' => 'Rua das Flores, 10',
                'city' => 'São Paulo',
                'state' => 'SP',
                'zip_code' => '01000-000',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('cpf');

        $this->assertDatabaseHas('students', ['id' => $student->id, 'user_id' => null]);

        $this->putJson('/api/v1/students/me/profile', [
            'cpf' => $student->cpf,
            'phone' => '11999999999',
            'birth_date' => '2000-01-01',
            'address' => 'Rua das Flores, 10',
            'city' => 'São Paulo',
            'state' => 'SP',
            'zip_code' => '01000-000',
        ])->assertCreated();

        $this->assertDatabaseHas('students', ['id' => $student->id, 'user_id' => $user->id]);
    }

    public function test_manager_keeps_access_to_administrative_student_lists(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $this->createStudent('Aluno cadastrado', 'aluno@example.com', '333.333.333-33');

        $this->actingAs($manager, 'sanctum')
            ->getJson('/api/v1/students')
            ->assertOk()
            ->assertJsonPath('data.total', 1);
    }

    private function createStudent(string $name, string $email, string $cpf, ?int $userId = null): Student
    {
        return Student::create([
            'user_id' => $userId,
            'name' => $name,
            'email' => $email,
            'cpf' => $cpf,
            'phone' => '11999999999',
            'birth_date' => '2000-01-01',
            'address' => 'Rua das Flores, 10',
            'city' => 'São Paulo',
            'state' => 'SP',
            'zip_code' => '01000-000',
            'status' => 'active',
        ]);
    }

    private function createCourse(string $name, string $code): Course
    {
        return Course::create([
            'name' => $name,
            'description' => 'Descrição do curso',
            'code' => $code,
            'workload' => 60,
            'status' => 'active',
        ]);
    }

    private function createTurma(Course $course, string $name): Turma
    {
        return Turma::create([
            'course_id' => $course->id,
            'name' => $name,
            'status' => 'active',
        ]);
    }

    private function createEnrollment(Student $student, Course $course, Turma $turma): Enrollment
    {
        return Enrollment::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'turma_id' => $turma->id,
            'enrollment_date' => '2026-09-30',
            'status' => 'active',
        ]);
    }
}