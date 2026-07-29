import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { AdminLayout } from './components/AdminLayout'
import { Landing } from './routes/Landing'
import { Register } from './routes/Register'
import { Login } from './routes/Login'
import { ForgotPassword } from './routes/ForgotPassword'
import { ResetPassword } from './routes/ResetPassword'
import { Swipe } from './routes/Swipe'
import { Wishlist } from './routes/Wishlist'
import { AnimalDetail } from './routes/AnimalDetail'
import { Account } from './routes/Account'
import { Impressum } from './routes/Impressum'
import { Datenschutz } from './routes/Datenschutz'
import { Nutzungsbedingungen } from './routes/Nutzungsbedingungen'
import { AdminUsers } from './routes/admin/AdminUsers'
import { AdminUserDetail } from './routes/admin/AdminUserDetail'
import { AdminAnimals } from './routes/admin/AdminAnimals'
import { AdminAnimalDetail } from './routes/admin/AdminAnimalDetail'
import { AdminSync } from './routes/admin/AdminSync'

function PublicLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/registrieren" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/passwort-vergessen" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/entdecken"
          element={
            <ProtectedRoute>
              <Swipe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/merkliste"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tiere/:id"
          element={
            <ProtectedRoute>
              <AnimalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/konto"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/nutzungsbedingungen" element={<Nutzungsbedingungen />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="animals" element={<AdminAnimals />} />
        <Route path="animals/:id" element={<AdminAnimalDetail />} />
        <Route path="sync" element={<AdminSync />} />
      </Route>
    </Routes>
  )
}

export default App
