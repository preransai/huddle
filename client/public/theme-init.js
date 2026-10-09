// Runs before React loads so the page never flashes the wrong theme.
// Kept as a separate file (not inline) so the Content-Security-Policy can stay strict.
(function () {
  try {
    var stored = localStorage.getItem('huddle-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch {
    // localStorage can throw in private mode; the default light theme is fine.
  }
})();
