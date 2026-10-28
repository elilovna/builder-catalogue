"use client";

import { useEffect } from "react";

import { MessagePage } from "@/components/message-page";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: unknown;
  retry: () => void;
};

const ErrorPage = ({ error, retry }: ErrorPageProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MessagePage
      title="We could not reach the catalogue"
      action={
        <Button size="xl" variant="brand" onClick={() => retry()}>
          Try again
        </Button>
      }
    >
      The catalogue API did not answer, or sent data we could not read, so
      nothing was calculated. Try again in a moment.
    </MessagePage>
  );
};

export default ErrorPage;
