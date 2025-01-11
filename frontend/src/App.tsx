import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Data Migration Dashboard</h1>
            {/* You can add your shadcn/ui components here */}
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
