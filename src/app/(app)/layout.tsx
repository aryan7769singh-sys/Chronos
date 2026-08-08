import { AppLayout } from "@/components/layout/AppLayout";
import { auth } from "@/lib/auth";

/**
 * Route group layout for all authenticated app pages.
 * Wraps every page inside the (app) group with the AppLayout shell.
 * The (app) folder name is not reflected in the URL.
 */
export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return <AppLayout user={session?.user}>{children}</AppLayout>;
}

