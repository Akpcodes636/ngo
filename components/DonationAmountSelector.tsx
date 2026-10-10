"use client";

import clsx from "clsx";
import { donationAmountsNGN } from "@/data/site";

export function DonationAmountSelector({
  selected,
  customAmount,
  onSelect,
  onCustomAmountChange,
}: {
  selected: number | "custom" | null;
  customAmount: string;
  onSelect: (value: number | "custom") => void;
  onCustomAmountChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {donationAmountsNGN.map((amount) => {
          const isActive = selected === amount;
          return (
            <button
              key={amount}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(amount)}
              className={clsx(
                "rounded-md border-2 px-4 py-3.5 text-center text-base font-bold transition-colors",
                isActive
                  ? "border-forest-700 bg-forest-700 text-white"
                  : "border-forest-200 bg-white text-forest-800 hover:border-forest-500"
              )}
            >
              ₦{amount.toLocaleString("en-NG")}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={selected === "custom"}
          onClick={() => onSelect("custom")}
          className={clsx(
            "rounded-md border-2 px-4 py-3.5 text-center text-base font-bold transition-colors",
            selected === "custom"
              ? "border-forest-700 bg-forest-700 text-white"
              : "border-forest-200 bg-white text-forest-800 hover:border-forest-500"
          )}
        >
          Custom Amount
        </button>
      </div>

      {selected === "custom" && (
        <div className="mt-4">
          <label
            htmlFor="custom-amount"
            className="mb-1.5 block text-sm font-semibold text-forest-800"
          >
            Enter amount (₦)
          </label>
          <input
            id="custom-amount"
            type="number"
            min={100}
            inputMode="numeric"
            value={customAmount}
            onChange={(e) => onCustomAmountChange(e.target.value)}
            placeholder="e.g. 15000"
            required
            className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-[3px] focus-visible:outline-gold-500"
          />
        </div>
      )}
    </div>
  );
}
