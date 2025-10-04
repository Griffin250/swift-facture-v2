import { useRole } from '@/hooks/useRole';

// Component to conditionally render based on role
export const RoleBasedUI = ({ 
  requiredRole, 
  children, 
  fallback = null 
}) => {
  const { hasRole, loading } = useRole();

  if (loading) {
    return fallback;
  }

  if (!hasRole(requiredRole)) {
    return fallback;
  }

  return children;
};

// Component for super admin only features
export const SuperAdminOnly = ({ children, fallback = null }) => {
  const { isSuperAdmin, loading } = useRole();

  if (loading) {
    return fallback;
  }

  return isSuperAdmin ? children : fallback;
};

// Component for admin+ features (admin or super_admin)
export const AdminOnly = ({ children, fallback = null }) => {
  const { isAdmin, loading } = useRole();

  if (loading) {
    return fallback;
  }

  return isAdmin ? children : fallback;
};
