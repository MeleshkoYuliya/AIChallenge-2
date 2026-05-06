
insert into storage.buckets (id, name, public) values ('event-covers', 'event-covers', true);

create policy "Event covers are publicly viewable"
on storage.objects for select
using (bucket_id = 'event-covers');

create policy "Authenticated users upload event covers"
on storage.objects for insert
with check (bucket_id = 'event-covers' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own event covers"
on storage.objects for update
using (bucket_id = 'event-covers' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own event covers"
on storage.objects for delete
using (bucket_id = 'event-covers' and auth.uid()::text = (storage.foldername(name))[1]);
