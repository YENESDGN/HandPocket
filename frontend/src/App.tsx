import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import LandingPage        from './pages/LandingPage'
import AuthPage           from './pages/AuthPage'
import RequestPage        from './pages/RequestPage'
import Contact            from './pages/Contact'
import ProfilePage        from './pages/ProfilePage'
import RecieverPage       from './pages/RecieverPage'
import TrackingPage       from './pages/TrackingPage'
import NavigationPage     from './pages/NavigationPage'
import AboutUs            from './pages/AboutUs'
import DeliveryDetailPage from './pages/DeliveryDetailPage'
import AdminDashboard     from './pages/AdminDashboard'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import NotFoundPage       from './pages/NotFoundPage'

export default function App() {
    const initialize = useAuthStore((s) => s.initialize);
    useEffect(() => { initialize(); }, [initialize]);

    return (
        <Router>
            <Routes>
                <Route path='/'                element={<LandingPage />} />
                <Route path='/giris'           element={<AuthPage initialForm='login' />} />
                <Route path='/kayit'           element={<AuthPage initialForm='register' />} />
                <Route path='/sifremi-unuttum' element={<ForgotPasswordPage />} />
                <Route path='/talep'           element={<RequestPage />} />
                <Route path='/talep/:id'       element={<DeliveryDetailPage />} />
                <Route path='/iletisim'        element={<Contact />} />
                <Route path='/profil'          element={<ProfilePage />} />
                <Route path='/talep-al'        element={<RecieverPage />} />
                <Route path='/takip'           element={<TrackingPage />} />
                <Route path='/navigasyon'      element={<NavigationPage />} />
                <Route path='/hakkimizda'      element={<AboutUs />} />
                <Route path='/admin'           element={<AdminDashboard />} />
                <Route path='*'               element={<NotFoundPage />} />
            </Routes>
        </Router>
    )
}
