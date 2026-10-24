-- ============================================================
-- Migration: ساخت جدول‌های ویش‌لیست
-- جدول‌ها: wishlists , wishlist_items
-- موتور: InnoDB | charset: utf8mb4 (هماهنگ با Database.php)
--
-- اجرا: این فایل را روی دیتابیس فروشگاه import کنید
-- (phpMyAdmin > Import یا: mysql -u USER -p DB_NAME < create_wishlist_tables.sql)
--
-- ⚠ نکته: اگر نوع ستون id در جدول‌های users یا products با
-- INT UNSIGNED تفاوت دارد (مثلاً BIGINT)، نوع ستون‌های user_id و
-- product_id را دقیقاً هماهنگ کنید؛ در غیر این صورت خطای
-- "Foreign key constraint incorrectly formed" می‌گیرید.
-- ============================================================

CREATE TABLE IF NOT EXISTS wishlists (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_wishlists_user_id (user_id),
    CONSTRAINT fk_wishlists_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wishlist_items (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    wishlist_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_wishlist_items_wishlist_product (wishlist_id, product_id),
    KEY idx_wishlist_items_product_id (product_id),
    CONSTRAINT fk_wishlist_items_wishlist
        FOREIGN KEY (wishlist_id) REFERENCES wishlists (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_items_product
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
