import { Link } from 'react-router-dom';
import CopyrightBar from '../components/common/CopyrightBar';
import Logo from '../components/common/Logo';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-teal-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
            <Logo className="h-9 w-9" />
            <span>AarogyaLink</span>
          </Link>
          <div className="flex gap-2 text-sm">
            <Link to="/login" className="rounded border border-teal-200 px-3 py-1 text-teal-700">Login</Link>
            <Link to="/register" className="rounded bg-primary px-3 py-1 text-white">Register</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold text-ink">Support & Contact</h1>
        <p className="mt-4 text-sm leading-relaxed text-teal-900/80">
          Our support team assists patients, doctors, and hospital administrators with account access, appointment issues,
          queue operations, and technical concerns.
        </p>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-teal-100 bg-white p-5 shadow-card">
            <h2 className="text-lg font-semibold text-ink">General Support</h2>
            <p className="mt-2 text-sm text-teal-900/80"><strong>Email:</strong> support@aarogyalink.com</p>
            <p className="mt-1 text-sm text-teal-900/80"><strong>Phone:</strong> +977-9800000000</p>
            <p className="mt-1 text-sm text-teal-900/80"><strong>Hours:</strong> Sunday to Friday, 9:00 AM to 6:00 PM</p>
          </article>

          <article className="rounded-2xl border border-teal-100 bg-white p-5 shadow-card">
            <h2 className="text-lg font-semibold text-ink">Hospital Operations Help</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-teal-900/80">
              <li>Queue management and token flow support</li>
              <li>Doctor onboarding and approval issues</li>
              <li>Appointment scheduling workflow guidance</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-teal-100 bg-white p-5 shadow-card">
            <h2 className="text-lg font-semibold text-ink">Office Location</h2>
            <p className="mt-2 text-sm text-teal-900/80">AarogyaLink Support Office</p>
            <p className="text-sm text-teal-900/80">Kathmandu, Nepal</p>
            <p className="mt-2 text-sm text-teal-900/80">For enterprise onboarding, contact us by email first.</p>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-teal-100 bg-white p-5 shadow-card">
          <h2 className="text-lg font-semibold text-ink">Response Targets</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm text-teal-900/80">
            <p><strong>Critical access issues:</strong> within 4 business hours</p>
            <p><strong>Operational requests:</strong> within 1 business day</p>
            <p><strong>General inquiries:</strong> within 2 business days</p>
          </div>
        </section>
      </main>

      <CopyrightBar />
    </div>
  );
};

export default ContactPage;
