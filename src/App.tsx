/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import QuestionnairePage from './pages/Questionaire';
import AuthPage from './pages/AuthPage';
import MyLearningPage from './pages/MyLearningPage';
import RoadmapPage from './pages/RoadmapPage';



export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-dim text-on-surface">
        <Navbar />

        <main className="pt-24">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/category/:id" element={<CategoryDetailPage />} />
              <Route path="/questionnaire" element={<QuestionnairePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/my-learning" element={<MyLearningPage />} />
             <Route path="/roadmap" element={<RoadmapPage />} />
            </Routes>
          </AnimatePresence>
        </main>

        <footer className="bg-surface-dim border-t border-outline-variant py-20">
          <div className="layout-container flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <Link to="/" className="text-xl font-semibold text-primary tracking-tight">
                Mihur
              </Link>
              <p className="text-muted text-xs uppercase tracking-[0.2em] mt-2">
                © 2026 Mihur • Built for focused learning
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-secondary">
              <Link to="/categories" className="nav-link">
                Categories
              </Link>
              <Link to="/my-learning" className="nav-link">
                My Courses
              </Link>
              <Link to="/" className="nav-link">
                About
              </Link>
              <Link to="/questionnaire" className='nav-link'>
                Questionnaire
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}