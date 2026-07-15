import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import CustomerDashboard from './pages/CustomerDashboard';
import CourierDashboard from './pages/CourierDashboard';
import Navbar from './components/Navbar';

export default function App() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <>
      <Navbar user={user} onLogout={logout} />
      {user.role === 'courier' ? <CourierDashboard /> : <CustomerDashboard />}
      <footer className="app-footer">
        <p>QuickDrop — Codveda Full-Stack Internship, Level 2 (Task 1: React Frontend)</p>
      </footer>
    </>
  );
}