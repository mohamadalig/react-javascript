-- ============================================================
--  وصلهٔ دسترسی‌های داشبورد ادمین
--  کل محتوا را در SQL Editor اجرا کنید (اجرای مجدد بی‌ضرر است)
-- ============================================================

-- ۱) تابع امن ادمین: security definer یعنی داخل خودش RLS نادیده گرفته
--    می‌شود و دیگر خطای infinite recursion رخ نمی‌دهد
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- ۲) پروفایل‌ها: هر کس پروفایل خودش را می‌بیند، ادمین همه را
--    (این اجرا policy قبلی بازگشتی/باز را هم درست می‌کند)
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ۳) حذف نظر توسط ادمین (برای تب نظرات داشبورد)
drop policy if exists "reviews_admin_delete" on public.reviews;
create policy "reviews_admin_delete" on public.reviews for delete
  using (public.is_admin());

-- ۴) ساده‌سازی policyهای قبلی که sub-query روی profiles داشتند
--    (با is_admin دیگر ریسک بازگشتی ندارند)
drop policy if exists "products_admin" on public.products;
create policy "products_admin" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders for update
  using (public.is_admin());

drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "messages_admin_insert" on public.messages;
create policy "messages_admin_insert" on public.messages for insert
  with check (sender = 'admin' and public.is_admin());