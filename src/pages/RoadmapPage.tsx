import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Loader2, Plus, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
}

const RoadmapPage = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchRoadmaps();
  }, [user]);

  const fetchRoadmaps = async () => {
    const { data, error } = await supabase
      .from('user_roadmaps')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fetch roadmaps error:', error);
      setError(error.message);
    } else if (data) {
      setRoadmaps(data);
      if (data.length > 0 && !selectedRoadmap) {
        setSelectedRoadmap(data[0]);
        await fetchSteps(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchSteps = async (roadmapId: string) => {
    const { data, error } = await supabase
      .from('roadmap_steps')
      .select('*')
      .eq('roadmap_id', roadmapId)
      .order('step_order', { ascending: true });
    
    if (error) {
      console.error('Fetch steps error:', error);
      setError(error.message);
    } else if (data) {
      setSteps(data);
    }
  };

  const toggleStep = async (step: Step) => {
    const newCompleted = !step.is_completed;
    
    // Optimistic update
    setSteps(prev => prev.map(s => 
      s.id === step.id ? { ...s, is_completed: newCompleted } : s
    ));

    // Update database
    const { error } = await supabase
      .from('roadmap_steps')
      .update({ 
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null
      })
      .eq('id', step.id);

    if (error) {
      console.error('Toggle step error:', error);
      // Revert optimistic update
      setSteps(prev => prev.map(s => 
        s.id === step.id ? { ...s, is_completed: !newCompleted } : s
      ));
      return;
    }

    // Recalculate progress for the roadmap
    if (selectedRoadmap) {
      const updatedSteps = steps.map(s => 
        s.id === step.id ? { ...s, is_completed: newCompleted } : s
      );
      const completedCount = updatedSteps.filter(s => s.is_completed).length;
      const progressPercent = Math.round((completedCount / selectedRoadmap.total_steps) * 100);
      
      await supabase
        .from('user_roadmaps')
        .update({ 
          completed_steps: completedCount,
          progress_percent: progressPercent
        })
        .eq('id', selectedRoadmap.id);
      
      setSelectedRoadmap({
        ...selectedRoadmap,
        completed_steps: completedCount,
        progress_percent: progressPercent
      });
    }
  };

  const generateRoadmap = async () => {
    setGenerating(true);
    setError(null);
    
    // Fetch user profile (questionnaire answers)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('category, skill_level, goal, weekly_hours')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      setError('Could not fetch your profile. Please try again.');
      setGenerating(false);
      return;
    }

    if (!profile || !profile.category) {
      setError('Please complete the questionnaire first.');
      setGenerating(false);
      return;
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('generate-roadmap', {
      body: JSON.stringify({
        user_id: user!.id,
        category: profile.category,
        skill_level: profile.skill_level,
        goal: profile.goal,
        weekly_hours: profile.weekly_hours
      })
    });

    if (error) {
      console.error('Edge Function error:', error);
      // Try to extract detailed message from the response
      let detail = error.message;
      if (error.context?.body) {
        try {
          const parsed = JSON.parse(error.context.body);
          detail = parsed.error || parsed.message || detail;
        } catch (e) {
          // ignore
        }
      }
      setError(`Failed to generate roadmap: ${detail}`);
    } else if (data?.error) {
      setError(`Edge Function error: ${data.error}`);
    } else {
      // Success – refresh roadmaps and select the new one
      await fetchRoadmaps();
      if (data?.roadmap) {
        setSelectedRoadmap(data.roadmap);
        await fetchSteps(data.roadmap.id);
      }
    }
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 text-center px-4">
        <div className="max-w-md mx-auto bg-surface-container-high rounded-3xl p-8">
          <h2 className="text-3xl font-bold mb-4">Sign in to access your roadmap</h2>
          <Link to="/auth" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-section max-w-6xl mx-auto min-h-screen">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-12">
        <div>
          <h1 className="headline-lg font-playfair tracking-tight mb-2">Learning Roadmaps</h1>
          <p className="body-md text-on-surface-variant">Track your progress toward your learning goals</p>
        </div>
        <button 
          onClick={generateRoadmap}
          disabled={generating}
          className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Generate New Roadmap
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Roadmap Selector */}
      {roadmaps.length > 0 && (
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
          {roadmaps.map(roadmap => (
            <button
              key={roadmap.id}
              onClick={() => {
                setSelectedRoadmap(roadmap);
                fetchSteps(roadmap.id);
              }}
              className={`px-6 py-3 rounded-xl whitespace-nowrap transition-all label-md ${
                selectedRoadmap?.id === roadmap.id
                  ? 'accent-gradient text-on-primary'
                  : 'glass-card text-on-surface'
              }`}
            >
              {roadmap.title}
              <span className="ml-2 text-sm opacity-70">{roadmap.progress_percent}%</span>
            </button>
          ))}
        </div>
      )}

      {/* Selected Roadmap */}
      {selectedRoadmap && (
        <motion.div key={selectedRoadmap.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card rounded-lg p-8 mb-8">
            <h2 className="headline-md font-playfair mb-2">{selectedRoadmap.title}</h2>
            <p className="text-on-surface-variant mb-6">{selectedRoadmap.description}</p>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{selectedRoadmap.progress_percent}%</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill transition-all duration-500"
                  style={{ width: `${selectedRoadmap.progress_percent}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-on-surface-variant">
              {selectedRoadmap.completed_steps} of {selectedRoadmap.total_steps} steps completed
            </p>
          </div>

          {/* Steps Checklist */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4">Learning Path</h3>
            <AnimatePresence>
              {steps.map((step) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card rounded-lg p-5 border border-outline/20 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <button onClick={() => toggleStep(step)} className="mt-1 flex-shrink-0">
                      {step.is_completed ? (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      ) : (
                        <Circle className="w-6 h-6 text-on-surface-variant hover:text-primary transition-colors" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <span className="text-sm text-on-surface-variant font-mono">Step {step.step_order}</span>
                        <span className="text-xs text-on-surface-variant">~{step.estimated_hours} hours</span>
                      </div>
                      <h4 className={`headline-md font-playfair mb-1 ${step.is_completed ? 'line-through text-on-surface-variant' : ''}`}>
                        {step.title}
                      </h4>
                      <p className="text-on-surface-variant text-sm">{step.description}</p>
                      {step.course_id && (
                        <Link 
                          to={`/category/${step.course_id}`}
                          className="inline-flex items-center gap-1 text-primary text-sm mt-3 hover:underline"
                        >
                          View Recommended Course <TrendingUp className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {roadmaps.length === 0 && !generating && !error && (
        <div className="text-center py-20 bg-surface-container-high rounded-3xl">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No roadmaps yet</h3>
          <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
            Complete the questionnaire to get a personalized learning roadmap.
          </p>
          <Link to="/questionnaire" className="btn-primary">
            Complete Questionnaire
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default RoadmapPage;