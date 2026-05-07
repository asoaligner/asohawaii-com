"use client";

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  inputId?: string;
};

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 10,
  inputId,
}: Props) {
  function clamp(n: number): number {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }
  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
      >
        Quantity
      </label>
      <div className="inline-flex items-stretch border border-gray-200 rounded-full overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          aria-label="Decrease quantity"
          className="px-3 text-navy hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <input
          id={inputId}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (Number.isFinite(n)) onChange(clamp(n));
          }}
          className="w-12 text-center text-navy bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          aria-label="Increase quantity"
          className="px-3 text-navy hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
