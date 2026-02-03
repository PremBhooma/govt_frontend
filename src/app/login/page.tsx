"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import api from "@/lib/api"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [username, setUsername] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr)
                if (user.role === 'admin') router.push('/admin')
                else if (user.role === 'supervisor') router.push('/supervisor')
            } catch (e) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            }
        }
    }, [router])

    const handleLogin = async (role: "admin" | "supervisor") => {
        setLoading(true)
        try {
            // We use the same login endpoint for both, but we can verify role after
            // Or if we had separate endpoints. 
            // Backend text: POST /api/auth/login. Returns { token, user: { role } }
            const res = await api.post('/auth/login', { phone, password })
            const { token, user } = res.data

            if (user.role !== role && role === 'admin') {
                // If trying to log in as admin but user is not admin
                toast.error("Access denied. Not an admin account.")
                setLoading(false)
                return
            }

            // Save token
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            toast.success(`Welcome back, ${user.name}`)

            if (user.role === 'admin') {
                router.push('/admin')
            } else {
                router.push('/supervisor')
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Attendance Portal</CardTitle>
                    <CardDescription>Secure login for Admins & Supervisors</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="supervisor" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="supervisor">Supervisor</TabsTrigger>
                            <TabsTrigger value="admin">Admin</TabsTrigger>
                        </TabsList>

                        <TabsContent value="supervisor">
                            <form onSubmit={(e) => { e.preventDefault(); handleLogin('supervisor') }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="s-phone">Phone Number</Label>
                                    <Input id="s-phone" placeholder="Enter phone number" value={phone} onChange={e => setPhone(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="s-password">Password</Label>
                                    <Input id="s-password" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Logging in..." : "Login as Supervisor"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="admin">
                            <form onSubmit={(e) => { e.preventDefault(); handleLogin('admin') }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="a-phone">Phone Number</Label>
                                    <Input id="a-phone" placeholder="Enter admin phone" value={phone} onChange={e => setPhone(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="a-password">Password</Label>
                                    <Input id="a-password" type="password" placeholder="Enter admin password" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" className="w-full" variant="destructive" disabled={loading}>
                                    {loading ? "Logging in..." : "Login as Admin"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
