<?php
namespace App\Core;

class Env
{
    public static function load($path = null)
    {
        $path = $path ?? dirname(__DIR__, 2) . '/.env'; // project root

        if (!file_exists($path)) {
            throw new \RuntimeException(".env file not found: {$path}");
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (str_starts_with(trim($line), '#')) {
                continue;
            }
            if (str_contains($line, '=')) {
                [$name, $value] = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value);
                $value = trim($value, '"\'');
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
            }
        }
    }
    public static function get(string $key, mixed $default = null): mixed
    {
        $value = $_ENV[$key] ?? getenv($key);

        // If value is false, null or empty string → default
        if ($value === false || $value === null || $value === '') {
            return $default;
        }

        return $value;
    }

    /** @throws \RuntimeException in production if critical settings are insecure */
    public static function assertProductionReady(): void
    {
        if (self::get('APP_ENV', 'production') !== 'production') {
            return;
        }

        $weakSecrets = ['change-me-access-token-secret', 'change-me-refresh-token-secret', ''];
        $jwt = (string) self::get('JWT_SECRET', '');
        $refresh = (string) self::get('REFRESH_SECRET', '');

        if (in_array($jwt, $weakSecrets, true) || strlen($jwt) < 32) {
            throw new \RuntimeException('JWT_SECRET in production must be at least 32 characters (256-bit) and not the default value.');
        }

        if (in_array($refresh, $weakSecrets, true) || strlen($refresh) < 32) {
            throw new \RuntimeException('REFRESH_SECRET in production must be at least 32 characters (256-bit) and not the default value.');
        }

        $uploadDir = self::get('UPLOAD_DIR');
        if (!$uploadDir || !is_dir($uploadDir)) {
            throw new \RuntimeException('UPLOAD_DIR must be set in production and located outside the webroot.');
        }
    }
}