import RoleLayout from './RoleLayout'

const staffMenuItems = [
  {
    label: 'Danh sách báo cáo',
    path: '/staff/reports',
  },
]

export default function StaffLayout() {
  return (
    <RoleLayout
      role="Staff"
      title="Staff Portal"
      menuItems={staffMenuItems}
    />
  )
}