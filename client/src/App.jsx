import { Navigate, Route, Routes, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { CircleAlert, CircleCheck } from 'lucide-react';
import AppLayout from './components/layout/AppLayout';
import { LogoMark } from './components/layout/Logo';
import Spinner from './components/ui/Spinner';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import PostPage from './pages/PostPage';
import Hashtag from './pages/Hashtag';
import Search from './pages/Search';
import NotFound from './pages/NotFound';

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6">
      <LogoMark className="h-12 w-[60px]" />
      <Spinner className="size-5 text-ink-3" label="Loading Huddle" />
    </div>
  );
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { isLoading } = useAuth();
  const { theme } = useTheme();

  return (
    <>
      {isLoading ? (
        <Splash />
      ) : (
        <Routes>
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="search" element={<Search />} />
            <Route path="tag/:tag" element={<Hashtag />} />
            <Route path="post/:id" element={<PostPage />} />
            <Route path=":username" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      )}
      {/* Toast styling lives in index.css (hd-toast*). Sonner sets the stack width inline, so the
          360px toast width is passed as style. */}
      <Toaster
        theme={theme}
        position="bottom-right"
        closeButton
        offset={24}
        mobileOffset={{ bottom: 88 }}
        style={{ '--width': '360px' }}
        icons={{
          success: <CircleCheck className="size-[18px]" strokeWidth={2.4} />,
          error: <CircleAlert className="size-[18px]" strokeWidth={2.4} />,
        }}
        toastOptions={{
          classNames: {
            toast: 'hd-toast',
            success: 'hd-toast--success',
            error: 'hd-toast--error',
            closeButton: 'hd-toast__close',
          },
        }}
      />
    </>
  );
}
