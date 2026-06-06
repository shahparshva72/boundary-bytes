import type { MatchupOption, MatchupShowdownQuestion } from './types';

export interface MatchupRoundApiResponse {
  batter: string;
  prompt: string;
  questionType: 'mostDismissals' | 'lowestStrikeRate' | 'fewestRuns';
  correctOpponent: string;
  options: MatchupOption[];
  league: string;
}

function revealLabelForQuestionType(
  questionType: MatchupRoundApiResponse['questionType'],
  option: MatchupOption,
): string {
  switch (questionType) {
    case 'lowestStrikeRate':
      return `SR ${option.strikeRate.toFixed(1)} · ${option.dismissals} dismissals`;
    case 'fewestRuns':
      return `${option.runsScored} runs · SR ${option.strikeRate.toFixed(1)}`;
    default:
      return `${option.dismissals} dismissals · SR ${option.strikeRate.toFixed(1)}`;
  }
}

export function mapMatchupRoundResponse(data: MatchupRoundApiResponse): MatchupShowdownQuestion {
  const revealLabel = (option: MatchupOption) =>
    revealLabelForQuestionType(data.questionType, option);

  return {
    type: 'matchup-showdown',
    batter: data.batter,
    prompt: data.prompt,
    correctOpponent: data.correctOpponent,
    options: data.options,
    revealLabel,
  };
}
