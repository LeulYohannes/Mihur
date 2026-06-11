import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Loader2, Plus, TrendingUp, X, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateRoadmapLocal, GeneratedRoadmap } from '../utils/roadmapGenerator';

interface Roadmap {
  id: string;
  title: string;
  description: string;
  progress_percent: number;
  total_steps: number;
  completed_steps: number;
}

interface Step {
  id: string;
  title: string;
  description: string;
  step_order: number;
  is_completed: boolean;
  estimated_hours: number;
  course_id: string | null;
  external_url?: string | null;
  thumbnail?: string | null;
  url?: string | null;
}

interface Video {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
}

const RoadmapPage = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
      const { data } = await supabase
        .from('user_favorites')
        .select('external_url')
        .eq('user_id', user.id);
      if (data) setFavorites(new Set(data.map((f: any) => f.external_url)));
    };
    fetchFavorites();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchRoadmaps();
  }, [user]);

  const fetchRoadmaps = async () => {
    const { data } = await supabase
      .from('user_roadmaps')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) {
      setRoadmaps(data);
      if (data.length > 0 && !selectedRoadmap) {
        setSelectedRoadmap(data[0]);
        await fetchSteps(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchSteps = async (roadmapId: string) => {
    const { data } = await supabase
      .from('roadmap_steps')
      .select('*')
      .eq('roadmap_id', roadmapId)
      .order('step_order', { ascending: true });
    if (data) setSteps(data);
  };

  const deleteRoadmap = async (roadmapId: string, roadmapTitle: string) => {
    if (!confirm(`Delete "${roadmapTitle}"?`)) return;
    setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
    if (selectedRoadmap?.id === roadmapId) {
      const remaining = roadmaps.filter(r => r.id !== roadmapId);
      if (remaining.length > 0) {
        setSelectedRoadmap(remaining[0]);
        await fetchSteps(remaining[0].id);
      } else {
        setSelectedRoadmap(null);
        setSteps([]);
        setVideos([]);
      }
    }
    await supabase.from('user_roadmaps').delete().eq('id', roadmapId);
  };

  const toggleStep = async (step: Step) => {
    const newCompleted = !step.is_completed;
    setSteps(prev => prev.map(s => s.id === step.id ? { ...s, is_completed: newCompleted } : s));
    if (selectedRoadmap) {
      const updatedSteps = steps.map(s => s.id === step.id ? { ...s, is_completed: newCompleted } : s);
      const completedCount = updatedSteps.filter(s => s.is_completed).length;
      const progressPercent = Math.round((completedCount / selectedRoadmap.total_steps) * 100);
      setSelectedRoadmap(prev => prev ? { ...prev, completed_steps: completedCount, progress_percent: progressPercent } : null);
      await supabase
        .from('user_roadmaps')
        .update({ completed_steps: completedCount, progress_percent: progressPercent })
        .eq('id', selectedRoadmap.id);
    }
    await supabase
      .from('roadmap_steps')
      .update({ is_completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null })
      .eq('id', step.id);
  };

  const toggleFavorite = async (video: Video) => {
    const isFav = favorites.has(video.url);
    if (isFav) {
      await supabase.from('user_favorites').delete().eq('user_id', user!.id).eq('external_url', video.url);
      setFavorites(prev => { const newSet = new Set(prev); newSet.delete(video.url); return newSet; });
    } else {
      await supabase.from('user_favorites').insert({
        user_id: user!.id,
        external_url: video.url,
        title: video.title,
        thumbnail: video.thumbnail,
      });
      setFavorites(prev => new Set(prev).add(video.url));
    }
  };

  const generateRoadmap = async () => {
    setGenerating(true);
    setError(null);
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('category, skill_level, goal, weekly_hours')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (!profile?.category) {
      setError('Please complete the questionnaire first.');
      setGenerating(false);
      return;
    }

    try {
      const roadmapData: GeneratedRoadmap = await generateRoadmapLocal({
        user_id: user!.id,
        category: profile.category,
        skill_level: profile.skill_level,
        goal: profile.goal,
        weekly_hours: profile.weekly_hours,
      });

      // Save roadmap
      const { data: roadmap, error: roadmapError } = await supabase
        .from('user_roadmaps')
        .insert({
          user_id: user!.id,
          title: roadmapData.title,
          description: roadmapData.description,
          category_id: profile.category,
          total_steps: roadmapData.dbCourses.length,
        })
        .select()
        .single();
      if (roadmapError) throw roadmapError;

      // Save steps from DB courses
      const stepsWithOrder = roadmapData.dbCourses.map((course, idx) => ({
        roadmap_id: roadmap.id,
        title: course.title,
        description: course.description,
        step_order: idx + 1,
        estimated_hours: course.estimated_hours,
        course_id: course.course_id,
        external_url: null,
        thumbnail: null,
        url: course.url,
      }));
      const { error: stepsError } = await supabase.from('roadmap_steps').insert(stepsWithOrder);
      if (stepsError) throw stepsError;

      // Save YouTube videos separately (not as steps, but store in a new table? We'll just pass to UI)
      // For now, we'll keep videos in state (they are not saved to database, only shown after generation)
      setVideos(roadmapData.youtubeVideos);

      await fetchRoadmaps();
      setSelectedRoadmap(roadmap);
      await fetchSteps(roadmap.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;
  if (!user) return <div className="pt-32 text-center"><Link to="/auth" className="btn-primary">Sign In</Link></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-section max-w-6xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="headline-lg font-playfair">Learning Roadmaps</h1>
          <p className="body-md text-on-surface-variant">Track progress and discover recommended videos</p>
        </div>
        <button onClick={generateRoadmap} disabled={generating} className="btn-primary flex gap-2">
          {generating ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
          Generate New Roadmap
        </button>
      </div>

      {error && <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>}

      {/* Roadmap Selector */}
      {roadmaps.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-8">
          {roadmaps.map(rm => (
            <div key={rm.id} className="flex items-center gap-1">
              <button
                onClick={() => { setSelectedRoadmap(rm); fetchSteps(rm.id); }}
                className={`px-6 py-3 rounded-xl label-md ${selectedRoadmap?.id === rm.id ? 'accent-gradient text-on-primary' : 'glass-card'}`}
              >
                {rm.title} <span className="ml-2 text-sm">{rm.progress_percent}%</span>
              </button>
              <button onClick={() => deleteRoadmap(rm.id, rm.title)} className="p-2 rounded-full hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Roadmap Steps (only from DB courses) */}
      {selectedRoadmap && (
        <motion.div key={selectedRoadmap.id}>
          <div className="glass-card rounded-lg p-8 mb-8">
            <h2 className="headline-md font-playfair">{selectedRoadmap.title}</h2>
            <p className="text-on-surface-variant mb-6">{selectedRoadmap.description}</p>
            <div className="mb-2 flex justify-between text-sm"><span>Progress</span><span>{selectedRoadmap.progress_percent}%</span></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${selectedRoadmap.progress_percent}%` }} /></div>
            <p className="text-sm mt-2">{selectedRoadmap.completed_steps} of {selectedRoadmap.total_steps} steps completed</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Learning Path</h3>
            <AnimatePresence>
              {steps.map(step => (
                <motion.div key={step.id} className="glass-card rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <button onClick={() => toggleStep(step)} className="mt-1">
                      {step.is_completed ? <CheckCircle className="w-6 h-6 text-primary" /> : <Circle className="w-6 h-6 text-on-surface-variant" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm text-on-surface-variant font-mono">Step {step.step_order}</span>
                        <span className="text-xs text-on-surface-variant">~{step.estimated_hours} hours</span>
                      </div>
                      <h4 className={`headline-md font-playfair ${step.is_completed ? 'line-through text-on-surface-variant' : ''}`}>{step.title}</h4>
                      <p className="text-on-surface-variant text-sm">{step.description}</p>
                      {step.url && (
                        <a href={step.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm py-1 px-3 inline-block mt-3">
                          View Recommended Course <ExternalLink className="w-3 h-3 inline ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Recommended Videos Section (always shown after generation) */}
      {videos.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-4">Recommended Videos for You</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, idx) => (
              <div key={idx} className="glass-card rounded-lg overflow-hidden hover:shadow-xl transition-all">
                {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover" />}
                <div className="p-5">
                  <h4 className="headline-md font-playfair mb-2 line-clamp-2">{video.title}</h4>
                  <p className="text-on-surface-variant text-sm mb-3 line-clamp-2">{video.description}</p>
                  <div className="flex items-center justify-between">
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
                      Watch on YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                    <button onClick={() => toggleFavorite(video)} className="p-1 rounded-full hover:bg-white/10">
                      {favorites.has(video.url) ? <Heart className="w-5 h-5 fill-red-500 text-red-500" /> : <Heart className="w-5 h-5 text-on-surface-variant" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {roadmaps.length === 0 && !generating && !error && (
        <div className="text-center py-20">
          <p className="text-on-surface-variant mb-4">No roadmaps yet. Generate one to start learning!</p>
          <button onClick={generateRoadmap} className="btn-primary">Create Your First Roadmap</button>
        </div>
      )}
    </motion.div>
  );
};

export default RoadmapPage;