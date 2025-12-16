# 📊 Database Schema Documentation

## ERD (Entity Relationship Diagram)

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password        │
│ nama            │
│ role            │──────┐
│ createdAt       │      │
│ updatedAt       │      │
└─────────────────┘      │
         │               │
         │               │
    ┌────┴────┐     ┌────┴────┐
    │         │     │         │
┌───▼────────────┐ ┌▼─────────────┐
│ StudentProfile │ │ CoachProfile │
├────────────────┤ ├──────────────┤
│ id (PK)        │ │ id (PK)      │
│ nis            │ │ userId (FK)  │
│ kelas          │ │ createdAt    │
│ userId (FK)    │ │ updatedAt    │
│ createdAt      │ └──────┬───────┘
│ updatedAt      │        │
└────┬───────────┘        │
     │                    │
     │              ┌─────▼─────────┐
     │              │    Ekskul     │
     │              ├───────────────┤
     │              │ id (PK)       │
     │              │ nama          │
     │              │ kode          │
     │              │ deskripsi     │
     │              │ coachId (FK)  │
     │              │ createdAt     │
     │              │ updatedAt     │
     │              └───────┬───────┘
     │                      │
     └──────────┬───────────┘
                │
         ┌──────▼──────────┐
         │ StudentEkskul   │
         ├─────────────────┤
         │ id (PK)         │
         │ studentId (FK)  │
         │ ekskulId (FK)   │
         │ tanggalDaftar   │
         │ isActive        │
         │ createdAt       │
         │ updatedAt       │
         └────┬─────┬──────┘
              │     │
      ┌───────┘     └───────┐
      │                     │
┌─────▼──────────┐   ┌──────▼───────┐
│   Attendance   │   │    Grade     │
├────────────────┤   ├──────────────┤
│ id (PK)        │   │ id (PK)      │
│ tanggal        │   │ semester     │
│ status         │   │ nilai        │
│ keterangan     │   │ predikat     │
│ studentEkskulId│   │ catatan      │
│ createdAt      │   │ studentEkskul│
│ updatedAt      │   │ createdAt    │
└────────────────┘   │ updatedAt    │
                     └──────────────┘

