export interface Episode {
  id: string;
  number: number;
  title: string;
  runtime: number;
  plot: string;
}

export interface Season {
  id: string;
  number: number;
  episodes: Episode[];
}

export interface WatchContent {
  id: string;
  title: string;
  type: 'movie' | 'series';
  year?: number;
  rating?: number;
  runtime?: number;
  genre: string[];
  plot: string;
  poster: string;
  posterLarge?: string;
  backdrop: string;
  backdropSmall?: string;
  seasons?: Season[];
  isHot?: boolean;
  isRecommended?: boolean;
  progress?: number; // 0-100 percentage
  // TMDB-specific fields
  tmdbId?: number;
  cast?: string[];
  director?: string;
  episodes?: number;
  similarContent?: WatchContent[];
  // IPTV-specific fields
  iptvId?: number;           // Xtream stream_id
  streamUrl?: string;        // Direct stream URL
  containerExtension?: string; // mkv, mp4, etc.
  // Credit-specific fields
  creditRole?: string;         // e.g. "Actor", "Director", "Producer"
  popularity?: number;         // TMDB popularity score
  // IMDB-specific fields
  imdbId?: string;
  imdbRating?: number;
}

export const genres = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Sci-Fi',
  'Thriller',
  'Romance',
  'Documentary',
  'Animation',
  'Fantasy',
] as const;

