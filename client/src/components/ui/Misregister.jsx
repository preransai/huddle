import { cn } from '../../utils/format';

// A headline printed the way a risograph prints it: a second ink pass (pink) lands a couple of
// pixels off register. The copy is aria-hidden, so assistive tech reads the text once.
// Use it for headlines only (wordmark, page titles, profile name), never for body text.
export default function Misregister({ as: Tag = 'span', className, children, ...rest }) {
  return (
    <Tag className={cn('misreg', className)} {...rest}>
      {children}
      <span className="misreg-copy" aria-hidden="true">
        {children}
      </span>
    </Tag>
  );
}
