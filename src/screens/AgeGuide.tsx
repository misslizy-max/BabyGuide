import { Link, Note } from "../components/UI";
import { useApp } from "../hooks/useApp";
import { development } from "../data/development";
import { games } from "../data/games";
import { guides } from "../data/guides";
import { exactAge, months } from "../utils/dates";

export function AgeGuide() {
  const { data } = useApp();
  const age = months(data.profile.birth);
  const safeAge = Math.min(Math.max(age ?? 0, 0), 36);
  const stage = development[safeAge];
  const gamesNow = games
    .filter((game) => safeAge >= game.min && safeAge <= game.max)
    .slice(0, 3);
  const guidesNow = guides
    .filter((guide) => guide.min <= safeAge)
    .sort((a, b) => b.min - a.min)
    .slice(0, 3);

  return (
    <div className="age-guide-page">
      <section className="age-guide-hero">
        <Link to="home" className="back age-guide-back">
          ←
        </Link>
        <p className="eyebrow">ГАЙД ПО ВОЗРАСТУ</p>
        <h1>{data.profile.name || "Малыш"} · {exactAge(data.profile.birth)}</h1>
        <p>
          Не чек-лист «должен уметь», а ориентиры: что поддерживать сейчас,
          какие занятия предложить и где не стоит ждать.
        </p>
        <div className="age-guide-icons" aria-label="Разделы гайда">
          <span>🧠<small>Развитие</small></span>
          <span>🥣<small>Питание</small></span>
          <span>🌙<small>Сон</small></span>
          <span>♡<small>Здоровье</small></span>
        </div>
      </section>

      <section className="age-guide-section">
        <div className="age-guide-heading">
          <span>🌱</span>
          <div>
            <small>РАЗВИТИЕ</small>
            <h2>{stage.title}</h2>
          </div>
        </div>
        <p className="age-guide-lead">{stage.skills}</p>
        <div className="age-guide-domain-grid">
          {stage.domains.slice(0, 4).map((domain, index) => (
            <article key={domain}>
              <strong>{["Движение", "Руки", "Познание", "Контакт"][index]}</strong>
              <p>{domain}</p>
            </article>
          ))}
        </div>
        <div className="age-guide-actions">
          <Link to="development" className="secondary">
            Все 8 областей развития →
          </Link>
          <Link to="routines" className="secondary">
            Рутины и самообслуживание →
          </Link>
          <Link to="voice-settings" className="secondary">
            Настроить русский голос →
          </Link>
        </div>
      </section>

      <section className="age-guide-section">
        <div className="age-guide-heading">
          <span>🎲</span>
          <div>
            <small>ЧТО ПОПРОБОВАТЬ</small>
            <h2>Три игры по возрасту</h2>
          </div>
        </div>
        <div className="age-guide-list">
          {gamesNow.map((game) => (
            <Link key={game.id} to={`game/${game.id}`}>
              <span>{game.icon}</span>
              <div>
                <strong>{game.title}</strong>
                <small>{game.minutes} мин · {game.goal}</small>
              </div>
              <b>›</b>
            </Link>
          ))}
        </div>
        <Link to="games" className="secondary">
          Больше игр →
        </Link>
      </section>

      <section className="age-guide-section">
        <div className="age-guide-heading">
          <span>🥣</span>
          <div>
            <small>ПИТАНИЕ</small>
            <h2>{safeAge < 6 ? "До прикорма" : "Рацион становится разнообразнее"}</h2>
          </div>
        </div>
        {safeAge < 6 ? (
          <p>
            Основное питание сейчас определяется выбранным типом кормления и
            индивидуальным планом ребёнка. Раздел прикорма используйте заранее
            как подготовку: признаки готовности, безопасная подача и аллергены.
          </p>
        ) : (
          <>
            <div className="nutrition-visual" aria-label="Ориентир по развитию подачи еды">
              <div className={safeAge >= 6 ? "active" : ""}>
                <span>🥄</span><strong>Мягко</strong><small>Разминаемая текстура по готовности</small>
              </div>
              <b aria-hidden="true">→</b>
              <div className={safeAge >= 8 ? "active" : ""}>
                <span>🤲</span><strong>Руками</strong><small>Безопасные мягкие кусочки и самостоятельный захват</small>
              </div>
              <b aria-hidden="true">→</b>
              <div className={safeAge >= 12 ? "active" : ""}>
                <span>🍽</span><strong>Семейная еда</strong><small>Адаптируем текстуру, соль и форму подачи</small>
              </div>
            </div>
            <p>
              Это не жёсткий календарь: ориентируйтесь на готовность и безопасную
              текстуру. В профиле отмечено введённых продуктов:{" "}
              <strong>{data.profile.introduced.length}</strong>. BabyGuide может
              собрать меню из подходящих по возрасту и вашим ограничениям блюд.
            </p>
            <div className="age-guide-actions">
              <Link to="menu" className="button">Меню на 14 дней</Link>
              <Link to="recipes" className="secondary">Рецепты</Link>
              <Link to="safe-food" className="secondary">Безопасная подача</Link>
            </div>
          </>
        )}
      </section>

      <section className="age-guide-section">
        <div className="age-guide-heading">
          <span>🧺</span>
          <div>
            <small>БЫТОВЫЕ НАВЫКИ</small>
            <h2>Самостоятельность растёт из маленького участия</h2>
          </div>
        </div>
        <div className="routine-mini-flow" aria-label="Схема развития самостоятельности">
          <span><b>1</b><strong>Показать</strong><small>Один понятный шаг</small></span>
          <i>→</i>
          <span><b>2</b><strong>Сделать вместе</strong><small>Помочь только там, где нужно</small></span>
          <i>→</i>
          <span><b>3</b><strong>Дать попробовать</strong><small>Без требования идеального результата</small></span>
        </div>
        <p>
          В отдельном разделе собраны одевание, ложка и чашка, мытьё рук,
          чистка зубов, уборка, выбор одежды и знакомство с горшком — с
          возрастным фильтром и наглядными шагами.
        </p>
        <Link to="routines" className="button">Открыть рутины по возрасту →</Link>
      </section>

      <section className="age-guide-section">
        <div className="age-guide-heading">
          <span>🌙</span>
          <div>
            <small>СОН И РЕЖИМ</small>
            <h2>Смотрим на ребёнка и весь день</h2>
          </div>
        </div>
        <p>
          Записывайте сон только настолько подробно, насколько это помогает.
          Важнее общая картина, самочувствие и восстановление семьи, чем
          идеальная цифра на часах.
        </p>
        <div className="age-guide-list">
          {guidesNow.map((guide) => (
            <Link key={guide.id} to={`guide/${guide.id}`}>
              <span>✓</span>
              <div>
                <strong>{guide.title}</strong>
                <small>{guide.lead}</small>
              </div>
              <b>›</b>
            </Link>
          ))}
        </div>
        <Link to="sleep-log" className="secondary">Открыть дневник сна →</Link>
      </section>

      <section className="age-guide-section age-guide-health">
        <div className="age-guide-heading">
          <span>♡</span>
          <div>
            <small>ЗДОРОВЬЕ</small>
            <h2>Когда не ждать</h2>
          </div>
        </div>
        <p>{stage.flags}</p>
        <div className="age-guide-actions">
          <Link to="health" className="button">Справочник здоровья</Link>
          <Link to="article/red-flags" className="secondary">Красные флаги</Link>
        </div>
      </section>

      <Note>
        Возрастные ориентиры описывают диапазон нормального развития и не
        заменяют осмотр. Потеря уже освоенного навыка или резкое изменение
        состояния — повод обратиться за медицинской оценкой независимо от
        возраста в приложении.
      </Note>
    </div>
  );
}
