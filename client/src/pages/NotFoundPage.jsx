import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-4xl font-bold text-ink">404</h1>
      <p className="text-teal-700">The page you requested does not exist.</p>
      <Link to="/" className="rounded-lg bg-primary px-4 py-2 text-white">Go Home</Link>
    </div>
  );
};

export default NotFoundPage;
