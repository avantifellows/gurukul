export const api = {
    portal: {
      frontend: {
        baseUrl: process.env.NEXT_PUBLIC_AF_PORTAL_FRONTEND_URL || '',
      },
      backend: {
        baseUrl: process.env.NEXT_PUBLIC_AF_PORTAL_BACKEND_URL || '',
        verify: '/verify',
      }
    },
    reports: {
      baseUrl: process.env.AF_REPORTS_URL || '',
      student_reports: '/student_reports/',
    }
}
