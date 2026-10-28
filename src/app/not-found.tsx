import type { Metadata } from "next";
import Link from "next/link";

import { MessagePage } from "@/components/message-page";
import { NotFoundBricks } from "@/components/not-found-bricks";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

const NotFound = () => (
  <MessagePage
    title="Page not found"
    art={<NotFoundBricks />}
    action={
      <Button asChild size="xl" variant="brand">
        <Link href="/">Go to the home page</Link>
      </Button>
    }
  >
    There is no page at this address.
  </MessagePage>
);

export default NotFound;
