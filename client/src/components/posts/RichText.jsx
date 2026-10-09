import { Link } from 'react-router';
import { tokenize } from '../../utils/text';
import { displayUrl } from '../../utils/format';

// Hashtags, mentions and URLs are printed in the darker blue link ink.
const linkClass = 'font-semibold text-blue-ink decoration-2 underline-offset-[3px] hover:underline';

export default function RichText({ text, className }) {
  if (!text) return null;

  return (
    <p className={className}>
      {tokenize(text).map((token, i) => {
        if (token.type === 'hashtag') {
          return (
            <Link key={i} to={`/tag/${token.tag}`} className={linkClass}>
              {token.value}
            </Link>
          );
        }
        if (token.type === 'mention') {
          return (
            <Link key={i} to={`/${token.username}`} className={linkClass}>
              {token.value}
            </Link>
          );
        }
        if (token.type === 'link') {
          return (
            <a key={i} href={token.href} target="_blank" rel="noopener noreferrer nofollow" className={linkClass}>
              {displayUrl(token.href)}
            </a>
          );
        }
        return <span key={i}>{token.value}</span>;
      })}
    </p>
  );
}
