import Link from "next/link";
import { Suspense } from "react";

import { BrickAvatar } from "@/components/brick-avatar";
import { NavLink, NavLinkView } from "@/components/nav-link";

export const SiteHeader = () => (
  <header className="bg-studs text-white [--ring:var(--brand)]">
    <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-8 px-4">
      <Link
        href="/"
        className="flex items-center gap-3 font-heading text-xl font-extrabold"
      >
        <BrickAvatar hex="var(--brand)" className="size-9" />
        <span className="max-sm:sr-only">Builder Catalogue</span>
      </Link>

      <nav aria-label="Main" className="flex gap-6">
        <Suspense
          fallback={
            <>
              <NavLinkView href="/">Builders</NavLinkView>
              <NavLinkView href="/community">Community</NavLinkView>
            </>
          }
        >
          <NavLink href="/" section="/builders">
            Builders
          </NavLink>
          <NavLink href="/community" section="/community">
            Community
          </NavLink>
        </Suspense>
      </nav>
    </div>
  </header>
);
