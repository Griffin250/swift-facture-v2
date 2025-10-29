swiftfacture/
│
├── backend/                                  # 🚀 FastAPI backend
│   ├── app/
│   │   ├── main.py                           # Entry point – mounts all routes
│   │   │
│   │   ├── core/                             # Core backend utilities & configs
│   │   │   ├── config.py                     # Global settings, env vars, CORS, DB URL
│   │   │   ├── security.py                   # 🔐 Password hashing, encryption, KMS helpers
│   │   │   ├── auth_middleware.py            # Auth validation (Supabase JWT / RBAC)
│   │   │   ├── audit_middleware.py           # Logs each request touching personal data
│   │   │   ├── permissions.py                # Role-based access checks (admin, user)
│   │   │   └── utils.py                      # Shared utility functions
│   │   │
│   │   ├── privacy/                          # 🧾 GDPR Core Logic
│   │   │   ├── __init__.py
│   │   │   ├── models.py                     # Tables: consent_records, ds_requests, audit_logs
│   │   │   ├── schemas.py                    # Pydantic models for data validation
│   │   │   ├── routes_consent.py             # Record & retrieve user consent
│   │   │   ├── routes_requests.py            # Handle data subject requests (export/delete)
│   │   │   ├── services.py                   # Business logic for GDPR actions
│   │   │   ├── utils.py                      # File zipping, anonymization, helpers
│   │   │   ├── retention_job.py              # 🕓 Scheduled cleanup & anonymization
│   │   │   └── notifications.py              # Optional: send DSR or breach emails
│   │   │
│   │   ├── admin/                            # ⚙️ Admin Control Panel API
│   │   │   ├── __init__.py
│   │   │   ├── models.py                     # Admin-only tables (breach reports, admin logs)
│   │   │   ├── routes_dashboard.py           # All-in-one admin API endpoint for dashboard
│   │   │   ├── routes_breach.py              # Breach reporting & incident logging
│   │   │   ├── routes_users.py               # Manage users (list, deactivate, assign roles)
│   │   │   ├── routes_audit.py               # Fetch GDPR audit logs for UI display
│   │   │   ├── routes_stats.py               # Analytics: total users, active DS requests, etc.
│   │   │   ├── services.py                   # Logic for admin dashboards and reports
│   │   │   ├── schemas.py                    # Admin-related data models
│   │   │   └── permissions.py                # Enforce admin-only access on routes
│   │   │
│   │   ├── users/                            # 👥 User management endpoints
│   │   │   ├── routes_auth.py                # Signup, login, refresh tokens
│   │   │   ├── routes_profile.py             # View/update user profile info
│   │   │   ├── services.py                   # CRUD + link to Supabase Auth
│   │   │   └── schemas.py                    # Pydantic models for users
│   │   │
│   │   ├── invoices/                         # 💳 Example app feature
│   │   │   ├── routes_invoices.py            # CRUD for invoices
│   │   │   ├── services.py                   # Invoice calculations, permissions
│   │   │   ├── models.py                     # Invoice table schema
│   │   │   └── schemas.py                    # Invoice validation models
│   │   │
│   │   ├── db/                               # 🗃️ Database config & migrations
│   │   │   ├── session.py                    # Supabase/PostgreSQL DB session
│   │   │   ├── migrations/
│   │   │   │   ├── 001_create_consent_records.sql
│   │   │   │   ├── 002_create_data_subject_requests.sql
│   │   │   │   ├── 003_create_audit_logs.sql
│   │   │   │   ├── 004_create_breach_reports.sql
│   │   │   │   ├── 005_add_admin_roles.sql
│   │   │   │   ├── 006_rls_policies.sql
│   │   │   │   └── 007_create_invoices.sql
│   │   │
│   │   ├── tests/                            # ✅ Unit & integration tests
│   │   │   ├── test_privacy_endpoints.py
│   │   │   ├── test_export_delete.py
│   │   │   ├── test_audit_logging.py
│   │   │   ├── test_admin_routes.py
│   │   │   ├── test_user_roles.py
│   │   │   └── test_invoice_routes.py
│   │   │
│   │   ├── tasks/                            # 🕒 Background tasks (optional)
│   │   │   ├── scheduler.py                  # Schedules retention jobs, breach alerts
│   │   │   └── email_queue.py                # Async email delivery (privacy requests)
│   │   │
│   │   └── utils/                            # Shared helpers
│   │       └── logger.py                     # Central logging config (GDPR-safe)
│   │
│   └── requirements.txt                      # Dependencies (FastAPI, pydantic, supabase, etc.)
│
│
├── frontend/                                 # 🎨 React + Next.js (TypeScript)
│   ├── app/
│   │   ├── layout.tsx                        # Base layout wrapper (Navbar, Sidebar)
│   │   ├── page.tsx                          # Main landing page
│   │   │
│   │   ├── privacy/
│   │   │   ├── page.tsx                      # 📄 Privacy Policy (static markdown)
│   │   │   ├── consent-center/
│   │   │   │   ├── page.tsx                  # User view/revoke consent
│   │   │   ├── data-requests/
│   │   │   │   ├── page.tsx                  # Export/Delete/Rectify data request form
│   │   │
│   │   ├── terms/
│   │   │   ├── page.tsx                      # Terms & Conditions page
│   │   │
│   │   ├── admin/                            # 🧭 Admin Dashboard Frontend
│   │   │   ├── layout.tsx                    # Sidebar layout (links to subpages)
│   │   │   ├── page.tsx                      # Admin overview (stats, quick actions)
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── page.tsx                  # Manage users, assign roles, deactivate
│   │   │   ├── gdpr/
│   │   │   │   ├── page.tsx                  # GDPR center: requests, consents, retention
│   │   │   ├── breaches/
│   │   │   │   ├── page.tsx                  # Breach reports list & alerts
│   │   │   ├── audit-logs/
│   │   │   │   ├── page.tsx                  # Full audit trail viewer
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx                  # Manage invoices and user billing
│   │   │   └── settings/
│   │   │       ├── page.tsx                  # Admin config (retention policy, DPO contact)
│   │   │
│   │   ├── components/                       # 🧩 Reusable components
│   │   │   ├── PrivacyNotice.tsx             # Inline text “By signing up, you agree…”
│   │   │   ├── DataRequestForm.tsx           # Form for export/delete/rectify
│   │   │   ├── ConsentStatus.tsx             # Shows consent state
│   │   │   ├── AuditLogTable.tsx             # View of GDPR audit logs
│   │   │   ├── AdminStatsCards.tsx           # Dashboard cards (users, DS requests, breaches)
│   │   │   ├── BreachAlert.tsx               # Small breach alert banner
│   │   │   ├── UserTable.tsx                 # User management table
│   │   │   └── InvoiceList.tsx               # Invoice list component
│   │
│   └── lib/                                  # 🧠 Frontend utilities & hooks
│       ├── api/
│       │   ├── privacy.ts                    # Calls FastAPI /privacy endpoints
│       │   ├── admin.ts                      # Calls FastAPI /admin endpoints
│       │   ├── users.ts                      # Calls /users endpoints
│       │   └── invoices.ts                   # Calls /invoices endpoints
│       ├── hooks/
│       │   ├── usePrivacyRequests.ts         # Custom hook to manage privacy forms
│       │   ├── useConsent.ts                 # Custom hook for consent center
│       │   ├── useAdminStats.ts              # Hook for fetching dashboard stats
│       │   └── useAuditLogs.ts               # Hook for audit log feed
│       └── utils/
│           ├── formatAuditLog.ts             # Format audit entries for tables
│           ├── apiClient.ts                  # Axios or fetch wrapper
│           └── constants.ts                  # Shared constants (API URLs, role enums)
│
│
└── docs/                                     # 📚 Compliance and reference docs
    ├── privacy-policy-template.md            # Privacy policy content (shown on /privacy)
    ├── terms-template.md                     # Terms of service (shown on /terms)
    ├── breach-runbook.md                     # Steps to follow in case of breach
    ├── retention-policy.md                   # Data retention strategy
    ├── dpo-contact-template.md               # Contact info for Data Protection Officer
    ├── gdpr-checklist.md                     # Internal checklist before go-live
    └── admin-guide.md                        # Guide for admins managing dashboard
