import { redirect } from "next/navigation";

/**
 * Root route — redirects to the Dashboard.
 * The actual app shell and pages live under the (app) route group.
 */
export default function RootPage() {
  redirect("/dashboard");
}
