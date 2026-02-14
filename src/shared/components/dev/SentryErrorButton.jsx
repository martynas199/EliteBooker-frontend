import * as Sentry from "@sentry/react";

export default function SentryErrorButton() {
  return (
    <button
      type="button"
      onClick={() => {
        Sentry.logger.info("User triggered test error", {
          action: "test_error_button_click",
        });
        throw new Error("This is your first error!");
      }}
      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
    >
      Break the world
    </button>
  );
}
