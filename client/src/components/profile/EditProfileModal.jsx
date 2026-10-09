import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import Field from '../auth/Field';
import { useAuth } from '../../context/AuthContext';
import { validateImage, IMAGE_TYPES } from '../../hooks/useImageAttachments';
import { errorMessage, fieldErrors, usersApi } from '../../lib/api';
import { cn } from '../../utils/format';
import halftoneCover from '../../assets/halftone-cover.svg';

const BIO_MAX = 160;

function useImagePick() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pick = (event) => {
    const chosen = event.target.files?.[0];
    event.target.value = '';
    if (!chosen) return;
    const problem = validateImage(chosen);
    if (problem) return toast.error(problem);
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  };

  return { file, preview, pick };
}

// The parent only mounts this while it's open, so every open starts from the
// current profile without any reset logic.
export default function EditProfileModal({ onClose, profile }) {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();
  const avatar = useImagePick();
  const cover = useImagePick();
  const [form, setForm] = useState({
    name: profile.name,
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
  });
  const [errors, setErrors] = useState({});

  const save = useMutation({
    mutationFn: () => {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value.trim()));
      if (avatar.file) data.append('avatar', avatar.file);
      if (cover.file) data.append('cover', cover.file);
      return usersApi.updateMe(data);
    },
    onSuccess: ({ user }) => {
      setUser(user);
      queryClient.setQueryData(['profile', user.username], (data) => data && { user: { ...data.user, ...user } });
      // Avatars and names are embedded in posts and comments, so refetch those.
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Profile updated');
      onClose();
    },
    onError: (error) => {
      setErrors(fieldErrors(error));
      toast.error(errorMessage(error, 'Could not save your profile'));
    },
  });

  const update = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }));
  const bioLength = form.bio.length;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return setErrors({ name: 'Name is required' });
    if (bioLength > BIO_MAX) return setErrors({ bio: `Bio can be at most ${BIO_MAX} characters` });
    save.mutate();
  };

  const coverSrc = cover.preview || profile.cover;
  const avatarUser = { ...profile, avatar: avatar.preview || profile.avatar };

  return (
    <Modal
      open
      onClose={() => !save.isPending && onClose()}
      title="Edit profile"
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={save.isPending} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" form="edit-profile-form" disabled={save.isPending} className="btn-primary px-5">
            {save.isPending && <Spinner className="size-4" />}
            Save
          </button>
        </>
      }
    >
      <form id="edit-profile-form" onSubmit={handleSubmit} noValidate>
        {/* The cover is the same halftone field as the profile poster until a photo is chosen. */}
        <div className="relative aspect-[3/1] overflow-hidden border-b-2 border-line bg-sheet-hi">
          {coverSrc ? (
            <img src={coverSrc} alt="Cover preview" className="size-full object-cover" />
          ) : (
            <img src={halftoneCover} alt="" className="halftone size-full object-cover" />
          )}
          <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-riso-black/25 hover:bg-riso-black/40 has-[input:focus-visible]:bg-riso-black/40 has-[input:focus-visible]:outline-3 has-[input:focus-visible]:-outline-offset-[6px] has-[input:focus-visible]:outline-focus">
            <span className="inline-flex items-center gap-2 rounded-sm border-2 border-paper bg-riso-black px-3.5 py-2 text-sm font-bold text-paper">
              <Camera className="size-4" aria-hidden="true" />
              Change cover
            </span>
            <input type="file" accept={IMAGE_TYPES.join(',')} onChange={cover.pick} className="sr-only" />
          </label>
        </div>

        <div className="px-5">
          <label className="group relative -mt-12 inline-block cursor-pointer rounded-full has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus">
            <Avatar user={avatarUser} size="xl" className="border-[3px] shadow-[0_0_0_4px_var(--hd-sheet)]" />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-riso-black/35 text-paper group-hover:bg-riso-black/50 group-has-[input:focus-visible]:bg-riso-black/50">
              <Camera className="size-5" aria-hidden="true" />
              <span className="sr-only">Change profile photo</span>
            </span>
            <input type="file" accept={IMAGE_TYPES.join(',')} onChange={avatar.pick} className="sr-only" />
          </label>
        </div>

        <div className="space-y-4 px-5 pt-3 pb-6">
          <Field label="Name" value={form.name} onChange={update('name')} error={errors.name} maxLength={50} />

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="edit-bio" className="text-sm font-semibold text-ink">
                Bio
              </label>
              <span className={cn('type-meta tabular-nums', bioLength > BIO_MAX && 'font-semibold text-danger-ink')}>
                {bioLength}/{BIO_MAX}
              </span>
            </div>
            <textarea
              id="edit-bio"
              value={form.bio}
              onChange={update('bio')}
              rows={3}
              className={cn('input resize-none', errors.bio && 'border-danger')}
              aria-invalid={Boolean(errors.bio)}
            />
            {errors.bio && <p className="mt-1.5 text-[13px] font-medium text-danger-ink">{errors.bio}</p>}
          </div>

          <Field label="Location" value={form.location} onChange={update('location')} error={errors.location} maxLength={40} />
          <Field
            label="Website"
            value={form.website}
            onChange={update('website')}
            error={errors.website}
            placeholder="yourname.dev"
            inputMode="url"
            maxLength={100}
          />
        </div>
      </form>
    </Modal>
  );
}
