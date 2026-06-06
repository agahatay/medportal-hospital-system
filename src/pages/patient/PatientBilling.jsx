import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { patientBillingService } from '../../api/dataService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/shared/Card';
import PaymentModal from '../../components/shared/PaymentModal';

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

// ── Main Page ───────────────────────────────────────────────────────────────

const PatientBilling = () => {
    const { user }  = useAuth();
    const [bills,   setBills]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const [payBill, setPayBill] = useState(null);
    const [toast,   setToast]   = useState(null);

    useEffect(() => {
        patientBillingService.getMyBills()
            .then(setBills)
            .catch(err => setError(err?.message || 'Failed to load billing information.'))
            .finally(() => setLoading(false));
    }, []);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handlePaySuccess = (updatedBill) => {
        setBills(prev => prev.map(b => b.bill_id === updatedBill.bill_id ? updatedBill : b));
        setPayBill(null);
        showToast('success', `Bill #${updatedBill.bill_id} paid successfully.`);
    };

    const handlePayClose = () => {
        setPayBill(null);
    };

    const totalPaid    = bills.filter(b => b.payment_status === 'Paid').reduce((s, b) => s + Number(b.total_amount || 0), 0);
    const totalPending = bills.filter(b => b.payment_status === 'Pending').length;
    const totalFailed  = bills.filter(b => b.payment_status === 'Failed').length;

    if (loading) return <div style={{ padding: '2rem' }}>Loading billing…</div>;
    if (error)   return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

    const statCards = [
        { label: 'Total Paid',    value: `$${totalPaid.toFixed(2)}`, color: '#065F46', bg: '#D1FAE5' },
        { label: 'Pending Bills', value: totalPending,                color: '#92400E', bg: '#FEF3C7' },
        { label: 'Failed Bills',  value: totalFailed,                 color: '#991B1B', bg: '#FEE2E2' },
    ];

    return (
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 200,
                    padding: '0.8rem 1.2rem', borderRadius: '0.6rem',
                    background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                    color:      toast.type === 'success' ? '#166534' : '#991B1B',
                    border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.9rem', fontWeight: 500, maxWidth: 340,
                }}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>My Bills</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    View and pay your outstanding bills.
                </p>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {statCards.map(s => (
                    <div key={s.label} style={{
                        background: 'white', borderRadius: 'var(--radius-md)',
                        padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)'
                    }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{s.label}</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Bills list */}
            <Card title={`All Bills (${bills.length})`}>
                {bills.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No billing records found.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                                    {['Bill #','Appt. #','Doctor','Appt. Date','Amount','Status','Method','Billing Date','Payment Date','Action'].map(h => (
                                        <th key={h} style={{ padding: '0.7rem 0.9rem', textAlign: 'left', fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((b, i) => (
                                    <tr key={b.bill_id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                                        <td style={{ padding: '0.75rem 0.9rem', fontWeight: 600 }}>#{b.bill_id}</td>
                                        <td style={{ padding: '0.75rem 0.9rem', color: '#6B7280' }}>#{b.appointment_id}</td>
                                        <td style={{ padding: '0.75rem 0.9rem' }}>{b.doctor_name || '—'}</td>
                                        <td style={{ padding: '0.75rem 0.9rem', whiteSpace: 'nowrap' }}>{fmtDate(b.appointment_date)}</td>
                                        <td style={{ padding: '0.75rem 0.9rem', fontWeight: 600 }}>${Number(b.total_amount || 0).toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem 0.9rem' }}><StatusBadge status={b.payment_status} /></td>
                                        <td style={{ padding: '0.75rem 0.9rem' }}>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#6B7280' }}>
                                                {b.payment_method || 'Online'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.9rem', whiteSpace: 'nowrap' }}>{fmtDate(b.billing_date)}</td>
                                        <td style={{ padding: '0.75rem 0.9rem', whiteSpace: 'nowrap' }}>{fmtDateTime(b.payment_date)}</td>
                                        <td style={{ padding: '0.75rem 0.9rem' }}>
                                            {b.payment_status === 'Paid' ? (
                                                <span style={{ fontSize: '0.78rem', color: '#065F46', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <CheckCircle size={13} /> Paid
                                                </span>
                                            ) : b.payment_method === 'Cash' ? (
                                                <span style={{
                                                    fontSize: '0.75rem', fontWeight: 600,
                                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                    color: '#92400E', background: '#FEF3C7',
                                                    padding: '0.25rem 0.6rem', borderRadius: '0.375rem',
                                                    border: '1px solid #FDE68A', whiteSpace: 'nowrap'
                                                }}>
                                                    <Building2 size={12} /> Pay at Hospital
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setPayBill(b)}
                                                    style={{
                                                        padding: '0.3rem 0.8rem', borderRadius: '0.375rem',
                                                        background: b.payment_status === 'Failed' ? '#FEF2F2' : '#EFF6FF',
                                                        color: b.payment_status === 'Failed' ? '#DC2626' : '#2563EB',
                                                        border: `1px solid ${b.payment_status === 'Failed' ? '#FECACA' : '#BFDBFE'}`,
                                                        cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                                                        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem'
                                                    }}
                                                >
                                                    <CreditCard size={12} /> Pay Now
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Payment modal */}
            {payBill && (
                <PaymentModal
                    bill={payBill}
                    patientName={user?.name || user?.email || 'Patient'}
                    onClose={handlePayClose}
                    onSuccess={handlePaySuccess}
                />
            )}
        </div>
    );
};

export default PatientBilling;
