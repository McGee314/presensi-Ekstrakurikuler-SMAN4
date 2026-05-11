import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateGradeSchema = z.object({
  studentEkskulId: z.string(),
  semester: z.string(),
  nilai: z.number().min(0).max(100),
  predikat: z.string().optional(),
  catatan: z.string().optional(),
})

// PUT - Update nilai siswa (untuk pelatih)
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
    const { studentEkskulId, semester, nilai, predikat, catatan } = updateGradeSchema.parse(body)

    const studentEkskul = await prisma.studentEkskul.findFirst({
      where: {
        id: studentEkskulId,
        ekskul: {
          coach: {
            userId: session.user.id,
          },
        },
      },
    })

    if (!studentEkskul) {
      return NextResponse.json(
        { error: 'Data siswa tidak ditemukan untuk pelatih ini' },
        { status: 404 }
      )
    }

    // Upsert nilai (update jika ada, create jika belum ada)
    const grade = await prisma.grade.upsert({
      where: {
        studentEkskulId_semester: {
          studentEkskulId,
          semester
        }
      },
      update: {
        nilai,
        predikat,
        catatan,
      },
      create: {
        studentEkskulId,
        semester,
        nilai,
        predikat,
        catatan,
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
      message: 'Nilai berhasil disimpan',
      data: grade
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update grade error:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan nilai' },
      { status: 500 }
    )
  }
}

// GET - Ambil nilai siswa
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const ekskulId = searchParams.get('ekskulId')
    const semester = searchParams.get('semester')

    let whereClause: any = {}

    // Jika siswa, hanya ambil nilai sendiri
    if (session.user.role === 'SISWA') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!studentProfile) {
        return NextResponse.json(
          { error: 'Student profile tidak ditemukan' },
          { status: 404 }
        )
      }

      whereClause.studentEkskul = {
        studentId: studentProfile.id
      }
    }

    // Filter by ekskul jika ada
    if (ekskulId) {
      whereClause.studentEkskul = {
        ...whereClause.studentEkskul,
        ekskulId
      }
    }

    // Filter by semester jika ada
    if (semester) {
      whereClause.semester = semester
    }

    const grades = await prisma.grade.findMany({
      where: whereClause,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ data: grades })
  } catch (error) {
    console.error('Get grades error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data nilai' },
      { status: 500 }
    )
  }
}
