Loja Shop — فروشگاه اینترنتی
فروشگاه اینترنتی کامل با React + Vite + Redux Toolkit، دوزبانه (فارسی/انگلیسی)، تم روشن/تیره، سبک دیجی‌کالا و بک‌اند Supabase.

ویژگی‌ها
بیش از ۱۰۰ محصول در ۳ دسته با گالری تصویر، تخفیف و قیمت
صفحه اصلی شبیه دیجی‌کالا: اسلایدر، پیشنهاد شگفت‌انگیز، دایره‌های دسته‌بندی، ردیف اسکرولی هر دسته
جستجو، فیلتر (دسته، قیمت، امتیاز) و مرتب‌سازی
سبد خرید با Redux و صفحه جزئیات محصول با تب‌ها و نظرات
ثبت‌نام و ورود با اعتبارسنجی (اتصال به Supabase Auth)
داشبورد: سفارش‌ها، درآمد و مدیریت محصولات
چت زنده (Realtime) و درگاه پرداخت زرین‌پال (Edge Function)
دوزبانه با RTL/LTR و تم روشن/تیره




راه‌اندازی
npm install
npm run dev



سایت روی http://localhost:5173 اجرا می‌شود.

ورود ادمین دمو: admin@shop.com / admin123



اتصال به Supabase
 در سایت supabase.comیک پروژه بسازید.
محتوای supabase/schema.sql را در SQL Editor اجرا کنید (جداول و ۱۰۰ محصول ساخته می‌شود).
فایل .env کنار package.json بسازید:
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
سرور را ری‌استارت کنید (Ctrl+C و سپس npm run dev).




درگاه پرداخت (اختیاری)
npm i -g supabase
supabase login
supabase link --project-ref=xxxx
supabase functions deploy zarinpal
supabase secrets set ZARINPAL_MERCHANT_ID=کد-مرچنت-شما
مرچنت کد را از zarinpal.com بگیرید. هرگز کلید یا مرچنت را در کد ننویسید؛ فقط در .env یا Secrets.

ساختار پروژه
lojashop/
├── src/
│   ├── components/   ← Header, Footer, ProductCard, FilterBar, LiveChat, ...
│   ├── pages/        ← Home, ProductDetails, Cart, Login, Register, Dashboard, ...
│   ├── store/        ← Redux: cartSlice, userSlice, productsSlice, filtersSlice, ...
│   ├── data/         ← داده دمو (وقتی دیتابیس در دسترس نیست)
│   ├── hooks/        ← useT و هوک‌های مشترک
│   └── styles/       ← فایل‌های CSS
├── supabase/
│   ├── schema.sql    ← جداول، RLS و ۱۰۰ محصول
│   └── functions/zarinpal/index.ts
├── .env              ← متغیرهای محیطی (در گیت پوشیده می‌ماند)
└── README.md



اسکریپت‌ها
دستور	کار


npm run dev	اجرای محیط توسعه
npm run build	ساخت نسخه نهایی در پوشه dist
npm run preview	پیش‌نمایش نسخه نهایی


درضمن این پروژه صرفا برای نمونه کار وآن کسانی که نیاز به پروژه تمرینی دارند طراحی  شده است وتمام عکس ها و متن غیر واقعی و فیک هستند.