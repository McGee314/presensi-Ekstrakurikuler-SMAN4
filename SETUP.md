# Ekskul Presensi - Setup Instructions

## 🎯 Yang Sudah Dibuat

Struktur project lengkap sudah dibuat dengan file-file berikut:

### ✅ Konfigurasi
- `package.json` - Dependencies dan scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - TailwindCSS configuration
- `next.config.js` - Next.js configuration
- `.env.example` - Template environment variables
- `.gitignore` - Git ignore rules

### ✅ Database (Prisma)
- `prisma/schema.prisma` - Database schema lengkap
- `prisma/seed.ts` - Seed data untuk testing
- `lib/prisma.ts` - Prisma client singleton

### ✅ Authentication
- `lib/auth.ts` - NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `app/api/auth/register/route.ts` - Registration API
- `middleware.ts` - Route protection & role-based access
- `types/next-auth.d.ts` - Type definitions

### ✅ API Routes
- `app/api/ekskul/select/route.ts` - Pilih ekstrakurikuler
- `app/api/attendance/submit/route.ts` - Submit absensi
- `app/api/attendance/update/route.ts` - Update absensi (pelatih)
- `app/api/grade/update/route.ts` - Input/update nilai
- `app/api/admin/upload-template/route.ts` - Upload template Excel
- `app/api/report/student/route.ts` - Download raport siswa
- `app/api/report/ekskul/route.ts` - Download rekap ekskul

### ✅ Pages
- `app/page.tsx` - Homepage
- `app/login/page.tsx` - Login page
- `app/siswa/page.tsx` + `SiswaClient.tsx` - Dashboard siswa
- `app/pelatih/page.tsx` + `PelatihClient.tsx` - Dashboard pelatih
- `app/admin/page.tsx` + `AdminClient.tsx` - Dashboard admin

### ✅ Utilities
- `lib/excelUtils.ts` - Functions untuk baca/generate Excel
- `components/Button.tsx` - Reusable button component
- `components/Loading.tsx` - Loading component
- `components/StatCard.tsx` - Card component

### ✅ Dokumentasi
- `README.md` - Dokumentasi lengkap
- `QUICKSTART.md` - Quick start guide

## 🚀 Langkah Setup

### 1. Install Dependencies
```bash
npm install
```

Jika ada error, coba:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ekskul_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

Generate secret:
```bash
openssl rand -base64 32
```

### 3. Setup Database
```bash
# Buat database (via psql atau pgAdmin)
createdb ekskul_db

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed data (opsional)
npx prisma db seed
```

### 4. Buat Folder Upload
```bash
mkdir -p public/uploads/templates
```

### 5. Run Development Server
```bash
npm run dev
```

Akses: `http://localhost:3000`

## 🔑 Default Login (Setelah Seed)

- **Admin**: admin@ekskul.com / admin123
- **Pelatih Basket**: coach.basket@ekskul.com / coach123
- **Pelatih Futsal**: coach.futsal@ekskul.com / coach123
- **Siswa 1**: siswa1@ekskul.com / student123
- **Siswa 2**: siswa2@ekskul.com / student123

## 📝 Flow Aplikasi

### Flow Siswa:
1. Login → Dashboard Siswa
2. Tab "Pilih Ekstrakurikuler" → Pilih ekskul yang tersedia
3. Tab "Absensi & Riwayat" → Absen hari ini, lihat riwayat
4. Tab "Nilai Saya" → Lihat nilai per semester
5. Download raport (akan ditambahkan button)

### Flow Pelatih:
1. Login → Dashboard Pelatih
2. Tab "Daftar Siswa" → Lihat semua siswa di ekskul
3. Tab "Kelola Absensi" → Ubah status kehadiran siswa
4. Tab "Input Nilai" → Input nilai siswa per semester
5. Download rekap ekskul (akan ditambahkan button)

### Flow Admin:
1. Login → Dashboard Admin
2. Tab "Manajemen User" → CRUD user (siswa, pelatih)
3. Tab "Ekstrakurikuler" → CRUD ekstrakurikuler
4. Tab "Template Nilai" → Upload template Excel

## 🔧 Troubleshooting

### Error: Can't connect to database
```bash
# Check PostgreSQL running
pg_isready

# Test connection
psql -U username -d ekskul_db
```

### Error: Prisma generate failed
```bash
npx prisma generate --force
```

### Error: Module not found
```bash
npm install
npx prisma generate
```

### Error: Permission denied (upload folder)
```bash
chmod -R 755 public/uploads
```

## 📚 Next Steps

1. ✅ Install dependencies
2. ✅ Setup .env
3. ✅ Setup database & migrate
4. ✅ Seed data
5. ✅ Run dev server
6. Test semua fitur
7. Customize sesuai kebutuhan
8. Deploy to production

## 🎨 Customization

### Tambah Ekstrakurikuler:
Via Prisma Studio atau admin dashboard

### Ubah Color Scheme:
Edit `tailwind.config.js`

### Tambah Field:
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Update API & UI

## 📞 Support

Jika ada error atau pertanyaan, cek:
- `README.md` untuk dokumentasi lengkap
- Console browser untuk error frontend
- Terminal untuk error backend
- Prisma Studio untuk debug database

---

**Happy Coding! 🚀**
