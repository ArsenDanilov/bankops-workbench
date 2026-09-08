import { Navigate, Route, Routes } from 'react-router-dom';
import { ReviewCaseWorkspacePage } from '../../pages/ReviewCaseWorkspacePage/ReviewCaseWorkspacePage';
import { ReviewQueuePage } from '../../pages/ReviewQueuePage/ReviewQueuePage';
import { AppShell } from '../layout/AppShell';

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/review-queue" replace />} />
        <Route path="/review-queue" element={<ReviewQueuePage />} />
        <Route
          path="/review-cases/:caseId"
          element={<ReviewCaseWorkspacePage />}
        />
      </Route>
    </Routes>
  );
};
