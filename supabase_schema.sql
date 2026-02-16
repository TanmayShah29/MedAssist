-- Enable RLS
create table if not exists rate_limits (
  fingerprint text not null,
  window_start timestamp with time zone not null,
  request_count int not null default 1,
  primary key (fingerprint, window_start)
);

alter table rate_limits enable row level security;

-- Create policy to deny all access by default (Service Role will bypass this)
create policy "Deny all access" on rate_limits for all using (false);

-- Deterministic Rate Limit Check
create or replace function check_rate_limit(
  p_fingerprint text,
  p_window_seconds int,
  p_limit int
) returns boolean as $$
declare
  current_window_start timestamp with time zone;
  current_count int;
begin
  -- Calculate window start (deterministic based on epoch)
  current_window_start := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  -- Insert or Update logic
  insert into rate_limits (fingerprint, window_start, request_count)
  values (p_fingerprint, current_window_start, 1)
  on conflict (fingerprint, window_start)
  do update set request_count = rate_limits.request_count + 1
  returning request_count into current_count;

  -- Return true if within limit, false if exceeded
  return current_count <= p_limit;
end;
$$ language plpgsql security definer;
