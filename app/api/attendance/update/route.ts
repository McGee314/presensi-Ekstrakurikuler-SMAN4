import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateAttendanceSchema = z.object({
  attendanceId: z.string(),
  status: z.enum(['HADIR', 'ALPA', 'IZIN', 'SAKIT']),
  keterangan: z.string().optional(),
})

// PUT - Update status absensi (untuk pelatih)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PELATIH') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { attendanceId, status, keterangan } = updateAttendanceSchema.parse(body)

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        studentEkskul: {
          ekskul: {
            coach: {
              userId: session.user.id,
            },
          },
        },
      },
    })

    if (!existingAttendance) {
      return NextResponse.json(
        { error: 'Data absensi tidak ditemukan untuk pelatih ini' },
        { status: 404 }
      )
    }

    const attendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status,
        keterangan,
      },
      include: {
        studentEkskul: {
          include: {
            student: {
              include: {
                user: true
              }
            },
            ekskul: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Status absensi berhasil diupdate',
      data: attendance
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update attendance error:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate status absensi' },
      { status: 500 }
    )
  }
}

// GET - Ambil daftar absensi untuk pelatih
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PELATIH') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const ekskulId = searchParams.get('ekskulId')
    const tanggal = searchParams.get('tanggal')

    // Ambil coach profile
    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        ekskuls: true
      }
    })

    if (!coachProfile) {
      return NextResponse.json(
        { error: 'Coach profile tidak ditemukan' },
        { status: 404 }
      )
    }

    // Ambil semua siswa di ekstrakurikuler yang dibimbing
    const studentEkskuls = await prisma.studentEkskul.findMany({
      where: {
        ...(ekskulId ? { ekskulId } : {}),
        ekskul: {
          coachId: coachProfile.id,
        },
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        ekskul: true,
        attendances: tanggal
          ? {
              where: {
                tanggal: new Date(tanggal),
              },
            }
          : {
              orderBy: {
                tanggal: 'desc',
              },
              take: 10,
            },
      }
    })

    return NextResponse.json({ data: studentEkskuls })
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data absensi' },
      { status: 500 }
    )
  }
}
