import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import RequestPage from './pages/RequestPage'

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/giris" element={<AuthPage initialForm="login"  />} />
                <Route path="/kayit" element={<AuthPage initialForm="register" />} />
                <Route path="/talep" element={<RequestPage />} />
            </Routes>
        </Router>
    )
}