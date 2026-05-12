"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { APPLIANCES } from "@/data/appliances";
import { applianceHeroImage, applianceItems } from "./applianceItems";
import ApplianceDetails from "./ApplianceDetails";
import {
  applianceConfigKey,
  type ApplianceConfig,
  type ToothSelection,
} from "./types";

type Props = {
  /** "Upper" or "Lower" — drives the heading. */
  archLabel: string;
  selected: ApplianceConfig[];
  onChange: (next: ApplianceConfig[]) => void;
  /** When true, the controls are disabled (used when archSync is on
   *  for the lower arch). */
  readOnly?: boolean;
  /** Initial set of expanded appliance ids — used by URL prefill so a
   *  ?product=...&item=... link auto-opens the right section. */
  initiallyExpanded?: string[];
  /** When set, only this appliance is shown initially; the rest of the
   *  catalogue is collapsed behind a "See other products" button. Used
   *  when the user arrives from a product page so the form opens
   *  focused on what they clicked. */
  pinnedApplianceId?: string;
  /** Case-level tooth selection. Each ApplianceDetails panel renders a
   *  compact tooth chart at its top so the doctor sees / edits the
   *  selection while configuring that appliance. State is intentionally
   *  shared across all panels (case-wide, not per-appliance). */
  toothSelection: ToothSelection;
  onToothSelectionChange: (next: ToothSelection) => void;
};

type ZoomState = { src: string; alt: string } | null;

function ThumbButton({
  src,
  alt,
  size,
  onOpen,
}: {
  src: string;
  alt: string;
  size: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpen();
      }}
      aria-label={`Enlarge ${alt}`}
      className="group relative shrink-0 rounded-md overflow-hidden bg-gray-50 border border-gray-200 hover:border-navy/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/50 transition-colors"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
      />
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
        </svg>
      </span>
    </button>
  );
}

