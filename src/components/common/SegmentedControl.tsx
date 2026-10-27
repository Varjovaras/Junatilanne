import type { ReactNode } from "react";

type SegmentedControlOption<T extends string> = {
    value: T;
    label: ReactNode;
};

type SegmentedControlProps<T extends string> = {
    value: T;
    onChange: (value: T) => void;
    options: ReadonlyArray<SegmentedControlOption<T>>;
    ariaLabel?: string;
};

const SegmentedControl = <T extends string>({
    value,
    onChange,
    options,
    ariaLabel,
}: SegmentedControlProps<T>) => (
    <div
        role="group"
        aria-label={ariaLabel}
        className="inline-flex flex-wrap justify-center gap-2 md:gap-0 md:flex-nowrap rounded-md border border-border overflow-hidden"
    >
        {options.map((option, index) => (
            <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                aria-pressed={value === option.value}
                className={`px-3 py-2 text-sm md:text-base ${
                    index > 0 ? "md:border-l border-border" : ""
                } ${
                    value === option.value
                        ? "bg-foreground text-background"
                        : "hover:bg-surface-hover"
                }`}
            >
                {option.label}
            </button>
        ))}
    </div>
);

export default SegmentedControl;
