import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, Layout, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Category, Course } from '../types';
import CategoryCard from '../components/CategoryCard';
import CourseCard from '../components/CourseCard';

const HomePage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [catResponse, courseResponse] = await Promise.all([
        supabase.from('categories').select('*').limit(6),
        supabase.from('courses').select('*')
      ]);

      if (catResponse.error) console.error('Categories fetch failed', catResponse.error);
      if (courseResponse.error) console.error('Courses fetch failed', courseResponse.error);
      if (catResponse.data) setCategories(catResponse.data);
      if (courseResponse.data) setCourses(courseResponse.data);

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('category, skill_level')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile && profile.category) {
          let query = supabase.from('courses').select('*').eq('category_id', profile.category);
          if (profile.skill_level) query = query.eq('level', profile.skill_level);
          const { data: recommendations } = await query.limit(4);
          if (recommendations) setRecommendedCourses(recommendations);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8 text-center">
        <div className="max-w-xl rounded-3xl border border-red-500/20 bg-[#2a1c1c] p-12 text-red-200">
          <h2 className="text-2xl font-bold mb-4">Unable to load courses</h2>
          <p className="text-sm text-red-100/90">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Hero Section with sunset decorations */}
      <section className="page-section max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Sunset decorations – all inside hero-decor */}
        <div className="hero-decor">
          <div className="sunset-circle" />
          <div className="sunset-blob" />
          <div className="sunset-bubble-1" />
          <div className="sunset-bubble-2" />
          <div className="sunset-bubble-3" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="display-lg font-playfair tracking-tight mb-8 max-w-4xl mx-auto leading-[0.95] text-on-surface relative z-10"
        >
          Find the Best Free Courses, Fast
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="body-lg text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed relative z-10"
        >
          Discover thousands of free courses from Coursera, edX, Khan Academy, and FutureLearn in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto relative group z-10"
        >
          <div className="flex items-center bg-surface-container-highest rounded-2xl p-2 ghost-border group-focus-within:ring-2 group-focus-within:ring-primary/30 transition-all duration-300 editorial-shadow">
            <Search className="ml-4 w-6 h-6 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for Python, UX Design, Marketing..."
              className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 py-5 px-4 text-xl outline-none"
            />
          </div>
        </motion.div>
      </section>

      {/* Recommended Section */}
      {user && recommendedCourses.length > 0 && !searchQuery && (
        <section className="page-section max-w-7xl mx-auto">
          <div className="mb-12 flex items-center justify-between bg-primary/10 p-8 rounded-3xl border border-primary/20">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-[0.75rem] uppercase tracking-[0.1em] text-primary font-bold">
                  Just For You
                </span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-primary-container">Your Recommended Path</h2>
            </div>
            <Link to="/questionnaire" className="px-6 py-3 rounded-xl bg-surface-container-highest border border-primary/20 text-primary font-medium hover:bg-primary/20 transition-all">
              Update Preferences
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendedCourses.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        </section>
      )}

      {/* Categories Section */}
      {!searchQuery && (
        <section className="bg-surface-container-low page-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-16 gap-4">
              <div>
                <h2 className="text-4xl font-bold tracking-tight">Explore by Category</h2>
              </div>
              <Link to="/categories" className="text-primary hover:underline flex items-center gap-2 group font-semibold">
                See all categories
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
            </div>
          </div>
        </section>
      )}

      {/* Courses Section */}
      <section className="page-section max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Popular Free Courses"}
          </h2>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCourses.slice(0, 8).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-on-surface-variant">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-xl">No courses found matching "{searchQuery}"</p>
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default HomePage;