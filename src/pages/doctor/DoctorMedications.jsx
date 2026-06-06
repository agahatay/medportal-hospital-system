import { useState, useEffect } from 'react';
import { doctorDashboardService } from '../../api/dataService';
import Card from '../../components/shared/Card';

const DoctorMedications = () => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);

    useEffect(() => {
        doctorDashboardService.getMedications()
            .then(setMedications)
            .catch(() => setError('Failed to load medications.'))
            .finally(() => setLoading(false));
    }, []);

    const totalPrescribed = medications.reduce((sum, m) => sum + Number(m.prescription_count), 0);
    const mostUsed        = medications.find(m => Number(m.prescription_count) > 0);

    if (loading) return <div style={{ padding: '2rem' }}>Loading medications...</div>;
    if (error)   return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Medications</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    All medications and your prescribing frequency.
                </p>
            </div>

            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Medications</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{medications.length}</div>
                </div>
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Prescriptions Written</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--secondary)' }}>{totalPrescribed}</div>
                </div>
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Most Prescribed</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>
                        {mostUsed ? mostUsed.name : '—'}
                    </div>
                </div>
            </div>

            <Card title={`Medication List (${medications.length})`}>
                {medications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No medications found.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                                <th style={thStyle}>#</th>
                                <th style={thStyle}>Medication Name</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Times Prescribed</th>
                                <th style={{ ...thStyle, textAlign: 'right', paddingRight: '1.5rem' }}>Usage Bar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medications.map((med, idx) => {
                                const count   = Number(med.prescription_count);
                                const maxCount = Number(medications[0]?.prescription_count) || 1;
                                const pct     = Math.round((count / maxCount) * 100);
                                return (
                                    <tr key={med.medication_id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={tdStyle}>{med.medication_id}</td>
                                        <td style={{ ...tdStyle, fontWeight: count > 0 ? 600 : 400 }}>
                                            {med.name}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.15rem 0.6rem',
                                                borderRadius: '999px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                background: count > 0 ? '#EFF6FF' : '#F9FAFB',
                                                color: count > 0 ? '#1D4ED8' : '#9CA3AF'
                                            }}>
                                                {count}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, paddingRight: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <div style={{ flex: 1, maxWidth: 120, height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, background: count > 0 ? 'var(--primary)' : 'transparent', borderRadius: 4, transition: 'width 0.3s' }} />
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: 30, textAlign: 'right' }}>{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </Card>
        </div>
    );
};

const thStyle = {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const tdStyle = {
    padding: '0.75rem 1rem',
    fontSize: '0.925rem',
    color: 'var(--text-primary)'
};

export default DoctorMedications;
