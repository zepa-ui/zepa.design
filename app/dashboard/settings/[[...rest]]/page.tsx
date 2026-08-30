import { UserProfile } from "@clerk/nextjs"

/**
 * Clerk's `<UserProfile />` covers email, password, connected accounts,
 * active devices and account deletion. Catch-all segment because it routes
 * its own sub-pages.
 *
 * Zepa-specific preferences (theme, email digests) would live alongside this
 * once they exist — they belong in Neon, not in Clerk.
 */
export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-white/50">
        Manage your account, sign-in methods and connected devices.
      </p>

      <div className="mt-8">
        <UserProfile
          routing="path"
          path="/dashboard/settings"
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full shadow-none border border-white/10",
            },
          }}
        />
      </div>
    </div>
  )
}
