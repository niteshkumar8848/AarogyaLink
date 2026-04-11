import { Link } from 'react-router-dom';
import CopyrightBar from '../components/common/CopyrightBar';
import Logo from '../components/common/Logo';

const contactCards = [
  {
    title: 'General Support',
    image: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=200&q=60',
    content: [
      'Email: support@aarogyalink.com',
      'Phone: +977-9800000000',
      'Hours: Sunday to Friday, 9:00 AM – 6:00 PM'
    ]
  },
  {
    title: 'Hospital Operations Help',
    image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=200&q=60',
    content: [
      'Queue management and token flow support',
      'Doctor onboarding and approval issues',
      'Appointment workflow guidance'
    ]
  },
  {
    title: 'Office Location',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=200&q=60',
    content: [
      'AarogyaLink Support Office',
      'Kathmandu, Nepal',
      'For enterprise onboarding, contact via email first'
    ]
  }
];

const ContactPage = () => {
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
          backgroundImage: `url('https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '260px'
        }}
      >
        <div className="absolute inset-0 bg-teal-900/70"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl font-bold">Support & Contact</h1>
          <p className="mt-2 text-sm opacity-90">
            We’re here to assist patients, doctors, and healthcare administrators
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-10">

        {/* INTRO */}
        <div className="mb-8 text-center">
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our support team helps you with account access, appointment issues,
            queue management, and technical assistance to ensure smooth healthcare operations.
          </p>
        </div>

        {/* CONTACT CARDS */}
        <div className="grid gap-6 md:grid-cols-3">
          {contactCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-teal-100 bg-white p-6 shadow-md hover:shadow-xl transition duration-300"
            >
              <div className="flex items-center gap-4">
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-14 w-14 rounded-xl object-cover shadow-sm"
                />
                <h2 className="text-lg font-semibold text-gray-800">
                  {card.title}
                </h2>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                {card.content.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-teal-500">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* RESPONSE SECTION */}
        <section className="mt-10 rounded-2xl border border-teal-100 bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            Response Targets
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-gray-600 text-center">
            <div className="p-4 rounded-xl bg-teal-50">
              <p className="font-semibold text-teal-700">Critical Issues</p>
              <p className="mt-1">Within 4 business hours</p>
            </div>
            <div className="p-4 rounded-xl bg-teal-50">
              <p className="font-semibold text-teal-700">Operational Requests</p>
              <p className="mt-1">Within 1 business day</p>
            </div>
            <div className="p-4 rounded-xl bg-teal-50">
              <p className="font-semibold text-teal-700">General Inquiries</p>
              <p className="mt-1">Within 2 business days</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            Need immediate help? Reach out via email for faster assistance.
          </p>
        </div>

      </main>

      <CopyrightBar />
    </div>
  );
};

export default ContactPage;