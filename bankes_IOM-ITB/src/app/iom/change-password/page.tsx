import { Card } from "@/components/ui/card"
import SidebarIOM from "@/app/components/layout/sidebariom"

export default function Upload() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-0 md:w-64 shrink-0">
        <SidebarIOM activeTab="password"/>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 my-4 mx-4 pt-16 md:pt-0 md:my-8 md:mr-8">
        <h1 className="text-2xl font-bold mb-6">Ganti Password</h1>

        <Card className="p-4 sm:p-6 md:p-8 w-full">
          <p>Coming Soon!</p>
        </Card>
      </div>
    </div>
  )
}
