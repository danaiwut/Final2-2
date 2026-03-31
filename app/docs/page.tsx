'use client'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import './swagger-override.css'

export default function DocsPage() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <SwaggerUI url="/api/docs" />
    </div>
  )
}