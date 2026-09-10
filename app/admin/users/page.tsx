import { requireAdmin } from "@/lib/auth/admin"
import { getRecentUsers, getUserCount } from "@/lib/db/queries"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  await requireAdmin()

  const [users, total] = await Promise.all([getRecentUsers(50), getUserCount()])

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <p className="mt-1 text-sm text-white/50">
        {total} registered {total === 1 ? "account" : "accounts"} · newest first
      </p>

      {/* Registered accounts only. Anonymous visitors never reach this table —
          that number comes from GA4, on the Analytics tab. */}
      <div className="mt-8 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] text-left text-xs uppercase tracking-wider text-white/35">
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.03]">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="size-6 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="size-6 shrink-0 rounded-full bg-white/10" />
                    )}
                    <span className="truncate text-white/85">
                      {user.displayName ?? "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-white/55">{user.email || "—"}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ${
                      user.role === "admin"
                        ? "bg-amber-400/10 text-amber-300 ring-amber-400/20"
                        : "bg-white/[0.06] text-white/50 ring-white/10"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-white/40">
                  {user.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-white/45">
            No users yet.
          </p>
        ) : null}
      </div>
    </div>
  )
}
