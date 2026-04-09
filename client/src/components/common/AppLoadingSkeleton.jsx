const pulseClass = 'animate-pulse rounded-lg bg-teal-100';

const AppLoadingSkeleton = ({ title = 'Loading' }) => {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-teal-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-teal-100 animate-pulse" />
            <div className="h-5 w-28 rounded bg-teal-100 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 rounded-full bg-teal-100 animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-teal-100 animate-pulse" />
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-2 px-4 pb-3">
          <div className="h-8 w-24 rounded-full bg-teal-100 animate-pulse" />
          <div className="h-8 w-24 rounded-full bg-teal-100 animate-pulse" />
          <div className="h-8 w-24 rounded-full bg-teal-100 animate-pulse" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <div className="mb-4 h-8 w-56 rounded bg-teal-100 animate-pulse" />
        <p className="mb-4 text-sm text-teal-700">{title}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-card">
            <div className={`h-5 w-40 ${pulseClass}`} />
            <div className={`mt-4 h-4 w-full ${pulseClass}`} />
            <div className={`mt-2 h-4 w-5/6 ${pulseClass}`} />
            <div className={`mt-2 h-4 w-2/3 ${pulseClass}`} />
          </div>
          <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-card">
            <div className={`h-5 w-36 ${pulseClass}`} />
            <div className={`mt-4 h-4 w-full ${pulseClass}`} />
            <div className={`mt-2 h-4 w-4/5 ${pulseClass}`} />
            <div className={`mt-2 h-4 w-3/5 ${pulseClass}`} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLoadingSkeleton;
