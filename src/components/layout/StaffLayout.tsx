import { Bell, CircleAlert, FileText } from 'lucide-react'

import type { AppShellMenuItem } from './AppShell'
import RoleLayout from './RoleLayout'

const staffMenuItems: AppShellMenuItem[] = [
  {
    label: 'Danh sách báo cáo',
    path: '/staff/reports',
    icon: FileText,
  },
  {
    label: 'Báo cáo quá hạn',
    path: '/staff/overdue-reports',
    icon: CircleAlert,
  },
  {
    label: 'Thông báo',
    path: '/staff/notifications',
    icon: Bell,
  },
]

export default function StaffLayout() {
  return <RoleLayout role="Staff" title="Cổng cán bộ xử lý" menuItems={staffMenuItems} />
}
