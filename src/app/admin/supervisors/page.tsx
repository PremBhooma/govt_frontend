"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import { Eye, Edit, Trash2 } from "lucide-react"

export default function SupervisorsPage() {
    const router = useRouter()
    const [supervisors, setSupervisors] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({ name: "", phone: "", password: "", govtId: "" })

    useEffect(() => {
        fetchSupervisors()
    }, [])

    const fetchSupervisors = async () => {
        try {
            const res = await api.get('/admin/supervisors')
            setSupervisors(res.data)
        } catch (err) {
            toast.error("Failed to load supervisors")
        }
    }

    const handleEdit = (supervisor: any) => {
        setEditingId(supervisor._id)
        setFormData({
            name: supervisor.name,
            phone: supervisor.phone,
            govtId: supervisor.govtId,
            password: "" // Leave blank to keep existing
        })
        setOpen(true)
    }

    const handleAdd = () => {
        setEditingId(null)
        setFormData({ name: "", phone: "", password: "", govtId: "" })
        setOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will also delete ALL assigned drivers.")) return
        setLoading(true)
        try {
            await api.delete(`/admin/supervisors/${id}`)
            toast.success("Supervisor and assigned drivers deleted")
            fetchSupervisors()
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
                await api.put(`/admin/supervisors/${editingId}`, formData)
                toast.success("Supervisor updated successfully")
            } else {
                await api.post('/admin/supervisors', formData)
                toast.success("Supervisor created successfully")
            }
            setOpen(false)
            fetchSupervisors()
            setFormData({ name: "", phone: "", password: "", govtId: "" })
            setEditingId(null)
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Operation failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Supervisors</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAdd}>+ Add Supervisor</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Supervisor" : "Add New Supervisor"}</DialogTitle>
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
                                <Label>Govt ID</Label>
                                <Input value={formData.govtId} onChange={e => setFormData({ ...formData, govtId: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Password {editingId && "(Leave blank to keep)"}</Label>
                                <Input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editingId} />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : (editingId ? "Update" : "Create")}</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Supervisors</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Govt ID</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supervisors.map((s) => (
                                <TableRow key={s._id}>
                                    <TableCell>{s.name}</TableCell>
                                    <TableCell>{s.phone}</TableCell>
                                    <TableCell>{s.govtId}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/supervisors/${s._id}`)}>
                                            <Eye className="h-4 w-4 text-green-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(s._id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {supervisors.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No supervisors found</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
