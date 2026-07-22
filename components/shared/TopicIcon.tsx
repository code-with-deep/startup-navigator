import {
  Building2,
  DollarSign,
  Scale,
  Users,
  TrendingUp,
  Receipt,
  Bot,
  Rocket,
  type LucideProps,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Building2,
  DollarSign,
  Scale,
  Users,
  TrendingUp,
  Receipt,
  Bot,
  Rocket,
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  pink: 'bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
  yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
  cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
};

interface TopicIconProps {
  icon: string;
  color: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TopicIcon({ icon, color, size = 'md', className }: TopicIconProps) {
  const Icon = iconMap[icon] ?? Bot;
  const colorClass = colorMap[color] ?? colorMap.blue;

  const sizeClass = {
    sm: 'size-8 [&_svg]:size-4',
    md: 'size-10 [&_svg]:size-5',
    lg: 'size-14 [&_svg]:size-7',
  }[size];

  return (
    <div className={`rounded-xl flex items-center justify-center shrink-0 ${colorClass} ${sizeClass} ${className ?? ''}`}>
      <Icon />
    </div>
  );
}
