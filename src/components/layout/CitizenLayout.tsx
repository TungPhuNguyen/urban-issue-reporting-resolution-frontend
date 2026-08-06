import { Bell, FileSearch, FileText, Plus } from 'lucide-react'

import type { AppShellMenuItem } from './AppShell'
import RoleLayout from './RoleLayout'

const citizenMenuItems: AppShellMenuItem[] = [
  {
    label: 'Tạo báo cáo',
    path: '/citizen/reports/create',
    icon: Plus,
    accent: true,
  },
  {
    label: 'Báo cáo của tôi',
    path: '/citizen/reports',
    icon: FileText,
  },
  {
    label: 'Tra cứu theo mã',
    path: '/citizen/reports/lookup',
    icon: FileSearch,
  },
  {
    label: 'Thông báo',
    path: '/citizen/notifications',
    icon: Bell,
  },
]

export default function CitizenLayout() {
  return (
    <RoleLayout
      role="Citizen"
      title="Cổng thông tin người dân"
      menuItems={citizenMenuItems}
    />
  )
}
