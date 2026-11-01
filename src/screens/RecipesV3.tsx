import { useMemo, useState } from "react";
import { Favorite, Heading, Link, Note } from "../components/UI";
import { IngredientVisualList, RecipeHeroVisual, RecipeStepsVisual, TextureVisual } from "../components/RecipeVisuals";
import { recipes, fortnight, slots, slotNames } from "../data/nutrition";
import { useApp } from "../hooks/useApp";
import { eligible } from "../services/menu";
import { months } from "../utils/dates";
import { NotFound } from "./Knowledge";

const categoryMeta = [
  { slot: "breakfast", title: "Завтраки", copy: "Каши, омлеты, творог и мягкие оладьи", mark: "утро" },
  { slot: "lunch", title: "Обеды", copy: "Мясо, рыба, крупы и овощи", mark: "день" },
  { slot: "snack", title: "Полдники", copy: "Фрукты, кисломолочные блюда и перекусы", mark: "перекус" },
  { slot: "dinner", title: "Ужины", copy: "Спокойные тёплые блюда на вечер", mark: "вечер" },
] as const;

export function RecipesV3() {
  const { data } = useApp();
  const [slot, setSlot] = useState("");
  const [safe, setSafe] = useState(false);
  const [query, setQuery] = useState("");
  const age = months(data.profile.birth);
  const list = useMemo(() => recipes.filter((recipe) => {
    const haystack = `${recipe.name} ${recipe.ingredients.map((item) => item.name).join(" ")}`.toLowerCase();
    return (!slot || recipe.slot === slot) && (!safe || (age !== null && eligible(recipe, data.profile, age))) && (!query.trim() || haystack.includes(query.trim().toLowerCase()));
  }), [slot, safe, age, data.profile, query]);

  return (
    <div className="recipes-v3-page recipe-market-page">
      <Heading title="Рецепты для малыша" sub="Большая библиотека блюд на каждый приём пищи" back="nutrition" />
      <section className="recipe-market-hero">
        <div>
          <p className="eyebrow">ВКУСНО · ПОНЯТНО · ПО ВОЗРАСТУ</p>
          <h2>Что приготовить сегодня?</h2>
          <p>Выбирайте готовый рецепт или соберите меню на 1–14 дней под возраст, введённые продукты и то, что есть дома.</p>
          <div className="recipe-market-actions"><Link to="menu-builder" className="button">Собрать меню</Link><Link to="menu" className="secondary">Меню на 14 дней</Link></div>
        </div>
        <div className="recipe-market-food" aria-hidden="true"><span className="market-broccoli">🥦</span><span className="market-zucchini">🥒</span><span className="market-carrot">🥕</span><span className="market-bowl">🥣</span></div>
      </section>

      <div className="recipe-category-grid">
        {categoryMeta.map((category) => {
          const count = recipes.filter((recipe) => recipe.slot === category.slot).length;
          return <button key={category.slot} className={slot === category.slot ? "selected" : ""} onClick={() => setSlot(slot === category.slot ? "" : category.slot)}><small>{category.mark}</small><strong>{category.title}</strong><span>{category.copy}</span><b>{count} рецептов →</b></button>;
        })}
      </div>

      <section className="recipe-library-toolbar">
        <label className="recipe-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти блюдо или продукт" /></label>
        <label className="check-row"><input type="checkbox" checked={safe} onChange={(event) => setSafe(event.target.checked)} /><span>Только подходящие профилю</span></label>
      </section>
      {safe && age === null && <Note>Добавьте дату рождения в профиль, чтобы BabyGuide мог проверить возраст.</Note>}

      <div className="recipe-library-heading"><div><p className="eyebrow">{slot ? slotNames[slots.indexOf(slot as typeof slots[number])] : "ВСЯ БИБЛИОТЕКА"}</p><h2>{slot ? "Выбирайте блюдо" : "Все рецепты"}</h2></div><span>{list.length} блюд</span></div>
      <div className="recipe-grid-v3 recipe-market-grid">
        {list.map((recipe) => <Link key={recipe.id} to={`recipe/${recipe.id}`} className="recipe-card-v3 recipe-market-card"><RecipeHeroVisual recipe={recipe} compact /><div><small>{slotNames[slots.indexOf(recipe.slot)]} · от {recipe.minAge} мес.</small><h3>{recipe.name}</h3><p>{recipe.minutes} мин · {recipe.ingredients.filter((item) => !["water","oil"].includes(item.id)).slice(0,3).map((item) => item.name).join(" · ")}</p><strong>Открыть рецепт →</strong></div></Link>)}
      </div>
      {!list.length && <Note>Под выбранные условия пока нет блюда. Снимите фильтр или измените поиск.</Note>}
      <section className="recipe-builder-banner"><div><p className="eyebrow">КОНСТРУКТОР</p><h2>Не хотите выбирать по одному?</h2><p>BabyGuide сам распределит завтраки, обеды, полдники и ужины по дням и соберёт список покупок.</p></div><Link to="menu-builder" className="button">Открыть конструктор →</Link></section>
    </div>
  );
}

