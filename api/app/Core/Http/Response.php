<?php
namespace App\Core\Http;

class Response {

    public static function json(array $data, int $code = 200): never {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'Operation completed successfully', int $code = 200): never {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    public static function created(mixed $data = null, string $message = 'Created successfully'): never {
        self::success($data, $message, 201);
    }

    public static function error(string $message, int $code = 400, mixed $errors = null): never {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        self::json($response, $code);
    }

    public static function notFound(string $message = 'Item not found'): never {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = 'Unauthorized'): never {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'You do not have access'): never {
        self::error($message, 403);
    }

    public static function tooManyRequests(string $message = 'Too many requests'): never {
        self::error($message, 429);
    }

    public static function validation(array $errors, string $message = 'Validation error'): never {
        self::error($message, 422, $errors);
    }

    public static function noContent(string $message = 'Deleted successfully'): never {
        http_response_code(204);
        exit;
    }
}