import { Link } from 'react-router-dom';
import CopyrightBar from '../components/common/CopyrightBar';
import Logo from '../components/common/Logo';

const sections = [
  {
    title: '1. Information We Collect',
    points: [
      'Account data such as name, email, phone number, role, and profile image.',
      'Appointment and queue-related records including token details, scheduling activity, and status updates.',
      'Operational metadata such as timestamps and role-based interaction logs for service reliability and security.'
    ]
  },
  {
    title: '2. How We Use Information',
    points: [
      'To provide core platform functionality including booking, queue tracking, notifications, and reporting.',
      'To maintain role-based access control and prevent unauthorized access to sensitive records.',
      'To improve service quality, monitor performance, and support healthcare operations.'
    ]
  },
  {
    title: '3. Data Access and Security',
    points: [
      'Access is restricted by role so users can only view data relevant to their responsibilities.',
      'Passwords are stored as secure hashes and authentication is protected using token-based sessions.',
      'System safeguards are designed to reduce risk of unauthorized access and data misuse.'
    ]
  },
  {
    title: '4. Data Retention',
    points: [
      'Data is retained as needed for clinical operations, administration, and service continuity.',
      'Profile updates, appointment history, and queue records may be maintained for operational traceability.',
      'Retention may be adjusted to align with institutional policy and applicable regulations.'
    ]
  },
  {
    title: '5. User Rights and Requests',
    points: [
      'Users may request updates to inaccurate account information through profile management or support channels.',
      'Privacy and data-access concerns can be raised via official support contact methods.',
      'Institutions may define additional governance rules under their internal compliance requirements.'
    ]
  },
  {
    title: '6. Contact for Privacy Matters',
    points: [
      'Email: support@aarogyalink.com',
      'Phone: +977-9800000000',
      'Address: Kathmandu, Nepal'
    ]
  }
];

const PrivacyPage = () => {
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
        <h1 className="text-3xl font-bold text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-teal-800">Effective Date: April 2, 2026</p>
        <p className="mt-4 text-sm leading-relaxed text-teal-900/80">
          This Privacy Policy explains how AarogyaLink collects, uses, protects, and manages information used in digital
          healthcare appointment and queue operations.
        </p>

        <div className="mt-6 space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-card">
              <h2 className="text-lg font-semibold text-ink">{section.title}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-teal-900/80">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>

      <CopyrightBar />
    </div>
  );
};

export default PrivacyPage;
