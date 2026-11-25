"use client";

import { useId, useRef } from "react";
import { chipLabel } from "@homebet/proveedores/chip-label";
import styles from "./demo-chip-picker.module.css";

export const DEMO_CHIP_AMOUNTS = [500, 1_000, 2_500, 5_000, 7_500, 10_000, 20_000, 50_000, 100_000] as const;

const credits = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });
const chipArt = [
  "/images/slots/guardian-jade/identity-v3/chip.webp",
  "/images/roulette/royal-gold/chip-0-v2.webp",
  "/images/roulette/royal-gold/chip-1-v2.webp",
  "/images/roulette/royal-gold/chip-2-v2.webp",
  "/images/roulette/royal-gold/chip-3-v2.webp",
];

function StakeChip({ amount, index }: { amount: number; index: number }) {
  const art = chipArt[Math.max(0, index) % chipArt.length];
  return (
    <span className={styles.stakeChip} aria-hidden="true" style={{ backgroundImage: `url("${art}")` }}>
      {chipLabel(Math.round(amount * 100)).toUpperCase()}
    </span>
  );
}

export function DemoChipPicker({ options, quickOptions, value, balance, disabled, onChange }: {
  options: readonly number[];
  quickOptions?: readonly number[];
  value: number;
  balance: number;
  disabled: boolean;
  onChange: (amount: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const visible = quickOptions && (quickOptions.includes(value)
    ? quickOptions : [...quickOptions.slice(0, -1), value].sort((first, second) => first - second));

  return (
    <div className={styles.stakes} data-quick={!!visible}>
      <span className={styles.stakeTitle}>Créditos por jugada</span>
      <button type="button" className={styles.stakePicker} disabled={disabled} aria-haspopup="dialog"
        aria-label={`Cambiar ficha, apuesta actual de ${credits.format(value)} créditos`}
        onClick={() => {
          dialog.current?.showModal();
          dialog.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]:not(:disabled)')?.focus();
        }}>
        {!visible && <StakeChip amount={value} index={options.indexOf(value)} />}
        <span>{visible ? "Ver todas" : "Cambiar ficha"}</span><span aria-hidden="true">⌄</span>
      </button>
      {visible && (
        <div className={styles.quickChips} role="group" aria-label="Fichas de acceso rápido">
          {visible.map((amount) => (
            <button key={amount} type="button" disabled={disabled || amount > balance}
              aria-label={`${credits.format(amount)} créditos`} aria-pressed={amount === value}
              onClick={() => onChange(amount)}>
              <StakeChip amount={amount} index={options.indexOf(amount)} />
            </button>
          ))}
        </div>
      )}
      <dialog ref={dialog} className={styles.chipDialog} aria-labelledby={title}>
        <header>
          <h2 id={title}>Elegí tu ficha</h2>
          <button type="button" className={styles.closeChips} aria-label="Cerrar selector de fichas"
            onClick={() => dialog.current?.close()}>×</button>
        </header>
        <div className={styles.chipGrid}>
          {options.map((amount, index) => (
            <button key={amount} type="button" disabled={disabled || amount > balance} aria-pressed={value === amount}
              aria-label={`${credits.format(amount)} créditos`} onClick={() => {
                onChange(amount);
                dialog.current?.close();
              }}>
              <StakeChip amount={amount} index={index} />
            </button>
          ))}
        </div>
      </dialog>
    </div>
  );
}
