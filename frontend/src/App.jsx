import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000';

function AuthPage({ setIsAuthenticated }) {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            const res = await axios.post(`${API_BASE}${endpoint}`, form);
            if (isLogin) {
                localStorage.setItem('token', res.data.token);
                setIsAuthenticated(true);
                navigate('/');
            } else {
                alert('Registration successful. Please log in.');
                setIsLogin(true);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-container">
                <div className="auth-eyebrow">Training Log</div>
                <h1>{isLogin ? 'Welcome back' : 'Create your log'}</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input name="username" placeholder="Username" onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? 'Please wait…' : isLogin ? 'Log in' : 'Register'}
                    </button>
                </form>
                <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Don't have an account? Register" : 'Already have an account? Log in'}
                </button>
            </div>
        </div>
    );
}

function AiCoach({ hasWorkouts }) {
    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchInsight = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_BASE}/api/ai/coach`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setInsight(res.data.insight);
        } catch (err) {
            setError(err.response?.data?.message || 'Coach is unavailable right now.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="coach">
            <div className="coach-head">
                <span className="coach-label">AI COACH</span>
                <button className="coach-refresh" onClick={fetchInsight} disabled={loading || !hasWorkouts}>
                    {loading ? 'Thinking…' : insight ? 'Get another tip' : 'Get a tip'}
                </button>
            </div>
            {!hasWorkouts && (
                <p className="coach-body muted">Log a few workouts and your coach will start spotting trends.</p>
            )}
            {hasWorkouts && !insight && !error && !loading && (
                <p className="coach-body muted">Ask for a read on your recent training.</p>
            )}
            {error && <p className="coach-error">{error}</p>}
            {insight && <p className="coach-body">{insight}</p>}
        </div>
    );
}

function Dashboard({ setIsAuthenticated }) {
    const [workouts, setWorkouts] = useState([]);
    const [form, setForm] = useState({ exercise: '', weight: '', sets: '', reps: '' });

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/api/workouts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkouts(res.data);
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) handleLogout();
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE}/api/workouts`, form, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setForm({ exercise: '', weight: '', sets: '', reps: '' });
        fetchWorkouts();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    const stats = useMemo(() => {
        const totalVolume = workouts.reduce(
            (sum, w) => sum + Number(w.weight || 0) * Number(w.sets || 0) * Number(w.reps || 0),
            0
        );

        const dayKeys = new Set(workouts.map((w) => new Date(w.date).toDateString()));
        let streak = 0;
        const cursor = new Date();
        cursor.setHours(0, 0, 0, 0);
        
        if (dayKeys.has(cursor.toDateString()) || dayKeys.has(new Date(cursor - 86400000).toDateString())) {
            if (!dayKeys.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
            while (dayKeys.has(cursor.toDateString())) {
                streak += 1;
                cursor.setDate(cursor.getDate() - 1);
            }
        }

        return { totalVolume, streak, count: workouts.length };
    }, [workouts]);

    return (
        <div>
            <header className="top">
                <h1>Training Log</h1>
                <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </header>

            <div className="stat-strip">
                <div className="stat">
                    <div className="stat-value">{stats.count}</div>
                    <div className="stat-label">Sessions logged</div>
                </div>
                <div className="stat">
                    <div className="stat-value">{stats.streak}</div>
                    <div className="stat-label">Day streak</div>
                </div>
                <div className="stat">
                    <div className="stat-value">{stats.totalVolume.toLocaleString()}</div>
                    <div className="stat-label">Total volume</div>
                </div>
            </div>

            <AiCoach hasWorkouts={workouts.length > 0} />

            <div className="log-section">
                <h2>Log a set</h2>
                <form onSubmit={handleSubmit} className="workout-form">
                    <input name="exercise" placeholder="Exercise (e.g., Deadlift)" value={form.exercise} onChange={handleChange} required />
                    <input name="weight" type="number" placeholder="Weight" value={form.weight} onChange={handleChange} required />
                    <input name="sets" type="number" placeholder="Sets" value={form.sets} onChange={handleChange} required />
                    <input name="reps" type="number" placeholder="Reps" value={form.reps} onChange={handleChange} required />
                    <button type="submit" className="btn-primary">Add to log</button>
                </form>
            </div>

            <div className="history-section">
                <h2>Recent sessions</h2>
                {workouts.length === 0 ? (
                    <p className="empty-state">Nothing logged yet — add your first set above.</p>
                ) : (
                    <div className="workout-list">
                        {workouts.map((w) => (
                            <div key={w.id} className="workout-row">
                                <div>
                                    <div className="exercise">{w.exercise}</div>
                                    <div className="date">{new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                                <div className="metric">
                                    {w.weight}<span>× {w.sets}×{w.reps}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/auth" element={
                        !isAuthenticated ? <AuthPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />
                    } />
                    <Route path="/" element={
                        isAuthenticated ? <Dashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/auth" />
                    } />
                </Routes>
            </div>
        </Router>
    );
}