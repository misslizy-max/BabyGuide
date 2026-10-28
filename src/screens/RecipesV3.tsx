import { useState } from "react";
import { Favorite, Heading, Link, Note } from "../components/UI";
import {
  IngredientVisualList,
  RecipeHeroVisual,
  RecipeStepsVisual,
  TextureVisual,
} from "../components/RecipeVisuals";
import { recipes, fortnight, slots, slotNames } from "../data/nutrition";
import { useApp } from "../hooks/useApp";
import { eligible } from "../services/menu";
import { months } from "../utils/dates";
import { NotFound } from "./Knowledge";

export function RecipesV3() {
  const { data } = useApp();
  const [slot, setSlot] = useState("");
  const [safe, setSafe] = useState(false);
  const age = months(data.profile.birth);
  const list = recipes.filter(
    (recipe) =>
      (!slot || recipe.slot === slot) &&
      (!safe || (age !== null && eligible(recipe, data.profile, age))),
  );

  return (
    <div className="recipes-v3-page">
      <Heading
        title="Рецепты"
        sub="Каждое блюдо — с иллюстрацией состава, текстуры, подачи и пошагового приготовления"
        back="nutrition"
      />
      <section className="recipe-library-hero">
        <div className="recipe-library-art" aria-hidden="true">
          <span className="bowl"><i /><b /><em /></span>
          <span className="spoon" />
          <span className="leaf l1" /><span className="leaf l2" />
        </div>
        <div>
          <p className="eyebrow">ВИЗУАЛЬНАЯ БИБЛИОТЕКА</p>
          <h2>Сначала видно, потом читаем</h2>
          <p>На карточке видно само блюдо. Внутри — ингредиенты, приготовление и схема текстуры, а не декоративная иконка.</p>
        </div>
      </section>
      <div className="filter-panel recipe-filter-v3">
        <label>
          Приём пищи
          <select value={slot} onChange={(event) => setSlot(event.target.value)}>
            <option value="">Все блюда</option>
            {slots.map((item, index) => <option value={item} key={item}>{slotNames[index]}</option>)}
          </select>
        </label>
        <label className="check-row">
          <input type="checkbox" checked={safe} onChange={(event) => setSafe(event.target.checked)} />
          <span>Только подходящие профилю</span>
        </label>
      </div>
      {safe && age === null && <Note>Добавьте дату рождения в профиль, чтобы BabyGuide мог проверить возраст.</Note>}
      <div className="recipe-grid-v3">
        {list.map((recipe) => (
          <Link key={recipe.id} to={`recipe/${recipe.id}`} className="recipe-card-v3">
            <RecipeHeroVisual recipe={recipe} compact />
            <div>
              <small>{slotNames[slots.indexOf(recipe.slot)]} · от {recipe.minAge} мес.</small>
              <h3>{recipe.name}</h3>
              <p>{recipe.minutes} мин · {recipe.ingredients.filter((item) => !["water","oil"].includes(item.id)).slice(0,3).map((item) => item.name).join(" · ")}</p>
              <strong>Открыть визуальный рецепт →</strong>
            </div>
          </Link>
        ))}
      </div>
      {!list.length && <Note>Под выбранные условия пока нет блюда. Измените фильтр или проверьте профиль.</Note>}
    </div>
  );
}

