import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DAY_OPTIONS } from '@/lib/schedule'
import { z } from 'zod'

const updateScheduleSchema = z.object({
  ekskulId: z.string(),
  hari: z.enum(DAY_OPTIONS),
  jamMulai: z.string().optional(),
  jamSelesai: z.string().optional(),
  lokasi: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ekskulId, hari, jamMulai, jamSelesai, lokasi } = updateScheduleSchema.parse(body)

    const ekskul = await prisma.ekskul.update({
      where: {
        id: ekskulId,
      },
      data: {
        hari,
        jamMulai: jamMulai || null,
        jamSelesai: jamSelesai || null,
        lokasi: lokasi || null,
      },
      include: {
        coach: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Jadwal ekstrakurikuler berhasil disimpan',
      data: ekskul,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Update ekskul schedule error:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan jadwal ekstrakurikuler' },
      { status: 500 }
    )
  }
}
