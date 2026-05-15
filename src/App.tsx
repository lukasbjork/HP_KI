import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppShell } from '@/components/layout/AppShell'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Library = lazy(() => import('@/pages/Library'))
const Exam = lazy(() => import('@/pages/Exam'))
const Drill = lazy(() => import('@/pages/Drill'))
const Statistics = lazy(() => import('@/pages/Statistics'))
const Flashcards = lazy(() => import('@/pages/Flashcards'))
const SettingsPage = lazy(() => import('@/pages/Settings'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-ki-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="library" element={<Library />} />
            <Route path="library/:sessionId" element={<Library />} />
            <Route path="exam" element={<Exam />} />
            <Route path="exam/:sessionId" element={<Exam />} />
            <Route path="drill" element={<Drill />} />
            <Route path="stats" element={<Statistics />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
