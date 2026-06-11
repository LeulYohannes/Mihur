// src/lib/iconMap.ts
import { 
  Terminal, 
  Briefcase, 
  FlaskConical, 
  Palette, 
  Languages, 
  Theater, 
  Megaphone, 
  Heart, 
  User, 
  Calculator, 
  Music, 
  Camera, 
  HelpCircle,
  Code,
  Activity,
  TrendingUp,
  Type
} from 'lucide-react';

// Map database icon_name (lowercased) to Lucide component
const icons: Record<string, React.ComponentType<any>> = {
  terminal: Terminal,
  briefcase: Briefcase,
  flaskconical: FlaskConical,
  palette: Palette,
  languages: Languages,
  theater: Theater,
  megaphone: Megaphone,
  heart: Heart,
  user: User,
  calculator: Calculator,
  music: Music,
  camera: Camera,
  // Fallback for any missing
  default: HelpCircle
};

// Additional fallbacks for category id (if icon_name is missing)
// These are not needed if your DB has correct icon_name, but safe to keep
icons.tech = Code;
icons.business = Briefcase;
icons.science = FlaskConical;
icons.design = Palette;
icons.marketing = TrendingUp;
icons.health = Activity;
icons.math = Calculator;
icons.arts = Type;

export const getIconComponent = (iconName: string | null | undefined) => {
  if (!iconName) return HelpCircle;
  const key = iconName.toLowerCase();
  return icons[key] || icons.default;
};

export default getIconComponent;