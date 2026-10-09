import { Fragment, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, X } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import { useSearch } from '../../hooks/useSearch';
import { cn, pluralize } from '../../utils/format';

export default function SearchBox({ className }) {
  const navigate = useNavigate();
  const listId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { q, users, tags, isLoading, isSettled } = useSearch(value);

  const options = [
    ...users.map((user) => ({ id: `u-${user._id}`, to: `/${user.username}`, user })),
    ...tags.map((t) => ({ id: `t-${t.tag}`, to: `/tag/${t.tag}`, tag: t })),
    ...(q ? [{ id: 'all', to: `/search?q=${encodeURIComponent(q)}`, all: true }] : []),
  ];
  const showList = open && value.trim().length > 0;

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const go = (to) => {
    navigate(to);
    setOpen(false);
    setValue('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = options[active];
      if (option) go(option.to);
      else if (value.trim()) go(`/search?q=${encodeURIComponent(value.trim())}`);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  // Hovering an option also makes it the active (aria-activedescendant) one, so hover and the
  // keyboard selection are one state: yellow fill + ink bar.
  const optionClass = (index) =>
    cn('flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm', index === active && 'selected-row');

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 z-[1] size-[18px] -translate-y-1/2 text-ink" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search people or #hashtags"
        aria-label="Search people or hashtags"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${options[active]?.id}` : undefined}
        className="input h-10 py-0 pr-9 pl-10 transition-shadow duration-75 placeholder:font-display placeholder:text-[16px] placeholder:font-semibold placeholder:tracking-[-0.01em] placeholder:[font-stretch:90%] focus:shadow-pass-pink focus:outline-offset-[6px] [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue('');
            inputRef.current?.focus();
          }}
          className="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-ink-2 hover:bg-sheet-hi hover:text-ink"
          aria-label="Clear search"
        >
          <X className="size-3.5" strokeWidth={2.6} />
        </button>
      )}

      {showList && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 animate-drop-in overflow-hidden border-2 border-line bg-sheet shadow-lift">
          <ul id={listId} role="listbox" aria-label="Search suggestions" className="max-h-[70vh] overflow-y-auto py-1">
            {users.length > 0 && <SectionLabel>People</SectionLabel>}
            {options.map((option, index) => (
              <Fragment key={option.id}>
                {option.tag && index === users.length && <SectionLabel>Hashtags</SectionLabel>}
                <li id={`${listId}-${option.id}`} role="option" aria-selected={index === active}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => go(option.to)}
                    onMouseEnter={() => setActive(index)}
                    className={optionClass(index)}
                  >
                    {option.user && <UserOption user={option.user} />}
                    {option.tag && <TagOption tag={option.tag} />}
                    {option.all && (
                      <>
                        <span className="inline-flex w-9 shrink-0 justify-center">
                          <Search className="size-[18px]" aria-hidden="true" />
                        </span>
                        <span>
                          Search for <span className="font-bold">"{q}"</span>
                        </span>
                      </>
                    )}
                  </button>
                </li>
              </Fragment>
            ))}
          </ul>
          {(isLoading || !isSettled) && (
            <div className="flex items-center gap-2 border-t-2 border-dotted border-rule px-4 py-2.5 text-xs text-ink-2">
              <Spinner className="size-3.5" /> Searching
            </div>
          )}
          {isSettled && !isLoading && !users.length && !tags.length && (
            <p className="border-t-2 border-dotted border-rule px-4 py-2.5 text-xs text-ink-2">
              No people or hashtags match "{q}".
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Sentence-case display labels, not uppercase eyebrows.
function SectionLabel({ children }) {
  return (
    <li role="presentation" className="px-4 pt-2.5 pb-1 font-display text-[15px] font-bold text-ink [font-stretch:90%]">
      {children}
    </li>
  );
}

function UserOption({ user }) {
  return (
    <>
      <Avatar user={user} size="sm" />
      <span className="min-w-0">
        <span className="block truncate type-name text-[15px]">{user.name}</span>
        <span className="meta block truncate type-meta text-[12.5px]">@{user.username}</span>
      </span>
    </>
  );
}

function TagOption({ tag }) {
  return (
    <>
      {/* the hash is typeset in display type, not an icon in a tile */}
      <span className="tag-hash inline-flex w-9 shrink-0 justify-center font-display text-[26px] leading-none font-extrabold text-blue-ink">
        #
      </span>
      <span className="min-w-0">
        <span className="block truncate type-name text-[15px]">{tag.tag}</span>
        <span className="meta block type-meta text-[12.5px]">{pluralize(tag.count, 'post')}</span>
      </span>
    </>
  );
}
