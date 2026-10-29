import { createContext, useContext } from "react";

export const ContextApi = createContext();

export const useStoreContext = () => {
  const context = useContext(ContextApi);
  return context;
};
