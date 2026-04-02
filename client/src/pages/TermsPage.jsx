import { Link } from 'react-router-dom';
import CopyrightBar from '../components/common/CopyrightBar';
import Logo from '../components/common/Logo';

const sections = [
  {
    title: '1. Acceptance of Terms',
    points: [
      'By accessing or using AarogyaLink, you agree to comply with these Terms & Conditions.',
      'If you do not agree with these terms, please discontinue use of the platform immediately.',
      'These terms apply to patients, doctors, administrators, and any authorized healthcare staff using the system.'
    ]
  },
  {
    title: '2. Platform Scope',
    points: [
      'AarogyaLink provides digital appointment scheduling, queue tracking, and operational workflow tools.',
      'The platform does not provide medical diagnosis, treatment, or emergency medical intervention.',
      'Clinical responsibility remains with licensed healthcare providers and registered medical institutions.'
    ]
  },
  {
    title: '3. Account Responsibilities',
    points: [
      'Users must provide accurate, current, and complete account information.',
      'You are responsible for maintaining the confidentiality of your login credentials.',
      'You must promptly report unauthorized account use, suspicious activity, or data access concerns.'
    ]
  },
  {
    title: '4. Acceptable Use',
    points: [
      'Users must not submit false appointments, spam requests, or fraudulent patient records.',
      'Attempting unauthorized access, role escalation, or system abuse is strictly prohibited.',
      'Hospitals and admins are expected to manage records responsibly and in compliance with applicable policy.'
    ]
  },
  {
    title: '5. Service Availability and Changes',
    points: [
      'The platform may undergo maintenance, updates, or temporary downtime for operational improvements.',
      'Features and workflows may be updated to meet healthcare operations, compliance, and security needs.',
      'We will make reasonable efforts to minimize service disruption and preserve data integrity.'
    ]
  },
  {
    title: '6. Limitation of Liability',
    points: [
      'AarogyaLink is provided as a healthcare operations platform and not a substitute for medical judgment.',
      'We are not liable for clinical decisions, treatment outcomes, or emergency response delays.',
      'Users and institutions remain responsible for local operational, legal, and regulatory compliance.'
    ]
  },
  {
    title: '7. Suspension and Termination',
    points: [
      'Accounts may be suspended or terminated for policy violations, misuse, or security threats.',
      'Doctor access may require administrative approval before account activation.',
      'Repeated abuse may result in permanent access restrictions.'
    ]
  }
];

const TermsPage = () => {
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
        <h1 className="text-3xl font-bold text-ink">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-teal-800">Effective Date: April 2, 2026</p>
        <p className="mt-4 text-sm leading-relaxed text-teal-900/80">
          These Terms & Conditions govern access to and use of AarogyaLink for appointment scheduling, queue management,
          and healthcare operational coordination.
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

export default TermsPage;
