import { useState } from 'react';
import { CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react';
import { patientBillingService } from '../../api/dataService';

const fmtCardNumber = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
};

const fmtExpiry = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
};

const EMPTY_CARD = { name: '', number: '', expiry: '', cvv: '' };

const validateCard = (form, amount) => {
    const errs = {};
    if (!form.name.trim())                              errs.name   = 'Cardholder name is required';
    const digits = form.number.replace(/\s/g, '');
    if (!/^\d{16}$/.test(digits))                      errs.number = 'Card number must be exactly 16 digits';
    if (!form.expiry.trim())                            errs.expiry = 'Expiry date is required';
    else if (!/^\d{2}\/\d{2}$/.test(form.expiry))     errs.expiry = 'Use MM/YY format';
    if (!/^\d{3}$/.test(form.cvv))                     errs.cvv    = 'CVV must be exactly 3 digits';
    if (!amount || Number(amount) <= 0)                 errs.amount = 'Amount must be greater than 0';
    return errs;
};

// Props: bill, patientName, onClose, onSuccess(updatedBill)
const PaymentModal = ({ bill, patientName, onClose, onSuccess }) => {
    const [card,       setCard]       = useState(EMPTY_CARD);
    const [errors,     setErrors]     = useState({});
    const [processing, setProcessing] = useState(false);
    const [result,     setResult]     = useState(null); // { ok, msg }

    const setField = (key, value) => {
        setCard(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    };

    const handleConfirm = async () => {
        const errs = validateCard(card, bill.total_amount);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setProcessing(true);
        setResult(null);
        await new Promise(r => setTimeout(r, 1400));

        try {
            const updated = await patientBillingService.payBill(bill.bill_id);
            setProcessing(false);
            setResult({ ok: true, msg: 'Payment completed successfully.' });
            setTimeout(() => { onSuccess(updated); }, 1200);
        } catch (err) {
            setProcessing(false);
            setResult({ ok: false, msg: err?.message || 'Payment failed. Please try again.' });
        }
    };

    const inputStyle = (hasErr) => ({
        width: '100%', padding: '0.55rem 0.75rem',
        border: `1px solid ${hasErr ? '#EF4444' : 'var(--border-light, #E5E7EB)'}`,
        borderRadius: '0.375rem', fontSize: '0.9rem', outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box',
    });

    const labelStyle = {
        display: 'block', marginBottom: '0.3rem',
        fontWeight: 500, fontSize: '0.85rem', color: '#374151'
    };

    const errStyle = { fontSize: '0.78rem', color: '#EF4444', marginTop: '0.2rem' };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }} onClick={processing ? undefined : onClose}>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'white', borderRadius: '1rem',
                    width: '100%', maxWidth: 480,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    overflow: 'hidden', animation: 'fadeIn 0.2s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1.1rem 1.5rem', borderBottom: '1px solid #F3F4F6'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <CreditCard size={20} color="#2563EB" />
                        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Secure Payment</span>
                    </div>
                    {!processing && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0.25rem' }}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {/* Bill Summary */}
                    <div style={{ background: '#F8FAFF', borderRadius: '0.6rem', padding: '1rem', marginBottom: '1.25rem', border: '1px solid #DBEAFE' }}>
                        <div style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '0.6rem', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Bill Summary</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem', fontSize: '0.875rem' }}>
                            {[
                                ['Patient',   patientName],
                                ['Bill #',    `#${bill.bill_id}`],
                                ['Appt. #',   `#${bill.appointment_id}`],
                                ['Status',    bill.payment_status],
                            ].map(([label, val]) => (
                                <div key={label}>
                                    <span style={{ color: '#9CA3AF' }}>{label}: </span>
                                    <span style={{ fontWeight: 500 }}>{val}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #DBEAFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, color: '#374151' }}>Total Amount</span>
                            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#2563EB' }}>
                                ${Number(bill.total_amount).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Security notice */}
                    <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '0.5rem', padding: '0.6rem 0.8rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#0369A1' }}>
                        Your payment information is handled securely and is not stored on this platform.
                    </div>

                    {/* Result banner */}
                    {result && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem',
                            background: result.ok ? '#F0FDF4' : '#FEF2F2',
                            color:      result.ok ? '#166534' : '#991B1B',
                            border: `1px solid ${result.ok ? '#BBF7D0' : '#FECACA'}`,
                            fontSize: '0.875rem', fontWeight: 500
                        }}>
                            {result.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {result.msg}
                        </div>
                    )}

                    {/* Card form — hidden once payment succeeds */}
                    {!(result?.ok) && (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Cardholder Name</label>
                                <input
                                    style={inputStyle(errors.name)}
                                    value={card.name}
                                    onChange={e => setField('name', e.target.value)}
                                    placeholder="John Doe"
                                    disabled={processing}
                                />
                                {errors.name && <p style={errStyle}>{errors.name}</p>}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Card Number</label>
                                <input
                                    style={{ ...inputStyle(errors.number), letterSpacing: '0.1em', fontFamily: 'monospace' }}
                                    value={card.number}
                                    onChange={e => setField('number', fmtCardNumber(e.target.value))}
                                    placeholder="0000 0000 0000 0000"
                                    maxLength={19}
                                    disabled={processing}
                                />
                                {errors.number && <p style={errStyle}>{errors.number}</p>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Expiry Date</label>
                                    <input
                                        style={inputStyle(errors.expiry)}
                                        value={card.expiry}
                                        onChange={e => setField('expiry', fmtExpiry(e.target.value))}
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        disabled={processing}
                                    />
                                    {errors.expiry && <p style={errStyle}>{errors.expiry}</p>}
                                </div>
                                <div>
                                    <label style={labelStyle}>CVV</label>
                                    <input
                                        style={inputStyle(errors.cvv)}
                                        value={card.cvv}
                                        onChange={e => setField('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                                        placeholder="•••"
                                        maxLength={3}
                                        type="password"
                                        disabled={processing}
                                    />
                                    {errors.cvv && <p style={errStyle}>{errors.cvv}</p>}
                                </div>
                            </div>

                            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                                Payment details are not stored after transaction processing.
                            </p>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={onClose}
                                    disabled={processing}
                                    style={{
                                        padding: '0.55rem 1.2rem', borderRadius: '0.5rem',
                                        background: '#F3F4F6', border: '1px solid #E5E7EB',
                                        cursor: processing ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem', fontWeight: 500, color: '#374151',
                                        opacity: processing ? 0.5 : 1
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={processing}
                                    style={{
                                        padding: '0.55rem 1.4rem', borderRadius: '0.5rem',
                                        background: processing ? '#93C5FD' : '#2563EB',
                                        border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem', fontWeight: 600, color: 'white',
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        transition: 'background 0.15s'
                                    }}
                                >
                                    {processing ? (
                                        <>
                                            <span style={{
                                                width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)',
                                                borderTop: '2px solid white', borderRadius: '50%',
                                                display: 'inline-block', animation: 'spin 0.7s linear infinite'
                                            }} />
                                            Processing…
                                        </>
                                    ) : 'Pay Now'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
            `}</style>
        </div>
    );
};

export default PaymentModal;
