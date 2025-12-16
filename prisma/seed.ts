import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ekskul.com' },
    update: {},
    create: {
      email: 'admin@ekskul.com',
      password: adminPassword,
      nama: 'Admin Utama',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin created:', admin.email)

  // Create Coach Users
  const coach1Password = await bcrypt.hash('coach123', 10)
  const coach1 = await prisma.user.create({
    data: {
      email: 'coach.basket@ekskul.com',
      password: coach1Password,
      nama: 'Coach Basket',
      role: 'PELATIH',
      coachProfile: {
        create: {}
      }
    },
    include: {
      coachProfile: true
    }
  })
  console.log('✅ Coach 1 created:', coach1.email)

  const coach2Password = await bcrypt.hash('coach123', 10)
  const coach2 = await prisma.user.create({
    data: {
      email: 'coach.futsal@ekskul.com',
      password: coach2Password,
      nama: 'Coach Futsal',
      role: 'PELATIH',
      coachProfile: {
        create: {}
      }
    },
    include: {
      coachProfile: true
    }
  })
  console.log('✅ Coach 2 created:', coach2.email)

  // Create Ekstrakurikuler
  const basket = await prisma.ekskul.create({
    data: {
      nama: 'Basket',
      kode: 'BASKET',
      deskripsi: 'Ekstrakurikuler Basket',
      coachId: coach1.coachProfile!.id,
    }
  })
  console.log('✅ Ekskul created:', basket.nama)

  const futsal = await prisma.ekskul.create({
    data: {
      nama: 'Futsal',
      kode: 'FUTSAL',
      deskripsi: 'Ekstrakurikuler Futsal',
      coachId: coach2.coachProfile!.id,
    }
  })
  console.log('✅ Ekskul created:', futsal.nama)

  // Create Student Users
  const student1Password = await bcrypt.hash('student123', 10)
  const student1 = await prisma.user.create({
    data: {
      email: 'siswa1@ekskul.com',
      password: student1Password,
      nama: 'Budi Santoso',
      role: 'SISWA',
      studentProfile: {
        create: {
          nis: '10001',
          kelas: '10A',
        }
      }
    },
    include: {
      studentProfile: true
    }
  })
  console.log('✅ Student 1 created:', student1.email)

  const student2Password = await bcrypt.hash('student123', 10)
  const student2 = await prisma.user.create({
    data: {
      email: 'siswa2@ekskul.com',
      password: student2Password,
      nama: 'Ani Wijaya',
      role: 'SISWA',
      studentProfile: {
        create: {
          nis: '10002',
          kelas: '10B',
        }
      }
    },
    include: {
      studentProfile: true
    }
  })
  console.log('✅ Student 2 created:', student2.email)

  // Enroll students to ekstrakurikuler
  await prisma.studentEkskul.create({
    data: {
      studentId: student1.studentProfile!.id,
      ekskulId: basket.id,
    }
  })

  await prisma.studentEkskul.create({
    data: {
      studentId: student2.studentProfile!.id,
      ekskulId: futsal.id,
    }
  })

  console.log('✅ Students enrolled to ekstrakurikuler')

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
