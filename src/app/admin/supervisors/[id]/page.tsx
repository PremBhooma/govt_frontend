"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import api from "@/lib/api"
import { User, Phone, IdCard, Users, Calendar as CalendarIcon, ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export default function SupervisorDetailPage() {
    const params = useParams()
    const id = params.id as string

    const [supervisor, setSupervisor] = useState<any>(null)
    const [drivers, setDrivers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Attendance Tab
    const [selectedDriverId, setSelectedDriverId] = useState<string>("")
    const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])

    useEffect(() => {
        if (id) {
            fetchData()
        }
    }, [id])

    useEffect(() => {
        if (selectedDriverId) {
            fetchHistory(selectedDriverId)
        }
    }, [selectedDriverId])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch Supervisor Details
            const supRes = await api.get(`/admin/supervisors/${id}`)
            setSupervisor(supRes.data)

            // Fetch Drivers - We get all and filter? Or do we need a specific endpoint?
            // "Allocated Drivers"
            // The /admin/drivers endpoint returns populated assignedSupervisor.
            // We can fetch all and filter client side for now as dataset is small, 
            // or better, use a query param on /admin/drivers?
            // Actually I should have used query param.
            // For now, client side filter (less efficient but quick given current routes)
            const driverRes = await api.get('/admin/drivers')
            const assigned = driverRes.data.filter((d: any) => d.assignedSupervisor?._id === id)
            setDrivers(assigned)

            if (assigned.length > 0) {
                setSelectedDriverId(assigned[0]._id)
            }

        } catch (err) {
            toast.error("Failed to load details")
        } finally {
            setLoading(false)
        }
    }

    const fetchHistory = async (driverId: string) => {
        try {
            const res = await api.get(`/admin/attendance-history/${driverId}`)
            setAttendanceHistory(res.data)
        } catch (err) {
            console.error("Failed to load history")
        }
    }

    const getModifiers = () => {
        const presentDates: Date[] = []
        const absentDates: Date[] = []

        attendanceHistory.forEach(record => {
            const d = new Date(record.date)
            if (record.status === 'Present') presentDates.push(d)
            if (record.status === 'Absent') absentDates.push(d)
        })

        return { present: presentDates, absent: absentDates }
    }


    if (loading) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" disabled>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Supervisors
                </Button>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-[200px] mb-2" />
                        <Skeleton className="h-4 w-[150px]" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full max-w-[300px]" />
                        <Skeleton className="h-4 w-full max-w-[250px]" />
                    </CardContent>
                </Card>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-[300px]" />
                    <Skeleton className="h-[200px] w-full" />
                </div>
            </div>
        )
    }

    if (!supervisor) return <div>Supervisor not found</div>

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{supervisor.name}</h2>
                <p className="text-muted-foreground">Supervisor Details & Management</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="w-full justify-start flex-nowrap md:w-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="drivers">Allocated Drivers</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance View</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <User className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                    <p className="text-lg font-bold">{supervisor.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <Phone className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                                    <p className="text-lg font-bold">{supervisor.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <IdCard className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Government ID</p>
                                    <p className="text-lg font-bold">{supervisor.govtId || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <Users className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Allocated Drivers</p>
                                    <p className="text-lg font-bold">{drivers.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="drivers">
                    <Card>
                        <CardHeader>
                            <CardTitle>Allocated Drivers</CardTitle>
                            <CardDescription>Drivers assigned to this supervisor.</CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Auto Number</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {drivers.map(d => (
                                        <TableRow key={d._id}>
                                            <TableCell>{d.name}</TableCell>
                                            <TableCell>{d.phone}</TableCell>
                                            <TableCell>{d.autoNumber}</TableCell>
                                        </TableRow>
                                    ))}
                                    {drivers.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No drivers allocated</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance">
                    <Card className="border-none shadow-none p-6">
                        <CardHeader className="px-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Attendance Insights</CardTitle>
                                    <CardDescription>Comprehensive view of driver attendance</CardDescription>
                                </div>
                                <div className="w-full md:w-[300px]">
                                    <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a driver" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {drivers.map(d => (
                                                <SelectItem key={d._id} value={d._id}>{d.name} ({d.autoNumber})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="px-0 space-y-6">
                            {selectedDriverId && (
                                <>
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <Card >
                                            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                                <p className="text-sm font-medium text-muted-foreground">Total Days</p>
                                                <p className="text-3xl font-bold">{attendanceHistory.length}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="!p-0 flex flex-col items-center justify-center text-center bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30">
                                            <CardContent>
                                                <p className="text-sm font-medium text-green-600 dark:text-green-400">Present</p>
                                                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                                                    {attendanceHistory.filter(r => r.status === 'Present').length}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card className="flex flex-col items-center justify-center !p-0 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-center">
                                            <CardContent>
                                                <p className="text-sm font-medium text-red-600 dark:text-red-400">Absent</p>
                                                <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                                                    {attendanceHistory.filter(r => r.status === 'Absent').length}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                                                <p className="text-3xl font-bold">
                                                    {attendanceHistory.length > 0
                                                        ? Math.round((attendanceHistory.filter(r => r.status === 'Present').length / attendanceHistory.length) * 100)
                                                        : 0}%
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Calendar Section */}
                                    <div className="flex justify-center mt-8">
                                        <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4 max-w-fit mx-auto">
                                            <div className="flex items-center justify-center gap-6 text-sm mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                                                    <span className="font-medium">Present</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                                                    <span className="font-medium">Absent</span>
                                                </div>
                                            </div>

                                            <div className="rounded-lg border bg-background p-2">
                                                <Calendar
                                                    mode="single"
                                                    className="rounded-md"
                                                    classNames={{
                                                        head_cell: "w-12 font-normal text-[0.9rem] text-muted-foreground",
                                                        cell: "h-12 w-12 text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                        day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors",
                                                    }}
                                                    modifiers={getModifiers()}
                                                    modifiersClassNames={{
                                                        present: "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 font-bold hover:text-green-800",
                                                        absent: "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 font-bold hover:text-red-800"
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {!selectedDriverId && drivers.length > 0 && (
                                <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                                    <Users className="h-12 w-12 mb-4 opacity-50" />
                                    <p>Select a driver to view their attendance metrics</p>
                                </div>
                            )}

                            {drivers.length === 0 && (
                                <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                    No drivers allocated to this supervisor.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
