import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface UseLocalStateProps<T> {
  key: string;
  initialState?: T | (() => T);
  enabled?: boolean;
}

export function useLocalState<T>({
  key,
  initialState,
  enabled = true,
}: UseLocalStateProps<T>) {
  const context = useContext(LocalStateContext);
  if (!context) throw new Error("LocalStateProvider required");

  const state = useState<T>(context.data[key] ?? (initialState as T));
  const [value] = state;

  // Initial value
  useEffect(() => {
    if (!enabled) return;
    const value = context.data[key];
    if (!value) return;
    state[1](value);
  }, [enabled]);

  // Dispatch changes to context
  useEffect(() => {
    if (!enabled) return;
    context.setData((prev) => ({ ...prev, [key]: value }));
  }, [value, enabled]);

  return state;
}

export type LocalStateContextProps<S> = {
  data: S;
  setData: Dispatch<SetStateAction<S>>;
};

export const LocalStateContext = createContext<
  LocalStateContextProps<{ [key: string]: any }> | undefined
>(undefined);

export interface LocalStateProviderProps extends PropsWithChildren {
  storageKey?: string;
}

export function LocalStateProvider({
  children,
  storageKey = "local-state",
}: LocalStateProviderProps) {
  const [data, setData] = useState(
    JSON.parse(localStorage.getItem(storageKey) || "null") || {},
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  return (
    <LocalStateContext.Provider
      value={{
        data,
        setData,
      }}
    >
      {children}
    </LocalStateContext.Provider>
  );
}
