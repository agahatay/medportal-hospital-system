import { useState, useEffect } from 'react';
import { adminService, departmentService } from '../../api/dataService';
import DataTable from '../../components/shared/DataTable';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import Input from '../../components/shared/Input';
import { Plus, Trash2, Pencil, Clock, Search, X } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search & filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('');

    // Add/Edit modal
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null); // null = add mode
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

    const emptyForm = {
        first_name: '', last_name: '', email: '', password: '',
        specialization: '', department_id: '', phone: '', bio: ''
    };
    const [formData, setFormData] = useState(emptyForm);

    // Schedule modal
    const [scheduleDoctor, setScheduleDoctor] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleForm, setScheduleForm] = useState({ day_of_week: '1', start_time: '09:00', end_time: '17:00' });
    const [scheduleError, setScheduleError] = useState(null);
    const [scheduleSaving, setScheduleSaving] = useState(false);

    // Toast notification
    const [toast, setToast] = useState(null);
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [docs, depts] = await Promise.all([
                adminService.getDoctors(),
                departmentService.getAllDepartments()
            ]);
            setDoctors(docs);
            setDepartments(depts);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ── Add / Edit ──────────────────────────────────────────────────────
    const openAddModal = () => {
        setEditingDoctor(null);
        setFormData(emptyForm);
        setFormError(null);
        setIsFormOpen(true);
    };

    const openEditModal = (doctor) => {
        setEditingDoctor(doctor);
        setFormData({
            first_name: doctor.first_name || '',
            last_name: doctor.last_name || '',
            email: doctor.user_email || doctor.email || '',
            password: '',
            specialization: doctor.specialization || '',
            department_id: doctor.department_id || '',
            phone: doctor.phone || '',
            bio: doctor.bio || ''
        });
        setFormError(null);
        setIsFormOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError(null);
        setSaving(true);
        try {
            if (editingDoctor) {
                // Update
                await adminService.updateDoctor(editingDoctor.doctor_id, {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    specialization: formData.specialization,
                    department_id: formData.department_id || null,
                    phone: formData.phone,
                    bio: formData.bio
                });
                showToast('Doctor updated successfully');
            } else {
                // Create
                await adminService.createDoctor({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    password: formData.password,
                    specialization: formData.specialization,
                    department_id: formData.department_id || null,
                    phone: formData.phone,
                    bio: formData.bio
                });
                showToast('Doctor created successfully');
            }
            setIsFormOpen(false);
            await fetchData();
        } catch (err) {
            setFormError(err.message || 'Operation failed');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ──────────────────────────────────────────────────────────
    const handleDelete = async (doctor) => {
        if (!window.confirm(`Delete Dr. ${doctor.name}? This cannot be undone.`)) return;
        try {
            await adminService.deleteDoctor(doctor.doctor_id);
            showToast('Doctor deleted');
            await fetchData();
        } catch (err) {
            alert(err.message || 'Failed to delete doctor');
        }
    };

    // ── Schedule ────────────────────────────────────────────────────────
    const openScheduleModal = async (doctor) => {
        setScheduleDoctor(doctor);
        setScheduleError(null);
        setScheduleLoading(true);
        setScheduleForm({ day_of_week: '1', start_time: '09:00', end_time: '17:00' });
        try {
            const data = await adminService.getSchedules(doctor.doctor_id);
            setSchedules(data);
        } catch {
            setSchedules([]);
        } finally {
            setScheduleLoading(false);
        }
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        setScheduleError(null);
        setScheduleSaving(true);
        try {
            await adminService.createSchedule(scheduleDoctor.doctor_id, {
                day_of_week: parseInt(scheduleForm.day_of_week),
                start_time: scheduleForm.start_time,
                end_time: scheduleForm.end_time
            });
            const data = await adminService.getSchedules(scheduleDoctor.doctor_id);
            setSchedules(data);
            showToast('Schedule slot added');
        } catch (err) {
            setScheduleError(err.message || 'Failed to add schedule');
        } finally {
            setScheduleSaving(false);
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        try {
            await adminService.deleteSchedule(scheduleDoctor.doctor_id, scheduleId);
            setSchedules(prev => prev.filter(s => s.id !== scheduleId));
            showToast('Schedule slot removed');
        } catch (err) {
            alert(err.message || 'Failed to delete schedule');
        }
    };

    // ── Filtering ───────────────────────────────────────────────────────
    const filteredDoctors = doctors.filter(d => {
        const matchesSearch = !searchTerm ||
            d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = !filterDept || String(d.department_id) === filterDept;
        return matchesSearch && matchesDept;
    });

    // ── Table Columns ───────────────────────────────────────────────────
    const columns = [
        { header: 'ID', render: row => <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>#{row.doctor_id}</span> },
        {
            header: 'Doctor',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%', background: '#E0E7FF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#4F46E5', fontWeight: 'bold', flexShrink: 0, fontSize: '0.85rem'
                    }}>
                        {row.first_name?.charAt(0)}{row.last_name?.charAt(0)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{row.name}</span>
                        <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>{row.user_email || row.email}</span>
                    </div>
                </div>
            )
        },
        { header: 'Specialization', render: row => row.specialization || <span style={{ color: '#D1D5DB' }}>—</span> },
        { header: 'Department', render: row => row.department_name || <span style={{ color: '#D1D5DB' }}>—</span> },
        { header: 'Phone', render: row => row.phone || <span style={{ color: '#D1D5DB' }}>—</span> },
        {
            header: 'Created',
            render: row => row.created_at
                ? new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—'
        },
        {
            header: 'Actions',
            render: (row) => (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                        title="Edit"
                        onClick={(e) => { e.stopPropagation(); openEditModal(row); }}
                        style={actionBtnStyle('#EEF2FF', '#4F46E5')}
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        title="Set Schedule"
                        onClick={(e) => { e.stopPropagation(); openScheduleModal(row); }}
                        style={actionBtnStyle('#F0FDF4', '#16A34A')}
                    >
                        <Clock size={14} />
                    </button>
                    <button
                        title="Delete"
                        onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
                        style={actionBtnStyle('#FEF2F2', '#DC2626')}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    if (loading) return <div style={{ padding: '2rem' }}>Loading doctors...</div>;
    if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 100,
                    padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)',
                    background: toast.type === 'success' ? '#065F46' : '#991B1B',
                    color: 'white', fontWeight: 500, fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Manage Doctors</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                        {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} registered
                    </p>
                </div>
                <Button onClick={openAddModal}>
                    <Plus size={18} /> Add Doctor
                </Button>
            </div>

            {/* Search & Filter Bar */}
            <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search by name or specialization..."
                            style={{ paddingLeft: '2.25rem', margin: 0 }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="input"
                        style={{ margin: 0, maxWidth: 220 }}
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d.department_id} value={d.department_id}>{d.name}</option>
                        ))}
                    </select>
                    {(searchTerm || filterDept) && (
                        <button
                            onClick={() => { setSearchTerm(''); setFilterDept(''); }}
                            style={{ background: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
            </Card>

            {/* Doctors Table */}
            <DataTable columns={columns} data={filteredDoctors} />

            {/* ── Add / Edit Doctor Modal ──────────────────────────────── */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingDoctor ? `Edit Dr. ${editingDoctor.name}` : 'Add New Doctor'}
            >
                <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                        <Input
                            label="First Name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            required
                            placeholder="First name"
                        />
                        <Input
                            label="Last Name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            required
                            placeholder="Last name"
                        />
                    </div>

                    {!editingDoctor && (
                        <>
                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="doctor@medportal.com"
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder="Minimum 6 characters"
                            />
                        </>
                    )}

                    <Input
                        label="Specialization"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        placeholder="e.g. Cardiology"
                    />

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>
                            Department
                        </label>
                        <select
                            value={formData.department_id}
                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                            style={{
                                width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-md)', fontSize: '0.95rem', background: '#fff'
                            }}
                        >
                            <option value="">Select a department</option>
                            {departments.map(d => (
                                <option key={d.department_id} value={d.department_id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Phone (optional)"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+90 555 123 4567"
                    />

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Bio (optional)</label>
                        <textarea
                            className="input"
                            rows="3"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Brief description about the doctor..."
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    {formError && (
                        <div style={{ padding: '0.6rem 0.75rem', background: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {formError}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                        <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : editingDoctor ? 'Update Doctor' : 'Create Doctor'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* ── Schedule Modal ───────────────────────────────────────── */}
            <Modal
                isOpen={!!scheduleDoctor}
                onClose={() => setScheduleDoctor(null)}
                title={scheduleDoctor ? `Work Hours — Dr. ${scheduleDoctor.name}` : 'Schedule'}
            >
                {scheduleLoading ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Loading schedule...</p>
                ) : (
                    <>
                        {/* Current slots */}
                        {schedules.length > 0 ? (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Current Schedule
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {schedules.map(s => (
                                        <div key={s.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '0.6rem 0.75rem', background: '#F9FAFB',
                                            borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)'
                                        }}>
                                            <div>
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{DAY_NAMES[s.day_of_week]}</span>
                                                <span style={{ color: 'var(--text-secondary)', marginLeft: '0.75rem', fontSize: '0.85rem' }}>
                                                    {formatTime(s.start_time)} — {formatTime(s.end_time)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSchedule(s.id)}
                                                style={{ background: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.2rem' }}
                                                title="Remove"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                No schedule set. Add work hours below.
                            </p>
                        )}

                        {/* Add slot form */}
                        <form onSubmit={handleAddSchedule}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Add New Slot
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={miniLabel}>Day</label>
                                    <select
                                        className="input"
                                        style={{ margin: 0 }}
                                        value={scheduleForm.day_of_week}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: e.target.value })}
                                    >
                                        {DAY_NAMES.map((name, i) => (
                                            <option key={i} value={i}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={miniLabel}>Start Time</label>
                                    <input
                                        type="time"
                                        className="input"
                                        style={{ margin: 0 }}
                                        value={scheduleForm.start_time}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={miniLabel}>End Time</label>
                                    <input
                                        type="time"
                                        className="input"
                                        style={{ margin: 0 }}
                                        value={scheduleForm.end_time}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {scheduleError && (
                                <div style={{ padding: '0.5rem 0.75rem', background: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                                    {scheduleError}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <Button type="button" variant="outline" onClick={() => setScheduleDoctor(null)}>Close</Button>
                                <Button type="submit" disabled={scheduleSaving}>
                                    {scheduleSaving ? 'Adding...' : 'Add Slot'}
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </Modal>
        </div>
    );
};

// ── Helpers ─────────────────────────────────────────────────────────────

const actionBtnStyle = (bg, color) => ({
    width: 30, height: 30, borderRadius: 'var(--radius-md)',
    background: bg, color: color, border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'opacity 0.15s'
});

const miniLabel = {
    display: 'block', marginBottom: '0.3rem',
    fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-secondary)'
};

const formatTime = (t) => {
    if (!t) return '—';
    // t may be "HH:MM:SS" from MySQL — trim seconds
    return t.substring(0, 5);
};

export default AdminDoctors;
