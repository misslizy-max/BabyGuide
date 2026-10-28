import { useState } from "react";
import { Heading, Link, Note } from "../components/UI";
import { useApp } from "../hooks/useApp";
import { routines } from "../data/routines";
import { months } from "../utils/dates";

export function Routines() {
  const { data } = useApp();
  const profileAge = Math.min(Math.max(months(data.profile.birth) ?? 0, 0), 36);
  const [age, setAge] = useState(profileAge);
  const list = routines.filter((routine) => age >= routine.min && age <= routine.max);

  return (
    <div className="routines-page">
      <Heading
        title="Рутины и самообслуживание"
        sub="Посильное участие 0–36 месяцев · без экзамена на самостоятельность"
        back="development"
      />

      <div className="routine-age-control">
        <div>
          <p className="eyebrow">ВОЗРАСТ</p>
          <strong>{age} мес.</strong>
        </div>
        <input
          aria-label="Возраст для рутин"
          type="range"
          min="0"
          max="36"
          value={age}
          onChange={(event) => setAge(Number(event.target.value))}
        />
      </div>

      <Note>
        Самообслуживание начинается не с «делает сам», а с понятной
        последовательности и маленького участия. Взрослый по-прежнему отвечает
        за безопасность, гигиену и завершение действий.
      </Note>

      <section className="routine-overview" aria-label="Схема самостоятельности">
        <div><span>1</span><strong>Взрослый показывает</strong><small>Один понятный шаг</small></div>
        <b aria-hidden="true">→</b>
        <div><span>2</span><strong>Делаем вместе</strong><small>Помощь уменьшается постепенно</small></div>
        <b aria-hidden="true">→</b>
        <div><span>3</span><strong>Ребёнок пробует</strong><small>Без требования выполнить идеально</small></div>
      </section>

      <div className="routine-grid">
        {list.map((routine) => (
          <article className="routine-card" key={routine.id}>
            <header>
              <span>{routine.icon}</span>
              <div>
                <small>{routine.min}–{routine.max} МЕС.</small>
                <h2>{routine.title}</h2>
                <p>{routine.goal}</p>
              </div>
            </header>
            <p className="routine-cue"><strong>Когда:</strong> {routine.cue}</p>
            <div className="routine-steps" aria-label={`Шаги: ${routine.title}`}>
              {routine.steps.map((step, index) => (
                <div key={step.title}>
                  <span className="routine-step-icon">{step.icon}</span>
                  <small>ШАГ {index + 1}</small>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
            <div className="routine-support">
              <p><strong>Как помочь:</strong> {routine.support}</p>
              <p><strong>Не надо:</strong> {routine.avoid}</p>
            </div>
          </article>
        ))}
      </div>

      {!list.length && (
        <Note>Для этого возраста нет отдельной рутины — выберите соседний месяц.</Note>
      )}

      <div className="age-guide-actions">
        <Link to="development" className="button">Развитие по 8 областям</Link>
        <Link to="games" className="secondary">Игры по возрасту</Link>
        {age >= 18 && <Link to="guide/potty-plan" className="secondary">Гайд по горшку</Link>}
      </div>
    </div>
  );
}
