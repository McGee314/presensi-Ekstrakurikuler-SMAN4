import ExcelJS from 'exceljs'
import { prisma } from './prisma'

/**
 * Membaca template Excel yang diupload admin
 * Template biasanya memiliki sheet untuk setiap kelas (10, 11, 12)
 */
export async function readExcelTemplate(filePath: string) {
  try {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)

    const sheets: any = {}

    workbook.eachSheet((worksheet, sheetId) => {
      const sheetName = worksheet.name
      const rows: any[] = []

      worksheet.eachRow((row, rowNumber) => {
        const rowData: any = {}
        row.eachCell((cell, colNumber) => {
          rowData[`col${colNumber}`] = cell.value
        })
        rows.push({ rowNumber, data: rowData })
      })

      sheets[sheetName] = rows
    })

    return {
      success: true,
      sheets,
      sheetNames: Object.keys(sheets),
    }
  } catch (error) {
    console.error('Error reading Excel template:', error)
    return {
      success: false,
      error: 'Gagal membaca file Excel',
    }
  }
}

/**
 * Generate raport Excel per siswa
 * Mengambil semua nilai dari semua ekstrakurikuler yang diikuti siswa
 */
export async function generateStudentReport(studentId: string, semester: string) {
  try {
    // Ambil data siswa lengkap
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        studentEkskul: {
          include: {
            ekskul: {
              include: {
                coach: {
                  include: {
                    user: true
                  }
                }
              }
            },
            grades: {
              where: {
                semester: semester
              }
            },
            attendances: {
              where: {
                tanggal: {
                  // Filter untuk semester yang sesuai
                  // Ini bisa disesuaikan dengan logika bisnis
                  gte: new Date('2024-07-01'),
                  lte: new Date('2024-12-31'),
                }
              }
            }
          }
        }
      }
    })

    if (!student) {
      return {
        success: false,
        error: 'Siswa tidak ditemukan',
      }
    }

    // Buat workbook baru
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Raport Ekstrakurikuler')

    // Header Raport
    worksheet.mergeCells('A1:F1')
    worksheet.getCell('A1').value = 'RAPORT EKSTRAKURIKULER'
    worksheet.getCell('A1').font = { size: 16, bold: true }
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }

    // Info Siswa
    worksheet.addRow([])
    worksheet.addRow(['Nama', ':', student.user.nama])
    worksheet.addRow(['NIS', ':', student.nis])
    worksheet.addRow(['Kelas', ':', student.kelas])
    worksheet.addRow(['Semester', ':', semester])
    worksheet.addRow([])

    // Header Tabel
    worksheet.addRow([
      'No',
      'Nama Ekstrakurikuler',
      'Pelatih',
      'Kehadiran',
      'Nilai',
      'Predikat',
      'Catatan'
    ])

    // Style header tabel
    const headerRow = worksheet.lastRow
    if (headerRow) {
      headerRow.font = { bold: true }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
    }

    // Data Ekstrakurikuler
    student.studentEkskul.forEach((se, index) => {
      const grade = se.grades[0]
      const totalAttendance = se.attendances.length
      const hadirCount = se.attendances.filter(att => att.status === 'HADIR').length
      const kehadiran = totalAttendance > 0
        ? `${hadirCount}/${totalAttendance} (${Math.round((hadirCount / totalAttendance) * 100)}%)`
        : 'Belum ada data'

      worksheet.addRow([
        index + 1,
        se.ekskul.nama,
        se.ekskul.coach.user.nama,
        kehadiran,
        grade ? grade.nilai : '-',
        grade ? grade.predikat : '-',
        grade ? grade.catatan || '-' : '-'
      ])
    })

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0
      if (column && column.eachCell) {
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellValue = cell.value ? cell.value.toString() : ''
          maxLength = Math.max(maxLength, cellValue.length)
        })
      }
      if (column) {
        column.width = Math.min(Math.max(maxLength + 2, 10), 50)
      }
    })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      success: true,
      buffer,
      fileName: `Raport_${student.user.nama}_${semester}.xlsx`
    }
  } catch (error) {
    console.error('Error generating student report:', error)
    return {
      success: false,
      error: 'Gagal generate raport siswa',
    }
  }
}

