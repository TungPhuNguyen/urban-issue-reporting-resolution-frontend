import RoleLayout from './RoleLayout'

const adminMenuItems = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
  },
]

export default function AdminLayout() {
  return (
    <RoleLayout
      role="Admin"
      title="Admin Portal"
      menuItems={adminMenuItems}
    />
  )
}