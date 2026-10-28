import { notFound } from "next/navigation";

import { getBuilder } from "@/catalog/queries";

// Next.js's dev-only instant check reports notFound() for an unknown name as an error.
export const instant = false;

const BuilderSetsLayout = async ({
  children,
  params,
}: LayoutProps<"/builders/[username]/sets">) => {
  const { username } = await params;
  const builder = await getBuilder(username);

  if (!builder) {
    notFound();
  }

  return children;
};

export default BuilderSetsLayout;
