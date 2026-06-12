import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User as UserIcon, Mail, Phone, MapPin, Pencil, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUpdateProfile, useChangePassword } from '../hooks/queries';
import { formatDate } from '../utils/helpers';

interface ProfileFormValues {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
}

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const inputClass =
  'w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none';

export function Profile() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>();

  if (!user) {
    return <div className="py-16 text-center text-slate-500">Loading…</div>;
  }

  const startEditing = () => {
    reset({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone ?? '',
      city: user.city ?? '',
      bio: user.bio ?? '',
    });
    updateProfile.reset();
    setEditing(true);
  };

  const cancelEditing = () => {
    updateProfile.reset();
    setEditing(false);
  };

  const onSubmit = handleSubmit(async (values) => {
    await updateProfile.mutateAsync({
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || null,
      city: values.city.trim() || null,
      bio: values.bio.trim() || null,
    });
    setEditing(false);
  });

  const startChangingPassword = () => {
    resetPassword({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    changePassword.reset();
    setPasswordSuccess(false);
    setChangingPassword(true);
  };

  const cancelChangingPassword = () => {
    changePassword.reset();
    setChangingPassword(false);
  };

  const onPasswordSubmit = handlePasswordSubmit(async (values) => {
    await changePassword.mutateAsync({
      current_password: values.current_password,
      new_password: values.new_password,
    });
    setChangingPassword(false);
    setPasswordSuccess(true);
  });

  const errorMessage = (
    updateProfile.error as
      | { response?: { data?: { detail?: string } } }
      | null
      | undefined
  )?.response?.data?.detail;

  const passwordErrorMessage = (
    changePassword.error as
      | { response?: { data?: { detail?: string } } }
      | null
      | undefined
  )?.response?.data?.detail;

  const fields = [
    { icon: UserIcon, label: 'Full Name', value: user.full_name },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone ?? '—' },
    { icon: MapPin, label: 'City', value: user.city ?? '—' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        {!editing && (
          <button
            onClick={startEditing}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Pencil className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-emerald-700">
              {user.full_name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{user.full_name}</h2>
            <p className="text-sm text-slate-500">
              Member since {formatDate(user.created_at)}
            </p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {errorMessage && (
              <div className="px-4 py-2.5 bg-red-50 text-red-700 text-sm rounded-lg">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                className={inputClass}
                {...register('full_name', { required: true })}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-600">Full name is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className={inputClass}
                {...register('email', {
                  required: true,
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  A valid email is required
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  className={inputClass}
                  placeholder="+7 700 000 0000"
                  {...register('phone')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City
                </label>
                <input
                  className={inputClass}
                  placeholder="Almaty"
                  {...register('city')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bio
              </label>
              <textarea
                rows={3}
                className={inputClass}
                placeholder="Tell others a bit about yourself…"
                {...register('bio')}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg"
              >
                {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg"
                >
                  <field.icon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{field.label}</p>
                    <p className="text-sm font-medium text-slate-900">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-sm text-slate-500">Bio</p>
              <p className="mt-1 text-slate-700">
                {user.bio ? user.bio : 'No bio yet.'}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-slate-400" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Password</h2>
              <p className="text-sm text-slate-500">
                Change the password you use to sign in.
              </p>
            </div>
          </div>
          {!changingPassword && (
            <button
              onClick={startChangingPassword}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Change Password
            </button>
          )}
        </div>

        {passwordSuccess && !changingPassword && (
          <div className="mt-4 px-4 py-2.5 bg-emerald-50 text-emerald-700 text-sm rounded-lg">
            Your password has been updated.
          </div>
        )}

        {changingPassword && (
          <form onSubmit={onPasswordSubmit} className="mt-6 space-y-4">
            {passwordErrorMessage && (
              <div className="px-4 py-2.5 bg-red-50 text-red-700 text-sm rounded-lg">
                {passwordErrorMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                className={inputClass}
                {...registerPassword('current_password', { required: true })}
              />
              {passwordErrors.current_password && (
                <p className="mt-1 text-xs text-red-600">
                  Current password is required
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className={inputClass}
                  {...registerPassword('new_password', {
                    required: true,
                    minLength: 6,
                  })}
                />
                {passwordErrors.new_password && (
                  <p className="mt-1 text-xs text-red-600">
                    Must be at least 6 characters
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className={inputClass}
                  {...registerPassword('confirm_password', {
                    required: true,
                    validate: (value) =>
                      value === watchPassword('new_password') ||
                      'Passwords do not match',
                  })}
                />
                {passwordErrors.confirm_password && (
                  <p className="mt-1 text-xs text-red-600">
                    {passwordErrors.confirm_password.message ||
                      'Please confirm your password'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={changePassword.isPending}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg"
              >
                {changePassword.isPending ? 'Updating…' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={cancelChangingPassword}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
