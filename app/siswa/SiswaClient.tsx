'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatSchedule } from '@/lib/schedule'

export default function SiswaClient({ user, studentProfile, allEkskuls }: any) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<'ekskul' | 'absensi' | 'nilai'>('ekskul')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSelectEkskul = async (ekskulId: string) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/ekskul/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ekskulId }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Berhasil mendaftar ekstrakurikuler!')
        router.refresh()
      } else {
        setMessage(data.error || 'Gagal mendaftar ekstrakurikuler')
      }
    } catch (error) {
      setMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const selectedEkskulCount = studentProfile?.studentEkskul?.filter((se: any) => se.isActive).length || 0

  const handleAbsensi = async (studentEkskulId: string, sessionId: string) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/attendance/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEkskulId,
          sessionId,
          status: 'HADIR',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Absensi berhasil dicatat!')
        router.refresh()
      } else {
        setMessage(data.error || 'Gagal mencatat absensi')
      }
    } catch (error) {
      setMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const successMessage = message.toLowerCase().includes('berhasil')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Siswa</h1>
            <p className="text-sm text-gray-600">Halo, {user.nama}!</p>
            {studentProfile && (
              <p className="text-xs text-gray-500">NIS: {studentProfile.nis} | Kelas: {studentProfile.kelas}</p>
            )}
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
          <div className={`p-4 rounded-lg ${successMessage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('ekskul')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'ekskul'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pilih Ekstrakurikuler
            </button>
            <button
              onClick={() => setSelectedTab('absensi')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'absensi'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Absensi & Riwayat
            </button>
            <button
              onClick={() => setSelectedTab('nilai')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'nilai'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Nilai Saya
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {selectedTab === 'ekskul' && (
            <div>
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold">Ekstrakurikuler yang Tersedia</h2>
                <span className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm">
                  Dipilih: {selectedEkskulCount}/3
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allEkskuls.map((ekskul: any) => {
                  const isJoined = studentProfile?.studentEkskul.some(
                    (se: any) => se.ekskulId === ekskul.id
                  )
                  const isLimitReached = selectedEkskulCount >= 3
                  
                  return (
                    <div key={ekskul.id} className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">{ekskul.nama}</h3>
                      <p className="text-sm text-gray-600 mb-2">Kode: {ekskul.kode}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        Jadwal: {formatSchedule(ekskul.hari, ekskul.jamMulai, ekskul.jamSelesai)}
                      </p>
                      {ekskul.lokasi && (
                        <p className="text-sm text-gray-600 mb-2">Lokasi: {ekskul.lokasi}</p>
                      )}
                      <p className="text-sm text-gray-600 mb-4">
                        Pelatih: {ekskul.coach.user.nama}
                      </p>
                      
                      {isJoined ? (
                        <button
                          disabled
                          className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed"
                        >
                          Sudah Terdaftar
                        </button>
                      ) : isLimitReached ? (
                        <button
                          disabled
                          className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed"
                        >
                          Maksimal 3 Ekskul
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSelectEkskul(ekskul.id)}
                          disabled={loading}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          Daftar
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {selectedTab === 'absensi' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Absensi Hari Ini</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {studentProfile?.studentEkskul.map((se: any) => {
                  const openSession = se.ekskul.attendanceSessions?.[0]
                  const sessionAttendance = openSession?.attendances?.[0]

                  return (
                    <div key={se.id} className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-2">{se.ekskul.nama}</h3>
                      
                      {!openSession ? (
                        <div className="bg-gray-100 text-gray-700 p-3 rounded">
                          Belum ada sesi absensi yang dibuka pelatih.
                        </div>
                      ) : sessionAttendance?.status === 'HADIR' ? (
                        <div className="bg-green-100 text-green-800 p-3 rounded">
                          Sudah absen ({sessionAttendance.status}) pada{' '}
                          {new Date(openSession.tanggal).toLocaleDateString('id-ID')}
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600 mb-3">
                            Sesi dibuka untuk {new Date(openSession.tanggal).toLocaleDateString('id-ID')}
                          </p>
                          <button
                            onClick={() => handleAbsensi(se.id, openSession.id)}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                          >
                            Absen Sekarang
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <h2 className="text-xl font-semibold mb-4">Riwayat Absensi</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ekstrakurikuler
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentProfile?.studentEkskul.flatMap((se: any) =>
                      se.attendances.map((att: any) => (
                        <tr key={att.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {se.ekskul.nama}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(att.tanggal).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                att.status === 'HADIR'
                                  ? 'bg-green-100 text-green-800'
                                  : att.status === 'IZIN' || att.status === 'SAKIT'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'nilai' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Nilai Ekstrakurikuler</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {studentProfile?.studentEkskul.map((se: any) => (
                  <div key={se.id} className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">{se.ekskul.nama}</h3>
                    
                    {se.grades.length > 0 ? (
                      <div className="space-y-3">
                        {se.grades.map((grade: any) => (
                          <div key={grade.id} className="border-l-4 border-blue-500 pl-4">
                            <p className="text-sm text-gray-600">{grade.semester}</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {grade.nilai} {grade.predikat && `(${grade.predikat})`}
                            </p>
                            {grade.catatan && (
                              <p className="text-sm text-gray-500 mt-1">{grade.catatan}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Belum ada nilai</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
