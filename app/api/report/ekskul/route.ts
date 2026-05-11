import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateEkskulReport } from '@/lib/excelUtils'

export const dynamic = 'force-dynamic'

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
    const semester = searchParams.get('semester') || 'Ganjil 2024/2025'

    if (!ekskulId) {
      return NextResponse.json(
        { error: 'Ekskul ID harus disertakan' },
        { status: 400 }
      )
    }

    const result = await generateEkskulReport(ekskulId, semester)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return new NextResponse(result.buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${result.fileName}"`,
      },
    })
  } catch (error) {
    console.error('Download ekskul report error:', error)
    return NextResponse.json(
      { error: 'Gagal mendownload rekap' },
      { status: 500 }
    )
  }
}
