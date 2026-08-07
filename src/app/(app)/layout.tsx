import { AppLayout } from "@/components/layout/AppLayout";

/**
 * Route group layout for all authenticated app pages.
 * Wraps every page inside the (app) group with the AppLayout shell.
 * The (app) folder name is not reflected in the URL.
 */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
