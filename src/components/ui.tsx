import Link from "next/link";

export const inputCls =
  "block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      {children}
      {hint && <span className="block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

const BTN = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-stone-300",
  secondary: "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 disabled:text-stone-400",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
};

type BtnProps = { variant?: keyof typeof BTN; className?: string };

export function Button({
  variant = "primary",
  className = "",
  ...props
}: BtnProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${BTN[variant]} ${className}`}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: BtnProps & React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${BTN[variant]} ${className}`}
    />
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-stone-600">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
