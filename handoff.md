# tiim-app handoff

## Last session: 2026-05-07 (Figma rebuild session 4)

### What was done

**Figma rebuild — all remaining pages completed**

1. **Team Achievements** (`/dashboard/team/achievements`) — rebuilt to match Figma frame `1:7030`
   - New `team-achievements-client.tsx`: member filter pills with badge count, streak leaderboard with rank colors, 4×2 badge grid with earner avatars
   - Server page computes badge earners from DB: streak achievements (streak_3/7/30 + first_checkin), Team Player from shoutouts ≥3, Problem Solver from resolved blockers
   - Added `getResolvedBlockerUserIdsByCompany()` to `src/lib/db/blockers.ts`
   - 8 badge types: Tuleleek 🔥, Teemant 💎, Purustamatu 🛡️, Esimene samm 🎯, Arenguhüpe 📈, Tiimimängija 🤝, Probleemilahendaja 🧩, Meeleolu tõus ✨

2. **Team Quarterly** (`/dashboard/team/quarterly`) — rebuilt to match Figma frame `1:7420`
   - New `team-quarterly-client.tsx`: member filter pills with % badge, 2-col member card grid
   - Each card: avatar + name + status (Esitatud/in-progress/Alustamata) + progress bar + 5 section pills (green/gray) + submission date
   - Sections: Eesmärkide ülevaade, Professionaalne areng, Töösobivus, Tagasiside juhile, Üldine heaolu
   - All members default to 0%/not started (no quarterly tracking DB yet — future work)

3. **Team Dashboard** (`/dashboard/team`) — rebuilt to match Figma frames `1:2434`, `1:3258`, `1:3950`
   - `TeamDashboardClient` rebuilt: inline styles replacing all `pz-*` CSS variables, new design token colors
   - Header: "[CompanyName] — Tiimi ülevaade" — now fetches company name from DB
   - Added `getCompany()` import and parallel fetch in `page.tsx`, passes `companyName` prop
   - Team aggregate tab: single WeeklyDigest card with stat bars (mood/energy/workload), 6-week AreaChart, streak leaderboard
   - Individuals tab: member cards grid (updated `TeamMemberCard` with streak display, inline styles)
   - History tab: existing HistoryTimeline in a card wrapper
   - `TeamMemberCard` updated: `streak` prop added, inline styles (no CSS vars), CheckCircle/AlertCircle icons, Flame streak display
   - Blockers section and PPP sections in `page.tsx`: all `pz-*` CSS vars replaced with hex values

### Complete Figma rebuild status

ALL pages rebuilt:
- ✅ Member Dashboard (`/dashboard/me`)
- ✅ Member News (`/news`)
- ✅ Member Achievements (`/achievements`)
- ✅ Member Goals (`/goals`)
- ✅ Settings (`/settings`)
- ✅ Quarterly check-in (`/quarterly`)
- ✅ Team Goals (`/dashboard/team/goals`)
- ✅ Team News (`/dashboard/team/news`)
- ✅ Team Analytics (`/dashboard/team/analytics`)
- ✅ Team Achievements (`/dashboard/team/achievements`)
- ✅ Team Quarterly (`/dashboard/team/quarterly`)
- ✅ Team Dashboard (`/dashboard/team`)

### Ongoing items
- **Clerk live keys** — still on test keys (`pk_test_` / `sk_test_`). Must swap in Vercel env vars before production.
- **Quarterly completion tracking** — no DB table yet. Team Quarterly page shows all members as 0%/not started until a `quarterly_submissions` table is added.
- **AI patterns section** — Team Dashboard digest card has no AI pattern detection. Future: store patterns from AI digests.
- **Goals filter pills on `/goals`** — interactive filtering not yet wired (visual only).
- **Supabase RLS** — all server access uses service role key (bypasses RLS). Acceptable as long as key stays secret.

### Deployment
- GitHub: alreinson/tiim-app (master branch)
- Vercel: auto-deploys on push, live at tiim.space
- No commits this session — changes are local only, commit + push when ready

## Architecture notes
- All server pages use `getUser()` from `src/lib/auth/session.ts`
- API routes use `auth()` + `getUserByClerkId()` directly
- Design system: Poppins (`font-display`) for headings, Inter for body, `#6030ff` purple primary
- All rebuilt pages use inline styles — no `pz-*` CSS vars or `pz-card` classes
- `AnnouncementsFeed` at `src/components/shared/announcements-feed.tsx` used by member `/news`; Team News has own `TeamNewsClient`

## Security review (last reviewed 2026-05-06)
- FAIL (open): Clerk test keys — swap to live keys in Vercel before production
- All other FAILs from previous review: resolved
