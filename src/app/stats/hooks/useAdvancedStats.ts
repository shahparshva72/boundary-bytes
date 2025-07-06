import { useReducer } from 'react';

type State = {
  selectedOvers: number[];
  selectedPlayer: { value: string; label: string } | null;
  playerType: 'batter' | 'bowler';
};

const initialState: State = {
  selectedOvers: [],
  selectedPlayer: null,
  playerType: 'batter',
};

export type Action =
  | { type: 'TOGGLE_OVER'; payload: number }
  | { type: 'SET_PHASE'; payload: string | null }
  | { type: 'SET_PLAYER_TYPE'; payload: 'batter' | 'bowler' }
  | { type: 'SET_SELECTED_PLAYER'; payload: { value: string; label: string } | null }
  | { type: 'CLEAR' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'TOGGLE_OVER':
      return {
        ...state,
        selectedOvers: state.selectedOvers.includes(action.payload)
          ? state.selectedOvers.filter((o) => o !== action.payload)
          : [...state.selectedOvers, action.payload],
      };
    case 'SET_PHASE':
      if (action.payload === 'powerplay') {
        return { ...state, selectedOvers: [1, 2, 3, 4, 5, 6] };
      } else if (action.payload === 'middle') {
        return { ...state, selectedOvers: [7, 8, 9, 10, 11, 12, 13, 14, 15] };
      } else if (action.payload === 'death') {
        return { ...state, selectedOvers: [16, 17, 18, 19, 20] };
      } else {
        return { ...state, selectedOvers: [] };
      }
    case 'SET_PLAYER_TYPE':
      return { ...state, playerType: action.payload, selectedPlayer: null };
    case 'SET_SELECTED_PLAYER':
      return { ...state, selectedPlayer: action.payload };
    case 'CLEAR':
      return { ...state, selectedOvers: [], selectedPlayer: null };
    default:
      return state;
  }
};

export const useAdvancedStats = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return { state, dispatch };
};