┌──────────────────┐
│ FormatTemplate   │
├──────────────────┤
│ id (PK)          │
│ namaFile         │
│ semester         │
│ pathFile         │
│ description      │
│ uploadedBy       │
│ createdAt        │
│ updatedAt        │
└──────────────────┘
```

## Tabel Detail

### 1. User
**Deskripsi**: Tabel utama untuk semua user (Siswa, Pelatih, Admin)

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary Key |
| email | String (unique) | Email login |
| password | String | Password ter-hash |
| nama | String | Nama lengkap |
| role | Enum | SISWA / PELATIH / ADMIN |
| createdAt | DateTime | Tanggal dibuat |
| updatedAt | DateTime | Tanggal update terakhir |

**Relations**:
- One-to-One: StudentProfile
- One-to-One: CoachProfile

---

### 2. StudentProfile
**Deskripsi**: Profile khusus untuk siswa

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary Key |
| nis | String (unique) | Nomor Induk Siswa |
| kelas | String | Kelas (contoh: 10A, 11B) |
| userId | String (FK) | Foreign Key ke User |
| createdAt | DateTime | Tanggal dibuat |
| updatedAt | DateTime | Tanggal update terakhir |

**Relations**:
- One-to-One: User
- One-to-Many: StudentEkskul

**Indexes**:
- Unique: nis
- Unique: userId

---

### 3. CoachProfile
**Deskripsi**: Profile khusus untuk pelatih

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary Key |
| userId | String (FK) | Foreign Key ke User |
| createdAt | DateTime | Tanggal dibuat |
| updatedAt | DateTime | Tanggal update terakhir |

**Relations**:
- One-to-One: User
- One-to-Many: Ekskul

**Indexes**:
- Unique: userId

---

### 4. Ekskul
**Deskripsi**: Daftar ekstrakurikuler

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary Key |
| nama | String | Nama ekstrakurikuler |
| kode | String (unique) | Kode unik (contoh: BASKET) |
| deskripsi | String (optional) | Deskripsi ekskul |
| coachId | String (FK) | Foreign Key ke CoachProfile |
| createdAt | DateTime | Tanggal dibuat |
| updatedAt | DateTime | Tanggal update terakhir |

**Relations**:
- Many-to-One: CoachProfile
- One-to-Many: StudentEkskul

**Indexes**:
- Unique: kode

---

### 5. StudentEkskul
**Deskripsi**: Relasi many-to-many antara Siswa dan Ekstrakurikuler

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary Key |
| studentId | String (FK) | Foreign Key ke StudentProfile |
| ekskulId | String (FK) | Foreign Key ke Ekskul |
| tanggalDaftar | DateTime | Tanggal siswa mendaftar |
| isActive | Boolean | Status aktif (default: true) |
| createdAt | DateTime | Tanggal dibuat |
| updatedAt | DateTime | Tanggal update terakhir |

**Relations**:
- Many-to-One: StudentProfile
- Many-to-One: Ekskul
- One-to-Many: Attendance
- One-to-Many: Grade

**Indexes**:
- Unique: (studentId, ekskulId)

---

### 6. Attendance
**Deskripsi**: Catatan kehadiran siswa per ekstrakurikuler

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary Key |
| tanggal | DateTime | Tanggal kehadiran |
| status | Enum | HADIR / ALPA / IZIN / SAKIT |
| keterangan | String (optional) | Catatan tambahan |
| studentEkskulId | String (FK) | Foreign Key ke StudentEkskul |
| createdAt | DateTime | Tanggal dibuat |
| updatedAt | DateTime | Tanggal update terakhir |

**Relations**:
- Many-to-One: StudentEkskul

**Indexes**:
- Unique: (studentEkskulId, tanggal)

**Business Rules**:
- Satu siswa hanya bisa absen 1x per hari per ekstrakurikuler
- Status default: ALPA
- Bisa diupdate oleh pelatih

---

### 7. Grade
**Deskripsi**: Nilai siswa per semester per ekstrakurikuler

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary Key |
| semester | String | Nama semester (contoh: "Ganjil 2024/2025") |
| nilai | Float | Nilai angka (0-100) |
| predikat | String (optional) | Predikat (A/B/C/D) |
| catatan | String (optional) | Catatan dari pelatih |
| studentEkskulId | String (FK) | Foreign Key ke StudentEkskul |
| createdAt | DateTime | Tanggal dibuat |
| updatedAt | DateTime | Tanggal update terakhir |

**Relations**:
- Many-to-One: StudentEkskul

**Indexes**:
- Unique: (studentEkskulId, semester)

**Business Rules**:
- Satu siswa hanya punya 1 nilai per semester per ekstrakurikuler
- Nilai bisa diupdate (upsert)
- Predikat auto-generate: A (≥85), B (≥70), C (≥60), D (<60)

---

### 8. FormatTemplate
**Deskripsi**: Template Excel yang diupload admin

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary Key |
| namaFile | String | Nama file asli |
| semester | String | Semester terkait |
| pathFile | String | Path file di storage |
| description | String (optional) | Deskripsi template |
| uploadedBy | String | User ID yang upload |
| createdAt | DateTime | Tanggal dibuat |
| updatedAt | DateTime | Tanggal update terakhir |

**Relations**: None (standalone)

**Business Rules**:
- File disimpan di `public/uploads/templates/`
- Hanya admin yang bisa upload
- File type: .xlsx atau .xls

---

## Query Examples

### Ambil semua siswa di ekskul tertentu
```prisma
const students = await prisma.studentEkskul.findMany({
  where: { ekskulId: 'ekskul-id' },
  include: {
    student: {
      include: { user: true }
    }
  }
})
```

### Ambil semua nilai siswa per semester
```prisma
const grades = await prisma.grade.findMany({
  where: {
    semester: 'Ganjil 2024/2025',
    studentEkskul: {
      studentId: 'student-id'
    }
  },
  include: {
    studentEkskul: {
      include: { ekskul: true }
    }
  }
})
```

### Hitung persentase kehadiran
```prisma
const attendances = await prisma.attendance.findMany({
  where: {
    studentEkskulId: 'student-ekskul-id',
    tanggal: {
      gte: new Date('2024-01-01'),
      lte: new Date('2024-12-31')
    }
  }
})

const total = attendances.length
const hadir = attendances.filter(a => a.status === 'HADIR').length
const persentase = (hadir / total) * 100
```

---

## Migration Commands

```bash
# Generate migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Deploy to production
npx prisma migrate deploy

# View database in browser
npx prisma studio
```

---

## Backup & Restore

### Backup
```bash
pg_dump -U username ekskul_db > backup.sql
```

### Restore
```bash
psql -U username ekskul_db < backup.sql
```

---

**Last Updated**: December 2024
