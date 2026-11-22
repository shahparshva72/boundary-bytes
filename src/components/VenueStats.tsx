'use client';

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useVenueStats } from '@/hooks/useStatsAPI';
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
  Pagination,
  SectionHeader,
  Select,
  Spinner,
} from './ui';
import type { SelectOption } from './ui/Select';

const PAGE_SIZE = 10;

const SORT_OPTIONS: SelectOption[] = [
  { value: 'matches', label: 'Most matches' },
  { value: 'avgFirstInnings', label: 'Highest 1st innings average' },
  { value: 'runRate', label: 'Highest run rate' },
  { value: 'chaseWinPct', label: 'Best for chasing' },
];

export const SINCE_OPTIONS: SelectOption[] = [
  { value: '0', label: 'All time' },
  { value: '2020', label: 'Since 2020' },
  { value: '2023', label: 'Since 2023' },
  { value: '2025', label: 'Since 2025' },
];

export const normalizeSince = (since: number): number =>
  SINCE_OPTIONS.some((option) => Number(option.value) === since) ? since : 0;

const HEADERS = [
  '#',
  'Venue',
  'Mat',
  'Avg 1st Inns',
  'Avg 2nd Inns',
  'Run Rate',
  'Highest',
  'Lowest 1st',
  'Bat 1st W',
  'Chase W',
  'Chase Win %',
];

export default function VenueStats() {
  const [params, setParams] = useQueryStates(
    {
      venuesPage: parseAsInteger.withDefault(1),
      venuesSort: parseAsString.withDefault('matches'),
      venuesSince: parseAsInteger.withDefault(0),
    },
    { clearOnDefault: true },
  );
  const page = Math.max(1, params.venuesPage);
  const sort = SORT_OPTIONS.some((option) => option.value === params.venuesSort)
    ? params.venuesSort
    : 'matches';
  const since = normalizeSince(params.venuesSince);
  const { data, isLoading, isError } = useVenueStats(page, sort, since, PAGE_SIZE);

  return (
    <div className="w-full mx-auto p-0 sm:p-4">
      <Card>
        <SectionHeader title="Venues" color="coral" />

        <CardContent className="border-b-2 border-black">
          <p className="mb-3 text-xs font-bold text-black">
            Venues with at least 5 matches. Chase win % counts matches with a recorded winner.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">Sort By</label>
              <Select
                options={SORT_OPTIONS}
                value={SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0]}
                onChange={(val) =>
                  setParams({ venuesSort: val?.value ?? 'matches', venuesPage: 1 })
                }
                isSearchable={false}
                instanceId="venues-sort"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1">Period</label>
              <Select
                options={SINCE_OPTIONS}
                value={
                  SINCE_OPTIONS.find((option) => Number(option.value) === since) ?? SINCE_OPTIONS[0]
                }
                onChange={(val) =>
                  setParams({ venuesSince: Number(val?.value ?? 0), venuesPage: 1 })
                }
                isSearchable={false}
                instanceId="venues-since"
              />
            </div>
          </div>
        </CardContent>

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Spinner size="md" color="#4F46E5" />
          </div>
        ) : isError ? (
          <CardContent className="bg-[#FF5E5B] text-sm font-bold text-black">
            Could not load venues. Try again.
          </CardContent>
        ) : (
          <>
            <DataTable minWidth="900px">
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
                  data.data.map((venue, index) => (
                    <DataTableRow key={venue.venue} index={index}>
                      <DataTableCell>{(page - 1) * PAGE_SIZE + index + 1}</DataTableCell>
                      <DataTableCell>
                        <span className="font-bold">{venue.venue}</span>
                        {venue.city && !venue.venue.includes(venue.city) ? `, ${venue.city}` : ''}
                      </DataTableCell>
                      <DataTableCell>{venue.matches}</DataTableCell>
                      <DataTableCell>{venue.avgFirstInnings.toFixed(1)}</DataTableCell>
                      <DataTableCell>{venue.avgSecondInnings.toFixed(1)}</DataTableCell>
                      <DataTableCell>{venue.runRate.toFixed(2)}</DataTableCell>
                      <DataTableCell>{venue.highestTotal}</DataTableCell>
                      <DataTableCell>{venue.lowestTotal}</DataTableCell>
                      <DataTableCell>{venue.batFirstWins}</DataTableCell>
                      <DataTableCell>{venue.chaseWins}</DataTableCell>
                      <DataTableCell isLast>
                        {venue.decided > 0 ? venue.chaseWinPct.toFixed(1) : '-'}
                      </DataTableCell>
                    </DataTableRow>
                  ))
                ) : (
                  <DataTableEmpty
                    colSpan={HEADERS.length}
                    message="No venues with 5 or more matches"
                  />
                )}
              </DataTableBody>
            </DataTable>
            <Pagination
              currentPage={page}
              totalPages={data?.pagination.pages ?? 1}
              skipSize={PAGE_SIZE}
              onPageChange={(page: number) => setParams({ venuesPage: page })}
            />
          </>
        )}
      </Card>
    </div>
  );
}
