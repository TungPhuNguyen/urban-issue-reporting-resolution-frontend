import { useState, type FormEvent } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { useDepartments } from '@/features/admin/departments/departments.queries'
import { ApiError } from '@/lib/api/http'

import { useChangeUserStatus, useSaveStaff, useUser, useUsers } from './users.queries'
import type { AdminUserSummary, StaffInput } from './users.types'

const PAGE_SIZE = 20
const EMPTY_STAFF: StaffInput = { fullName: '', email: '', password: '', departmentId: 0 }

export function UsersListPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [roleName, setRoleName] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [staffForm, setStaffForm] = useState<StaffInput | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const usersQuery = useUsers({
    search: appliedSearch || undefined,
    roleName: roleName || undefined,
    departmentId: departmentId ? Number(departmentId) : undefined,
    isActive: activeFilter === '' ? undefined : activeFilter === 'true',
    pageNumber,
    pageSize: PAGE_SIZE,
  })
  const departmentsQuery = useDepartments({
    isActive: true,
    pageNumber: 1,
    pageSize: 100,
  })
  const detailQuery = useUser(detailId)
  const statusMutation = useChangeUserStatus()
  const staffMutation = useSaveStaff()

  async function toggle(user: AdminUserSummary) {
    const reason = window.prompt(
      user.isActive ? 'Nhập lý do khóa tài khoản:' : 'Nhập lý do mở tài khoản:',
      user.isActive ? 'Khóa tài khoản theo quyết định quản trị' : 'Mở lại tài khoản',
    )
    if (!reason?.trim()) return
    setActionError(null)
    try {
      await statusMutation.mutateAsync({ id: user.id, isActive: !user.isActive, reason })
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : 'Không thể đổi trạng thái tài khoản.',
      )
    }
  }

  async function saveStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!staffForm) return
    if (
      !staffForm.fullName.trim() ||
      !staffForm.email.trim() ||
      !staffForm.departmentId ||
      (!staffForm.id && !staffForm.password)
    ) {
      setActionError('Vui lòng nhập đầy đủ thông tin Staff.')
      return
    }
    setActionError(null)
    try {
      await staffMutation.mutateAsync(staffForm)
      setStaffForm(null)
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : 'Không thể lưu tài khoản Staff.',
      )
    }
  }

  const page = usersQuery.data
  return (
    <section className="resource-page users-page flex flex-col gap-5">
      <div className="page-heading page-heading--split">
        <div>
          <Badge variant="danger">Quản trị truy cập</Badge>
          <h1>Người dùng &amp; nhân sự</h1>
          <p>Quản lý Citizen, Staff, Admin và trạng thái tài khoản.</p>
        </div>
        <Button onClick={() => setStaffForm(EMPTY_STAFF)}>Tạo tài khoản Staff</Button>
      </div>
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}
      <Card className="panel filter-bar filter-bar--wrap grid gap-3 md:grid-cols-5">
        <form
          className="flex gap-2 md:col-span-2"
          onSubmit={(e) => {
            e.preventDefault()
            setAppliedSearch(search.trim())
            setPageNumber(1)
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tên hoặc email"
            className="h-10 min-w-0 flex-1 rounded-lg border border-gray-300 px-3"
          />
          <Button type="submit">Tìm</Button>
        </form>
        <select
          value={roleName}
          onChange={(e) => {
            setRoleName(e.target.value)
            setPageNumber(1)
          }}
          className="h-10 rounded-lg border border-gray-300 px-3"
        >
          <option value="">Tất cả vai trò</option>
          <option value="Citizen">Citizen</option>
          <option value="Staff">Staff</option>
          <option value="Admin">Admin</option>
        </select>
        <select
          value={departmentId}
          onChange={(e) => {
            setDepartmentId(e.target.value)
            setPageNumber(1)
          }}
          className="h-10 rounded-lg border border-gray-300 px-3"
        >
          <option value="">Tất cả phòng ban</option>
          {departmentsQuery.data?.items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value)
            setPageNumber(1)
          }}
          className="h-10 rounded-lg border border-gray-300 px-3"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã khóa</option>
        </select>
      </Card>
      {usersQuery.isPending ? (
        <div className="flex min-h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : usersQuery.isError ? (
        <Card className="p-8 text-center text-red-600">Không thể tải người dùng.</Card>
      ) : !page?.items.length ? (
        <EmptyState
          title="Không có người dùng phù hợp"
          description="Hãy thay đổi bộ lọc."
        />
      ) : (
        <>
          <Card className="panel table-panel overflow-hidden">
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3">Người dùng</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Phòng ban</th>
                    <th className="px-4 py-3">Công việc</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {page.items.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3">
                        <strong>{user.fullName}</strong>
                        <p className="text-gray-500">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">{user.roleName}</td>
                      <td className="px-4 py-3">{user.departmentName ?? '—'}</td>
                      <td className="px-4 py-3">
                        Đang xử lý: {user.activeAssignedReportCount}
                        <br />
                        Quá hạn: {user.overdueReportCount}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setDetailId(user.id)}
                          >
                            Chi tiết
                          </Button>
                          {user.roleName === 'Staff' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                setStaffForm({
                                  id: user.id,
                                  fullName: user.fullName,
                                  email: user.email,
                                  departmentId: user.departmentId ?? 0,
                                })
                              }
                            >
                              Sửa
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant={user.isActive ? 'danger' : 'success'}
                            loading={
                              statusMutation.isPending &&
                              statusMutation.variables?.id === user.id
                            }
                            onClick={() => void toggle(user)}
                          >
                            {user.isActive ? 'Khóa' : 'Mở'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {page.totalItems} người dùng · Trang {page.pageNumber}/
              {Math.max(1, page.totalPages)}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => p - 1)}
              >
                Trước
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={pageNumber >= page.totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal
        open={Boolean(detailId)}
        title="Chi tiết tài khoản"
        onClose={() => setDetailId(null)}
      >
        {detailQuery.isPending ? (
          <Spinner />
        ) : detailQuery.data ? (
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p>
              <span className="text-gray-500">Họ tên</span>
              <br />
              <strong>{detailQuery.data.fullName}</strong>
            </p>
            <p>
              <span className="text-gray-500">Email</span>
              <br />
              {detailQuery.data.email}
            </p>
            <p>
              <span className="text-gray-500">Vai trò</span>
              <br />
              {detailQuery.data.roleName}
            </p>
            <p>
              <span className="text-gray-500">Phòng ban</span>
              <br />
              {detailQuery.data.departmentName ?? '—'}
            </p>
            <p>Báo cáo đã tạo: {detailQuery.data.createdReportCount}</p>
            <p>Báo cáo được giao: {detailQuery.data.assignedReportCount}</p>
            <p>Đang xử lý: {detailQuery.data.activeAssignedReportCount}</p>
          </div>
        ) : (
          <p className="text-red-600">Không thể tải chi tiết.</p>
        )}
      </Modal>

      <Modal
        open={Boolean(staffForm)}
        title={staffForm?.id ? 'Cập nhật Staff' : 'Tạo Staff'}
        onClose={() => !staffMutation.isPending && setStaffForm(null)}
      >
        {staffForm && (
          <form className="space-y-4" onSubmit={saveStaff}>
            <label className="flex flex-col gap-1 text-sm">
              Họ tên
              <input
                value={staffForm.fullName}
                onChange={(e) =>
                  setStaffForm((f) => (f ? { ...f, fullName: e.target.value } : f))
                }
                className="h-10 rounded-lg border border-gray-300 px-3"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Email
              <input
                type="email"
                value={staffForm.email}
                onChange={(e) =>
                  setStaffForm((f) => (f ? { ...f, email: e.target.value } : f))
                }
                className="h-10 rounded-lg border border-gray-300 px-3"
              />
            </label>
            {!staffForm.id && (
              <label className="flex flex-col gap-1 text-sm">
                Mật khẩu
                <input
                  type="password"
                  value={staffForm.password ?? ''}
                  onChange={(e) =>
                    setStaffForm((f) => (f ? { ...f, password: e.target.value } : f))
                  }
                  className="h-10 rounded-lg border border-gray-300 px-3"
                />
              </label>
            )}
            <label className="flex flex-col gap-1 text-sm">
              Phòng ban
              <select
                value={staffForm.departmentId || ''}
                onChange={(e) =>
                  setStaffForm((f) =>
                    f ? { ...f, departmentId: Number(e.target.value) } : f,
                  )
                }
                className="h-10 rounded-lg border border-gray-300 px-3"
              >
                <option value="">Chọn phòng ban</option>
                {departmentsQuery.data?.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" loading={staffMutation.isPending}>
              Lưu tài khoản
            </Button>
          </form>
        )}
      </Modal>
    </section>
  )
}

export default UsersListPage
