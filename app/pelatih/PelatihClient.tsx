'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function PelatihClient({ user, coachProfile }: any) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<'daftar' | 'absensi' | 'nilai'>('daftar')
  const [selectedEkskul, setSelectedEkskul] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const ekskuls = coachProfile?.ekskuls || []

  // Set default ekskul
  if (!selectedEkskul && ekskuls.length > 0) {
    setSelectedEkskul(ekskuls[0])
  }

  const handleUpdateAttendance = async (attendanceId: string, status: string) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/attendance/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceId, status }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Status absensi berhasil diupdate!')
        router.refresh()
      } else {
        setMessage(data.error || 'Gagal mengupdate status absensi')
      }
    } catch (error) {
      setMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateGrade = async (studentEkskulId: string, semester: string, nilai: number) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/grade/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEkskulId,
          semester,
          nilai,
          predikat: nilai >= 85 ? 'A' : nilai >= 70 ? 'B' : nilai >= 60 ? 'C' : 'D',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Nilai berhasil disimpan!')
        router.refresh()
      } else {
        setMessage(data.error || 'Gagal menyimpan nilai')
      }
    } catch (error) {
      setMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Pelatih</h1>
            <p className="text-sm text-gray-600">Halo, {user.nama}!</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-lg ${message.includes('berhasil') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Pilih Ekskul */}
        {ekskuls.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Ekstrakurikuler
            </label>
            <select
              value={selectedEkskul?.id || ''}
              onChange={(e) => {
                const ekskul = ekskuls.find((ek: any) => ek.id === e.target.value)
                setSelectedEkskul(ekskul)
              }}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {ekskuls.map((ekskul: any) => (
                <option key={ekskul.id} value={ekskul.id}>
                  {ekskul.nama}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('daftar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'daftar'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Daftar Siswa
            </button>
            <button
              onClick={() => setSelectedTab('absensi')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'absensi'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Kelola Absensi
            </button>
            <button
              onClick={() => setSelectedTab('nilai')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'nilai'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Input Nilai
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'daftar' && selectedEkskul && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Daftar Siswa - {selectedEkskul.nama}
            </h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      NIS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedEkskul.studentEkskul.map((se: any) => (
                    <tr key={se.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {se.student.nis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {se.student.user.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {se.student.kelas}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {se.student.user.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'absensi' && selectedEkskul && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Kelola Absensi - {selectedEkskul.nama}
            </h2>
            <div className="space-y-4">
              {selectedEkskul.studentEkskul.map((se: any) => (
                <div key={se.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-semibold">{se.student.user.nama}</p>
                      <p className="text-sm text-gray-600">
                        {se.student.nis} - {se.student.kelas}
                      </p>
                    </div>
                  </div>
                  
                  {/* Riwayat absensi terakhir */}
                  <div className="mt-3 text-sm">
                    <p className="font-medium mb-2">Riwayat Terakhir:</p>
                    {se.attendances.slice(0, 3).map((att: any) => (
                      <div key={att.id} className="flex justify-between items-center mb-1">
                        <span className="text-gray-600">
                          {new Date(att.tanggal).toLocaleDateString('id-ID')}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            att.status === 'HADIR'
                              ? 'bg-green-100 text-green-800'
                              : att.status === 'IZIN' || att.status === 'SAKIT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {att.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'nilai' && selectedEkskul && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Input Nilai - {selectedEkskul.nama}
            </h2>
            <div className="space-y-4">
              {selectedEkskul.studentEkskul.map((se: any) => {
                const latestGrade = se.grades[0]
                
                return (
                  <div key={se.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold">{se.student.user.nama}</p>
                        <p className="text-sm text-gray-600">
                          {se.student.nis} - {se.student.kelas}
                        </p>
                        
                        {latestGrade && (
                          <div className="mt-2 text-sm">
                            <p className="text-gray-600">
                              Nilai terakhir: <span className="font-bold text-blue-600">
                                {latestGrade.nilai} ({latestGrade.predikat})
                              </span>
                            </p>
                            <p className="text-gray-500 text-xs">
                              {latestGrade.semester}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Nilai"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const nilai = parseFloat((e.target as HTMLInputElement).value)
                              if (nilai >= 0 && nilai <= 100) {
                                handleUpdateGrade(se.id, 'Ganjil 2024/2025', nilai)
                              }
                            }
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter untuk simpan</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
