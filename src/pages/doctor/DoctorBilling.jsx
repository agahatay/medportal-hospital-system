import { useState, useEffect } from 'react';
import { doctorDashboardService } from '../../api/dataService';
import DataTable from '../../components/shared/DataTable';
import Card from '../../components/shared/Card';

const paymentBadgeStyle = (status) => {
    const base = { padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-block' };
    switch (status) {
        case 'Paid':    return { ...base, background: '#D1FAE5', color: '#065F46' };
        case 'Pending': return { ...base, background: '#FEF3C7', color: '#92400E' };
        case 'Failed':  return { ...base, background: '#FEE2E2', color: '#991B1B' };
        default:        return { ...base, background: '#F3F4F6', color: '#6B7280' };
    }
};

const DoctorBilling = () => {
    const [bills, setBills]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        doctorDashboardService.getBilling()
            .then(setBills)
            .catch(() => setError('Failed to load billing information.'))
            .finally(() => setLoading(false));
    }, []);

    // Summary stats
    const totalPaid    = bills.filter(b => b.payment_status === 'Paid').reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    const totalPending = bills.filter(b => b.payment_status === 'Pending').length;
    const totalFailed  = bills.filter(b => b.payment_status === 'Failed').length;

    const columns = [
        { header: 'Bill #',   render: row => `#${row.bill_id}` },
        { header: 'Appt. #',  render: row => `#${row.appointment_id}` },
        { header: 'Patient',  accessor: 'patient_name' },
        {
            header: 'Appt. Date',
            render: row => new Date(row.appointment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        },
        {
            header: 'Amount',
            render: row => row.total_amount != null ? `$${Number(row.total_amount).toFixed(2)}` : '—'
        },
        {
            header: 'Status',
            render: row => <span style={paymentBadgeStyle(row.payment_status)}>{row.payment_status || '—'}</span>
        },
        {
            header: 'Method',
            render: row => row.payment_method || 'Online'
        },
        {
            header: 'Billing Date',
            render: row => row.billing_date
                ? new Date(row.billing_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—'
        },
        {
            header: 'Payment Date',
            render: row => row.payment_date
                ? new Date(row.payment_date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '—'
        }
    ];

    if (loading) return <div style={{ padding: '2rem' }}>Loading billing...</div>;
    if (error)   return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Billing</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Payment records for your appointments.
                </p>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Revenue (Paid)</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#065F46' }}>${totalPaid.toFixed(2)}</div>
                </div>
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pending Bills</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#92400E' }}>{totalPending}</div>
                </div>
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Failed Payments</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#991B1B' }}>{totalFailed}</div>
                </div>
            </div>

            <Card title={`All Bills (${bills.length})`}>
                {bills.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No billing records found.
                    </div>
                ) : (
                    <DataTable columns={columns} data={bills} />
                )}
            </Card>
        </div>
    );
};

export default DoctorBilling;
