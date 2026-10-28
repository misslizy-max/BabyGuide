import { Heading, Link, Note } from "../components/UI";
import { recipes } from "../data/nutrition";
import { useApp } from "../hooks/useApp";
import { months } from "../utils/dates";

export function NutritionHomeV3() {
  const { data } = useApp();
  const age = months(data.profile.birth);
  const introduced = data.profile.introduced.length;
  const sample = recipes.filter((recipe)=>age===null || age>=recipe.minAge).slice(0,3);
  return (
    <div className="nutrition-home-v3">
      <Heading title="Питание" sub="Меню, безопасная подача, введённые продукты и рецепты — в одном месте" back="home" />
      <section className="nutrition-hero-v3">
        <div className="nutrition-hero-copy"><p className="eyebrow">СЕЙЧАС</p><h1>{age===null?"Настройте возраст":`${age} месяцев`}</h1><p>{age!==null&&age<6?"Основное питание — молочное. Раздел прикорма используйте для подготовки к готовности.":"Смотрим на готовность, безопасную текстуру и разнообразие, а не на идеальную граммовку."}</p><div className="nutrition-hero-stats"><span><b>{introduced}</b><small>введено продуктов</small></span><span><b>{data.profile.allergies.length}</b><small>аллергий в профиле</small></span><span><b>{data.profile.pantry.length}</b><small>есть дома</small></span></div></div>
        <div className="nutrition-hero-plate" aria-hidden="true"><span className="plate-main"><i/><b/><em/></span><span className="leaf leaf-one"/><span className="leaf leaf-two"/></div>
      </section>

      <section className="nutrition-action-grid-v3">
        <Link to="menu-builder" className="nutrition-action-card main"><div className="nutrition-action-art menu-art"><span/><i/><b/></div><small>ГЛАВНЫЙ ИНСТРУМЕНТ</small><h2>Собрать меню</h2><p>1, 3, 7 или 14 дней · меньше повторов · список покупок.</p><strong>Открыть конструктор →</strong></Link>
        <Link to="safe-food" className="nutrition-action-card"><div className="nutrition-action-art pieces-art"><span/><i/><b/></div><small>БЕЗОПАСНАЯ ПОДАЧА</small><h2>Размер и текстура</h2><p>Как менять форму еды по навыкам ребёнка.</p></Link>
        <Link to="recipes" className="nutrition-action-card"><div className="nutrition-action-art recipe-art"><span/><i/><b/></div><small>РЕЦЕПТЫ</small><h2>Что приготовить</h2><p>Фильтр по возрасту, времени и ограничениям.</p></Link>
        <Link to="profile" className="nutrition-action-card"><div className="nutrition-action-art pantry-art"><span/><i/><b/></div><small>ПРОФИЛЬ</small><h2>Продукты дома</h2><p>Введённые, любимые, исключённые и запасы.</p></Link>
      </section>

      <section className="nutrition-sample-v3"><div className="section-title"><div><p className="eyebrow">ИДЕИ СЕЙЧАС</p><h2>Три подходящих блюда</h2></div><Link to="recipes" className="text-link">Все рецепты →</Link></div><div className="nutrition-sample-grid">{sample.map((recipe,i)=><Link to={`recipe/${recipe.id}`} key={recipe.id} className={`nutrition-sample-card sample-${i}`}><div className="sample-plate" aria-hidden="true"><span/><i/><b/></div><small>{recipe.slot==='breakfast'?"Завтрак":recipe.slot==='lunch'?"Обед":recipe.slot==='snack'?"Перекус":"Ужин"}</small><h3>{recipe.name}</h3><p>{recipe.minutes} мин · от {recipe.minAge} мес.</p></Link>)}</div></section>

      <section className="nutrition-flow-v3"><p className="eyebrow">КАК ПОЛЬЗОВАТЬСЯ</p><h2>Три шага вместо десяти разделов</h2><div><article><span>1</span><strong>Обновить профиль</strong><p>Возраст, введённые продукты, аллергии и что есть дома.</p></article><i>→</i><article><span>2</span><strong>Собрать меню</strong><p>Выбрать дни, приёмы пищи и ограничения.</p></article><i>→</i><article><span>3</span><strong>Открыть блюдо</strong><p>Рецепт, визуальная подача, замены и безопасность.</p></article></div></section>
      <Note>До года основное питание обычно остаётся грудным молоком и/или смесью. Количество прикорма и текстура зависят от готовности и индивидуальной ситуации ребёнка.</Note>
    </div>
  );
}
