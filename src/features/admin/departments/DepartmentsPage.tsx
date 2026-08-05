import { type FormEvent, useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ApiError } from '@/lib/api/http'

import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
} from './departments.queries'

import type { Department, DepartmentListParams } from './departments.types'

const PAGE_SIZE = 10

interface DepartmentFormState {
  name: string
  description: string
  isActive: boolean
}

const EMPTY_FORM: DepartmentFormState = {
  name: '',
  description: '',
  isActive: true,
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Chưa có'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export default function DepartmentsPage() {
  const [pageNumber, setPageNumber] = useState(1)

  const [searchInput, setSearchInput] = useState('')

  const [search, setSearch] = useState('')

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const [form, setForm] = useState<DepartmentFormState>(EMPTY_FORM)

  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)

  const [showForm, setShowForm] = useState(false)

  const [formError, setFormError] = useState<string | null>(null)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const params: DepartmentListParams = {
    search: search || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    pageNumber,
    pageSize: PAGE_SIZE,
  }

  const departmentsQuery = useDepartments(params)

  const createMutation = useCreateDepartment()

  const updateMutation = useUpdateDepartment()

  const isSaving = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (
      departmentsQuery.data &&
      pageNumber > 1 &&
      departmentsQuery.data.items.length === 0
    ) {
      setPageNumber(Math.max(1, departmentsQuery.data.totalPages))
    }
  }, [departmentsQuery.data, pageNumber])

  function openCreateForm() {
    setEditingDepartment(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setSuccessMessage(null)
    setShowForm(true)
  }

  function openEditForm(department: Department) {
    setEditingDepartment(department)

    setForm({
      name: department.name,
      description: department.description ?? '',
      isActive: department.isActive,
    })

    setFormError(null)
    setSuccessMessage(null)
    setShowForm(true)
  }

  function closeForm() {
    if (isSaving) {
      return
    }

    setShowForm(false)
    setEditingDepartment(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  function validateForm() {
    const name = form.name.trim()
    const description = form.description.trim()

    if (!name) {
      return {
        error: 'Tên đơn vị xử lý không được để trống.',
      }
    }

    if (name.length > 150) {
      return {
        error: 'Tên đơn vị xử lý không được vượt quá 150 ký tự.',
      }
    }

    if (description.length > 1000) {
      return {
        error: 'Mô tả không được vượt quá 1000 ký tự.',
      }
    }

    return {
      error: null,
      value: {
        name,
        description: description || null,
      },
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const validation = validateForm()

    if (validation.error || !validation.value) {
      setFormError(validation.error ?? 'Dữ liệu không hợp lệ.')
      return
    }

    try {
      if (editingDepartment) {
        await updateMutation.mutateAsync({
          id: editingDepartment.id,
          ...validation.value,
          isActive: form.isActive,
        })

        setSuccessMessage('Đã cập nhật Department.')
      } else {
        await createMutation.mutateAsync(validation.value)

        setSearchInput('')
        setSearch('')
        setStatusFilter('all')
        setPageNumber(1)

        setSuccessMessage('Đã tạo Department thành công.')
      }

      setShowForm(false)
      setEditingDepartment(null)
      setForm(EMPTY_FORM)
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          editingDepartment
            ? 'Không thể cập nhật Department.'
            : 'Không thể tạo Department.',
        ),
      )
    }
  }

  async function handleToggleActive(department: Department) {
    setFormError(null)
    setSuccessMessage(null)

    try {
      await updateMutation.mutateAsync({
        id: department.id,
        name: department.name,
        description: department.description,
        isActive: !department.isActive,
      })

      setSuccessMessage(
        department.isActive ? 'Đã vô hiệu hóa Department.' : 'Đã kích hoạt Department.',
      )
    } catch (error) {
      setFormError(getErrorMessage(error, 'Không thể thay đổi trạng thái Department.'))
    }
  }

  const page = departmentsQuery.data

  return (
    <section className="resource-page flex flex-col gap-5">
      <div className="page-heading page-heading--split flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Quản lý Departments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý các đơn vị chịu trách nhiệm tiếp nhận và xử lý báo cáo.
          </p>
        </div>

        <Button type="button" onClick={openCreateForm}>
          Thêm Department
        </Button>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      {formError && !showForm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {formError}
        </div>
      )}

      <Card className="p-5">
        <form
          className="flex flex-col gap-3 md:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            setPageNumber(1)
            setSearch(searchInput.trim())
          }}
        >
          <input
            value={searchInput}
            maxLength={150}
            placeholder="Tìm theo tên đơn vị xử lý..."
            onChange={(event) => setSearchInput(event.target.value)}
            className="h-10 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')
              setPageNumber(1)
            }}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>

          <Button type="submit">Tìm kiếm</Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearchInput('')
              setSearch('')
              setStatusFilter('all')
              setPageNumber(1)
            }}
          >
            Đặt lại
          </Button>
        </form>
      </Card>

      {showForm && (
        <Card className="border-blue-200 p-6 dark:border-blue-900">
          <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            {editingDepartment
              ? `Cập nhật Department #${editingDepartment.id}`
              : 'Tạo Department'}
          </h2>

          <form className="mt-4 grid max-w-3xl gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label htmlFor="departmentName" className="text-sm font-medium">
                Tên đơn vị xử lý
              </label>

              <input
                id="departmentName"
                value={form.name}
                maxLength={150}
                disabled={isSaving}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                  setFormError(null)
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              />

              <p className="text-xs text-gray-500">{form.name.length}/150</p>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="departmentDescription" className="text-sm font-medium">
                Mô tả
              </label>

              <textarea
                id="departmentDescription"
                value={form.description}
                maxLength={1000}
                rows={5}
                disabled={isSaving}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                  setFormError(null)
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              />

              <p className="text-xs text-gray-500">
                {form.description.length}
                /1000
              </p>
            </div>

            {editingDepartment && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />
                Department đang hoạt động
              </label>
            )}

            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={isSaving} disabled={isSaving}>
                {editingDepartment ? 'Lưu thay đổi' : 'Tạo Department'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                onClick={closeForm}
              >
                Hủy
              </Button>
            </div>
          </form>
        </Card>
      )}

      {departmentsQuery.isPending ? (
        <div className="flex min-h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : departmentsQuery.isError ? (
        <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium text-red-600">
            {getErrorMessage(departmentsQuery.error, 'Không thể tải Departments.')}
          </p>

          <Button type="button" onClick={() => departmentsQuery.refetch()}>
            Thử lại
          </Button>
        </Card>
      ) : !page || page.items.length === 0 ? (
        <Card className="p-10 text-center">
          <h2 className="text-lg font-semibold">Chưa có Department phù hợp</h2>

          <p className="mt-2 text-sm text-gray-500">
            Tạo Department mới hoặc thay đổi bộ lọc.
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs tracking-wide text-gray-500 uppercase dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Tên</th>
                    <th className="px-4 py-3">Mô tả</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Cập nhật</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {page.items.map((department) => (
                    <tr key={department.id} className="align-top">
                      <td className="px-4 py-3 font-medium">#{department.id}</td>

                      <td className="px-4 py-3 font-medium">{department.name}</td>

                      <td className="max-w-md px-4 py-3 text-gray-500">
                        {department.description || 'Không có mô tả'}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={
                            department.isActive
                              ? 'inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800'
                              : 'inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700'
                          }
                        >
                          {department.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatDate(department.updatedAt ?? department.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={updateMutation.isPending}
                            onClick={() => openEditForm(department)}
                          >
                            Sửa
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={updateMutation.isPending}
                            onClick={() => void handleToggleActive(department)}
                          >
                            {department.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            <p>
              Tổng cộng {page.totalItems} Department · Trang {page.pageNumber}/
              {Math.max(1, page.totalPages)}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pageNumber <= 1 || departmentsQuery.isFetching}
                onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
              >
                Trang trước
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pageNumber >= page.totalPages || departmentsQuery.isFetching}
                onClick={() => setPageNumber((current) => current + 1)}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
