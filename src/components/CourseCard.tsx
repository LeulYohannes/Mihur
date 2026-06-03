import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Heart } from 'lucide-react';
import { Course } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const CourseCard = ({ course }: { course: Course }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if the user has already saved this course when the card loads
  useEffect(() => {
    if (!user) return;

    const checkSavedStatus = async () => {
      const { data } = await supabase
        .from('saved_courses')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .limit(1)
        .maybeSingle();
      
      if (data) setIsSaved(true);
    };

    checkSavedStatus();
  }, [user, course.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents the click from triggering anything else
    
    if (!user) {
      alert("Please sign in to save courses!");
      return;
    }

    setLoading(true);

    if (isSaved) {
      // Remove from saved_courses
      await supabase
        .from('saved_courses')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', course.id);
      setIsSaved(false);
    } else {
      // Add to saved_courses
      await supabase
        .from('saved_courses')
        .insert({ user_id: user.id, course_id: course.id });
      setIsSaved(true);
    }

    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="glass-card overflow-hidden rounded-lg group transition-all duration-300 relative flex flex-col h-full"
    >
      <div className="aspect-video relative overflow-hidden shrink-0">
        <img
          src={course.image}
          alt={course.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full chip text-on-secondary-container uppercase tracking-wider">
            {course.level}
          </span>
        </div>
        
        {/* THE NEW HEART BUTTON */}
        <button 
          onClick={toggleSave}
          disabled={loading}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-container-lowest/50 backdrop-blur-md flex items-center justify-center hover:bg-surface-container-lowest transition-colors shadow-md disabled:opacity-50"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`} 
          />
        </button>
      </div>

        <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-4">
          <span className="label-md uppercase tracking-[0.06em] text-on-surface-variant">
            {course.provider}
          </span>
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Clock className="w-4 h-4" />
            <span className="caption">{course.duration}</span>
          </div>
        </div>

        <h3 className="headline-md font-playfair mb-3 leading-tight text-on-surface transition-colors">
          {course.title}
        </h3>
        <p className="body-md text-on-surface-variant mb-6 line-clamp-2 leading-relaxed flex-grow">
          {course.description}
        </p>

        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary block text-center mt-auto"
        >
          View Course
        </a>
      </div>
    </motion.div>
  );
};

export default CourseCard;