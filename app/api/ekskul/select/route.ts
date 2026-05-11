import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const selectEkskulSchema = z.object({
  ekskulId: z.string(),
})

// GET - Ambil daftar ekstrakurikuler
export async function GET(request: NextRequest) {
  try {
    const ekskuls = await prisma.ekskul.findMany({
      include: {
        coach: {
          include: {
            user: {
              select: {
                nama: true,
              }
            }
          }
        },
        _count: {
          select: {
            studentEkskul: true
          }
        }
      }
    })

    return NextResponse.json({ ekskuls })
  } catch (error) {
    console.error('Get ekskuls error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil daftar ekstrakurikuler' },
      { status: 500 }
    )
  }
}

// POST - Siswa memilih ekstrakurikuler
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
    const { ekskulId } = selectEkskulSchema.parse(body)

    // Ambil student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek apakah sudah terdaftar
    const existing = await prisma.studentEkskul.findUnique({
      where: {
        studentId_ekskulId: {
          studentId: studentProfile.id,
          ekskulId: ekskulId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Anda sudah terdaftar di ekstrakurikuler ini' },
        { status: 400 }
      )
    }

    const activeEkskulCount = await prisma.studentEkskul.count({
      where: {
        studentId: studentProfile.id,
        isActive: true,
      },
    })

    if (activeEkskulCount >= 3) {
      return NextResponse.json(
        { error: 'Siswa hanya dapat memilih maksimal 3 ekstrakurikuler' },
        { status: 400 }
      )
    }

    // Daftarkan siswa ke ekstrakurikuler
    const studentEkskul = await prisma.studentEkskul.create({
      data: {
        studentId: studentProfile.id,
        ekskulId: ekskulId,
      },
      include: {
        ekskul: true
      }
    })

    return NextResponse.json({
      message: 'Berhasil mendaftar ekstrakurikuler',
      data: studentEkskul
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Select ekskul error:', error)
    return NextResponse.json(
      { error: 'Gagal mendaftar ekstrakurikuler' },
      { status: 500 }
    )
  }
}
