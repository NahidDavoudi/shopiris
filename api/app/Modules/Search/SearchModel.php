<?php
namespace App\Modules\Search;

use App\Core\Database\Database;
use PDO;

class SearchModel
{
    private PDO $pdo;
    private string $table = 'products';

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }

    /**
     * SELECT پایه با JOIN دسته‌بندی و تصویر اصلی
     * - فقط از ستون‌های موجود در schema استفاده می‌کند
     * - product_images: id, product_id, image_url, alt_text, is_main, sort_order, created_at
     */
    private function baseSelect(): string
    {
        return "
            SELECT
                p.id, p.name, p.slug, p.short_description, p.description,
                p.price, p.sale_price, p.stock, p.featured, p.views,
                p.category_id,
                c.name AS category_name,
                (SELECT pi.image_url
                 FROM product_images pi
                 WHERE pi.product_id = p.id AND pi.is_main = 1
                 ORDER BY pi.sort_order ASC, pi.id ASC
                 LIMIT 1) AS main_image
            FROM {$this->table} p
            LEFT JOIN categories c ON c.id = p.category_id
        ";
    }

    public function findCandidates(array $likeTerms, int $limit = 300): array
    {
        if (!$likeTerms) {
            return [];
        }

        $compactExpr = "REPLACE(REPLACE(p.name, ' ', ''), '\u{200C}', '')";
        $conditions  = [];
        $params      = [];

        foreach ($likeTerms as $i => $term) {
            // Escape % و _ و backslash برای LIKE
            $escaped = strtr($term, ['\\' => '\\\\', '%' => '\\%', '_' => '\\_']);
            $conditions[]   = "({$compactExpr} LIKE :name{$i} OR {$compactExpr} LIKE :desc{$i})";
            $params["name{$i}"] = '%' . $escaped . '%';
            $params["desc{$i}"] = '%' . $escaped . '%';
        }

        $sql = $this->baseSelect() . "
            WHERE p.status = 'active'
              AND p.is_active = 1
              AND (" . implode(' OR ', $conditions) . ")
            ORDER BY p.id DESC
            LIMIT " . (int) $limit;

        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue(':' . $k, $v, PDO::PARAM_STR);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findFallbackCandidates(int $limit = 150): array
    {
        $sql = $this->baseSelect() . "
            WHERE p.status = 'active' AND p.is_active = 1
            ORDER BY p.views DESC, p.created_at DESC
            LIMIT " . (int) $limit;

        return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}