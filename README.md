# 📚 Sistem Absensi & Penilaian Ekstrakurikuler

Aplikasi web untuk manajemen absensi dan penilaian ekstrakurikuler dengan empat role: **Siswa**, **Pelatih**, **Supervisor**, dan **Admin**.

## 🎯 Fitur Utama

### Portal Siswa (`/siswa`)
- ✅ Login / Registrasi
- ✅ Memilih maksimal 3 ekstrakurikuler
- ✅ Melakukan absensi kehadiran hanya saat sesi dibuka pelatih
- ✅ Melihat rekap absensi dan nilai
- ✅ Download raport ekstrakurikuler

### Portal Pelatih (`/pelatih`)
- ✅ Login
- ✅ Melihat daftar siswa per ekstrakurikuler
- ✅ Membuka sesi absensi sesuai jadwal admin
- ✅ Mengubah status kehadiran siswa (hadir/alpa/izin/sakit)
- ✅ Menutup sesi dengan ringkasan kegiatan harian
- ✅ Input atau mengubah nilai siswa per semester
- ✅ Dashboard kehadiran & nilai
- ✅ Download rekap nilai per ekstrakurikuler

### Portal Supervisor (`/supervisor`)
- ✅ Melihat skor absensi setiap pelatih dan ekstrakurikuler
- ✅ Melihat skor kehadiran setiap siswa
- ✅ Melihat hasil akhir/nilai semester setiap siswa

### Portal Admin (`/admin`)
- ✅ Manajemen user (siswa, pelatih, admin)
- ✅ Manajemen daftar ekstrakurikuler
- ✅ Menentukan hari, jam, dan lokasi setiap ekstrakurikuler
- ✅ Upload template Excel untuk format nilai
- ✅ Generate raport per siswa atau per ekstrakurikuler

## 🛠️ Teknologi yang Digunakan

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth (Credential Login)
- **Excel Handler**: ExcelJS
- **Language**: TypeScript

## 📁 Struktur Folder

```
Ekskul_presensi/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts          # NextAuth handler
│   │   │   └── register/
│   │   │       └── route.ts          # API registrasi
│   │   ├── ekskul/
│   │   │   └── select/
│   │   │       └── route.ts          # API pilih ekskul
│   │   ├── attendance/
│   │   │   ├── submit/
│   │   │   │   └── route.ts          # API submit absensi
│   │   │   └── update/
│   │   │       └── route.ts          # API update absensi (pelatih)
│   │   ├── grade/
│   │   │   └── update/
│   │   │       └── route.ts          # API update nilai
│   │   ├── admin/
│   │   │   └── upload-template/
│   │   │       └── route.ts          # API upload template Excel
│   │   └── report/
│   │       ├── student/
│   │       │   └── route.ts          # Download raport siswa
│   │       └── ekskul/
│   │           └── route.ts          # Download rekap ekskul
│   ├── siswa/
│   │   ├── page.tsx                  # Dashboard siswa (Server Component)
│   │   └── SiswaClient.tsx           # Client component siswa
│   ├── pelatih/
│   │   ├── page.tsx                  # Dashboard pelatih (Server Component)
│   │   └── PelatihClient.tsx         # Client component pelatih
│   ├── admin/
│   │   ├── page.tsx                  # Dashboard admin (Server Component)
│   │   └── AdminClient.tsx           # Client component admin
│   ├── login/
│   │   └── page.tsx                  # Halaman login
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Homepage
│   ├── providers.tsx                 # Session provider
│   └── globals.css                   # Global styles
├── components/
│   ├── Button.tsx                    # Komponen button reusable
│   ├── Loading.tsx                   # Komponen loading
│   └── StatCard.tsx                  # Komponen card statistik
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # NextAuth configuration
│   └── excelUtils.ts                 # Utilities untuk Excel
├── prisma/
│   └── schema.prisma                 # Database schema
├── types/
│   └── next-auth.d.ts                # Type definitions NextAuth
├── public/
│   └── uploads/                      # Folder untuk upload file
│       └── templates/                # Template Excel
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Cara Setup Development

### 1. Prerequisites

Pastikan sudah terinstall:
- Node.js (versi 18 atau lebih baru)
- PostgreSQL
- npm atau yarn
- Visual Studio Code (recommended)

### 2. Clone atau Buat Project

Jika belum, buat folder project:
```bash
mkdir Ekskul_presensi
cd Ekskul_presensi
```

### 3. Install Dependencies

```bash
npm install
```

Dependencies yang akan terinstall:
- `next` - Framework Next.js
- `react` & `react-dom` - React library
- `next-auth` - Authentication
- `@prisma/client` & `prisma` - Database ORM
- `bcryptjs` - Password hashing
- `exceljs` - Excel handler
- `zod` - Validation
- `tailwindcss` - CSS framework
- `typescript` - Type safety

### 4. Setup Database PostgreSQL

1. Buat database baru di PostgreSQL:
```sql
CREATE DATABASE ekskul_db;
```

2. Copy file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

3. Edit file `.env` dan sesuaikan dengan konfigurasi database Anda:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ekskul_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Setup Prisma

1. Generate Prisma Client:
```bash
npx prisma generate
```

2. Jalankan migration untuk membuat tabel:
```bash
npx prisma migrate dev --name init
```

3. (Opsional) Buka Prisma Studio untuk melihat database:
```bash
npx prisma studio
```

### 6. Seed Data (Opsional)

Buat user admin pertama secara manual menggunakan Prisma Studio atau buat script seed:

```bash
npx prisma db seed
```

Atau bisa register manual via API `/api/auth/register` dengan role `ADMIN`.

### 7. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### 8. Akses Aplikasi

- **Homepage**: `http://localhost:3000`
- **Login**: `http://localhost:3000/login`
- **Portal Siswa**: `http://localhost:3000/siswa`
- **Portal Pelatih**: `http://localhost:3000/pelatih`
- **Portal Admin**: `http://localhost:3000/admin`

## 📊 Database Schema

### Tabel Utama

#### `User`
- id, email, password, nama, role (SISWA/PELATIH/ADMIN)
- Relasi: StudentProfile, CoachProfile

#### `StudentProfile`
- id, nis, kelas, userId
- Relasi: User, StudentEkskul[]

#### `CoachProfile`
- id, userId
- Relasi: User, Ekskul[]

#### `Ekskul`
- id, nama, kode, deskripsi, coachId
- Relasi: CoachProfile, StudentEkskul[]

#### `StudentEkskul`
- id, studentId, ekskulId, tanggalDaftar, isActive
- Relasi: StudentProfile, Ekskul, Attendance[], Grade[]

#### `Attendance`
- id, tanggal, status (HADIR/ALPA/IZIN/SAKIT), keterangan, studentEkskulId
- Relasi: StudentEkskul

#### `Grade`
- id, semester, nilai, predikat, catatan, studentEkskulId
- Relasi: StudentEkskul

#### `FormatTemplate`
- id, namaFile, semester, pathFile, description, uploadedBy
- Menyimpan template Excel yang diupload admin

## 🔐 Authentication Flow

### 1. Registrasi
```typescript
POST /api/auth/register
Body: {
  email: string,
  password: string,
  nama: string,
  role: 'SISWA' | 'PELATIH' | 'ADMIN',
  nis?: string,      // jika role SISWA
  kelas?: string     // jika role SISWA
}
```

### 2. Login
```typescript
POST /api/auth/signin
Body: {
  email: string,
  password: string
}
```

NextAuth akan membuat session JWT yang berisi:
- user.id
- user.email
- user.nama
- user.role

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Registrasi user baru
- `POST /api/auth/signin` - Login (handled by NextAuth)

### Ekstrakurikuler
- `GET /api/ekskul/select` - Ambil daftar ekstrakurikuler
- `POST /api/ekskul/select` - Siswa memilih ekstrakurikuler

### Absensi
- `POST /api/attendance/submit` - Siswa submit absensi
- `PUT /api/attendance/update` - Pelatih update status absensi
- `GET /api/attendance/update?ekskulId=xxx&tanggal=xxx` - Ambil data absensi

### Nilai
- `PUT /api/grade/update` - Pelatih input/update nilai
- `GET /api/grade/update?ekskulId=xxx&semester=xxx` - Ambil data nilai

### Admin
- `POST /api/admin/upload-template` - Upload template Excel
- `GET /api/admin/upload-template` - Ambil daftar template

### Report (Download Excel)
- `GET /api/report/student?studentId=xxx&semester=xxx` - Download raport siswa
- `GET /api/report/ekskul?ekskulId=xxx&semester=xxx` - Download rekap ekskul

