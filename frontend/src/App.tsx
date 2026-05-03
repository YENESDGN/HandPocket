import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import RequestPage from './pages/RequestPage'
import Contact from './pages/Contact'
import ProfilePage from './pages/ProfilePage'

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/giris" element={<AuthPage initialForm="login"  />} />
                <Route path="/kayit" element={<AuthPage initialForm="register" />} />
                <Route path="/talep" element={<RequestPage />} />
                <Route path="/iletisim" element={<Contact />} />
                <Route path="/profil" element={<ProfilePage />} />
            </Routes>
        </Router>
    )
}