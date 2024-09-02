import React, { createContext, useState } from 'react';

export const LettersContext = createContext();

export const LettersProvider = ({ children }) => {
  const [positions, setPositions] = useState([]);
  
  return (
    <LettersContext.Provider value={{ positions, setPositions }}>
      {children}
    </LettersContext.Provider>
  );
};
