# UC41 – Monitor Overdue Reports

Copy:

```text
src/features/overdue-reports/
```

## Route

```tsx
import OverdueReportsPage from '@/features/overdue-reports/OverdueReportsPage'
```

Admin route:

```tsx
{
  path: 'overdue-reports',
  element: <OverdueReportsPage />,
}
```

Staff route:

```tsx
{
  path: 'overdue-reports',
  element: <OverdueReportsPage />,
}
```

URLs:

```text
/admin/overdue-reports
/staff/overdue-reports
```

## Menu

Admin:

```ts
{
  label: 'Báo cáo quá hạn',
  path: '/admin/overdue-reports',
}
```

Staff:

```ts
{
  label: 'Báo cáo quá hạn',
  path: '/staff/overdue-reports',
}
```

## Backend currently used

```text
GET /api/v1/admin/reports
GET /api/v1/staff/reports
```

The current backend does not expose an `overdue` query parameter or a
dedicated overdue endpoint. This frontend therefore loads all accessible
report pages, excludes terminal statuses, and considers a report overdue when
`DueAt < current time`.

For a larger production dataset, add a backend filter such as:

```text
GET /api/v1/admin/reports?isOverdue=true
GET /api/v1/staff/reports?isOverdue=true
```

and perform pagination on the server.
