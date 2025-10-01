import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const RegistrationForm = ({ plan, billing, onClose }) => {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

    // Simulate API call
    setTimeout(() => {
      toast({
        title: t('common.success'),
        description: `Registration for ${plan.name} (${billing}) successful!`,
      });
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  const price = billing === "monthly" 
    ? plan.monthly.toFixed(2) 
    : (plan.monthly * 12 * 0.85).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <p className="text-3xl font-extrabold text-primary mt-2">{price} €</p>
        <p className="text-sm text-muted-foreground">
          {billing === "yearly" ? t('premium.billing.yearly') : t('premium.billing.monthly')}
        </p>
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
