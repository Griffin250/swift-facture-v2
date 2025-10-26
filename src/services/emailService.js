import { supabase } from '@/integrations/supabase/client';

export class EmailService {
  /**
   * Email templates for trial system
   */
  static emailTemplates = {
    welcome: {
      en: {
        subject: 'Welcome to SwiftFacture - Your 30-Day Free Trial Starts Now!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea580c; margin: 0;">SwiftFacture</h1>
              <p style="color: #6b7280; margin: 5px 0;">Fast & Professional</p>
            </div>
            
            <h2 style="color: #1f2937;">Welcome to SwiftFacture!</h2>
            
            <p>Thank you for starting your 30-day free trial with SwiftFacture. You now have full access to all premium features to help you manage your invoices and receipts professionally.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">What you can do during your trial:</h3>
              <ul style="color: #4b5563;">
                <li>Create unlimited invoices and estimates</li>
                <li>Manage unlimited customers</li>
                <li>Access all premium templates</li>
                <li>Use advanced features like time tracking</li>
                <li>Send professional invoices and receipts</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Get Started Now</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">Your trial expires on {{trialEndDate}}. We'll send you reminders before it ends.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              SwiftFacture - Professional Invoice Management<br>
              If you have any questions, feel free to contact our support team.
            </p>
          </div>
        `,
        text: `
Welcome to SwiftFacture!

Thank you for starting your 30-day free trial with SwiftFacture. You now have full access to all premium features to help you manage your invoices and receipts professionally.

What you can do during your trial:
- Create unlimited invoices and estimates
- Manage unlimited customers
- Access all premium templates
- Use advanced features like time tracking
- Send professional invoices and receipts

Get started: {{dashboardUrl}}

Your trial expires on {{trialEndDate}}. We'll send you reminders before it ends.

SwiftFacture - Professional Invoice Management
        `
      },
      fr: {
        subject: 'Bienvenue sur SwiftFacture - Votre essai gratuit de 30 jours commence maintenant !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea580c; margin: 0;">SwiftFacture</h1>
              <p style="color: #6b7280; margin: 5px 0;">Rapide & Professionnel</p>
            </div>
            
            <h2 style="color: #1f2937;">Bienvenue sur SwiftFacture !</h2>
            
            <p>Merci d'avoir commencé votre essai gratuit de 30 jours avec SwiftFacture. Vous avez maintenant un accès complet à toutes les fonctionnalités premium pour vous aider à gérer vos factures et reçus de manière professionnelle.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Ce que vous pouvez faire pendant votre essai :</h3>
              <ul style="color: #4b5563;">
                <li>Créer des factures et devis illimités</li>
                <li>Gérer des clients illimités</li>
                <li>Accéder à tous les modèles premium</li>
                <li>Utiliser les fonctionnalités avancées comme le suivi du temps</li>
                <li>Envoyer des factures et reçus professionnels</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Commencer Maintenant</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">Votre essai expire le {{trialEndDate}}. Nous vous enverrons des rappels avant qu'il ne se termine.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              SwiftFacture - Gestion Professionnelle de Factures<br>
              Si vous avez des questions, n'hésitez pas à contacter notre équipe de support.
            </p>
          </div>
        `,
        text: `
Bienvenue sur SwiftFacture !

Merci d'avoir commencé votre essai gratuit de 30 jours avec SwiftFacture. Vous avez maintenant un accès complet à toutes les fonctionnalités premium pour vous aider à gérer vos factures et reçus de manière professionnelle.

Ce que vous pouvez faire pendant votre essai :
- Créer des factures et devis illimités
- Gérer des clients illimités
- Accéder à tous les modèles premium
- Utiliser les fonctionnalités avancées comme le suivi du temps
- Envoyer des factures et reçus professionnels

Commencer : {{dashboardUrl}}

Votre essai expire le {{trialEndDate}}. Nous vous enverrons des rappels avant qu'il ne se termine.

SwiftFacture - Gestion Professionnelle de Factures
        `
      }
    },
    reminder7: {
      en: {
        subject: 'Your SwiftFacture Trial Expires in 7 Days',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea580c; margin: 0;">SwiftFacture</h1>
            </div>
            
            <h2 style="color: #1f2937;">Your trial expires in 7 days</h2>
            
            <p>Your SwiftFacture free trial will expire on <strong>{{trialEndDate}}</strong>. Don't lose access to your professional invoice management tools!</p>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">What happens when your trial ends?</h3>
              <ul style="color: #92400e;">
                <li>Access to premium features will be limited</li>
                <li>Invoice and customer limits will apply</li>
                <li>Advanced templates will be locked</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{upgradeUrl}}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Upgrade Now</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">Continue enjoying unlimited invoices, customers, and premium features by choosing a plan that fits your needs.</p>
          </div>
        `,
        text: `
Your SwiftFacture trial expires in 7 days

Your SwiftFacture free trial will expire on {{trialEndDate}}. Don't lose access to your professional invoice management tools!

What happens when your trial ends?
- Access to premium features will be limited
- Invoice and customer limits will apply
- Advanced templates will be locked

Upgrade now: {{upgradeUrl}}

Continue enjoying unlimited invoices, customers, and premium features by choosing a plan that fits your needs.
        `
      },
      fr: {
        subject: 'Votre essai SwiftFacture expire dans 7 jours',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea580c; margin: 0;">SwiftFacture</h1>
            </div>
            
            <h2 style="color: #1f2937;">Votre essai expire dans 7 jours</h2>
            
            <p>Votre essai gratuit SwiftFacture expirera le <strong>{{trialEndDate}}</strong>. Ne perdez pas l'accès à vos outils de gestion de factures professionnels !</p>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">Que se passe-t-il à la fin de votre essai ?</h3>
              <ul style="color: #92400e;">
                <li>L'accès aux fonctionnalités premium sera limité</li>
                <li>Des limites de factures et clients s'appliqueront</li>
                <li>Les modèles avancés seront verrouillés</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{upgradeUrl}}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Mettre à Niveau</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">Continuez à profiter de factures illimitées, clients, et fonctionnalités premium en choisissant un plan qui convient à vos besoins.</p>
          </div>
        `,
        text: `
Votre essai SwiftFacture expire dans 7 jours

Votre essai gratuit SwiftFacture expirera le {{trialEndDate}}. Ne perdez pas l'accès à vos outils de gestion de factures professionnels !

Que se passe-t-il à la fin de votre essai ?
- L'accès aux fonctionnalités premium sera limité
- Des limites de factures et clients s'appliqueront
- Les modèles avancés seront verrouillés

Mettre à niveau : {{upgradeUrl}}

Continuez à profiter de factures illimitées, clients, et fonctionnalités premium en choisissant un plan qui convient à vos besoins.
        `
      }
    },
    reminder2: {
      en: {
        subject: 'Last Chance: Your SwiftFacture Trial Expires in 2 Days!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea580c; margin: 0;">SwiftFacture</h1>
            </div>
            
            <h2 style="color: #dc2626;">⚠️ Last Chance - Trial expires in 2 days!</h2>
            
            <p>Your SwiftFacture free trial will expire on <strong>{{trialEndDate}}</strong>. This is your last chance to upgrade and keep all your premium features!</p>
            
            <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #991b1b; margin-top: 0;">Don't lose access to:</h3>
              <ul style="color: #991b1b;">
                <li>Unlimited invoices and estimates</li>
                <li>All your customer data</li>
                <li>Premium templates and features</li>
                <li>Professional invoice delivery</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{upgradeUrl}}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Upgrade Now - Don't Lose Access!</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">Upgrade takes less than 2 minutes. Your data and settings will be preserved.</p>
          </div>
        `,
        text: `
⚠️ Last Chance - Your SwiftFacture trial expires in 2 days!

Your SwiftFacture free trial will expire on {{trialEndDate}}. This is your last chance to upgrade and keep all your premium features!

Don't lose access to:
- Unlimited invoices and estimates
- All your customer data
- Premium templates and features
- Professional invoice delivery

Upgrade now: {{upgradeUrl}}

Upgrade takes less than 2 minutes. Your data and settings will be preserved.
        `
      },
      fr: {
        subject: 'Dernière Chance : Votre essai SwiftFacture expire dans 2 jours !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea580c; margin: 0;">SwiftFacture</h1>
            </div>
            
            <h2 style="color: #dc2626;">⚠️ Dernière chance - L'essai expire dans 2 jours !</h2>
            
            <p>Votre essai gratuit SwiftFacture expirera le <strong>{{trialEndDate}}</strong>. C'est votre dernière chance de mettre à niveau et de conserver toutes vos fonctionnalités premium !</p>
            
            <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #991b1b; margin-top: 0;">Ne perdez pas l'accès à :</h3>
              <ul style="color: #991b1b;">
                <li>Factures et devis illimités</li>
                <li>Toutes vos données clients</li>
                <li>Modèles et fonctionnalités premium</li>
                <li>Livraison professionnelle de factures</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{upgradeUrl}}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Mettre à Niveau - Ne Perdez Pas l'Accès !</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">La mise à niveau prend moins de 2 minutes. Vos données et paramètres seront préservés.</p>
          </div>
        `,
        text: `
⚠️ Dernière chance - Votre essai SwiftFacture expire dans 2 jours !

Votre essai gratuit SwiftFacture expirera le {{trialEndDate}}. C'est votre dernière chance de mettre à niveau et de conserver toutes vos fonctionnalités premium !

Ne perdez pas l'accès à :
- Factures et devis illimités
- Toutes vos données clients
- Modèles et fonctionnalités premium
- Livraison professionnelle de factures

Mettre à niveau : {{upgradeUrl}}

La mise à niveau prend moins de 2 minutes. Vos données et paramètres seront préservés.
        `
      }
    },
    reminder1: {
      en: {
        subject: '🚨 URGENT: Your SwiftFacture Trial Expires Tomorrow!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea580c; margin: 0;">SwiftFacture</h1>
            </div>
            
            <h2 style="color: #dc2626;">🚨 URGENT: Trial expires TOMORROW!</h2>
            
            <p><strong>Your SwiftFacture free trial expires tomorrow ({{trialEndDate}}).</strong> After that, you'll lose access to all premium features.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc2626;">
              <h3 style="color: #991b1b; margin-top: 0;">⏰ Act NOW to avoid losing:</h3>
              <ul style="color: #991b1b; font-weight: bold;">
                <li>Unlimited invoice creation</li>
                <li>All your customer data access</li>
                <li>Premium templates and customization</li>
                <li>Advanced reporting features</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{upgradeUrl}}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; animation: pulse 1s infinite;">🚨 UPGRADE RIGHT NOW 🚨</a>
            </div>
            
            <p style="color: #dc2626; font-weight: bold; text-align: center;">Don't wait - upgrade in under 60 seconds!</p>
          </div>
        `,
        text: `
🚨 URGENT: Your SwiftFacture trial expires TOMORROW!

Your SwiftFacture free trial expires tomorrow ({{trialEndDate}}). After that, you'll lose access to all premium features.

⏰ Act NOW to avoid losing:
- Unlimited invoice creation
- All your customer data access
- Premium templates and customization
- Advanced reporting features

Upgrade right now: {{upgradeUrl}}

Don't wait - upgrade in under 60 seconds!
        `
      },
      fr: {
        subject: '🚨 URGENT : Votre essai SwiftFacture expire demain !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea580c; margin: 0;">SwiftFacture</h1>
            </div>
            
            <h2 style="color: #dc2626;">🚨 URGENT : L'essai expire DEMAIN !</h2>
            
            <p><strong>Votre essai gratuit SwiftFacture expire demain ({{trialEndDate}}).</strong> Après cela, vous perdrez l'accès à toutes les fonctionnalités premium.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc2626;">
              <h3 style="color: #991b1b; margin-top: 0;">⏰ Agissez MAINTENANT pour éviter de perdre :</h3>
              <ul style="color: #991b1b; font-weight: bold;">
                <li>Création de factures illimitées</li>
                <li>Accès à toutes vos données clients</li>
                <li>Modèles premium et personnalisation</li>
                <li>Fonctionnalités de rapport avancées</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{upgradeUrl}}" style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px;">🚨 METTRE À NIVEAU MAINTENANT 🚨</a>
            </div>
            
            <p style="color: #dc2626; font-weight: bold; text-align: center;">N'attendez pas - mise à niveau en moins de 60 secondes !</p>
          </div>
        `,
        text: `
🚨 URGENT : Votre essai SwiftFacture expire demain !

Votre essai gratuit SwiftFacture expire demain ({{trialEndDate}}). Après cela, vous perdrez l'accès à toutes les fonctionnalités premium.

⏰ Agissez MAINTENANT pour éviter de perdre :
- Création de factures illimitées
- Accès à toutes vos données clients
- Modèles premium et personnalisation
- Fonctionnalités de rapport avancées

Mettre à niveau maintenant : {{upgradeUrl}}

N'attendez pas - mise à niveau en moins de 60 secondes !
        `
      }
    },
    expired: {
      en: {
        subject: 'Your SwiftFacture Trial Has Expired - Upgrade to Continue',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea580c; margin: 0;">SwiftFacture</h1>
            </div>
            
            <h2 style="color: #dc2626;">Your trial has expired</h2>
            
            <p>Your 30-day SwiftFacture free trial ended on {{trialEndDate}}. Your account has been moved to our free plan with limited features.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280;">
              <h3 style="color: #374151; margin-top: 0;">What you can still do:</h3>
              <ul style="color: #4b5563;">
                <li>Access up to 5 customers</li>
                <li>Create up to 15 invoices/estimates per month</li>
                <li>Use basic templates</li>
                <li>Export to PDF</li>
              </ul>
            </div>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">Upgrade to get back:</h3>
              <ul style="color: #92400e;">
                <li>Unlimited customers and invoices</li>
                <li>All premium templates</li>
                <li>Advanced features like time tracking</li>
                <li>Priority support</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{upgradeUrl}}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Upgrade Now</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">All your data is safe and will be restored when you upgrade.</p>
          </div>
        `,
        text: `
Your SwiftFacture trial has expired

Your 30-day SwiftFacture free trial ended on {{trialEndDate}}. Your account has been moved to our free plan with limited features.

What you can still do:
- Access up to 5 customers
- Create up to 15 invoices/estimates per month
- Use basic templates
- Export to PDF

Upgrade to get back:
- Unlimited customers and invoices
- All premium templates
- Advanced features like time tracking
- Priority support

Upgrade now: {{upgradeUrl}}

All your data is safe and will be restored when you upgrade.
        `
      },
      fr: {
        subject: 'Votre essai SwiftFacture a expiré - Mettez à niveau pour continuer',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea580c; margin: 0;">SwiftFacture</h1>
            </div>
            
            <h2 style="color: #dc2626;">Votre essai a expiré</h2>
            
            <p>Votre essai gratuit SwiftFacture de 30 jours s'est terminé le {{trialEndDate}}. Votre compte a été transféré vers notre plan gratuit avec des fonctionnalités limitées.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280;">
              <h3 style="color: #374151; margin-top: 0;">Ce que vous pouvez encore faire :</h3>
              <ul style="color: #4b5563;">
                <li>Accéder jusqu'à 5 clients</li>
                <li>Créer jusqu'à 15 factures/devis par mois</li>
                <li>Utiliser les modèles de base</li>
                <li>Exporter en PDF</li>
              </ul>
            </div>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">Mettez à niveau pour récupérer :</h3>
              <ul style="color: #92400e;">
                <li>Clients et factures illimités</li>
                <li>Tous les modèles premium</li>
                <li>Fonctionnalités avancées comme le suivi du temps</li>
                <li>Support prioritaire</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{upgradeUrl}}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Mettre à Niveau</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">Toutes vos données sont en sécurité et seront restaurées lorsque vous mettrez à niveau.</p>
          </div>
        `,
        text: `
Votre essai SwiftFacture a expiré

Votre essai gratuit SwiftFacture de 30 jours s'est terminé le {{trialEndDate}}. Votre compte a été transféré vers notre plan gratuit avec des fonctionnalités limitées.

Ce que vous pouvez encore faire :
- Accéder jusqu'à 5 clients
- Créer jusqu'à 15 factures/devis par mois
- Utiliser les modèles de base
- Exporter en PDF

Mettez à niveau pour récupérer :
- Clients et factures illimités
- Tous les modèles premium
- Fonctionnalités avancées comme le suivi du temps
- Support prioritaire

Mettre à niveau : {{upgradeUrl}}

Toutes vos données sont en sécurité et seront restaurées lorsque vous mettrez à niveau.
        `
      }
    }
  };

  /**
   * Send welcome email when trial starts
   */
  static async sendWelcomeEmail(userEmail, organizationName, trialEndDate, language = 'en') {
    try {
      const template = this.emailTemplates.welcome[language];
      const dashboardUrl = `${window.location.origin}/dashboard`;
      
      const emailContent = {
        subject: template.subject,
        html: template.html
          .replace(/{{dashboardUrl}}/g, dashboardUrl)
          .replace(/{{trialEndDate}}/g, new Date(trialEndDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')),
        text: template.text
          .replace(/{{dashboardUrl}}/g, dashboardUrl)
          .replace(/{{trialEndDate}}/g, new Date(trialEndDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'))
      };

      // In a real app, you would integrate with an email service like:
      // - Supabase Edge Functions with Resend
      // - SendGrid
      // - Mailgun
      // - Amazon SES
      
      console.log('Would send welcome email:', {
        to: userEmail,
        subject: emailContent.subject,
        organization: organizationName,
        language
      });

      // For now, we'll use Supabase to log the email
      await this.logEmailSent('welcome', userEmail, organizationName, { language, trialEndDate });

      return { success: true };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send trial reminder email
   */
  static async sendTrialReminder(userEmail, organizationName, trialEndDate, daysLeft, language = 'en') {
    try {
      let templateKey;
      if (daysLeft === 7) templateKey = 'reminder7';
      else if (daysLeft === 2) templateKey = 'reminder2';
      else if (daysLeft === 1) templateKey = 'reminder1';
      else return { success: false, error: 'Invalid reminder day' };

      const template = this.emailTemplates[templateKey][language];
      const upgradeUrl = `${window.location.origin}/premium`;
      
      const emailContent = {
        subject: template.subject,
        html: template.html
          .replace(/{{upgradeUrl}}/g, upgradeUrl)
          .replace(/{{trialEndDate}}/g, new Date(trialEndDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')),
        text: template.text
          .replace(/{{upgradeUrl}}/g, upgradeUrl)
          .replace(/{{trialEndDate}}/g, new Date(trialEndDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'))
      };

      console.log(`Would send ${daysLeft}-day reminder email:`, {
        to: userEmail,
        subject: emailContent.subject,
        organization: organizationName,
        language
      });

      await this.logEmailSent(`reminder_${daysLeft}d`, userEmail, organizationName, { 
        language, 
        trialEndDate, 
        daysLeft 
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending reminder email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send trial expired email
   */
  static async sendTrialExpiredEmail(userEmail, organizationName, trialEndDate, language = 'en') {
    try {
      const template = this.emailTemplates.expired[language];
      const upgradeUrl = `${window.location.origin}/premium`;
      
      const emailContent = {
        subject: template.subject,
        html: template.html
          .replace(/{{upgradeUrl}}/g, upgradeUrl)
          .replace(/{{trialEndDate}}/g, new Date(trialEndDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')),
        text: template.text
          .replace(/{{upgradeUrl}}/g, upgradeUrl)
          .replace(/{{trialEndDate}}/g, new Date(trialEndDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'))
      };

      console.log('Would send trial expired email:', {
        to: userEmail,
        subject: emailContent.subject,
        organization: organizationName,
        language
      });

      await this.logEmailSent('trial_expired', userEmail, organizationName, { 
        language, 
        trialEndDate 
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending expired email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log email sent to database
   */
  static async logEmailSent(emailType, recipientEmail, organizationName, metadata = {}) {
    try {
      const { error } = await supabase
        .from('email_logs')
        .insert({
          email_type: emailType,
          recipient_email: recipientEmail,
          organization_name: organizationName,
          metadata,
          sent_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging email:', error);
      }

      return { success: true };
    } catch (error) {
      console.error('Error logging email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process trial reminder queue (called by cron job)
   */
  static async processTrialReminders() {
    try {
      const now = new Date();
      const reminderDays = [7, 2, 1];

      for (const days of reminderDays) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + days);
        
        // Find trials expiring in X days that haven't received this reminder
        const { data: expiringTrials, error } = await supabase
          .from('billing_subscriptions')
          .select(`
            id,
            trial_end,
            organizations (
              id,
              name,
              owner_id,
              org_members!inner (
                user_id,
                profiles (
                  email,
                  preferred_language
                )
              )
            )
          `)
          .eq('status', 'trialing')
          .gte('trial_end', targetDate.toISOString().split('T')[0])
          .lt('trial_end', new Date(targetDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        if (error) throw error;

        // Send reminder emails
        for (const trial of expiringTrials || []) {
          const ownerMember = trial.organizations.org_members.find(m => m.user_id === trial.organizations.owner_id);
          if (ownerMember?.profiles?.email) {
            await this.sendTrialReminder(
              ownerMember.profiles.email,
              trial.organizations.name,
              trial.trial_end,
              days,
              ownerMember.profiles.preferred_language || 'en'
            );
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error processing trial reminders:', error);
      return { success: false, error: error.message };
    }
  }
}

export default EmailService;