export function RecipeDetailV3({ id }: { id: string }) {
  const { data } = useApp();
  const recipe = recipes.find((item) => item.id === id);
  if (!recipe) return <NotFound />;
  const age = months(data.profile.birth);
  const allowed = age === null || eligible(recipe, data.profile, age);

  return (
    <div className="recipe-detail-v3">
      <Heading
        title={recipe.name}
        sub={`От ${recipe.minAge} мес. · ${recipe.minutes} минут`}
        back="recipes"
      />
      <RecipeHeroVisual recipe={recipe} />
      <div className="recipe-v3-actions"><Favorite id={recipe.id}/><Link to="menu-builder" className="secondary">Добавить идею в меню →</Link></div>
      {!allowed && <Note danger>Это блюдо не проходит текущие возрастные или пищевые ограничения профиля. Используйте рецепт только после проверки состава и индивидуальных ограничений.</Note>}

      <section className="recipe-v3-section">
        <p className="eyebrow">01 · СОСТАВ</p>
        <h2>Что будет на тарелке</h2>
        <IngredientVisualList ingredients={recipe.ingredients} />
        <p className="small muted">Количество — ориентир до приготовления. Ребёнок сам определяет, сколько съесть; до года молочное питание сохраняет важную роль.</p>
      </section>

      <section className="recipe-v3-section alt">
        <p className="eyebrow">02 · ГОТОВИМ</p>
        <h2>Шаги с визуальными подсказками</h2>
        <RecipeStepsVisual steps={recipe.steps} />
      </section>

      <section className="recipe-v3-section">
        <p className="eyebrow">03 · ТЕКСТУРА</p>
        <h2>Как должна выглядеть подача</h2>
        <TextureVisual recipe={recipe} />
        <div className="recipe-serving-box"><strong>Для этого блюда</strong><p>{recipe.texture}. {recipe.serving}</p></div>
        <Link to="safe-food" className="secondary">Открыть визуальный гид по безопасной подаче →</Link>
      </section>

      <section className="recipe-v3-section alt recipe-safety-grid">
        <article><p className="eyebrow">АЛЛЕРГЕНЫ</p><h3>{recipe.allergens.length ? recipe.allergens.join(", ") : "Основные не указаны"}</h3><p>Проверяйте этикетки и перекрёстные контакты. Новые аллергены лучше вводить так, чтобы реакцию можно было отследить.</p></article>
        <article><p className="eyebrow">ЗАМЕНЫ</p><h3>Если продукта нет</h3><p>{recipe.substitutions}</p></article>
      </section>
      <Note>Мягкость проверяют перед подачей: пища должна легко раздавливаться между пальцами там, где это предполагает рецепт. Круглые твёрдые продукты, целые орехи и плотные комки требуют отдельной безопасной подготовки.</Note>
    </div>
  );
}

export function FortnightV3() {
  const { data, update } = useApp();
  const [day, setDay] = useState(0);
  return (
    <div className="fortnight-v3-page">
      <Heading title="Меню на 14 дней" sub="Визуальная библиотека идей · каждое блюдо открывается как полный рецепт" back="nutrition" />
      <Note>Это пример разнообразного рациона, а не индивидуальная лечебная схема. Для персонального меню по возрасту, введённым продуктам и ограничениям используйте конструктор.</Note>
      <Link to="menu-builder" className="button">Собрать меню под ребёнка →</Link>
      <div className="days visual-days">
        {fortnight.map((_, index) => (
          <button key={index} className={"day " + (day === index ? "selected" : "")} onClick={() => setDay(index)} aria-pressed={day === index}>
            <small>ДЕНЬ</small>{index + 1}{data.menuDone.includes(index) && <span>✓</span>}
          </button>
        ))}
      </div>
      <section className="fortnight-day-v3">
        <div className="section-title">
          <div><p className="eyebrow">ДЕНЬ {day + 1}</p><h2>Что приготовить</h2></div>
          <button className="secondary" aria-pressed={data.menuDone.includes(day)} onClick={() => update((current) => ({...current,menuDone:current.menuDone.includes(day)?current.menuDone.filter((value)=>value!==day):[...current.menuDone,day]}))}>{data.menuDone.includes(day)?"✓ Приготовили":"Отметить день"}</button>
        </div>
        <div className="fortnight-meals-v3">
          {fortnight[day].map((recipeId, index) => {
            const recipe = recipes.find((item) => item.id === recipeId);
            if (!recipe) return null;
            return (
              <Link key={`${recipeId}-${index}`} to={`recipe/${recipeId}`} className="fortnight-meal-v3">
                <div className="recipe-menu-visual"><RecipeHeroVisual recipe={recipe} compact /></div>
                <div><small>{slotNames[index]}</small><h3>{recipe.name}</h3><p>{recipe.minutes} мин · посмотреть состав, текстуру и подачу</p></div>
                <b>›</b>
              </Link>
            );
          })}
        </div>
      </section>
      <div className="age-guide-actions"><Link to="recipes" className="secondary">Все визуальные рецепты</Link><Link to="safe-food" className="secondary">Безопасная подача</Link></div>
    </div>
  );
}
