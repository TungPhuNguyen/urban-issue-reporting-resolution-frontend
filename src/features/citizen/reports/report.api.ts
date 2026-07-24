import { http } from '@/lib/api/http'

import type {
  CitizenReportDetail,
  CreateReportPayload,
  CreateReportResult,
  PublicArea,
  PublicCategory,
} from './report.types'

export const reportApi = {
  async getCategories(): Promise<PublicCategory[]> {
    const response =
      await http.get<PublicCategory[]>('/public/categories')

    return response.data
  },

  async getAreas(): Promise<PublicArea[]> {
    const response =
      await http.get<PublicArea[]>('/public/areas')

    return response.data
  },

  async createReport(
    payload: CreateReportPayload,
  ): Promise<CreateReportResult> {
    const formData = new FormData()

    formData.append('CategoryId', String(payload.categoryId))
    formData.append('AreaId', String(payload.areaId))
    formData.append('Description', payload.description)

    if (payload.addressText) {
      formData.append('AddressText', payload.addressText)
    }

    formData.append('Latitude', String(payload.latitude))
    formData.append('Longitude', String(payload.longitude))

    payload.images.forEach((image) => {
      formData.append('Images', image)
    })

    /*
     * Không tự gắn Content-Type ở đây.
     * Axios và trình duyệt sẽ tự tạo multipart boundary.
     */
    const response = await http.post<CreateReportResult>(
      '/citizen/reports',
      formData,
    )

    return response.data
  },

  async getMyReportById(
    reportId: string,
  ): Promise<CitizenReportDetail> {
    const response = await http.get<CitizenReportDetail>(
      `/citizen/reports/${reportId}`,
    )

    return response.data
  },
}