import Link from "next/link";
import { Suspense } from "react";

import { MessagePage } from "@/components/message-page";
import { NotFoundBricks } from "@/components/not-found-bricks";
import { RequestedName } from "@/components/requested-name";
import { Button } from "@/components/ui/button";

const SetNotFound = () => (
  <MessagePage
    title={
      <>
        No set called{" "}
        <Suspense fallback="that name">
          <RequestedName param="setName" />
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
    Check the spelling of the set name in the address.
  </MessagePage>
);

export default SetNotFound;
