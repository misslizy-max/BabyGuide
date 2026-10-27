import type { AppData } from "../types";
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("babyguide.audio", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("clips");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function putAudio(id: string, blob: Blob) {
  if (blob.size > 15 * 1024 * 1024) throw Error("Запись слишком велика");
  const database = await db();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction("clips", "readwrite");
      tx.objectStore("clips").put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    database.close();
  }
}
export async function getAudio(id: string): Promise<Blob | undefined> {
  const database = await db();
  try {
    return await new Promise((resolve, reject) => {
      const tx = database.transaction("clips", "readonly");
      const r = tx.objectStore("clips").get(id);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  } finally {
    database.close();
  }
}
export async function deleteAudio(id: string) {
  const database = await db();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction("clips", "readwrite");
      tx.objectStore("clips").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    database.close();
  }
}
export async function clearAudio() {
  const database = await db();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction("clips", "readwrite");
      tx.objectStore("clips").clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    database.close();
  }
}
const toDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const f = new FileReader();
    f.onload = () => resolve(String(f.result));
    f.onerror = () => reject(f.error);
    f.readAsDataURL(blob);
  });
export async function exportBackup(data: AppData) {
  const audio = [];
  for (const id of [
    ...new Set(data.events.flatMap((e) => (e.audioId ? [e.audioId] : []))),
  ]) {
    const blob = await getAudio(id);
    if (blob) audio.push({ id, url: await toDataURL(blob) });
  }
  return JSON.stringify({ format: "babyguide.backup", data, audio });
}
export async function importBackup(input: unknown[]) {
  if (!Array.isArray(input) || input.length > 1000)
    throw Error("Неверные аудиоданные");
  const clips = input.map((raw) => {
    const x = raw as { id: string; url: string };
    if (
      !x ||
      typeof x.id !== "string" ||
      x.id.length > 100 ||
      typeof x.url !== "string" ||
      !/^data:audio\/[a-zA-Z0-9.+-]+(?:;[^,]*)?;base64,/.test(x.url) ||
      x.url.length > 22 * 1024 * 1024
    )
      throw Error("Неверный формат аудио");
    const [header, encoded] = x.url.split(",");
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    return {
      id: x.id,
      blob: new Blob([bytes], { type: header.slice(5).split(";")[0] }),
    };
  });
  const database = await db();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction("clips", "readwrite"),
        store = tx.objectStore("clips");
      for (const c of clips) store.put(c.blob, c.id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    database.close();
  }
}
