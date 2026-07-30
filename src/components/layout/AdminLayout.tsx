import RoleLayout from './RoleLayout'

const adminMenuItems = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
  },
  {
    label: 'Tất cả báo cáo',
    path: '/admin/reports',
  },
  {
    label: 'Phân công thủ công',
    path: '/admin/reports/manual-assignment',
  },
  {
    label: 'Routing Rules',
    path: '/admin/routing-rules',
  },
  {
    label: 'SLA Configs',
    path: '/admin/sla-configs',
  },
  {
    label: 'Categories',
    path: '/admin/categories',
  },
  {
    label: 'Areas',
    path: '/admin/areas',
  },
  {
    label: 'Departments',
    path: '/admin/departments',
  },
  {
    label: 'Thông báo',
    path: '/admin/notifications',
  },
  {
    label: 'Báo cáo quá hạn',
    path: '/admin/overdue-reports',
  },
  {
    label: 'Nhật ký hệ thống',
    path: '/admin/audit-logs',
  },
]

export default function AdminLayout() {
  return <RoleLayout role="Admin" title="Admin Portal" menuItems={adminMenuItems} />
}
