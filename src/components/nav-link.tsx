"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type NavLinkViewProps = {
  href: Route;
  ariaCurrent?: "page" | "true";
  children: ReactNode;
};

export const NavLinkView = ({
  href,
  ariaCurrent,
  children,
}: NavLinkViewProps) => (
  <Link
    href={href}
    aria-current={ariaCurrent}
    className={cn(
      "border-b-2 px-1 py-2.5 text-[15px] font-medium",
      ariaCurrent
        ? "border-brand text-white"
        : "border-transparent text-on-dark-muted hover:text-white",
    )}
  >
    {children}
  </Link>
);

type NavLinkProps = {
  href: Route;
  section: string;
  children: ReactNode;
};

export const NavLink = ({ href, section, children }: NavLinkProps) => {
  const pathname = usePathname();

  let ariaCurrent: "page" | "true" | undefined;
  if (pathname === href) {
    ariaCurrent = "page";
  } else if (pathname.startsWith(section)) {
    ariaCurrent = "true";
  }

  return (
    <NavLinkView href={href} ariaCurrent={ariaCurrent}>
      {children}
    </NavLinkView>
  );
};
