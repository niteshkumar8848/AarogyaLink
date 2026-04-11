import { Link } from 'react-router-dom';
import CopyrightBar from '../components/common/CopyrightBar';
import Logo from '../components/common/Logo';

const sections = [
  {
    title: 'Acceptance of Terms',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=200&q=60',
    points: [
      'By accessing AarogyaLink, you agree to comply with all platform policies and legal terms.',
      'If you do not agree, you must discontinue use immediately.',
      'These terms apply to patients, doctors, administrators, and healthcare staff.'
    ]
  },
  {
    title: 'Platform Scope',
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=200&q=60',
    points: [
      'AarogyaLink provides appointment scheduling, queue tracking, and workflow tools.',
      'We do not provide diagnosis, treatment, or emergency services.',
      'Medical responsibility remains with certified healthcare professionals.'
    ]
  },
  {
    title: 'Account Responsibilities',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=200&q=60',
    points: [
      'Provide accurate and up-to-date account information.',
      'Maintain confidentiality of login credentials.',
      'Report unauthorized access or suspicious activity immediately.'
    ]
  },
  {
    title: 'Acceptable Use Policy',
    image: 'https://images.unsplash.com/photo-1528747045269-390fe33c19f2?auto=format&fit=crop&w=200&q=60',
    points: [
      'Do not create fake bookings or submit misleading information.',
      'Unauthorized system access or misuse is strictly prohibited.',
      'Admins must ensure compliance with healthcare policies.'
    ]
  },
  {
    title: 'Service Availability',
    image: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=200&q=60',
    points: [
      'The platform may undergo maintenance or updates.',
      'Features may evolve to improve healthcare workflows.',
      'We aim to minimize downtime and ensure data integrity.'
    ]
  },
  {
    title: 'Limitation of Liability',
    image: 'https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?auto=format&fit=crop&w=200&q=60',
    points: [
      'AarogyaLink is not responsible for medical decisions or outcomes.',
      'We are not liable for delays in treatment or emergencies.',
      'Users must comply with local laws and healthcare regulations.'
    ]
  },
  {
    title: 'Suspension & Termination',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=200&q=60',
    points: [
      'Accounts may be suspended for violations or misuse.',
      'Doctor accounts may require admin approval.',
      'Repeated violations may result in permanent bans.'
    ]
  }
];

const TermsPage = () => {
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
          backgroundImage: `url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '260px'
        }}
      >
        <div className="absolute inset-0 bg-teal-900/70"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl font-bold">Terms & Conditions</h1>
          <p className="mt-2 text-sm opacity-90">Effective Date: April 2, 2026</p>
        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-10">

        <div className="mb-8 text-center">
          <p className="text-gray-600 max-w-2xl mx-auto">
            These Terms & Conditions define the rules and responsibilities for using AarogyaLink.
            Our goal is to ensure a secure, efficient, and compliant healthcare experience.
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
            If you have questions, please{' '}
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

export default TermsPage;