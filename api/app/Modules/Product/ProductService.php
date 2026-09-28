<?php

namespace App\Modules\Product;

use App\Modules\Attribute\AttributeTypeModel;
use App\Modules\Variant\VariantService;
use App\Modules\Category\CategoryModel;
use App\Core\Database\Database;
use App\Utils\SlugHelper;

class ProductService
{
    public function __construct(
        private ProductModel      $productModel,
        private ProductImageModel $imageModel,
        private VariantService    $variantService,
        private AttributeTypeModel $attributeTypeModel,
    ) {}

    // ─── Public Listing ─────────────────────────────────────────

    public function list(array $filters = []): array
    {
        $filters = $this->normalizeFilters($filters);
        return $this->productModel->paginateWithFilters($filters);
    }

    public function adminList(array $filters = []): array
    {
        return $this->productModel->paginateAdmin($filters);
    }

    public function bulkUpdatePricesByCategory(array $data): array
    {
        $categoryId = filter_var($data['category_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$categoryId || $categoryId < 1) {
            throw new \RuntimeException('دسته‌بندی معتبر انتخاب کنید.', 422);
        }

        if (!(new CategoryModel())->find($categoryId)) {
            throw new \RuntimeException('دسته‌بندی یافت نشد.', 404);
        }

        $operation = $data['operation'] ?? '';
        $operations = ['percent_increase', 'percent_decrease', 'fixed_increase', 'fixed_decrease', 'set'];
        if (!in_array($operation, $operations, true)) {
            throw new \RuntimeException('نوع تغییر قیمت معتبر نیست.', 422);
        }

        $field = $data['field'] ?? 'price';
        if (!in_array($field, ['price', 'sale_price', 'both'], true)) {
            throw new \RuntimeException('نوع قیمت انتخاب‌شده معتبر نیست.', 422);
        }

        $rawValue = $data['value'] ?? null;
        if (!is_numeric($rawValue) || !is_finite((float) $rawValue) || (float) $rawValue < 0) {
            throw new \RuntimeException('مقدار قیمت باید عددی و غیرمنفی باشد.', 422);
        }
        $value = (float) $rawValue;
        if ($operation !== 'set' && $value <= 0) {
            throw new \RuntimeException('مقدار تغییر باید بیشتر از صفر باشد.', 422);
        }
        if (str_starts_with($operation, 'percent_') && ($value <= 0 || $value > ($operation === 'percent_decrease' ? 100 : 1000))) {
            throw new \RuntimeException($operation === 'percent_decrease'
                ? 'درصد کاهش باید بیشتر از صفر و حداکثر ۱۰۰ باشد.'
                : 'درصد افزایش باید بیشتر از صفر و حداکثر ۱۰۰۰ باشد.', 422);
        }
        if (in_array($operation, ['fixed_increase', 'fixed_decrease', 'set'], true) && floor($value) !== $value) {
            throw new \RuntimeException('مبلغ باید به تومان صحیح وارد شود.', 422);
        }

        $includeVariants = filter_var($data['include_variants'] ?? true, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($includeVariants === null) {
            throw new \RuntimeException('تنظیم واریانت‌ها معتبر نیست.', 422);
        }

        $fields = $field === 'both' ? ['price', 'sale_price'] : [$field];
        $pdo = Database::getInstance()->getConnection();

        $pdo->beginTransaction();
        try {
            $count = $pdo->prepare('SELECT COUNT(*) FROM products WHERE category_id = ?');
            $count->execute([$categoryId]);
            $productCount = (int) $count->fetchColumn();

            $variantCount = 0;
            if ($includeVariants) {
                $variantCountSql = "SELECT COUNT(*) FROM product_variants pv JOIN products p ON p.id = pv.product_id WHERE p.category_id = ?";
                $variantStmt = $pdo->prepare($variantCountSql);
                $variantStmt->execute([$categoryId]);
                $variantCount = (int) $variantStmt->fetchColumn();
            }

            if ($operation === 'fixed_decrease') {
                foreach ($fields as $column) {
                    $nullableCondition = $column === 'sale_price' ? " AND `{$column}` IS NOT NULL" : '';
                    $productCheck = $pdo->prepare("SELECT 1 FROM products WHERE category_id = ? AND `{$column}` < ?{$nullableCondition} LIMIT 1");
                    $productCheck->execute([$categoryId, $value]);
                    if ($productCheck->fetchColumn()) {
                        throw new \RuntimeException('کاهش قیمت باعث منفی شدن قیمت یکی از محصولات می‌شود.', 422);
                    }

                    if ($includeVariants) {
                        $variantNullCondition = $column === 'sale_price' ? ' AND pv.`sale_price` IS NOT NULL' : '';
                        $variantCheck = $pdo->prepare("SELECT 1 FROM product_variants pv JOIN products p ON p.id = pv.product_id WHERE p.category_id = ? AND pv.`{$column}` < ?{$variantNullCondition} LIMIT 1");
                        $variantCheck->execute([$categoryId, $value]);
                        if ($variantCheck->fetchColumn()) {
                            throw new \RuntimeException('کاهش قیمت باعث منفی شدن قیمت یکی از واریانت‌ها می‌شود.', 422);
                        }
                    }
                }
            }

            $setParts = [];
            $params = [];
            foreach ($fields as $column) {
                $expression = $this->priceExpression("`{$column}`", $operation);
                $setParts[] = "`{$column}` = {$expression}";
                if ($operation === 'set') {
                    $params[] = (int) round($value);
                } else {
                    $params[] = $value;
                }
            }
            $params[] = $categoryId;
            $updateProducts = $pdo->prepare('UPDATE products SET ' . implode(', ', $setParts) . ', updated_at = CURRENT_TIMESTAMP WHERE category_id = ?');
            $updateProducts->execute($params);

            if ($includeVariants) {
                $variantSetParts = [];
                $variantParams = [];
                foreach ($fields as $column) {
                    $expression = $this->priceExpression("pv.`{$column}`", $operation);
                    $variantSetParts[] = "pv.`{$column}` = {$expression}";
                    if ($operation === 'set') {
                        $variantParams[] = (int) round($value);
                    } else {
                        $variantParams[] = $value;
                    }
                }
                $variantParams[] = $categoryId;
                $updateVariants = $pdo->prepare(
                    'UPDATE product_variants pv JOIN products p ON p.id = pv.product_id SET '
                    . implode(', ', $variantSetParts) . ', pv.updated_at = CURRENT_TIMESTAMP'
                    . ' WHERE p.category_id = ?',
                );
                $updateVariants->execute($variantParams);
            }

            $pdo->commit();
            return [
                'updated_products' => $productCount,
                'updated_variants' => $includeVariants ? $variantCount : 0,
                'category_id' => $categoryId,
            ];
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    private function priceExpression(string $column, string $operation): string
    {
        return match ($operation) {
            'percent_increase' => "ROUND({$column} * (1 + ? / 100), 0)",
            'percent_decrease' => "ROUND({$column} * (1 - ? / 100), 0)",
            'fixed_increase' => "{$column} + ?",
            'fixed_decrease' => "{$column} - ?",
            'set' => '?',
        };
    }

    public function getFeatured(int $limit = 8): array
    {
        return $this->productModel->getFeatured($limit);
    }

    public function getById(int $id): array
    {
        $product = $this->productModel->find($id);
        if (!$product) {
            throw new \RuntimeException('محصول یافت نشد.', 404);
        }

        return $this->enrichProduct($product);
    }

    // ─── Admin CRUD ─────────────────────────────────────────────

    public function create(array $data): array
    {
        $this->validateProductData($data);

        $slug = $this->resolveSlug($data['name'], $data['slug'] ?? null);
        $status = $data['status'] ?? 'active';
        $isActive = $status === 'active' ? 1 : 0;

        $id = $this->productModel->create([
            'name'                => trim($data['name']),
            'slug'                => $slug,
            'description'         => trim($data['description'] ?? $data['full_description'] ?? ''),
            'short_description'   => trim($data['short_description'] ?? ''),
            'price'               => (int) $data['price'],
            'sale_price'          => isset($data['sale_price']) ? (int) $data['sale_price'] : null,
            'category_id'         => (int) ($data['category_id'] ?? 0) ?: null,
            'stock'               => (int) ($data['stock'] ?? 0),
            'low_stock_threshold' => (int) ($data['low_stock_threshold'] ?? 5),
            'featured'            => (int) ($data['featured'] ?? 0),
            'is_active'           => $isActive,
            'status'              => $status,
            'product_type'        => $data['product_type'] ?? 'simple',
        ]);

        $this->variantService->createDefaultVariant($id, $data);

        $this->assertVariableProductReady($id, $data, [
            'product_type' => $data['product_type'] ?? 'simple',
            'status'       => $status,
        ]);

        return $this->getById($id);
    }

    public function update(int $id, array $data): array
    {
        $product = $this->productModel->find($id);
        if (!$product) {
            throw new \RuntimeException('محصول یافت نشد.', 404);
        }

        $payload = [];

        if (isset($data['name'])) {
            $payload['name'] = trim($data['name']);
        }
        if (isset($data['slug'])) {
            $payload['slug'] = $this->resolveSlug($data['name'] ?? $product['name'], $data['slug'], $id);
        } elseif (isset($data['name']) && empty($product['slug'])) {
            $payload['slug'] = $this->resolveSlug($data['name'], null, $id);
        }
        if (isset($data['description']) || isset($data['full_description'])) {
            $payload['description'] = trim($data['description'] ?? $data['full_description'] ?? '');
        }
        if (isset($data['short_description'])) {
            $payload['short_description'] = trim($data['short_description']);
        }
        if (isset($data['price'])) {
            if ((int) $data['price'] < 0) {
                throw new \RuntimeException('قیمت نمی‌تواند منفی باشد.', 422);
            }
            $payload['price'] = (int) $data['price'];
        }
        if (isset($data['sale_price'])) {
            $payload['sale_price'] = $data['sale_price'] !== '' && $data['sale_price'] !== null
                ? (int) $data['sale_price'] : null;
        }
        if (isset($data['stock'])) {
            if ((int) $data['stock'] < 0) {
                throw new \RuntimeException('موجودی نمی‌تواند منفی باشد.', 422);
            }
            $payload['stock'] = (int) $data['stock'];
        }
        if (isset($data['status'])) {
            $payload['status']    = $data['status'];
            $payload['is_active'] = $data['status'] === 'active' ? 1 : 0;
        }
        if (isset($data['product_type'])) {
            $payload['product_type'] = $data['product_type'];
        }
        if (isset($data['low_stock_threshold'])) {
            $payload['low_stock_threshold'] = (int) $data['low_stock_threshold'];
        }

        $simpleFields = ['category_id', 'featured', 'is_active'];
        foreach ($simpleFields as $field) {
            if (isset($data[$field])) {
                $payload[$field] = $data[$field];
            }
        }

        if (!empty($payload)) {
            $this->productModel->update($id, $payload);
        }

        if (isset($data['price']) || isset($data['stock']) || isset($data['sale_price'])) {
            $default = $this->variantService->getDefaultVariant($id);
            if ($default) {
                $variantPayload = [];
                if (isset($data['price'])) {
                    $variantPayload['price'] = (int) $data['price'];
                }
                if (isset($data['sale_price'])) {
                    $variantPayload['sale_price'] = $data['sale_price'] !== '' && $data['sale_price'] !== null
                        ? (int) $data['sale_price'] : null;
                }
                if (isset($data['stock'])) {
                    $variantPayload['quantity'] = (int) $data['stock'];
                }
                if (!empty($variantPayload)) {
                    $this->variantService->updateVariant((int) $default['id'], $variantPayload);
                }
            }
        }

        if (empty($payload) && !isset($data['price']) && !isset($data['stock']) && !isset($data['sale_price'])) {
            throw new \RuntimeException('هیچ فیلدی برای بروزرسانی ارسال نشد.', 422);
        }

        $this->assertVariableProductReady($id, $data, $product);

        return $this->getById($id);
    }

    public function delete(int $id): void
    {
        $product = $this->productModel->find($id);
        if (!$product) {
            throw new \RuntimeException('محصول یافت نشد.', 404);
        }

        $this->imageModel->deleteAllForProduct($id);
        $this->productModel->delete($id);
    }

    public function toggleActive(int $id): array
    {
        $product = $this->productModel->find($id);
        if (!$product) {
            throw new \RuntimeException('محصول یافت نشد.', 404);
        }

        $newStatus = ($product['status'] ?? 'active') === 'active' ? 'archived' : 'active';
        $this->productModel->update($id, [
            'status'    => $newStatus,
            'is_active' => $newStatus === 'active' ? 1 : 0,
        ]);

        return $this->getById($id);
    }

    // ─── Image Management ────────────────────────────────────────

    public function addImage(int $productId, array $imageData): array
    {
        $this->productModel->find($productId) or throw new \RuntimeException('محصول یافت نشد.', 404);

        if (empty($imageData['image_url'])) {
            throw new \RuntimeException('آدرس تصویر الزامی است.', 422);
        }

        $existing = $this->imageModel->getByProductId($productId);
        $isMain   = empty($existing) ? 1 : (int) ($imageData['is_main'] ?? 0);

        if ($isMain) {
            $this->imageModel->unsetMain($productId);
        }

        $id = $this->imageModel->create([
            'product_id' => $productId,
            'image_url'  => trim($imageData['image_url']),
            'alt_text'   => trim($imageData['alt_text'] ?? ''),
            'is_main'    => $isMain,
            'sort_order' => (int) ($imageData['sort_order'] ?? count($existing)),
        ]);

        return $this->imageModel->find($id);
    }

    public function setMainImage(int $productId, int $imageId): void
    {
        $this->productModel->find($productId) or throw new \RuntimeException('محصول یافت نشد.', 404);
        $this->imageModel->setMain($imageId, $productId);
    }

    public function deleteImage(int $productId, int $imageId): void
    {
        $this->productModel->find($productId) or throw new \RuntimeException('محصول یافت نشد.', 404);

        $image = $this->imageModel->find($imageId);
        if (!$image || $image['product_id'] !== $productId) {
            throw new \RuntimeException('تصویر یافت نشد.', 404);
        }

        $this->imageModel->delete($imageId);

        if ($image['is_main']) {
            $remaining = $this->imageModel->getByProductId($productId);
            if (!empty($remaining)) {
                $this->imageModel->setMain($remaining[0]['id'], $productId);
            }
        }
    }

    // ─── Stock (delegates to variant layer) ──────────────────────

    public function decrementStock(int $productId, int $qty, ?int $variantId = null): void
    {
        $resolvedId = $this->variantService->resolveVariantId($productId, $variantId);
        $this->variantService->decrementStock($resolvedId, $qty);
    }

    public function incrementStock(int $productId, int $qty, ?int $variantId = null): void
    {
        $resolvedId = $this->variantService->resolveVariantId($productId, $variantId);
        $this->variantService->incrementStock($resolvedId, $qty);
    }

    // ─── Helpers ────────────────────────────────────────────────

    private function enrichProduct(array $product): array
    {
        $id = (int) $product['id'];

        $product['images']      = $this->imageModel->getByProductId($id);
        $product['options']     = $this->productModel->getOptions($id);
        $product['attributes']  = $this->productModel->getDescriptiveAttributes($id);
        $product['variants']    = $this->variantService->getProductVariants($id);

        $default = $this->variantService->getDefaultVariant($id);
        if ($default) {
            $product['default_variant_id'] = (int) $default['id'];
            $product['price']  = $this->variantService->getEffectivePrice($default, $product);
            $product['stock']  = (int) ($default['inventory']['quantity'] ?? 0);
        }

        $product['variant_count'] = count($product['variants']);
        $product['variant_axes']  = $this->buildVariantAxes($product['variants']);
        $product['variant_setup_incomplete'] = $this->isVariantSetupIncomplete(
            $product['product_type'] ?? 'simple',
            $product['variants'],
            $product['variant_axes'],
        );

        if (($product['product_type'] ?? 'simple') === 'variable' && count($product['variants']) > 1) {
            $prices = array_map(fn($v) => $this->variantService->getEffectivePrice($v, $product), $product['variants']);
            $product['price_min'] = min($prices);
            $product['price_max'] = max($prices);
        }

        return $product;
    }

    private function buildVariantAxes(array $variants): array
    {
        $axes = [];
        foreach ($variants as $variant) {
            foreach ($variant['attribute_values'] ?? [] as $av) {
                $slug = $av['type_slug'];
                if (!isset($axes[$slug])) {
                    $axes[$slug] = [
                        'type_id'    => (int) $av['attribute_type_id'],
                        'type_name'  => $av['type_name'],
                        'type_slug'  => $slug,
                        'input_type' => $av['input_type'],
                        'values'     => [],
                    ];
                }
                $axes[$slug]['values'][$av['id']] = [
                    'id'         => (int) $av['id'],
                    'value'      => $av['value'],
                    'slug'       => $av['slug'],
                    'swatch_hex' => $av['swatch_hex'] ?? null,
                ];
            }
        }

        foreach ($axes as &$axis) {
            $axis['values'] = array_values($axis['values']);
        }

        return array_values($axes);
    }

    private function isVariantSetupIncomplete(string $productType, array $variants, array $variantAxes): bool
    {
        if ($productType !== 'variable') {
            return false;
        }

        if (empty($variantAxes)) {
            return true;
        }

        foreach ($variants as $variant) {
            if (!empty($variant['attribute_values'])) {
                return false;
            }
        }

        return true;
    }

    private function assertVariableProductReady(int $productId, array $data, array $existing): void
    {
        $finalType   = $data['product_type'] ?? $existing['product_type'] ?? 'simple';
        $finalStatus = $data['status'] ?? $existing['status'] ?? 'active';

        if ($finalType !== 'variable' || $finalStatus !== 'active') {
            return;
        }

        $variants = $this->variantService->getProductVariants($productId);
        $axes     = $this->buildVariantAxes($variants);

        if ($this->isVariantSetupIncomplete('variable', $variants, $axes)) {
            throw new \RuntimeException(
                'محصول چند واریانتی فعال باید واریانت‌های سایز/رنگ تولید‌شده داشته باشد. از تب واریانت‌ها، محورها را انتخاب و «تولید واریانت‌ها» را بزنید.',
                422,
            );
        }
    }

    private function resolveSlug(string $name, ?string $slug = null, ?int $excludeId = null): string
    {
        $base = $slug ? SlugHelper::make($slug) : SlugHelper::make($name);
        return SlugHelper::unique($base, fn($s) => $this->productModel->slugExists($s, $excludeId));
    }

    private function validateProductData(array $data): void
    {
        if (empty($data['name'])) {
            throw new \RuntimeException('نام محصول الزامی است.', 422);
        }
        if (!isset($data['price']) || (int) $data['price'] < 0) {
            throw new \RuntimeException('قیمت معتبر الزامی است.', 422);
        }
    }

    private function normalizeFilters(array $filters): array
    {
        return array_merge([
            'page'        => 1,
            'limit'       => 12,
            'sort'        => 'newest',
            'category_id' => null,
            'featured'    => null,
            'q'           => null,
        ], $filters);
    }
}