export function RecipeDetailV3({ id }: { id: string }) {
  const { data } = useApp();
  const recipe = recipes.find((item) => item.id === id);
  if (!recipe) return <NotFound />;
  const age = months(data.profile.birth);
  const allowed = age === null || eligible(recipe, data.profile, age);
  return <div className="recipe-detail-v3"><Heading title={recipe.name} sub={`От ${recipe.minAge} мес. · ${recipe.minutes} минут`} back="recipes"/><RecipeHeroVisual recipe={recipe}/><div className="recipe-v3-actions"><Favorite id={recipe.id}/><Link to="menu-builder" className="secondary">Добавить идею в меню →</Link></div>{!allowed&&<Note danger>Это блюдо не проходит текущие возрастные или пищевые ограничения профиля. Используйте рецепт только после проверки состава и индивидуальных ограничений.</Note>}<section className="recipe-v3-section"><p className="eyebrow">01 · СОСТАВ</p><h2>Что будет на тарелке</h2><IngredientVisualList ingredients={recipe.ingredients}/><p className="small muted">Количество — ориентир до приготовления. Ребёнок сам определяет, сколько съесть; до года молочное питание сохраняет важную роль.</p></section><section className="recipe-v3-section alt"><p className="eyebrow">02 · ГОТОВИМ</p><h2>Шаги с визуальными подсказками</h2><RecipeStepsVisual steps={recipe.steps}/></section><section className="recipe-v3-section"><p className="eyebrow">03 · ТЕКСТУРА</p><h2>Как должна выглядеть подача</h2><TextureVisual recipe={recipe}/><div className="recipe-serving-box"><strong>Для этого блюда</strong><p>{recipe.texture}. {recipe.serving}</p></div><Link to="safe-food" className="secondary">Открыть визуальный гид по безопасной подаче →</Link></section><section className="recipe-v3-section alt recipe-safety-grid"><article><p className="eyebrow">АЛЛЕРГЕНЫ</p><h3>{recipe.allergens.length?recipe.allergens.join(", "):"Основные не указаны"}</h3><p>Проверяйте этикетки и перекрёстные контакты. Новые аллергены лучше вводить так, чтобы реакцию можно было отследить.</p></article><article><p className="eyebrow">ЗАМЕНЫ</p><h3>Если продукта нет</h3><p>{recipe.substitutions}</p></article></section><Note>Мягкость проверяют перед подачей: пища должна легко раздавливаться между пальцами там, где это предполагает рецепт.</Note></div>;
}

export function FortnightV3() {
  const { data, update } = useApp(); const [day,setDay]=useState(0);
  return <div className="fortnight-v3-page"><Heading title="Меню на 14 дней" sub="Каждое блюдо открывается как полный рецепт" back="nutrition"/><Note>Это пример разнообразного рациона, а не индивидуальная лечебная схема. Для персонального меню используйте конструктор.</Note><Link to="menu-builder" className="button">Собрать меню под ребёнка →</Link><div className="days visual-days">{fortnight.map((_,index)=><button key={index} className={"day "+(day===index?"selected":"")} onClick={()=>setDay(index)}><small>ДЕНЬ</small>{index+1}{data.menuDone.includes(index)&&<span>✓</span>}</button>)}</div><section className="fortnight-day-v3"><div className="section-title"><div><p className="eyebrow">ДЕНЬ {day+1}</p><h2>Что приготовить</h2></div><button className="secondary" onClick={()=>update((current)=>({...current,menuDone:current.menuDone.includes(day)?current.menuDone.filter((value)=>value!==day):[...current.menuDone,day]}))}>{data.menuDone.includes(day)?"✓ Приготовили":"Отметить день"}</button></div><div className="fortnight-meals-v3">{fortnight[day].map((recipeId,index)=>{const recipe=recipes.find((item)=>item.id===recipeId);if(!recipe)return null;return <Link key={`${recipeId}-${index}`} to={`recipe/${recipeId}`} className="fortnight-meal-v3"><div className="recipe-menu-visual"><RecipeHeroVisual recipe={recipe} compact/></div><div><small>{slotNames[index]}</small><h3>{recipe.name}</h3><p>{recipe.minutes} мин · состав, текстура и подача</p></div><b>›</b></Link>})}</div></section></div>;
}
