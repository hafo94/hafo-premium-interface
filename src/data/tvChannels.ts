export interface TVProgram {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  description: string;
  rating?: string;
  isLive?: boolean;
}

export interface TVChannel {
  id: string;
  number: number;
  name: string;
  shortName: string;
  category: 'sports' | 'news' | 'movies' | 'entertainment' | 'documentary';
  logo?: string;
  currentProgram: TVProgram;
  schedule: TVProgram[];
}

const now = new Date();
const formatTime = (hours: number, minutes: number = 0) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const currentHour = now.getHours();

export const tvChannels: TVChannel[] = [
  {
    id: 'espn',
    number: 5,
    name: 'ESPN',
    shortName: 'ESPN',
    category: 'sports',
    currentProgram: {
      id: 'espn-1',
      title: 'SportsCenter',
      startTime: formatTime(currentHour - 1),
      endTime: formatTime(currentHour + 1),
      duration: 120,
      description: 'The latest sports news, highlights, and analysis from around the world.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 'espn-1', title: 'SportsCenter', startTime: formatTime(currentHour - 1), endTime: formatTime(currentHour + 1), duration: 120, description: 'Sports news and highlights.', rating: 'TV-G', isLive: true },
      { id: 'espn-2', title: 'NFL Live', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 2), duration: 60, description: 'NFL analysis and predictions.', rating: 'TV-G' },
      { id: 'espn-3', title: 'NBA Tonight', startTime: formatTime(currentHour + 2), endTime: formatTime(currentHour + 4), duration: 120, description: 'Live NBA basketball coverage.', rating: 'TV-G' }
    ]
  },
  {
    id: 'hbo',
    number: 12,
    name: 'HBO',
    shortName: 'HBO',
    category: 'movies',
    currentProgram: {
      id: 'hbo-1',
      title: 'Movie Night: The Dark Knight',
      startTime: formatTime(currentHour - 0.5),
      endTime: formatTime(currentHour + 2),
      duration: 150,
      description: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon.',
      rating: 'PG-13',
      isLive: true
    },
    schedule: [
      { id: 'hbo-1', title: 'Movie Night: The Dark Knight', startTime: formatTime(currentHour - 0.5), endTime: formatTime(currentHour + 2), duration: 150, description: 'Batman raises the stakes in his war on crime.', rating: 'PG-13', isLive: true },
      { id: 'hbo-2', title: 'Last Week Tonight', startTime: formatTime(currentHour + 2), endTime: formatTime(currentHour + 3), duration: 60, description: 'News satire with John Oliver.', rating: 'TV-MA' },
      { id: 'hbo-3', title: 'Game of Thrones Marathon', startTime: formatTime(currentHour + 3), endTime: formatTime(currentHour + 5), duration: 120, description: 'Epic fantasy series marathon.', rating: 'TV-MA' }
    ]
  },
  {
    id: 'bbc-news',
    number: 8,
    name: 'BBC News',
    shortName: 'BBC',
    category: 'news',
    currentProgram: {
      id: 'bbc-1',
      title: 'World News Today',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 1),
      duration: 60,
      description: 'Comprehensive coverage of the day\'s most important international stories.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 'bbc-1', title: 'World News Today', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 1), duration: 60, description: 'International news coverage.', rating: 'TV-G', isLive: true },
      { id: 'bbc-2', title: 'HARDtalk', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 1.5), duration: 30, description: 'In-depth interviews with global leaders.', rating: 'TV-G' },
      { id: 'bbc-3', title: 'BBC World Service', startTime: formatTime(currentHour + 1.5), endTime: formatTime(currentHour + 3), duration: 90, description: 'Global news and analysis.', rating: 'TV-G' }
    ]
  },
  {
    id: 'cnn',
    number: 9,
    name: 'CNN',
    shortName: 'CNN',
    category: 'news',
    currentProgram: {
      id: 'cnn-1',
      title: 'Anderson Cooper 360',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 1),
      duration: 60,
      description: 'In-depth reporting and newsmaker interviews.',
      rating: 'TV-PG',
      isLive: true
    },
    schedule: [
      { id: 'cnn-1', title: 'Anderson Cooper 360', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 1), duration: 60, description: 'In-depth reporting.', rating: 'TV-PG', isLive: true },
      { id: 'cnn-2', title: 'CNN Tonight', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 2), duration: 60, description: 'Evening news analysis.', rating: 'TV-PG' },
      { id: 'cnn-3', title: 'Don Lemon Tonight', startTime: formatTime(currentHour + 2), endTime: formatTime(currentHour + 3), duration: 60, description: 'Late night news and commentary.', rating: 'TV-PG' }
    ]
  },
  {
    id: 'discovery',
    number: 15,
    name: 'Discovery',
    shortName: 'DISC',
    category: 'documentary',
    currentProgram: {
      id: 'disc-1',
      title: 'Deadliest Catch',
      startTime: formatTime(currentHour - 0.5),
      endTime: formatTime(currentHour + 0.5),
      duration: 60,
      description: 'Follow crab fishermen in the Bering Sea as they battle extreme conditions.',
      rating: 'TV-14',
      isLive: true
    },
    schedule: [
      { id: 'disc-1', title: 'Deadliest Catch', startTime: formatTime(currentHour - 0.5), endTime: formatTime(currentHour + 0.5), duration: 60, description: 'Crab fishing in extreme conditions.', rating: 'TV-14', isLive: true },
      { id: 'disc-2', title: 'Gold Rush', startTime: formatTime(currentHour + 0.5), endTime: formatTime(currentHour + 1.5), duration: 60, description: 'Miners search for gold in Alaska.', rating: 'TV-PG' },
      { id: 'disc-3', title: 'MythBusters', startTime: formatTime(currentHour + 1.5), endTime: formatTime(currentHour + 2.5), duration: 60, description: 'Science experiments test popular myths.', rating: 'TV-PG' }
    ]
  },
  {
    id: 'mtv',
    number: 20,
    name: 'MTV',
    shortName: 'MTV',
    category: 'entertainment',
    currentProgram: {
      id: 'mtv-1',
      title: 'Music Video Hour',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 1),
      duration: 60,
      description: 'The hottest music videos from top artists around the world.',
      rating: 'TV-14',
      isLive: true
    },
    schedule: [
      { id: 'mtv-1', title: 'Music Video Hour', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 1), duration: 60, description: 'Top music videos.', rating: 'TV-14', isLive: true },
      { id: 'mtv-2', title: 'Ridiculousness', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 2), duration: 60, description: 'Viral video commentary.', rating: 'TV-14' },
      { id: 'mtv-3', title: 'The Challenge', startTime: formatTime(currentHour + 2), endTime: formatTime(currentHour + 3), duration: 60, description: 'Reality competition series.', rating: 'TV-14' }
    ]
  },
  {
    id: 'fox-sports',
    number: 6,
    name: 'Fox Sports',
    shortName: 'FOX',
    category: 'sports',
    currentProgram: {
      id: 'fox-1',
      title: 'MLB Tonight',
      startTime: formatTime(currentHour - 1),
      endTime: formatTime(currentHour + 2),
      duration: 180,
      description: 'Live Major League Baseball coverage and analysis.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 'fox-1', title: 'MLB Tonight', startTime: formatTime(currentHour - 1), endTime: formatTime(currentHour + 2), duration: 180, description: 'Live MLB coverage.', rating: 'TV-G', isLive: true },
      { id: 'fox-2', title: 'UFC Fight Night', startTime: formatTime(currentHour + 2), endTime: formatTime(currentHour + 5), duration: 180, description: 'Mixed martial arts action.', rating: 'TV-14' }
    ]
  },
  {
    id: 'nbc-sports',
    number: 7,
    name: 'NBC Sports',
    shortName: 'NBC',
    category: 'sports',
    currentProgram: {
      id: 'nbc-1',
      title: 'Premier League Live',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 2),
      duration: 120,
      description: 'Live English Premier League soccer action.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 'nbc-1', title: 'Premier League Live', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 2), duration: 120, description: 'Live soccer action.', rating: 'TV-G', isLive: true },
      { id: 'nbc-2', title: 'NASCAR Race', startTime: formatTime(currentHour + 2), endTime: formatTime(currentHour + 5), duration: 180, description: 'NASCAR racing coverage.', rating: 'TV-G' }
    ]
  },
  {
    id: 'showtime',
    number: 13,
    name: 'Showtime',
    shortName: 'SHO',
    category: 'movies',
    currentProgram: {
      id: 'sho-1',
      title: 'Billions',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 1),
      duration: 60,
      description: 'Power politics in the world of New York high finance.',
      rating: 'TV-MA',
      isLive: true
    },
    schedule: [
      { id: 'sho-1', title: 'Billions', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 1), duration: 60, description: 'High finance drama.', rating: 'TV-MA', isLive: true },
      { id: 'sho-2', title: 'Dexter', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 2), duration: 60, description: 'Forensic blood expert by day, vigilante by night.', rating: 'TV-MA' },
      { id: 'sho-3', title: 'Yellowjackets', startTime: formatTime(currentHour + 2), endTime: formatTime(currentHour + 3), duration: 60, description: 'Survival thriller series.', rating: 'TV-MA' }
    ]
  },
  {
    id: 'fx',
    number: 22,
    name: 'FX',
    shortName: 'FX',
    category: 'entertainment',
    currentProgram: {
      id: 'fx-1',
      title: "It's Always Sunny in Philadelphia",
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 0.5),
      duration: 30,
      description: 'Five friends own a bar in Philadelphia and create chaos.',
      rating: 'TV-MA',
      isLive: true
    },
    schedule: [
      { id: 'fx-1', title: "It's Always Sunny in Philadelphia", startTime: formatTime(currentHour), endTime: formatTime(currentHour + 0.5), duration: 30, description: 'Comedy chaos at an Irish bar.', rating: 'TV-MA', isLive: true },
      { id: 'fx-2', title: 'American Horror Story', startTime: formatTime(currentHour + 0.5), endTime: formatTime(currentHour + 1.5), duration: 60, description: 'Horror anthology series.', rating: 'TV-MA' },
      { id: 'fx-3', title: 'The Bear', startTime: formatTime(currentHour + 1.5), endTime: formatTime(currentHour + 2), duration: 30, description: 'Chef returns to run family restaurant.', rating: 'TV-MA' }
    ]
  },
  {
    id: 'national-geo',
    number: 16,
    name: 'National Geographic',
    shortName: 'NATG',
    category: 'documentary',
    currentProgram: {
      id: 'natg-1',
      title: 'Planet Earth III',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 1),
      duration: 60,
      description: 'Stunning exploration of our planet\'s incredible wildlife.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 'natg-1', title: 'Planet Earth III', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 1), duration: 60, description: 'Wildlife documentary.', rating: 'TV-G', isLive: true },
      { id: 'natg-2', title: 'Cosmos', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 2), duration: 60, description: 'Space exploration documentary.', rating: 'TV-G' },
      { id: 'natg-3', title: 'Life Below Zero', startTime: formatTime(currentHour + 2), endTime: formatTime(currentHour + 3), duration: 60, description: 'Survival in Alaska.', rating: 'TV-PG' }
    ]
  },
  {
    id: 'msnbc',
    number: 10,
    name: 'MSNBC',
    shortName: 'MSNBC',
    category: 'news',
    currentProgram: {
      id: 'msnbc-1',
      title: 'The Rachel Maddow Show',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 1),
      duration: 60,
      description: 'Political news and commentary.',
      rating: 'TV-PG',
      isLive: true
    },
    schedule: [
      { id: 'msnbc-1', title: 'The Rachel Maddow Show', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 1), duration: 60, description: 'Political commentary.', rating: 'TV-PG', isLive: true },
      { id: 'msnbc-2', title: 'Morning Joe', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 3), duration: 120, description: 'Morning news and analysis.', rating: 'TV-PG' }
    ]
  }
];

export const getCategoryCount = (category: TVChannel['category']) => {
  return tvChannels.filter(c => c.category === category).length;
};

export const getChannelsByCategory = (category: TVChannel['category'] | 'all') => {
  if (category === 'all') return tvChannels;
  return tvChannels.filter(c => c.category === category);
};

export const categoryLabels: Record<TVChannel['category'], string> = {
  sports: 'Sports',
  news: 'News',
  movies: 'Movies',
  entertainment: 'Entertainment',
  documentary: 'Documentary'
};
