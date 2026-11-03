import { useMemo, useState } from "react";
import { Heading, Link, Note } from "../components/UI";
import { FoodVisual, MealPlateVisual } from "../components/FoodVisuals";
import { foods } from "../data/nutrition";
import { candidates, foodMatches } from "../services/menu";
import { useApp } from "../hooks/useApp";
import { months } from "../utils/dates";
import type { Recipe } from "../types";

type MealSlot = "breakfast" | "snack" | "lunch" | "afternoon" | "dinner";
type DailyPlan = Partial<Record<MealSlot, string[]>>;

type MealMeta = {
  id: MealSlot;
  label: string;
  visualId: string;
  recipeSlot: Recipe["slot"];
};

const DAILY_PLAN_STORAGE = "babyguide.daily-meals.v1";
const mealSlots: MealMeta[] = [
  { id: "breakfast", label: "Завтрак", visualId: "oats", recipeSlot: "breakfast" },
  { id: "snack", label: "Перекус", visualId: "pear", recipeSlot: "snack" },
  { id: "lunch", label: "Обед", visualId: "chicken", recipeSlot: "lunch" },
  { id: "afternoon", label: "Полдник", visualId: "yogurt", recipeSlot: "snack" },
  { id: "dinner", label: "Ужин", visualId: "zucchini", recipeSlot: "dinner" },
];

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

function uniqueRecipes(items: Recipe[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function NutritionHomeV3() {
  const { data, notify } = useApp();
  const age = months(data.profile.birth);
  const introduced = data.profile.introduced.length;
  const [mealSlot, setMealSlot] = useState<MealSlot>("lunch");
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>(() => loadDailyPlan());
  const region = data.travelCity?.region || data.profile.region;

  const readyMeals = useMemo(() => {
    if (age === null) return [] as { meta: MealMeta; recipe: Recipe | null }[];
    const preferIntroduced = age < 12 && data.profile.introduced.length > 0;
    const listFor = (slot: Recipe["slot"]) => {
      const strict = candidates(data.profile, age, slot, { onlyIntroduced: preferIntroduced, region });
      const relaxed = preferIntroduced ? candidates(data.profile, age, slot, { onlyIntroduced: false, region }) : [];
      return uniqueRecipes([...strict, ...relaxed]);
    };
    const breakfast = listFor("breakfast");
    const snacks = listFor("snack");
    const lunch = listFor("lunch");
    const dinner = listFor("dinner");
    return mealSlots.map((meta) => {
      const source = meta.id === "breakfast" ? breakfast : meta.id === "lunch" ? lunch : meta.id === "dinner" ? dinner : snacks;
      const index = meta.id === "afternoon" ? 1 : 0;
      return { meta, recipe: source[index] || source[0] || null };
    });
  }, [age, data.profile, region]);

  const ageIdeas = useMemo(() => readyMeals.map((item) => item.recipe).filter(Boolean).slice(0, 3) as Recipe[], [readyMeals]);

  const availableBuilderFoodIds = useMemo(() => {
    const pantry = builderFoodIds.filter((id) => foodMatches(id, data.profile.pantry));
    if (pantry.length) return pantry;
    const introducedFoods = builderFoodIds.filter((id) => foodMatches(id, data.profile.introduced));
    return introducedFoods.length ? introducedFoods : builderFoodIds;
  }, [data.profile.pantry, data.profile.introduced]);

  const builderSourceLabel = data.profile.pantry.length
    ? "Показываем продукты из списка «Есть дома»"
    : data.profile.introduced.length
      ? "Список «Есть дома» пуст — показываем введённые продукты"
      : "Добавьте продукты в профиль, чтобы конструктор показывал только то, что есть дома";

  const suggestedRecipe = useMemo(() => {
    if (!selectedFoods.length || age === null) return null;
    const targetSlot = mealSlot === "afternoon" ? "snack" : mealSlot;
    return candidates(data.profile, age, targetSlot, { onlyIntroduced: false, region })
      .map((recipe) => {
        const ids = recipe.ingredients.map((item) => item.id);
        const matches = selectedFoods.filter((id) => ids.includes(id)).length;
        const exact = selectedFoods.every((id) => ids.includes(id));
        return { recipe, matches, exact };
      })
      .filter((item) => item.matches > 0)
      .sort((a, b) => Number(b.exact) - Number(a.exact) || b.matches - a.matches || a.recipe.minutes - b.recipe.minutes)[0]?.recipe || null;
  }, [age, data.profile, mealSlot, region, selectedFoods]);

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
      <Heading title="Питание" sub="Готовый рацион по возрасту — сразу. Конструктор из своих продуктов — когда нужен." back="home" />
      <section className="nutrition-hero-v3">
        <div className="nutrition-hero-copy">
          <p className="eyebrow">ПЕРСОНАЛЬНО ДЛЯ РЕБЁНКА</p>
          <h1>{age===null?"Укажите дату рождения":`${age} месяцев`}</h1>
          <p>{age===null?"После сохранения даты рождения здесь автоматически появится рацион, подходящий по возрасту.":age<6?"Основное питание — грудное молоко и/или смесь. Блюда прикорма ниже показываются только как ориентир на этап готовности.":"Готовый рацион ниже подобран по возрасту из настроек и учитывает ограничения профиля."}</p>
          <div className="nutrition-hero-stats"><span><b>{introduced}</b><small>введено продуктов</small></span><span><b>{data.profile.allergies.length}</b><small>аллергий в профиле</small></span><span><b>{data.profile.pantry.length}</b><small>есть дома</small></span></div>
        </div>
        <MealPlateVisual foods={["carrot","chicken","zucchini"]} className="hero-real-plate" label="Тарелка с морковью, курицей и кабачком" />
      </section>

      <section className="ready-ration-v5">
        <div className="section-title">
          <div><p className="eyebrow">РАЦИОН НА СЕГОДНЯ</p><h2>{age===null?"Сначала укажите возраст":"5 приёмов пищи по возрасту"}</h2></div>
          {age!==null&&<span className="age-ration-badge">для {age} мес.</span>}
        </div>
        {age===null ? (
          <div className="ration-empty-v5"><p>Дата рождения не заполнена — без неё приложение не будет угадывать возраст ребёнка.</p><Link to="profile" className="button">Открыть настройки ребёнка</Link></div>
        ) : (
          <>
            <div className="ready-ration-grid-v5">{readyMeals.map(({meta,recipe})=><article key={meta.id} className="ready-meal-card-v5">
              <div className="ready-meal-visual-v5">{recipe?<MealPlateVisual foods={recipe.ingredients.filter((item)=>!["water","oil"].includes(item.id)).slice(0,3).map((item)=>item.id)} label={recipe.name}/>:<FoodVisual id={meta.visualId}/>}</div>
              <div className="ready-meal-copy-v5"><small>{meta.label}</small>{recipe?<><h3>{recipe.name}</h3><p>{recipe.minutes} мин · от {recipe.minAge} мес.</p><Link to={`recipe/${recipe.id}`} className="text-link">Рецепт и подача →</Link></>:<><h3>Нет подходящего блюда</h3><p>Проверьте ограничения и введённые продукты в профиле.</p></>}</div>
            </article>)}</div>
            <p className="ration-profile-note-v5">Рекомендации формируются по возрасту из настроек, а также учитывают аллергии, исключённые продукты и тип питания. До года при заполненном списке введённых продуктов они получают приоритет.</p>
          </>
        )}
      </section>

      <details className="meal-composer-v4 meal-composer-optional-v5">
        <summary><span><b>Собрать из своих продуктов</b><small>Дополнительная опция — если хотите заменить готовый вариант</small></span><i>+</i></summary>
        <div className="meal-composer-inner-v5">
          <div className="section-title"><div><p className="eyebrow">КОНСТРУКТОР БЛЮДА</p><h2>Выберите то, что уже есть</h2></div><p className="meal-composer-hint">Например: морковь + курица + кабачок</p></div>
          <p className="builder-source-v5">{builderSourceLabel}</p>
          <div className="meal-slot-tabs-v4" role="tablist" aria-label="Приём пищи">{mealSlots.map((item)=><button key={item.id} className={mealSlot===item.id?"selected":""} onClick={()=>setMealSlot(item.id)}><FoodVisual id={item.visualId}/><span>{item.label}</span></button>)}</div>
          <div className="meal-composer-grid-v4">
            <div className="meal-preview-card-v4">
              <MealPlateVisual foods={previewFoods} label={selectedFoods.length?joinNames(selectedFoods):"Пример тарелки"}/>
              <small>{mealLabel(mealSlot)}</small>
              <h3>{selectedFoods.length ? joinNames(selectedFoods) : "Выберите продукты для блюда"}</h3>
              <p>{selectedFoods.length ? (suggestedRecipe ? `Подходящий по возрасту рецепт: ${suggestedRecipe.name}` : "Из выбранных продуктов можно собрать простую мягкую тарелку; текстуру адаптируйте навыкам ребёнка.") : "Нажимайте на продукты справа — они сразу появятся на тарелке."}</p>
              {suggestedRecipe && <Link to={`recipe/${suggestedRecipe.id}`} className="text-link">Открыть рецепт →</Link>}
            </div>
            <div className="meal-food-picker-v4">
              <div className="meal-food-picker-head"><div><strong>Ваши продукты</strong><small>Можно выбрать до 6</small></div>{selectedFoods.length>0&&<button onClick={()=>setSelectedFoods([])}>Очистить</button>}</div>
              <div className="meal-food-grid-v4">{availableBuilderFoodIds.map((id)=>{const food=foods[id];const selected=selectedFoods.includes(id);const introducedNow=foodMatches(id,data.profile.introduced);return <button key={id} className={selected?"selected":""} onClick={()=>toggleFood(id)} aria-pressed={selected}><FoodVisual id={id}/><strong>{food?.name || id}</strong>{introducedNow&&<small>введён</small>}</button>})}</div>
              {availableBuilderFoodIds.length===0&&<Note>В профиле пока нет продуктов, которые можно показать в конструкторе.</Note>}
              <button className="button meal-save-button-v4" onClick={addToDay}>Добавить в «{mealLabel(mealSlot)}»</button>
            </div>
          </div>
          {Object.keys(dailyPlan).length>0&&<div className="five-meals-v4"><div className="five-meals-title"><strong>Ваши замены на сегодня</strong><small>сохраняются на устройстве</small></div><div className="five-meals-grid-v4">{mealSlots.map((item)=>{const ids=dailyPlan[item.id]||[];return <article key={item.id} className={ids.length?"filled":""}><div className="five-meal-head"><FoodVisual id={item.visualId}/><div><small>{item.label}</small><strong>{ids.length?joinNames(ids):"Без замены"}</strong></div></div>{ids.length>0&&<div className="five-meal-foods">{ids.slice(0,4).map((id)=><FoodVisual key={id} id={id} title={foods[id]?.name}/>)}</div>}{ids.length>0&&<button onClick={()=>clearMeal(item.id)}>Удалить замену</button>}</article>})}</div></div>}
        </div>
      </details>

      <section className="nutrition-action-grid-v3">
        <Link to="menu-builder" className="nutrition-action-card main"><div className="nutrition-action-art action-real-food-v5"><MealPlateVisual foods={["carrot","chicken","zucchini"]}/></div><small>ПЛАНИРОВАНИЕ</small><h2>Меню на несколько дней</h2><p>1, 3, 7 или 14 дней · пять приёмов пищи · меньше повторов · список покупок.</p><strong>Открыть планировщик →</strong></Link>
        <Link to="safe-food" className="nutrition-action-card"><div className="nutrition-action-art action-real-food-single-v5"><FoodVisual id="carrot"/></div><small>БЕЗОПАСНАЯ ПОДАЧА</small><h2>Размер и текстура</h2><p>Как менять форму еды по навыкам ребёнка.</p></Link>
        <Link to="recipes" className="nutrition-action-card"><div className="nutrition-action-art action-real-food-single-v5"><FoodVisual id="oats"/></div><small>РЕЦЕПТЫ</small><h2>Что приготовить</h2><p>Фильтр по возрасту, времени и ограничениям.</p></Link>
        <Link to="profile" className="nutrition-action-card"><div className="nutrition-action-art pantry-real-v5"><FoodVisual id="pear"/><FoodVisual id="zucchini"/></div><small>ПРОФИЛЬ</small><h2>Продукты дома</h2><p>Введённые, любимые, исключённые и запасы.</p></Link>
      </section>

      {ageIdeas.length>0&&<section className="nutrition-sample-v3"><div className="section-title"><div><p className="eyebrow">ЕЩЁ ИДЕИ ПО ВОЗРАСТУ</p><h2>Подходящие блюда</h2></div><Link to="recipes" className="text-link">Все рецепты →</Link></div><div className="nutrition-sample-grid">{ageIdeas.map((recipe)=><Link to={`recipe/${recipe.id}`} key={recipe.id} className="nutrition-sample-card"><div className="sample-food-visual-v5"><MealPlateVisual foods={recipe.ingredients.filter((item)=>!["water","oil"].includes(item.id)).slice(0,3).map((item)=>item.id)} label={recipe.name}/></div><small>{recipe.slot==='breakfast'?"Завтрак":recipe.slot==='lunch'?"Обед":recipe.slot==='snack'?"Перекус":"Ужин"}</small><h3>{recipe.name}</h3><p>{recipe.minutes} мин · от {recipe.minAge} мес.</p></Link>)}</div></section>}

      <Note>До года грудное молоко и/или смесь обычно остаются основой питания. Готовый рацион в приложении — ориентир по возрасту и профилю, а не обязательный объём еды.</Note>
    </div>
  );
}
