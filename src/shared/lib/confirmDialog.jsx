import React from "react";
import { createRoot } from "react-dom/client";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

export function confirmDialog({
  title = "Confirm action",
  message = "Are you sure you want to continue?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
} = {}) {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);

    const cleanup = (result) => {
      resolve(result);
      setTimeout(() => {
        root.unmount();
        container.remove();
      }, 0);
    };

    root.render(
      <Modal
        open
        onClose={() => cleanup(false)}
        title={title}
        size="sm"
        variant="dashboard"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => cleanup(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={variant}
              onClick={() => cleanup(true)}
            >
              {confirmLabel}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700">{message}</p>
      </Modal>,
    );
  });
}

export default confirmDialog;
