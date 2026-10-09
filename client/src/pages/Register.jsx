import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import AuthLayout from '../components/auth/AuthLayout';
import Field from '../components/auth/Field';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { errorMessage, fieldErrors } from '../lib/api';

const USERNAME_RE = /^[a-z][a-z0-9_]{2,19}$/;

// Mirrors the server rules so most mistakes are caught before a round trip.
function validate({ name, username, email, password }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  if (!USERNAME_RE.test(username)) {
    errors.username = '3-20 characters: letters, numbers and underscores, starting with a letter';
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address';
  if (password.length < 8) errors.password = 'Use at least 8 characters';
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => {
    const value = field === 'username' ? event.target.value.toLowerCase().replace(/\s/g, '') : event.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clientErrors = validate(form);
    setErrors(clientErrors);
    setFormError('');
    if (Object.keys(clientErrors).length) return;

    setSubmitting(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to Huddle, ${user.name.split(' ')[0]}!`);
      navigate('/', { replace: true });
    } catch (error) {
      const serverErrors = fieldErrors(error);
      setErrors(serverErrors);
      if (!Object.keys(serverErrors).length) setFormError(errorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Join Huddle"
      subtitle="Make your profile in under a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="rounded-xs font-bold text-blue-ink underline decoration-2 underline-offset-[3px]">
            Log in
          </Link>
        </>
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
        <Field label="Full name" name="name" autoComplete="name" value={form.name} onChange={update('name')} error={errors.name} maxLength={50} />
        <Field
          label="Username"
          name="username"
          autoComplete="username"
          value={form.username}
          onChange={update('username')}
          error={errors.username}
          hint="Letters, numbers and underscores. This is your profile link."
          maxLength={20}
        />
        <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} error={errors.email} />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          hint="At least 8 characters."
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary mt-1 w-full py-3 font-display text-[19px] font-[750] [font-stretch:90%] disabled:cursor-progress disabled:border-solid disabled:border-line disabled:bg-ink disabled:text-sheet disabled:shadow-pass-pink"
        >
          {submitting && <Spinner className="size-4" />}
          Create account
        </button>
      </form>
    </AuthLayout>
  );
}
