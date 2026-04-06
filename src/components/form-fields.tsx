"use client";

import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";

type FieldSize = "large" | "small";
type SelectOption = { label: string; value: string } | string;

type BaseFieldProps = {
  className?: string;
  counter?: string;
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  label: string;
  required?: boolean;
  size?: FieldSize;
};

type FormTextFieldProps = BaseFieldProps &
  Omit<ComponentPropsWithoutRef<"input">, "children" | "onChange" | "size"> & {
    onValueChange: (value: string) => void;
    trailingAdornment?: ReactNode;
    value: string;
  };

type FormSelectFieldProps = BaseFieldProps &
  Omit<ComponentPropsWithoutRef<"select">, "children" | "onChange" | "size"> & {
    onValueChange: (value: string) => void;
    options: readonly SelectOption[];
    placeholder: string;
    value: string;
  };

const FIELD_SIZE_STYLES = {
  large: {
    control: "ai-type-body-md h-10 px-3",
    controlWithAdornment: "pr-10",
    label: "ai-type-label-xs",
    meta: "ai-type-body-xs",
    adornmentOffset: "right-3",
  },
  small: {
    control: "ai-type-body-sm h-8 px-2.5",
    controlWithAdornment: "pr-8",
    label: "ai-type-label-xs",
    meta: "ai-type-body-xs",
    adornmentOffset: "right-2.5",
  },
} satisfies Record<
  FieldSize,
  {
    adornmentOffset: string;
    control: string;
    controlWithAdornment: string;
    label: string;
    meta: string;
  }
>;

function normalizeOption(option: SelectOption) {
  return typeof option === "string"
    ? { label: option, value: option }
    : option;
}

function getControlStateClasses({
  disabled = false,
  hasError = false,
}: {
  disabled?: boolean;
  hasError?: boolean;
}) {
  if (disabled) {
    return "border-transparent bg-ai-surface-overlay-hover text-ai-text-placeholder";
  }

  if (hasError) {
    return "border-ai-text-negative text-ai-text-primary hover:border-ai-text-negative focus-within:border-ai-text-negative-hover focus-within:ring-1 focus-within:ring-ai-danger-focus-ring";
  }

  return "border-ai-border-strong text-ai-text-primary hover:border-ai-border-focus focus-within:border-ai-border-focus focus-within:ring-1 focus-within:ring-ai-neutral-focus-ring";
}

function DefaultSelectIndicator() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
      <path
        d="M4.5 6.25H11.5L8 10.25L4.5 6.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FieldContainer({
  children,
  className = "",
  counter,
  descriptionId,
  disabled = false,
  errorText,
  helperText,
  label,
  required = false,
  size = "large",
}: BaseFieldProps & {
  children: ReactNode;
  descriptionId?: string;
}) {
  const sizeStyles = FIELD_SIZE_STYLES[size];
  const supportingText = errorText ?? helperText;

  return (
    <label className={["flex flex-col gap-1", className].join(" ")}>
      <span
        className={[
          "",
          sizeStyles.label,
          disabled ? "text-ai-text-disabled" : "text-ai-text-secondary",
        ].join(" ")}
      >
        {label}
        {required ? "*" : ""}
      </span>

      {children}

      {supportingText || counter ? (
        <div className="flex items-start justify-between gap-3">
          <span
            id={supportingText ? descriptionId : undefined}
            className={[
              "",
              sizeStyles.meta,
              disabled
                ? "text-ai-text-disabled"
                : errorText
                  ? "text-ai-text-negative"
                  : "text-ai-text-meta",
            ].join(" ")}
          >
            {supportingText ?? " "}
          </span>
          {counter ? (
            <span
              className={[
                "shrink-0 text-right",
                sizeStyles.meta,
                errorText ? "text-ai-text-negative" : "text-ai-text-tertiary",
              ].join(" ")}
            >
              {counter}
            </span>
          ) : null}
        </div>
      ) : null}
    </label>
  );
}

export function FormTextField({
  className,
  counter,
  disabled = false,
  errorText,
  helperText,
  label,
  onValueChange,
  required = false,
  size = "large",
  trailingAdornment,
  value,
  ...inputProps
}: FormTextFieldProps) {
  const descriptionId = useId();
  const sizeStyles = FIELD_SIZE_STYLES[size];
  const hasAdornment = Boolean(trailingAdornment);
  const describedBy = errorText || helperText ? descriptionId : undefined;

  return (
    <FieldContainer
      className={className}
      counter={counter}
      descriptionId={descriptionId}
      disabled={disabled}
      errorText={errorText}
      helperText={helperText}
      label={label}
      required={required}
      size={size}
    >
      <div
        className={[
          "relative flex items-center overflow-hidden rounded-[4px] border bg-ai-surface-base transition-[border-color,box-shadow,background-color,color]",
          getControlStateClasses({
            disabled,
            hasError: Boolean(errorText),
          }),
        ].join(" ")}
      >
        <input
          {...inputProps}
          value={value}
          disabled={disabled}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={errorText ? true : undefined}
          onChange={(event) => onValueChange(event.target.value)}
          className={[
            "w-full min-w-0 bg-transparent outline-none placeholder:text-ai-text-placeholder",
            sizeStyles.control,
            hasAdornment ? sizeStyles.controlWithAdornment : "",
            disabled
              ? "cursor-not-allowed text-ai-text-placeholder"
              : "text-ai-text-primary",
          ].join(" ")}
        />
        {trailingAdornment ? (
          <span
            aria-hidden="true"
            className={[
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-ai-text-secondary",
              sizeStyles.adornmentOffset,
            ].join(" ")}
          >
            {trailingAdornment}
          </span>
        ) : null}
      </div>
    </FieldContainer>
  );
}

export function FormSelectField({
  className,
  counter,
  disabled = false,
  errorText,
  helperText,
  label,
  onValueChange,
  options,
  placeholder,
  required = false,
  size = "large",
  value,
  ...selectProps
}: FormSelectFieldProps) {
  const descriptionId = useId();
  const sizeStyles = FIELD_SIZE_STYLES[size];
  const describedBy = errorText || helperText ? descriptionId : undefined;

  return (
    <FieldContainer
      className={className}
      counter={counter}
      descriptionId={descriptionId}
      disabled={disabled}
      errorText={errorText}
      helperText={helperText}
      label={label}
      required={required}
      size={size}
    >
      <div
        className={[
          "relative flex items-center overflow-hidden rounded-[4px] border bg-ai-surface-base transition-[border-color,box-shadow,background-color,color]",
          getControlStateClasses({
            disabled,
            hasError: Boolean(errorText),
          }),
        ].join(" ")}
      >
        <select
          {...selectProps}
          value={value}
          disabled={disabled}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={errorText ? true : undefined}
          onChange={(event) => onValueChange(event.target.value)}
          className={[
            "w-full min-w-0 appearance-none bg-transparent outline-none",
            sizeStyles.control,
            sizeStyles.controlWithAdornment,
            disabled
              ? "cursor-not-allowed text-ai-text-placeholder"
              : value
                ? "text-ai-text-primary"
                : "text-ai-text-placeholder",
          ].join(" ")}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => {
            const normalizedOption = normalizeOption(option);

            return (
              <option key={normalizedOption.value} value={normalizedOption.value}>
                {normalizedOption.label}
              </option>
            );
          })}
        </select>
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-ai-text-secondary",
            sizeStyles.adornmentOffset,
          ].join(" ")}
        >
          <DefaultSelectIndicator />
        </span>
      </div>
    </FieldContainer>
  );
}
