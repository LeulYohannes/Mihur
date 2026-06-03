import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Link, Loader2, Plus, TrendingUp } from 'lucide-react';
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

  useEffect(() => {
    if (!user) return;
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
        fetchSteps(data[0].id);
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

    if (!error && selectedRoadmap) {
      // Recalculate progress
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
      
      // Update local roadmap
      setSelectedRoadmap({
        ...selectedRoadmap,
        completed_steps: completedCount,
        progress_percent: progressPercent
      });
    }
  };

  const generateRoadmap = async () => {
    setGenerating(true);
    
    // Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user!.id)
      .single();

    if (!profile?.category) {
      alert('Please complete the questionnaire first');
      setGenerating(false);
      return;
    }

    const response = await fetch('/api/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user!.id,
        category: profile.category,
        skill_level: profile.skill_level,
        goal: profile.goal,
        weekly_hours: profile.weekly_hours
      })
    });

    if (response.ok) {
      fetchRoadmaps();
    } else {
      alert('Failed to generate roadmap. Try again later.');
    }
    setGenerating(false);
  };

  if (loading) return <div className="pt-48 flex justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;

  if (!user) {
    return (
      <div className="pt-48 text-center px-8">
        <div className="max-w-md mx-auto bg-surface-container-high rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">Sign in to access your roadmap</h2>
          <Link to="/auth" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-48 pb-32 px-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="headline-lg font-playfair tracking-tight mb-2">Learning Roadmaps</h1>
          <p className="body-md text-on-surface-variant">Track your progress toward your learning goals</p>
        </div>
        <button 
          onClick={generateRoadmap}
          disabled={generating}
          className="btn-primary flex items-center gap-2"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Generate New Roadmap
        </button>
      </div>

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
            
            {/* Progress Bar using design tokens */}
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
              {steps.map((step, idx) => (
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

      {roadmaps.length === 0 && !generating && (
        <div className="text-center py-20 bg-surface-container-high rounded-3xl">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No roadmaps yet</h3>
          <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
            Complete the questionnaire to get a personalized learning roadmap.
          </p>
          <Link to="/questionaire" className="btn-primary">
            Complete Questionnaire
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default RoadmapPage;