'use client'

import { useMemo, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatSchedule, toDateInputValue } from '@/lib/schedule'

const attendanceStatuses = ['HADIR', 'ALPA', 'IZIN', 'SAKIT']

export default function PelatihClient({ user, coachProfile }: any) {
  const router = useRouter()
  const ekskuls = useMemo(() => coachProfile?.ekskuls || [], [coachProfile])
  const [selectedTab, setSelectedTab] = useState<'daftar' | 'sesi' | 'absensi' | 'nilai'>('daftar')
  const [selectedEkskulId, setSelectedEkskulId] = useState(ekskuls[0]?.id || '')
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [semester, setSemester] = useState('Ganjil 2024/2025')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const selectedEkskul = useMemo(
    () => ekskuls.find((ekskul: any) => ekskul.id === selectedEkskulId) || ekskuls[0],
    [ekskuls, selectedEkskulId]
  )

  const sessions = selectedEkskul?.attendanceSessions || []
  const selectedSession = sessions.find((session: any) => session.id === selectedSessionId) || sessions[0]

  const showMessage = (text: string) => setMessage(text)

  const handleCreateSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedEkskul) return

    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/attendance/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ekskulId: selectedEkskul.id,
          tanggal: formData.get('tanggal'),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('Sesi absensi berhasil dibuat!')
        router.refresh()
      } else {
        showMessage(data.error || 'Gagal membuat sesi absensi')
      }
    } catch (error) {
      showMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSession = async (sessionId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/attendance/session', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          summary: formData.get('summary'),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('Ringkasan kegiatan berhasil disimpan!')
        router.refresh()
      } else {
        showMessage(data.error || 'Gagal menyimpan ringkasan kegiatan')
      }
    } catch (error) {
      showMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
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
        showMessage('Status absensi berhasil diupdate!')
        router.refresh()
      } else {
        showMessage(data.error || 'Gagal mengupdate status absensi')
      }
    } catch (error) {
      showMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateGrade = async (studentEkskulId: string, nilai: number, catatan?: string) => {
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
          catatan,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('Nilai berhasil disimpan!')
        router.refresh()
      } else {
        showMessage(data.error || 'Gagal menyimpan nilai')
      }
    } catch (error) {
      showMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const successMessage = message.toLowerCase().includes('berhasil')

  return (
    <div className="min-h-screen bg-gray-50">
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

      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-lg ${successMessage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {ekskuls.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-gray-600">
            Belum ada ekstrakurikuler yang ditugaskan.
          </div>
        ) : (
          <>
            <div className="mb-6 grid md:grid-cols-[minmax(0,320px)_1fr] gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Ekstrakurikuler
                </label>
                <select
                  value={selectedEkskul?.id || ''}
                  onChange={(e) => {
                    setSelectedEkskulId(e.target.value)
                    setSelectedSessionId('')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {ekskuls.map((ekskul: any) => (
                    <option key={ekskul.id} value={ekskul.id}>
                      {ekskul.nama}
                    </option>
                  ))}
                </select>
              </div>
              {selectedEkskul && (
                <div className="bg-white p-4 rounded-lg shadow-sm text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{selectedEkskul.nama}</span>
                  <span className="mx-2">|</span>
                  {formatSchedule(selectedEkskul.hari, selectedEkskul.jamMulai, selectedEkskul.jamSelesai)}
                  {selectedEkskul.lokasi && <span> | {selectedEkskul.lokasi}</span>}
                </div>
              )}
            </div>

            <div className="border-b border-gray-200 mb-6">
              <nav className="flex flex-wrap gap-x-8">
                {[
                  ['daftar', 'Daftar Siswa'],
                  ['sesi', 'Sesi & Ringkasan'],
                  ['absensi', 'Kelola Absensi'],
                  ['nilai', 'Input Nilai'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTab(key as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === key
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {selectedTab === 'daftar' && selectedEkskul && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Daftar Siswa - {selectedEkskul.nama}</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedEkskul.studentEkskul.map((se: any) => (
                        <tr key={se.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{se.student.nis}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{se.student.user.nama}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{se.student.kelas}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{se.student.user.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'sesi' && selectedEkskul && (
              <div className="grid lg:grid-cols-[360px_1fr] gap-6">
                <div className="bg-white p-6 rounded-lg shadow h-fit">
                  <h2 className="text-xl font-semibold mb-4">Buat Sesi Absensi</h2>
                  <form onSubmit={handleCreateSession} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kegiatan</label>
                      <input
                        type="date"
                        name="tanggal"
                        defaultValue={toDateInputValue()}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Buka Absensi
                    </button>
                  </form>
                  <p className="text-xs text-gray-500 mt-3">
                    Sesi hanya bisa dibuat pada hari jadwal yang sudah ditentukan admin.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Riwayat Sesi</h2>
                  {sessions.length === 0 && (
                    <div className="bg-white p-6 rounded-lg shadow text-gray-500">
                      Belum ada sesi absensi.
                    </div>
                  )}
                  {sessions.map((session: any) => {
                    const total = session.attendances.length
                    const hadir = session.attendances.filter((attendance: any) => attendance.status === 'HADIR').length
                    const rate = total > 0 ? Math.round((hadir / total) * 100) : 0

                    return (
                      <div key={session.id} className="bg-white p-5 rounded-lg shadow">
                        <div className="flex flex-wrap justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">
                              {new Date(session.tanggal).toLocaleDateString('id-ID')}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Kehadiran: {hadir}/{total} ({rate}%)
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold h-fit ${
                            session.status === 'OPEN'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {session.status === 'OPEN' ? 'Dibuka' : 'Ditutup'}
                          </span>
                        </div>

                        {session.status === 'OPEN' ? (
                          <form onSubmit={(e) => handleCloseSession(session.id, e)} className="mt-4 space-y-3">
                            <textarea
                              name="summary"
                              rows={3}
                              placeholder="Ringkasan kegiatan hari ini..."
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                              type="submit"
                              disabled={loading}
                              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                            >
                              Simpan Ringkasan & Tutup Sesi
                            </button>
                          </form>
                        ) : (
                          <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
                            {session.summary || 'Ringkasan belum tersedia'}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedTab === 'absensi' && selectedEkskul && (
              <div>
                <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
                  <h2 className="text-xl font-semibold">Kelola Absensi - {selectedEkskul.nama}</h2>
                  <select
                    value={selectedSession?.id || ''}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {sessions.map((session: any) => (
                      <option key={session.id} value={session.id}>
                        {new Date(session.tanggal).toLocaleDateString('id-ID')} - {session.status}
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedSession ? (
                  <div className="bg-white p-6 rounded-lg shadow text-gray-500">
                    Buat sesi absensi terlebih dahulu.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedSession.attendances.map((attendance: any) => (
                      <div key={attendance.id} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex flex-wrap justify-between gap-4">
                          <div>
                            <p className="font-semibold">{attendance.studentEkskul.student.user.nama}</p>
                            <p className="text-sm text-gray-600">
                              {attendance.studentEkskul.student.nis} - {attendance.studentEkskul.student.kelas}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {attendanceStatuses.map((status) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateAttendance(attendance.id, status)}
                                disabled={loading}
                                className={`px-3 py-2 rounded text-sm font-medium ${
                                  attendance.status === status
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'nilai' && selectedEkskul && (
              <div>
                <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
                  <h2 className="text-xl font-semibold">Input Nilai - {selectedEkskul.nama}</h2>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Semester</label>
                    <input
                      type="text"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedEkskul.studentEkskul.map((se: any) => {
                    const latestGrade = se.grades[0]

                    return (
                      <form
                        key={se.id}
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.currentTarget)
                          const nilai = Number(formData.get('nilai'))
                          const catatan = String(formData.get('catatan') || '')
                          if (nilai >= 0 && nilai <= 100) {
                            handleUpdateGrade(se.id, nilai, catatan)
                          }
                        }}
                        className="bg-white p-4 rounded-lg shadow"
                      >
                        <div className="grid md:grid-cols-[1fr_120px_1fr_auto] gap-3 items-end">
                          <div>
                            <p className="font-semibold">{se.student.user.nama}</p>
                            <p className="text-sm text-gray-600">{se.student.nis} - {se.student.kelas}</p>
                            {latestGrade && (
                              <p className="text-sm text-gray-500 mt-1">
                                Nilai terakhir: {latestGrade.nilai} ({latestGrade.predikat}) - {latestGrade.semester}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nilai</label>
                            <input
                              type="number"
                              name="nilai"
                              min="0"
                              max="100"
                              step="0.1"
                              required
                              defaultValue={latestGrade?.nilai || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Catatan</label>
                            <input
                              type="text"
                              name="catatan"
                              defaultValue={latestGrade?.catatan || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                          >
                            Simpan
                          </button>
                        </div>
                      </form>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
