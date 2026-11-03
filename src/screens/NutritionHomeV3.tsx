import { useMemo, useState } from "react";
import { Heading, Link, Note } from "../components/UI";
import { foods, recipes } from "../data/nutrition";
import { useApp } from "../hooks/useApp";
import { months } from "../utils/dates";

type MealSlot = "breakfast" | "snack" | "lunch" | "afternoon" | "dinner";
type DailyPlan = Partial<Record<MealSlot, string[]>>;

const DAILY_PLAN_STORAGE = "babyguide.daily-meals.v1";
const mealSlots: { id: MealSlot; label: string; icon: string }[] = [
  { id: "breakfast", label: "Завтрак", icon: "🥣" },
  { id: "snack", label: "Перекус", icon: "🍐" },
  { id: "lunch", label: "Обед", icon: "🍲" },
  { id: "afternoon", label: "Полдник", icon: "🥛" },
  { id: "dinner", label: "Ужин", icon: "🍽️" },
];

const foodEmoji: Record<string, string> = {
  oats: "🥣", buckwheat: "🌾", rice: "🍚", millet: "🌾", bulgur: "🌾", pasta: "🍝", bread: "🍞", flour: "🌾",
  potato: "🥔", carrot: "🥕", zucchini: "🥒", pumpkin: "🎃", broccoli: "🥦", cauliflower: "🥦", tomato: "🍅", cucumber: "🥒",
  peas: "🫛", lentil: "🫘", beans: "🫘", chickpea: "🫘", tofu: "◻️", turkey: "🍗", chicken: "🍗", beef: "🥩", fish: "🐟", salmon: "🐟",
  egg: "🥚", curd: "🥣", yogurt: "🥛", kefir: "🥛", milk: "🥛", pear: "🍐", apple: "🍎", banana: "🍌", peach: "🍑", berries: "🫐",
  avocado: "🥑", oil: "🫒", water: "💧",
};

const builderFoodIds = [
  "carrot", "zucchini", "broccoli", "cauliflower", "pumpkin", "potato", "chicken", "turkey", "beef", "fish", "egg", "rice", "buckwheat", "oats", "curd", "yogurt", "pear", "apple", "banana", "avocado",
];

