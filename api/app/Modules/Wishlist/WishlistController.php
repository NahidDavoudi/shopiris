<?php

namespace App\Modules\Wishlist;

use App\Core\Controller;
use App\Core\Http\Request;
use App\Modules\Product\ProductModel;
use App\Modules\Cart\CartModel;
use App\Modules\Cart\CartItemModel;
use App\Modules\Cart\CartService;
use App\Modules\Discount\DiscountModel;
use App\Modules\Variant\VariantService;
use App\Modules\Variant\ProductVariantModel;
use App\Modules\Variant\InventoryModel;
use App\Modules\Attribute\AttributeValueModel;

class WishlistController extends Controller
{
    private WishlistService $service;

    public function __construct()
    {
        $this->service = new WishlistService(
            new WishlistModel(),
            new WishlistItemModel(),
            new ProductModel(),
            new CartService(
                new CartModel(),
                new CartItemModel(),
                new ProductModel(),
                new DiscountModel(),
                new VariantService(
                    new ProductVariantModel(),
                    new InventoryModel(),
                    new ProductModel(),
                    new AttributeValueModel(),
                ),
                new InventoryModel(),
            ),
        );
    }

    private function requireAuth(): void
    {
        if (!$this->isAuthenticated()) {
            $this->unauthorized();
        }
    }

    // GET /api/v1/wishlist
    public function index(): void
    {
        $this->requireAuth();
        $this->success($this->service->getWishlist($this->userId()));
    }

    // GET /api/v1/wishlist/check/{productId}
    public function check(Request $request, int $productId = 0): void
    {
        $this->requireAuth();

        $productId = $productId ?: (int) ($request->query('product_id') ?: $request->input('product_id'));
        if (!$productId) {
            $this->error('product_id الزامی است', 422);
        }

        $this->success([
            'in_wishlist' => $this->service->inWishlist($this->userId(), $productId),
        ]);
    }

    // POST /api/v1/wishlist  { product_id }
    public function add(Request $request): void
    {
        $this->requireAuth();

        $productId = (int) $request->input('product_id');
        if (!$productId) {
            $this->error('product_id الزامی است', 422);
        }

        try {
            $result  = $this->service->addItem($this->userId(), $productId);
            $message = $result['already_existed']
                ? 'این محصول قبلاً در ویش‌لیست شما ذخیره شده است'
                : 'محصول به ویش‌لیست اضافه شد';
            $this->success($result['wishlist'], $message);
        } catch (\RuntimeException $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    // DELETE /api/v1/wishlist/items/{productId}
    public function remove(Request $request, int $productId = 0): void
    {
        $this->requireAuth();

        $productId = $productId ?: (int) ($request->query('product_id') ?: $request->input('product_id'));
        if (!$productId) {
            $this->error('product_id الزامی است', 422);
        }

        try {
            $wishlist = $this->service->removeItem($this->userId(), $productId);
            $this->success($wishlist, 'محصول از ویش‌لیست حذف شد');
        } catch (\RuntimeException $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    // POST /api/v1/wishlist/items/{productId}/move-to-cart  { variant_id? }
    public function moveToCart(Request $request, int $productId = 0): void
    {
        $this->requireAuth();

        $productId = $productId ?: (int) ($request->input('product_id') ?: $request->query('product_id'));
        $variantId = (int) ($request->input('variant_id') ?: $request->query('variant_id')) ?: null;

        if (!$productId) {
            $this->error('product_id الزامی است', 422);
        }

        try {
            $result = $this->service->moveToCart($this->userId(), $productId, $variantId);
            $this->success($result, 'محصول به سبد خرید منتقل شد');
        } catch (\RuntimeException $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    // DELETE /api/v1/wishlist
    public function clear(): void
    {
        $this->requireAuth();

        try {
            $this->service->clearWishlist($this->userId());
            $this->success(null, 'ویش‌لیست خالی شد');
        } catch (\RuntimeException $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    // POST /api/v1/wishlist/merge  { items: [7, 12, 33] }
    public function merge(Request $request): void
    {
        $this->requireAuth();

        $items = $request->input('items', []);
        if (!is_array($items)) {
            $this->error('فرمت آیتم‌های ویش‌لیست نامعتبر است', 422);
        }

        try {
            $result = $this->service->mergeGuestItems($this->userId(), $items);
            $this->success($result, 'ویش‌لیست ادغام شد');
        } catch (\RuntimeException $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}
