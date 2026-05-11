import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  role: z.enum(['SISWA', 'PELATIH', 'SUPERVISOR', 'ADMIN']),
  nis: z.string().optional(),
  kelas: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    if (validatedData.role === 'SISWA' && (!validatedData.nis || !validatedData.kelas)) {
      return NextResponse.json(
        { error: 'NIS dan kelas wajib diisi untuk siswa' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        nama: validatedData.nama,
        role: validatedData.role,
        studentProfile: validatedData.role === 'SISWA'
          ? {
              create: {
                nis: validatedData.nis!,
                kelas: validatedData.kelas!,
              },
            }
          : undefined,
        coachProfile: validatedData.role === 'PELATIH'
          ? {
              create: {},
            }
          : undefined,
        supervisorProfile: validatedData.role === 'SUPERVISOR'
          ? {
              create: {},
            }
          : undefined,
      },
    })

    return NextResponse.json(
      {
        message: 'User berhasil dibuat',
        data: {
          id: user.id,
          email: user.email,
          nama: user.nama,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat user' },
      { status: 500 }
    )
  }
}
