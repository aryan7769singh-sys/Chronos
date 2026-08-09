import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOverlayHUDData } from "@/services/overlay.service";
import { OverlayShell } from "@/features/overlay/components/OverlayShell";

export const metadata = {
  title: "Command HUD Overlay — Chronos",
  description: "Calm, persistent heads-up display showing active focus session, current task, and upcoming time blocks.",
};

export default async function OverlayPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/overlay");
  }

  const data = await getOverlayHUDData(session.user.id);

  return <OverlayShell data={data} />;
}
