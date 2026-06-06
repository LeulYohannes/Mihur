import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Bookmark, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';

const MyLearningPage = () => {
  const { user } = useAuth();
  const [savedCourses, setSavedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchSavedCourses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Pro-trick: We query the 'saved_courses' table, but ask Supabase to 
      // automatically bring along the actual course data from the 'courses' table!
      const { data, error } = await supabase
        .from('saved_courses')
        .select(`
          course_id,
          courses (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Saved courses fetch failed', error);
        setError(error.message);
      }
      if (data) {
        // Extract just the course objects from the joined data
        const courses = data.map((row: any) => row.courses);
        setSavedCourses(courses);
      }
      
      setLoading(false);
    };

    fetchSavedCourses();
  }, [user]);

  if (loading) return <div className="pt-32 min-h-screen flex justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;

  if (error) {
    return (
      <div className="pt-32 flex justify-center px-4 text-center min-h-screen w-full">
        <div className="max-w-xl rounded-3xl border border-red-500/20 bg-[#2a1c1c] p-8 text-red-200">
          <h2 className="text-2xl font-bold mb-3">Unable to load saved courses</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Protect the route!
  if (!user) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-section max-w-2xl mx-auto text-center min-h-screen">
        <div className="glass-card rounded-lg p-12 shadow-xl border border-outline-variant/20">
          <div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-on-primary" />
          </div>
          <h2 className="headline-md font-playfair mb-4 text-on-surface">Sign in to view saved courses</h2>
          <Link to="/auth" className="btn-primary inline-block mt-4">
            Sign In / Sign Up
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-section max-w-7xl mx-auto min-h-screen">
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">My Learning</h1>
        <p className="text-xl text-on-surface-variant max-w-2xl">
          Your personal library of saved courses and learning paths.
        </p>
      </div>

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
          <Link to="/categories" className="px-8 py-3 rounded-xl primary-gradient text-on-primary font-bold inline-block">
            Explore Courses
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default MyLearningPage;