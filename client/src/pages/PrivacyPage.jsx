import { Link } from 'react-router-dom';
import CopyrightBar from '../components/common/CopyrightBar';
import Logo from '../components/common/Logo';

const sections = [
  {
    title: 'Information We Collect',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=200&q=60',
    points: [
      'Account data such as name, email, phone number, role, and profile image.',
      'Appointment and queue records including scheduling activity and status updates.',
      'Operational metadata such as timestamps and interaction logs.'
    ]
  },
  {
    title: 'How We Use Information',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=60',
    points: [
      'To provide booking, queue tracking, notifications, and reporting.',
      'To maintain role-based access and protect sensitive data.',
      'To improve service quality and healthcare operations.'
    ]
  },
  {
    title: 'Data Access and Security',
    image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=200&q=60',
    points: [
      'Access is restricted based on user roles.',
      'Passwords are securely hashed with token-based authentication.',
      'Security measures reduce risk of unauthorized access.'
    ]
  },
  {
    title: 'Data Retention',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=200&q=60',
    points: [
      'Data is retained for operations and service continuity.',
      'Appointment history and records may be stored for traceability.',
      'Retention aligns with policy and regulations.'
    ]
  },
  {
    title: 'User Rights and Requests',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=200&q=60',
    points: [
      'Users can update inaccurate information.',
      'Privacy concerns can be raised via support.',
      'Institutions may define additional governance rules.'
    ]
  },
  {
    title: 'Contact for Privacy Matters',
    image: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=200&q=60',
    points: [
      'Email: support@aarogyalink.com',
      'Phone: +977-9800000000',
      'Address: Kathmandu, Nepal'
    ]
  }
];

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-gray-800">
            <Logo className="h-9 w-9" />
            <span className="text-lg font-bold">AarogyaLink</span>
          </Link>

          <div className="flex gap-2 text-sm">
            <Link to="/login" className="rounded-lg border border-teal-300 px-4 py-1.5 text-teal-700 hover:bg-teal-50 transition">
              Login
            </Link>
            <Link to="/register" className="rounded-lg bg-teal-600 px-4 py-1.5 text-white hover:bg-teal-700 transition shadow-md">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '260px'
        }}
      >
        <div className="absolute inset-0 bg-teal-900/70"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-sm opacity-90">Effective Date: April 2, 2026</p>
        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-10">

        <div className="mb-8 text-center">
          <p className="text-gray-600 max-w-2xl mx-auto">
            This Privacy Policy explains how AarogyaLink collects, uses, protects, and manages your data
            to ensure a secure and efficient healthcare experience.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-teal-100 bg-white p-6 shadow-md hover:shadow-xl transition duration-300"
            >
              {/* IMAGE HEADER */}
              <div className="flex items-center gap-4">
                <img
                  src={section.image}
                  alt={section.title}
                  className="h-14 w-14 rounded-xl object-cover shadow-sm"
                />
                <h2 className="text-lg font-semibold text-gray-800">
                  {section.title}
                </h2>
              </div>

              {/* CONTENT */}
              <ul className="mt-4 space-y-2 text-sm text-gray-600 leading-relaxed">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="text-teal-500">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* FOOT NOTE */}
        <div className="mt-12 rounded-xl bg-teal-50 border border-teal-100 p-6 text-center">
          <p className="text-sm text-gray-600">
            For any privacy-related concerns, please{' '}
            <Link to="/contact" className="text-teal-600 font-medium hover:underline">
              contact our support team
            </Link>.
          </p>
        </div>

      </main>

      <CopyrightBar />
    </div>
  );
};

export default PrivacyPage;