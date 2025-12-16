import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const submitAttendanceSchema = z.object({
  studentEkskulId: z.string(),
  tanggal: z.string(),
  status: z.enum(['HADIR', 'ALPA', 'IZIN', 'SAKIT']),
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
    const { studentEkskulId, tanggal, status, keterangan } = submitAttendanceSchema.parse(body)

    // Cek apakah sudah absen hari ini
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentEkskulId_tanggal: {
          studentEkskulId,
          tanggal: new Date(tanggal)
        }
      }
    })

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Anda sudah melakukan absensi hari ini' },
        { status: 400 }
      )
    }

    // Buat absensi baru
    const attendance = await prisma.attendance.create({
      data: {
        studentEkskulId,
        tanggal: new Date(tanggal),
        status,
        keterangan,
      }
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
