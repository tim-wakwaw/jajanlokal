# JajanLokal - Platform UMKM Makanan & Kerajinan Lokal

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-blue?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)

Platform e-commerce modern untuk menemukan dan berbisnis dengan UMKM makanan dan kerajinan lokal di Kota Malang. Dengan fitur peta interaktif, sistem rekomendasi cerdas, dan integrasi pembayaran lengkap.

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Struktur Project](#struktur-project)
- [Instalasi & Setup](#instalasi--setup)
- [Konfigurasi Lingkungan](#konfigurasi-lingkungan)
- [Database Setup](#database-setup)
- [Panduan Penggunaan](#panduan-penggunaan)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Kontribusi](#kontribusi)

## Fitur Utama

### Peta Interaktif UMKM
- **Peta Leaflet Real-time** dengan marker per kategori (Kuliner, Fashion, Kerajinan, Kesehatan, Retail)
- **Filter Dinamis** berdasarkan kategori dan pencarian nama
- **Lokasi Pengguna** dengan geolocation API
- **Detail Popup** dengan informasi lengkap UMKM
- **Sidebar UMKM** yang dapat di-resize untuk mobile dan desktop

### Sistem E-Commerce Lengkap
- **Katalog Produk** dengan gambar berkualitas tinggi dari Cloudinary
- **Keranjang Belanja** dengan sync real-time ke database
- **Sistem Checkout** dan pembayaran terintegrasi
- **Order Management** untuk admin dan pelanggan
- **Product Rating & Review** dengan testimoni pelanggan

### Integrasi Pembayaran
- **Xendit Integration** untuk kartu kredit dan e-wallet lebih banyak pilihan metode pembayaran
- **Status Tracking** pembayaran real-time
- **Invoice Management** untuk setiap transaksi

### Sistem Rekomendasi Cerdas
- **Smart Search** menggunakan Fuse.js untuk pencarian fuzzy
- **Rekomendasi Produk** berdasarkan kategori dan rating
- **Similar UMKM** berdasarkan kesamaan kategori
- **Trending Products** berdasarkan penjualan
- **Personalized Recommendations** berdasarkan user behavior

### Sistem Autentikasi & Profil
- **Supabase Auth** dengan Google & email/password
- **Role-Based Access** (Admin, Seller, Customer)
- **Profil Pengguna** dengan avatar dan pengaturan
- **Wishlist & Riwayat** pembelian
- **Address Management** untuk pengiriman

### Dashboard Admin
- **Analytics Dashboard** dengan chart penjualan real-time
- **Manajemen UMKM** (Create, Read, Update, Delete)
- **Manajemen Produk** dengan upload gambar
- **Order Management** dan status update
- **FAQ Management** untuk customer support
- **Blog Management** untuk konten marketing
- **User Management** dan role assignment
- **Request Management** untuk UMKM baru

### Komunitas & Review
- **Review & Rating** untuk produk dan UMKM
- **Sistem Komentar** dari umkmData.json
- **FAQ Interaktif** dengan search dan kategori
- **Blog Posts** dengan berbagai kategori dan tags
- **Testimoni Pelanggan** di homepage dengan carousel
- **Avatar Generator** menggunakan dicebear.com

### UI/UX Modern
- **Dark Mode Support** dengan next-themes
- **Responsive Design** mobile-first approach
- **Smooth Animations** dengan Framer Motion
- **Loading States** dan skeleton screens
- **Error Handling** yang user-friendly
- **3D Card Effects** untuk detail UMKM
- **Floating Dock** navigation di mobile

## Teknologi

### Frontend
- **Next.js 16.0** - React framework dengan App Router
- **React 19.2** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4.0** - Utility-first CSS
- **Framer Motion** - Animation library
- **Leaflet & React Leaflet** - Interactive maps
- **Motion** - Advanced animations

### Backend & Database
- **Supabase** - PostgreSQL database & auth
- **Next.js API Routes** - Serverless functions
- **Realtime Subscriptions** - Real-time data sync

### Payment Integration
- **xendit** - Payment gateway Indonesia
- **Xendit** - Alternative payment provider
- **xendit Client** - SDK untuk integrasi

### Media & Storage
- **Cloudinary** - Image hosting & optimization
- **Supabase Storage** - File storage untuk documents
- **Next.js Image Optimization** - Image component

### UI Components & Icons
- **Tabler Icons** - Comprehensive icon library (3.35.0+)
- **Lucide React** - Additional icons
- **Heroicons** - Accessible icons
- **React Icons** - Various icon packs

### Utilities & Libraries
- **Fuse.js** - Fuzzy search (7.1.0)
- **Zod** - Schema validation (4.1.12)
- **React Hook Form** - Form management (7.66.0)
- **SweetAlert2** - Alerts & modals (11.26.3)
- **Recharts** - Data visualization (3.3.0)
- **GSAP** - Advanced animations (3.13.0)
- **Simplex Noise** - Procedural generation

## Struktur Project

```
jajanlokal/
├── src/
│   ├── app/                              # App Router (Next.js 13+)
│   │   ├── page.tsx                      # Homepage
│   │   ├── layout.tsx                    # Root layout
│   │   ├── globals.css                   # Global styles
│   │   ├── header.tsx                    # Header component
│   │   ├── LayoutContent.tsx             # Layout wrapper
│   │   │
│   │   ├── admin/                        # Admin panel
│   │   │   ├── layout.tsx                # Admin layout dengan sidebar
│   │   │   ├── dashboard/                # Dashboard analytics
│   │   │   ├── analytics/                # Analytics details
│   │   │   ├── orders/                   # Order management
│   │   │   ├── faq-management/           # FAQ CRUD
│   │   │   ├── blog-management/          # Blog CRUD
│   │   │   ├── umkm-requests/            # UMKM registration
│   │   │   └── umkm-product-requests/    # Product requests
│   │   │
│   │   ├── api/                          # API Routes
│   │   │   ├── checkout/                 # Checkout logic
│   │   │   ├── payment/                  # Payment processing
│   │   │   ├── products/                 # Product APIs
│   │   │   ├── recommendations/          # Recommendation APIs
│   │   │   └── umkm/                     # UMKM APIs
│   │   │
│   │   ├── auth/                         # Authentication
│   │   │   ├── login/                    # Login page
│   │   │   ├── register/                 # Register page
│   │   │   └── callback/                 # OAuth callback
│   │   │
│   │   ├── peta-umkm/                    # UMKM Map page
│   │   │   └── page.tsx                  # Interactive map dengan sidebar
│   │   │
│   │   ├── produk/                       # Products listing
│   │   ├── checkout/                     # Checkout page
│   │   ├── orders/                       # Order history
│   │   ├── payment/                      # Payment status
│   │   ├── blog/                         # Blog listing
│   │   ├── faq/                          # FAQ page
│   │   ├── about/                        # About page
│   │   ├── kontak/                       # Contact page
│   │   ├── request-umkm/                 # Register UMKM
│   │   ├── umkm/                         # UMKM profile
│   │   │
│   │   └── components/                   # Reusable components
│   │       ├── UMKMDetailCard.tsx        # UMKM detail modal (3D)
│   │       ├── UMKMDetailReview.tsx      # Review section
│   │       ├── UMKMDetailProduct.tsx     # Product listing
│   │       ├── UMKMDetailOverview.tsx    # Overview section
│   │       ├── UMKMSidebar.tsx           # Map sidebar
│   │       ├── MapPopupCard.tsx          # Map popup
│   │       ├── CartSidebar.tsx           # Shopping cart
│   │       ├── CartButton.tsx            # Cart button
│   │       ├── SearchBar.tsx             # Search component
│   │       ├── TestimonialSection.tsx    # Testimonials section
│   │       ├── TestimonialCarousel.tsx   # Testimonial carousel
│   │       ├── TestimonialCard.tsx       # Testimonial card
│   │       ├── ProductCard.tsx           # Product card
│   │       ├── EnhancedProductCard.tsx   # Enhanced card
│   │       ├── HeroSection.tsx           # Hero banner
│   │       ├── CategorySection.tsx       # Category listing
│   │       ├── AppleCarouselSection.tsx  # Apple-style carousel
│   │       ├── Footer.tsx                # Footer
│   │       ├── FloatingActionButton.tsx  # FAB
│   │       ├── LazyImage.tsx             # Lazy loading image
│   │       └── ui/                       # UI components
│   │           ├── 3d-card.tsx           # 3D card component
│   │           ├── floating-dock.tsx     # Floating dock
│   │           ├── Aurora.tsx            # Aurora effect
│   │           └── ...
│   │
│   ├── contexts/                         # React contexts
│   │   ├── AuthContext.tsx               # Auth state management
│   │   ├── OptimizedAuthContext.tsx      # Optimized auth context
│   │   └── CartContext.tsx               # Cart state management
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useMediaQuery.ts              # Responsive hook
│   │   └── useOutsideClick.ts            # Click outside hook
│   │
│   ├── lib/                              # Utility functions
│   │   ├── supabase.ts                   # Supabase client
│   │   ├── productService.ts             # Product service
│   │   ├── OptimizedProductService.ts    # Optimized service
│   │   ├── OptimizedApiService.ts        # API service
│   │   ├── recommendations.ts            # Recommendation engine
│   │   ├── smart-search.ts               # Search utility (Fuse.js)
│   │   ├── xendit.ts                     # Xendit integration
│   │   ├── sweetalert.ts                 # Alert helper
│   │   └── utils.ts                      # General utilities
│   │
│   ├── types/                            # TypeScript types
│   │   └── api.ts                        # API type definitions
│   │
│   └── providers/                        # Context providers
│       └── ...
│
├── public/                               # Static assets
│   ├── assets/                           # Images & icons
│   │   └── icons/                        # Leaflet marker icons
│   │       ├── pin-kuliner.gif
│   │       ├── pin-fashion.gif
│   │       ├── pin-kerajinan.gif
│   │       ├── pin-kesehatan.gif
│   │       ├── pin-retail.gif
│   │       ├── pin-posisi.gif
│   │       └── pin.png
│   └── data/                             # Static data
│       └── umkmData.json                 # UMKM data seed dengan comments
│
├── next.config.ts                        # Next.js config (image optimization, SVG support)
├── tailwind.config.ts                    # Tailwind CSS config
├── tsconfig.json                         # TypeScript config
├── eslint.config.mjs                     # ESLint config
├── postcss.config.mjs                    # PostCSS config
├── components.json                       # Component config
├── package.json                          # Dependencies
└── README.md                             # This file
```

## Instalasi & Setup

### Prerequisites
- Node.js 18+ dan npm/yarn
- Git
- Akun Supabase
- Akun Cloudinary (optional untuk image hosting)
- Akun xendit/Xendit (untuk payment)

### 1. Clone Repository

```bash
git clone https://github.com/tim-wakwaw/jajanlokal.git
cd jajanlokal
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary Configuration (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# xendit Configuration
NEXT_PUBLIC_xendit_CLIENT_KEY=Mid-client-xxxxxxxxxxxxx
xendit_SERVER_KEY=Mid-server-xxxxxxxxxxxxx

# Xendit Configuration (optional)
NEXT_PUBLIC_XENDIT_API_KEY=xnd_public_xxxxxxxxxxxxx
XENDIT_SECRET_KEY=xnd_xxx_xxxxxxxxxxxxx

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Database Setup

Lihat bagian [Database Setup](#database-setup) di bawah.

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build untuk Production

```bash
npm run build
npm start
```

## Konfigurasi Lingkungan

### Supabase Setup

1. **Buat Project Supabase**
   - Login ke [supabase.com](https://supabase.com)
   - Create new project
   - Copy `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Tunggu database selesai di-provision

2. **Enable Authentication**
   - Go to Authentication > Providers
   - Enable Google OAuth:
     - Setup Client ID dan Secret dari Google Cloud
     - Add redirect URL: `http://localhost:3000/auth/callback`
     - Add production URL: `https://yourdomain.com/auth/callback`

3. **Setup Database Tables**
   ```bash
   # Execute SQL files di Supabase SQL Editor
   supabase db execute setup_orders.sql
   supabase db execute setup_products.sql
   supabase db execute setup_cart.sql
   supabase db execute setup_faq.sql
   supabase db execute setup_admin.sql
   supabase db execute setup_storage.sql
   ```

4. **Configure Row Level Security (RLS)**
   - Enable RLS untuk semua tables
   - Setup policies untuk akses control

### Cloudinary Setup

1. **Daftar di Cloudinary**
   - Login ke [cloudinary.com](https://cloudinary.com)
   - Get Cloud Name dari dashboard
   - Generate upload preset untuk unsigned uploads

2. **Konfigurasi Upload**
   - Setup upload preset di Cloudinary dashboard
   - Configure image optimization & transformation
   - Setup resource limits

### Xendit Setup

1. **Daftar di Xendit**
   - Login ke [xendit.co](https://xendit.co)
   - Setup akun dan verify bisnis Anda
   - Get API Key dari Settings > Developers
   - Ambil Secret Key untuk server-side integration
   - Setup merchant di sandbox environment terlebih dahulu

2. **Konfigurasi Callback/Webhook**
   - Setup webhook URL di Xendit dashboard (Settings > Webhooks)
   - URL: `https://yourdomain.com/api/payment/notification`
   - Subscribe ke event: `invoice.paid`, `invoice.expired`
   - Enable webhook untuk testing di sandbox
   - Verify webhook secret untuk security

3. **Testing Payment**
   - Gunakan **Virtual Account** untuk testing:
     - Bank: BCA, BNI, Mandiri, Permata, CIMB
     - Automatic virtual account generation
   - Atau gunakan **E-Wallet** simulator (OVO, Dana, LinkAja)
   - Atau gunakan **Kartu Kredit Test**:
     - Card Number: `4900 0000 0000 0005`
     - CVV: `123`
     - Expiry: `12/25` (any future date)
     - OTP: `123456`
   - Sandbox mode tidak memerlukan dana aktual

4. **Integrasi di Code**
   - Setup Xendit client di `src/lib/xendit.ts`
   - Configure di `.env.local`:
     ```env
     NEXT_PUBLIC_XENDIT_API_KEY=xnd_public_xxxxxxxxxxxxx
     XENDIT_SECRET_KEY=xnd_xxx_xxxxxxxxxxxxx
     ```
   - Implement invoice creation & payment handling
   - Setup webhook listener untuk payment confirmations

## Database Setup

### SQL Files

Project menyediakan beberapa file SQL untuk setup database. File-file ini ada di root directory:

- `setup_orders.sql` - Order management table
- `setup_products.sql` - Product catalog table
- `setup_cart.sql` - Shopping cart table
- `setup_faq.sql` - FAQ table
- `setup_admin.sql` - Admin access setup
- `setup_storage.sql` - Storage bucket setup

### Struktur Database Utama

Berikut adalah dokumentasi lengkap semua table di Supabase:

#### **auth.users** (Managed by Supabase Auth)

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | User unique identifier |
| email | TEXT | UNIQUE, NOT NULL | User email address |
| encrypted_password | TEXT | - | Password (hashed) |
| email_confirmed_at | TIMESTAMP | - | Email verification timestamp |
| last_sign_in_at | TIMESTAMP | - | Last login timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

#### **profiles**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY, FK(auth.users) | User profile ID |
| email | TEXT | - | User email |
| full_name | TEXT | - | Full name |
| avatar_url | TEXT | - | Avatar/profile image URL |
| role | ENUM | DEFAULT 'customer' | User role: customer, seller, admin |
| phone | TEXT | - | Phone number |
| address | TEXT | - | Street address |
| city | TEXT | - | City name |
| province | TEXT | - | Province name |
| postal_code | TEXT | - | Postal code |
| bio | TEXT | - | User bio/description |
| created_at | TIMESTAMP | DEFAULT NOW() | Profile creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

#### **admin_assignments**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Assignment ID |
| user_id | UUID | FK(profiles) | Admin user ID |
| assigned_date | TIMESTAMP | DEFAULT NOW() | Assignment date |
| role | TEXT | - | Admin role/permission |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

#### **umkm**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | UMKM unique ID |
| owner_id | UUID | FK(profiles) | Owner/seller ID |
| name | TEXT | UNIQUE, NOT NULL | UMKM business name |
| category | TEXT | NOT NULL | Category: Kuliner, Fashion, Kerajinan, Kesehatan, Retail |
| description | TEXT | - | Business description |
| image | TEXT | - | Business image URL (Cloudinary) |
| lat | NUMERIC | - | Latitude coordinate |
| lng | NUMERIC | - | Longitude coordinate |
| alamat | TEXT | - | Full address |
| rating | NUMERIC | DEFAULT 4.5 | Average rating (0-5) |
| phone | TEXT | - | Contact phone number |
| email | TEXT | - | Contact email |
| website | TEXT | - | Website URL |
| status | ENUM | DEFAULT 'active' | Status: active, inactive, banned |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

#### **products**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Product unique ID |
| umkm_id | UUID | FK(umkm) | Associated UMKM ID |
| name | TEXT | NOT NULL | Product name |
| description | TEXT | - | Detailed description |
| price | NUMERIC | NOT NULL | Price in Rupiah |
| stock | INTEGER | DEFAULT 0 | Quantity in stock |
| image | TEXT | - | Product image URL (Cloudinary) |
| is_available | BOOLEAN | DEFAULT true | Availability status |
| rating | NUMERIC | DEFAULT 0 | Average product rating (0-5) |
| review_count | INTEGER | DEFAULT 0 | Total number of reviews |
| category | TEXT | - | Product category/type |
| tags | TEXT[] | - | Product tags/keywords |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

#### **orders**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Order unique ID |
| user_id | UUID | FK(profiles) | Customer user ID |
| total | NUMERIC | NOT NULL | Total order amount |
| status | ENUM | DEFAULT 'pending' | Status: pending, paid, shipped, delivered, cancelled |
| payment_method | TEXT | - | Payment method: xendit, xendit, transfer |
| payment_id | TEXT | - | Payment provider transaction ID |
| shipping_address | TEXT | - | Full shipping address |
| notes | TEXT | - | Special notes/instructions |
| created_at | TIMESTAMP | DEFAULT NOW() | Order creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last status update time |

#### **order_items**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Item unique ID |
| order_id | UUID | FK(orders) | Associated order ID |
| product_id | UUID | FK(products) | Product ID |
| quantity | INTEGER | NOT NULL | Quantity ordered |
| price | NUMERIC | NOT NULL | Price per unit at purchase time |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

#### **shopping_cart**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Cart item ID |
| user_id | UUID | FK(profiles) | User ID |
| product_id | UUID | FK(products) | Product ID |
| quantity | INTEGER | DEFAULT 1 | Quantity in cart |
| created_at | TIMESTAMP | DEFAULT NOW() | Added to cart time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

#### **faqs**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | FAQ unique ID |
| question | TEXT | NOT NULL | Question text |
| answer | TEXT | NOT NULL | Answer text |
| category | TEXT | - | FAQ category |
| order | INTEGER | DEFAULT 0 | Display order |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

#### **blog_posts**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Post unique ID |
| title | TEXT | NOT NULL | Post title |
| slug | TEXT | UNIQUE | URL-friendly slug |
| content | TEXT | - | Post content (markdown) |
| excerpt | TEXT | - | Short excerpt/summary |
| author_id | UUID | FK(profiles) | Author user ID |
| image | TEXT | - | Featured image URL |
| category | TEXT | - | Post category |
| tags | TEXT[] | - | Post tags |
| published | BOOLEAN | DEFAULT false | Publication status |
| views | INTEGER | DEFAULT 0 | View count |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

#### **umkm_requests**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Request unique ID |
| user_id | UUID | FK(profiles) | Requester user ID |
| business_name | TEXT | NOT NULL | Business name |
| category | TEXT | NOT NULL | Business category |
| description | TEXT | - | Business description |
| image | TEXT | - | Business image |
| phone | TEXT | - | Contact phone |
| email | TEXT | - | Contact email |
| address | TEXT | - | Business address |
| lat | NUMERIC | - | Latitude |
| lng | NUMERIC | - | Longitude |
| status | ENUM | DEFAULT 'pending' | Status: pending, approved, rejected |
| created_at | TIMESTAMP | DEFAULT NOW() | Submission time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

#### **product_reviews**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Review unique ID |
| product_id | UUID | FK(products) | Product being reviewed |
| user_id | UUID | FK(profiles) | Reviewer user ID |
| rating | INTEGER | NOT NULL | Rating (1-5) |
| comment | TEXT | - | Review comment/text |
| helpful_count | INTEGER | DEFAULT 0 | Helpful votes count |
| created_at | TIMESTAMP | DEFAULT NOW() | Review creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

#### **organizations** (for multiple stores per user)

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Organization ID |
| name | TEXT | NOT NULL | Organization name |
| type | TEXT | - | Organization type |
| settings | JSONB | DEFAULT '{}' | Organization settings |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

### Relasi Diagram (ER Diagram)

```
auth.users (1) ──── (N) profiles
               │
               ├──── (N) umkm (as owner_id)
               ├──── (N) orders
               ├──── (N) shopping_cart
               ├──── (N) blog_posts (as author)
               ├──── (N) product_reviews
               └──── (N) umkm_requests

umkm (1) ──── (N) products
         └──── (N) order_items (indirect via products)

products (1) ──── (N) order_items
         ├──── (N) shopping_cart
         └──── (N) product_reviews

orders (1) ──── (N) order_items
```

### Row Level Security (RLS) Policies

Setiap table memiliki RLS policy untuk security:

**Profiles Table**
- SELECT: Everyone dapat melihat profile publik
- INSERT: Hanya user bisa buat profile sendiri
- UPDATE: User hanya bisa update profile sendiri, admin bisa update semua
- DELETE: Admin only

**Products Table**
- SELECT: Everyone dapat melihat
- INSERT: Seller/admin untuk UMKM mereka
- UPDATE: Seller/admin untuk produk mereka
- DELETE: Seller/admin untuk produk mereka

**Orders Table**
- SELECT: User lihat order mereka, admin lihat semua
- INSERT: Customer buat order
- UPDATE: Customer & admin bisa update
- DELETE: Admin only

**UMKM Table**
- SELECT: Everyone
- INSERT: Seller/admin
- UPDATE: Owner/admin
- DELETE: Admin only

### Index di Database

Untuk optimasi query, berikut indexes yang di-setup:

```sql
-- Performance indexes
CREATE INDEX idx_products_umkm_id ON products(umkm_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cart_user_id ON shopping_cart(user_id);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_umkm_category ON umkm(category);
CREATE INDEX idx_umkm_owner ON umkm(owner_id);
```

## Panduan Penggunaan

### Homepage
- Lihat featured products dan testimoni pelanggan dengan carousel
- Browse kategori produk dengan kategori section
- Akses smart search di header
- Lihat trending products dan recommendations
- Footer dengan link penting

### Peta UMKM (`/peta-umkm`)
- **Navigasi Peta**: Zoom dengan scroll, pan dengan drag
- **Filter**: Click filter icon untuk filter by kategori
- **Search**: Click search icon untuk cari UMKM by nama
- **Sidebar**: Klik UMKM di sidebar untuk navigate ke marker
- **Detail**: Klik marker untuk lihat popup, click button untuk detail
- **My Location**: Click location icon untuk show user location
- **Responsive**: Sidebar di bottom di mobile, di left di desktop

### Shopping Flow
1. **Browse Produk**: Kunjungi `/produk` atau click produk di homepage
2. **Detail Produk**: Klik produk untuk lihat detail & reviews
3. **Add to Cart**: Klik "Add to Cart" button
4. **Cart**: Buka cart sidebar untuk review
5. **Checkout**: Klik checkout dari cart sidebar
6. **Payment**: Pilih metode pembayaran (Xendit)
7. **Confirm**: Ikuti instruksi pembayaran
8. **Track Order**: Kunjungi `/orders` untuk track pesanan

### User Account
- **Login/Register**: Gunakan email/password 
- **Profile**: Edit profile & avatar di user settings
- **Orders**: Lihat riwayat pembelian
- **Wishlist**: Save produk favorit
- **Address**: Manage alamat pengiriman

### Admin Dashboard (`/admin`)
- **Dashboard**: Overview penjualan & analytics
- **UMKM Management**: CRUD UMKM dan pprofile
- **Product Management**: Manage katalog produk per UMKM
- **Orders**: View & update status pesanan
- **FAQ**: Manage FAQ content
- **Blog**: Manage blog posts
- **Analytics**: Detailed sales analytics

### Mobile Responsiveness
- Sidebar di peta berubah jadi bottom sheet di mobile
- Cart sidebar responsive dengan modal
- All pages mobile-optimized

## API Endpoints

### Products API
```
GET    /api/products              # List all products
GET    /api/products?umkm_id=xxx  # Products by UMKM
GET    /api/products/[id]         # Product detail
POST   /api/products              # Create (admin/seller)
PUT    /api/products/[id]         # Update (admin/seller)
DELETE /api/products/[id]         # Delete (admin)
```

### UMKM API
```
GET    /api/umkm                  # List UMKM
GET    /api/umkm/[id]            # UMKM detail
POST   /api/umkm                  # Create UMKM (seller)
PUT    /api/umkm/[id]            # Update UMKM (seller/admin)
DELETE /api/umkm/[id]            # Delete UMKM (admin)
```

### Recommendations API
```
GET    /api/recommendations/trending      # Trending products
GET    /api/recommendations/similar       # Similar products
GET    /api/recommendations?umkm_id=xxx   # UMKM recommendations
```

### Cart API
```
GET    /api/cart                  # Get user cart
POST   /api/cart                  # Add to cart
PUT    /api/cart/[item_id]       # Update cart item
DELETE /api/cart/[item_id]       # Remove from cart
```

### Checkout & Payment API
```
POST   /api/checkout              # Create order
POST   /api/payment/xendit       # Process xendit payment
POST   /api/payment/xendit         # Process Xendit payment
POST   /api/payment/notification   # Payment webhook
```

### Orders API
```
GET    /api/orders                # User orders
GET    /api/orders/[id]          # Order detail
PUT    /api/orders/[id]          # Update order (admin)
```

## Deployment

### Deploy ke Vercel (Recommended)

1. **Push ke GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Buka Vercel Dashboard**
   - Login ke [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select repository `jajanlokal`
   - Configure environment variables (copy dari `.env.local`)
   - Click "Deploy"

3. **Post-Deployment**
   - Update Supabase redirect URLs:
     - `https://yourdomain.vercel.app/auth/callback`
   - Update xendit notification URL:
     - `https://yourdomain.vercel.app/api/payment/notification`
   - Setup custom domain di Vercel
   - Enable auto-deployment dari main branch

### Production Environment Variables

```env
# Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_xendit_CLIENT_KEY=your_production_client_key
xendit_SERVER_KEY=your_production_server_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Production Checklist

- [ ] Update `NEXT_PUBLIC_APP_URL` ke production URL
- [ ] Setup HTTPS certificate (Vercel auto-setup)
- [ ] Configure Supabase production environment
- [ ] Setup email verification di Supabase Auth
- [ ] Configure payment production keys
- [ ] Setup monitoring (Sentry, LogRocket, etc.)
- [ ] Enable rate limiting
- [ ] Setup backup database (Supabase auto-backup)
- [ ] Configure CDN untuk static assets
- [ ] Enable 2FA untuk admin accounts
- [ ] Setup email notifications
- [ ] Test payment flow end-to-end
- [ ] Performance optimization (images, bundles)
- [ ] Setup error tracking & logging

## Troubleshooting

### Port 3000 Already in Use

```bash
# macOS/Linux - find process
lsof -i :3000
kill -9 <PID>

# Atau gunakan port lain
npm run dev -- -p 3001
```

### Supabase Connection Error

```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Restart dev server
npm run dev

# Check Supabase status
# Visit https://status.supabase.com
```

### Image Optimization Error

- Pastikan domain image di-whitelist di `next.config.ts`
- Gunakan `unoptimized` untuk SVG (sudah di-implement untuk dicebear.com)
- Periksa Cloudinary configuration
- Check image format (SVG needs special handling)

### Payment Integration Issues

- Verifikasi Xendit API keys di `.env.local`
- Periksa notification URL di payment dashboard
- Test dengan payment credentials sandbox
- Check browser console untuk error messages
- Verify webhook setup di payment provider

### Database Connection Issues

- Verifikasi Supabase connection string
- Periksa firewall rules di Supabase dashboard
- Restart Supabase instance jika perlu
- Check table permissions & RLS policies
- Verify auth tokens valid

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Fitur Khusus

### Comments/Reviews dari JSON
- ✅ Reviews dimuat dari `/public/data/umkmData.json`
- ✅ Reviews di-match berdasarkan **nama UMKM** (case-insensitive)
- ✅ Setiap UMKM punya array `comments` dengan struktur:
```json
{
  "comments": [
    { "user": "Nama Pengguna", "text": "Isi review" },
    { "user": "User Lain", "text": "Review lainnya" }
  ]
}
```
- Avatar menggunakan dicebear.com API (SVG dengan unoptimized prop)

### Real-time Features
- ✅ Cart sync real-time ke Supabase
- ✅ UMKM list auto-refresh saat ada perubahan
- ✅ Order status updates real-time
- ✅ Menggunakan Supabase Realtime subscriptions

### Image Handling
- Images dioptimalkan via Cloudinary
- Avatar menggunakan dicebear.com API
- External image domains di-configure di `next.config.ts`
- SVG support untuk avatar generator
- Lazy loading untuk images

### Search & Filter
- Fuzzy search menggunakan Fuse.js
- Filter by kategori
- Filter by harga
- Filter by rating
- Multi-criteria search

## Kontribusi

1. **Fork** repository
2. **Create** feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** ke branch (`git push origin feature/AmazingFeature`)
5. **Open Pull Request** dengan deskripsi detail

## Lisensi

Project ini dilisensikan di bawah MIT License - lihat file LICENSE untuk detail.

## Tim

- **Frontend & Backend Developer**: Tim Wakwaw
- **UI/UX Design**: Tim Wakwaw
- **Project Lead**: Filzah Mufidah

## Acknowledgements

- [Supabase](https://supabase.com) - Backend & Auth
- [Vercel](https://vercel.com) - Hosting & Deployment
- [Cloudinary](https://cloudinary.com) - Image Management
- [Leaflet](https://leafletjs.com) - Interactive Maps
- [Next.js](https://nextjs.org) - React Framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://www.framer.com/motion) - Animations
- Semua open source contributors

