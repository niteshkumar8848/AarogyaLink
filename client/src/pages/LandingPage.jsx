import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';
import Footer from '../components/common/Footer';

const stats = [
  { label: 'Partner Hospitals', value: '25+' },
  { label: 'Appointments Processed', value: '50,000+' },
  { label: 'Queue Update Reliability', value: '99%' }
];

const coreFeatures = [
  {
    title: 'Unified Multi-Hospital Booking',
    description: 'Patients can find doctors across hospitals, compare availability, and book appointments from one portal.'
  },
  {
    title: 'Real-Time Token Queue Tracking',
    description: 'Token progress, current call, and estimated wait time are updated live to reduce uncertainty on arrival.'
  },
  {
    title: 'Role-Based Operations',
    description: 'Dedicated patient, doctor, and admin portals with permission-controlled actions and secure access.'
  },
  {
    title: 'Operational Analytics',
    description: 'Administrators can track patient flow and consultation trends to support operational planning.'
  }
];

const workflow = [
  { step: '1', title: 'Book Appointment', text: 'Choose doctor, hospital, and available time slot from a single system.' },
  { step: '2', title: 'Receive Token', text: 'Get booking confirmation with queue token and live wait-time visibility.' },
  { step: '3', title: 'Manage Flow', text: 'Care teams update queue status in real time for coordinated patient movement.' }
];

const LandingPage = () => {
  const [hideTopBar, setHideTopBar] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setHideTopBar(window.scrollY > 80);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#d1fae5_0%,#f8fafc_45%,#ffffff_100%)]">
      <header
        className={`sticky top-0 z-20 border-b border-teal-100/70 bg-white/90 backdrop-blur transition-transform duration-300 ${
          hideTopBar ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo className="h-9 w-9" />
            <p className="text-lg font-semibold text-ink">AarogyaLink</p>
          </div>
          <div className="flex items-center gap-2">
            <Link className="rounded-lg border border-teal-300 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50" to="/login">
              Login
            </Link>
            <Link className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-teal-700" to="/register">
              Register
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-14">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
              Digital Appointment & Queue Platform
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-ink md:text-5xl">
              Doctor appointment scheduling and real-time queue management for multi-hospital care delivery.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-teal-900/80">
              AarogyaLink centralizes booking, token assignment, and queue visibility for patients, doctors, and hospital
              administrators, helping reduce waiting-room congestion and improve service coordination.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700">
                Register
              </Link>
              <Link to="/login" className="rounded-lg border border-teal-300 px-6 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                Login
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-xl border border-teal-100 bg-white p-3 shadow-card">
                  <p className="text-2xl font-bold text-primary">{item.value}</p>
                  <p className="text-xs text-teal-700">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-card">
            <div className="rounded-2xl bg-teal-50 p-4">
              <p className="text-sm font-semibold text-teal-700">Queue Tracker Preview</p>
              <p className="mt-2 text-4xl font-bold text-primary">Token #42</p>
              <div className="mt-4 grid gap-2 text-sm text-teal-900/80 sm:grid-cols-2">
                <p>Current Token: <strong>38</strong></p>
                <p>Your Position: <strong>4</strong></p>
                <p>Estimated Wait: <strong>18 min</strong></p>
                <p>Doctor Status: <strong>Available</strong></p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {['Appointment reminders', 'Queue turn alerts', 'Walk-in token support', 'Department queue controls'].map((text) => (
                <div key={text} className="rounded-xl border border-teal-100 p-3">
                  <p className="text-sm font-medium text-ink">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Core Capabilities</p>
            <h2 className="text-2xl font-bold text-ink md:text-3xl">Designed for day-to-day hospital operations</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {coreFeatures.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-card">
                <h3 className="text-lg font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-teal-900/80">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-4 lg:grid-cols-3">
          {workflow.map((item) => (
            <article key={item.step} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-card">
              <p className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                {item.step}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-teal-900/80">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-700 to-teal-600 p-8 text-white shadow-card">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-100">Get Started</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Adopt a more organized and transparent patient flow.</h2>
              <p className="mt-2 text-sm text-teal-50/90">
                Create an account to begin appointment booking, queue tracking, and role-based hospital operations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                Register Now
              </Link>
              <Link to="/login" className="rounded-lg border border-teal-200 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500/40">
                Login
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
