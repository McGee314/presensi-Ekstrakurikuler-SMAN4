import { PrismaClient, UserRole, DayOfWeek } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function upsertUser(email: string, password: string, nama: string, role: UserRole) {
  const hashedPassword = await bcrypt.hash(password, 10)

  return prisma.user.upsert({
    where: { email },
    update: {
      nama,
      role,
    },
    create: {
      email,
      password: hashedPassword,
      nama,
      role,
    },
  })
}

async function ensureCoach(email: string, nama: string) {
  const user = await upsertUser(email, 'coach123', nama, 'PELATIH')
  const coachProfile = await prisma.coachProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
    },
  })

  return { user, coachProfile }
}

async function ensureStudent(email: string, nama: string, nis: string, kelas: string) {
  const user = await upsertUser(email, 'student123', nama, 'SISWA')
  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: {
      nis,
      kelas,
    },
    create: {
      userId: user.id,
      nis,
      kelas,
    },
  })

  return { user, studentProfile }
}

async function main() {
  console.log('Starting seed...')

  const admin = await upsertUser('admin@ekskul.com', 'admin123', 'Admin Utama', 'ADMIN')
  console.log('Admin ready:', admin.email)

  const supervisor = await upsertUser('supervisor@ekskul.com', 'supervisor123', 'Supervisor Sekolah', 'SUPERVISOR')
  await prisma.supervisorProfile.upsert({
    where: { userId: supervisor.id },
    update: {},
    create: {
      userId: supervisor.id,
    },
  })
  console.log('Supervisor ready:', supervisor.email)

  const coachBasket = await ensureCoach('coach.basket@ekskul.com', 'Coach Basket')
  const coachFutsal = await ensureCoach('coach.futsal@ekskul.com', 'Coach Futsal')
  const coachTeater = await ensureCoach('coach.teater@ekskul.com', 'Coach Teater')

  const ekskulData = [
    {
      nama: 'Basket',
      kode: 'BASKET',
      deskripsi: 'Ekstrakurikuler Basket',
      hari: 'SENIN' as DayOfWeek,
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Lapangan Basket',
      coachId: coachBasket.coachProfile.id,
    },
    {
      nama: 'Futsal',
      kode: 'FUTSAL',
      deskripsi: 'Ekstrakurikuler Futsal',
      hari: 'RABU' as DayOfWeek,
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Lapangan Futsal',
      coachId: coachFutsal.coachProfile.id,
    },
    {
      nama: 'Teater',
      kode: 'TEATER',
      deskripsi: 'Ekstrakurikuler Teater',
      hari: 'JUMAT' as DayOfWeek,
      jamMulai: '14:30',
      jamSelesai: '16:00',
      lokasi: 'Aula Sekolah',
      coachId: coachTeater.coachProfile.id,
    },
  ]

  const ekskuls = await Promise.all(
    ekskulData.map((ekskul) =>
      prisma.ekskul.upsert({
        where: { kode: ekskul.kode },
        update: ekskul,
        create: ekskul,
      })
    )
  )
  console.log('Ekskul ready:', ekskuls.map((ekskul) => ekskul.kode).join(', '))

  const student1 = await ensureStudent('siswa1@ekskul.com', 'Budi Santoso', '10001', '10A')
  const student2 = await ensureStudent('siswa2@ekskul.com', 'Ani Wijaya', '10002', '10B')

  await prisma.studentEkskul.upsert({
    where: {
      studentId_ekskulId: {
        studentId: student1.studentProfile.id,
        ekskulId: ekskuls[0].id,
      },
    },
    update: {
      isActive: true,
    },
    create: {
      studentId: student1.studentProfile.id,
      ekskulId: ekskuls[0].id,
    },
  })

  await prisma.studentEkskul.upsert({
    where: {
      studentId_ekskulId: {
        studentId: student2.studentProfile.id,
        ekskulId: ekskuls[1].id,
      },
    },
    update: {
      isActive: true,
    },
    create: {
      studentId: student2.studentProfile.id,
      ekskulId: ekskuls[1].id,
    },
  })

  console.log('Students ready and enrolled')
  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
