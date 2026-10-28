import Link from "next/link";
import { Suspense } from "react";

import { BrickAvatar } from "@/components/brick-avatar";
import { NavLink, NavLinkView } from "@/components/nav-link";

export const SiteHeader = () => (
  <header className="bg-studs text-white [--ring:var(--brand)]">
    {/* 80px tall, a multiple of the 40px stud grid, so the studs line up with the page header below. */}
    <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-8 px-4">
      <Link
        href="/"
        className="flex items-center gap-3 font-heading text-xl font-extrabold"
      >
        <BrickAvatar hex="var(--brand)" className="size-9" />
        {/* Phones get the brick only, so the nav keeps its margin. Screen readers still hear the name. */}
        <span className="max-sm:sr-only">Builder Catalogue</span>
      </Link>

      <nav aria-label="Main" className="flex gap-6">
        {/* Reading the URL must wait for a request, so the build uses the plain link until then. */}
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
