"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import api from "@/lib/api"
import { format } from "date-fns"
import { Search, User, Calendar as CalendarIcon, Check, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function SupervisorDashboard() {
    const [drivers, setDrivers] = useState<any[]>([])
    const [filteredDrivers, setFilteredDrivers] = useState<any[]>([])
    const [search, setSearch] = useState("")

    // Selection State
    const [selectedDriver, setSelectedDriver] = useState<any | null>(null)
    const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])

    // Calendar & Marking State
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [loadingMark, setLoadingMark] = useState(false)

    useEffect(() => {
        fetchDrivers()
    }, [])

    useEffect(() => {
        if (!search) {
            setFilteredDrivers(drivers)
        } else {
            const lower = search.toLowerCase()
            setFilteredDrivers(drivers.filter(d =>
                d.name.toLowerCase().includes(lower) ||
                d.autoNumber.toLowerCase().includes(lower)
            ))
        }
    }, [search, drivers])

    useEffect(() => {
        if (selectedDriver) {
            fetchHistory(selectedDriver._id)
        }
    }, [selectedDriver])

    const fetchDrivers = async () => {
        try {
            const res = await api.get('/supervisor/drivers')
            setDrivers(res.data)
            setFilteredDrivers(res.data)
        } catch (err) {
            toast.error("Failed to load drivers")
        }
    }

    const fetchHistory = async (driverId: string) => {
        try {
            const res = await api.get(`/supervisor/attendance-history/${driverId}`)
            setAttendanceHistory(res.data)
        } catch (err) {
            console.error("Failed to load history")
        }
    }

    const handleDateSelect = (date: Date | undefined) => {
        if (!date || !selectedDriver) return
        setSelectedDate(date)
        setIsDialogOpen(true)
    }

    const markAttendance = async (status: 'Present' | 'Absent') => {
        if (!selectedDriver || !selectedDate) return
        setLoadingMark(true)
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd')
            await api.post('/supervisor/attendance', {
                driverId: selectedDriver._id,
                date: dateStr,
                status
            })
            toast.success(`Marked ${status} for ${dateStr}`)
            setIsDialogOpen(false)
            fetchHistory(selectedDriver._id)
        } catch (err: any) {
            toast.error("Failed to mark attendance")
        } finally {
            setLoadingMark(false)
        }
    }

    // Helper to get status modifiers for Calendar
    const getModifiers = () => {
        const presentDates: Date[] = []
        const absentDates: Date[] = []

        attendanceHistory.forEach(record => {
            const d = new Date(record.date)
            // Fix timezone offset issues roughly by checking string match or using UTC
            // Assuming record.date is ISO.
            if (record.status === 'Present') presentDates.push(d)
            if (record.status === 'Absent') absentDates.push(d)
        })

        return { present: presentDates, absent: absentDates }
    }

    return (
        <div className="h-[calc(100vh-80px)] md:grid md:grid-cols-12 gap-6 p-1">
            {/* Sidebar / List */}
            <div className={`md:col-span-4 lg:col-span-3 flex flex-col gap-4 h-full ${selectedDriver ? 'hidden md:flex' : 'flex'}`}>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search drivers..."
                        className="pl-8"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {filteredDrivers.map(d => (
                        <Card
                            key={d._id}
                            className={cn("cursor-pointer transition hover:bg-accent/50", selectedDriver?._id === d._id && "border-primary bg-accent/20")}
                            onClick={() => setSelectedDriver(d)}
                        >
                            <CardContent className="p-3 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold">{d.name}</p>
                                    <p className="text-xs text-muted-foreground">{d.autoNumber}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredDrivers.length === 0 && <p className="text-center text-muted-foreground py-8">No drivers found</p>}
                </div>
            </div>

            {/* Main Content / Calendar */}
            <div className={`md:col-span-8 lg:col-span-9 h-full flex flex-col ${!selectedDriver ? 'hidden md:flex' : 'flex'}`}>
                {!selectedDriver ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <User className="h-12 w-12 mb-2 opacity-20" />
                        <p>Select a driver to view attendance</p>
                    </div>
                ) : (
                    <Card className="flex-1 flex flex-col border-none shadow-none md:border md:shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="md:hidden -ml-2 h-8 w-8" onClick={() => setSelectedDriver(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                    {selectedDriver.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground ml-0 md:ml-0">{selectedDriver.autoNumber} • {selectedDriver.phone}</p>
                            </div>
                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Present</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Absent</div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-6 bg-accent/5">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                className="rounded-md border bg-card shadow p-4 scale-110 md:scale-125 origin-center"
                                modifiers={getModifiers()}
                                modifiersClassNames={{
                                    present: "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 font-bold",
                                    absent: "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 font-bold"
                                }}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Marking Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mark Attendance</DialogTitle>
                        <DialogDescription>Select status for the selected date.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-lg font-medium">
                                {selectedDate ? format(selectedDate, "PPP") : ""}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                size="lg"
                                className="bg-green-600 hover:bg-green-700 gap-2 h-20 text-lg"
                                onClick={() => markAttendance('Present')}
                                disabled={loadingMark}
                            >
                                <Check className="h-6 w-6" /> Present
                            </Button>
                            <Button
                                size="lg"
                                variant="destructive"
                                className="gap-2 h-20 text-lg"
                                onClick={() => markAttendance('Absent')}
                                disabled={loadingMark}
                            >
                                <X className="h-6 w-6" /> Absent
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
