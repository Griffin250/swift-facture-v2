import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the access_token and refresh_token from URL params
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Verification error:', error);
            setVerificationStatus('error');
            toast({
              title: t('auth.verification.error.title', 'Verification Failed'),
              description: t('auth.verification.error.message', 'There was an error verifying your email. Please try again.'),
              variant: "destructive",
            });
          } else {
            setVerificationStatus('success');
            toast({
              title: t('auth.verification.success.title', 'Email Verified Successfully!'),
              description: t('auth.verification.success.message', 'Your account has been verified. You will be redirected to login.'),
            });

            // Start countdown and redirect
            const countdownInterval = setInterval(() => {
              setCountdown((prev) => {
                if (prev <= 1) {
                  clearInterval(countdownInterval);
                  navigate('/login', { 
                    state: { 
                      emailVerified: true,
                      message: t('auth.verification.loginMessage', 'Your email has been verified. You can now login.')
                    }
                  });
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }
        } else {
          setVerificationStatus('error');
          toast({
            title: t('auth.verification.error.title', 'Verification Failed'),
            description: t('auth.verification.error.invalidLink', 'Invalid verification link. Please check your email and try again.'),
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        toast({
          title: t('auth.verification.error.title', 'Verification Failed'),
          description: t('auth.verification.error.message', 'There was an error verifying your email. Please try again.'),
          variant: "destructive",
        });
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate, t, toast]);

  const handleManualRedirect = () => {
    navigate('/login', { 
      state: { 
        emailVerified: verificationStatus === 'success',
        message: verificationStatus === 'success' 
          ? t('auth.verification.loginMessage', 'Your email has been verified. You can now login.')
          : t('auth.verification.loginMessageFailed', 'Please try logging in or contact support.')
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* SwiftFacture Branding */}
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SwiftFacture</h1>
          <p className="text-gray-600 text-sm">Professional Invoice Generator</p>
        </div>

        {/* Verification Status */}
        {verificationStatus === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t('auth.verification.verifying', 'Verifying Your Email...')}
            </h2>
            <p className="text-gray-600">
              {t('auth.verification.pleaseWait', 'Please wait while we verify your email address.')}
            </p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-900">
              {t('auth.verification.success.title', 'Email Verified Successfully!')}
            </h2>
            <p className="text-gray-600">
              {t('auth.verification.success.description', 'Your account has been verified successfully. You can now access all SwiftFacture features.')}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-blue-800 text-sm">
                {t('auth.verification.redirecting', 'Redirecting to login in')} <span className="font-bold">{countdown}</span> {t('auth.verification.seconds', 'seconds')}...
              </p>
            </div>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-900">
              {t('auth.verification.error.title', 'Verification Failed')}
            </h2>
            <p className="text-gray-600">
              {t('auth.verification.error.description', 'We were unable to verify your email address. This might be due to an expired or invalid link.')}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
              <p className="text-amber-800 text-sm">
                {t('auth.verification.error.help', 'Please try requesting a new verification email or contact our support team.')}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        {verificationStatus !== 'loading' && (
          <div className="mt-8">
            <Button
              onClick={handleManualRedirect}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>
                {verificationStatus === 'success' 
                  ? t('auth.verification.continueToLogin', 'Continue to Login')
                  : t('auth.verification.goToLogin', 'Go to Login')
                }
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {t('auth.verification.footer', 'Having trouble? Contact our support team at support@swiftfacture.com')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;