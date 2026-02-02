"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function SupervisorLayout({
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
        // Supervisors and Admins can access? Usually strict role check.
        if (parsed.role !== 'supervisor' && parsed.role !== 'admin') {
            // if admin wants to see supervisor view, maybe allow? but separate portals usually imply separation.
            // User request: "Supervisor... Can view only the Auto Drivers assigned to them".
            // If admin logs in here, they might not have "assigned drivers".
            // So restrict to supervisor.
            if (parsed.role !== 'supervisor') {
                router.push('/login')
            }
        }
        setUser(parsed)
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h1 className="text-lg font-bold">Supervisor Portal</h1>
                    <p className="text-sm text-gray-500">Welcome, {user.name}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut size={16} className="mr-2" /> Logout
                </Button>
            </header>
            <main className="p-4 max-w-3xl mx-auto">
                {children}
            </main>
        </div>
    )
}
