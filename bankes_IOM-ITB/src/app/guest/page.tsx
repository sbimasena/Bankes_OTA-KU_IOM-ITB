import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-var min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-md md:p-8">
        <h1 className="text-xl font-bold sm:text-2xl">Mohon tunggu akun anda untuk diperiksa</h1>
        <h2 className="mb-8 mt-2 text-gray-600 text-sm sm:text-base">Anda akan mendapat akses ke halaman lainnya setelah akun anda disetujui</h2>
        <div className="flex gap-3">
          <Link href="/" className="inline-block py-2 px-5 rounded-full bg-var hover:bg-var/90 text-white text-sm sm:text-base">Home</Link>
          <Link href="/logout" className="inline-block py-2 px-5 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm sm:text-base">Keluar</Link>
        </div>
      </div>
    </div>
  );
}