export default function ApplianceSelector({
  archLabel,
  selected,
  onChange,
  readOnly = false,
  initiallyExpanded = [],
  pinnedApplianceId,
  toothSelection,
  onToothSelectionChange,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(initiallyExpanded)
  );
  const [zoom, setZoom] = useState<ZoomState>(null);
  const hasValidPin =
    !!pinnedApplianceId &&
    APPLIANCES.some((a) => a.id === pinnedApplianceId);
  const [showOthers, setShowOthers] = useState<boolean>(!hasValidPin);
  const visibleAppliances =
    !showOthers && hasValidPin
      ? APPLIANCES.filter((a) => a.id === pinnedApplianceId)
      : APPLIANCES;
  const hiddenCount = APPLIANCES.length - visibleAppliances.length;
  const selectedKeys = new Set(selected.map(applianceConfigKey));

  useEffect(() => {
    if (!zoom) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoom(null);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom]);

  function toggleExpand(id: string) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleParent(id: string) {
    if (readOnly) return;
    if (selectedKeys.has(id)) {
      onChange(selected.filter((c) => applianceConfigKey(c) !== id));
    } else {
      // Parent ("General inquiry — no specific SKU") and specific SKUs
      // for the same appliance are mutually exclusive — clear all
      // existing entries for this appliance before adding the parent.
      const filtered = selected.filter((c) => c.applianceId !== id);
      onChange([...filtered, { applianceId: id }]);
      // Auto-expand when first selected so the user sees the fields.
      setExpanded((s) => new Set(s).add(id));
    }
  }

  function toggleSku(
    applianceId: string,
    code: string | undefined,
    name: string
  ) {
    if (readOnly) return;
    const key = code
      ? `${applianceId}:${code}`
      : `${applianceId}:name:${name}`;
    if (selectedKeys.has(key)) {
      onChange(selected.filter((c) => applianceConfigKey(c) !== key));
    } else {
      // Drop the parent "General inquiry" row for this appliance, if
      // present — it stops making sense once a specific SKU is picked
      // and would otherwise render as a duplicate config block.
      const filtered = selected.filter(
        (c) =>
          !(
            c.applianceId === applianceId &&
            !c.itemCode &&
            !c.itemName
          )
      );
      onChange([
        ...filtered,
        { applianceId, itemCode: code, itemName: name },
      ]);
    }
  }

  function updateConfig(key: string, next: ApplianceConfig) {
    onChange(
      selected.map((c) => (applianceConfigKey(c) === key ? next : c))
    );
  }

  function removeConfig(key: string) {
    onChange(selected.filter((c) => applianceConfigKey(c) !== key));
  }

  function selectedConfigsFor(applianceId: string): ApplianceConfig[] {
    return selected.filter((c) => c.applianceId === applianceId);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-xs uppercase tracking-widest text-brandOrange font-medium">
          {archLabel} appliance(s)
        </div>
        <div className="text-[11.5px] text-gray-500">
          {!showOthers && hasValidPin
            ? `1 of ${APPLIANCES.length} products · click to expand`
            : `${APPLIANCES.length} products · click to expand`}
        </div>
      </div>

      {readOnly ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/40 px-4 py-5 text-[13.5px] text-gray-600">
          Mirroring upper arch selection. Toggle off &quot;use same appliance
          for upper and lower&quot; to configure independently.
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {visibleAppliances.map((a) => {
            const items = applianceItems(a.id);
            const heroImage = applianceHeroImage(a.id);
            const hasItems = items.length > 0;
            const isOpen = expanded.has(a.id);
            const parentChecked = selectedKeys.has(a.id);
            const configsForThis = selectedConfigsFor(a.id);
            const totalChecked = configsForThis.length;

            return (
              <div key={a.id}>
                {/* HEADER — uniform for all appliances */}
                <div
                  className={`flex items-center gap-3 px-4 sm:px-5 py-3 transition-colors ${
                    totalChecked > 0
                      ? "bg-brandOrange/[0.04]"
                      : "hover:bg-gray-50/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(a.id)}
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${a.name}`}
                    className="shrink-0 inline-flex w-6 h-6 items-center justify-center text-gray-500 hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/40 rounded transition-colors"
                  >
                    <span
                      aria-hidden
                      className={`inline-flex transition-transform ${isOpen ? "rotate-90" : ""}`}
                    >
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 4l4 4-4 4" />
                      </svg>
                    </span>
                  </button>
                  {heroImage && (
                    <ThumbButton
                      src={heroImage}
                      alt={a.name}
                      size={40}
                      onOpen={() => setZoom({ src: heroImage, alt: a.name })}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => toggleExpand(a.id)}
                    className="text-[14px] text-navy leading-snug font-medium text-left flex-1 hover:text-brandOrange transition-colors"
                  >
                    {a.name}
                  </button>
                  {totalChecked > 0 && (
                    <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-widest bg-brandOrange/15 text-brandOrange px-2 py-0.5 rounded-full">
                      {totalChecked} selected
                    </span>
                  )}
                  <span className="text-[11.5px] text-gray-400">
                    {hasItems
                      ? `${items.length} item${items.length === 1 ? "" : "s"}`
                      : "configure"}
                  </span>
                </div>

                {/* EXPANDED PANEL */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 pt-1 bg-gray-50/40 border-t border-gray-100 space-y-3">
                    {hasItems ? (
                      <>
                        <label
                          className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 cursor-pointer ${
                            parentChecked ? "bg-white" : "hover:bg-white/70"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={parentChecked}
                            onChange={() => toggleParent(a.id)}
                            className="accent-navy shrink-0"
                          />
                          <span className="text-[13px] text-gray-700 italic">
                            General inquiry — no specific SKU
                          </span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {items.map((it) => {
                            const itemName = it.name;
                            const skuKey = it.code
                              ? `${a.id}:${it.code}`
                              : `${a.id}:name:${itemName}`;
                            const checked = selectedKeys.has(skuKey);
                            return (
                              <label
                                key={skuKey}
                                className={`flex items-start gap-2.5 rounded-md px-2.5 py-1.5 cursor-pointer transition-colors ${
                                  checked
                                    ? "bg-white border border-navy/20"
                                    : "hover:bg-white/70 border border-transparent"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    toggleSku(a.id, it.code, itemName)
                                  }
                                  className="mt-0.5 accent-navy shrink-0"
                                />
                                {it.image && (
                                  <ThumbButton
                                    src={it.image}
                                    alt={`${it.code ? `${it.code} ` : ""}${itemName}`}
                                    size={48}
                                    onOpen={() =>
                                      setZoom({
                                        src: it.image!,
                                        alt: `${it.code ? `${it.code} ` : ""}${itemName}`,
                                      })
                                    }
                                  />
                                )}
                                <span className="text-[13px] text-navy leading-snug min-w-0">
                                  {it.code && (
                                    <span className="text-brandOrange font-semibold mr-1.5">
                                      {it.code}
                                    </span>
                                  )}
                                  {itemName}
                                  {it.note && (
                                    <span className="block text-[11px] text-gray-500 mt-0.5">
                                      {it.note}
                                    </span>
                                  )}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      // Appliances WITHOUT SKUs: a single inline checkbox to
                      // include the appliance, surfaced inside the expansion
                      // alongside the dynamic configuration.
                      <label
                        className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 cursor-pointer ${
                          parentChecked ? "bg-white" : "hover:bg-white/70"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={parentChecked}
                          onChange={() => toggleParent(a.id)}
                          className="accent-navy shrink-0"
                        />
                        <span className="text-[13px] text-gray-700 italic">
                          Include this appliance in the order
                        </span>
                      </label>
                    )}

                    {/* INLINE configuration for each selected entry */}
                    {configsForThis.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {configsForThis.map((c) => {
                          const key = applianceConfigKey(c);
                          return (
                            <ApplianceDetails
                              key={key}
                              config={c}
                              onChange={(next) => updateConfig(key, next)}
                              onRemove={() => removeConfig(key)}
                              toothSelection={toothSelection}
                              onToothSelectionChange={onToothSelectionChange}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {!showOthers && hasValidPin && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowOthers(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[13px] font-medium text-navy hover:bg-gray-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/40 transition-colors"
            >
              <span>See other products ({hiddenCount} more)</span>
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* IMAGE LIGHTBOX */}
      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoom.alt}
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setZoom(null)}
            aria-label="Close enlarged image"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-navy shadow-lg flex items-center justify-center hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange/60 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 4l8 8M12 4L4 12" />
            </svg>
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] w-full"
          >
            <Image
              src={zoom.src}
              alt={zoom.alt}
              width={1200}
              height={900}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="w-full h-auto max-h-[88vh] object-contain rounded-lg bg-white"
              priority
            />
            <div className="mt-3 text-center text-white/85 text-sm font-medium">
              {zoom.alt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
