import dayjs from "dayjs";
import { Sunrise, Sun, Moon, Clock } from 'lucide-react';

/**
 * Group time slots by period (Morning / Afternoon / Evening)
 * Better UX than showing a long flat list
 */
export function groupSlotsByPeriod(slots, salonTz = "Europe/London") {
  const morning = [];
  const afternoon = [];
  const evening = [];

  slots.forEach((slot) => {
    const hour = dayjs(slot.startISO).tz(salonTz).hour();
    
    if (hour < 12) {
      morning.push(slot);
    } else if (hour < 17) {
      afternoon.push(slot);
    } else {
      evening.push(slot);
    }
  });

  return [
    { label: "Morning", slots: morning, icon: Sunrise },
    { label: "Afternoon", slots: afternoon, icon: Sun },
    { label: "Evening", slots: evening, icon: Moon },
  ].filter((period) => period.slots.length > 0);
}

/**
 * TimeSlotButton - Consistent 44px height, clear visual hierarchy
 */
export function TimeSlotButton({ slot, isSelected, onClick, salonTz }) {
  const time = dayjs(slot.startISO).tz(salonTz).format("h:mm A");
  
  return (
    <button
      type="button"
      onClick={() => onClick(slot)}
      className={`
        h-11 px-4 rounded-lg
        font-medium text-base
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-1
        ${isSelected
          ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2 scale-[1.02]'
          : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
        }
      `}
      data-testid="time-slot"
      data-time={dayjs(slot.startISO).tz(salonTz).format("HH:mm")}
    >
      {time}
    </button>
  );
}

/**
 * TimeSlotsGrouped - Display slots grouped by period with headers
 */
export function TimeSlotsGrouped({ slots, selectedSlot, onSelect, salonTz }) {
  const periods = groupSlotsByPeriod(slots, salonTz);

  if (periods.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" strokeWidth={1.5} />
        <p className="font-bold text-gray-900 text-lg mb-2">
          No available times
        </p>
        <p className="text-sm text-gray-500">
          Please try selecting a different date
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {periods.map((period) => {
        const IconComponent = period.icon;
        return (
          <div key={period.label}>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <IconComponent className="w-4 h-4" strokeWidth={2} />
              <span>{period.label}</span>
              <span className="text-gray-400 font-normal">
                ({period.slots.length} available)
              </span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {period.slots.map((slot) => (
                <TimeSlotButton
                  key={slot.startISO}
                  slot={slot}
                  isSelected={selectedSlot?.startISO === slot.startISO}
                  onClick={onSelect}
                  salonTz={salonTz}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
