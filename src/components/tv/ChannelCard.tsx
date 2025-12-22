import { TVChannel } from '@/data/tvChannels';

interface ChannelCardProps {
  channel: TVChannel;
  isFavorite?: boolean;
  isSelected?: boolean;
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
}

const ChannelCard = ({ 
  channel, 
  isFavorite = false,
  isSelected = false,
  onClick,
  size = 'medium'
}: ChannelCardProps) => {
  const sizeClasses = {
    small: 'w-32 h-24',
    medium: 'w-40 h-32',
    large: 'w-48 h-36'
  };

  const logoColors: Record<string, string> = {
    sports: 'from-red-500 to-orange-500',
    news: 'from-blue-500 to-cyan-500',
    movies: 'from-purple-500 to-pink-500',
    entertainment: 'from-yellow-500 to-amber-500',
    documentary: 'from-green-500 to-emerald-500'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        relative group flex flex-col items-center justify-center gap-2
        rounded-xl p-3
        bg-gradient-to-br from-white/5 to-white/[0.02]
        backdrop-blur-md border border-white/10
        transition-all duration-300 ease-out
        hover:scale-105 hover:border-white/20
        hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]
        focus:outline-none focus:ring-2 focus:ring-primary/50
        ${isSelected ? 'ring-2 ring-primary border-primary/50 shadow-[0_0_30px_rgba(139,92,246,0.4)]' : ''}
      `}
    >
      {/* Live Indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-[10px] text-red-400 font-semibold">ON</span>
      </div>

      {/* Channel Logo */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center
        bg-gradient-to-br ${logoColors[channel.category]}
        text-white font-bold text-sm
        shadow-lg
      `}>
        {channel.shortName.slice(0, 3)}
      </div>

      {/* Channel Name */}
      <span className="text-white font-medium text-sm truncate max-w-full">
        {channel.name}
      </span>

      {/* Current Program */}
      <span className="text-white/50 text-xs truncate max-w-full">
        {channel.currentProgram.title}
      </span>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </button>
  );
};

export default ChannelCard;
