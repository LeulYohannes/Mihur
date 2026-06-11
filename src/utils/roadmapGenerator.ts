import { supabase } from '../lib/supabase';

interface GenerateRoadmapParams {
  user_id: string;
  category: string;
  skill_level: string;
  goal: string;
  weekly_hours: number;
}

export interface GeneratedRoadmap {
  title: string;
  description: string;
  dbCourses: {
    title: string;
    description: string;
    estimated_hours: number;
    course_id: string;
    url: string;
  }[];
  youtubeVideos: {
    title: string;
    description: string;
    url: string;
    thumbnail: string;
  }[];
}

function parseDurationHours(duration: string): number {
  const match = duration.match(/\d+/);
  return match ? parseInt(match[0], 10) : 5;
}

async function searchYouTube(query: string, maxResults = 3): Promise<any[]> {
  try {
    const { data, error } = await supabase.functions.invoke('search-youtube', {
      body: JSON.stringify({ query, maxResults }),
    });
    if (error || !data?.success) return [];
    return data.videos || [];
  } catch (err) {
    console.error('YouTube search failed', err);
    return [];
  }
}

export async function generateRoadmapLocal(params: GenerateRoadmapParams): Promise<GeneratedRoadmap> {
  const { category, skill_level, goal, weekly_hours } = params;

  // Fetch courses from DB, sorted by level (Beginner → Intermediate → Advanced)
  let { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('category_id', category)
    .order('level', { ascending: true });

  if (!courses || courses.length === 0) {
    const { data: fallback } = await supabase
      .from('courses')
      .select('*')
      .eq('category_id', category)
      .limit(10);
    courses = fallback || [];
  }

  // Prefer courses matching user's skill level, then others
  const preferred = courses.filter(c => c.level === skill_level);
  const other = courses.filter(c => c.level !== skill_level);
  const sortedCourses = [...preferred, ...other];

  // Limit to at most 6 DB courses
  const dbCourses = sortedCourses.slice(0, 6).map(course => ({
    title: course.title,
    description: course.description.substring(0, 120),
    estimated_hours: parseDurationHours(course.duration),
    course_id: course.id,
    url: course.url,
  }));

  // Search YouTube for up to 3 relevant videos
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
  const searchQuery = `${categoryName} ${skill_level} tutorial ${goal.substring(0, 40)}`;
  const youtubeVideos = await searchYouTube(searchQuery, 3);

  const title = `${skill_level} ${categoryName} Roadmap: ${goal.substring(0, 60)}${goal.length > 60 ? '...' : ''}`;
  const description = `A structured learning path to help you achieve "${goal}". Estimated total time: ~${weekly_hours * 4} hours.`;

  return { title, description, dbCourses, youtubeVideos };
}