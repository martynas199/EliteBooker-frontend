import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";

function PromptDialogContent({
  title,
  message,
  placeholder,
  initialValue,
  confirmLabel,
  cancelLabel,
  required,
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState(initialValue);

  const handleConfirm = () => {
    const trimmedValue = value.trim();
    if (required && !trimmedValue) {
      return;
    }
    onConfirm(trimmedValue);
  };

  return (
    <Modal
      open
      onClose={onCancel}
      title={title}
      size="sm"
      variant="dashboard"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={required && !value.trim()}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-700 whitespace-pre-line">{message}</p>
        <Input
          autoFocus
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleConfirm();
            }
          }}
        />
      </div>
    </Modal>
  );
}

export function promptDialog({
  title = "Enter value",
  message = "Please enter a value.",
  placeholder = "Type here",
  initialValue = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  required = false,
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
      <PromptDialogContent
        title={title}
        message={message}
        placeholder={placeholder}
        initialValue={initialValue}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        required={required}
        onConfirm={(value) => cleanup(value)}
        onCancel={() => cleanup(null)}
      />,
    );
  });
}

export default promptDialog;
