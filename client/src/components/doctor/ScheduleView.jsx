const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getHospitalId = (item) => String(item?.hospitalId?._id || item?.hospitalId || '');
const getHospitalName = (item, index) => item?.hospitalId?.name || item?.hospitalName || `Hospital ${index + 1}`;

const normalizeSlot = (slot = {}) => ({
  startTime: String(slot.startTime || '09:00'),
  endTime: String(slot.endTime || '09:30')
});

const normalizeDay = (day = {}) => ({
  day: String(day.day || ''),
  slots: (day.slots || []).map(normalizeSlot)
});

const ScheduleView = ({ schedule, onChange }) => {
  const hospitals = Array.isArray(schedule) ? schedule : [];

  const updateHospital = (hospitalIndex, nextSchedule) => {
    onChange(
      hospitals.map((item, index) =>
        index === hospitalIndex
          ? {
              ...item,
              schedule: nextSchedule
            }
          : item
      )
    );
  };

  const toggleDay = (hospitalIndex, dayName) => {
    const current = (hospitals[hospitalIndex]?.schedule || []).map(normalizeDay);
    const exists = current.some((item) => item.day === dayName);
    const next = exists
      ? current.filter((item) => item.day !== dayName)
      : [...current, { day: dayName, slots: [{ startTime: '09:00', endTime: '09:30' }] }];
    const sorted = next.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
    updateHospital(hospitalIndex, sorted);
  };

  const addSlot = (hospitalIndex, dayName) => {
    const current = (hospitals[hospitalIndex]?.schedule || []).map(normalizeDay);
    const next = current.map((item) =>
      item.day === dayName
        ? {
            ...item,
            slots: [...item.slots, { startTime: '09:00', endTime: '09:30' }]
          }
        : item
    );
    updateHospital(hospitalIndex, next);
  };

  const updateSlot = (hospitalIndex, dayName, slotIndex, key, value) => {
    const current = (hospitals[hospitalIndex]?.schedule || []).map(normalizeDay);
    const next = current.map((item) =>
      item.day === dayName
        ? {
            ...item,
            slots: item.slots.map((slot, index) =>
              index === slotIndex ? { ...slot, [key]: value } : slot
            )
          }
        : item
    );
    updateHospital(hospitalIndex, next);
  };

  const removeSlot = (hospitalIndex, dayName, slotIndex) => {
    const current = (hospitals[hospitalIndex]?.schedule || []).map(normalizeDay);
    const next = current.map((item) =>
      item.day === dayName
        ? {
            ...item,
            slots: item.slots.filter((_, index) => index !== slotIndex)
          }
        : item
    );
    updateHospital(hospitalIndex, next);
  };

  if (!hospitals.length) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <p className="text-sm text-teal-700">No hospital linked yet. Select hospital in profile first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hospitals.map((hospitalSchedule, hospitalIndex) => (
        <div key={getHospitalId(hospitalSchedule) || hospitalIndex} className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm text-teal-600">Hospital</p>
          <p className="text-base font-semibold text-ink">{getHospitalName(hospitalSchedule, hospitalIndex)}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const selected = (hospitalSchedule.schedule || []).some((item) => item.day === day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(hospitalIndex, day)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    selected
                      ? 'border-primary bg-teal-100 text-teal-900'
                      : 'border-teal-200 bg-white text-teal-700'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-4">
            {(hospitalSchedule.schedule || [])
              .slice()
              .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
              .map((daySchedule) => (
                <div key={daySchedule.day} className="rounded-xl border border-teal-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-ink">{daySchedule.day}</p>
                    <button
                      type="button"
                      onClick={() => addSlot(hospitalIndex, daySchedule.day)}
                      className="rounded-lg border border-teal-300 px-2 py-1 text-xs text-teal-700"
                    >
                      Add Slot
                    </button>
                  </div>

                  <div className="mt-2 space-y-2">
                    {(daySchedule.slots || []).map((slot, slotIndex) => (
                      <div key={`${daySchedule.day}-${slotIndex}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                        <input
                          type="time"
                          value={slot.startTime || '09:00'}
                          onChange={(e) => updateSlot(hospitalIndex, daySchedule.day, slotIndex, 'startTime', e.target.value)}
                          className="rounded-lg border border-teal-200 px-3 py-2 text-sm"
                        />
                        <input
                          type="time"
                          value={slot.endTime || '09:30'}
                          onChange={(e) => updateSlot(hospitalIndex, daySchedule.day, slotIndex, 'endTime', e.target.value)}
                          className="rounded-lg border border-teal-200 px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeSlot(hospitalIndex, daySchedule.day, slotIndex)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {!daySchedule.slots?.length ? (
                      <p className="text-xs text-teal-700">No time slots added yet for this day.</p>
                    ) : null}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleView;
