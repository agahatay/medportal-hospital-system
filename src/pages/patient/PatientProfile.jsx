import { useState, useEffect } from 'react';
import { patientDashboardService } from '../../api/dataService';
import Card from '../../components/shared/Card';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';

const PHONE_RE = /^\+?[\d\s\-(). ]{7,20}$/;

const fmtDateForInput = (val) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const fmtDateForDisplay = (val) => {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

const today = new Date().toISOString().split('T')[0];

const buildForm = (p) => ({
    first_name:    p.first_name    || '',
    last_name:     p.last_name     || '',
    phone:         p.phone         || '',
    gender:        p.gender        || '',
    date_of_birth: fmtDateForInput(p.date_of_birth),
    address:       p.address       || '',
});

const ReadField = ({ label, value }) => (
    <Input
        label={label}
        value={value || '—'}
        readOnly
        disabled
        style={{ background: '#F9FAFB' }}
    />
);

const PatientProfile = () => {
    const [profile,    setProfile]    = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [noProfile,  setNoProfile]  = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [form,     setForm]     = useState({});
    const [errors,   setErrors]   = useState({});
    const [saving,   setSaving]   = useState(false);
    const [saveMsg,  setSaveMsg]  = useState(null); // { type: 'success'|'error', text }

    useEffect(() => {
        patientDashboardService.getProfile()
            .then(data => {
                setProfile(data);
                setForm(buildForm(data));
            })
            .catch(err => {
                const msg = err?.message || '';
                if (msg.toLowerCase().includes('not found')) setNoProfile(true);
                else setFetchError(msg || 'Failed to load profile.');
            })
            .finally(() => setLoading(false));
    }, []);

    const setField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    };

    const validate = () => {
        const errs = {};
        if (!form.first_name.trim()) errs.first_name = 'First name is required';
        if (!form.last_name.trim())  errs.last_name  = 'Last name is required';
        if (form.phone && !PHONE_RE.test(form.phone)) {
            errs.phone = 'Invalid format — e.g. +90 555 123 4567';
        }
        if (form.date_of_birth) {
            const d = new Date(form.date_of_birth);
            if (isNaN(d.getTime()))  errs.date_of_birth = 'Invalid date';
            else if (d > new Date()) errs.date_of_birth = 'Date of birth cannot be in the future';
        }
        return errs;
    };

    const handleEdit = () => {
        setForm(buildForm(profile));
        setErrors({});
        setSaveMsg(null);
        setEditMode(true);
    };

    const handleCancel = () => {
        setForm(buildForm(profile));
        setErrors({});
        setSaveMsg(null);
        setEditMode(false);
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setSaving(true);
        setSaveMsg(null);
        try {
            const updated = await patientDashboardService.updateProfile(form);
            setProfile(updated);
            setForm(buildForm(updated));
            setEditMode(false);
            setSaveMsg({ type: 'success', text: 'Profile updated successfully.' });
        } catch (err) {
            setSaveMsg({ type: 'error', text: err?.message || 'Failed to save profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading profile…</div>;

    if (fetchError) return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
            <Card>
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>
                    {fetchError}
                </div>
            </Card>
        </div>
    );

    if (noProfile) return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
            <Card>
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Patient profile information is incomplete.
                </div>
            </Card>
        </div>
    );

    if (!profile) return null;

    const displayName = profile.full_name
        || `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        || profile.email;
    const avatarLetter = (displayName || 'P').charAt(0).toUpperCase();
    const patientIdStr = `#${String(profile.patient_id).padStart(4, '0')}`;

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>My Profile</h1>

            {saveMsg && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    background: saveMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                    color:      saveMsg.type === 'success' ? '#166534' : '#991B1B',
                    border: `1px solid ${saveMsg.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                }}>
                    {saveMsg.text}
                </div>
            )}

            <Card title="Personal Information">
                {/* Avatar + name header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                    marginBottom: '2rem', paddingBottom: '2rem',
                    borderBottom: '1px solid var(--border-light)'
                }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--primary)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 'bold'
                    }}>
                        {avatarLetter}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{displayName}</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                            Patient ID: {patientIdStr}
                        </p>
                    </div>
                </div>

                {editMode ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                            <Input
                                label="First Name"
                                value={form.first_name}
                                onChange={e => setField('first_name', e.target.value)}
                                error={errors.first_name}
                                autoFocus
                            />
                            <Input
                                label="Last Name"
                                value={form.last_name}
                                onChange={e => setField('last_name', e.target.value)}
                                error={errors.last_name}
                            />
                        </div>

                        <ReadField label="Email Address" value={profile.email} />

                        <Input
                            label="Phone Number"
                            value={form.phone}
                            onChange={e => setField('phone', e.target.value)}
                            placeholder="+90 555 123 4567"
                            error={errors.phone}
                        />

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block', marginBottom: '0.4rem',
                                fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-main)'
                            }}>
                                Gender
                            </label>
                            <select
                                value={form.gender}
                                onChange={e => setField('gender', e.target.value)}
                                className="input"
                                style={{ width: '100%' }}
                            >
                                <option value="">— Select —</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <Input
                            label="Date of Birth"
                            type="date"
                            value={form.date_of_birth}
                            onChange={e => setField('date_of_birth', e.target.value)}
                            error={errors.date_of_birth}
                            max={today}
                        />

                        <Input
                            label="Address"
                            value={form.address}
                            onChange={e => setField('address', e.target.value)}
                            placeholder="Your address"
                        />

                        <ReadField label="Role"       value={profile.role} />
                        <ReadField label="Patient ID" value={patientIdStr} />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <ReadField label="Full Name"      value={displayName} />
                        <ReadField label="Email Address"  value={profile.email} />
                        <ReadField label="Phone Number"   value={profile.phone} />
                        <ReadField label="Gender"         value={profile.gender} />
                        <ReadField
                            label="Date of Birth"
                            value={fmtDateForDisplay(profile.date_of_birth)}
                        />
                        <ReadField label="Address"        value={profile.address} />
                        <ReadField label="Role"           value={profile.role} />
                        <ReadField label="Patient ID"     value={patientIdStr} />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <Button onClick={handleEdit}>Edit Profile</Button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default PatientProfile;
