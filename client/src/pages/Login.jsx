import { useId, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import AuthLayout from '../components/auth/AuthLayout';
import Field from '../components/auth/Field';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { errorMessage, fieldErrors } from '../lib/api';

const DEMO = { identifier: 'ananya@example.com', password: 'huddle123' };

// While submitting, the button keeps its ink block (with the spinner) instead of turning into the
// dashed "unprinted" disabled look.
const SUBMIT_CLASS =
  'btn-primary mt-1 w-full py-3 font-display text-[19px] font-[750] [font-stretch:90%] disabled:cursor-progress disabled:border-solid disabled:border-line disabled:bg-ink disabled:text-sheet disabled:shadow-pass-pink';

// The demo credentials, printed again on tear-off tabs like a "room for rent" notice.
// Two tabs are already torn off. Purely decorative: the sentence above carries the information.
const TABS = [true, false, true, true, false, true];

function DemoSlip({ onUse, disabled }) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="relative z-[2] mx-auto mt-10 w-[min(100%,340px)] -rotate-1 min-[1000px]:mt-[250px] min-[1000px]:-ml-[26px] min-[1000px]:w-[326px] min-[1000px]:rotate-1"
    >
      <span className="tape -top-3.5 left-1/2 -ml-12 h-[26px] w-24 rotate-3" aria-hidden="true" />
      <div className="border-2 border-line border-b-ink-3 bg-sheet px-5 pt-[22px] pb-4 [border-bottom-style:dashed]">
        <h2 id={headingId} className="type-h3">
          Just looking around?
        </h2>
        <p className="mt-1.5 text-sm text-ink-2">
          The demo account is <span className="font-[650] text-ink">{DEMO.identifier}</span> with password{' '}
          <span className="font-[650] text-ink">{DEMO.password}</span>.
        </p>
        <button type="button" onClick={onUse} disabled={disabled} className="btn-secondary mt-3.5 w-full py-[11px]">
          Log in with the demo account
        </button>
      </div>
      <div className="flex items-start" aria-hidden="true">
        {TABS.map((present, i) => (
          <div
            key={i}
            className={`-ml-0.5 flex h-32 flex-1 items-center justify-center border-2 border-t-0 border-line bg-sheet first:ml-0 ${present ? '' : 'invisible'}`}
          >
            {present && (
              <span className="rotate-180 text-center text-[10.5px] leading-[1.3] font-semibold whitespace-nowrap text-ink-2 [writing-mode:vertical-rl]">
                <b className="block font-bold text-ink">{DEMO.identifier}</b>
                {DEMO.password}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }));

  const submit = async (credentials) => {
    setSubmitting(true);
    setErrors({});
    setFormError('');
    try {
      await login(credentials);
      navigate(location.state?.from || '/', { replace: true });
    } catch (error) {
      setErrors(fieldErrors(error));
      setFormError(errorMessage(error));
      setSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submit(form);
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Catch up on what your people have been pinning up."
      footer={
        <>
          New to Huddle?{' '}
          <Link to="/register" className="rounded-xs font-bold text-blue-ink underline decoration-2 underline-offset-[3px]">
            Create an account
          </Link>
        </>
      }
      aside={
        <DemoSlip
          disabled={submitting}
          onUse={() => {
            setForm(DEMO);
            submit(DEMO);
          }}
        />
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <p
            role="alert"
            className="rounded-sm border-2 border-danger bg-danger-tint px-3.5 py-2.5 text-sm font-semibold text-danger-ink"
          >
            {formError}
          </p>
        )}
        <Field
          label="Email or username"
          name="identifier"
          autoComplete="username"
          value={form.identifier}
          onChange={update('identifier')}
          error={errors.identifier}
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          required
        />
        <button type="submit" disabled={submitting} className={SUBMIT_CLASS}>
          {submitting && <Spinner className="size-4" />}
          Log in
        </button>
      </form>
    </AuthLayout>
  );
}
