import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SurveyAnswers {
  category: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | '';
  reason: 'Employment' | 'Supplement' | 'General' | '';
  weeklyHours: number;
  goal: string;
  experience: 'None' | 'Minor' | 'Familiar' | 'Expert' | '';
}

const defaultAnswers: SurveyAnswers = {
  category: '',
  skillLevel: '',
  reason: '',
  weeklyHours: 5,
  goal: '',
  experience: '',
};

const QuestionnairePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<SurveyAnswers>(defaultAnswers);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch existing profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('User profile fetch failed', error);
      }

      if (data) {
        setAnswers({
          category: data.category || '',
          skillLevel: data.skill_level || '',
          reason: data.reason || '',
          weeklyHours: data.weekly_hours || 5,
          goal: data.goal || '',
          experience: data.experience || '',
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setSaved(false);

    const { error } = await supabase.from('user_profiles').upsert({
      user_id: user.id,
      category: answers.category,
      skill_level: answers.skillLevel,
      reason: answers.reason,
      weekly_hours: answers.weeklyHours,
      goal: answers.goal,
      experience: answers.experience,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (!error) {
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate('/roadmap'); // ✅ React Router navigation – no 404
      }, 1500);
    } else {
      alert('Error saving preferences: ' + error.message);
    }
  };

  const reset = () => {
    setAnswers(defaultAnswers);
    setSaved(false);
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="page-section max-w-2xl mx-auto text-center min-h-screen"
      >
        <div className="bg-surface-container-high rounded-3xl p-12 shadow-xl border border-outline-variant/20">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-on-surface">Sign in to save your path</h2>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            Create a free account to take the questionnaire and receive personalized course
            recommendations tailored to your goals.
          </p>
          <Link to="/auth" className="px-8 py-4 rounded-xl primary-gradient text-on-primary font-bold active:scale-95 transition-all inline-block">
            Sign In / Sign Up
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="page-section max-w-4xl mx-auto"
    >
      <div className="mb-12">
        <Link to="/" className="label-md text-on-surface-variant flex items-center gap-2 font-semibold">
          ← Back to Home
        </Link>
        <h1 className="headline-lg font-playfair mt-6 mb-2">Learning Questionnaire</h1>
        <p className="body-md text-on-surface-variant max-w-2xl">
          Answer a few quick questions and we’ll personalize your course recommendations right away.
        </p>
      </div>

      <form onSubmit={onSubmit} className="glass-card rounded-lg p-8 shadow-md border border-outline-variant/20 space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="category">
            Top area of interest
          </label>
          <select
            id="category"
            value={answers.category}
            onChange={(e) => setAnswers((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full rounded-xl border border-outline/20 p-3 bg-surface-container-highest text-on-surface input-glow"
            required
          >
            <option value="">Select a category</option>
            <option value="tech">Tech</option>
            <option value="business">Business</option>
            <option value="science">Science</option>
            <option value="design">Design</option>
            <option value="languages">Languages</option>
            <option value="marketing">Marketing</option>
            <option value="health">Health</option>
            <option value="math">Math</option>
            <option value="arts">Arts</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="skillLevel">
            Current skill level
          </label>
          <select
            id="skillLevel"
            value={answers.skillLevel}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                skillLevel: e.target.value as SurveyAnswers['skillLevel'],
              }))
            }
            className="w-full rounded-xl border border-outline/20 p-3 bg-surface-container-highest text-on-surface input-glow"
            required
          >
            <option value="">Select level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="weeklyHours">
            Hours per week
          </label>
          <input
            id="weeklyHours"
            type="number"
            value={answers.weeklyHours}
            onChange={(e) => setAnswers((prev) => ({ ...prev, weeklyHours: Number(e.target.value) }))}
            min={1}
            max={40}
            className="w-full rounded-xl border border-outline/20 p-3 bg-surface-container-highest text-on-surface input-glow"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="reason">
            Reason for learning
          </label>
          <select
            id="reason"
            value={answers.reason}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, reason: e.target.value as SurveyAnswers['reason'] }))
            }
            className="w-full rounded-xl border border-outline/20 p-3 bg-surface-container-highest text-on-surface input-glow"
            required
          >
            <option value="">Select reason</option>
            <option value="Employment">Employment</option>
            <option value="Supplement">Supplement another course</option>
            <option value="General">General interest</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="experience">
            Experience level
          </label>
          <select
            id="experience"
            value={answers.experience}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                experience: e.target.value as SurveyAnswers['experience'],
              }))
            }
            className="w-full rounded-xl border border-outline/20 p-3 bg-surface-container-highest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            required
          >
            <option value="">Select experience</option>
            <option value="None">None</option>
            <option value="Minor">Minor</option>
            <option value="Familiar">Familiar</option>
            <option value="Expert">Expert</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="goal">
            Learning goal
          </label>
          <textarea
            id="goal"
            value={answers.goal}
            onChange={(e) => setAnswers((prev) => ({ ...prev, goal: e.target.value }))}
            rows={4}
            className="w-full rounded-xl border border-outline/20 p-3 bg-surface-container-highest text-on-surface input-glow"
            placeholder="e.g. build a portfolio project, land a job, improve data analytics"
            required
          />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto px-8 py-3 rounded-xl btn-primary transition-all disabled:opacity-70 flex items-center justify-center min-w-[160px]"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Answers'}
          </button>

          <button
            type="button"
            onClick={reset}
            className="w-full md:w-auto px-8 py-3 rounded-xl btn-secondary"
          >
            Clear Form
          </button>

          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-primary font-bold flex items-center gap-2"
            >
              🎉 Profile updated successfully!
            </motion.span>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default QuestionnairePage;