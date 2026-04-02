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
    control: "h-10 px-3 text-[15px] leading-[1.35] tracking-[-0.015em]",
    controlWithAdornment: "pr-10",
    label: "text-[12px] leading-[1.25]",
    meta: "text-[12px] leading-[1.25]",
    adornmentOffset: "right-3",
  },
  small: {
    control: "h-8 px-2.5 text-[14px] leading-[1.25] tracking-[-0.01em]",
    controlWithAdornment: "pr-8",
    label: "text-[12px] leading-[1.25]",
    meta: "text-[12px] leading-[1.25]",
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
    return "border-transparent bg-black/[0.06] text-black/35";
  }

  if (hasError) {
    return "border-[#cb112d]/85 text-black/90 hover:border-[#cb112d] focus-within:border-[#8a0015] focus-within:ring-1 focus-within:ring-[#8a0015]/20";
  }

  return "border-black/55 text-black/90 hover:border-black/75 focus-within:border-black/90 focus-within:ring-1 focus-within:ring-black/15";
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
          "font-panel-text font-semibold",
          sizeStyles.label,
          disabled ? "text-black/32" : "text-black/74",
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
              "font-panel-text",
              sizeStyles.meta,
              disabled
                ? "text-black/30"
                : errorText
                  ? "text-[#cb112d]"
                  : "text-black/52",
            ].join(" ")}
          >
            {supportingText ?? " "}
          </span>
          {counter ? (
            <span
              className={[
                "font-panel-text shrink-0 text-right",
                sizeStyles.meta,
                errorText ? "text-[#cb112d]" : "text-black/45",
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
          "relative flex items-center overflow-hidden rounded-[4px] border bg-white transition-[border-color,box-shadow,background-color,color]",
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
            "font-panel-text w-full min-w-0 bg-transparent outline-none placeholder:text-black/35",
            sizeStyles.control,
            hasAdornment ? sizeStyles.controlWithAdornment : "",
            disabled ? "cursor-not-allowed text-black/35" : "text-black/90",
          ].join(" ")}
        />
        {trailingAdornment ? (
          <span
            aria-hidden="true"
            className={[
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-black/70",
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
          "relative flex items-center overflow-hidden rounded-[4px] border bg-white transition-[border-color,box-shadow,background-color,color]",
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
            "font-panel-text w-full min-w-0 appearance-none bg-transparent outline-none",
            sizeStyles.control,
            sizeStyles.controlWithAdornment,
            disabled
              ? "cursor-not-allowed text-black/35"
              : value
                ? "text-black/90"
                : "text-black/35",
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
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-black/70",
            sizeStyles.adornmentOffset,
          ].join(" ")}
        >
          <DefaultSelectIndicator />
        </span>
      </div>
    </FieldContainer>
  );
}
