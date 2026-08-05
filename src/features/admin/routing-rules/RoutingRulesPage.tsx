import { type FormEvent, useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ApiError } from '@/lib/api/http'

import {
  useCreateRoutingRule,
  useDeleteRoutingRule,
  useRoutingRuleCatalogs,
  useRoutingRules,
  useUpdateRoutingRule,
} from './routing-rules.queries'

import type { RoutingRule, RoutingRuleListParams } from './routing-rules.types'

const PAGE_SIZE = 10

interface RuleFormState {
  categoryId: string
  areaId: string
  departmentId: string
  priorityOrder: string
  isActive: boolean
}

const EMPTY_FORM: RuleFormState = {
  categoryId: '',
  areaId: '',
  departmentId: '',
  priorityOrder: '1',
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

export default function RoutingRulesPage() {
  const [pageNumber, setPageNumber] = useState(1)

  const [searchInput, setSearchInput] = useState('')

  const [search, setSearch] = useState('')

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const [form, setForm] = useState<RuleFormState>(EMPTY_FORM)

  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null)

  const [showForm, setShowForm] = useState(false)

  const [formError, setFormError] = useState<string | null>(null)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<RoutingRule | null>(null)

  const params: RoutingRuleListParams = {
    search: search || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    pageNumber,
    pageSize: PAGE_SIZE,
  }

  const rulesQuery = useRoutingRules(params)

  const { categoriesQuery, areasQuery, departmentsQuery } = useRoutingRuleCatalogs()

  const createMutation = useCreateRoutingRule()

  const updateMutation = useUpdateRoutingRule()

  const deleteMutation = useDeleteRoutingRule()

  const isSaving = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (rulesQuery.data && pageNumber > 1 && rulesQuery.data.items.length === 0) {
      setPageNumber(Math.max(1, rulesQuery.data.totalPages))
    }
  }, [pageNumber, rulesQuery.data])

  function openCreateForm() {
    setEditingRule(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setSuccessMessage(null)
    setShowForm(true)
  }

  function openEditForm(rule: RoutingRule) {
    setEditingRule(rule)

    setForm({
      categoryId: String(rule.categoryId),
      areaId: String(rule.areaId),
      departmentId: String(rule.departmentId),
      priorityOrder: String(rule.priorityOrder),
      isActive: rule.isActive,
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
    setEditingRule(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  function validateForm() {
    const categoryId = Number(form.categoryId)

    const areaId = Number(form.areaId)

    const departmentId = Number(form.departmentId)

    const priorityOrder = Number(form.priorityOrder)

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return {
        error: 'Vui lòng chọn Category.',
      }
    }

    if (!Number.isInteger(areaId) || areaId <= 0) {
      return {
        error: 'Vui lòng chọn Area.',
      }
    }

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return {
        error: 'Vui lòng chọn Department.',
      }
    }

    if (!Number.isInteger(priorityOrder) || priorityOrder <= 0) {
      return {
        error: 'PriorityOrder phải là số nguyên dương.',
      }
    }

    return {
      error: null,
      value: {
        categoryId,
        areaId,
        departmentId,
        priorityOrder,
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
      if (editingRule) {
        await updateMutation.mutateAsync({
          id: editingRule.id,
          ...validation.value,
          isActive: form.isActive,
        })

        setSuccessMessage('Đã cập nhật Routing Rule.')
      } else {
        await createMutation.mutateAsync(validation.value)

        // Sau khi tạo, bỏ toàn bộ filter và quay về trang đầu.
        // Backend sắp xếp theo PriorityOrder nên rule mới có thể
        // không nằm ở trang hoặc bộ lọc hiện tại.
        setSearchInput('')
        setSearch('')
        setStatusFilter('all')
        setPageNumber(1)

        setSuccessMessage('Đã tạo Routing Rule. Rule mới được hiển thị ở trang đầu.')
      }

      setShowForm(false)
      setEditingRule(null)
      setForm(EMPTY_FORM)
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          editingRule
            ? 'Không thể cập nhật Routing Rule.'
            : 'Không thể tạo Routing Rule.',
        ),
      )
    }
  }

  async function handleToggleActive(rule: RoutingRule) {
    setSuccessMessage(null)

    try {
      await updateMutation.mutateAsync({
        id: rule.id,
        categoryId: rule.categoryId,
        areaId: rule.areaId,
        departmentId: rule.departmentId,
        priorityOrder: rule.priorityOrder,
        isActive: !rule.isActive,
      })

      setSuccessMessage(
        rule.isActive ? 'Đã vô hiệu hóa Routing Rule.' : 'Đã kích hoạt Routing Rule.',
      )
    } catch (error) {
      setFormError(getErrorMessage(error, 'Không thể thay đổi trạng thái Routing Rule.'))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }

    setFormError(null)
    setSuccessMessage(null)

    try {
      await deleteMutation.mutateAsync(deleteTarget.id)

      setDeleteTarget(null)
      setSuccessMessage('Đã xóa hoặc ngừng hoạt động Routing Rule.')
    } catch (error) {
      setDeleteTarget(null)

      setFormError(getErrorMessage(error, 'Không thể xóa Routing Rule.'))
    }
  }

  const catalogLoading =
    categoriesQuery.isPending || areasQuery.isPending || departmentsQuery.isPending

  const catalogError =
    categoriesQuery.isError || areasQuery.isError || departmentsQuery.isError

  const page = rulesQuery.data

  return (
    <section className="resource-page flex flex-col gap-5">
      <div className="page-heading page-heading--split flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Quản lý Routing Rules
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Cấu hình Category, Area, Department và PriorityOrder dùng cho định tuyến tự
            động.
          </p>
        </div>

        <Button type="button" onClick={openCreateForm}>
          Thêm Routing Rule
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
            placeholder="Tìm theo Category, Area hoặc Department..."
            onChange={(event) => setSearchInput(event.target.value)}
            className="h-10 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')

              setPageNumber(1)
            }}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
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
            {editingRule
              ? `Cập nhật Routing Rule #${editingRule.id}`
              : 'Tạo Routing Rule'}
          </h2>

          {catalogLoading ? (
            <div className="flex min-h-32 items-center justify-center">
              <Spinner />
            </div>
          ) : catalogError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Không thể tải Category, Area hoặc Department đang hoạt động.
            </div>
          ) : (
            <form
              className="mt-4 grid max-w-4xl gap-4 md:grid-cols-2"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-1">
                <label htmlFor="routingCategory" className="text-sm font-medium">
                  Category
                </label>

                <select
                  id="routingCategory"
                  value={form.categoryId}
                  disabled={isSaving}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      categoryId: event.target.value,
                    }))

                    setFormError(null)
                  }}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">Chọn Category</option>

                  {categoriesQuery.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="routingArea" className="text-sm font-medium">
                  Area
                </label>

                <select
                  id="routingArea"
                  value={form.areaId}
                  disabled={isSaving}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      areaId: event.target.value,
                    }))

                    setFormError(null)
                  }}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">Chọn Area</option>

                  {areasQuery.data?.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="routingDepartment" className="text-sm font-medium">
                  Department
                </label>

                <select
                  id="routingDepartment"
                  value={form.departmentId}
                  disabled={isSaving}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      departmentId: event.target.value,
                    }))

                    setFormError(null)
                  }}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">Chọn Department</option>

                  {departmentsQuery.data?.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="priorityOrder" className="text-sm font-medium">
                  PriorityOrder
                </label>

                <input
                  id="priorityOrder"
                  type="number"
                  min={1}
                  step={1}
                  value={form.priorityOrder}
                  disabled={isSaving}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      priorityOrder: event.target.value,
                    }))

                    setFormError(null)
                  }}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
              </div>

              {editingRule && (
                <label className="flex items-center gap-2 text-sm md:col-span-2">
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
                  Routing Rule đang hoạt động
                </label>
              )}

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:col-span-2">
                  {formError}
                </div>
              )}

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <Button
                  type="submit"
                  loading={isSaving}
                  disabled={isSaving || catalogLoading || catalogError}
                >
                  {editingRule ? 'Lưu thay đổi' : 'Tạo Routing Rule'}
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
          )}
        </Card>
      )}

      {rulesQuery.isPending ? (
        <div className="flex min-h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : rulesQuery.isError ? (
        <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium text-red-600">
            {getErrorMessage(rulesQuery.error, 'Không thể tải Routing Rules.')}
          </p>

          <Button type="button" onClick={() => rulesQuery.refetch()}>
            Thử lại
          </Button>
        </Card>
      ) : !page || page.items.length === 0 ? (
        <Card className="p-10 text-center">
          <h2 className="text-lg font-semibold">Chưa có Routing Rule phù hợp</h2>

          <p className="mt-2 text-sm text-gray-500">Tạo rule mới hoặc thay đổi bộ lọc.</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs tracking-wide text-gray-500 uppercase dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3">ID</th>

                    <th className="px-4 py-3">Category</th>

                    <th className="px-4 py-3">Area</th>

                    <th className="px-4 py-3">Department</th>

                    <th className="px-4 py-3">Priority</th>

                    <th className="px-4 py-3">Trạng thái</th>

                    <th className="px-4 py-3">Cập nhật</th>

                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {page.items.map((rule) => (
                    <tr key={rule.id} className="align-top">
                      <td className="px-4 py-3 font-medium">#{rule.id}</td>

                      <td className="px-4 py-3">{rule.categoryName}</td>

                      <td className="px-4 py-3">{rule.areaName}</td>

                      <td className="px-4 py-3">{rule.departmentName}</td>

                      <td className="px-4 py-3">{rule.priorityOrder}</td>

                      <td className="px-4 py-3">
                        <span
                          className={
                            rule.isActive
                              ? 'inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800'
                              : 'inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700'
                          }
                        >
                          {rule.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatDate(rule.updatedAt ?? rule.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={
                              updateMutation.isPending || deleteMutation.isPending
                            }
                            onClick={() => openEditForm(rule)}
                          >
                            Sửa
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={
                              updateMutation.isPending || deleteMutation.isPending
                            }
                            onClick={() => void handleToggleActive(rule)}
                          >
                            {rule.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            disabled={
                              updateMutation.isPending || deleteMutation.isPending
                            }
                            onClick={() => setDeleteTarget(rule)}
                          >
                            Xóa
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
              Tổng cộng {page.totalItems} rule · Trang {page.pageNumber}/
              {Math.max(1, page.totalPages)}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pageNumber <= 1 || rulesQuery.isFetching}
                onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
              >
                Trang trước
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pageNumber >= page.totalPages || rulesQuery.isFetching}
                onClick={() => setPageNumber((current) => current + 1)}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </>
      )}

      {deleteTarget && (
        <Card className="border-red-200 p-6 dark:border-red-900">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
            Xác nhận xóa Routing Rule
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Bạn có chắc muốn xóa rule #{deleteTarget.id}:{' '}
            <strong>
              {deleteTarget.categoryName} – {deleteTarget.areaName} –{' '}
              {deleteTarget.departmentName}
            </strong>
            ?
          </p>

          <p className="mt-2 text-sm text-red-600">
            Backend hiện mô tả DELETE là “ngừng hoạt động quy tắc định tuyến”. Kết quả
            cuối cùng phụ thuộc handler backend.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              Xác nhận xóa
            </Button>

            <Button
              type="button"
              variant="secondary"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteTarget(null)}
            >
              Hủy
            </Button>
          </div>
        </Card>
      )}
    </section>
  )
}
