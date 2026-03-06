do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'contact_type'
      and e.enumlabel = 'outros'
  ) then
    alter type contact_type add value 'outros';
  end if;
end
$$;
