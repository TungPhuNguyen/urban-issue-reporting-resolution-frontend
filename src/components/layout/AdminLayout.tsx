import {
  Bell,
  Building2,
  CircleAlert,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  MapPin,
  Route,
  ScrollText,
  Tags,
  Timer,
} from 'lucide-react'

import type { AppShellMenuItem } from './AppShell'
import RoleLayout from './RoleLayout'

const adminMenuItems: AppShellMenuItem[] = [
  {
    label: 'Tổng quan',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Tất cả báo cáo',
    path: '/admin/reports',
    icon: FileText,
    end: true,
  },
  {
    label: 'Phân công thủ công',
    path: '/admin/reports/manual-assignment',
    icon: ClipboardCheck,
  },
  {
    label: 'Quy tắc phân tuyến',
    path: '/admin/routing-rules',
    icon: Route,
  },
  {
    label: 'Cấu hình SLA',
    path: '/admin/sla-configs',
    icon: Timer,
  },
  {
    label: 'Danh mục',
    path: '/admin/categories',
    icon: Tags,
  },
  {
    label: 'Khu vực',
    path: '/admin/areas',
    icon: MapPin,
  },
  {
    label: 'Đơn vị xử lý',
    path: '/admin/departments',
    icon: Building2,
  },
  {
    label: 'Thông báo',
    path: '/admin/notifications',
    icon: Bell,
  },
  {
    label: 'Báo cáo quá hạn',
    path: '/admin/overdue-reports',
    icon: CircleAlert,
  },
  {
    label: 'Nhật ký hệ thống',
    path: '/admin/audit-logs',
    icon: ScrollText,
  },
]

export default function AdminLayout() {
  return <RoleLayout role="Admin" title="Cổng quản trị" menuItems={adminMenuItems} />
}
