import { headers } from 'next/headers'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { LogoutButton } from '@/components/LogoutButton'

export const metadata = { title: 'Admin — Repeat Dance' }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Login page gets a bare layout — no sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 bottom-0 w-56 bg-black text-white flex flex-col border-r border-white/10 z-30">
        <div className="p-5 border-b border-white/10">
          <Logo variant="white" size="sm" />
          <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <AdminNavLink href="/admin">Dashboard</AdminNavLink>
          <AdminNavLink href="/admin/orders">Orders</AdminNavLink>
          <AdminNavLink href="/admin/inventory">Inventory</AdminNavLink>
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="block text-xs text-white/40 hover:text-white transition-colors"
          >
            ← View Store
          </Link>
          <LogoutButton />
        </div>
      </aside>
      <div className="pl-56">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-colors"
    >
      {children}
    </Link>
  )
}
