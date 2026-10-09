import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search as SearchIcon, SearchX } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import UserRow from '../components/users/UserRow';
import { UserRowSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/States';
import { TrendingTags } from '../components/layout/RightSidebar';
import { useSearch } from '../hooks/useSearch';
import { pluralize } from '../utils/format';

// Full-page search. On phones this replaces the top-bar dropdown; on desktop
// it is where pressing Enter in the search box lands.
export default function Search() {
  const [params, setParams] = useSearchParams();
  const [value, setValue] = useState(params.get('q') || '');
  const { q, users, tags, isLoading, isSettled } = useSearch(value);

  const handleChange = (event) => {
    setValue(event.target.value);
    const next = event.target.value.trim();
    setParams(next ? { q: next } : {}, { replace: true });
  };

  const searching = isLoading || !isSettled;

  return (
    <>
      <PageHeader title="Search" back />
      <div className="relative mb-7.5">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 z-[1] size-5 -translate-y-1/2 text-ink" aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={handleChange}
          placeholder="Search people or #hashtags"
          aria-label="Search people or hashtags"
          autoFocus
          className="input h-[52px] py-0 pl-12 text-[17px] transition-shadow duration-75 placeholder:font-display placeholder:font-semibold placeholder:tracking-[-0.01em] placeholder:[font-stretch:90%] focus:shadow-pass-pink focus:outline-offset-[6px]"
        />
      </div>

      {!q && !value.trim() && <TrendingTags />}

      {value.trim() && (
        <div className="sheet p-5">
          {searching && !users.length && !tags.length && <UserRowSkeleton count={3} />}

          {users.length > 0 && (
            <section aria-labelledby="search-people">
              <h2 id="search-people" className="mb-3 border-b-2 border-line pb-1.5 font-display text-[18px] font-bold text-ink [font-stretch:92%]">
                People
              </h2>
              <ul className="space-y-4">
                {users.map((user) => (
                  <li key={user._id}>
                    <UserRow user={user} showBio />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tags.length > 0 && (
            <section aria-labelledby="search-tags" className={users.length ? 'mt-7' : ''}>
              <h2 id="search-tags" className="mb-3 border-b-2 border-line pb-1.5 font-display text-[18px] font-bold text-ink [font-stretch:92%]">
                Hashtags
              </h2>
              <ul className="-mx-2">
                {tags.map((t) => (
                  <li key={t.tag}>
                    <Link
                      to={`/tag/${t.tag}`}
                      className="flex items-center gap-3 rounded-sm px-2 py-2 hover:selected-row focus-visible:selected-row"
                    >
                      {/* the hash is typeset in display type, not an icon in a tile */}
                      <span className="tag-hash inline-flex w-9 shrink-0 justify-center font-display text-[26px] leading-none font-extrabold text-blue-ink">
                        #
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate type-name text-[16px]">{t.tag}</span>
                        <span className="meta block type-meta text-[13px] tabular-nums">{pluralize(t.count, 'post')}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!searching && !users.length && !tags.length && (
            <EmptyState icon={SearchX} title={`No results for "${q}"`} message="Try a different name, username or hashtag." className="py-8" />
          )}
        </div>
      )}
    </>
  );
}
