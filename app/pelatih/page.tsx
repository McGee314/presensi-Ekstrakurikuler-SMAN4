import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PelatihClient from './PelatihClient'

export default async function PelatihPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'PELATIH') {
    redirect('/login')
  }

  // Ambil data pelatih
  const coachProfile = await prisma.coachProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      ekskuls: {
        include: {
          studentEkskul: {
            include: {
              student: {
                include: {
                  user: true
                }
              },
              attendances: {
                orderBy: {
                  tanggal: 'desc'
                },
                take: 10
              },
              grades: true
            }
          }
        }
      }
    }
  })

  return (
    <PelatihClient 
      user={session.user}
      coachProfile={coachProfile}
    />
  )
}
