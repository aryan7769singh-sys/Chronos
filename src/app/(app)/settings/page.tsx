import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserSettings } from "@/services/settings.service";
import { SettingsView } from "@/features/settings/components/SettingsView";

export const metadata = {
  title: "Settings & Personalization — Chronos",
  description: "Configure system preferences, focus intervals, calendar layout, audio alerts, and hotkeys.",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/settings");
  }

  const settings = await getUserSettings(session.user.id);

  return (
    <SettingsView
      initialSettings={settings}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    />
  );
}
