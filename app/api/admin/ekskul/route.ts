import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DAY_OPTIONS } from '@/lib/schedule'
import { z } from 'zod'

const createEkskulSchema = z.object({
  nama: z.string().min(2, 'Nama ekstrakurikuler minimal 2 karakter'),
  kode: z.string().min(2, 'Kode ekstrakurikuler minimal 2 karakter'),
  deskripsi: z.string().optional(),
  coachId: z.string(),
  hari: z.enum(DAY_OPTIONS),
  jamMulai: z.string().optional(),
  jamSelesai: z.string().optional(),
  lokasi: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createEkskulSchema.parse(body)

    const coachProfile = await prisma.coachProfile.findUnique({
      where: {
        id: data.coachId,
      },
    })

    if (!coachProfile) {
      return NextResponse.json(
        { error: 'Pelatih tidak ditemukan' },
        { status: 404 }
      )
    }

    const ekskul = await prisma.ekskul.create({
      data: {
        nama: data.nama,
        kode: data.kode.toUpperCase(),
        deskripsi: data.deskripsi || null,
        coachId: data.coachId,
        hari: data.hari,
        jamMulai: data.jamMulai || null,
        jamSelesai: data.jamSelesai || null,
        lokasi: data.lokasi || null,
      },
      include: {
        coach: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Ekstrakurikuler berhasil dibuat',
        data: ekskul,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Create ekskul error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat ekstrakurikuler' },
      { status: 500 }
    )
  }
}
