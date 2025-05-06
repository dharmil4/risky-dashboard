import { createContext, useState, useContext } from 'react';

const DateRangeContext = createContext();

export const DateRangeProvider = ({ children }) => {
  const [range, setRange] = useState('30d');
  const [interval, setInterval] = useState('day');

  return (
    <DateRangeContext.Provider value={{ range, setRange, interval, setInterval }}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => useContext(DateRangeContext);
