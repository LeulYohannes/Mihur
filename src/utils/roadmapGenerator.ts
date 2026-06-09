import { supabase } from '../lib/supabase';

interface GenerateRoadmapParams {
  user_id: string;
  category: string;
  skill_level: string;
  goal: string;
  weekly_hours: number;
}

interface GeneratedRoadmap {
  title: string;
  description: string;
  steps: {
    title: string;
    description: string;
    estimated_hours: number;
    course_id: string | null;
  }[];
}

export async function generateRoadmapLocal(params: GenerateRoadmapParams): Promise<GeneratedRoadmap> {
  const { category, skill_level, goal, weekly_hours } = params;
  
  // Fetch courses in the chosen category, filtered by skill level
  let { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('category_id', category)
    .eq('level', skill_level)
    .limit(10);
  
  // If no courses at that level, fallback to any level in the same category
  if (!courses || courses.length === 0) {
    const { data: fallbackCourses } = await supabase
      .from('courses')
      .select('*')
      .eq('category_id', category)
      .limit(10);
    courses = fallbackCourses || [];
  }
  
  // Category name mapping for nicer titles
  const categoryNames: Record<string, string> = {
    tech: 'Technology',
    business: 'Business',
    science: 'Science',
    design: 'Design',
    languages: 'Languages',
    arts: 'Arts',
    marketing: 'Marketing',
    health: 'Health',
    math: 'Mathematics',
  };
  
  const categoryName = categoryNames[category] || category;
  const title = `${skill_level} ${categoryName} Roadmap: ${goal.substring(0, 60)}${goal.length > 60 ? '...' : ''}`;
  const totalEstimatedHours = weekly_hours * 4; // approximate 4 weeks
  const description = `A structured learning path to help you achieve "${goal}". Estimated total time: ~${totalEstimatedHours} hours.`;
  
  // Generate steps from available courses
  const steps = courses.slice(0, 6).map((course) => ({
    title: course.title,
    description: course.description.substring(0, 120),
    estimated_hours: Math.max(4, Math.min(20, Math.floor(totalEstimatedHours / 6))),
    course_id: course.id,
  }));
  
  // If we don't have enough courses, add generic learning steps
  if (steps.length < 4) {
    const genericSteps = [
      { title: `Fundamentals of ${categoryName}`, description: `Learn the core concepts and principles of ${categoryName}.`, estimated_hours: 8, course_id: null },
      { title: 'Hands‑on Practice', description: 'Apply your knowledge with practical exercises and projects.', estimated_hours: 12, course_id: null },
      { title: 'Intermediate Topics', description: 'Dive deeper into advanced concepts and techniques.', estimated_hours: 15, course_id: null },
      { title: 'Final Project', description: 'Build a real‑world project to demonstrate your skills.', estimated_hours: 20, course_id: null },
    ];
    const needed = 6 - steps.length;
    steps.push(...genericSteps.slice(0, needed));
  }
  
  return { title, description, steps };
}