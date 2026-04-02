import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import CopyrightBar from '../components/common/CopyrightBar';
import Logo from '../components/common/Logo';

const redirectByRole = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard'
};

const LoginPage = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', role: 'patient' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const user = await login(form.email, form.password);
      if (user.role !== form.role) {
        logout();
        setError(`This account is ${user.role}. Please choose the correct role.`);
        return;
      }
      const target = location.state?.from?.pathname || redirectByRole[user.role] || '/';
      navigate(target);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-2xl lg:grid-cols-2">
          <section className="hidden bg-gradient-to-br from-teal-700 to-teal-500 p-10 text-white lg:block">
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-10" />
              <p className="text-2xl font-bold">AarogyaLink</p>
            </div>
            <h2 className="mt-8 text-3xl font-bold leading-tight">
              Secure access to appointments, queues, and hospital operations.
            </h2>
            <p className="mt-4 text-sm text-teal-50/95">
              Sign in to continue managing appointments, tracking live queue status, and collaborating across patient,
              doctor, and admin workflows.
            </p>
            <ul className="mt-8 space-y-2 text-sm text-teal-50/95">
              <li>Role-based secure login</li>
              <li>Real-time queue visibility</li>
              <li>Centralized hospital management</li>
            </ul>
          </section>

          <form onSubmit={submit} className="space-y-4 p-6 sm:p-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-teal-200 px-3 py-1 text-sm text-teal-700 hover:bg-teal-50"
            >
              Back
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-ink">Welcome Back</h1>
              <p className="mt-1 text-sm text-teal-800/80">Login to continue with your AarogyaLink account.</p>
            </div>

            <label className="block text-sm font-medium text-teal-800">
              Login As
              <select
                className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-teal-800">
              Email
              <input
                className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2"
                type="email"
                placeholder="name@example.com"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </label>

            <label className="block text-sm font-medium text-teal-800">
              Password
              <input
                className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2"
                type="password"
                placeholder="Enter password"
                required
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </label>

            {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-white hover:bg-teal-700">Login</button>
            <p className="text-sm text-teal-700">
              Need an account? <Link to="/register" className="font-medium underline">Register as patient or doctor</Link>
            </p>
          </form>
        </div>
      </div>
      <CopyrightBar />
    </div>
  );
};

export default LoginPage;
