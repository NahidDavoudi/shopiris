<?php

namespace App\Modules\Wishlist;

use App\Core\Database\Model;

class WishlistItemModel extends Model
{
    protected string $table = 'wishlist_items';
    protected bool $timestamps = true;
    protected array $fillable = [
        'wishlist_id',
        'product_id',
    ];

    public function findByWishlistAndProduct(int $wishlistId, int $productId): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM {$this->table}
            WHERE wishlist_id = ? AND product_id = ?
            LIMIT 1
        ");
        $stmt->execute([$wishlistId, $productId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function addProduct(int $wishlistId, int $productId): int
    {
        return $this->create([
            'wishlist_id' => $wishlistId,
            'product_id'  => $productId,
        ]);
    }

    public function removeProduct(int $wishlistId, int $productId): bool
    {
        $stmt = $this->pdo->prepare("
            DELETE FROM {$this->table} WHERE wishlist_id = ? AND product_id = ?
        ");
        return $stmt->execute([$wishlistId, $productId]);
    }

    public function countProducts(int $wishlistId): int
    {
        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) FROM {$this->table} WHERE wishlist_id = ?
        ");
        $stmt->execute([$wishlistId]);
        return (int) $stmt->fetchColumn();
    }
}
