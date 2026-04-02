const ScheduleView = ({ schedule, onChange }) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="text-sm text-teal-700">Weekly Schedule (JSON for quick editing)</p>
      <textarea
        className="mt-2 h-64 w-full rounded-lg border border-teal-200 p-3 font-mono text-xs"
        value={JSON.stringify(schedule, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange(parsed);
          } catch {
            // wait for valid JSON
          }
        }}
      />
    </div>
  );
};

export default ScheduleView;
