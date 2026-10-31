<?php

namespace App\Core;

use App\Core\Validation\Validator;
use App\Core\Auth\Auth;
use App\Core\Http\Response;

abstract class Controller
{
    protected function json(array $data, int $code = 200): void
    {
        Response::json($data, $code);
    }

    protected function success(mixed $data = null, string $message = 'Operation completed successfully', int $code = 200): void
    {
        Response::success($data, $message, $code);
    }

    protected function created(mixed $data = null, string $message = 'Created successfully'): void
    {
        Response::created($data, $message);
    }

    protected function error(string $message, int $code = 400, mixed $errors = null): void
    {
        Response::error($message, $code, $errors);
    }

    /** Map exception code to HTTP status (PDO/SQL codes are ignored). */
    protected function exceptionStatus(\Throwable $e, int $default = 400): int
    {
        $code = (int) $e->getCode();
        return ($code >= 400 && $code < 600) ? $code : $default;
    }

    protected function validationError(array $errors, string $message = 'Validation error'): void
    {
        Response::validation($errors, $message);
    }

    protected function notFound(string $message = 'Item not found'): void
    {
        Response::notFound($message);
    }

    protected function unauthorized(string $message = 'Unauthorized'): void
    {
        Response::unauthorized($message);
    }

    protected function forbidden(string $message = 'You do not have access'): void
    {
        Response::forbidden($message);
    }

    protected function tooManyRequests(string $message = 'Too many requests'): void
    {
        Response::tooManyRequests($message);
    }

    protected function noContent(string $message = 'Deleted successfully'): void
    {
        Response::noContent($message);
    }

    protected function user(): ?object
    {
        return Auth::user();
    }

    protected function userId(): ?int
    {
        return Auth::id();
    }

    protected function isAuthenticated(): bool
    {
        return Auth::check();
    }

    protected function validate(array $data, array $rules): bool
    {
        $validator = new \App\Core\Validation\Validator($data, $rules);

        if (!$validator->validate()) {
            $this->validationError($validator->errors());
            return false;
        }

        return true;
    }
}