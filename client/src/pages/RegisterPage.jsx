import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { authAPI, hospitalAPI } from '../services/api';
import CopyrightBar from '../components/common/CopyrightBar';
import Logo from '../components/common/Logo';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: 'patient',
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'male',
    specialization: '',
    hospitalId: '',
    qualifications: '',
    nmcNumber: '',
    experience: 0
  });
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    hospitalAPI
      .list()
      .then(({ data }) => {
        setHospitals(data || []);
        setForm((prev) => ({ ...prev, hospitalId: prev.hospitalId || data?.[0]?._id || '' }));
      })
      .catch(() => setHospitals([]));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      if (form.role === 'doctor') {
        await authAPI.registerDoctor({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          specialization: form.specialization,
          hospitalId: form.hospitalId,
          doctorContactNumber: form.phone,
          qualifications: form.qualifications,
          nmcNumber: form.nmcNumber,
          experience: Number(form.experience || 0)
        });
        setMessage('Doctor registration submitted. Wait for admin approval, then login as doctor.');
        return;
      }

      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        gender: form.gender
      });
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
              Create your healthcare access account in a few steps.
            </h2>
            <p className="mt-4 text-sm text-teal-50/95">
              Patients can register instantly. Doctors can register and begin access after admin approval.
            </p>
            <ul className="mt-8 space-y-2 text-sm text-teal-50/95">
              <li>Simple registration workflow</li>
              <li>Secure role-based onboarding</li>
              <li>Centralized multi-hospital access</li>
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
              <h1 className="text-2xl font-semibold text-ink">Create Account</h1>
              <p className="mt-1 text-sm text-teal-800/80">Register as patient or doctor to access AarogyaLink.</p>
            </div>

            <label className="block text-sm font-medium text-teal-800">
              Register As
              <select
                className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor (requires admin approval)</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-teal-800">
              Full Name
              <input
                className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2"
                placeholder="Enter full name"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
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
                placeholder="Create password"
                required
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </label>

            <label className="block text-sm font-medium text-teal-800">
              {form.role === 'doctor' ? 'Phone (Doctor Contact Number)' : 'Phone'}
              <input
                className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </label>

            {form.role === 'patient' ? (
              <label className="block text-sm font-medium text-teal-800">
                Gender
                <select
                  className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2"
                  value={form.gender}
                  onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
            ) : null}

            {form.role === 'doctor' ? (
              <>
                <label className="block text-sm font-medium text-teal-800">
                  Specialization
                  <input
                    className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2"
                    placeholder="Enter specialization"
                    required
                    value={form.specialization}
                    onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                  />
                </label>
                <label className="block text-sm font-medium text-teal-800">
                  Hospital
                  <select
                    className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2"
                    required
                    value={form.hospitalId}
                    onChange={(e) => setForm((p) => ({ ...p, hospitalId: e.target.value }))}
                  >
                    <option value="">Select registered hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                  {hospitals.length === 0 ? (
                    <p className="mt-1 text-xs text-amber-700">No hospitals are registered yet. Please contact admin.</p>
                  ) : null}
                </label>
                <label className="block text-sm font-medium text-teal-800">
                  Qualifications
                  <input
                    className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2"
                    placeholder="Enter qualifications"
                    value={form.qualifications}
                    onChange={(e) => setForm((p) => ({ ...p, qualifications: e.target.value }))}
                  />
                </label>
                <label className="block text-sm font-medium text-teal-800">
                  NMC Number
                  <input
                    className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2"
                    placeholder="Enter NMC number"
                    value={form.nmcNumber}
                    onChange={(e) => setForm((p) => ({ ...p, nmcNumber: e.target.value }))}
                  />
                </label>
                <label className="block text-sm font-medium text-teal-800">
                  Experience (Years)
                  <input
                    className="mt-1 w-full rounded-lg border border-teal-200 px-3 py-2"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.experience}
                    onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                  />
                </label>
              </>
            ) : null}

            {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            {message ? <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">{message}</p> : null}
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-white hover:bg-teal-700">Register</button>
            <p className="text-sm text-teal-700">
              Already have an account? <Link to="/login" className="font-medium underline">Login</Link>
            </p>
          </form>
        </div>
      </div>
      <CopyrightBar />
    </div>
  );
};

export default RegisterPage;
