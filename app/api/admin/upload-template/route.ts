import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import path from 'path'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const uploadTemplateSchema = z.object({
  semester: z.string(),
  description: z.string().optional(),
})

// POST - Upload template Excel
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const semester = formData.get('semester') as string
    const description = formData.get('description') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'File harus diupload' },
        { status: 400 }
      )
    }

    // Validasi tipe file
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'File harus berformat Excel (.xlsx atau .xls)' },
        { status: 400 }
      )
    }

    const validatedData = uploadTemplateSchema.parse({
      semester,
      description,
    })

    // Buat folder upload jika belum ada
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'templates')
    
    // Generate nama file unik
    const timestamp = Date.now()
    const fileName = `template-${timestamp}-${file.name}`
    const filePath = path.join(uploadDir, fileName)
    const relativePath = `/uploads/templates/${fileName}`

    // Simpan file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Simpan info ke database
    const template = await prisma.formatTemplate.create({
      data: {
        namaFile: file.name,
        semester: validatedData.semester,
        pathFile: relativePath,
        description: validatedData.description || null,
        uploadedBy: session.user.id,
      }
    })

    return NextResponse.json({
      message: 'Template berhasil diupload',
      data: template
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Upload template error:', error)
    return NextResponse.json(
      { error: 'Gagal mengupload template' },
      { status: 500 }
    )
  }
}

// GET - Ambil daftar template
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const templates = await prisma.formatTemplate.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ data: templates })
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil daftar template' },
      { status: 500 }
    )
  }
}
