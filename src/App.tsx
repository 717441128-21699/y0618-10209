import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DashboardPage from '@/pages/DashboardPage';
import ApplicationsListPage from '@/pages/ApplicationsListPage';
import ApplicationFormPage from '@/pages/ApplicationFormPage';
import ApplicationDetailPage from '@/pages/ApplicationDetailPage';
import ReviewCenterPage from '@/pages/ReviewCenterPage';
import ReviewFormPage from '@/pages/ReviewFormPage';
import MentoringOverviewPage from '@/pages/MentoringOverviewPage';
import MeetingNotePage from '@/pages/MeetingNotePage';
import HealthDashboardPage from '@/pages/HealthDashboardPage';
import HealthUpdatePage from '@/pages/HealthUpdatePage';
import DemoDayPage from '@/pages/DemoDayPage';
import DemoScorePage from '@/pages/DemoScorePage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ProjectsDatabasePage from '@/pages/ProjectsDatabasePage';
import ProjectArchivePage from '@/pages/ProjectArchivePage';
import PlaceholderPage from '@/pages/PlaceholderPage';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen">
          <Header />
          <main className="flex-1 overflow-auto px-6 py-6 scroll-area">
            <div className="min-h-full">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/applications" element={<ApplicationsListPage />} />
                <Route path="/applications/new" element={<ApplicationFormPage />} />
                <Route path="/applications/:id" element={<ApplicationDetailPage />} />
                <Route path="/applications/:id/edit" element={<ApplicationFormPage />} />
                <Route path="/reviews" element={<ReviewCenterPage />} />
                <Route path="/reviews/:id" element={<ReviewFormPage />} />
                <Route path="/mentoring" element={<MentoringOverviewPage />} />
                <Route path="/mentoring/meetings/:id" element={<MeetingNotePage />} />
                <Route path="/mentoring/meetings/new" element={<MeetingNotePage />} />
                <Route path="/health" element={<HealthDashboardPage />} />
                <Route path="/health/update/:id" element={<HealthUpdatePage />} />
                <Route path="/demo-day" element={<DemoDayPage />} />
                <Route path="/demo-day/score/:projectId" element={<DemoScorePage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/projects" element={<ProjectsDatabasePage />} />
                <Route path="/projects/:id" element={<ProjectArchivePage />} />
                <Route path="*" element={<PlaceholderPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}
