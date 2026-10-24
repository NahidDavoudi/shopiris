<?php

namespace App\Modules\Wishlist;

use App\Modules\Cart\CartService;
use App\Modules\Product\ProductModel;

class WishlistService
{
    public function __construct(
        private WishlistModel     $wishlistModel,
        private WishlistItemModel $itemModel,
        private ProductModel      $productModel,
        private CartService       $cartService,
    ) {}

    public function getWishlist(int $userId): array
    {
        $wishlist = $this->wishlistModel->getWishlistWithItems($userId);

        if (!$wishlist) {
            return $this->emptyWishlist();
        }

        return $wishlist;
    }

    /**
     * افزودن محصول به ویش‌لیست — رفتار idempotent:
     * اگر محصول از قبل در ویش‌لیست باشد، خطا نمی‌دهد و فقط وضعیت را برمی‌گرداند.
     */
    public function addItem(int $userId, int $productId): array
    {
        $product = $this->productModel->find($productId);
        if (!$product || !$product['is_active']) {
            throw new \RuntimeException('محصول یافت نشد.', 404);
        }

        $wishlist = $this->wishlistModel->getOrCreateForUser($userId);
        $already  = $this->itemModel->findByWishlistAndProduct((int) $wishlist['id'], $productId) !== null;

        if (!$already) {
            try {
                $this->itemModel->addProduct((int) $wishlist['id'], $productId);
            } catch (\Exception) {
                // درخواست موازی همان محصول را زودتر اضافه کرده (unique key) — idempotent
                if (!$this->itemModel->findByWishlistAndProduct((int) $wishlist['id'], $productId)) {
                    throw new \RuntimeException('خطا در افزودن محصول به ویش‌لیست.', 500);
                }
            }
        }

        return [
            'already_existed' => $already,
            'wishlist'        => $this->getWishlist($userId),
        ];
    }

    public function removeItem(int $userId, int $productId): array
    {
        $wishlist = $this->wishlistModel->findByUserId($userId);
        if (!$wishlist) {
            throw new \RuntimeException('ویش‌لیست یافت نشد.', 404);
        }

        $item = $this->itemModel->findByWishlistAndProduct((int) $wishlist['id'], $productId);
        if (!$item) {
            throw new \RuntimeException('این محصول در ویش‌لیست شما نیست.', 404);
        }

        $this->itemModel->removeProduct((int) $wishlist['id'], $productId);

        return $this->getWishlist($userId);
    }

    public function clearWishlist(int $userId): void
    {
        $wishlist = $this->wishlistModel->findByUserId($userId);
        if ($wishlist) {
            $this->wishlistModel->clearItems((int) $wishlist['id']);
        }
    }

    /**
     * انتقال محصول به سبد خرید:
     * ۱) اول به سبد اضافه می‌شود (اعتبارسنجی محصول/واریانت/موجودی داخل سرویس سبد انجام می‌شود)
     * ۲) در صورت موفقیت، از ویش‌لیست حذف می‌شود
     *
     * نکته: برای محصولات variable ارسال variant_id الزامی است
     * (در غیر این صورت CartService خطای ۴۲۲ می‌دهد و آیتم در ویش‌لیست باقی می‌ماند).
     */
    public function moveToCart(int $userId, int $productId, ?int $variantId = null): array
    {
        $wishlist = $this->wishlistModel->findByUserId($userId);
        if (!$wishlist || !$this->itemModel->findByWishlistAndProduct((int) $wishlist['id'], $productId)) {
            throw new \RuntimeException('این محصول در ویش‌لیست شما نیست.', 404);
        }

        $cart = $this->cartService->addItem($userId, $productId, 1, $variantId);

        $this->itemModel->removeProduct((int) $wishlist['id'], $productId);

        return [
            'cart'     => $cart,
            'wishlist' => $this->getWishlist($userId),
        ];
    }

    /**
     * ادغام ویش‌لیست مهمان (localStorage فرانت) با ویش‌لیست سروری بعد از لاگین.
     * ورودی: آرایه‌ای از product_id (عدد) یا آرایه‌ای از آیتم‌های دارای product_id.
     * آیتم‌های نامعتبر/تکراری بدون خطا نادیده گرفته می‌شوند.
     */
    public function mergeGuestItems(int $userId, array $items): array
    {
        $added   = 0;
        $skipped = 0;

        foreach ($items as $item) {
            $productId = is_array($item)
                ? (int) ($item['product_id'] ?? 0)
                : (int) $item;

            if (!$productId) {
                $skipped++;
                continue;
            }

            try {
                $result = $this->addItem($userId, $productId);
                $result['already_existed'] ? $skipped++ : $added++;
            } catch (\RuntimeException) {
                $skipped++;
            }
        }

        return [
            'wishlist' => $this->getWishlist($userId),
            'added'    => $added,
            'skipped'  => $skipped,
        ];
    }

    /**
     * بررسی عضویت یک محصول در ویش‌لیست کاربر — برای وضعیت «قلب» صفحه محصول.
     */
    public function inWishlist(int $userId, int $productId): bool
    {
        $wishlist = $this->wishlistModel->findByUserId($userId);
        if (!$wishlist) {
            return false;
        }

        return $this->itemModel->findByWishlistAndProduct((int) $wishlist['id'], $productId) !== null;
    }

    private function emptyWishlist(): array
    {
        return ['id' => null, 'items' => [], 'count' => 0];
    }
}
