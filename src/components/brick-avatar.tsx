import { cn } from "@/lib/utils";

type BrickAvatarProps = {
  hex: string;
  className?: string;
};

export const BrickAvatar = ({ hex, className }: BrickAvatarProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "inline-block size-7 shrink-0 rounded-md bg-[radial-gradient(circle,rgb(255_255_255/0.4)_0_5px,rgb(0_0_0/0.16)_5.5px_7px,transparent_7.5px)] shadow-[inset_0_-4px_0_rgb(0_0_0/0.22)]",
      className,
    )}
    style={{ backgroundColor: hex }}
  />
);
