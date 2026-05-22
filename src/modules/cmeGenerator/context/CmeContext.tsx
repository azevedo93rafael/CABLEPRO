// ─────────────────────────────────────────────────────────────────────────────
// src/modules/cmeGenerator/context/CmeContext.tsx
// Global state for the CME Generator module
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { Elemento, ResultadoItem, CmeState, ChatMessage } from '../types';

type Action =
  | { type: 'SET_ELEMENTOS'; payload: Elemento[] }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: CmeState['progress'] }
  | { type: 'ADD_RESULTADO'; payload: ResultadoItem }
  | { type: 'APPLY_OVERRIDE'; payload: { id: string; changes: Partial<ResultadoItem> } }
  | { type: 'ADD_CHAT_MSG'; payload: { id: string; msg: ChatMessage } }
  | { type: 'RESET' };

const initialState: CmeState = {
  elementos:   [],
  resultados:  new Map(),
  overrides:   new Map(),
  chatHistory: new Map(),
  isProcessing: false,
  progress:    { current: 0, total: 0, message: '' },
};

function reducer(state: CmeState, action: Action): CmeState {
  switch (action.type) {
    case 'SET_ELEMENTOS':
      return { ...state, elementos: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'ADD_RESULTADO': {
      const next = new Map(state.resultados);
      next.set(action.payload.idElemento, action.payload);
      return { ...state, resultados: next };
    }
    case 'APPLY_OVERRIDE': {
      const overrides = new Map(state.overrides);
      const existing  = overrides.get(action.payload.id) ?? {};
      overrides.set(action.payload.id, { ...existing, ...action.payload.changes });
      return { ...state, overrides };
    }
    case 'ADD_CHAT_MSG': {
      const history = new Map(state.chatHistory);
      const msgs = [...(history.get(action.payload.id) ?? []), action.payload.msg];
      history.set(action.payload.id, msgs);
      return { ...state, chatHistory: history };
    }
    case 'RESET':
      return { ...initialState, resultados: new Map(), overrides: new Map(), chatHistory: new Map() };
    default:
      return state;
  }
}

interface CmeContextType {
  state: CmeState;
  getEffectiveResult: (id: string) => ResultadoItem | undefined;
  getAllEffectiveResults: () => ResultadoItem[];
  dispatch: React.Dispatch<Action>;
}

const CmeContext = createContext<CmeContextType | null>(null);

export function CmeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getEffectiveResult = useCallback((id: string): ResultadoItem | undefined => {
    const original = state.resultados.get(id);
    if (!original) return undefined;
    const overrides = state.overrides.get(id) ?? {};
    return { ...original, ...overrides };
  }, [state.resultados, state.overrides]);

  const getAllEffectiveResults = useCallback((): ResultadoItem[] => {
    return Array.from(state.resultados.keys())
      .map(id => getEffectiveResult(id)!)
      .filter(Boolean);
  }, [state.resultados, getEffectiveResult]);

  return (
    <CmeContext.Provider value={{ state, getEffectiveResult, getAllEffectiveResults, dispatch }}>
      {children}
    </CmeContext.Provider>
  );
}

export function useCme(): CmeContextType {
  const ctx = useContext(CmeContext);
  if (!ctx) throw new Error('useCme must be used within CmeProvider');
  return ctx;
}
