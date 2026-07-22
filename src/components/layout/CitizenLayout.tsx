import RoleLayout from './RoleLayout'

const citizenMenuItems = [
  {
    label: 'Báo cáo của tôi',
    path: '/citizen/reports',
  },
]

export default function CitizenLayout() {
  return (
    <RoleLayout
      role="Citizen"
      title="Citizen Portal"
      menuItems={citizenMenuItems}
    />
  )
}