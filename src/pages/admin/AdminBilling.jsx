import { useState, useEffect, useCallback } from 'react';
import { adminBillingService } from '../../api/dataService';
import Card from '../../components/shared/Card';

// ── helpers ────────────────────────────────────────────────────────────────

const fmtDate = (v) =>
    v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (v) =>
    v ? new Date(v).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const BADGE = {
    Paid:    { bg: '#D1FAE5', color: '#065F46' },
    Pending: { bg: '#FEF3C7', color: '#92400E' },
    Failed:  { bg: '#FEE2E2', color: '#991B1B' },
};

const StatusBadge = ({ status }) => {
    const s = BADGE[status] || { bg: '#F3F4F6', color: '#6B7280' };
    return (
        <span style={{
            padding: '0.2rem 0.65rem', borderRadius: '999px',
            fontSize: '0.78rem', fontWeight: 600,
            background: s.bg, color: s.color, whiteSpace: 'nowrap'
        }}>
            {status || '—'}
        </span>
    );
};

const STATUS_OPTIONS  = ['', 'Paid', 'Pending', 'Failed'];
const METHOD_OPTIONS  = ['', 'Online', 'Cash'];

// ── Component ───────────────────────────────────────────────────────────────

const AdminBilling = () => {
    const [bills,     setBills]     = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState(null);
    const [updating,  setUpdating]  = useState(new Set());  // billIds being updated
    const [toast,     setToast]     = useState(null);

    // Filters
    const [filterStatus,        setFilterStatus]        = useState('');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
    const [filterPatientName,   setFilterPatientName]   = useState('');
    const [filterDoctorName,    setFilterDoctorName]    = useState('');

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchBills = useCallback((params = {}) => {
        setLoading(true);
        adminBillingService.getAllBills(params)
            .then(setBills)
            .catch(err => setError(err?.message || 'Failed to load billing records.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchBills(); }, [fetchBills]);

    const handleFilter = (e) => {
        e.preventDefault();
        fetchBills({
            status:          filterStatus          || undefined,
            payment_method:  filterPaymentMethod   || undefined,
            patient_name:    filterPatientName     || undefined,
            doctor_name:     filterDoctorName      || undefined,
        });
    };

    const handleReset = () => {
        setFilterStatus('');
        setFilterPaymentMethod('');
        setFilterPatientName('');
        setFilterDoctorName('');
        fetchBills();
    };

    const handleStatusChange = async (billId, newStatus) => {
        setUpdating(prev => new Set([...prev, billId]));
        try {
            const updated = await adminBillingService.updateBillStatus(billId, newStatus);
            setBills(prev => prev.map(b => b.bill_id === updated.bill_id ? updated : b));
            showToast('success', `Bill #${billId} updated to ${newStatus}.`);
        } catch (err) {
            showToast('error', err?.message || 'Failed to update status.');
        } finally {
            setUpdating(prev => { const n = new Set(prev); n.delete(billId); return n; });
        }
    };

    // Derived stats from current data
    const totalBills    = bills.length;
    const paidBills     = bills.filter(b => b.payment_status === 'Paid');
    const pendingBills  = bills.filter(b => b.payment_status === 'Pending');
    const failedBills   = bills.filter(b => b.payment_status === 'Failed');
    const totalRevenue  = paidBills.reduce((s, b) => s + Number(b.total_amount || 0), 0);

    const statCards = [
        { label: 'Total Bills',    value: totalBills,                   color: '#1D4ED8', bg: '#EFF6FF' },
        { label: 'Paid Bills',     value: paidBills.length,             color: '#065F46', bg: '#D1FAE5' },
        { label: 'Pending Bills',  value: pendingBills.length,          color: '#92400E', bg: '#FEF3C7' },
        { label: 'Failed Bills',   value: failedBills.length,           color: '#991B1B', bg: '#FEE2E2' },
        { label: 'Total Revenue',  value: `$${totalRevenue.toFixed(2)}`, color: '#065F46', bg: '#D1FAE5' },
    ];

    const inputStyle = {
        padding: '0.45rem 0.75rem', border: '1px solid #E5E7EB',
        borderRadius: '0.375rem', fontSize: '0.875rem', fontFamily: 'inherit',
    };

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 200,
                    padding: '0.8rem 1.2rem', borderRadius: '0.6rem',
                    background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                    color:      toast.type === 'success' ? '#166534' : '#991B1B',
                    border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    fontSize: '0.875rem', fontWeight: 500, maxWidth: 340,
                }}>
                    {toast.msg}
                </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Billing Management</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    All payment records across the system.
                </p>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {statCards.map(s => (
                    <div key={s.label} style={{
                        background: 'white', borderRadius: 'var(--radius-md)',
                        padding: '1.1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)'
                    }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>{s.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <Card title="Filters">
                <form onSubmit={handleFilter} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#6B7280', marginBottom: '0.25rem' }}>Status</label>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inputStyle}>
                            <option value="">All</option>
                            {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#6B7280', marginBottom: '0.25rem' }}>Method</label>
                        <select value={filterPaymentMethod} onChange={e => setFilterPaymentMethod(e.target.value)} style={inputStyle}>
                            <option value="">All</option>
                            {METHOD_OPTIONS.filter(Boolean).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#6B7280', marginBottom: '0.25rem' }}>Patient Name</label>
                        <input value={filterPatientName} onChange={e => setFilterPatientName(e.target.value)} placeholder="Search patient…" style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#6B7280', marginBottom: '0.25rem' }}>Doctor Name</label>
                        <input value={filterDoctorName} onChange={e => setFilterDoctorName(e.target.value)} placeholder="Search doctor…" style={inputStyle} />
                    </div>
                    <button type="submit" style={{
                        padding: '0.45rem 1rem', borderRadius: '0.375rem',
                        background: '#2563EB', color: 'white', border: 'none',
                        fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
                    }}>Apply</button>
                    <button type="button" onClick={handleReset} style={{
                        padding: '0.45rem 1rem', borderRadius: '0.375rem',
                        background: '#F3F4F6', color: '#374151',
                        border: '1px solid #E5E7EB', fontSize: '0.875rem', cursor: 'pointer'
                    }}>Reset</button>
                </form>
            </Card>

            {/* Table */}
            <div style={{ marginTop: '1.25rem' }}>
                <Card title={`All Bills (${bills.length})`}>
                    {loading ? (
                        <div style={{ padding: '2rem' }}>Loading…</div>
                    ) : error ? (
                        <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>
                    ) : bills.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No billing records found.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                                        {['Bill #','Patient','Doctor','Appt. #','Appt. Date','Amount','Status','Method','Billing Date','Payment Date','Change Status'].map(h => (
                                            <th key={h} style={{ padding: '0.7rem 0.9rem', textAlign: 'left', fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.map((b, i) => (
                                        <tr key={b.bill_id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                                            <td style={{ padding: '0.75rem 0.9rem', fontWeight: 600 }}>#{b.bill_id}</td>
                                            <td style={{ padding: '0.75rem 0.9rem' }}>{b.patient_name || '—'}</td>
                                            <td style={{ padding: '0.75rem 0.9rem' }}>{b.doctor_name || '—'}</td>
                                            <td style={{ padding: '0.75rem 0.9rem', color: '#6B7280' }}>#{b.appointment_id}</td>
                                            <td style={{ padding: '0.75rem 0.9rem', whiteSpace: 'nowrap' }}>{fmtDate(b.appointment_date)}</td>
                                            <td style={{ padding: '0.75rem 0.9rem', fontWeight: 600 }}>${Number(b.total_amount || 0).toFixed(2)}</td>
                                            <td style={{ padding: '0.75rem 0.9rem' }}><StatusBadge status={b.payment_status} /></td>
                                            <td style={{ padding: '0.75rem 0.9rem' }}>
                                                <span style={{
                                                    fontSize: '0.78rem', fontWeight: 500,
                                                    color: b.payment_method === 'Cash' ? '#92400E' : '#1D4ED8',
                                                    background: b.payment_method === 'Cash' ? '#FEF3C7' : '#EFF6FF',
                                                    padding: '0.2rem 0.55rem', borderRadius: '999px',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {b.payment_method || 'Online'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 0.9rem', whiteSpace: 'nowrap' }}>{fmtDate(b.billing_date)}</td>
                                            <td style={{ padding: '0.75rem 0.9rem', whiteSpace: 'nowrap' }}>{fmtDateTime(b.payment_date)}</td>
                                            <td style={{ padding: '0.75rem 0.9rem' }}>
                                                <select
                                                    value={b.payment_status}
                                                    disabled={updating.has(b.bill_id)}
                                                    onChange={e => handleStatusChange(b.bill_id, e.target.value)}
                                                    style={{
                                                        ...inputStyle,
                                                        fontSize: '0.78rem',
                                                        opacity: updating.has(b.bill_id) ? 0.5 : 1,
                                                        cursor: updating.has(b.bill_id) ? 'not-allowed' : 'pointer',
                                                    }}
                                                >
                                                    {STATUS_OPTIONS.filter(Boolean).map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AdminBilling;
