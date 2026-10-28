import { Heading, Note, VoicePicker } from "../components/UI";
import { NaturalSpeechButton, NaturalVoiceSetup } from "../components/NaturalSpeech";

export function VoiceSettings() {
  return (
    <div className="voice-settings-page">
      <Heading
        title="Голос BabyGuide"
        sub="Нейронная русская озвучка на устройстве · системный голос только запасной"
        back="age-guide"
      />

      <NaturalVoiceSetup />

      <section className="age-guide-section">
        <p className="eyebrow">ПРОВЕРКА</p>
        <h2>Как звучит BabyGuide</h2>
        <p>
          После загрузки голосового пакета карточки, потешки и истории используют
          нейронную Ирину. Текст синтезируется локально в браузере — отдельный
          сервер озвучки и постоянная подписка не нужны.
        </p>
        <NaturalSpeechButton
          text="Привет! Давай посмотрим карточки, почитаем историю и сделаем паузу, когда захочется."
          label="Послушать живой голос"
        />
      </section>

      <details className="age-guide-section voice-fallback-settings">
        <summary>Запасной системный голос</summary>
        <p>
          Этот вариант нужен только если нейронная модель ещё не загружена или
          браузер не поддерживает локальный синтез. Он больше не является
          основным голосом BabyGuide.
        </p>
        <VoicePicker />
      </details>

      <Note>
        Голосовой пакет занимает около 63 МБ и хранится в данных сайта на этом
        устройстве. При очистке данных Safari/Chrome его потребуется скачать
        снова. «Повторюшка» по-прежнему воспроизводит реальный записанный голос
        ребёнка и не использует синтез речи.
      </Note>
    </div>
  );
}
