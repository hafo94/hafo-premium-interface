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
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const currentHour = now.getHours();

export const tvChannels: TVChannel[] = [
  {
    id: 'svt1',
    number: 1,
    name: 'SVT1',
    shortName: 'SVT1',
    category: 'entertainment',
    currentProgram: {
      id: 'svt1-1',
      title: 'Rapport',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 1),
      duration: 60,
      description: 'Sveriges viktigaste nyhetsprogram med de senaste händelserna.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 'svt1-1', title: 'Rapport', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 1), duration: 60, description: 'Nyheter från Sverige och världen.', rating: 'TV-G', isLive: true },
      { id: 'svt1-2', title: 'Melodifestivalen', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 3), duration: 120, description: 'Sveriges största musiktävling.', rating: 'TV-G' },
      { id: 'svt1-3', title: 'Antikrundan', startTime: formatTime(currentHour + 3), endTime: formatTime(currentHour + 4), duration: 60, description: 'Experter värderar antikviteter.', rating: 'TV-G' }
    ]
  },
  {
    id: 'svt2',
    number: 2,
    name: 'SVT2',
    shortName: 'SVT2',
    category: 'documentary',
    currentProgram: {
      id: 'svt2-1',
      title: 'Vetenskapens värld',
      startTime: formatTime(currentHour - 0.5),
      endTime: formatTime(currentHour + 0.5),
      duration: 60,
      description: 'Utforska de senaste vetenskapliga upptäckterna.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 'svt2-1', title: 'Vetenskapens värld', startTime: formatTime(currentHour - 0.5), endTime: formatTime(currentHour + 0.5), duration: 60, description: 'Vetenskap och teknik.', rating: 'TV-G', isLive: true },
      { id: 'svt2-2', title: 'Aktuellt', startTime: formatTime(currentHour + 0.5), endTime: formatTime(currentHour + 1), duration: 30, description: 'Nyheter och debatt.', rating: 'TV-G' },
      { id: 'svt2-3', title: 'Dokumentär', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 2), duration: 60, description: 'Dokumentärfilm.', rating: 'TV-PG' }
    ]
  },
  {
    id: 'tv4',
    number: 4,
    name: 'TV4',
    shortName: 'TV4',
    category: 'entertainment',
    currentProgram: {
      id: 'tv4-1',
      title: 'Nyheterna',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 0.5),
      duration: 30,
      description: 'Dagens viktigaste nyheter från TV4.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 'tv4-1', title: 'Nyheterna', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 0.5), duration: 30, description: 'Nyheter från TV4.', rating: 'TV-G', isLive: true },
      { id: 'tv4-2', title: 'Kalla fakta', startTime: formatTime(currentHour + 0.5), endTime: formatTime(currentHour + 1.5), duration: 60, description: 'Undersökande journalistik.', rating: 'TV-PG' },
      { id: 'tv4-3', title: 'Idol', startTime: formatTime(currentHour + 1.5), endTime: formatTime(currentHour + 3), duration: 90, description: 'Musiktävling.', rating: 'TV-G' }
    ]
  },
  {
    id: 'tv3',
    number: 3,
    name: 'TV3',
    shortName: 'TV3',
    category: 'entertainment',
    currentProgram: {
      id: 'tv3-1',
      title: 'Bonde söker fru',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 1),
      duration: 60,
      description: 'Populärt dejtingprogram på landsbygden.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 'tv3-1', title: 'Bonde söker fru', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 1), duration: 60, description: 'Dejting på landet.', rating: 'TV-G', isLive: true },
      { id: 'tv3-2', title: 'Let\'s Dance', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 2.5), duration: 90, description: 'Kändisar dansar.', rating: 'TV-G' },
      { id: 'tv3-3', title: 'Hela Sverige bakar', startTime: formatTime(currentHour + 2.5), endTime: formatTime(currentHour + 3.5), duration: 60, description: 'Bakningstävling.', rating: 'TV-G' }
    ]
  },
  {
    id: 'kanal5',
    number: 5,
    name: 'Kanal 5',
    shortName: 'K5',
    category: 'entertainment',
    currentProgram: {
      id: 'k5-1',
      title: 'Wahlgrens värld',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 1),
      duration: 60,
      description: 'Följ familjen Wahlgrens vardag.',
      rating: 'TV-PG',
      isLive: true
    },
    schedule: [
      { id: 'k5-1', title: 'Wahlgrens värld', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 1), duration: 60, description: 'Reality med familjen Wahlgren.', rating: 'TV-PG', isLive: true },
      { id: 'k5-2', title: 'Big Brother', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 2), duration: 60, description: 'Reality-serie.', rating: 'TV-14' },
      { id: 'k5-3', title: 'CSI', startTime: formatTime(currentHour + 2), endTime: formatTime(currentHour + 3), duration: 60, description: 'Kriminalteknik-drama.', rating: 'TV-14' }
    ]
  },
  {
    id: 'tv6',
    number: 6,
    name: 'TV6',
    shortName: 'TV6',
    category: 'sports',
    currentProgram: {
      id: 'tv6-1',
      title: 'Allsvenskan',
      startTime: formatTime(currentHour - 1),
      endTime: formatTime(currentHour + 1),
      duration: 120,
      description: 'Live fotboll från Sveriges högsta division.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 'tv6-1', title: 'Allsvenskan', startTime: formatTime(currentHour - 1), endTime: formatTime(currentHour + 1), duration: 120, description: 'Svensk fotboll.', rating: 'TV-G', isLive: true },
      { id: 'tv6-2', title: 'UFC Fight Night', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 4), duration: 180, description: 'MMA-sändning.', rating: 'TV-14' }
    ]
  },
  {
    id: 'tv4sport',
    number: 10,
    name: 'TV4 Sport',
    shortName: 'T4S',
    category: 'sports',
    currentProgram: {
      id: 't4s-1',
      title: 'SHL Hockey',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 2.5),
      duration: 150,
      description: 'Live ishockey från Svenska Hockeyligan.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 't4s-1', title: 'SHL Hockey', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 2.5), duration: 150, description: 'Svensk elithockey.', rating: 'TV-G', isLive: true },
      { id: 't4s-2', title: 'Sportnytt', startTime: formatTime(currentHour + 2.5), endTime: formatTime(currentHour + 3), duration: 30, description: 'Sportnyheter.', rating: 'TV-G' }
    ]
  },
  {
    id: 'eurosport',
    number: 11,
    name: 'Eurosport',
    shortName: 'EUR',
    category: 'sports',
    currentProgram: {
      id: 'eur-1',
      title: 'Tour de France',
      startTime: formatTime(currentHour - 2),
      endTime: formatTime(currentHour + 2),
      duration: 240,
      description: 'Cykelvärldens största tävling.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 'eur-1', title: 'Tour de France', startTime: formatTime(currentHour - 2), endTime: formatTime(currentHour + 2), duration: 240, description: 'Cykling.', rating: 'TV-G', isLive: true },
      { id: 'eur-2', title: 'Tennis: ATP Masters', startTime: formatTime(currentHour + 2), endTime: formatTime(currentHour + 5), duration: 180, description: 'Tennis.', rating: 'TV-G' }
    ]
  },
  {
    id: 'svt24',
    number: 24,
    name: 'SVT24',
    shortName: 'S24',
    category: 'news',
    currentProgram: {
      id: 's24-1',
      title: 'SVT Nyheter',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 1),
      duration: 60,
      description: 'Dygnet runt-nyheter från SVT.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 's24-1', title: 'SVT Nyheter', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 1), duration: 60, description: 'Nyheter.', rating: 'TV-G', isLive: true },
      { id: 's24-2', title: 'Morgonstudion', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 3), duration: 120, description: 'Morgonnyheter.', rating: 'TV-G' }
    ]
  },
  {
    id: 'tv4fakta',
    number: 14,
    name: 'TV4 Fakta',
    shortName: 'T4F',
    category: 'documentary',
    currentProgram: {
      id: 't4f-1',
      title: 'Historien om Sverige',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 1),
      duration: 60,
      description: 'Dokumentär om Sveriges historia.',
      rating: 'TV-G',
      isLive: true
    },
    schedule: [
      { id: 't4f-1', title: 'Historien om Sverige', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 1), duration: 60, description: 'Svensk historia.', rating: 'TV-G', isLive: true },
      { id: 't4f-2', title: 'Världens undergång', startTime: formatTime(currentHour + 1), endTime: formatTime(currentHour + 2), duration: 60, description: 'Vetenskap och framtid.', rating: 'TV-PG' }
    ]
  },
  {
    id: 'tv4film',
    number: 15,
    name: 'TV4 Film',
    shortName: 'T4M',
    category: 'movies',
    currentProgram: {
      id: 't4m-1',
      title: 'Filmkväll: Män som hatar kvinnor',
      startTime: formatTime(currentHour - 0.5),
      endTime: formatTime(currentHour + 2),
      duration: 150,
      description: 'Svensk thriller baserad på Stieg Larssons roman.',
      rating: 'TV-MA',
      isLive: true
    },
    schedule: [
      { id: 't4m-1', title: 'Filmkväll: Män som hatar kvinnor', startTime: formatTime(currentHour - 0.5), endTime: formatTime(currentHour + 2), duration: 150, description: 'Svensk thriller.', rating: 'TV-MA', isLive: true },
      { id: 't4m-2', title: 'En man som heter Ove', startTime: formatTime(currentHour + 2), endTime: formatTime(currentHour + 4), duration: 120, description: 'Svensk dramakomedi.', rating: 'TV-PG' }
    ]
  },
  {
    id: 'viasatfilm',
    number: 16,
    name: 'Viasat Film',
    shortName: 'VIA',
    category: 'movies',
    currentProgram: {
      id: 'via-1',
      title: 'Hollywood Premiere',
      startTime: formatTime(currentHour),
      endTime: formatTime(currentHour + 2),
      duration: 120,
      description: 'De senaste filmerna från Hollywood.',
      rating: 'TV-14',
      isLive: true
    },
    schedule: [
      { id: 'via-1', title: 'Hollywood Premiere', startTime: formatTime(currentHour), endTime: formatTime(currentHour + 2), duration: 120, description: 'Nya filmer.', rating: 'TV-14', isLive: true },
      { id: 'via-2', title: 'Action Night', startTime: formatTime(currentHour + 2), endTime: formatTime(currentHour + 4), duration: 120, description: 'Actionfilmer.', rating: 'TV-14' }
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
  sports: 'Sport',
  news: 'Nyheter',
  movies: 'Film',
  entertainment: 'Underhållning',
  documentary: 'Dokumentär'
};
