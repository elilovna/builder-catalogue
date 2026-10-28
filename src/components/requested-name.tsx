"use client";

import { useParams } from "next/navigation";

type RequestedNameProps = {
  param: "username" | "setName";
};

const decode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const RequestedName = ({ param }: RequestedNameProps) => {
  const params = useParams<Record<RequestedNameProps["param"], string>>();

  return (
    <span className="font-mono wrap-anywhere" translate="no">
      {decode(params[param])}
    </span>
  );
};
