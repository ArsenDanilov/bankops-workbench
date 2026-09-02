import { Navigate, Route, Routes } from 'react-router-dom';
import { ReviewQueuePage } from '../../pages/ReviewQueuePage/ReviewQueuePage';
import { AppShell } from '../layout/AppShell';

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/review-queue" replace />} />
        <Route path="/review-queue" element={<ReviewQueuePage />} />
      </Route>
    </Routes>
  );
};
