import { Heading, Link, Note } from "../components/UI";
import { healthArticles } from "../data/health";
import { useApp } from "../hooks/useApp";
import { formatDate } from "../utils/dates";

const priority = ["fall", "burn", "allergy", "vomit", "diarrhea", "dehydration"];

export function HealthHub() {
  const { data } = useApp();
  const lastTemperature = data.events
    .filter((event) => event.kind === "Температура" && event.temperature)
    .sort((a, b) => b.time.localeCompare(a.time))[0];
  const lastGrowth = data.events
    .filter((event) => event.kind === "Рост")
    .sort((a, b) => b.time.localeCompare(a.time))[0];
  const ordered = [...healthArticles].sort(
    (a, b) => priority.indexOf(a.id) - priority.indexOf(b.id),
  );

  return (
    <div className="health-hub">
      <Heading
        title="Здоровье"
        sub="Сначала действие, затем подробности · без попытки поставить диагноз"
        back="library"
      />

      <Note danger>
        <strong>Экстренно:</strong> тяжёлое дыхание, посинение, судороги,
        отсутствие реакции или быстрое ухудшение — звоните 112 или в местную
        экстренную службу.
      </Note>

      <section className="health-actions-grid">
        <Link to="temperature">
          <span>🌡</span>
          <strong>Температура</strong>
          <small>
            {lastTemperature?.temperature
              ? `${lastTemperature.temperature}° · ${formatDate(lastTemperature.time)}`
              : "Записать и посмотреть динамику"}
          </small>
        </Link>
        <Link to="medicines">
          <span>💊</span>
          <strong>Лекарства</strong>
          <small>Расчёт по весу и концентрации на упаковке</small>
        </Link>
        <Link to="growth">
          <span>↗</span>
          <strong>Рост и вес</strong>
          <small>
            {lastGrowth
              ? [
                  lastGrowth.weight ? `${lastGrowth.weight} кг` : "",
                  lastGrowth.height ? `${lastGrowth.height} см` : "",
                ]
                  .filter(Boolean)
                  .join(" · ") || "Последнее измерение сохранено"
              : "Графики и история измерений"}
          </small>
        </Link>
        <Link to="article/red-flags">
          <span>!</span>
          <strong>Красные флаги</strong>
          <small>Когда не наблюдать дома</small>
        </Link>
      </section>

      <section className="health-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">БЫСТРЫЙ СПРАВОЧНИК</p>
            <h2>Что случилось?</h2>
          </div>
        </div>
        <div className="health-topic-grid">
          {ordered.map((article) => (
            <Link key={article.id} to={`article/${article.id}`}>
              <span className="health-topic-mark">
                {article.id === "fall"
                  ? "↘"
                  : article.id === "burn"
                    ? "♨"
                    : article.id === "allergy"
                      ? "✦"
                      : article.id === "dehydration"
                        ? "◌"
                        : "♡"}
              </span>
              <div>
                <strong>{article.title}</strong>
                <p>{article.lead}</p>
              </div>
              <b>›</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="health-section health-plan">
        <p className="eyebrow">ЕСЛИ СОМНЕВАЕТЕСЬ</p>
        <h2>Короткий порядок действий</h2>
        <ol>
          <li><span>1</span><p>Оцените дыхание, сознание и общее состояние ребёнка.</p></li>
          <li><span>2</span><p>Запишите время начала симптома, температуру и важные изменения.</p></li>
          <li><span>3</span><p>Откройте подходящий раздел выше и проверьте срочные признаки.</p></li>
          <li><span>4</span><p>При ухудшении или сомнении организуйте медицинскую оценку раньше, а не позже.</p></li>
        </ol>
      </section>

      <div className="age-guide-actions">
        <Link to="article/first-aid" className="button">Первая помощь</Link>
        <Link to="diary" className="secondary">Дневник наблюдений</Link>
        <Link to="sources" className="secondary">Источники</Link>
      </div>
    </div>
  );
}
