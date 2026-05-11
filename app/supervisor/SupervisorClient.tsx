'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { formatSchedule } from '@/lib/schedule'

export default function SupervisorClient({ user, summary, trainerStats, studentStats, finalResults }: any) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trainer' | 'student' | 'final'>('overview')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Supervisor</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[
            ['Ekstrakurikuler', summary.totalEkskul],
            ['Siswa Aktif', summary.totalSiswaAktif],
            ['Pelatih', summary.totalPelatih],
            ['Sesi Absensi', summary.totalSesi],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-5 rounded-lg shadow">
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
          ))}
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex flex-wrap gap-x-8">
            {[
              ['overview', 'Ringkasan'],
              ['trainer', 'Skor Pelatih'],
              ['student', 'Skor Siswa'],
              ['final', 'Nilai Akhir'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === key
                    ? 'border-yellow-500 text-yellow-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {selectedTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">Ekstrakurikuler & Jadwal</h2>
              </div>
              <div className="divide-y">
                {trainerStats.map((stat: any) => (
                  <div key={stat.ekskulId} className="p-5">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{stat.ekskulNama}</p>
                        <p className="text-sm text-gray-600">Pelatih: {stat.pelatih}</p>
                        <p className="text-sm text-gray-600">
                          {formatSchedule(stat.hari, stat.jamMulai, stat.jamSelesai)}
                          {stat.lokasi && ` | ${stat.lokasi}`}
                        </p>
                      </div>
                      <span className="text-sm text-gray-600">{stat.jumlahSiswa} siswa</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">Kegiatan Terpantau</h2>
              </div>
              <div className="divide-y">
                {trainerStats.map((stat: any) => (
                  <div key={stat.ekskulId} className="p-5">
                    <div className="flex justify-between gap-4 mb-2">
                      <p className="font-semibold text-gray-900">{stat.ekskulNama}</p>
                      <p className="text-sm font-semibold text-gray-900">{stat.attendanceRate}% hadir</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {stat.sesiDitutup}/{stat.totalSesi} sesi ditutup, {stat.totalRingkasan} ringkasan disimpan
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'trainer' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelatih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ekskul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ringkasan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kehadiran</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trainerStats.map((stat: any) => (
                  <tr key={stat.ekskulId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.pelatih}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{stat.ekskulNama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{stat.sesiDitutup}/{stat.totalSesi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{stat.totalRingkasan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{stat.attendanceRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedTab === 'student' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ekskul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelatih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hadir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Izin/Sakit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alpa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentStats.map((stat: any) => (
                  <tr key={stat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <p className="font-medium text-gray-900">{stat.nama}</p>
                      <p className="text-gray-500">{stat.nis} - {stat.kelas}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{stat.ekskul}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{stat.pelatih}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{stat.hadir}/{stat.totalAbsensi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{stat.izinSakit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{stat.alpa}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{stat.attendanceRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedTab === 'final' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ekskul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelatih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {finalResults.map((result: any) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <p className="font-medium text-gray-900">{result.nama}</p>
                      <p className="text-gray-500">{result.nis} - {result.kelas}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{result.ekskul}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{result.pelatih}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{result.semester}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {result.nilai} {result.predikat && `(${result.predikat})`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{result.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
