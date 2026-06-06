import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Category, Course } from '../types';
import { getIconComponent } from '../lib/iconMap';
import CourseCard from '../components/CourseCard';

const CategoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true); // Reset loading when ID changes
    
    const fetchCategoryAndCourses = async () => {
      if (!id) return;

      // Fetch the single category
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      
      if (catError) {
        console.error('Category fetch failed', catError);
        setError(catError.message);
      }
      if (catData) setCategory(catData);

      // Fetch courses WHERE category_id matches!
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('category_id', id);
        
      if (courseError) {
        console.error('Category courses fetch failed', courseError);
        setError(courseError.message);
      }
      if (courseData) setCourses(courseData);
      
      setLoading(false);
    };

    fetchCategoryAndCourses();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 flex justify-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 flex justify-center px-4 text-center min-h-screen w-full">
        <div className="max-w-xl rounded-3xl border border-red-500/20 bg-[#2a1c1c] p-8 text-red-200">
          <h2 className="text-2xl font-bold mb-3">Unable to load this category</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="page-section text-center min-h-screen">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Category not found</h1>
        <Link to="/categories" className="text-primary hover:underline">View all categories</Link>
      </div>
    );
  }

  const Icon = getIconComponent(category.icon_name);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-section max-w-7xl mx-auto min-h-screen"
    >
      <div className="mb-16">
        <Link to="/categories" className="label-md text-on-surface-variant flex items-center gap-2 mb-6 font-semibold">
          <ArrowLeft className="w-5 h-5" />
          All Categories
        </Link>
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 text-left sm:text-left">
          <div className="w-16 h-16 rounded-lg accent-gradient flex items-center justify-center shrink-0">
            <Icon className="w-8 h-8 text-on-primary" />
          </div>
          <div>
            <h1 className="headline-lg font-playfair mb-2">{category.name}</h1>
            <p className="body-md text-on-surface-variant max-w-2xl">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-high rounded-3xl p-20 text-center border border-outline/10">
          <Sparkles className="w-12 h-12 text-primary/40 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-2">More courses coming soon</h3>
          <p className="text-on-surface-variant mb-8">We're currently indexing the best free {category.name} courses for you.</p>
          <Link to="/categories" className="px-8 py-3 rounded-xl primary-gradient text-on-primary font-bold inline-block hover:opacity-90 transition-opacity">
            Explore Other Categories
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryDetailPage;