# Sistem Absensi & Penilaian Ekstrakurikuler

Aplikasi manajemen ekstrakurikuler sekolah dengan fitur absensi dan penilaian.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Setup database di `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ekskul_db"
NEXTAUTH_SECRET="your-secret-here"
```

3. Migrate database:
```bash
npx prisma migrate dev
npx prisma db seed
```

4. Run development:
```bash
npm run dev
```

5. Akses aplikasi di `http://localhost:3000`

## Default Login

- **Admin**: admin@ekskul.com / admin123
- **Pelatih**: coach.basket@ekskul.com / coach123
- **Siswa**: siswa1@ekskul.com / student123

## Tech Stack

- Next.js 14 + TypeScript
- PostgreSQL + Prisma
- NextAuth
- TailwindCSS
- ExcelJS

Lihat [README.md](./README.md) untuk dokumentasi lengkap.
