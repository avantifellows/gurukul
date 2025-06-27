export const api = {
    portal: {
      frontend: {
        baseUrl: process.env.NEXT_PUBLIC_AF_PORTAL_FRONTEND_URL || '',
      },
      backend: {
        baseUrl: process.env.NEXT_PUBLIC_AF_PORTAL_BACKEND_URL || '',
        verify: '/auth/verify',
        refreshToken: '/auth/refresh-token'
      }
    },
    reports: {
      baseUrl: process.env.AF_REPORTS_URL || '',
      student_reports: '/reports/student_reports/',
    },
    afdb: {
      baseUrl: process.env.AF_DB_SERVICE_URL || '',
    }
}
