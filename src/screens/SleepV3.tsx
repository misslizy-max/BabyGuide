import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Heading, Note, DeleteButton, values } from "../components/UI";
import { useApp } from "../hooks/useApp";
import { newEvent } from "../services/persistence";
import { duration, hours, localNow, months, sleepInPeriod, today } from "../utils/dates";

const ACTIVE_KEY = "babyguide.sleep.active";

function readActive() {
  try { return localStorage.getItem(ACTIVE_KEY) || ""; } catch { return ""; }
}
function writeActive(value: string) {
  try { value ? localStorage.setItem(ACTIVE_KEY, value) : localStorage.removeItem(ACTIVE_KEY); } catch {}
}
function dateKey(date: Date) {
  const y = date.getFullYear(), m = String(date.getMonth()+1).padStart(2,"0"), d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function dayLabel(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(date).replace(".", "");
}

export function SleepV3() {
  const { data, add, notify } = useApp();
  const [activeStart, setActiveStart] = useState(readActive);
  const [now, setNow] = useState(Date.now());
  const [manualOpen, setManualOpen] = useState(false);
  const [manualError, setManualError] = useState("");
  const [selectedDate, setSelectedDate] = useState(today());

  const sleeps = useMemo(() => data.events.filter((event) => event.kind === "Сон" && event.end).sort((a,b) => b.time.localeCompare(a.time)), [data.events]);
  useEffect(() => {
    if (!activeStart) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeStart]);

  const selectedStart = new Date(selectedDate + "T00:00");
  const selectedEnd = new Date(selectedStart); selectedEnd.setDate(selectedEnd.getDate()+1);
  const selectedTotal = sleepInPeriod(sleeps, selectedStart, selectedEnd);
  const selectedRows = sleeps.filter((e) => Date.parse(e.time) < +selectedEnd && Date.parse(e.end!) > +selectedStart);
  const age = months(data.profile.birth);

  const week = useMemo(() => Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(); date.setHours(0,0,0,0); date.setDate(date.getDate() - (6-offset));
    const end = new Date(date); end.setDate(end.getDate()+1);
    return { date, label: dayLabel(date), total: sleepInPeriod(sleeps, date, end) };
  }), [sleeps]);
  const maxWeek = Math.max(1, ...week.map((d) => d.total));
  const average = Math.round(week.reduce((sum,d) => sum+d.total,0)/7);
  const lastSleep = sleeps[0];
  const sinceWake = lastSleep?.end ? Math.max(0, Math.round((Date.now() - Date.parse(lastSleep.end))/60000)) : null;
  const activeMinutes = activeStart ? Math.max(0, Math.floor((now - Date.parse(activeStart))/60000)) : 0;

  function startSleep() {
    const start = new Date().toISOString().slice(0,16);
    writeActive(start);
    setActiveStart(start);
    setNow(Date.now());
    notify("Сон начался — таймер работает даже после обновления страницы");
  }
  function stopSleep() {
    if (!activeStart) return;
    const end = new Date().toISOString().slice(0,16);
    const mins = duration(activeStart, end);
    if (mins < 1) { notify("Сон слишком короткий для записи"); return; }
    if (add(newEvent("Сон", "Записано таймером BabyGuide", { time: activeStart, end, quality: "Таймер" }))) {
      writeActive("");
      setActiveStart("");
      notify("Сон сохранён");
    }
  }
  function submitManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = values(event);
    const mins = duration(f.start, f.end);
    if (mins <= 0 || mins > 1440 || Date.parse(f.end) > Date.now()) {
      setManualError("Проверьте время: конец должен быть позже начала, не в будущем, длительность — до 24 часов.");
      return;
    }
    if (sleeps.some((row) => Date.parse(f.start) < Date.parse(row.end!) && Date.parse(f.end) > Date.parse(row.time))) {
      setManualError("Этот интервал пересекается с уже записанным сном.");
      return;
    }
    if (add(newEvent("Сон", f.note, { time: f.start, end: f.end, quality: f.quality }))) {
      setManualError(""); setManualOpen(false); notify("Сон добавлен вручную");
    }
  }

  return (
    <div className="sleep-v3-page">
      <Heading title="Сон" sub="Один тап при засыпании, один — при пробуждении" back="diary" />

      <section className={`sleep-live-card ${activeStart ? "sleeping" : "awake"}`}>
        <div className="sleep-live-visual" aria-hidden="true">
          <span className="sleep-moon" /><span className="sleep-cloud cloud-a" /><span className="sleep-cloud cloud-b" />
        </div>
        <div className="sleep-live-copy">
          <p className="eyebrow">{activeStart ? "СЕЙЧАС СПИТ" : "СЕЙЧАС БОДРСТВУЕТ"}</p>
          <h1>{activeStart ? hours(activeMinutes) : sinceWake === null ? "Нет последней записи" : `Бодрствует ${hours(sinceWake)}`}</h1>
          <p>{activeStart ? `С ${new Date(activeStart).toLocaleTimeString("ru-RU", {hour:"2-digit",minute:"2-digit"})}` : lastSleep?.end ? `Последнее пробуждение в ${new Date(lastSleep.end).toLocaleTimeString("ru-RU", {hour:"2-digit",minute:"2-digit"})}` : "Начните первый сон — BabyGuide построит режим автоматически."}</p>
        </div>
        {activeStart ? <button className="sleep-main-action wake" onClick={stopSleep}>☀ Женя проснулся</button> : <button className="sleep-main-action" onClick={startSleep}>☾ Женя уснул</button>}
      </section>

      <section className="sleep-stats-row">
        <article><span>24ч</span><strong>{hours(sleepInPeriod(sleeps, new Date(Date.now()-86400000), new Date()))}</strong><small>за последние 24 часа</small></article>
        <article><span>7д</span><strong>{hours(average)}</strong><small>среднее за неделю</small></article>
        <article><span>☾</span><strong>{sleeps.filter((e) => e.time.startsWith(today())).length}</strong><small>записей сна сегодня</small></article>
      </section>

      <section className="sleep-week-card">
        <div className="section-title"><div><p className="eyebrow">7 ДНЕЙ</p><h2>Сколько спал</h2></div><strong>{hours(average)} / сутки</strong></div>
        <div className="sleep-week-chart" role="img" aria-label="Сон за последние семь дней">
          {week.map((day) => <div key={dateKey(day.date)}><span className="sleep-bar-track"><i style={{ height: `${Math.max(4,(day.total/maxWeek)*100)}%` }} /></span><small>{day.label}</small><b>{day.total ? Math.round(day.total/60) : 0}ч</b></div>)}
        </div>
      </section>

      <section className="sleep-day-card">
        <div className="section-title"><div><p className="eyebrow">ДЕНЬ</p><h2>{hours(selectedTotal)} сна</h2></div><input type="date" value={selectedDate} max={today()} onChange={(e) => setSelectedDate(e.target.value)} /></div>
        <div className="sleep-v3-timeline" aria-label={`Сон ${selectedDate}`}>
          {[0,6,12,18,24].map((h) => <span key={h} className="tick" style={{left:`${(h/24)*100}%`}}><small>{String(h).padStart(2,"0")}:00</small></span>)}
          {selectedRows.map((row) => {
            const left = Math.max(0, ((Date.parse(row.time)-+selectedStart)/(+selectedEnd-+selectedStart))*100);
            const right = Math.min(100, ((Date.parse(row.end!)-+selectedStart)/(+selectedEnd-+selectedStart))*100);
            return <i key={row.id} style={{left:`${left}%`,width:`${Math.max(1,right-left)}%`}} title={`${row.time} — ${row.end}`} />;
          })}
        </div>
        <div className="sleep-history-list">
          {selectedRows.map((row) => <div key={row.id}><span>☾</span><div><strong>{row.time.slice(11)} — {row.end?.slice(11)}</strong><small>{hours(duration(row.time,row.end!))} · {row.quality || "без оценки"}</small></div><DeleteButton id={row.id} label="Удалить сон" /></div>)}
          {!selectedRows.length && <p className="muted">В этот день сон пока не записан.</p>}
        </div>
      </section>

      <button className="secondary sleep-manual-toggle" onClick={() => setManualOpen(!manualOpen)}>{manualOpen ? "Скрыть ручной ввод" : "+ Добавить сон вручную"}</button>
      {manualOpen && <form className="form-card" onSubmit={submitManual}><h2>Ручная запись</h2><div className="form-row"><label>Начало<input name="start" type="datetime-local" max={localNow()} required /></label><label>Пробуждение<input name="end" type="datetime-local" max={localNow()} required /></label></div><label>Как спалось<select name="quality"><option>Спокойно</option><option>С пробуждениями</option><option>Беспокойно</option></select></label><label>Заметка<input name="note" maxLength={300} /></label><button className="button">Сохранить</button>{manualError && <p className="form-error">{manualError}</p>}</form>}

      <Note>{age === null ? "Добавьте дату рождения — появятся возрастные ориентиры." : age < 4 ? "До 4 месяцев ритм сна особенно изменчив: смотрим на ребёнка, а не на строгие часы." : age < 12 ? "Для 4–12 месяцев AASM рекомендует 12–16 часов сна в сутки с учётом дневных снов." : age < 36 ? "Для детей 1–2 лет ориентир AASM — 11–14 часов сна в сутки с учётом дневного сна." : "Сон оценивают по общей продолжительности, самочувствию и стабильности режима."}</Note>
    </div>
  );
}