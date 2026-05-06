import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Nuestro backend
      '/api/ordenesimagen': { target: 'http://localhost:5211', changeOrigin: true },
      '/api/estudiosrealizados': { target: 'http://localhost:5211', changeOrigin: true },
      '/api/informes': { target: 'http://localhost:5211', changeOrigin: true },
      '/api/tiposestudio': { target: 'http://localhost:5211', changeOrigin: true },
      '/api/equipos': { target: 'http://localhost:5211', changeOrigin: true },
      '/api/tecnicos': { target: 'http://localhost:5211', changeOrigin: true },
      '/api/integraciones': { target: 'http://localhost:5211', changeOrigin: true },
      // Backends de compañeros (proxy para desarrollo)
      '/api/pacientes': { target: 'http://localhost:5001', changeOrigin: true },
      '/api/ordenes-externas': { target: 'http://localhost:5002', changeOrigin: true },
      '/api/hospitalizacion': { target: 'http://localhost:5003', changeOrigin: true },
      '/api/emergencias': { target: 'http://localhost:5004', changeOrigin: true },
      '/api/farmacia': { target: 'http://localhost:5005', changeOrigin: true },
      '/api/inventarios': { target: 'http://localhost:5006', changeOrigin: true },
      '/api/facturacion': { target: 'http://localhost:5007', changeOrigin: true },
      '/api/atencion': { target: 'http://localhost:5008', changeOrigin: true },
      '/api/telemedicina': { target: 'http://localhost:5009', changeOrigin: true },
      '/api/rrhh': { target: 'http://localhost:5010', changeOrigin: true },
    },
  },
})
