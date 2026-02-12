import { Check } from "lucide-react";

/**
 * BookingProgress - Progress indicator for booking flow
 *
 * Shows current step and completed steps
 * Clear labels make the flow feel inevitable
 */
export default function BookingProgress({ currentStep }) {
  const steps = [
    { id: 1, name: "Services", path: "specialists" },
    { id: 2, name: "Specialist", path: "specialists" },
    { id: 3, name: "Date & Time", path: "times" },
    { id: 4, name: "Details", path: "checkout" },
    { id: 5, name: "Confirm", path: "confirmation" },
  ];

  return (
    <nav aria-label="Booking progress" className="mb-8">
      <ol className="flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const isComplete = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <li key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex items-center gap-2">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold
                    transition-all duration-200
                    ${
                      isComplete
                        ? "bg-black text-white"
                        : isCurrent
                        ? "bg-black text-white ring-4 ring-gray-200"
                        : "bg-gray-200 text-gray-500"
                    }
                  `}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" strokeWidth={2.5} />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Name (hidden on mobile) */}
                <span
                  className={`
                    hidden sm:block text-sm font-medium
                    ${isCurrent ? "text-gray-900" : "text-gray-500"}
                  `}
                >
                  {step.name}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-8 sm:w-12 h-0.5 mx-2
                    ${isComplete ? "bg-black" : "bg-gray-200"}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
