"use client";

import { useParams } from "next/navigation";

type RequestedNameProps = {
  param: "username" | "setName";
};

const decode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value; // a broken %-escape: show it as typed
  }
};

export const RequestedName = ({ param }: RequestedNameProps) => {
  const params = useParams<Record<RequestedNameProps["param"], string>>();

  return (
    // Anything can be typed in the address, so a long name with no spaces wraps anywhere
    // rather than run past the edge of the screen.
    <span className="font-mono wrap-anywhere" translate="no">
      {decode(params[param])}
    </span>
  );
};
