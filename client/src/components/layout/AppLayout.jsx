import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import TopBar from './TopBar';
import SideNav from './SideNav';
import MobileNav from './MobileNav';
import RightSidebar from './RightSidebar';
import Modal from '../ui/Modal';
import PostComposer from '../posts/PostComposer';
import { useAuth } from '../../context/AuthContext';
import { useNotificationSocket } from '../../hooks/useNotificationSocket';

export default function AppLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [composeOpen, setComposeOpen] = useState(false);

  useNotificationSocket(user._id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-sm focus:border-2 focus:border-line focus:bg-riso-yellow focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-riso-black"
      >
        Skip to content
      </a>
      <TopBar />
      {/* pt-6 leaves room for the first flyer's thumbtack under the sticky top bar */}
      <div className="mx-auto max-w-6xl px-3.5 sm:px-4 md:grid md:grid-cols-[72px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[232px_minmax(0,1fr)_300px]">
        <div className="hidden pt-6 md:block">
          <SideNav onCompose={() => setComposeOpen(true)} />
        </div>
        <main id="main" className="mx-auto w-full max-w-[600px] min-w-0 pt-6 pb-28 md:pb-12">
          <Outlet />
        </main>
        <div className="hidden pt-6 lg:block">
          <RightSidebar />
        </div>
      </div>
      <MobileNav onCompose={() => setComposeOpen(true)} />

      {/* The dialog is the slip itself: its black lift is the elevation, so no pink pass inside it. */}
      <Modal open={composeOpen} onClose={() => setComposeOpen(false)} title="New post" size="lg">
        <PostComposer autoFocus onPosted={() => setComposeOpen(false)} />
      </Modal>
    </>
  );
}