function loadDailyPlan(): DailyPlan {
  try {
    const raw = localStorage.getItem(DAILY_PLAN_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDailyPlan(plan: DailyPlan) {
  try { localStorage.setItem(DAILY_PLAN_STORAGE, JSON.stringify(plan)); } catch {}
}

function joinNames(ids: string[]) {
  const names = ids.map((id) => foods[id]?.name || id.toLowerCase());
  if (names.length <= 1) return names[0] || "";
  return `${names.slice(0, -1).join(", ")} и ${names[names.length - 1]}`;
}

function mealLabel(slot: MealSlot) {
  return mealSlots.find((item) => item.id === slot)?.label || slot;
}

export function NutritionHomeV3() {
  const { data, notify } = useApp();
  const age = months(data.profile.birth);
  const introduced = data.profile.introduced.length;
  const sample = recipes.filter((recipe)=>age===null || age>=recipe.minAge).slice(0,3);
  const [mealSlot, setMealSlot] = useState<MealSlot>("lunch");
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>(() => loadDailyPlan());

  const suggestedRecipe = useMemo(() => {
    if (!selectedFoods.length) return null;
    const targetSlot = mealSlot === "afternoon" ? "snack" : mealSlot;
    return recipes
      .filter((recipe) => recipe.slot === targetSlot && (age === null || age >= recipe.minAge))
      .map((recipe) => {
        const ids = recipe.ingredients.map((item) => item.id);
        const matches = selectedFoods.filter((id) => ids.includes(id)).length;
        const exact = selectedFoods.every((id) => ids.includes(id));
        return { recipe, matches, exact };
      })
      .filter((item) => item.matches > 0)
      .sort((a, b) => Number(b.exact) - Number(a.exact) || b.matches - a.matches || a.recipe.minutes - b.recipe.minutes)[0]?.recipe || null;
  }, [age, mealSlot, selectedFoods]);

  function toggleFood(id: string) {
    setSelectedFoods((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(-6));
  }

  function addToDay() {
    if (!selectedFoods.length) {
      notify("Выберите хотя бы один продукт для блюда");
      return;
    }
    const next = { ...dailyPlan, [mealSlot]: selectedFoods };
    setDailyPlan(next);
    saveDailyPlan(next);
    notify(`Блюдо добавлено: ${mealLabel(mealSlot).toLowerCase()}`);
  }

  function clearMeal(slot: MealSlot) {
    const next = { ...dailyPlan };
    delete next[slot];
    setDailyPlan(next);
    saveDailyPlan(next);
  }

  const previewFoods = selectedFoods.length ? selectedFoods : ["carrot", "chicken", "zucchini"];

  return (
    <div className="nutrition-home-v3">
      <Heading title="Питание" sub="Пять приёмов пищи, конструктор блюда, безопасная подача и рецепты — в одном месте" back="home" />
      <section className="nutrition-hero-v3">
        <div className="nutrition-hero-copy"><p className="eyebrow">СЕЙЧАС</p><h1>{age===null?"Настройте возраст":`${age} месяцев`}</h1><p>{age!==null&&age<6?"Основное питание — молочное. Раздел прикорма используйте для подготовки к готовности.":"Смотрим на готовность, безопасную текстуру и разнообразие, а не на идеальную граммовку."}</p><div className="nutrition-hero-stats"><span><b>{introduced}</b><small>введено продуктов</small></span><span><b>{data.profile.allergies.length}</b><small>аллергий в профиле</small></span><span><b>{data.profile.pantry.length}</b><small>есть дома</small></span></div></div>
        <div className="nutrition-real-plate hero-real-plate" aria-hidden="true"><span className="dish">🍽️</span><span className="food food-a">🥕</span><span className="food food-b">🍗</span><span className="food food-c">🥒</span></div>
      </section>

      <section className="meal-composer-v4">
        <div className="section-title"><div><p className="eyebrow">КОНСТРУКТОР ПИТАНИЯ</p><h2>Соберите блюдо из того, что есть</h2></div><p className="meal-composer-hint">Например: морковь + курица + кабачок</p></div>
        <div className="meal-slot-tabs-v4" role="tablist" aria-label="Приём пищи">{mealSlots.map((item)=><button key={item.id} className={mealSlot===item.id?"selected":""} onClick={()=>setMealSlot(item.id)}><span>{item.icon}</span>{item.label}</button>)}</div>
        <div className="meal-composer-grid-v4">
          <div className="meal-preview-card-v4">
            <div className="meal-preview-plate-v4" aria-label="Визуал выбранных продуктов"><span className="plate-emoji">🍽️</span>{previewFoods.slice(0,6).map((id,index)=><span key={`${id}-${index}`} className={`ingredient-emoji ingredient-${index+1}`}>{foodEmoji[id] || "🍴"}</span>)}</div>
            <small>{mealLabel(mealSlot)}</small>
            <h3>{selectedFoods.length ? joinNames(selectedFoods) : "Выберите продукты для блюда"}</h3>
            <p>{selectedFoods.length ? (suggestedRecipe ? `Похожий готовый рецепт: ${suggestedRecipe.name}` : "Можно собрать простую мягкую тарелку из выбранных продуктов.") : "Нажимайте на продукты справа — они сразу появятся на тарелке."}</p>
            {suggestedRecipe && <Link to={`recipe/${suggestedRecipe.id}`} className="text-link">Открыть похожий рецепт →</Link>}
          </div>
          <div className="meal-food-picker-v4">
            <div className="meal-food-picker-head"><div><strong>Продукты</strong><small>Можно выбрать до 6</small></div>{selectedFoods.length>0&&<button onClick={()=>setSelectedFoods([])}>Очистить</button>}</div>
            <div className="meal-food-grid-v4">{builderFoodIds.map((id)=>{const food=foods[id];const selected=selectedFoods.includes(id);const introducedNow=data.profile.introduced.includes(id);return <button key={id} className={selected?"selected":""} onClick={()=>toggleFood(id)} aria-pressed={selected}><span>{foodEmoji[id] || "🍴"}</span><strong>{food?.name || id}</strong>{introducedNow&&<small>введён</small>}</button>})}</div>
            <button className="button meal-save-button-v4" onClick={addToDay}>Добавить в «{mealLabel(mealSlot)}»</button>
          </div>
        </div>
        <div className="five-meals-v4"><div className="five-meals-title"><strong>Рацион на сегодня</strong><small>5 приёмов пищи</small></div><div className="five-meals-grid-v4">{mealSlots.map((item)=>{const ids=dailyPlan[item.id]||[];return <article key={item.id} className={ids.length?"filled":""}><div className="five-meal-head"><span>{item.icon}</span><div><small>{item.label}</small><strong>{ids.length?joinNames(ids):"Не собрано"}</strong></div></div>{ids.length>0&&<div className="five-meal-foods">{ids.slice(0,5).map((id)=><span key={id} title={foods[id]?.name}>{foodEmoji[id]||"🍴"}</span>)}</div>}{ids.length>0&&<button onClick={()=>clearMeal(item.id)}>Удалить</button>}</article>})}</div></div>
      </section>

      <section className="nutrition-action-grid-v3">
        <Link to="menu-builder" className="nutrition-action-card main"><div className="nutrition-action-art action-food-emoji"><span>🍽️</span><i>🥕</i><b>🍗</b></div><small>МЕНЮ НА НЕСКОЛЬКО ДНЕЙ</small><h2>Собрать меню</h2><p>1, 3, 7 или 14 дней · пять приёмов пищи · меньше повторов · список покупок.</p><strong>Открыть конструктор →</strong></Link>
        <Link to="safe-food" className="nutrition-action-card"><div className="nutrition-action-art action-food-single">🥕</div><small>БЕЗОПАСНАЯ ПОДАЧА</small><h2>Размер и текстура</h2><p>Как менять форму еды по навыкам ребёнка.</p></Link>
        <Link to="recipes" className="nutrition-action-card"><div className="nutrition-action-art action-food-single">🥣</div><small>РЕЦЕПТЫ</small><h2>Что приготовить</h2><p>Фильтр по возрасту, времени и ограничениям.</p></Link>
        <Link to="profile" className="nutrition-action-card"><div className="nutrition-action-art action-food-single">🧺</div><small>ПРОФИЛЬ</small><h2>Продукты дома</h2><p>Введённые, любимые, исключённые и запасы.</p></Link>
      </section>

      <section className="nutrition-sample-v3"><div className="section-title"><div><p className="eyebrow">ИДЕИ СЕЙЧАС</p><h2>Три подходящих блюда</h2></div><Link to="recipes" className="text-link">Все рецепты →</Link></div><div className="nutrition-sample-grid">{sample.map((recipe)=><Link to={`recipe/${recipe.id}`} key={recipe.id} className="nutrition-sample-card"><div className="sample-food-visual-v4" aria-hidden="true"><span className="sample-main-emoji">{recipe.icon}</span><div>{recipe.ingredients.slice(0,3).map((item)=><span key={item.id}>{foodEmoji[item.id]||"🍴"}</span>)}</div></div><small>{recipe.slot==='breakfast'?"Завтрак":recipe.slot==='lunch'?"Обед":recipe.slot==='snack'?"Перекус":"Ужин"}</small><h3>{recipe.name}</h3><p>{recipe.minutes} мин · от {recipe.minAge} мес.</p></Link>)}</div></section>

      <section className="nutrition-flow-v3"><p className="eyebrow">КАК ПОЛЬЗОВАТЬСЯ</p><h2>Три шага вместо десяти разделов</h2><div><article><span>1</span><strong>Выбрать приём пищи</strong><p>Завтрак, перекус, обед, полдник или ужин.</p></article><i>→</i><article><span>2</span><strong>Собрать блюдо</strong><p>Добавить продукты, которые уже есть дома и подходят ребёнку.</p></article><i>→</i><article><span>3</span><strong>Сохранить в рацион</strong><p>Тарелка останется в одном из пяти приёмов пищи на сегодня.</p></article></div></section>
      <Note>До года основное питание обычно остаётся грудным молоком и/или смесью. Количество прикорма и текстура зависят от готовности и индивидуальной ситуации ребёнка.</Note>
    </div>
  );
}
