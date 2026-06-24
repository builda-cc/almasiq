import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RequireAdmin } from './components/auth/RequireAdmin';
import { Home } from './pages/Home';
import { AssetListing } from './pages/AssetListing';
import { AssetDetails } from './pages/AssetDetails';
import { AddAsset } from './pages/AddAsset';
import { AIMatches } from './pages/AIMatches';
import { HowItWorks } from './pages/HowItWorks';
import { Dashboard } from './pages/Dashboard';
import { MyAssets } from './pages/MyAssets';
import { ExchangeRequests } from './pages/ExchangeRequests';
import { Favorites } from './pages/Favorites';
import { Profile } from './pages/Profile';
import { AdminExchanges } from './pages/AdminExchanges';
import { AdminExchangeDetail } from './pages/AdminExchangeDetail';
import { useAuthStore } from './store/authStore';

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="assets" element={<AssetListing />} />
        <Route path="assets/:assetId" element={<AssetDetails />} />
        <Route path="matches" element={<AIMatches scope="all" />} />
        <Route path="how-it-works" element={<HowItWorks />} />

        {/* Authenticated routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="assets/new" element={<AddAsset />} />
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="assets" element={<MyAssets />} />
            <Route path="matches" element={<AIMatches scope="mine" />} />
            <Route path="exchanges" element={<ExchangeRequests />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin: Exchange Approval Center */}
          <Route element={<RequireAdmin />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminExchanges />} />
              <Route path="exchanges/:requestId" element={<AdminExchangeDetail />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
