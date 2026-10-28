import { notFound } from "next/navigation";

import { getBuilder } from "@/catalog/queries";

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