export const watchContent: WatchContent[] = [
  {
    id: '1',
    title: 'The Dark Knight',
    type: 'movie',
    year: 2008,
    rating: 9.0,
    runtime: 152,
    genre: ['Action', 'Drama', 'Thriller'],
    plot: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    poster: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400&h=225&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1920&h=1080&fit=crop',
    isHot: true,
    isRecommended: true,
    progress: 45,
  },
  {
    id: '2',
    title: 'Breaking Bad',
    type: 'series',
    year: 2008,
    rating: 9.5,
    runtime: 47,
    genre: ['Drama', 'Thriller'],
    plot: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
    poster: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=225&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1920&h=1080&fit=crop',
    isHot: true,
    isRecommended: true,
    seasons: [
      {
        id: 's1',
        number: 1,
        episodes: [
          { id: 'e1', number: 1, title: 'Pilot', runtime: 58, plot: 'Walter White, a high school chemistry teacher, learns he has terminal lung cancer.' },
          { id: 'e2', number: 2, title: 'Cat\'s in the Bag...', runtime: 48, plot: 'Walt and Jesse attempt to dispose of the two bodies in the RV.' },
          { id: 'e3', number: 3, title: '...And the Bag\'s in the River', runtime: 48, plot: 'Walt must decide what to do with Krazy-8.' },
        ],
      },
      {
        id: 's2',
        number: 2,
        episodes: [
          { id: 'e4', number: 1, title: 'Seven Thirty-Seven', runtime: 47, plot: 'Walt and Jesse face the wrath of Tuco.' },
          { id: 'e5', number: 2, title: 'Grilled', runtime: 48, plot: 'Tuco takes Walt and Jesse to a remote location.' },
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Inception',
    type: 'movie',
    year: 2010,
    rating: 8.8,
    runtime: 148,
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=225&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop',
    isRecommended: true,
  },
  {
    id: '4',
    title: 'Stranger Things',
    type: 'series',
    year: 2016,
    rating: 8.7,
    runtime: 51,
    genre: ['Drama', 'Fantasy', 'Horror'],
    plot: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
    poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=225&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=1920&h=1080&fit=crop',
    isHot: true,
    progress: 72,
    seasons: [
      {
        id: 'st-s1',
        number: 1,
        episodes: [
          { id: 'st-e1', number: 1, title: 'Chapter One: The Vanishing of Will Byers', runtime: 47, plot: 'On his way home from a friend\'s house, young Will sees something terrifying.' },
          { id: 'st-e2', number: 2, title: 'Chapter Two: The Weirdo on Maple Street', runtime: 55, plot: 'Lucas, Mike and Dustin try to talk to the girl they found in the woods.' },
        ],
      },
    ],
  },
  {
    id: '5',
    title: 'Interstellar',
    type: 'movie',
    year: 2014,
    rating: 8.6,
    runtime: 169,
    genre: ['Sci-Fi', 'Drama'],
    plot: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=225&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop',
    isHot: true,
  },
  {
    id: '6',
    title: 'The Office',
    type: 'series',
    year: 2005,
    rating: 9.0,
    runtime: 22,
    genre: ['Comedy'],
    plot: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
    poster: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=225&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&h=1080&fit=crop',
    isRecommended: true,
    seasons: [
      {
        id: 'off-s1',
        number: 1,
        episodes: [
          { id: 'off-e1', number: 1, title: 'Pilot', runtime: 23, plot: 'The premiere episode introduces the documentary crew and staff of Dunder-Mifflin.' },
          { id: 'off-e2', number: 2, title: 'Diversity Day', runtime: 22, plot: 'Michael\'s offensive behavior prompts a visit from corporate.' },
        ],
      },
    ],
  },
  {
    id: '7',
    title: 'Blade Runner 2049',
    type: 'movie',
    year: 2017,
    rating: 8.0,
    runtime: 164,
    genre: ['Sci-Fi', 'Drama', 'Thriller'],
    plot: 'Young Blade Runner K\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who\'s been missing for thirty years.',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=225&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=1080&fit=crop',
  },
  {
    id: '8',
    title: 'Game of Thrones',
    type: 'series',
    year: 2011,
    rating: 9.2,
    runtime: 57,
    genre: ['Action', 'Drama', 'Fantasy'],
    plot: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    poster: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400&h=225&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    isHot: true,
    isRecommended: true,
    progress: 15,
    seasons: [
      {
        id: 'got-s1',
        number: 1,
        episodes: [
          { id: 'got-e1', number: 1, title: 'Winter Is Coming', runtime: 62, plot: 'Eddard Stark is torn between his family and an old friend when asked to serve at the side of King Robert Baratheon.' },
        ],
      },
    ],
  },
  {
    id: '9',
    title: 'Pulp Fiction',
    type: 'movie',
    year: 1994,
    rating: 8.9,
    runtime: 154,
    genre: ['Drama', 'Thriller'],
    plot: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=225&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&h=1080&fit=crop',
  },
  {
    id: '10',
    title: 'The Mandalorian',
    type: 'series',
    year: 2019,
    rating: 8.7,
    runtime: 40,
    genre: ['Action', 'Sci-Fi', 'Fantasy'],
    plot: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.',
    poster: 'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=400&h=225&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop',
    isHot: true,
    seasons: [
      {
        id: 'mand-s1',
        number: 1,
        episodes: [
          { id: 'mand-e1', number: 1, title: 'Chapter 1: The Mandalorian', runtime: 39, plot: 'A Mandalorian bounty hunter tracks a target for a well-paying client.' },
          { id: 'mand-e2', number: 2, title: 'Chapter 2: The Child', runtime: 32, plot: 'Target in hand, the Mandalorian must now contend with scavengers.' },
        ],
      },
    ],
  },
  {
    id: '11',
    title: 'Get Out',
    type: 'movie',
    year: 2017,
    rating: 7.7,
    runtime: 104,
    genre: ['Horror', 'Thriller'],
    plot: 'A young African-American visits his white girlfriend\'s parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.',
    poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=225&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1475070929565-c985b496cb9f?w=1920&h=1080&fit=crop',
  },
  {
    id: '12',
    title: 'Spirited Away',
    type: 'movie',
    year: 2001,
    rating: 8.6,
    runtime: 125,
    genre: ['Animation', 'Fantasy'],
    plot: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=225&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    isRecommended: true,
  },
];

// Group content by categories
export const contentCategories = [
  {
    id: 'continue',
    title: 'Continue Watching',
    filter: (items: WatchContent[]) => items.filter((item) => item.progress && item.progress > 0),
  },
  {
    id: 'trending',
    title: 'Trending Now',
    filter: (items: WatchContent[]) => items.filter((item) => item.isHot),
  },
  {
    id: 'series',
    title: 'TV Series',
    filter: (items: WatchContent[]) => items.filter((item) => item.type === 'series'),
  },
  {
    id: 'movies',
    title: 'Movies',
    filter: (items: WatchContent[]) => items.filter((item) => item.type === 'movie'),
  },
  {
    id: 'recommended',
    title: 'Recommended For You',
    filter: (items: WatchContent[]) => items.filter((item) => item.isRecommended),
  },
  {
    id: 'scifi',
    title: 'Sci-Fi & Fantasy',
    filter: (items: WatchContent[]) => items.filter((item) => item.genre.includes('Sci-Fi') || item.genre.includes('Fantasy')),
  },
  {
    id: 'action',
    title: 'Action & Thriller',
    filter: (items: WatchContent[]) => items.filter((item) => item.genre.includes('Action') || item.genre.includes('Thriller')),
  },
];
