import React, {
  createContext,
  useCallback,
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
}

export function useLocalState<T>({
  key,
  initialState,
}: UseLocalStateProps<T>): [T, Dispatch<SetStateAction<T>>] {
  const context = useContext(LocalStateContext);
  if (!context) throw new Error("LocalStateProvider required");

  const initialValue =
    typeof initialState === "function"
      ? (initialState as Function)()
      : initialState;
  const contextValue = (context.data[key] as T) ?? initialValue;

  const handleDispatch = useCallback<Dispatch<SetStateAction<T>>>(
    (dispatch) => {
      context.setData((prev) => {
        const stateValue = (prev[key] as T) ?? initialValue;
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

export function deserializeLocalState(storageKey = "local-state") {
  return (
    (typeof localStorage !== "undefined" &&
      JSON.parse(localStorage.getItem(storageKey) || "null")) ||
    {}
  );
}

export function LocalStateProvider({
  children,
  storageKey = "local-state",
}: LocalStateProviderProps) {
  const [data, setData] = useState(deserializeLocalState());

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    function storageHandler(event: StorageEvent) {
      if (event.key === storageKey) {
        setData(deserializeLocalState());
      }
    }

    window.addEventListener("storage", storageHandler);
    return () => window.removeEventListener("storage", storageHandler);
  }, []);

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
