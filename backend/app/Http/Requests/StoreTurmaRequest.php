<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTurmaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string|max:100',
            'term' => 'nullable|string|max:20',
            'shift' => 'nullable|in:morning,afternoon,night,full_time',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'sometimes|in:active,inactive',
        ];
    }
}