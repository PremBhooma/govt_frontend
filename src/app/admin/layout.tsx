"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, Users, UserPlus, LogOut, BarChart3 } from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        if (!token || !userData) {
            router.push('/login')
            return
        }
        const parsed = JSON.parse(userData)
        if (parsed.role !== 'admin') {
            router.push('/login') // or unauthorized page
        }
        setUser(parsed)
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    if (!user) return null // or loading spinner

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r hidden md:flex flex-col fixed h-full z-20">
                <div className="p-6 border-b h-16 flex items-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Admin Portal
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavLinks handleLogout={handleLogout} />
                </nav>
            </aside>

            {/* Mobile Header & Content Wrapper */}
            <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
                <header className="md:hidden h-16 bg-white dark:bg-gray-800 border-b flex items-center px-4 justify-between sticky top-0 z-30">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Admin Portal
                    </h1>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu size={24} />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <div className="p-6 border-b h-16 flex items-center">
                                <SheetTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Admin Portal
                                </SheetTitle>
                                <SheetDescription className="sr-only">
                                    Navigation menu for the Admin Portal
                                </SheetDescription>
                            </div>
                            <nav className="flex-1 p-4 space-y-2">
                                <NavLinks handleLogout={handleLogout} />
                            </nav>
                        </SheetContent>
                    </Sheet>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

function NavLinks({ handleLogout }: { handleLogout: () => void }) {
    return (
        <>
            <div className="flex flex-col gap-2">
                <Link href="/admin">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Button>
                </Link>
                <Link href="/admin/supervisors">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                        <Users size={20} />
                        Supervisors
                    </Button>
                </Link>
                <Link href="/admin/drivers">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                        <UserPlus size={20} />
                        Drivers
                    </Button>
                </Link>
                <Link href="/admin/attendance">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                        <BarChart3 size={20} />
                        Attendance
                    </Button>
                </Link>
            </div>
            <div className="pt-4 mt-auto">
                <Button variant="outline" className="w-full gap-2 text-red-500 hover:text-red-600" onClick={handleLogout}>
                    <LogOut size={20} />
                    Logout
                </Button>
            </div>
        </>
    )
}
