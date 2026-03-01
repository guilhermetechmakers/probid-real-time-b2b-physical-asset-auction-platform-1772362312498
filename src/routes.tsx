import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { SellerGuard } from '@/components/guards/seller-guard'
import { AdminGuard } from '@/components/guards/admin-guard'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LandingPage } from '@/pages/landing'
import { SignInSignUpPage } from '@/pages/auth'
import { VerifyEmailPage } from '@/pages/verify-email'
import { EmailVerificationPage } from '@/pages/email-verification'
import { PasswordResetPage } from '@/pages/password-reset'
import { PasswordResetResetPage } from '@/pages/password-reset-reset'
import { AuthCallbackPage } from '@/pages/auth-callback'
import { MarketplacePage } from '@/pages/marketplace'
import { HowItWorksPage } from '@/pages/how-it-works'
import { SettingsPage } from '@/pages/settings'
import { NotFoundPage } from '@/pages/not-found'
import { ListingDetailPage } from '@/pages/listing-detail'
import { ListingLivePage } from '@/pages/listing-live'
import { SellerOverviewPage } from '@/pages/dashboard/seller-overview'
import { SellerListingsPage } from '@/pages/dashboard/seller-listings'
import { SellerAuctionsPage } from '@/pages/dashboard/seller-auctions'
import { SellerInspectionsPage } from '@/pages/dashboard/seller-inspections'
import { SellerSalesPage } from '@/pages/dashboard/seller-sales'
import { BuyerDashboardPage } from '@/pages/dashboard/buyer-dashboard'
import { BuyerGuard } from '@/components/guards/buyer-guard'
import { SellerCreateListingPage } from '@/pages/dashboard/seller-create-listing'
import { SellerEditListingPage } from '@/pages/dashboard/seller-edit-listing'
import { SellerNotificationsPage } from '@/pages/dashboard/seller-notifications'
import { SellerSupportPage } from '@/pages/dashboard/seller-support'
import { CheckoutPage } from '@/pages/checkout'
import { TransactionHistoryPage } from '@/pages/dashboard/transaction-history'
import { CartDepositsPage } from '@/pages/dashboard/cart-deposits'
import { HelpAboutPage } from '@/pages/help-about'
import {
  AdminOverviewPage,
  AdminOpsQueuePage,
  AdminBuyersPage,
  AdminUsersPage,
  AdminAuctionsPage,
  AdminFinancePage,
  AdminDisputesPage,
  AdminRbacPage,
  AdminAuditLogsPage,
  AdminAnalyticsPage,
} from '@/pages/admin'
import { AdminDashboardShell } from '@/components/admin/admin-dashboard-shell'

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <MainLayout>
        <LandingPage />
      </MainLayout>
    ),
  },
  {
    path: '/auth',
    element: (
      <MainLayout>
        <SignInSignUpPage />
      </MainLayout>
    ),
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/verify',
    element: (
      <MainLayout>
        <EmailVerificationPage />
      </MainLayout>
    ),
  },
  {
    path: '/auth/verify-email',
    element: (
      <MainLayout>
        <VerifyEmailPage />
      </MainLayout>
    ),
  },
  {
    path: '/login',
    element: <Navigate to="/auth?mode=login" replace />,
  },
  {
    path: '/signup',
    element: <Navigate to="/auth?mode=signup" replace />,
  },
  {
    path: '/auth/password-reset',
    element: (
      <MainLayout>
        <PasswordResetPage />
      </MainLayout>
    ),
  },
  {
    path: '/auth/password-reset/reset',
    element: (
      <MainLayout>
        <PasswordResetResetPage />
      </MainLayout>
    ),
  },
  {
    path: '/forgot-password',
    element: <Navigate to="/auth/password-reset" replace />,
  },
  {
    path: '/reset-password',
    element: <Navigate to="/auth/password-reset/reset" replace />,
  },
  {
    path: '/marketplace',
    element: (
      <MainLayout>
        <MarketplacePage />
      </MainLayout>
    ),
  },
  {
    path: '/listing/:id',
    element: (
      <MainLayout>
        <ListingDetailPage />
      </MainLayout>
    ),
  },
  {
    path: '/listing/:id/live',
    element: (
      <MainLayout>
        <ListingLivePage />
      </MainLayout>
    ),
  },
  {
    path: '/checkout/:auctionId',
    element: (
      <MainLayout>
        <CheckoutPage />
      </MainLayout>
    ),
  },
  {
    path: '/how-it-works',
    element: (
      <MainLayout>
        <HowItWorksPage />
      </MainLayout>
    ),
  },
  {
    path: '/settings',
    element: (
      <MainLayout>
        <SettingsPage />
      </MainLayout>
    ),
  },
  {
    path: '/dashboard',
    element: <Navigate to="/dashboard/buyer" replace />,
  },
  {
    path: '/buyer/dashboard',
    element: <Navigate to="/dashboard/buyer" replace />,
  },
  {
    path: '/dashboard/seller',
    element: (
      <MainLayout>
        <SellerGuard>
          <DashboardLayout />
        </SellerGuard>
      </MainLayout>
    ),
    children: [
      { index: true, element: <SellerOverviewPage /> },
      { path: 'create', element: <SellerCreateListingPage /> },
      { path: 'listings', element: <SellerListingsPage /> },
      { path: 'listings/:id/edit', element: <SellerEditListingPage /> },
      { path: 'auctions', element: <SellerAuctionsPage /> },
      { path: 'inspections', element: <SellerInspectionsPage /> },
      { path: 'sales', element: <SellerSalesPage /> },
      { path: 'orders', element: <TransactionHistoryPage /> },
      { path: 'notifications', element: <SellerNotificationsPage /> },
      { path: 'support', element: <SellerSupportPage /> },
    ],
  },
  {
    path: '/dashboard/buyer',
    element: (
      <MainLayout>
        <BuyerGuard>
          <DashboardLayout />
        </BuyerGuard>
      </MainLayout>
    ),
    children: [
      { index: true, element: <BuyerDashboardPage /> },
      { path: 'auctions', element: <BuyerDashboardPage /> },
      { path: 'watchlist', element: <BuyerDashboardPage /> },
      { path: 'cart', element: <CartDepositsPage /> },
      { path: 'orders', element: <TransactionHistoryPage /> },
    ],
  },
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/admin/dashboard',
    element: (
      <MainLayout>
        <AdminGuard>
          <AdminDashboardShell>
            <Outlet />
          </AdminDashboardShell>
        </AdminGuard>
      </MainLayout>
    ),
    children: [
      { index: true, element: <AdminOverviewPage /> },
      { path: 'ops', element: <AdminOpsQueuePage /> },
      { path: 'buyers', element: <AdminBuyersPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'auctions', element: <AdminAuctionsPage /> },
      { path: 'finance', element: <AdminFinancePage /> },
      { path: 'disputes', element: <AdminDisputesPage /> },
      { path: 'rbac', element: <AdminRbacPage /> },
      { path: 'audit-logs', element: <AdminAuditLogsPage /> },
      { path: 'analytics', element: <AdminAnalyticsPage /> },
    ],
  },
  {
    path: '/learn-more',
    element: (
      <MainLayout>
        <HowItWorksPage />
      </MainLayout>
    ),
  },
  {
    path: '/billing',
    element: <Navigate to="/pricing" replace />,
  },
  {
    path: '/pricing',
    element: (
      <MainLayout>
        <div className="container flex min-h-[50vh] items-center justify-center px-4 py-16">
          <p className="text-muted-foreground">Pricing page coming soon.</p>
        </div>
      </MainLayout>
    ),
  },
  {
    path: '/about',
    element: (
      <MainLayout>
        <HelpAboutPage />
      </MainLayout>
    ),
  },
  {
    path: '/help',
    element: (
      <MainLayout>
        <HelpAboutPage />
      </MainLayout>
    ),
  },
  {
    path: '/contact',
    element: (
      <MainLayout>
        <div className="container flex min-h-[50vh] items-center justify-center px-4 py-16">
          <p className="text-muted-foreground">Contact page coming soon.</p>
        </div>
      </MainLayout>
    ),
  },
  {
    path: '/privacy',
    element: (
      <MainLayout>
        <div className="container flex min-h-[50vh] items-center justify-center px-4 py-16">
          <p className="text-muted-foreground">Privacy Policy coming soon.</p>
        </div>
      </MainLayout>
    ),
  },
  {
    path: '/terms',
    element: (
      <MainLayout>
        <div className="container flex min-h-[50vh] items-center justify-center px-4 py-16">
          <p className="text-muted-foreground">Terms of Service coming soon.</p>
        </div>
      </MainLayout>
    ),
  },
  {
    path: '/cookies',
    element: (
      <MainLayout>
        <div className="container flex min-h-[50vh] items-center justify-center px-4 py-16">
          <p className="text-muted-foreground">Cookie Policy coming soon.</p>
        </div>
      </MainLayout>
    ),
  },
  {
    path: '*',
    element: (
      <MainLayout>
        <NotFoundPage />
      </MainLayout>
    ),
  },
])
