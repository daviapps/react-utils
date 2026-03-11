import { useCallback } from "react";
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
}

export function useSessionState<T>({
  key,
  initialState,
}: UseSessionStateProps<T>): [T, Dispatch<SetStateAction<T>>] {
  const context = useContext(SessionStateContext);
  if (!context) throw new Error("SessionStateProvider required");

  const initialValue =
    typeof initialState === "function"
      ? (initialState as Function)()
      : initialState;
  const contextValue = (context.data[key] as T) || initialValue;

  const handleDispatch = useCallback<Dispatch<SetStateAction<T>>>(
    (dispatch) => {
      context.setData((prev) => {
        const stateValue = prev[key] as T;
        const nextValue =
          typeof dispatch === "function"
            ? (dispatch as (prev: T) => T)(stateValue)
            : dispatch;
        return { ...prev, [key]: nextValue };
      });
    },
    [],
  );

  return [contextValue, handleDispatch];
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
    (typeof sessionStorage !== "undefined" &&
      JSON.parse(sessionStorage.getItem(storageKey) || "null")) ||
      {},
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
