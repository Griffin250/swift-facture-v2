import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    rememberMe: false
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation for email
    if (name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFieldErrors(prev => ({
          ...prev,
          email: t('auth.error.invalidEmail', 'Please enter a valid email address.')
        }));
      }
    }

    // Real-time validation for password confirmation
    if (name === 'confirmPassword' && value && formData.password && value !== formData.password) {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: t('auth.error.passwordMatch', 'Passwords do not match.')
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        // Clear any existing field errors
        setFieldErrors({});

        // Login - First validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
          setFieldErrors(prev => ({ ...prev, email: t('auth.error.invalidEmail', 'Please enter a valid email address.') }));
          setIsSubmitting(false);
          return;
        }
        
        if (!emailRegex.test(formData.email)) {
          setFieldErrors(prev => ({ ...prev, email: t('auth.error.invalidEmail', 'Please enter a valid email address.') }));
          setIsSubmitting(false);
          return;
        }

        if (!formData.password) {
          setFieldErrors(prev => ({ ...prev, password: t('auth.error.passwordRequired', 'Password is required.') }));
          setIsSubmitting(false);
          return;
        }

        // Attempt login
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          // Handle specific authentication errors
          let errorMessage = '';
          
          // Check for invalid credentials (wrong email or password)
          if (error.message === 'Invalid login credentials' || 
              error.status === 400 || 
              error.message.includes('credentials')) {
            errorMessage = t('auth.error.invalidCredentials', 'Email or password is incorrect. Please try again.');
            // Set field-level errors for both email and password
            setFieldErrors({
              email: t('auth.error.invalidCredentials', 'Email or password is incorrect'),
              password: t('auth.error.invalidCredentials', 'Email or password is incorrect')
            });
          } else {
            // Handle other errors
            switch (error.message) {
              case 'Email not confirmed':
                errorMessage = t('auth.error.emailNotConfirmed', 'Please check your email and click the confirmation link before signing in.');
                break;
              case 'Too many requests':
                errorMessage = t('auth.error.tooManyRequests', 'Too many login attempts. Please wait a moment before trying again.');
                break;
              case 'User not found':
                errorMessage = t('auth.error.userNotFound', 'Email or password is incorrect. Please try again.');
                setFieldErrors({
                  email: t('auth.error.invalidCredentials', 'Email or password is incorrect'),
                  password: t('auth.error.invalidCredentials', 'Email or password is incorrect')
                });
                break;
              default:
                // Check if it's a network/connection error
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                  errorMessage = t('auth.error.networkError', 'Connection error. Please check your internet connection and try again.');
                } else {
                  errorMessage = t('auth.error.loginFailed', 'Email or password is incorrect. Please try again.');
                  setFieldErrors({
                    email: t('auth.error.invalidCredentials', 'Email or password is incorrect'),
                    password: t('auth.error.invalidCredentials', 'Email or password is incorrect')
                  });
                }
            }
          }
          
          toast({
            title: t('auth.error.title', 'Login Failed'),
            description: errorMessage,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        toast({
          title: t('auth.success.loginTitle', 'Success!'),
          description: t('auth.success.loginMessage', "You've been logged in successfully."),
        });
        navigate(from, { replace: true });
      } else {
        // Sign up - validate required fields
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          toast({
            title: "Error",
            description: "First name and last name are required.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        if (formData.password.length < 6) {
          toast({
            title: "Error",
            description: "Password must be at least 6 characters long.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        console.log('Attempting signup with:', {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        });

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            },
          },
        });

        console.log('Signup response:', { data, error });

        if (error) throw error;

        // Check if email confirmation is required
        if (data.user && !data.session) {
          toast({
            title: "Check your email!",
            description: "We've sent you a confirmation link to complete your registration.",
          });
        } else {
          toast({
            title: "Success!",
            description: "Your account has been created successfully.",
          });
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Check if user is already logged in and listen for auth changes
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate('/');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? t('auth.login.title') : t('auth.register.title')}
          </h1>
          <p className="text-gray-600">
            {isLogin ? t('auth.login.subtitle') : t('auth.register.subtitle')}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.form.firstName')}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('auth.form.placeholders.firstName')}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.form.lastName')}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('auth.form.placeholders.lastName')}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.form.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  fieldErrors.email 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder={t('auth.form.placeholders.email')}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.form.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    fieldErrors.password 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder={t('auth.form.placeholders.password')}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.form.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      fieldErrors.confirmPassword 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder={t('auth.form.placeholders.password')}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">{t('auth.form.rememberMe')}</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                  {t('auth.form.forgotPassword')}
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('buttons.loading') || 'Loading...' : (isLogin ? t('buttons.signIn') : t('buttons.createAccount'))}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('auth.divider')}</span>
            </div>
          </div>

          {/* Third-Party Auth Buttons */}
          <div className="space-y-3 mb-6">
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('buttons.continueWithGoogle')}
            </button>

            <button 
              type="button"
              onClick={handleGitHubSignIn}
              className="w-full flex items-center justify-center gap-3 bg-black text-white rounded-xl py-3 px-4 font-medium hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.335-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              {t('buttons.continueWithGitHub')}
            </button>
          </div>

          {/* Toggle between Login/Signup */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isLogin ? t('auth.toggle.noAccount') : t('auth.toggle.hasAccount')}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-blue-600 font-semibold hover:text-blue-500 transition-colors duration-200"
              >
                {isLogin ? t('auth.toggle.signUp') : t('auth.toggle.signIn')}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            {t('auth.footer.agreement')}{' '}
            <a href="#" className="text-gray-600 hover:text-gray-800">{t('auth.footer.terms')}</a>
            {' '}and{' '}
            <a href="#" className="text-gray-600 hover:text-gray-800">{t('auth.footer.privacy')}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;