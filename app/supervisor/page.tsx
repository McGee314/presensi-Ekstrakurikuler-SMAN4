import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SupervisorClient from './SupervisorClient'

function attendanceRate(attendances: { status: string }[]) {
  if (attendances.length === 0) {
    return 0
  }

  const hadir = attendances.filter((attendance) => attendance.status === 'HADIR').length
  return Math.round((hadir / attendances.length) * 100)
}

export default async function SupervisorPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'SUPERVISOR') {
    redirect('/login')
  }

  const [ekskuls, studentEkskuls, grades] = await Promise.all([
    prisma.ekskul.findMany({
      include: {
        coach: {
          include: {
            user: true,
          },
        },
        studentEkskul: {
          where: {
            isActive: true,
          },
        },
        attendanceSessions: {
          include: {
            attendances: {
              select: {
                status: true,
              },
            },
          },
          orderBy: {
            tanggal: 'desc',
          },
        },
      },
      orderBy: {
        nama: 'asc',
      },
    }),
    prisma.studentEkskul.findMany({
      where: {
        isActive: true,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        ekskul: {
          include: {
            coach: {
              include: {
                user: true,
              },
            },
          },
        },
        attendances: {
          orderBy: {
            tanggal: 'desc',
          },
        },
        grades: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        student: {
          user: {
            nama: 'asc',
          },
        },
      },
    }),
    prisma.grade.findMany({
      include: {
        studentEkskul: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
            ekskul: {
              include: {
                coach: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ])

  const trainerStats = ekskuls.map((ekskul: any) => {
    const attendances = ekskul.attendanceSessions.flatMap((attendanceSession: any) => attendanceSession.attendances)
    const summaries = ekskul.attendanceSessions.filter((attendanceSession: any) => attendanceSession.summary)

    return {
      ekskulId: ekskul.id,
      ekskulNama: ekskul.nama,
      kode: ekskul.kode,
      pelatih: ekskul.coach.user.nama,
      hari: ekskul.hari,
      jamMulai: ekskul.jamMulai,
      jamSelesai: ekskul.jamSelesai,
      lokasi: ekskul.lokasi,
      jumlahSiswa: ekskul.studentEkskul.length,
      totalSesi: ekskul.attendanceSessions.length,
      sesiDitutup: ekskul.attendanceSessions.filter((attendanceSession: any) => attendanceSession.status === 'CLOSED').length,
      totalRingkasan: summaries.length,
      attendanceRate: attendanceRate(attendances),
    }
  })

  const studentStats = studentEkskuls.map((studentEkskul: any) => {
    const latestGrade = studentEkskul.grades[0]

    return {
      id: studentEkskul.id,
      nama: studentEkskul.student.user.nama,
      nis: studentEkskul.student.nis,
      kelas: studentEkskul.student.kelas,
      ekskul: studentEkskul.ekskul.nama,
      pelatih: studentEkskul.ekskul.coach.user.nama,
      totalAbsensi: studentEkskul.attendances.length,
      hadir: studentEkskul.attendances.filter((attendance: any) => attendance.status === 'HADIR').length,
      izinSakit: studentEkskul.attendances.filter((attendance: any) => ['IZIN', 'SAKIT'].includes(attendance.status)).length,
      alpa: studentEkskul.attendances.filter((attendance: any) => attendance.status === 'ALPA').length,
      attendanceRate: attendanceRate(studentEkskul.attendances),
      latestGrade,
    }
  })

  const finalResults = grades.map((grade: any) => ({
    id: grade.id,
    semester: grade.semester,
    nilai: grade.nilai,
    predikat: grade.predikat,
    catatan: grade.catatan,
    nama: grade.studentEkskul.student.user.nama,
    nis: grade.studentEkskul.student.nis,
    kelas: grade.studentEkskul.student.kelas,
    ekskul: grade.studentEkskul.ekskul.nama,
    pelatih: grade.studentEkskul.ekskul.coach.user.nama,
  }))

  const summary = {
    totalEkskul: ekskuls.length,
    totalSiswaAktif: new Set(studentEkskuls.map((studentEkskul: any) => studentEkskul.studentId)).size,
    totalPelatih: new Set(ekskuls.map((ekskul: any) => ekskul.coachId)).size,
    totalSesi: ekskuls.reduce((sum: number, ekskul: any) => sum + ekskul.attendanceSessions.length, 0),
  }

  return (
    <SupervisorClient
      user={session.user}
      summary={summary}
      trainerStats={trainerStats}
      studentStats={studentStats}
      finalResults={finalResults}
    />
  )
}
