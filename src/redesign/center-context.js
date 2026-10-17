import { createContext, useContext } from 'react';
export const CenterContext = createContext(null);
export const useCenter = () => useContext(CenterContext);
