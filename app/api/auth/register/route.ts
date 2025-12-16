import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  role: z.enum(['SISWA', 'PELATIH', 'ADMIN']),
  nis: z.string().optional(),
  kelas: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        nama: validatedData.nama,
        role: validatedData.role,
      }
    })

    // Jika role SISWA, buat student profile
    if (validatedData.role === 'SISWA' && validatedData.nis && validatedData.kelas) {
      await prisma.studentProfile.create({
        data: {
          nis: validatedData.nis,
          kelas: validatedData.kelas,
          userId: user.id,
        }
      })
    }

    // Jika role PELATIH, buat coach profile
    if (validatedData.role === 'PELATIH') {
      await prisma.coachProfile.create({
        data: {
          userId: user.id,
        }
      })
    }

    return NextResponse.json(
      {
        message: 'Registrasi berhasil',
        user: {
          id: user.id,
          email: user.email,
          nama: user.nama,
          role: user.role,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}
