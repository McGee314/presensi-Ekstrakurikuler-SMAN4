import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  // Ambil semua data yang diperlukan
  const users = await prisma.user.findMany({
    include: {
      studentProfile: true,
      coachProfile: true,
      supervisorProfile: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const ekskuls = await prisma.ekskul.findMany({
    include: {
      coach: {
        include: {
          user: true
        }
      },
      _count: {
        select: {
          studentEkskul: true,
          attendanceSessions: true,
        }
      }
    }
  })

  const coaches = await prisma.coachProfile.findMany({
    include: {
      user: true,
    },
    orderBy: {
      user: {
        nama: 'asc',
      },
    },
  })

  const templates = await prisma.formatTemplate.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <AdminClient 
      user={session.user}
      users={users}
      ekskuls={ekskuls}
      coaches={coaches}
      templates={templates}
    />
  )
}
