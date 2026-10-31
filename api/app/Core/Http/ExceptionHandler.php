<?php

namespace App\Core\Http;

use App\Core\Env;
use App\Core\Logger;
use Throwable;

class ExceptionHandler
{
    private bool $isDevMode;

    public function __construct()
    {
        $this->isDevMode = Env::get('APP_ENV', 'production') === 'development';
    }

    // ─────────────────────────────────────────
    //  Main entry point — all exceptions come here
    // ─────────────────────────────────────────

    public function handle(Throwable $e): void
{
    $statusCode = $this->resolveStatusCode($e);

    // ← add this
    if ($statusCode >= 500) {
        Logger::error($e->getMessage(), [
            'exception' => get_class($e),
            'file'      => $e->getFile(),
            'line'      => $e->getLine(),
        ]);
    }

    if ($this->expectsJson()) {
        $this->respondJson($e, $statusCode);
    } else {
        $this->respondHtml($e, $statusCode);
    }
}

    // ─────────────────────────────────────────
    //  Convert PHP errors to Exception
    //  (set_error_handler calls this)
    // ─────────────────────────────────────────

    public function handleError(
        int    $severity,
        string $message,
        string $file,
        int    $line
    ): bool {
        if (!(error_reporting() & $severity)) {
            return false;
        }

        throw new \ErrorException($message, 0, $severity, $file, $line);
    }

    // ─────────────────────────────────────────
    //  JSON response
    // ─────────────────────────────────────────

    private function respondJson(Throwable $e, int $code): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');

        $body = [
            'success' => false,
            'message' => $this->resolveMessage($e, $code),
        ];

        // Show more complete info in dev mode
        if ($this->isDevMode) {
            $body['debug'] = [
                'exception' => get_class($e),
                'message'   => $e->getMessage(),
                'file'      => $e->getFile(),
                'line'      => $e->getLine(),
                'trace'     => $this->formatTrace($e),
            ];
        }

        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // ─────────────────────────────────────────
    //  HTML response
    // ─────────────────────────────────────────

    private function respondHtml(Throwable $e, int $code): void
    {
        http_response_code($code);
        header('Content-Type: text/html; charset=utf-8');

        // In dev mode, if the view doesn't exist, show the raw error
        if ($this->isDevMode) {
            $this->renderDevPage($e, $code);
            exit;
        }

        // View file matching the status code
        $viewPath = $this->resolveView($code);

        if (file_exists($viewPath)) {
            // Variables accessible inside the view
            $statusCode = $code;
            $message    = $this->resolveMessage($e, $code);
            require $viewPath;
        } else {
            // Fallback if the view file isn't found
            echo "<h1>Error {$code}</h1><p>" . $this->resolveMessage($e, $code) . "</p>";
        }

        exit;
    }

    // ─────────────────────────────────────────
    //  Determine status code from exception type
    // ─────────────────────────────────────────

    private function resolveStatusCode(Throwable $e): int
    {
        // If the exception has its own code and it's a valid HTTP code, use it
        $code = $e->getCode();

        if (is_int($code) && $code >= 400 && $code < 600) {
            return $code;
        }

        // Based on the exception type
        return match (true) {
            $e instanceof \InvalidArgumentException => 400,
            $e instanceof \RuntimeException         => 400,
            default                                 => 500,
        };
    }

    // ─────────────────────────────────────────
    //  Appropriate user-facing message
    // ─────────────────────────────────────────

    private function resolveMessage(Throwable $e, int $code): string
    {
        // In dev mode, show the actual exception message
        if ($this->isDevMode) {
            return $e->getMessage() ?: $this->defaultMessage($code);
        }

        // In production, only safe messages
        return $this->defaultMessage($code);
    }

    private function defaultMessage(int $code): string
    {
        return match ($code) {
            400 => 'Bad request',
            401 => 'Please sign in to your account first',
            403 => 'You do not have permission to access this section',
            404 => 'The requested page or resource was not found',
            405 => 'Request method not allowed',
            422 => 'Validation error',
            429 => 'Too many requests',
            500 => 'Internal server error',
            503 => 'Service temporarily unavailable',
            default => 'Unknown error',
        };
    }

    // ─────────────────────────────────────────
    //  View file path
    // ─────────────────────────────────────────

    private function resolveView(int $code): string
    {
        $base = dirname(__DIR__, 2) . '/views/errors';
        // First look for an exact file (e.g. 404.php)
        $specific = "{$base}/{$code}.php";
        if (file_exists($specific)) {
            return $specific;
        }

        // Then look for a generic file (5xx.php or 4xx.php)
        $category = (int) floor($code / 100) . 'xx';
        $general  = "{$base}/{$category}.php";
        if (file_exists($general)) {
            return $general;
        }

        // Final fallback
        return "{$base}/500.php";
    }

    // ─────────────────────────────────────────
    //  Detect request type
    // ─────────────────────────────────────────

    private function expectsJson(): bool
    {
        $accept      = $_SERVER['HTTP_ACCEPT']       ?? '';
        $contentType = $_SERVER['HTTP_CONTENT_TYPE'] ?? $_SERVER['CONTENT_TYPE'] ?? '';

        return str_contains($accept, 'application/json')
            || str_contains($contentType, 'application/json')
            || str_starts_with($_SERVER['REQUEST_URI'] ?? '', '/api');
    }

    // ─────────────────────────────────────────
    //  Debug page for development
    // ─────────────────────────────────────────

    private function renderDevPage(Throwable $e, int $code): void
    {
        $class   = get_class($e);
        $message = htmlspecialchars($e->getMessage());
        $file    = htmlspecialchars($e->getFile());
        $line    = $e->getLine();
        $trace   = htmlspecialchars($e->getTraceAsString());

        echo <<<HTML
        <!DOCTYPE html>
        <html dir="ltr" lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Error {$code}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: monospace; background: #0f0f0f; color: #e0e0e0; padding: 2rem; }
                h1 { color: #ff5f5f; font-size: 1.5rem; margin-bottom: 1rem; }
                .badge { display: inline-block; background: #ff5f5f; color: #fff;
                         padding: .2rem .6rem; border-radius: 4px; font-size: .8rem; margin-bottom: 1rem; }
                .box { background: #1a1a1a; border: 1px solid #333; border-radius: 6px;
                       padding: 1.2rem; margin-bottom: 1rem; }
                .label { color: #888; font-size: .75rem; margin-bottom: .4rem; }
                .location { color: #7eb8f7; }
                pre { white-space: pre-wrap; word-break: break-all; font-size: .8rem;
                      color: #bbb; max-height: 400px; overflow-y: auto; }
            </style>
        </head>
        <body>
            <span class="badge">HTTP {$code} — DEV MODE</span>
            <h1>{$message}</h1>
            <div class="box">
                <div class="label">EXCEPTION</div>
                <div>{$class}</div>
            </div>
            <div class="box">
                <div class="label">LOCATION</div>
                <div class="location">{$file} : {$line}</div>
            </div>
            <div class="box">
                <div class="label">STACK TRACE</div>
                <pre>{$trace}</pre>
            </div>
        </body>
        </html>
        HTML;
    }

    // ─────────────────────────────────────────
    //  Format trace for JSON
    // ─────────────────────────────────────────

    private function formatTrace(Throwable $e): array
    {
        return array_map(function (array $frame): array {
            return [
                'file'     => $frame['file']     ?? '[internal]',
                'line'     => $frame['line']      ?? 0,
                'function' => ($frame['class']    ?? '')
                            . ($frame['type']     ?? '')
                            . ($frame['function'] ?? ''),
            ];
        }, $e->getTrace());
    }
}
