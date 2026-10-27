import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { AppData, JournalEvent } from "../types";
import { readData, writeData } from "../services/persistence";
import { getAudio, putAudio, deleteAudio } from "../services/audio";
type Context = {
  data: AppData;
  update: (fn: (old: AppData) => AppData) => boolean;
  add: (e: JournalEvent) => boolean;
  remove: (id: string) => void;
  favorite: (id: string) => void;
  error: string;
  notify: (text: string) => void;
  replace: (d: AppData) => boolean;
  raw: string | null;
};
const AppContext = createContext<Context | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(() => readData());
  const [data, setData] = useState(loaded.data),
    [error, setError] = useState(loaded.error),
    [toast, setToast] = useState(""),
    [raw, setRaw] = useState<string | null>(loaded.raw);
  const current = useRef(data),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function notify(text: string) {
    setToast(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 5000);
  }
  function replace(next: AppData) {
    try {
      writeData(next);
      current.current = next;
      setData(next);
      setError("");
      setRaw(null);
      return true;
    } catch {
      setError(
        "Не удалось сохранить: хранилище заполнено или недоступно. Экспортируйте данные до закрытия вкладки.",
      );
      notify(
        "Изменения не сохранены. Освободите место или экспортируйте данные.",
      );
      return false;
    }
  }
  function update(fn: (old: AppData) => AppData) {
    if (error && raw !== null) {
      notify("Сначала восстановите или экспортируйте данные в профиле.");
      return false;
    }
    return replace(fn(current.current));
  }
  const value: Context = {
    data,
    error,
    notify,
    raw,
    replace,
    update,
    add: (e) => update((d) => ({ ...d, events: [...d.events, e] })),
    remove: (id) => {
      void (async () => {
        const entry = current.current.events.find((e) => e.id === id);
        try {
          const backup = entry?.audioId
            ? await getAudio(entry.audioId)
            : undefined;
          if (entry?.audioId) await deleteAudio(entry.audioId);
          if (
            update((d) => ({
              ...d,
              events: d.events.filter((e) => e.id !== id),
            }))
          )
            notify("Запись удалена");
          else if (backup && entry?.audioId)
            await putAudio(entry.audioId, backup);
        } catch {
          notify("Не удалось удалить аудио. Запись оставлена в дневнике.");
        }
      })();
    },
    favorite: (id) => {
      update((d) => ({
        ...d,
        favorites: d.favorites.includes(id)
          ? d.favorites.filter((x) => x !== id)
          : [...d.favorites, id],
      }));
    },
  };
  return (
    <AppContext.Provider value={value}>
      {children}
      <div id="toast" className={toast ? "show" : ""} role="status">
        {toast}
      </div>
    </AppContext.Provider>
  );
}
export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw Error("AppProvider required");
  return c;
}
