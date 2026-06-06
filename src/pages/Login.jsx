import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import Card from '../components/shared/Card';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await login(email, password);
            console.log('Login successful. User:', user);
            console.log('User Role:', user.role);

            // Redirect based on role
            if (user.role === 'PATIENT') navigate('/patient/search');
            else if (user.role === 'DOCTOR') navigate('/doctor/schedule');
            else if (user.role === 'ADMIN') {
                console.log('Redirecting to /admin/doctors');
                navigate('/admin/doctors');
            }
        } catch (err) {
            setError(err && err.message ? err.message : 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to fill mock data (for quick testing, still useful)
    const fillMock = (role) => {
        if (role === 'PATIENT') {
            setEmail('patient1@test.com');
            setPassword('123456');
        } else if (role === 'DOCTOR') {
            setEmail('doctor1@test.com');
            setPassword('123456');
        } else if (role === 'ADMIN') {
            setEmail('admin@test.com');
            setPassword('123456');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4F46E5 0%, #10B981 100%)'
        }}>
            <Card
                className="login-card"
                style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: 48, height: 48, background: 'var(--primary)', borderRadius: '12px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>M</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@example.com"
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />

                    {error && (
                        <div style={{ padding: '0.75rem', background: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <Button type="submit" style={{ width: '100%' }} disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create account</Link>
                    </div>

                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textAlign: 'center' }}>Demo Accounts (Click to fill):</p>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button type="button" onClick={() => fillMock('PATIENT')} className="badge badge-info" style={{ border: 'none', cursor: 'pointer' }}>Patient</button>
                            <button type="button" onClick={() => fillMock('DOCTOR')} className="badge badge-success" style={{ border: 'none', cursor: 'pointer' }}>Doctor</button>
                            <button type="button" onClick={() => fillMock('ADMIN')} className="badge badge-warning" style={{ border: 'none', cursor: 'pointer' }}>Admin</button>
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Login;
