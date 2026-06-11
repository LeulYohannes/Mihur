import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Bookmark, Lock, Map, Heart, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';

interface Roadmap {
  id: string;
  title: string;
  description: string;
  progress_percent: number;
  total_steps: number;
  completed_steps: number;
}

interface Favorite {
  id: number;
  external_url: string;
  title: string;
  thumbnail: string | null;
  created_at: string;
}

const MyLearningPage = () => {
  const { user } = useAuth();
  const [savedCourses, setSavedCourses] = useState<Course[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'roadmaps' | 'favorites'>('courses');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchSavedCourses(),
      fetchRoadmaps(),
      fetchFavorites(),
    ]).finally(() => setLoading(false));
  }, [user]);

  const fetchSavedCourses = async () => {
    const { data, error } = await supabase
      .from('saved_courses')
      .select(`course_id, courses (*)`)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Saved courses fetch failed', error);
      setError(error.message);
    } else if (data) {
      const courses = data.map((row: any) => row.courses);
      setSavedCourses(courses);
    }
  };

  const fetchRoadmaps = async () => {
    const { data, error } = await supabase
      .from('user_roadmaps')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Roadmaps fetch failed', error);
    } else if (data) {
      setRoadmaps(data);
    }
  };

  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Favorites fetch failed', error);
    } else if (data) {
      setFavorites(data);
    }
  };

  const removeFavorite = async (externalUrl: string) => {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user!.id)
      .eq('external_url', externalUrl);
    if (!error) {
      setFavorites(prev => prev.filter(f => f.external_url !== externalUrl));
    } else {
      console.error('Failed to remove favorite', error);
    }
  };

  if (loading) {
    return <div className="pt-32 min-h-screen flex justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;
  }

  if (!user) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-section max-w-2xl mx-auto text-center min-h-screen">
        <div className="glass-card rounded-lg p-12 shadow-xl border border-outline-variant/20">
          <div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-on-primary" />
          </div>
          <h2 className="headline-md font-playfair mb-4 text-on-surface">Sign in to view your learning</h2>
          <Link to="/auth" className="btn-primary inline-block mt-4">Sign In / Sign Up</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-section max-w-7xl mx-auto min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">My Learning</h1>
        <p className="text-xl text-on-surface-variant max-w-2xl">
          Your saved courses, learning roadmaps, and favorite videos.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-outline/20 mb-8">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'courses'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Saved Courses ({savedCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('roadmaps')}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'roadmaps'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          My Roadmaps ({roadmaps.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'favorites'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Favorite Videos ({favorites.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'courses' && (
        <>
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}
          {savedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {savedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-high rounded-3xl p-20 text-center border border-outline/10 mt-8">
              <Bookmark className="w-12 h-12 text-primary/40 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">No saved courses yet</h3>
              <p className="text-on-surface-variant mb-8">Start exploring and click the heart icon on any course to save it here.</p>
              <Link to="/categories" className="btn-primary">Explore Courses</Link>
            </div>
          )}
        </>
      )}

      {activeTab === 'roadmaps' && (
        <>
          {roadmaps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => (
                <Link to="/roadmap" key={roadmap.id} className="glass-card rounded-lg p-6 hover:shadow-xl transition-all block">
                  <h3 className="headline-md font-playfair mb-2">{roadmap.title}</h3>
                  <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">{roadmap.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary">Progress: {roadmap.progress_percent}%</span>
                    <span className="text-on-surface-variant">{roadmap.completed_steps}/{roadmap.total_steps} steps</span>
                  </div>
                  <div className="progress-track mt-3">
                    <div className="progress-fill" style={{ width: `${roadmap.progress_percent}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-high rounded-3xl p-20 text-center border border-outline/10 mt-8">
              <Map className="w-12 h-12 text-primary/40 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">No roadmaps yet</h3>
              <p className="text-on-surface-variant mb-8">Generate a learning roadmap from your questionnaire.</p>
              <Link to="/questionnaire" className="btn-primary">Go to Questionnaire</Link>
            </div>
          )}
        </>
      )}

      {activeTab === 'favorites' && (
        <>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <div key={fav.id} className="glass-card rounded-lg overflow-hidden hover:shadow-xl transition-all">
                  {fav.thumbnail && (
                    <img src={fav.thumbnail} alt={fav.title} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-5">
                    <h3 className="headline-md font-playfair mb-2 line-clamp-2">{fav.title}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <a
                        href={fav.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm py-1 px-3 inline-flex items-center gap-1"
                      >
                        Watch <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => removeFavorite(fav.external_url)}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-high rounded-3xl p-20 text-center border border-outline/10 mt-8">
              <Heart className="w-12 h-12 text-primary/40 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">No favorite videos yet</h3>
              <p className="text-on-surface-variant mb-8">When you generate a roadmap, you can ❤️ videos to save them here.</p>
              <Link to="/questionnaire" className="btn-primary">Start a Roadmap</Link>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default MyLearningPage;