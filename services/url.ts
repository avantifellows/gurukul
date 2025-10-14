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
  dbservice: {
    baseUrl: process.env.NEXT_PUBLIC_DB_SERVICE_URL || 'http://localhost:4000',
  },
}
