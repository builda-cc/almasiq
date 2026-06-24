import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Mail, Phone, MapPin, Pencil, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUpdateProfile, useChangePassword } from '../hooks/queries';
import { formatDate } from '../utils/helpers';

interface ProfileFormValues {
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  city: string;
  bio: string;
}

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const inputClass =
  'w-full px-3 py-2.5 border border-beige-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none';

export function Profile() {
  const { t } = useTranslation();
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
    return <div className="py-16 text-center text-beige-500">{t('common.loading')}</div>;
  }

  const startEditing = () => {
    reset({
      full_name: user.full_name,
      email: user.email ?? '',
      phone: user.phone ?? '',
      whatsapp: user.whatsapp ?? '',
      telegram: user.telegram ?? '',
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
      whatsapp: values.whatsapp.trim() || null,
      telegram: values.telegram.trim() || null,
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
    { icon: UserIcon, label: t('profile.fullName'), value: user.full_name },
    { icon: Mail, label: t('profile.email'), value: user.email ?? '—' },
    { icon: Phone, label: t('profile.phone'), value: user.phone ?? '—' },
    { icon: MapPin, label: t('profile.city'), value: user.city ?? '—' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-beige-900">{t('profile.title')}</h1>
        {!editing && (
          <button
            onClick={startEditing}
            className="px-4 py-2 border border-beige-300 rounded-lg text-sm font-medium text-beige-700 hover:bg-beige-50 flex items-center gap-1.5"
          >
            <Pencil className="w-4 h-4" /> {t('profile.editProfile')}
          </button>
        )}
      </div>

      <div className="mt-6 bg-white border border-beige-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-gold-700">
              {user.full_name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-beige-900">{user.full_name}</h2>
            <p className="text-sm text-beige-500">
              {t('profile.memberSince', { date: formatDate(user.created_at) })}
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
              <label className="block text-sm font-medium text-beige-700 mb-1">
                {t('profile.fullName')}
              </label>
              <input
                className={inputClass}
                {...register('full_name', { required: true })}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-600">{t('profile.fullNameRequired')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-1">
                {t('profile.email')}
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
                  {t('auth.emailInvalid')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  {t('profile.phone')}
                </label>
                <input
                  className={inputClass}
                  placeholder={t('profile.phonePlaceholder')}
                  {...register('phone')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  {t('profile.city')}
                </label>
                <input
                  className={inputClass}
                  placeholder={t('profile.cityPlaceholder')}
                  {...register('city')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  {t('profile.whatsapp')}
                </label>
                <input
                  className={inputClass}
                  placeholder={t('profile.whatsappPlaceholder')}
                  {...register('whatsapp')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  {t('profile.telegram')}
                </label>
                <input
                  className={inputClass}
                  placeholder={t('profile.telegramPlaceholder')}
                  {...register('telegram')}
                />
              </div>
            </div>

            <p className="text-xs text-beige-500">{t('profile.privacyNote')}</p>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-1">
                {t('profile.bio')}
              </label>
              <textarea
                rows={3}
                className={inputClass}
                placeholder={t('profile.bioPlaceholder')}
                {...register('bio')}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="px-5 py-2.5 bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white font-semibold rounded-lg"
              >
                {updateProfile.isPending ? t('common.saving') : t('profile.saveChanges')}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="px-5 py-2.5 border border-beige-300 text-beige-700 font-medium rounded-lg hover:bg-beige-50"
              >
                {t('profile.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-center gap-3 px-4 py-3 bg-beige-50 rounded-lg"
                >
                  <field.icon className="w-5 h-5 text-beige-400" />
                  <div>
                    <p className="text-xs text-beige-500">{field.label}</p>
                    <p className="text-sm font-medium text-beige-900">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-sm text-beige-500">{t('profile.bio')}</p>
              <p className="mt-1 text-beige-700">
                {user.bio ? user.bio : t('profile.noBio')}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 bg-white border border-beige-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-beige-400" />
            <div>
              <h2 className="text-lg font-semibold text-beige-900">{t('profile.passwordSection')}</h2>
              <p className="text-sm text-beige-500">
                {t('profile.passwordDescription')}
              </p>
            </div>
          </div>
          {!changingPassword && (
            <button
              onClick={startChangingPassword}
              className="px-4 py-2 border border-beige-300 rounded-lg text-sm font-medium text-beige-700 hover:bg-beige-50"
            >
              {t('auth.changePassword')}
            </button>
          )}
        </div>

        {passwordSuccess && !changingPassword && (
          <div className="mt-4 px-4 py-2.5 bg-gold-50 text-gold-700 text-sm rounded-lg">
            {t('auth.passwordUpdated')}
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
              <label className="block text-sm font-medium text-beige-700 mb-1">
                {t('auth.currentPassword')}
              </label>
              <input
                type="password"
                className={inputClass}
                {...registerPassword('current_password', { required: true })}
              />
              {passwordErrors.current_password && (
                <p className="mt-1 text-xs text-red-600">
                  {t('auth.currentPasswordRequired')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  {t('auth.newPassword')}
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
                    {t('auth.newPasswordMin')}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  type="password"
                  className={inputClass}
                  {...registerPassword('confirm_password', {
                    required: true,
                    validate: (value) =>
                      value === watchPassword('new_password') ||
                      t('auth.passwordsNoMatch'),
                  })}
                />
                {passwordErrors.confirm_password && (
                  <p className="mt-1 text-xs text-red-600">
                    {passwordErrors.confirm_password.message ||
                      t('auth.confirmPasswordRequired')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={changePassword.isPending}
                className="px-5 py-2.5 bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white font-semibold rounded-lg"
              >
                {changePassword.isPending ? t('common.updating') : t('auth.updatePassword')}
              </button>
              <button
                type="button"
                onClick={cancelChangingPassword}
                className="px-5 py-2.5 border border-beige-300 text-beige-700 font-medium rounded-lg hover:bg-beige-50"
              >
                {t('auth.cancel')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
