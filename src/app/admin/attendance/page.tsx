"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"
import { format } from "date-fns"

export default function AttendancePage() {
    const [attendance, setAttendance] = useState<any[]>([])
    const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAttendance()
    }, [filterDate, filterStatus])

    const fetchAttendance = async () => {
        setLoading(true)
        try {
            let url = `/admin/attendance?date=${filterDate}`
            if (filterStatus !== 'all') url += `&status=${filterStatus}`

            const res = await api.get(url)
            setAttendance(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Attendance Records</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full sm:w-auto"
                    />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead>Auto #</TableHead>
                                <TableHead>Supervisor</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && attendance.length === 0 ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                attendance.map((record: any) => (
                                    <TableRow key={record._id}>
                                        <TableCell>{format(new Date(record.date), 'dd MMM yyyy')}</TableCell>
                                        <TableCell>{record.driverId?.name || "Unknown"}</TableCell>
                                        <TableCell>{record.driverId?.autoNumber || "N/A"}</TableCell>
                                        <TableCell>{record.supervisorId?.name || "Unknown"}</TableCell>
                                        <TableCell>
                                            <Badge variant={record.status === 'Present' ? 'default' : 'destructive'}>
                                                {record.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {!loading && attendance.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No records found</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
