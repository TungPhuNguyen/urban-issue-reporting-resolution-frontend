import RoleLayout from './RoleLayout'

const staffMenuItems = [
  {
    label: 'Danh sách báo cáo',
    path: '/staff/reports',
  },
  {
    label: 'Báo cáo quá hạn',
    path: '/staff/overdue-reports',
  },
  {
    label: 'Thông báo',
    path: '/staff/notifications',
  },
]

export default function StaffLayout() {
  return <RoleLayout role="Staff" title="Staff Portal" menuItems={staffMenuItems} />
}
