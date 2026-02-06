
CREATE TABLE public.imdb_ratings_cache (
  tmdb_id integer NOT NULL,
  media_type text NOT NULL,
  imdb_id text,
  imdb_rating numeric,
  imdb_votes text,
  cached_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tmdb_id, media_type)
);

-- Public reference data, no RLS needed
ALTER TABLE public.imdb_ratings_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON public.imdb_ratings_cache
FOR SELECT
USING (true);

CREATE POLICY "Allow service role full access"
ON public.imdb_ratings_cache
FOR ALL
USING (true)
WITH CHECK (true);
