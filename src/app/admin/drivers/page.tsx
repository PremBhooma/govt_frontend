"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import api from "@/lib/api"
import { Edit, Trash2 } from "lucide-react"

export default function DriversPage() {
    const [drivers, setDrivers] = useState<any[]>([])
    const [supervisors, setSupervisors] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [formData, setFormData] = useState({ name: "", phone: "", autoNumber: "", assignedSupervisor: "" })

    useEffect(() => {
        fetchDrivers()
        fetchSupervisors()
    }, [])

    const fetchDrivers = async () => {
        try {
            const res = await api.get('/admin/drivers')
            setDrivers(res.data)
        } catch (err) {
            toast.error("Failed to load drivers")
        }
    }

    const fetchSupervisors = async () => {
        try {
            const res = await api.get('/admin/supervisors')
            setSupervisors(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleEdit = (driver: any) => {
        setEditingId(driver._id)
        setFormData({
            name: driver.name,
            phone: driver.phone,
            autoNumber: driver.autoNumber,
            assignedSupervisor: driver.assignedSupervisor?._id || ""
        })
        setOpen(true)
    }

    const handleAdd = () => {
        setEditingId(null)
        setFormData({ name: "", phone: "", autoNumber: "", assignedSupervisor: "" })
        setOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this driver?")) return
        setLoading(true)
        try {
            await api.delete(`/admin/drivers/${id}`)
            toast.success("Driver deleted successfully")
            fetchDrivers()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Delete failed")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (editingId) {
                await api.put(`/admin/drivers/${editingId}`, formData)
                toast.success("Driver updated successfully")
            } else {
                await api.post('/admin/drivers', formData)
                toast.success("Driver created successfully")
            }
            setOpen(false)
            fetchDrivers()
            setFormData({ name: "", phone: "", autoNumber: "", assignedSupervisor: "" })
            setEditingId(null)
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Operation failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Auto Drivers</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAdd}>+ Add Driver</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Driver" : "Add New Driver"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Auto Number</Label>
                                <Input value={formData.autoNumber} onChange={e => setFormData({ ...formData, autoNumber: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Assign Supervisor</Label>
                                <Select value={formData.assignedSupervisor} onValueChange={(val) => setFormData({ ...formData, assignedSupervisor: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Supervisor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supervisors.map(s => (
                                            <SelectItem key={s._id} value={s._id}>{s.name} ({s.govtId})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : (editingId ? "Update" : "Create")}</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Drivers</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Auto #</TableHead>
                                <TableHead>Supervisor</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drivers.map((d) => (
                                <TableRow key={d._id}>
                                    <TableCell>{d.name}</TableCell>
                                    <TableCell>{d.phone}</TableCell>
                                    <TableCell>{d.autoNumber}</TableCell>
                                    <TableCell>{d.assignedSupervisor?.name || "Unassigned"}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(d)}>
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(d._id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {drivers.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No drivers found</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
