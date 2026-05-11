'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DAY_OPTIONS, formatSchedule } from '@/lib/schedule'

export default function AdminClient({ user, users, ekskuls, coaches, templates }: any) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<'users' | 'ekskul' | 'templates'>('users')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUploadTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/admin/upload-template', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Template berhasil diupload!')
        router.refresh()
        ;(e.target as HTMLFormElement).reset()
      } else {
        setMessage(data.error || 'Gagal mengupload template')
      }
    } catch (error) {
      setMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: formData.get('nama'),
          email: formData.get('email'),
          password: formData.get('password'),
          role: formData.get('role'),
          nis: formData.get('nis'),
          kelas: formData.get('kelas'),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('User berhasil dibuat!')
        router.refresh()
        ;(e.target as HTMLFormElement).reset()
      } else {
        setMessage(data.error || 'Gagal membuat user')
      }
    } catch (error) {
      setMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEkskul = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/admin/ekskul', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: formData.get('nama'),
          kode: formData.get('kode'),
          deskripsi: formData.get('deskripsi'),
          coachId: formData.get('coachId'),
          hari: formData.get('hari'),
          jamMulai: formData.get('jamMulai'),
          jamSelesai: formData.get('jamSelesai'),
          lokasi: formData.get('lokasi'),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Ekstrakurikuler berhasil dibuat!')
        router.refresh()
        ;(e.target as HTMLFormElement).reset()
      } else {
        setMessage(data.error || 'Gagal membuat ekstrakurikuler')
      }
    } catch (error) {
      setMessage('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSchedule = async (ekskulId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/admin/ekskul/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ekskulId,
          hari: formData.get('hari'),
          jamMulai: formData.get('jamMulai'),
          jamSelesai: formData.get('jamSelesai'),
          lokasi: formData.get('lokasi'),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Jadwal berhasil disimpan!')
        router.refresh()
      } else {
        setMessage(data.error || 'Gagal menyimpan jadwal')
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
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
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
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'users'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Manajemen User
            </button>
            <button
              onClick={() => setSelectedTab('ekskul')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'ekskul'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Ekstrakurikuler
            </button>
            <button
              onClick={() => setSelectedTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'templates'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Template Nilai
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'users' && (
          <div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Tambah User</h2>
              <form onSubmit={handleCreateUser} className="grid md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nama</label>
                  <input
                    type="text"
                    name="nama"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <select
                    name="role"
                    defaultValue="SISWA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="SISWA">SISWA</option>
                    <option value="PELATIH">PELATIH</option>
                    <option value="SUPERVISOR">SUPERVISOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">NIS Siswa</label>
                  <input
                    type="text"
                    name="nis"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kelas Siswa</label>
                  <input
                    type="text"
                    name="kelas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="md:col-span-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                >
                  Tambah User
                </button>
              </form>
            </div>

            <h2 className="text-xl font-semibold mb-4">Daftar User</h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Info Tambahan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u: any) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {u.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'PELATIH' ? 'bg-green-100 text-green-800' :
                          u.role === 'SUPERVISOR' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.studentProfile && `NIS: ${u.studentProfile.nis}, Kelas: ${u.studentProfile.kelas}`}
                        {u.coachProfile && 'Pelatih'}
                        {u.supervisorProfile && 'Supervisor Sekolah'}
                        {!u.studentProfile && !u.coachProfile && !u.supervisorProfile && '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'ekskul' && (
          <div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Tambah Ekstrakurikuler</h2>
              <form onSubmit={handleCreateEkskul} className="grid md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nama</label>
                  <input
                    type="text"
                    name="nama"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kode</label>
                  <input
                    type="text"
                    name="kode"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pelatih</label>
                  <select
                    name="coachId"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Pilih pelatih</option>
                    {coaches.map((coach: any) => (
                      <option key={coach.id} value={coach.id}>
                        {coach.user.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hari</label>
                  <select
                    name="hari"
                    defaultValue="SENIN"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {DAY_OPTIONS.map((hari) => (
                      <option key={hari} value={hari}>
                        {hari}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mulai</label>
                  <input
                    type="time"
                    name="jamMulai"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Selesai</label>
                  <input
                    type="time"
                    name="jamSelesai"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Lokasi</label>
                  <input
                    type="text"
                    name="lokasi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
                  <input
                    type="text"
                    name="deskripsi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || coaches.length === 0}
                  className="md:col-span-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                >
                  Tambah Ekstrakurikuler
                </button>
              </form>
            </div>

            <h2 className="text-xl font-semibold mb-4">Daftar Ekstrakurikuler</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ekskuls.map((ekskul: any) => (
                <div key={ekskul.id} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">{ekskul.nama}</h3>
                  <p className="text-sm text-gray-600 mb-1">Kode: {ekskul.kode}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    Pelatih: {ekskul.coach.user.nama}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Jadwal: {formatSchedule(ekskul.hari, ekskul.jamMulai, ekskul.jamSelesai)}
                  </p>
                  {ekskul.lokasi && (
                    <p className="text-sm text-gray-600 mb-1">
                      Lokasi: {ekskul.lokasi}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mb-4">
                    Jumlah Siswa: {ekskul._count.studentEkskul}
                  </p>
                  <form onSubmit={(e) => handleUpdateSchedule(ekskul.id, e)} className="space-y-3 border-t pt-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Hari</label>
                      <select
                        name="hari"
                        defaultValue={ekskul.hari || 'SENIN'}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        {DAY_OPTIONS.map((hari) => (
                          <option key={hari} value={hari}>
                            {hari}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Mulai</label>
                        <input
                          type="time"
                          name="jamMulai"
                          defaultValue={ekskul.jamMulai || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Selesai</label>
                        <input
                          type="time"
                          name="jamSelesai"
                          defaultValue={ekskul.jamSelesai || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Lokasi</label>
                      <input
                        type="text"
                        name="lokasi"
                        defaultValue={ekskul.lokasi || ''}
                        placeholder="Lapangan / ruang kegiatan"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-purple-600 text-white py-2 px-3 rounded hover:bg-purple-700 disabled:bg-gray-400 text-sm"
                    >
                      Simpan Jadwal
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'templates' && (
          <div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Upload Template Nilai</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <form onSubmit={handleUploadTemplate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Excel (.xlsx / .xls)
                    </label>
                    <input
                      type="file"
                      name="file"
                      accept=".xlsx,.xls"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <input
                      type="text"
                      name="semester"
                      placeholder="Contoh: Ganjil 2024/2025"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi (opsional)
                    </label>
                    <textarea
                      name="description"
                      placeholder="Deskripsi template..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Mengupload...' : 'Upload Template'}
                  </button>
                </form>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Template yang Tersedia</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nama File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Semester
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tanggal Upload
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {templates.map((template: any) => (
                      <tr key={template.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {template.namaFile}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {template.semester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(template.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Download
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
