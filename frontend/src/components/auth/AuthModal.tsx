import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { X, Mail, Lock, User as UserIcon, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useLogin, useRegister } from '../../hooks/queries';

interface FormValues {
  full_name: string;
  phone: string;
  email: string;
  password: string;
}

const inputClass =
  'w-full pl-10 pr-4 py-2.5 border border-beige-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-all';

export function AuthModal() {
  const { t } = useTranslation();
  const { authModalOpen, authMode, closeAuth, switchAuthMode } = useUIStore();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  if (!authModalOpen) return null;

  const isLogin = authMode === 'login';
  const pending = loginMutation.isPending || registerMutation.isPending;
  const errorMessage =
    (loginMutation.error as { response?: { data?: { detail?: string } } } | null)
      ?.response?.data?.detail ??
    (registerMutation.error as { response?: { data?: { detail?: string } } } | null)
      ?.response?.data?.detail;

  const onClose = () => {
    reset();
    loginMutation.reset();
    registerMutation.reset();
    closeAuth();
  };

  const onSubmit = handleSubmit(async (values) => {
    if (isLogin) {
      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
    } else {
      await registerMutation.mutateAsync({
        full_name: values.full_name,
        phone: values.phone || undefined,
        email: values.email,
        password: values.password,
      });
    }
    onClose();
    navigate('/dashboard');
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-beige-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-beige-900">
              {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-beige-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-beige-500" />
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 text-red-700 text-sm rounded-lg">
              {errorMessage}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    {t('auth.fullName')}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -tranbeige-y-1/2 w-5 h-5 text-beige-400" />
                    <input
                      type="text"
                      className={inputClass}
                      placeholder={t('auth.fullNamePlaceholder')}
                      {...register('full_name', { required: !isLogin })}
                    />
                  </div>
                  {errors.full_name && (
                    <p className="mt-1 text-xs text-red-600">{t('auth.fullNameRequired')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-1">
                    {t('auth.phone')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -tranbeige-y-1/2 w-5 h-5 text-beige-400" />
                    <input
                      type="tel"
                      className={inputClass}
                      placeholder={t('auth.phonePlaceholder')}
                      {...register('phone')}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-1">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -tranbeige-y-1/2 w-5 h-5 text-beige-400" />
                <input
                  type="email"
                  className={inputClass}
                  placeholder={t('auth.emailPlaceholder')}
                  {...register('email', { required: true })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{t('auth.emailRequired')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -tranbeige-y-1/2 w-5 h-5 text-beige-400" />
                <input
                  type="password"
                  className={inputClass}
                  placeholder={t('auth.passwordPlaceholder')}
                  {...register('password', { required: true, minLength: 6 })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{t('auth.passwordMin')}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 bg-gold-gradient hover:bg-gold-gradient-hover disabled:opacity-60 text-dark font-semibold rounded-lg shadow-sm transition-colors"
            >
              {pending ? t('auth.pleaseWait') : isLogin ? t('auth.signIn') : t('auth.createAccount')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-beige-600">
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
              <button
                onClick={switchAuthMode}
                className="ml-1 text-gold-600 font-medium hover:text-gold-700"
              >
                {isLogin ? t('auth.signUp') : t('auth.signIn')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
