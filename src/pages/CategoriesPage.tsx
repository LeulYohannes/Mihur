import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Category } from '../types';
import CategoryCard from '../components/CategoryCard';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error('Categories fetch failed', error);
        setError(error.message);
      }
      if (data) setCategories(data);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="pt-32 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  if (error) {
    return (
      <div className="pt-32 flex justify-center px-4 text-center w-full">
        <div className="max-w-xl rounded-3xl border border-red-500/20 bg-[#2a1c1c] p-8 text-red-200">
          <h2 className="text-2xl font-bold mb-3">Unable to load categories</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-section max-w-7xl mx-auto min-h-screen"
    >
      <div className="mb-16">
        <Link to="/" className="label-md text-on-surface-variant flex items-center gap-2 mb-6 font-semibold">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>
        <h1 className="headline-lg font-playfair tracking-tight mb-4">All Categories</h1>
        <p className="body-md text-on-surface-variant max-w-2xl">
          Explore our complete catalog of free educational resources across every major discipline.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </motion.div>
  );
};

export default CategoriesPage;