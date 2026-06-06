import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorService, authService } from '../../api/dataService';
import Card from '../../components/shared/Card';

// ── helpers ────────────────────────────────────────────────────────────────

const PHONE_RE = /^\+?[\d\s\-(). ]{7,20}$/;

const validate = (form) => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (!form.last_name.trim())  errs.last_name  = 'Last name is required';
    if (form.phone && !PHONE_RE.test(form.phone))
        errs.phone = 'Enter a valid phone number';
    return errs;
};

const ReadonlyField = ({ label, value }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 500, fontSize: '0.85rem', color: '#374151' }}>
            {label}
        </label>
        <div style={{
            padding: '0.55rem 0.75rem', borderRadius: '0.375rem',
            border: '1px solid #E5E7EB', background: '#F9FAFB',
            fontSize: '0.9rem', color: '#6B7280', minHeight: '2.25rem'
        }}>
            {value || '—'}
        </div>
    </div>
);

const Field = ({ label, value, onChange, error, placeholder, disabled }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 500, fontSize: '0.85rem', color: '#374151' }}>
            {label}
        </label>
        <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            style={{
                width: '100%', padding: '0.55rem 0.75rem', boxSizing: 'border-box',
                borderRadius: '0.375rem', fontSize: '0.9rem', fontFamily: 'inherit',
                border: `1px solid ${error ? '#EF4444' : '#D1D5DB'}`,
                background: disabled ? '#F9FAFB' : 'white', outline: 'none',
            }}
        />
        {error && <p style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: '0.2rem' }}>{error}</p>}
    </div>
);

// ── ChangePasswordModal ────────────────────────────────────────────────────

const EMPTY_PW = { current: '', next: '', confirm: '' };

const ChangePasswordModal = ({ onClose, onSuccess }) => {
    const [fields,  setFields]  = useState(EMPTY_PW);
    const [show,    setShow]    = useState({ current: false, next: false, confirm: false });
    const [errors,  setErrors]  = useState({});
    const [saving,  setSaving]  = useState(false);
    const [apiErr,  setApiErr]  = useState(null);

    const setField = (key, val) => {
        setFields(prev => ({ ...prev, [key]: val }));
        if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
        setApiErr(null);
    };

    const toggleShow = (key) => setShow(prev => ({ ...prev, [key]: !prev[key] }));

    const clientValidate = () => {
        const errs = {};
        if (!fields.current)               errs.current = 'Current password is required';
        if (!fields.next)                  errs.next    = 'New password is required';
        else if (fields.next.length < 6)   errs.next    = 'New password must be at least 6 characters';
        if (!fields.confirm)               errs.confirm = 'Please confirm your new password';
        else if (fields.next !== fields.confirm) errs.confirm = 'Passwords do not match';
        if (fields.current && fields.next && fields.current === fields.next)
            errs.next = 'New password must be different from current password';
        return errs;
    };

    const handleSubmit = async () => {
        const errs = clientValidate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setSaving(true);
        setApiErr(null);
        try {
            await authService.changePassword(fields.current, fields.next);
            onSuccess();
        } catch (err) {
            setApiErr(err?.message || 'Failed to update password. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const PasswordInput = ({ fieldKey, label, placeholder }) => (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 500, fontSize: '0.85rem', color: '#374151' }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    type={show[fieldKey] ? 'text' : 'password'}
                    value={fields[fieldKey]}
                    onChange={e => setField(fieldKey, e.target.value)}
                    placeholder={placeholder}
                    disabled={saving}
                    autoComplete="new-password"
                    style={{
                        width: '100%', padding: '0.55rem 2.5rem 0.55rem 0.75rem',
                        boxSizing: 'border-box', borderRadius: '0.375rem',
                        fontSize: '0.9rem', fontFamily: 'inherit',
                        border: `1px solid ${errors[fieldKey] ? '#EF4444' : '#D1D5DB'}`,
                        background: saving ? '#F9FAFB' : 'white', outline: 'none',
                    }}
                />
                <button
                    type="button"
                    onClick={() => toggleShow(fieldKey)}
                    tabIndex={-1}
                    style={{
                        position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0.1rem'
                    }}
                >
                    {show[fieldKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {errors[fieldKey] && (
                <p style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: '0.2rem' }}>{errors[fieldKey]}</p>
            )}
        </div>
    );

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={saving ? undefined : onClose}>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'white', borderRadius: '1rem', width: '100%', maxWidth: 420,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
                    animation: 'pwFadeIn 0.18s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1.1rem 1.5rem', borderBottom: '1px solid #F3F4F6'
                }}>
                    <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>Change Password</span>
                    {!saving && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0.25rem' }}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {/* API error banner */}
                    {apiErr && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.7rem 0.9rem', borderRadius: '0.5rem', marginBottom: '1.1rem',
                            background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA',
                            fontSize: '0.875rem', fontWeight: 500
                        }}>
                            <AlertCircle size={16} />
                            {apiErr}
                        </div>
                    )}

                    <PasswordInput fieldKey="current" label="Current Password" placeholder="Enter current password" />
                    <PasswordInput fieldKey="next"    label="New Password"     placeholder="At least 6 characters" />
                    <PasswordInput fieldKey="confirm" label="Confirm New Password" placeholder="Repeat new password" />

                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'center', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                        Your password is encrypted and never stored in plain text.
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button
                            onClick={onClose}
                            disabled={saving}
                            style={{
                                padding: '0.55rem 1.2rem', borderRadius: '0.5rem',
                                background: '#F3F4F6', border: '1px solid #E5E7EB',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem', fontWeight: 500, color: '#374151',
                                opacity: saving ? 0.5 : 1
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            style={{
                                padding: '0.55rem 1.4rem', borderRadius: '0.5rem',
                                background: saving ? '#93C5FD' : '#2563EB',
                                border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem', fontWeight: 600, color: 'white',
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                            }}
                        >
                            {saving ? (
                                <>
                                    <span style={{
                                        width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)',
                                        borderTop: '2px solid white', borderRadius: '50%',
                                        display: 'inline-block', animation: 'pwSpin 0.7s linear infinite'
                                    }} />
                                    Saving…
                                </>
                            ) : 'Update Password'}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes pwSpin    { to { transform: rotate(360deg); } }
                @keyframes pwFadeIn  { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
            `}</style>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────

const DoctorProfile = () => {
    const { user } = useAuth();
    const [profile,    setProfile]    = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [editing,    setEditing]    = useState(false);
    const [form,       setForm]       = useState({ first_name: '', last_name: '', specialization: '', phone: '', bio: '' });
    const [errors,     setErrors]     = useState({});
    const [saving,     setSaving]     = useState(false);
    const [message,    setMessage]    = useState(null); // { ok, text }

    const [showPwModal, setShowPwModal] = useState(false);

    useEffect(() => {
        doctorService.getMyProfile()
            .then(data => {
                setProfile(data);
                setForm({
                    first_name:     data.first_name     || '',
                    last_name:      data.last_name      || '',
                    specialization: data.specialization || '',
                    phone:          data.phone          || '',
                    bio:            data.bio            || '',
                });
            })
            .catch(err => setFetchError(err?.message || 'Failed to load profile.'))
            .finally(() => setLoading(false));
    }, []);

    const setField = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    };

    const handleEdit = () => { setMessage(null); setErrors({}); setEditing(true); };

    const handleCancel = () => {
        setForm({
            first_name:     profile.first_name     || '',
            last_name:      profile.last_name      || '',
            specialization: profile.specialization || '',
            phone:          profile.phone          || '',
            bio:            profile.bio            || '',
        });
        setErrors({});
        setMessage(null);
        setEditing(false);
    };

    const handleSave = async () => {
        const errs = validate(form);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setSaving(true);
        setMessage(null);
        try {
            const updated = await doctorService.updateMyProfile(form);
            setProfile(updated);
            setEditing(false);
            setMessage({ ok: true, text: 'Profile updated successfully.' });
        } catch (err) {
            setMessage({ ok: false, text: err?.message || 'Failed to save changes. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSuccess = () => {
        setShowPwModal(false);
        setMessage({ ok: true, text: 'Password updated successfully.' });
    };

    // ── Render ───────────────────────────────────────────────────────────────

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading profile…</div>;
    if (fetchError) return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{fetchError}</div>;

    const initials = ((profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')).toUpperCase() || 'D';

    return (
        <div style={{ maxWidth: 860 }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>My Profile</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    View and update your professional information.
                </p>
            </div>

            {/* Status banner */}
            {message && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem',
                    background: message.ok ? '#F0FDF4' : '#FEF2F2',
                    color:      message.ok ? '#166534' : '#991B1B',
                    border: `1px solid ${message.ok ? '#BBF7D0' : '#FECACA'}`,
                    fontSize: '0.875rem', fontWeight: 500
                }}>
                    {message.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

                {/* Left card — editable profile info */}
                <Card title="Profile Information">
                    {editing ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                                <Field
                                    label="First Name"
                                    value={form.first_name}
                                    onChange={v => setField('first_name', v)}
                                    error={errors.first_name}
                                    placeholder="First name"
                                    disabled={saving}
                                />
                                <Field
                                    label="Last Name"
                                    value={form.last_name}
                                    onChange={v => setField('last_name', v)}
                                    error={errors.last_name}
                                    placeholder="Last name"
                                    disabled={saving}
                                />
                            </div>

                            <Field
                                label="Specialization"
                                value={form.specialization}
                                onChange={v => setField('specialization', v)}
                                error={errors.specialization}
                                placeholder="e.g. Cardiology"
                                disabled={saving}
                            />

                            <Field
                                label="Phone"
                                value={form.phone}
                                onChange={v => setField('phone', v)}
                                error={errors.phone}
                                placeholder="+1 555 000 0000"
                                disabled={saving}
                            />

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 500, fontSize: '0.85rem', color: '#374151' }}>
                                    Bio
                                </label>
                                <textarea
                                    value={form.bio}
                                    onChange={e => setField('bio', e.target.value)}
                                    disabled={saving}
                                    rows={3}
                                    placeholder="Short professional bio…"
                                    style={{
                                        width: '100%', padding: '0.55rem 0.75rem', boxSizing: 'border-box',
                                        borderRadius: '0.375rem', fontSize: '0.9rem', fontFamily: 'inherit',
                                        border: '1px solid #D1D5DB', background: saving ? '#F9FAFB' : 'white',
                                        resize: 'vertical', outline: 'none',
                                    }}
                                />
                            </div>

                            <ReadonlyField label="Email"         value={profile.user_email || profile.email} />
                            <ReadonlyField label="Department"    value={profile.department_name} />
                            <ReadonlyField label="Department ID" value={profile.department_id} />
                            <ReadonlyField label="Doctor ID"     value={profile.doctor_id} />
                            <ReadonlyField label="Role"          value="Doctor" />

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    style={{
                                        padding: '0.55rem 1.2rem', borderRadius: '0.5rem',
                                        background: '#F3F4F6', border: '1px solid #E5E7EB',
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem', fontWeight: 500, color: '#374151',
                                        opacity: saving ? 0.5 : 1
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        padding: '0.55rem 1.4rem', borderRadius: '0.5rem',
                                        background: saving ? '#93C5FD' : '#2563EB',
                                        border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem', fontWeight: 600, color: 'white',
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    }}
                                >
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <ReadonlyField label="Full Name"      value={profile.name || `${profile.first_name} ${profile.last_name}`} />
                            <ReadonlyField label="Email"          value={profile.user_email || profile.email} />
                            <ReadonlyField label="Specialization" value={profile.specialization} />
                            <ReadonlyField label="Phone"          value={profile.phone} />
                            <ReadonlyField label="Department"     value={profile.department_name} />
                            <ReadonlyField label="Department ID"  value={profile.department_id} />
                            <ReadonlyField label="Doctor ID"      value={profile.doctor_id} />
                            <ReadonlyField label="Role"           value="Doctor" />

                            {profile.bio && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 500, fontSize: '0.85rem', color: '#374151' }}>
                                        Bio
                                    </label>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', lineHeight: 1.55 }}>{profile.bio}</p>
                                </div>
                            )}

                            <div style={{ marginBottom: '1rem', padding: '0.7rem 0.9rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '0.5rem', fontSize: '0.82rem', color: '#1D4ED8' }}>
                                Availability is managed from the <strong>Work Hours</strong> page.
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    onClick={handleEdit}
                                    style={{
                                        padding: '0.55rem 1.4rem', borderRadius: '0.5rem',
                                        background: '#2563EB', border: 'none', cursor: 'pointer',
                                        fontSize: '0.875rem', fontWeight: 600, color: 'white',
                                    }}
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </>
                    )}
                </Card>

                {/* Right card — account info */}
                <Card title="Account Settings">
                    {/* Avatar */}
                    <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                        <div style={{
                            width: 90, height: 90, borderRadius: '50%',
                            background: '#E0E7FF', margin: '0 auto 0.9rem auto',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.75rem', fontWeight: 700, color: '#4F46E5'
                        }}>
                            {initials}
                        </div>
                        <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', fontWeight: 600 }}>
                            {profile.name || `${profile.first_name} ${profile.last_name}`}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {profile.user_email || profile.email}
                        </p>
                        <span style={{
                            display: 'inline-block', marginTop: '0.5rem',
                            padding: '0.2rem 0.65rem', borderRadius: '999px',
                            background: '#EEF2FF', color: '#4F46E5',
                            fontSize: '0.78rem', fontWeight: 600
                        }}>
                            Doctor
                        </span>
                    </div>

                    {/* Account details */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                            Account Details
                        </div>
                        {[
                            ['Doctor ID',     `#${profile.doctor_id}`],
                            ['Department',    profile.department_name || '—'],
                            ['Specialization', profile.specialization || '—'],
                        ].map(([label, val]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid #F3F4F6', fontSize: '0.875rem' }}>
                                <span style={{ color: '#6B7280' }}>{label}</span>
                                <span style={{ fontWeight: 500 }}>{val}</span>
                            </div>
                        ))}
                    </div>

                    {/* Password section */}
                    <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid #E5E7EB' }}>
                        <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                            Password
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '0 0 0.85rem 0' }}>
                            Update your password to keep your account secure.
                        </p>
                        <button
                            onClick={() => setShowPwModal(true)}
                            style={{
                                width: '100%', padding: '0.55rem', borderRadius: '0.5rem',
                                background: 'white', border: '1px solid #D1D5DB',
                                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                                color: '#374151', transition: 'border-color 0.15s',
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#2563EB'}
                            onMouseOut={e  => e.currentTarget.style.borderColor = '#D1D5DB'}
                        >
                            Change Password
                        </button>
                    </div>
                </Card>
            </div>

            {/* Password modal */}
            {showPwModal && (
                <ChangePasswordModal
                    onClose={() => setShowPwModal(false)}
                    onSuccess={handlePasswordSuccess}
                />
            )}
        </div>
    );
};

export default DoctorProfile;
