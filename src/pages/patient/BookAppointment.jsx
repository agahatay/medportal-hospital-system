import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientDashboardService, appointmentService } from '../../api/dataService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import PaymentModal from '../../components/shared/PaymentModal';
import { Info, Calendar, CreditCard, Building2, X, CheckCircle } from 'lucide-react';

// ── Payment Choice Modal ─────────────────────────────────────────────────────

const PayChoiceModal = ({ doctorName, onChoose, onCancel, busy }) => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem'
    }}>
        <div style={{
            background: 'white', borderRadius: '1rem',
            width: '100%', maxWidth: 420,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            overflow: 'hidden', animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.1rem 1.5rem', borderBottom: '1px solid #F3F4F6'
            }}>
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>How would you like to pay?</span>
                {!busy && (
                    <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0.25rem' }}>
                        <X size={20} />
                    </button>
                )}
            </div>
            <div style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.25rem' }}>
                    Booking with <strong>{doctorName}</strong>. Choose your payment method to confirm the appointment.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={() => onChoose('Online')}
                        disabled={busy}
                        style={{
                            padding: '0.9rem 1.25rem', borderRadius: '0.6rem',
                            border: '2px solid #2563EB', background: '#EFF6FF',
                            cursor: busy ? 'not-allowed' : 'pointer', textAlign: 'left',
                            opacity: busy ? 0.6 : 1, transition: 'background 0.15s'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <CreditCard size={20} color="#2563EB" />
                            <div>
                                <div style={{ fontWeight: 600, color: '#1D4ED8', fontSize: '0.95rem' }}>Pay Online</div>
                                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.1rem' }}>Enter card details after booking confirmation</div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => onChoose('Cash')}
                        disabled={busy}
                        style={{
                            padding: '0.9rem 1.25rem', borderRadius: '0.6rem',
                            border: '2px solid #D97706', background: '#FFFBEB',
                            cursor: busy ? 'not-allowed' : 'pointer', textAlign: 'left',
                            opacity: busy ? 0.6 : 1, transition: 'background 0.15s'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Building2 size={20} color="#D97706" />
                            <div>
                                <div style={{ fontWeight: 600, color: '#92400E', fontSize: '0.95rem' }}>Pay at Hospital (Cash)</div>
                                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.1rem' }}>Pay at the reception desk on the appointment day</div>
                            </div>
                        </div>
                    </button>
                </div>

                {busy && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: '#6B7280', fontSize: '0.85rem' }}>
                        <span style={{
                            width: 14, height: 14, border: '2px solid #D1D5DB',
                            borderTop: '2px solid #6B7280', borderRadius: '50%',
                            display: 'inline-block', animation: 'spin 0.7s linear infinite'
                        }} />
                        Booking your appointment…
                    </div>
                )}
            </div>
        </div>
        <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        `}</style>
    </div>
);

// ── Main Page ───────────────────────────────────────────────────────────────

const BookAppointment = () => {
    const { doctorId } = useParams();
    const navigate     = useNavigate();
    const { user }     = useAuth();

    const [doctor,       setDoctor]       = useState(null);
    const [pageLoading,  setPageLoading]  = useState(true);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [reason,       setReason]       = useState('');
    const [error,        setError]        = useState(null);

    const [slots,        setSlots]        = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError,   setSlotsError]   = useState(null);

    // Payment flow state
    const [showPayChoice, setShowPayChoice] = useState(false);
    const [booking,       setBooking]       = useState(false);
    const [pendingBill,   setPendingBill]   = useState(null); // Online: bill from booking response
    const [cashSuccess,   setCashSuccess]   = useState(false);

    // Load doctor details
    useEffect(() => {
        const loadDoc = async () => {
            try {
                if (doctorId) {
                    const doc = await patientDashboardService.getDoctorById(doctorId);
                    setDoctor(doc);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load doctor details');
            } finally {
                setPageLoading(false);
            }
        };
        loadDoc();
    }, [doctorId]);

    // Fetch available slots when date changes
    useEffect(() => {
        if (!selectedDate || !doctorId) return;

        const fetchSlots = async () => {
            setSlotsLoading(true);
            setSlotsError(null);
            setSelectedTime('');
            setSlots([]);
            try {
                const available = await patientDashboardService.getAvailableSlots(doctorId, selectedDate);
                setSlots(available);
                if (available.length === 0) {
                    setSlotsError('All slots on this date are fully booked. Please choose a different date.');
                }
            } catch (err) {
                setSlotsError('Failed to load available slots');
            } finally {
                setSlotsLoading(false);
            }
        };

        fetchSlots();
    }, [selectedDate, doctorId]);

    // Validate form then show payment choice modal (NO API call yet)
    const handleConfirmClick = () => {
        if (!selectedDate || !selectedTime) {
            setError('Please select a date and time slot');
            return;
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!dateRegex.test(selectedDate)) { setError('Unexpected date format. Please re-select the date.'); return; }
        if (!timeRegex.test(selectedTime)) { setError('Unexpected time format. Please re-select the time slot.'); return; }
        setError(null);
        setShowPayChoice(true);
    };

    // Called after user picks Online or Cash
    const doBook = async (method) => {
        setBooking(true);
        const dateTime = `${selectedDate} ${selectedTime}:00`;

        try {
            const response = await appointmentService.bookAppointment({
                doctor_id:        parseInt(doctorId),
                appointment_date: dateTime,
                reason:           reason || 'General Consultation',
                payment_method:   method,
            });

            setShowPayChoice(false);
            setBooking(false);

            if (method === 'Online') {
                // Build a bill object for PaymentModal from the booking response
                setPendingBill({
                    bill_id:        response.bill_id,
                    appointment_id: response.appointment_id,
                    total_amount:   response.total_amount,
                    payment_status: response.payment_status,
                    payment_method: 'Online',
                });
            } else {
                setCashSuccess(true);
                setTimeout(() => navigate('/patient/my-appointments'), 3000);
            }
        } catch (err) {
            setBooking(false);
            setShowPayChoice(false);
            setError(err?.message || 'Booking failed. Please try again.');
        }
    };

    if (pageLoading) return <div>Loading doctor details...</div>;
    if (!doctor)     return <div>Doctor not found.</div>;

    // Cash booking success screen
    if (cashSuccess) {
        return (
            <div style={{ maxWidth: 480, margin: '4rem auto', textAlign: 'center' }}>
                <div style={{
                    background: '#F0FDF4', border: '1px solid #BBF7D0',
                    borderRadius: '1rem', padding: '2.5rem 2rem'
                }}>
                    <CheckCircle size={48} color="#16A34A" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontWeight: 700, fontSize: '1.35rem', color: '#166534', marginBottom: '0.5rem' }}>
                        Appointment Confirmed!
                    </h2>
                    <p style={{ color: '#166534', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Please bring cash to the reception desk on the day of your appointment.
                        You'll be redirected shortly…
                    </p>
                    <button
                        onClick={() => navigate('/patient/my-appointments')}
                        style={{
                            padding: '0.55rem 1.4rem', borderRadius: '0.5rem',
                            background: '#16A34A', color: 'white',
                            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem'
                        }}
                    >
                        View My Appointments
                    </button>
                </div>
            </div>
        );
    }

    const today = new Date().toISOString().split('T')[0];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Book Appointment</h1>

            <div className="grid-cols-2" style={{ alignItems: 'start' }}>

                {/* Doctor info panel */}
                <Card title="Doctor Details">
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%', background: '#E0E7FF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#4F46E5', fontWeight: 'bold', fontSize: '1.25rem', flexShrink: 0
                        }}>
                            {doctor.name.charAt(0)}
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>{doctor.name}</h3>
                            <p style={{ color: 'var(--primary)', fontWeight: 500, margin: '0.25rem 0 0' }}>
                                {doctor.specialization}
                            </p>
                            {doctor.department_name && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                                    {doctor.department_name}
                                </p>
                            )}
                        </div>
                    </div>

                    {doctor.bio && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            {doctor.bio}
                        </p>
                    )}

                    <div style={{ padding: '1rem', background: '#F3F4F6', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <Info size={16} /> Important Info
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Please arrive 15 minutes before your scheduled appointment. Each slot is 20 minutes.
                        </p>
                    </div>
                </Card>

                {/* Booking panel */}
                <Card title="Select Slot">
                    {/* Date picker */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                            <Calendar size={16} /> Select Date
                        </label>
                        <input
                            type="date"
                            className="input"
                            min={today}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    {/* Slots */}
                    {selectedDate && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Available Times
                            </label>

                            {slotsLoading && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading slots…</p>
                            )}

                            {!slotsLoading && slotsError && (
                                <p style={{ color: '#D97706', fontSize: '0.875rem', background: '#FEF3C7', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                    {slotsError}
                                </p>
                            )}

                            {!slotsLoading && slots.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                    {slots.map(slot => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedTime(slot)}
                                            style={{
                                                padding: '0.75rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: selectedTime === slot
                                                    ? '2px solid var(--primary)'
                                                    : '1px solid var(--border-light)',
                                                background: selectedTime === slot ? '#EEF2FF' : 'white',
                                                color: selectedTime === slot ? 'var(--primary)' : 'var(--text-main)',
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reason */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Reason for Visit
                        </label>
                        <textarea
                            className="input"
                            rows="3"
                            placeholder="Briefly describe your symptoms or reason…"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#DC2626', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>
                    )}

                    <Button
                        style={{ width: '100%' }}
                        onClick={handleConfirmClick}
                        disabled={!selectedDate || !selectedTime}
                    >
                        Confirm Booking
                    </Button>
                </Card>
            </div>

            {/* Payment choice modal */}
            {showPayChoice && (
                <PayChoiceModal
                    doctorName={doctor.name}
                    onChoose={doBook}
                    onCancel={() => setShowPayChoice(false)}
                    busy={booking}
                />
            )}

            {/* Online payment modal (shown after successful booking) */}
            {pendingBill && (
                <PaymentModal
                    bill={pendingBill}
                    patientName={user?.name || user?.email || 'Patient'}
                    onClose={() => navigate('/patient/billing')}
                    onSuccess={() => navigate('/patient/billing')}
                />
            )}
        </div>
    );
};

export default BookAppointment;
