"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
}

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(
  (
    {
      className,
      minRows = 1,
      maxRows = 10,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const combinedRef = useCombinedRefs(ref, textareaRef);
    const [textareaValue, setTextareaValue] = React.useState(
      value || defaultValue || ""
    );

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";

      // Calculate the height based on scrollHeight
      const lineHeight = Number.parseInt(getComputedStyle(textarea).lineHeight);
      const paddingTop = Number.parseInt(getComputedStyle(textarea).paddingTop);
      const paddingBottom = Number.parseInt(
        getComputedStyle(textarea).paddingBottom
      );

      const minHeight = minRows * lineHeight + paddingTop + paddingBottom;
      const maxHeight = maxRows * lineHeight + paddingTop + paddingBottom;

      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, minHeight),
        maxHeight
      );

      textarea.style.height = `${newHeight}px`;

      // Add overflow if content exceeds maxHeight
      textarea.style.overflowY =
        textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [minRows, maxRows]);

    // Handle controlled component
    React.useEffect(() => {
      if (value !== undefined && value !== textareaValue) {
        setTextareaValue(value as string);
      }
    }, [value, textareaValue]);

    // Adjust height on mount and when content changes
    React.useEffect(() => {
      adjustHeight();
    }, [textareaValue, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      }

      if (value === undefined) {
        // Only update internal state if uncontrolled
        setTextareaValue(e.target.value);
      }
    };

    return (
      <textarea
        ref={combinedRef}
        className={cn(
          "w-full resize-none overflow-hidden border-none bg-transparent py-2 focus:outline-none focus:ring-0",
          className
        )}
        onChange={handleChange}
        value={value !== undefined ? value : textareaValue}
        rows={minRows}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = "AutoResizeTextarea";

// Helper to combine refs
function useCombinedRefs<T>(
  ...refs: Array<React.ForwardedRef<T> | React.RefObject<T> | null>
) {
  const targetRef = React.useRef<T>(null);

  React.useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(targetRef.current);
      } else {
        (ref as React.MutableRefObject<T | null>).current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}
