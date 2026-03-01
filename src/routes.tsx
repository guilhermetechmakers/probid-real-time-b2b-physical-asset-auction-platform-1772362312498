import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/login'
import { SignupPage } from '@/pages/signup'
import { ForgotPasswordPage } from '@/pages/forgot-password'
import { MarketplacePage } from '@/pages/marketplace'
import { HowItWorksPage } from '@/pages/how-it-works'
import { SettingsPage } from '@/pages/settings'
import { NotFoundPage } from '@/pages/not-found'
import { ListingDetailPage } from '@/pages/listing-detail'
import { SellerOverviewPage } from '@/pages/dashboard/seller-overview'
import { BuyerOverviewPage } from '@/pages/dashboard/buyer-overview'
import { SellerCreateListingPage } from '@/pages/dashboard/seller-create-listing'

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
    path: '/login',
    element: (
      <MainLayout>
        <LoginPage />
      </MainLayout>
    ),
  },
  {
    path: '/signup',
    element: (
      <MainLayout>
        <SignupPage />
      </MainLayout>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <MainLayout>
        <ForgotPasswordPage />
      </MainLayout>
    ),
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
    path: '/dashboard/seller',
    element: (
      <MainLayout>
        <DashboardLayout />
      </MainLayout>
    ),
    children: [
      { index: true, element: <SellerOverviewPage /> },
      { path: 'create', element: <SellerCreateListingPage /> },
      { path: 'listings', element: <SellerOverviewPage /> },
      { path: 'auctions', element: <SellerOverviewPage /> },
    ],
  },
  {
    path: '/dashboard/buyer',
    element: (
      <MainLayout>
        <DashboardLayout />
      </MainLayout>
    ),
    children: [
      { index: true, element: <BuyerOverviewPage /> },
      { path: 'auctions', element: <BuyerOverviewPage /> },
      { path: 'watchlist', element: <BuyerOverviewPage /> },
    ],
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
        <div className="container flex min-h-[50vh] items-center justify-center px-4 py-16">
          <p className="text-muted-foreground">About page coming soon.</p>
        </div>
      </MainLayout>
    ),
  },
  {
    path: '/help',
    element: (
      <MainLayout>
        <div className="container flex min-h-[50vh] items-center justify-center px-4 py-16">
          <p className="text-muted-foreground">Help & Support coming soon.</p>
        </div>
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
