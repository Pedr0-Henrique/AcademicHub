<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $studentId = $this->route('student');

        return [
            'name' => 'sometimes|required|string|max:255',
            'cpf' => 'sometimes|required|string|size:14|unique:students,cpf,' . $studentId,
            'email' => 'sometimes|required|email|unique:students,email,' . $studentId,
            'phone' => 'sometimes|required|string|max:20',
            'birth_date' => 'sometimes|required|date|before:today',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'state' => 'sometimes|required|string|size:2',
            'zip_code' => 'sometimes|required|string|size:9',
            'status' => 'in:active,inactive',
        ];
    }
}
