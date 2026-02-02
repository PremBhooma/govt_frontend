"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/api"
import { format } from "date-fns"

export default function AttendancePage() {
    const [attendance, setAttendance] = useState<any[]>([])
    const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [filterStatus, setFilterStatus] = useState<string>("all")

    useEffect(() => {
        fetchAttendance()
    }, [filterDate, filterStatus])

    const fetchAttendance = async () => {
        try {
            let url = `/admin/attendance?date=${filterDate}`
            if (filterStatus !== 'all') url += `&status=${filterStatus}`

            const res = await api.get(url)
            setAttendance(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Attendance Records</h2>
                <div className="flex gap-2">
                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-auto"
                    />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[150px]">
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
                <CardContent className="pt-6">
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
                            {attendance.map((rec) => (
                                <TableRow key={rec._id}>
                                    <TableCell>{format(new Date(rec.date), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>{rec.driverId?.name || "Unknown"}</TableCell>
                                    <TableCell>{rec.driverId?.autoNumber || "N/A"}</TableCell>
                                    <TableCell>{rec.supervisorId?.name || "Unknown"}</TableCell>
                                    <TableCell>
                                        <Badge variant={rec.status === 'Present' ? 'default' : 'destructive'}>
                                            {rec.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {attendance.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No records found for this date</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
