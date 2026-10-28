import type { ReactNode } from "react";

type MessagePageProps = {
  title: ReactNode;
  children: ReactNode;
  action: ReactNode;
  art?: ReactNode;
};

export const MessagePage = ({
  title,
  children,
  action,
  art,
}: MessagePageProps) => (
  // The 404 bricks start bigger than they end. Next to the screen edge they would widen
  // the page for a moment, so the band cuts off what is past the edge: none of it shows.
  <div className="overflow-x-clip bg-studs text-white [--ring:var(--brand)]">
    <div className="mx-auto grid w-full max-w-6xl items-center gap-x-10 gap-y-8 px-4 pt-6 pb-10 lg:grid-cols-[1fr_auto]">
      <div className="grid max-w-[56ch] justify-items-start gap-3.5">
        <h1 className="text-[clamp(1.9rem,1.3rem+2.2vw,3rem)] leading-[1.1] font-extrabold">
          {title}
        </h1>
        <p className="text-lg text-on-dark-muted">{children}</p>
        <div className="pt-2">{action}</div>
      </div>
      {art}
    </div>
  </div>
);
