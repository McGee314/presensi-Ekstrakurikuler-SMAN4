import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const submitAttendanceSchema = z.object({
  studentEkskulId: z.string(),
  sessionId: z.string(),
  status: z.enum(['HADIR', 'IZIN', 'SAKIT']).default('HADIR'),
  keterangan: z.string().optional(),
})

// POST - Submit absensi (untuk siswa)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { studentEkskulId, sessionId, status, keterangan } = submitAttendanceSchema.parse(body)

    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: {
        id: sessionId,
      },
    })

    if (!attendanceSession || attendanceSession.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Sesi absensi tidak tersedia atau sudah ditutup' },
        { status: 400 }
      )
    }

    // Pastikan siswa hanya bisa absen untuk ekstrakurikuler yang ia ikuti.
    const studentEkskul = await prisma.studentEkskul.findFirst({
      where: {
        id: studentEkskulId,
        ekskulId: attendanceSession.ekskulId,
        isActive: true,
        student: {
          userId: session.user.id,
        },
      },
    })

    if (!studentEkskul) {
      return NextResponse.json(
        { error: 'Data ekstrakurikuler siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentEkskulId_sessionId: {
          studentEkskulId,
          sessionId,
        },
      },
    })

    if (existingAttendance?.status === 'HADIR') {
      return NextResponse.json(
        { error: 'Anda sudah melakukan absensi hari ini' },
        { status: 400 }
      )
    }

    const attendance = existingAttendance
      ? await prisma.attendance.update({
          where: {
            id: existingAttendance.id,
          },
          data: {
            status,
            keterangan,
          },
        })
      : await prisma.attendance.create({
          data: {
            studentEkskulId,
            sessionId,
            tanggal: attendanceSession.tanggal,
            status,
            keterangan,
          },
        })

    return NextResponse.json({
      message: 'Absensi berhasil dicatat',
      data: attendance
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Submit attendance error:', error)
    return NextResponse.json(
      { error: 'Gagal mencatat absensi' },
      { status: 500 }
    )
  }
}
