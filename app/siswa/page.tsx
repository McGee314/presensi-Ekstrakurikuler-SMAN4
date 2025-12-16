import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SiswaClient from './SiswaClient'

export default async function SiswaPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'SISWA') {
    redirect('/login')
  }

  // Ambil data siswa
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      studentEkskul: {
        include: {
          ekskul: {
            include: {
              coach: {
                include: {
                  user: true
                }
              }
            }
          },
          attendances: {
            orderBy: {
              tanggal: 'desc'
            },
            take: 10
          },
          grades: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      }
    }
  })

  // Ambil semua ekskul yang tersedia
  const allEkskuls = await prisma.ekskul.findMany({
    include: {
      coach: {
        include: {
          user: true
        }
      }
    }
  })

  return (
    <SiswaClient 
      user={session.user}
      studentProfile={studentProfile}
      allEkskuls={allEkskuls}
    />
  )
}
