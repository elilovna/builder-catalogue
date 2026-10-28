import type { ReactNode } from "react";

export const DarkChip = ({ children }: { children: ReactNode }) => (
  <li className="inline-flex h-6 items-center rounded-full bg-white/10 px-2.5 text-xs font-medium tabular-nums">
    {children}
  </li>
);
