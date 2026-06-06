import { useState, useEffect } from 'react';
import { doctorService } from '../../api/dataService';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { Plus, Trash2 } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DoctorScheduleManager = () => {
    const [doctorId,  setDoctorId]  = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState(null);

    const [formData, setFormData] = useState({
        day_of_week: '1',
        start_time:  '09:00',
        end_time:    '17:00'
    });
    const [formError,  setFormError]  = useState(null);
    const [saving,     setSaving]     = useState(false);

    // Fetch doctor's own profile to get their doctors.id
    useEffect(() => {
        const init = async () => {
            try {
                const profile = await doctorService.getMyProfile();
                setDoctorId(profile.id);
                const data = await doctorService.getSchedules(profile.id);
                setSchedules(data);
            } catch (err) {
                setError('Failed to load schedule data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!formData.start_time || !formData.end_time) {
            setFormError('Start time and end time are required');
            return;
        }
        if (formData.start_time >= formData.end_time) {
            setFormError('End time must be later than start time');
            return;
        }

        setSaving(true);
        try {
            await doctorService.createSchedule(doctorId, {
                day_of_week: parseInt(formData.day_of_week),
                start_time:  formData.start_time + ':00',
                end_time:    formData.end_time   + ':00'
            });
            const updated = await doctorService.getSchedules(doctorId);
            setSchedules(updated);
            setFormData({ day_of_week: '1', start_time: '09:00', end_time: '17:00' });
        } catch (err) {
            setFormError(err.message || 'Failed to save schedule');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (scheduleId) => {
        if (!window.confirm('Remove this schedule entry?')) return;
        try {
            await doctorService.deleteSchedule(doctorId, scheduleId);
            setSchedules(prev => prev.filter(s => s.id !== scheduleId));
        } catch (err) {
            alert(err.message || 'Failed to delete schedule');
        }
    };

    // Days that already have a schedule configured
    const scheduledDays = new Set(schedules.map(s => s.day_of_week));

    if (loading) return <div>Loading schedule...</div>;
    if (error)   return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Working Hours</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Define which days you work and your start / end times. Patients can only book
                    appointments within these hours.
                </p>
            </div>

            {/* Add schedule form */}
            <Card title="Add Working Day" style={{ marginBottom: '1.5rem' }}>
                <form onSubmit={handleAdd}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>
                                Day
                            </label>
                            <select
                                value={formData.day_of_week}
                                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.6rem 0.75rem',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)', fontSize: '0.95rem', background: '#fff'
                                }}
                            >
                                {DAY_NAMES.map((name, idx) => (
                                    <option key={idx} value={idx} disabled={scheduledDays.has(idx)}>
                                        {name}{scheduledDays.has(idx) ? ' (already set)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>
                                Start Time
                            </label>
                            <input
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.6rem 0.75rem',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)', fontSize: '0.95rem'
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>
                                End Time
                            </label>
                            <input
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.6rem 0.75rem',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)', fontSize: '0.95rem'
                                }}
                                required
                            />
                        </div>
                    </div>

                    {formError && (
                        <p style={{ color: '#DC2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{formError}</p>
                    )}

                    <Button type="submit" disabled={saving}>
                        <Plus size={18} /> {saving ? 'Saving...' : 'Add Working Day'}
                    </Button>
                </form>
            </Card>

            {/* Current schedule */}
            <Card title="Current Schedule">
                {schedules.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No working hours configured yet. Add at least one day above.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {schedules
                            .sort((a, b) => a.day_of_week - b.day_of_week)
                            .map(s => (
                                <div
                                    key={s.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        background: '#F9FAFB',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-light)'
                                    }}
                                >
                                    <div>
                                        <span style={{ fontWeight: 600 }}>{DAY_NAMES[s.day_of_week]}</span>
                                        <span style={{ color: 'var(--text-secondary)', marginLeft: '1.5rem', fontSize: '0.9rem' }}>
                                            {s.start_time.slice(0, 5)} → {s.end_time.slice(0, 5)}
                                        </span>
                                    </div>
                                    <Button
                                        className="btn-danger"
                                        style={{ padding: '0.25rem 0.5rem' }}
                                        onClick={() => handleDelete(s.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))
                        }
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DoctorScheduleManager;
