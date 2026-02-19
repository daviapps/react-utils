import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface UseSessionStateProps<T> {
  key: string;
  initialState?: T | (() => T);
  enabled?: boolean;
}

export function useSessionState<T>({
  key,
  initialState,
  enabled = true,
}: UseSessionStateProps<T>) {
  const context = useContext(SessionStateContext);
  if (!context) throw new Error("SessionStateProvider required");

  const state = useState<T>(context.data[key] ?? (initialState as T));
  const [value] = state;

  // Dispatch changes to context
  useEffect(() => {
    if (!enabled) return;
    context.setData((prev) => ({ ...prev, [key]: value }));
  }, [value, enabled]);

  return state;
}

export type SessionStateContextProps<S> = {
  data: S;
  setData: Dispatch<SetStateAction<S>>;
};

export const SessionStateContext = createContext<
  SessionStateContextProps<{ [key: string]: any }> | undefined
>(undefined);

export interface SessionStateProviderProps extends PropsWithChildren {
  storageKey?: string;
}

export function SessionStateProvider({
  children,
  storageKey = "session-state",
}: SessionStateProviderProps) {
  const [data, setData] = useState(
    JSON.parse(sessionStorage.getItem(storageKey) || "null") || {},
  );

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  return (
    <SessionStateContext.Provider
      value={{
        data,
        setData,
      }}
    >
      {children}
    </SessionStateContext.Provider>
  );
}
