import { http } from '@/lib/api/http'

import type {
  CreateReportRequest,
  CreateReportResult,
  CitizenReportDetail,
} from './citizen-report.types'

export const citizenReportApi = {
  async createReport(
    payload: CreateReportRequest,
  ): Promise<CreateReportResult> {
    const formData = new FormData()

    formData.append(
      'CategoryId',
      String(payload.categoryId),
    )

    formData.append(
      'AreaId',
      String(payload.areaId),
    )

    formData.append(
      'Description',
      payload.description,
    )

    formData.append(
      'Latitude',
      String(payload.latitude),
    )

    formData.append(
      'Longitude',
      String(payload.longitude),
    )

    if (payload.addressText) {
      formData.append(
        'AddressText',
        payload.addressText,
      )
    }

    payload.images.forEach((image) => {
      formData.append('Images', image)
    })

    const response =
      await http.post<CreateReportResult>(
        '/citizen/reports',
        formData,
      )

    return response.data
  },

  async getReportDetail(
    reportId: string,
  ): Promise<CitizenReportDetail> {
    const response =
      await http.get<CitizenReportDetail>(
        `/citizen/reports/${reportId}`,
      )

    return response.data
  },
}