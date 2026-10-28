import { useEffect, useMemo, useState } from "react";
import { Heading, Link, Note } from "../components/UI";
import { RecipeHeroVisual } from "../components/RecipeVisuals";
import { recipes, slots, slotNames, foods } from "../data/nutrition";
import { candidates, foodMatches } from "../services/menu";
import { useApp } from "../hooks/useApp";
import { months } from "../utils/dates";
import type { Recipe } from "../types";

type PlanCell = { day: number; slot: Recipe["slot"]; recipeId: string };
type SavedPlan = { days: number; selectedSlots: Recipe["slot"][]; cells: PlanCell[] };
const STORAGE = "babyguide.menu.v3";

function loadSaved(): SavedPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function savePlan(plan: SavedPlan) {
  try { localStorage.setItem(STORAGE, JSON.stringify(plan)); } catch {}
}

export function MenuBuilderVisual() {
  const { data, notify } = useApp();
  const profile = data.profile;
  const age = months(profile.birth);
  const saved = useMemo(loadSaved, []);
  const [days, setDays] = useState(saved?.days || 7);
  const [selectedSlots, setSelectedSlots] = useState<Recipe["slot"][]>(saved?.selectedSlots || [...slots]);
  const [onlyIntroduced, setOnlyIntroduced] = useState(age !== null && age < 12);
  const [pantryOnly, setPantryOnly] = useState(false);
  const [quickOnly, setQuickOnly] = useState(false);
  const [avoidRepeats, setAvoidRepeats] = useState(true);
  const [excludedNow, setExcludedNow] = useState<string[]>([]);
  const [cells, setCells] = useState<PlanCell[]>(saved?.cells || []);
  const [tab, setTab] = useState<"plan" | "shopping">("plan");
  const region = data.travelCity?.region || profile.region;
  const options = { onlyIntroduced, pantryOnly, region };

  function listFor(slot: Recipe["slot"]) {
    if (age === null) return [] as Recipe[];
    return candidates(profile, age, slot, options)
      .filter((recipe) => !recipe.ingredients.some((item) => excludedNow.includes(item.id)))
      .filter((recipe) => !quickOnly || recipe.minutes <= 20);
  }

  function build() {
    if (age === null) { notify("Сначала укажите дату рождения в профиле"); return; }
    if (age < 6) { notify("До готовности к прикорму конструктор меню не используется"); return; }
    if (!selectedSlots.length) { notify("Выберите хотя бы один приём пищи"); return; }
    const used = new Map<string, number>();
    const previousBySlot = new Map<string, string[]>();
    const next: PlanCell[] = [];
    for (let day = 0; day < days; day += 1) {
      for (const slot of selectedSlots) {
        const base = listFor(slot);
        const recent = previousBySlot.get(slot) || [];
        const ranked = [...base].sort((a, b) => {
          const repeatA = avoidRepeats && recent.includes(a.id) ? 100 : 0;
          const repeatB = avoidRepeats && recent.includes(b.id) ? 100 : 0;
          const usedA = used.get(a.id) || 0;
          const usedB = used.get(b.id) || 0;
          return repeatA - repeatB || usedA - usedB || a.minutes - b.minutes || a.name.localeCompare(b.name, "ru");
        });
        const recipe = ranked[0];
        next.push({ day, slot, recipeId: recipe?.id || "" });
        if (recipe) {
          used.set(recipe.id, (used.get(recipe.id) || 0) + 1);
          previousBySlot.set(slot, [...recent.slice(-1), recipe.id]);
        }
      }
    }
    setCells(next);
    savePlan({ days, selectedSlots, cells: next });
    setTab("plan");
    notify(next.some((cell) => !cell.recipeId) ? "Меню собрано частично: для некоторых условий нет подходящего блюда" : `Меню на ${days} дней готово`);
  }

  function replaceCell(day: number, slot: Recipe["slot"]) {
    const current = cells.find((cell) => cell.day === day && cell.slot === slot)?.recipeId;
    const dayIds = cells.filter((cell) => cell.day === day).map((cell) => cell.recipeId);
    const optionsList = listFor(slot).filter((recipe) => recipe.id !== current && !dayIds.includes(recipe.id));
    if (!optionsList.length) { notify("Другой подходящей замены сейчас нет"); return; }
    const replacement = optionsList[0].id;
    const next = cells.map((cell) => cell.day === day && cell.slot === slot ? { ...cell, recipeId: replacement } : cell);
    setCells(next);
    savePlan({ days, selectedSlots, cells: next });
    notify("Блюдо заменено");
  }

  useEffect(() => {
    if (cells.length) savePlan({ days, selectedSlots, cells });
  }, [days, selectedSlots]);

  const shopping = useMemo(() => {
    const map = new Map<string, { name: string; grams: number; unit: string; used: number }>();
    cells.forEach((cell) => {
      const recipe = recipes.find((item) => item.id === cell.recipeId);
      if (!recipe) return;
      recipe.ingredients.forEach((item) => {
        if (item.id === "water" || foodMatches(item.id, profile.pantry)) return;
        const current = map.get(item.id) || { name: item.name, grams: 0, unit: item.unit || "г", used: 0 };
        current.grams += item.grams;
        current.used += 1;
        map.set(item.id, current);
      });
    });
    return [...map.entries()].map(([id, value]) => ({ id, ...value })).sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [cells, profile.pantry]);

  return (
    <div className="menu-builder-v3 menu-builder-visual">
      <Heading title="Конструктор меню" sub="1–14 дней · каждый приём пищи сразу видно, можно заменить одно блюдо и собрать покупки" back="nutrition" />
      <section className="menu-setup-card">
        <div className="menu-setup-visual visual-v4" aria-hidden="true"><span className="plate"><i/><b/><em/></span><span className="leaf leaf-a"/><span className="leaf leaf-b"/></div>
        <div className="menu-setup-copy"><p className="eyebrow">ШАГ 1</p><h2>Собираем под ребёнка</h2><p>Возраст, введённые продукты, то, что уже есть дома, скорость приготовления и повторы учитываются до генерации.</p></div>
        <div className="menu-day-pills">{[1,3,7,14].map((value)=><button key={value} className={days===value?"selected":""} onClick={()=>setDays(value)}>{value}<small>{value===1?"день":value<5?"дня":"дней"}</small></button>)}</div>
        <div className="menu-slot-pills">{slots.map((slot,index)=><label key={slot}><input type="checkbox" checked={selectedSlots.includes(slot)} onChange={()=>setSelectedSlots((old)=>old.includes(slot)?old.filter((value)=>value!==slot):[...old,slot])}/><span>{slotNames[index]}</span></label>)}</div>
        <div className="menu-rule-grid">
          <label><input type="checkbox" checked={onlyIntroduced} onChange={(event)=>setOnlyIntroduced(event.target.checked)}/><span><strong>Только введённые</strong><small>Особенно важно до года</small></span></label>
          <label><input type="checkbox" checked={pantryOnly} onChange={(event)=>setPantryOnly(event.target.checked)}/><span><strong>Только из продуктов дома</strong><small>Сверяемся с профилем</small></span></label>
          <label><input type="checkbox" checked={quickOnly} onChange={(event)=>setQuickOnly(event.target.checked)}/><span><strong>Быстро</strong><small>До 20 минут</small></span></label>
          <label><input type="checkbox" checked={avoidRepeats} onChange={(event)=>setAvoidRepeats(event.target.checked)}/><span><strong>Меньше повторов</strong><small>Не ставим одно блюдо подряд</small></span></label>
        </div>
        <details className="menu-exclude"><summary>Исключить продукты только из этого меню</summary><div>{Object.entries(foods).slice(0,36).map(([id,food])=><label key={id}><input type="checkbox" checked={excludedNow.includes(id)} onChange={()=>setExcludedNow((old)=>old.includes(id)?old.filter((value)=>value!==id):[...old,id])}/><span>{food.name}</span></label>)}</div></details>
        <button className="button menu-build-button" onClick={build}>Собрать меню на {days} {days===1?"день":days<5?"дня":"дней"}</button>
      </section>

      {cells.length > 0 && <>
        <div className="menu-result-tabs"><button className={tab==="plan"?"selected":""} onClick={()=>setTab("plan")}>Меню</button><button className={tab==="shopping"?"selected":""} onClick={()=>setTab("shopping")}>Список покупок <span>{shopping.length}</span></button></div>
        {tab === "plan" ? (
          <div className="menu-days-v3">{Array.from({length:days},(_,day)=><section key={day} className="menu-day-v3"><div className="menu-day-title"><span>{day+1}</span><div><small>ДЕНЬ</small><h2>{new Intl.DateTimeFormat("ru-RU",{weekday:"long"}).format(new Date(Date.now()+day*86400000))}</h2></div></div><div className="menu-meals-v3">{selectedSlots.map((slot)=>{const cell=cells.find((item)=>item.day===day&&item.slot===slot);const recipe=recipes.find((item)=>item.id===cell?.recipeId);const slotIndex=slots.indexOf(slot);return <article key={slot} className="menu-meal-v3 visual-meal-v3">{recipe?<><RecipeHeroVisual recipe={recipe} compact/><div className="menu-meal-copy"><small>{slotNames[slotIndex]}</small><h3>{recipe.name}</h3><p>{recipe.minutes} мин · от {recipe.minAge} мес.</p><div><Link to={`recipe/${recipe.id}`} className="text-link">Рецепт и подача →</Link><button onClick={()=>replaceCell(day,slot)}>↻ заменить</button></div></div></>:<div className="menu-empty"><strong>{slotNames[slotIndex]}</strong><p>Нет блюда, которое проходит все выбранные ограничения.</p></div>}</article>})}</div></section>)}</div>
        ) : (
          <section className="shopping-v3"><div className="shopping-hero"><div><p className="eyebrow">СПИСОК ПОКУПОК</p><h2>{shopping.length} позиций</h2><p>То, что отмечено «есть дома», уже исключено.</p></div><div className="shopping-bag" aria-hidden="true"><i/><b/></div></div><div className="shopping-list-v3">{shopping.map((item)=><label key={item.id}><input type="checkbox"/><span><strong>{item.name}</strong><small>{Math.round(item.grams)} {item.unit} · в {item.used} блюд.</small></span></label>)}</div>{!shopping.length&&<Note>Покупать ничего не нужно либо меню пока пустое.</Note>}</section>
        )}
      </>}
      <Note>Конструктор не заменяет лечебную диету. При подтверждённой аллергии, нарушениях роста или заболеваниях ЖКТ индивидуальный план согласуют со специалистом.</Note>
    </div>
  );
}