## 📄 Integrasi ExcelJS

### 1. Upload Template Excel (Admin)

Admin bisa upload file Excel yang berisi format nilai. File ini disimpan di folder `public/uploads/templates/`.

```typescript
// lib/excelUtils.ts
export async function readExcelTemplate(filePath: string)
```

### 2. Generate Raport Siswa

Menghasilkan file Excel berisi:
- Info siswa (nama, NIS, kelas)
- Daftar ekstrakurikuler yang diikuti
- Kehadiran per ekstrakurikuler
- Nilai dan predikat

```typescript
// lib/excelUtils.ts
export async function generateStudentReport(studentId: string, semester: string)
```

Contoh output:
```
RAPORT EKSTRAKURIKULER
Nama: John Doe
NIS: 12345
Kelas: 10A
Semester: Ganjil 2024/2025

| No | Ekstrakurikuler | Pelatih | Kehadiran | Nilai | Predikat | Catatan |
|----|----------------|---------|-----------|-------|----------|---------|
| 1  | Basket         | Coach A | 8/10(80%) | 85    | A        | Bagus   |
```

### 3. Generate Rekap Ekstrakurikuler

Menghasilkan file Excel berisi:
- Info ekstrakurikuler
- Daftar semua siswa yang mengikuti
- Kehadiran per siswa
- Nilai per siswa

```typescript
// lib/excelUtils.ts
export async function generateEkskulReport(ekskulId: string, semester: string)
```

### 4. Cara Download

Di frontend (siswa/pelatih):
```typescript
const downloadRaport = () => {
  window.location.href = `/api/report/student?studentId=${studentId}&semester=Ganjil 2024/2025`
}
```

## 🎨 Styling dengan TailwindCSS

Semua komponen menggunakan TailwindCSS utility classes:

```tsx
// Contoh button
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  Click Me
</button>

// Contoh card
<div className="bg-white p-6 rounded-lg shadow">
  <h3 className="text-lg font-semibold mb-2">Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```

## 🔧 Tips Development

### 1. Hot Reload
Next.js sudah support hot reload. Setiap perubahan akan langsung terlihat.

### 2. TypeScript
Pastikan tidak ada error TypeScript sebelum deploy:
```bash
npm run build
```

### 3. Prisma Studio
Gunakan Prisma Studio untuk melihat dan edit data:
```bash
npx prisma studio
```

### 4. Format Code
Install extension Prettier di VS Code untuk auto-format.

### 5. Git
Jangan lupa commit secara berkala:
```bash
git add .
git commit -m "feat: add feature X"
git push
```

## 🐛 Troubleshooting

### Error: Can't connect to database
- Pastikan PostgreSQL sudah running
- Cek konfigurasi `DATABASE_URL` di `.env`
- Test connection: `npx prisma db push`

### Error: Module not found
- Jalankan `npm install` lagi
- Hapus folder `node_modules` dan `package-lock.json`, lalu install ulang

### Error: NextAuth session undefined
- Pastikan `NEXTAUTH_SECRET` sudah diset di `.env`
- Pastikan `NEXTAUTH_URL` sesuai dengan URL aplikasi

### Error: File upload gagal
- Pastikan folder `public/uploads/templates` sudah dibuat
- Cek permission folder (harus writable)

## 📦 Build untuk Production

```bash
npm run build
npm start
```

Atau deploy ke Vercel:
```bash
vercel deploy
```

**Catatan:** Untuk production, gunakan database PostgreSQL yang sudah di-host (Supabase, Railway, dll).

## 🔒 Security Checklist

- ✅ Password di-hash dengan bcryptjs
- ✅ Session menggunakan JWT
- ✅ API endpoint ter-protected dengan authentication
- ✅ Input validation menggunakan Zod
- ✅ File upload hanya menerima Excel (.xlsx, .xls)
- ✅ Role-based access control (RBAC)

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [ExcelJS Documentation](https://github.com/exceljs/exceljs)

## 🤝 Kontribusi

Jika ingin menambahkan fitur:
1. Fork repository
2. Buat branch baru (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -m 'Add fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

## 📄 License

MIT License

---

**Dibuat dengan ❤️ menggunakan Next.js, Prisma, dan TailwindCSS**
