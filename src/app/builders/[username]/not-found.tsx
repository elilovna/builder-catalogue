import Link from "next/link";
import { Suspense } from "react";

import { MessagePage } from "@/components/message-page";
import { NotFoundBricks } from "@/components/not-found-bricks";
import { RequestedName } from "@/components/requested-name";
import { Button } from "@/components/ui/button";

const BuilderNotFound = () => (
  <MessagePage
    title={
      <>
        No builder called{" "}
        <Suspense fallback="that name">
          <RequestedName param="username" />
        </Suspense>
      </>
    }
    art={<NotFoundBricks />}
    action={
      <Button asChild size="xl" variant="brand">
        <Link href="/">All builders</Link>
      </Button>
    }
  >
    Check the spelling, or go back and pick a builder from the catalogue.
  </MessagePage>
);

export default BuilderNotFound;