/**
 * Generate raport Excel per ekstrakurikuler
 * Mengambil semua siswa yang mengikuti ekstrakurikuler tertentu
 */
export async function generateEkskulReport(ekskulId: string, semester: string) {
  try {
    // Ambil data ekstrakurikuler lengkap
    const ekskul = await prisma.ekskul.findUnique({
      where: { id: ekskulId },
      include: {
        coach: {
          include: {
            user: true
          }
        },
        studentEkskul: {
          include: {
            student: {
              include: {
                user: true
              }
            },
            grades: {
              where: {
                semester: semester
              }
            },
            attendances: {
              where: {
                tanggal: {
                  gte: new Date('2024-07-01'),
                  lte: new Date('2024-12-31'),
                }
              }
            }
          }
        }
      }
    })

    if (!ekskul) {
      return {
        success: false,
        error: 'Ekstrakurikuler tidak ditemukan',
      }
    }

    // Buat workbook baru
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Rekap Ekstrakurikuler')

    // Header Raport
    worksheet.mergeCells('A1:G1')
    worksheet.getCell('A1').value = `REKAP NILAI EKSTRAKURIKULER - ${ekskul.nama.toUpperCase()}`
    worksheet.getCell('A1').font = { size: 16, bold: true }
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }

    // Info Ekskul
    worksheet.addRow([])
    worksheet.addRow(['Ekstrakurikuler', ':', ekskul.nama])
    worksheet.addRow(['Kode', ':', ekskul.kode])
    worksheet.addRow(['Pelatih', ':', ekskul.coach.user.nama])
    worksheet.addRow(['Semester', ':', semester])
    worksheet.addRow([])

    // Header Tabel
    worksheet.addRow([
      'No',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Kehadiran',
      'Nilai',
      'Predikat',
      'Catatan'
    ])

    // Style header tabel
    const headerRow = worksheet.lastRow
    if (headerRow) {
      headerRow.font = { bold: true }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
    }

    // Data Siswa
    ekskul.studentEkskul.forEach((se, index) => {
      const grade = se.grades[0]
      const totalAttendance = se.attendances.length
      const hadirCount = se.attendances.filter(att => att.status === 'HADIR').length
      const kehadiran = totalAttendance > 0
        ? `${hadirCount}/${totalAttendance} (${Math.round((hadirCount / totalAttendance) * 100)}%)`
        : 'Belum ada data'

      worksheet.addRow([
        index + 1,
        se.student.nis,
        se.student.user.nama,
        se.student.kelas,
        kehadiran,
        grade ? grade.nilai : '-',
        grade ? grade.predikat : '-',
        grade ? grade.catatan || '-' : '-'
      ])
    })

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0
      if (column && column.eachCell) {
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellValue = cell.value ? cell.value.toString() : ''
          maxLength = Math.max(maxLength, cellValue.length)
        })
      }
      if (column) {
        column.width = Math.min(Math.max(maxLength + 2, 10), 50)
      }
    })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      success: true,
      buffer,
      fileName: `Rekap_${ekskul.nama}_${semester}.xlsx`
    }
  } catch (error) {
    console.error('Error generating ekskul report:', error)
    return {
      success: false,
      error: 'Gagal generate rekap ekstrakurikuler',
    }
  }
}

/**
 * Parse template Excel dan auto-generate nilai berdasarkan format
 * Contoh: jika template memiliki formula atau mapping tertentu
 */
export async function parseTemplateAndGenerateGrades(
  templatePath: string,
  ekskulId: string,
  semester: string
) {
  try {
    const templateData = await readExcelTemplate(templatePath)

    if (!templateData.success) {
      return templateData
    }

    // Logika parsing template disesuaikan dengan format Excel yang diupload
    // Contoh sederhana: ambil sheet pertama dan baca baris-baris tertentu

    // TODO: Implementasi logika parsing sesuai format template
    // Misalnya:
    // - Baris 1-5: Header
    // - Baris 6 dst: Data siswa dengan kolom NIS, Nama, Nilai, dll

    return {
      success: true,
      message: 'Template berhasil diparse',
      data: templateData
    }
  } catch (error) {
    console.error('Error parsing template:', error)
    return {
      success: false,
      error: 'Gagal memproses template',
    }
  }
}
