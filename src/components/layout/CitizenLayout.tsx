import { Bell, FileText } from 'lucide-react'

import type { AppShellMenuItem } from './AppShell'
import RoleLayout from './RoleLayout'

const citizenMenuItems: AppShellMenuItem[] = [
  {
    label: 'Báo cáo của tôi',
    path: '/citizen/reports',
    icon: FileText,
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
