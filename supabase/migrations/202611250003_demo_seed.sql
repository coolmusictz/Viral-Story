insert into categories (slug,name_en,name_sw) values
  ('mystery','Mystery','Siri'),
  ('what-if','What if','Vipi kama'),
  ('love-life','Love & life','Mapenzi na maisha')
on conflict (slug) do update set name_en=excluded.name_en,name_sw=excluded.name_sw;

insert into stories (id,slug,category_id,title_en,title_sw,synopsis_en,synopsis_sw,status,published_at,human_approved_at,human_approved_by)
values
  ('00000000-0000-4000-8000-000000000001','the-last-matatu-demo',(select id from categories where slug='mystery'),'The last matatu demo','Matatu ya mwisho ya mfano','A clearly labelled fictional demo story.','Hadithi ya mfano iliyoandikwa wazi.','draft',null,null,null),
  ('00000000-0000-4000-8000-000000000002','a-voice-note-demo',(select id from categories where slug='what-if'),'A voice note from tomorrow','Ujumbe wa sauti wa kesho','A clearly labelled fictional demo story.','Hadithi ya mfano iliyoandikwa wazi.','draft',null,null,null)
on conflict (slug) do nothing;
