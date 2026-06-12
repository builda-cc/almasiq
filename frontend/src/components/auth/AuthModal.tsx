import { useForm } from 'react-hook-form';
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
  'w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all';

export function AuthModal() {
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
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Aliya Nurlanovna"
                      {...register('full_name', { required: !isLogin })}
                    />
                  </div>
                  {errors.full_name && (
                    <p className="mt-1 text-xs text-red-600">Full name is required</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      className={inputClass}
                      placeholder="+7 701 000 0000"
                      {...register('phone')}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  className={inputClass}
                  placeholder="you@example.kz"
                  {...register('email', { required: true })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">Email is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  className={inputClass}
                  placeholder="********"
                  {...register('password', { required: true, minLength: 6 })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
            >
              {pending ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={switchAuthMode}
                className="ml-1 text-emerald-600 font-medium hover:text-emerald-700"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
