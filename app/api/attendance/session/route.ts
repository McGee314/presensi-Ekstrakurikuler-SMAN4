import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDayOfWeek, parseDateOnly } from '@/lib/schedule'
import { z } from 'zod'

const createAttendanceSessionSchema = z.object({
  ekskulId: z.string(),
  tanggal: z.string(),
})

const closeAttendanceSessionSchema = z.object({
  sessionId: z.string(),
  summary: z.string().min(5, 'Ringkasan kegiatan minimal 5 karakter'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PELATIH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ekskulId, tanggal } = createAttendanceSessionSchema.parse(body)
    const sessionDate = parseDateOnly(tanggal)

    const ekskul = await prisma.ekskul.findFirst({
      where: {
        id: ekskulId,
        coach: {
          userId: session.user.id,
        },
      },
      include: {
        studentEkskul: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
          },
        },
      },
    })

    if (!ekskul) {
      return NextResponse.json(
        { error: 'Ekstrakurikuler tidak ditemukan untuk pelatih ini' },
        { status: 404 }
      )
    }

    if (!ekskul.hari) {
      return NextResponse.json(
        { error: 'Admin belum menentukan hari ekstrakurikuler ini' },
        { status: 400 }
      )
    }

    const selectedDay = getDayOfWeek(sessionDate)
    if (selectedDay !== ekskul.hari) {
      return NextResponse.json(
        { error: `Sesi hanya bisa dibuat pada hari ${ekskul.hari}` },
        { status: 400 }
      )
    }

    const attendanceSession = await prisma.$transaction(async (tx) => {
      const createdSession = await tx.attendanceSession.create({
        data: {
          ekskulId,
          tanggal: sessionDate,
        },
      })

      if (ekskul.studentEkskul.length > 0) {
        await tx.attendance.createMany({
          data: ekskul.studentEkskul.map((studentEkskul) => ({
            studentEkskulId: studentEkskul.id,
            sessionId: createdSession.id,
            tanggal: sessionDate,
            status: 'ALPA',
          })),
          skipDuplicates: true,
        })
      }

      return createdSession
    })

    return NextResponse.json({
      message: 'Sesi absensi berhasil dibuat',
      data: attendanceSession,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Sesi absensi untuk tanggal ini sudah dibuat' },
        { status: 400 }
      )
    }

    console.error('Create attendance session error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat sesi absensi' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PELATIH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, summary } = closeAttendanceSessionSchema.parse(body)

    const attendanceSession = await prisma.attendanceSession.findFirst({
      where: {
        id: sessionId,
        ekskul: {
          coach: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!attendanceSession) {
      return NextResponse.json(
        { error: 'Sesi absensi tidak ditemukan untuk pelatih ini' },
        { status: 404 }
      )
    }

    const updatedSession = await prisma.attendanceSession.update({
      where: {
        id: sessionId,
      },
      data: {
        summary,
        status: 'CLOSED',
        closedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Ringkasan kegiatan berhasil disimpan',
      data: updatedSession,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Close attendance session error:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan ringkasan kegiatan' },
      { status: 500 }
    )
  }
}
