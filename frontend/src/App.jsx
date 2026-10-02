import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import NewQuestion from './pages/NewQuestion';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        Dev<span>Dúvida</span>
      </Link>
      <nav>
        {user ? (
          <>
            <Link to="/questions/new">Perguntar</Link>
            <button className="btn-ghost" onClick={handleLogout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/signup" className="btn-primary small">
              Criar conta
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

function RequireAuth({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Questions />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/questions/new"
            element={
              <RequireAuth>
                <NewQuestion />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </>
  );
}
