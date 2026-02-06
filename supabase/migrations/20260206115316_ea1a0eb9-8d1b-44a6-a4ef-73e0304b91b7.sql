
-- Drop the overly permissive policy
DROP POLICY "Allow service role full access" ON public.imdb_ratings_cache;

-- Only the edge function (service role) needs to insert/update
-- No authenticated user should write to this table
-- Service role bypasses RLS automatically, so no write policy needed
