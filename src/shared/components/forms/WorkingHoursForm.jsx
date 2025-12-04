import Button from "../ui/Button";

const daysOfWeek = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function WorkingHoursForm({
  workingHours,
  onChange,
  errors = {},
}) {
  const addWorkingHours = () => {
    onChange([...workingHours, { dayOfWeek: 1, start: "09:00", end: "17:00" }]);
  };

  const removeWorkingHours = (index) => {
    onChange(workingHours.filter((_, i) => i !== index));
  };

  const handleWorkingHoursChange = (index, field, value) => {
    const newWorkingHours = [...workingHours];
    newWorkingHours[index] = { ...newWorkingHours[index], [field]: value };
    onChange(newWorkingHours);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-lg font-semibold">Working Hours</h3>
        <Button
          type="button"
          onClick={addWorkingHours}
          variant="brand"
          size="sm"
        >
          + Add Hours
        </Button>
      </div>

      {workingHours.length === 0 && (
        <p className="text-gray-500 text-sm">
          No working hours set. Add hours to specify availability.
        </p>
      )}

      {workingHours.map((wh, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Schedule {index + 1}</h4>
            <button
              type="button"
              onClick={() => removeWorkingHours(index)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Day of Week
              </label>
              <select
                value={wh.dayOfWeek}
                onChange={(e) =>
                  handleWorkingHoursChange(
                    index,
                    "dayOfWeek",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {daysOfWeek.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={wh.start}
                onChange={(e) =>
                  handleWorkingHoursChange(index, "start", e.target.value)
                }
                style={{ minWidth: 0 }}
                className={`w-full max-w-full px-2 py-2 border rounded-lg text-sm ${
                  errors[`workingHours_${index}_start`]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors[`workingHours_${index}_start`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`workingHours_${index}_start`]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="time"
                value={wh.end}
                onChange={(e) =>
                  handleWorkingHoursChange(index, "end", e.target.value)
                }
                style={{ minWidth: 0 }}
                className={`w-full max-w-full px-2 py-2 border rounded-lg text-sm ${
                  errors[`workingHours_${index}_end`]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors[`workingHours_${index}_end`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`workingHours_${index}_end`]}
                </p>
              )}
            </div>
          </div>
          {errors[`workingHours_${index}_range`] && (
            <p className="text-red-500 text-xs mt-2">
              {errors[`workingHours_${index}_range`]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
