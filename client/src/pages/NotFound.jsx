import { Link } from 'react-router';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/ui/States';

export default function NotFound() {
  return (
    <div className="sheet">
      <EmptyState
        icon={Compass}
        title="This page came off the board"
        message="The link might be broken, or the page may have been removed."
        action={
          <Link to="/" className="btn-primary">
            Go home
          </Link>
        }
      />
    </div>
  );
}
