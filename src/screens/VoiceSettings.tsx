import { Heading, Note, SpeechButton, VoicePicker } from "../components/UI";

export function VoiceSettings() {
  return (
    <div className="voice-settings-page">
      <Heading
        title="Голос для карточек и историй"
        sub="Русский системный голос устройства · выбор сохраняется только здесь"
        back="age-guide"
      />
      <section className="age-guide-section">
        <p className="eyebrow">ОЗВУЧКА</p>
        <h2>Выберите голос</h2>
        <p>
          Список зависит от iPhone, Android или компьютера. BabyGuide показывает
          только доступные русские голоса и по умолчанию старается выбрать более
          мягкий локальный вариант.
        </p>
        <VoicePicker />
        <div className="age-guide-actions">
          <SpeechButton
            text="Привет! Давай посмотрим карточки, почитаем историю и сделаем паузу, когда захочется."
            label="Послушать пример"
          />
        </div>
      </section>
      <Note>
        Это системный синтез речи: качество и набор голосов зависят от устройства.
        Выбор применяется к карточкам, потешкам, историям и другим кнопкам
        «Слушать». «Повторюшка» воспроизводит записанный голос ребёнка, поэтому
        эта настройка на неё не влияет.
      </Note>
    </div>
  );
}
