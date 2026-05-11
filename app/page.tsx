import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Sistem Absensi Ekstrakurikuler
          </h1>
          <p className="text-xl text-gray-600">
            Kelola absensi dan penilaian ekstrakurikuler dengan mudah
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Link href="/siswa" className="group">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-blue-500 text-5xl mb-4 text-center">👨‍🎓</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Portal Siswa
              </h2>
              <p className="text-gray-600 text-center">
                Pilih ekskul, absensi, dan lihat nilai
              </p>
            </div>
          </Link>

          <Link href="/pelatih" className="group">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-green-500 text-5xl mb-4 text-center">👨‍🏫</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Portal Pelatih
              </h2>
              <p className="text-gray-600 text-center">
                Kelola absensi dan input nilai siswa
              </p>
            </div>
          </Link>

          <Link href="/admin" className="group">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-purple-500 text-5xl mb-4 text-center">⚙️</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Portal Admin
              </h2>
              <p className="text-gray-600 text-center">
                Manajemen user dan ekstrakurikuler
              </p>
            </div>
          </Link>

          <Link href="/supervisor" className="group">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-yellow-500 text-5xl mb-4 text-center">📊</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                Portal Supervisor
              </h2>
              <p className="text-gray-600 text-center">
                Pantau skor absensi dan nilai akhir
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/login" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
