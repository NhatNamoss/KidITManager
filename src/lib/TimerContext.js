import { createContext, useContext } from 'react';

export const TimerContext = createContext(null);
export function useTeachingTimer() { return useContext(TimerContext); }
