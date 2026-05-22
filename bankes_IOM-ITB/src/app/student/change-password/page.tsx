import { Card } from "@/components/ui/card"
import SidebarMahasiswa from "@/app/components/layout/sidebarmahasiswa"

export default function Upload() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block w-64 shrink-0">
        <SidebarMahasiswa activeTab="password"/>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 my-4 mx-4 pt-16 md:pt-0 md:my-8 md:mr-8">
        <h1 className="text-2xl font-bold mb-6">Ganti Password</h1>

        <Card className="p-8 w-full">
          <p>Coming Soon!</p>
        </Card>
      </div>
    </div>
  )
}
