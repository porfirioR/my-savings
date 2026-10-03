-- A group can only have one active rueda at a time. Several queries
-- (findActive, cash-box projection, findActiveSlotByMember) assume a single
-- 'active' row per group and break when there are two.
-- If this fails on apply, resolve the duplicated active ruedas first:
--   SELECT group_id, array_agg(id) FROM ruedas WHERE status = 'active'
--   GROUP BY group_id HAVING count(*) > 1;
CREATE UNIQUE INDEX ruedas_one_active_per_group
    ON ruedas(group_id)
    WHERE status = 'active';
