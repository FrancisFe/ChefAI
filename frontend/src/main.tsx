import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/query-client.tsx'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/index.tsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    <Toaster position="bottom-right" richColors />
  </QueryClientProvider>
  </StrictMode>,
)
