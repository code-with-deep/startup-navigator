export const NAV_LINKS = [
  { label: 'Explore', href: '/explore' },
  { label: 'AI Search', href: '/ai-search' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about' },
] as const;

export const DASHBOARD_NAV = [
  { label: 'Overview', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Search History', href: '/dashboard/history', icon: 'History' },
  { label: 'Saved Articles', href: '/dashboard/saved', icon: 'Bookmark' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'User' },
] as const;

export const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Articles', href: '/admin/articles', icon: 'FileText' },
  { label: 'Resources', href: '/admin/resources', icon: 'Link' },
  { label: 'Users', href: '/admin/users', icon: 'Users' },
  { label: 'Knowledge Base', href: '/admin/knowledge-base', icon: 'Database' },
] as const;
