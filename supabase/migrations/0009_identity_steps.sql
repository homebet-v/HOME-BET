alter table public.profiles add column identity_draft_saved_at timestamptz;

-- Reopen legacy approvals that predate document verification. Account IDs and
-- ledger entries stay in place, and complete approvals keep their status.
update public.profiles
set verified_at = null, verified_by = null
where role = 'player' and verified_at is not null
  and (verification_submitted_at is null or not (identity_files ?& array['front','back','selfie']));

create function public.save_player_identity_draft(target_casino uuid, target_player uuid, details jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update public.profiles
  set identity_details = details, identity_draft_saved_at = now()
  where id = target_player and casino_id = target_casino and role = 'player'
    and verified_at is null and verification_decision <> 'rejected'
    and (verification_submitted_at is null or verification_decision = 'denied')
    and exists (select 1 from public.casinos where id = target_casino and status = 'active');
  return found;
end;
$$;

revoke all on function public.save_player_identity_draft(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.save_player_identity_draft(uuid, uuid, jsonb) to service_role;
