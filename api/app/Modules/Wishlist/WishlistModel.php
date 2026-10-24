<?php

namespace App\Modules\Wishlist;

use App\Core\Database\Model;

class WishlistModel extends Model
{
    protected string $table = 'wishlists';
    protected bool $timestamps = true;
    protected array $fillable = ['user_id'];

    public function getOrCreateForUser(int $userId): array
    {
        $wishlist = $this->findBy('user_id', $userId);
        if ($wishlist) return $wishlist;

        try {
            $id = $this->create(['user_id' => $userId]);
        } catch (\Exception) {
            // درخواست موازی همزمان ویش‌لیست را ساخته (unique key روی user_id) — دوباره بخوان
            $wishlist = $this->findBy('user_id', $userId);
            if (!$wishlist) {
                throw new \RuntimeException('خطا در ایجاد ویش‌لیست.', 500);
            }
            return $wishlist;
        }

        return $this->find($id);
    }

    public function findByUserId(int $userId): ?array
    {
        return $this->findBy('user_id', $userId);
    }

    /**
     * ویش‌لیست کاربر به‌همراه آیتم‌ها (اطلاعات کامل محصول برای نمایش لیست)
     * منطق JOIN و قیمت‌گذاری هم‌الگوی CartModel::getCartWithItems است.
     */
    public function getWishlistWithItems(int $userId): ?array
    {
        $wishlist = $this->findByUserId($userId);
        if (!$wishlist) return null;

        $stmt = $this->pdo->prepare("
            SELECT wi.id AS item_id,
                   wi.product_id,
                   wi.created_at AS added_at,
                   p.name, p.slug AS product_slug, p.product_type,
                   p.price AS product_price, p.sale_price AS product_sale_price,
                   p.stock AS product_stock, p.is_active,
                   pv.id AS default_variant_id,
                   pv.title AS variant_title,
                   pv.price AS variant_price, pv.sale_price AS variant_sale_price,
                   pv.is_active AS variant_is_active,
                   CASE WHEN ii.variant_id IS NULL THEN NULL
                        ELSE COALESCE(ii.quantity - ii.reserved_quantity, 0) END AS variant_stock,
                   (SELECT pi.image_url FROM product_images pi
                    WHERE pi.product_id = p.id AND pi.is_main = 1
                    LIMIT 1) AS image,
                   (SELECT COUNT(*) FROM product_variants pc WHERE pc.product_id = p.id) AS variant_count,
                   (SELECT MIN(COALESCE(pc.price, p.price)) FROM product_variants pc WHERE pc.product_id = p.id) AS price_min,
                   (SELECT MAX(COALESCE(pc.price, p.price)) FROM product_variants pc WHERE pc.product_id = p.id) AS price_max
            FROM wishlist_items wi
            JOIN products p ON p.id = wi.product_id
            LEFT JOIN product_variants pv
                   ON pv.id = (SELECT pc.id FROM product_variants pc
                               WHERE pc.product_id = p.id
                               ORDER BY pc.is_default DESC, pc.position ASC, pc.id ASC
                               LIMIT 1)
            LEFT JOIN inventory_items ii ON ii.variant_id = pv.id
            WHERE wi.wishlist_id = ?
            ORDER BY wi.created_at DESC
        ");
        $stmt->execute([$wishlist['id']]);
        $items = $stmt->fetchAll();

        foreach ($items as &$item) {
            $this->normalizeItem($item);
        }
        unset($item);

        $wishlist['items'] = $items;
        $wishlist['count'] = count($items);

        return $wishlist;
    }

    public function clearItems(int $wishlistId): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM wishlist_items WHERE wishlist_id = ?");
        return $stmt->execute([$wishlistId]);
    }

    /**
     * قیمت موثر آیتم — هم‌منطق با VariantService::getEffectivePrice
     * ترتیب: قیمت حراج واریانت ← قیمت واریانت ← قیمت حراج محصول ← قیمت محصول
     */
    private function effectivePrice(array $item): int
    {
        foreach (['variant_sale_price', 'variant_price'] as $key) {
            if (isset($item[$key]) && $item[$key] !== null && $item[$key] !== '') {
                return (int) $item[$key];
            }
        }

        if (!empty($item['product_sale_price'])) {
            return (int) $item['product_sale_price'];
        }

        return (int) ($item['product_price'] ?? 0);
    }

    private function normalizeItem(array &$item): void
    {
        $item['price'] = $this->effectivePrice($item);

        // موجودی: اگر واریانت پیش‌فرض و ردیف انبار وجود داشت از انبار واریانت، وگرنه از موجودی محصول
        $stock = $item['variant_stock'] !== null
            ? (int) $item['variant_stock']
            : (int) ($item['product_stock'] ?? 0);
        $item['stock']    = max(0, $stock);
        $item['in_stock'] = $item['stock'] > 0;

        $item['requires_variant'] = ($item['product_type'] ?? 'simple') === 'variable';

        $item['is_active']     = (int) $item['is_active'];
        $item['variant_count'] = (int) $item['variant_count'];
        $item['price_min']     = $item['price_min'] !== null ? (int) $item['price_min'] : null;
        $item['price_max']     = $item['price_max'] !== null ? (int) $item['price_max'] : null;

        $item['name'] = $item['variant_title'] && $item['variant_title'] !== 'Default'
            ? $item['name'] . ' — ' . $item['variant_title']
            : $item['name'];

        // ستون‌های داخلی که فقط برای محاسبه لازم بودند از خروجی حذف می‌شوند
        unset(
            $item['product_price'],
            $item['product_sale_price'],
            $item['product_stock'],
            $item['variant_price'],
            $item['variant_sale_price'],
            $item['variant_is_active'],
            $item['variant_stock'],
            $item['variant_title'],
        );
    }
}
