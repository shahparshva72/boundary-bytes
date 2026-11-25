'use client';

import { parseAsInteger, useQueryState } from 'nuqs';
import { useLeagueComparison } from '@/hooks/useStatsAPI';
import {
  Card,
  CardContent,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHeadCell,
  DataTableHeader,
  DataTableRow,
  SectionHeader,
  Select,
  Spinner,
} from './ui';
import { normalizeSince, SINCE_OPTIONS } from './VenueStats';

const HEADERS = [
  'League',
  'Mat',
  'Avg 1st Inns',
  'Run Rate',
  'Powerplay RR',
  'Middle RR',
  'Death RR',
  'Boundary %',
  'Dot %',
  'Balls / Wkt',
  'Chase Win %',
];

export default function LeagueComparison() {
  const [sinceParam, setSince] = useQueryState(
    'leaguesSince',
    parseAsInteger.withDefault(0).withOptions({ clearOnDefault: true }),
  );
  const since = normalizeSince(sinceParam);
  const { data, isLoading, isError } = useLeagueComparison(since);

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <Card>
        <SectionHeader title="League Comparison" color="coral" />

        <CardContent className="border-b-2 border-black">
          <p className="mb-3 text-xs font-bold text-black">
            How the leagues in your current selection score. Run rates are runs per six balls.
          </p>
          <div className="max-w-xs">
            <label className="block text-xs font-black text-black uppercase mb-1">Period</label>
            <Select
              options={SINCE_OPTIONS}
              value={
                SINCE_OPTIONS.find((option) => Number(option.value) === since) ?? SINCE_OPTIONS[0]
              }
              onChange={(val) => setSince(Number(val?.value ?? 0))}
              isSearchable={false}
              instanceId="leagues-since"
            />
          </div>
        </CardContent>

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Spinner size="md" color="#4F46E5" />
          </div>
        ) : isError ? (
          <CardContent className="bg-[#FF5E5B] text-sm font-bold text-black">
            Could not load the league comparison. Try again.
          </CardContent>
        ) : (
          <DataTable minWidth="950px">
            <DataTableHeader color="teal">
              <tr>
                {HEADERS.map((header, idx) => (
                  <DataTableHeadCell key={header} isLast={idx === HEADERS.length - 1}>
                    {header}
                  </DataTableHeadCell>
                ))}
              </tr>
            </DataTableHeader>
            <DataTableBody>
              {data?.data && data.data.length > 0 ? (
                data.data.map((league, index) => (
                  <DataTableRow key={league.league} index={index}>
                    <DataTableCell>
                      <span className="font-bold">{league.league}</span>
                      <span className="hidden md:inline"> · {league.name}</span>
                    </DataTableCell>
                    <DataTableCell>{league.matches}</DataTableCell>
                    <DataTableCell>{league.avgFirstInnings.toFixed(1)}</DataTableCell>
                    <DataTableCell>{league.runRate.toFixed(2)}</DataTableCell>
                    <DataTableCell>{league.powerplayRunRate.toFixed(2)}</DataTableCell>
                    <DataTableCell>{league.middleRunRate.toFixed(2)}</DataTableCell>
                    <DataTableCell>{league.deathRunRate.toFixed(2)}</DataTableCell>
                    <DataTableCell>{league.boundaryPct.toFixed(1)}</DataTableCell>
                    <DataTableCell>{league.dotBallPct.toFixed(1)}</DataTableCell>
                    <DataTableCell>{league.ballsPerWicket.toFixed(1)}</DataTableCell>
                    <DataTableCell isLast>
                      {league.decided > 0 ? league.chaseWinPct.toFixed(1) : '-'}
                    </DataTableCell>
                  </DataTableRow>
                ))
              ) : (
                <DataTableEmpty colSpan={HEADERS.length} message="No matches in this period" />
              )}
            </DataTableBody>
          </DataTable>
        )}
      </Card>
    </div>
  );
}
