# SwiftFacture Page Restructuring Plan

## 📋 Current State Analysis

### Current Pages & Routes:
1. **Invoice.jsx** (`/invoice`) - Old invoice page with template logic
2. **FrenchInvoicePage.jsx** (`/french-invoice`) - Complete and functional French invoice page  
3. **TemplatePage.jsx** (`/template`) - Templates page under development
4. **FrenchInvoiceDemo.jsx** (`/customizable-invoice`) - Demo page for French invoices

### Current Navigation Structure:
- Header navigation includes: Dashboard, Invoice, French Invoice, Estimate, Customers, Receipts
- Footer navigation includes: About, Templates, Receipts, Privacy, Terms
- nav-items.jsx defines: Dashboard, Invoice, French Invoice

## 🎯 Restructuring Requirements

Based on your requirements, here's what needs to be done:

### 1. French Invoice → Invoice (Main functional page)
- **File**: `FrenchInvoicePage.jsx` → `InvoicePage.jsx` 
- **Route**: `/french-invoice` → `/invoice`
- **Component Name**: `FrenchInvoicePage` → `InvoicePage`
- **Nav Label**: "French Invoice" → "Invoice"

### 2. Old Invoice → Templates
- **File**: `Invoice.jsx` → `TemplatesPage.jsx`
- **Route**: `/invoice` → `/templates` 
- **Component Name**: `Invoice` → `TemplatesPage`
- **Nav Label**: "Invoice" → "Templates"

### 3. Old Templates → Custom Templates
- **File**: `TemplatePage.jsx` → `CustomTemplatesPage.jsx`
- **Route**: `/template` → `/custom-templates`
- **Component Name**: `TemplatePage` → `CustomTemplatesPage`
- **Nav Label**: "Templates" → "Custom Templates"

### 4. French Invoice Demo (Keep as is)
- **File**: `FrenchInvoiceDemo.jsx` (no change)
- **Route**: `/customizable-invoice` (no change)
- **Purpose**: Demo/development page

## 📁 Files That Need Changes

### A. File Renames:
```
src/pages/FrenchInvoicePage.jsx → src/pages/InvoicePage.jsx
src/pages/Invoice.jsx → src/pages/TemplatesPage.jsx  
src/pages/TemplatePage.jsx → src/pages/CustomTemplatesPage.jsx
```

### B. Import Updates in:
1. **src/App.jsx**
   - Update imports for renamed files
   - Update route paths
   
2. **src/nav-items.jsx**
   - Update imports, routes, and titles
   
3. **src/components/Header.jsx**
   - Update navigation items and translations
   
4. **src/components/Footer.jsx**
   - Update footer link to templates (if needed)

### C. Component Name Changes:
1. **InvoicePage.jsx** (formerly FrenchInvoicePage)
   - Change component name from `FrenchInvoicePage` to `InvoicePage`
   - Update any internal references
   
2. **TemplatesPage.jsx** (formerly Invoice)
   - Change component name from `Invoice` to `TemplatesPage`
   - Update any internal references
   
3. **CustomTemplatesPage.jsx** (formerly TemplatePage)
   - Change component name from `TemplatePage` to `CustomTemplatesPage`
   - Update any internal references

### D. Translation Updates:
1. **src/i18n/resources/en/common.json**
   - Update navigation labels
   
2. **src/i18n/resources/fr/common.json**
   - Update French navigation labels

### E. Route Configuration Updates:
1. **App.jsx Routes:**
   ```jsx
   // OLD:
   <Route path="/invoice" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
   <Route path="/template" element={<ProtectedRoute><TemplatePage /></ProtectedRoute>} />
   // From nav-items: /french-invoice → FrenchInvoicePage
   
   // NEW:
   <Route path="/invoice" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
   <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
   <Route path="/custom-templates" element={<ProtectedRoute><CustomTemplatesPage /></ProtectedRoute>} />
   ```

2. **nav-items.jsx:**
   ```jsx
   // OLD:
   { title: "Invoice", to: "/invoice", page: <Invoice /> }
   { title: "Facture Française", to: "/french-invoice", page: <FrenchInvoicePage /> }
   
   // NEW:
   { title: "Invoice", to: "/invoice", page: <InvoicePage /> }
   { title: "Templates", to: "/templates", page: <TemplatesPage /> }
   { title: "Custom Templates", to: "/custom-templates", page: <CustomTemplatesPage /> }
   ```

### F. Navigation Menu Updates:
1. **Header.jsx navItems:**
   ```jsx
   // Update navigation array to reflect new routes and labels
   { label: "Invoice", to: "/invoice" },
   { label: "Templates", to: "/templates" },  
   { label: "Custom Templates", to: "/custom-templates" },
   ```

2. **Footer.jsx:**
   ```jsx
   // Update template link
   <Link to="/templates">Templates</Link>
   <Link to="/custom-templates">Custom Templates</Link> // if needed
   ```

## 🔄 Implementation Steps

### Phase 1: File Renames & Component Updates
1. Rename `FrenchInvoicePage.jsx` → `InvoicePage.jsx` + update component name
2. Rename `Invoice.jsx` → `TemplatesPage.jsx` + update component name  
3. Rename `TemplatePage.jsx` → `CustomTemplatesPage.jsx` + update component name

### Phase 2: Import & Route Updates
4. Update imports in `App.jsx`
5. Update route definitions in `App.jsx`
6. Update `nav-items.jsx` completely
7. Update `Header.jsx` navigation items
8. Update `Footer.jsx` links (if needed)

### Phase 3: Translation Updates
9. Update English translations (`en/common.json`)
10. Update French translations (`fr/common.json`)

### Phase 4: Testing & Verification
11. Test all navigation links work correctly
12. Verify active route highlighting functions
13. Test breadcrumbs and internal links
14. Verify translation switching works
15. Test protected routes still function

## 🎯 Final Route Structure

After restructuring:
```
/invoice → InvoicePage (formerly French Invoice - main functional page)
/templates → TemplatesPage (formerly old Invoice - template logic)  
/custom-templates → CustomTemplatesPage (formerly Templates - under development)
/customizable-invoice → FrenchInvoiceDemo (unchanged - demo page)
```

## ⚠️ Potential Impacts

### Areas to Verify After Changes:
1. **Authentication**: All protected routes still work
2. **Active Navigation**: Route highlighting still functions  
3. **Breadcrumbs**: Any breadcrumb components reflect new names
4. **Internal Links**: Links within pages point to correct routes
5. **Bookmarks**: Users with old bookmarks may need redirects
6. **SEO**: Page titles and meta descriptions may need updates

### Files That May Reference Old Routes:
- Any component with `useNavigate()` calls to old routes
- Any `Link` components pointing to old routes  
- Any hardcoded route references in components
- Documentation or help text with route references

## 📝 Implementation Order

This plan ensures:
✅ Complete route restructuring as requested
✅ Maintains functionality during transition  
✅ Updates all navigation references
✅ Preserves authentication and protection
✅ Updates translations for both languages
✅ Maintains consistent naming throughout app

**Ready for implementation once confirmed!**