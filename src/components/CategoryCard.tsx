// src/components/CategoryCard.tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Category } from '../types';
import { getIconComponent } from '../lib/iconMap';

const CategoryCard = ({ category }: { category: Category }) => {
  // Convert the string from the database into a real Icon component
  const Icon = getIconComponent(category.icon_name); 

  return (
    <Link to={`/category/${category.id}`}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="glass-card p-6 rounded-lg cursor-pointer text-center group transition-all h-full flex flex-col items-center"
      >
        <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 accent-gradient group-hover:scale-105 transition-transform">
          <Icon className="w-6 h-6 text-on-primary" />
        </div>
        <span className="label-md text-on-surface block mb-2">{category.name}</span>
        <p className="caption text-on-surface-variant opacity-80 text-center line-clamp-2">
          {category.description}
        </p>
      </motion.div>
    </Link>
  );
};

export default CategoryCard;