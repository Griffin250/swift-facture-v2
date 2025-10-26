import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const RegistrationForm = ({ plan, billing, onClose }) => {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Import supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Validate password for paid plans
      if (plan.monthly > 0 && formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      
      // For free plans, use a simple password, for paid plans use user's password
      const password = plan.monthly === 0 
        ? Math.random().toString(36).slice(-8) + 'A1!'
        : formData.password;
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: password,
        options: {
          data: {
            full_name: formData.name,
            company_name: formData.company,
            phone: formData.phone,
            selected_plan: plan.id,
            billing_cycle: billing
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: "Account Created!",
          description: `Welcome ${formData.name}! Please check your email to verify your account.`,
        });

        // Close the dialog
        onClose();
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const price = plan.monthly === 0 
    ? t('pricing.free', 'Free')
    : billing === "monthly" 
      ? `${plan.monthly.toFixed(2)} €`
      : `${(plan.monthly * 12 * 0.85).toFixed(2)} €`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <p className="text-3xl font-extrabold text-primary mt-2">{price}</p>
        {plan.monthly > 0 && (
          <p className="text-sm text-muted-foreground">
            {billing === "yearly" ? t('premium.billing.yearly') : t('premium.billing.monthly')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">{t('common.required')} Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('common.required')} Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
        />
      </div>

      {plan.monthly > 0 && (
        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.form.password', 'Password')}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            minLength="6"
          />
          <p className="text-xs text-muted-foreground">
            {t('auth.form.passwordHint', 'Minimum 6 characters')}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="company">{t('common.optional')} Company</Label>
        <Input
          id="company"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleChange}
          placeholder="ACME Inc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t('common.optional')} Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
        >
          {t('buttons.cancel')}
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('common.loading') : t('buttons.confirm')}
        </Button>
      </div>
    </form>
  );
};

export default RegistrationForm;
