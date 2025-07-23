# IPL Implementation Plan - TODO

## Phase 1: Database Schema Updates

### Schema Migration

- [ ] Add `league` column to `WplMatch` model with default value "WPL"
- [ ] Add `league` column to `WplMatchInfo` model with default value "WPL"
- [ ] Add database indexes for `[league]` and `[league, season]` on both tables
- [ ] Run Prisma migration: `npx prisma migrate dev --name add_league_column`
- [ ] Update existing WPL data: `UPDATE wpl_match SET league = 'WPL' WHERE league IS NULL;`
- [ ] Update existing WPL match info: `UPDATE wpl_match_info SET league = 'WPL' WHERE league IS NULL;`

## Phase 2: Data Import Setup

### IPL Data Structure

- [ ] Create `ipl_csv` directory in project root
- [ ] Verify IPL CSV files follow same format as WPL (match files + \_info files)
- [ ] Create or modify seed script for IPL data import
- [ ] Update seed script to set `league: 'IPL'` for all IPL records
- [ ] Test IPL data import on sample files
- [ ] Run full IPL data import: `npm run seed:ipl`

### Seed Script Updates

- [ ] Create `prisma/seed-ipl.ts` file
- [ ] Implement `seedIPL()` function with league filtering
- [ ] Implement `processIPLInfoFiles()` function
- [ ] Add IPL seed script to package.json: `"seed:ipl": "ts-node prisma/seed-ipl.ts"`
- [ ] Update main seed script to handle league parameter (optional)

## Phase 3: API Route Updates

### Core API Modifications

- [ ] Update `/api/matches/route.ts` to accept `league` query parameter
- [ ] Update `/api/matches/list/route.ts` for league filtering
- [ ] Update `/api/players/batters/route.ts` for league filtering
- [ ] Update `/api/players/bowlers/route.ts` for league filtering
- [ ] Update all stats API routes to support league parameter:
  - [ ] `/api/stats/advanced/route.ts`
  - [ ] `/api/stats/bowling-wicket-types/route.ts`
  - [ ] `/api/stats/fall-of-wickets/[matchId]/route.ts`
  - [ ] `/api/stats/leading-run-scorers/route.ts`
  - [ ] `/api/stats/leading-wicket-takers/route.ts`
  - [ ] `/api/stats/matchup/route.ts`
  - [ ] `/api/stats/team-averages/route.ts`
  - [ ] `/api/stats/team-wins/route.ts`

### API Response Updates

- [ ] Include `league` field in all API responses
- [ ] Update pagination to be league-aware
- [ ] Update season filtering to be league-specific
- [ ] Test API endpoints with both WPL and IPL data

## Phase 4: Frontend Component Updates

### New Components

- [ ] Create `LeagueSelector.tsx` component
- [ ] Add league state management to main pages
- [ ] Create league-specific routing logic

### Existing Component Updates

- [ ] Update `Header/index.tsx` to include WPL and IPL navigation links
- [ ] Update `matches.tsx` to support league selection
- [ ] Update `StatsDisplay.tsx` to handle league-specific data
- [ ] Update `StatsControls.tsx` to include league selector
- [ ] Update all stats components to pass league parameter:
  - [ ] `BowlingWicketTypes.tsx`
  - [ ] `FallOfWickets.tsx`
  - [ ] `RunScorers.tsx`
  - [ ] `TeamAverages.tsx`
  - [ ] `TeamWins.tsx`
  - [ ] `WicketTakers.tsx`
  - [ ] `Matchup.tsx`

### Page Updates

- [ ] Update main stats page to handle league query parameter
- [ ] Update advanced stats page for league support
- [ ] Add league-specific default routes
- [ ] Update navigation to preserve league selection across pages

## Phase 5: UI/UX Enhancements

### League-Specific Styling

- [ ] Add IPL-specific color schemes/branding (optional)
- [ ] Update page titles to reflect selected league
- [ ] Add league indicators in data displays
- [ ] Ensure consistent league selection across all pages

### User Experience

- [ ] Implement league selection persistence (localStorage/URL params)
- [ ] Add loading states for league switching
- [ ] Add error handling for league-specific data
- [ ] Implement league-specific empty states

## Phase 6: Testing & Validation

### Data Validation

- [ ] Verify IPL data import completed successfully
- [ ] Check data integrity between leagues
- [ ] Validate match counts and statistics
- [ ] Test edge cases with missing data

### Functionality Testing

- [ ] Test league switching functionality
- [ ] Verify all stats work correctly for both leagues
- [ ] Test pagination with league filtering
- [ ] Test season filtering within each league
- [ ] Verify search and filter combinations

### Cross-League Features

- [ ] Test league comparison features (if implemented)
- [ ] Verify league isolation (IPL data doesn't appear in WPL views)
- [ ] Test URL sharing with league parameters

## Phase 7: Documentation & Deployment

### Documentation Updates

- [ ] Update README.md with IPL support information
- [ ] Document new API parameters and responses
- [ ] Update database schema documentation
- [ ] Create IPL data import instructions

### Deployment Preparation

- [ ] Update environment variables if needed
- [ ] Test database migration in staging
- [ ] Prepare rollback plan
- [ ] Update deployment scripts for new seed data

### Final Validation

- [ ] End-to-end testing of complete IPL workflow
- [ ] Performance testing with combined WPL+IPL dataset
- [ ] User acceptance testing
- [ ] Production deployment

## Future Enhancements (Optional)

### Advanced Features

- [ ] Cross-league comparison tools
- [ ] League-specific analytics dashboards
- [ ] Player comparison across leagues
- [ ] Historical league performance trends

### Additional Leagues

- [ ] Framework for adding more leagues (CPL, BBL, etc.)
- [ ] Generic league configuration system
- [ ] Multi-league tournament support

---

## Notes

- All existing WPL functionality should remain unchanged
- League parameter defaults to "WPL" for backward compatibility
- IPL data should be completely isolated from WPL unless explicitly combined
- Consider performance implications with larger combined dataset
