import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuthStore();
    if (!isLoggedIn) return <Navigate to="/giris" replace />;
    return <>{children}</>;
}

function SenderRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, role } = useAuthStore();
    if (!isLoggedIn) return <Navigate to="/giris" replace />;
    if (role !== 'sender') return <Navigate to="/" replace />;
    return <>{children}</>;
}

function CourierRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, role } = useAuthStore();
    if (!isLoggedIn) return <Navigate to="/giris" replace />;
    if (role !== 'courier') return <Navigate to="/" replace />;
    return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, role } = useAuthStore();
    if (!isLoggedIn) return <Navigate to="/giris" replace />;
    if (role !== 'admin') return <Navigate to="/" replace />;
    return <>{children}</>;
}

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
                <Route path='/talep'           element={<SenderRoute><RequestPage /></SenderRoute>} />
                <Route path='/talep/:id'       element={<PrivateRoute><DeliveryDetailPage /></PrivateRoute>} />
                <Route path='/iletisim'        element={<Contact />} />
                <Route path='/profil'          element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path='/talep-al'        element={<CourierRoute><RecieverPage /></CourierRoute>} />
                <Route path='/takip'           element={<SenderRoute><TrackingPage /></SenderRoute>} />
                <Route path='/navigasyon'      element={<CourierRoute><NavigationPage /></CourierRoute>} />
                <Route path='/hakkimizda'      element={<AboutUs />} />
                <Route path='/admin'           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path='*'               element={<NotFoundPage />} />
            </Routes>
        </Router>
    )
}
