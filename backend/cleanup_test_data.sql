-- ========================================
-- تنظيف بيانات التجربة قبل الرفع على GitHub

-- حذف الإشعارات
DELETE FROM "Notifications";

-- حذف الطلبات (orders)
DELETE FROM "Orders";

-- حذف التقييمات
DELETE FROM "Reviews";

-- حذف طلبات الخدمات (requests)
DELETE FROM "Requests";

-- حذف الاجتماعات
DELETE FROM "Meetings";

-- حذف المفضلة
DELETE FROM "Favorites";

-- حذف أعمال الشركة
DELETE FROM "PortfolioItems";

-- حذف المنتجات
DELETE FROM "Products";

-- حذف المذكرات
DELETE FROM "Notes";

-- حذف مراحل المشاريع وتحديثاتها (جزء من Projects JSON)
DELETE FROM "Projects";

-- حذف الشركات
DELETE FROM "Companies";

-- حذف المستخدمين (احذف السطر التالي إذا تبي تحتفظ بالأدمن)
DELETE FROM "Users";

-- إعادة تسلسل الـ IDs (اختياري)
ALTER SEQUENCE "Notifications_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Orders_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Reviews_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Requests_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Meetings_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Favorites_id_seq" RESTART WITH 1;
ALTER SEQUENCE "PortfolioItems_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Products_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Notes_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Projects_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Companies_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Users_id_seq" RESTART WITH 1;
