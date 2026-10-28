import { Heading, Note } from "../components/UI";
import { NaturalSpeechButton, NaturalVoiceSetup } from "../components/NaturalSpeech";

export function VoiceSettings() {
  return (
    <div className="voice-settings-page">
      <Heading
        title="Голос BabyGuide"
        sub="Мамин голос Лизы · защищённая генерация через Fish Audio"
        back="age-guide"
      />

      <NaturalVoiceSetup />

      <section className="age-guide-section">
        <p className="eyebrow">ПРОВЕРКА</p>
        <h2>Как звучит BabyGuide</h2>
        <p>
          Карточки, потешки и истории озвучиваются клоном маминого голоса.
          Текст отправляется только на защищённый сервер BabyGuide, а секретный
          ключ Fish Audio остаётся в Cloudflare и не попадает в браузер.
        </p>
        <NaturalSpeechButton
          text="Женя, привет! Мой хороший. Давай немножко поиграем вместе. Ну что, начинаем?"
          label="Послушать мамин голос"
        />
      </section>

      <Note>
        Для маминого голоса нужен интернет. Если сервис временно недоступен,
        BabyGuide покажет понятную ошибку и не переключится сам на механический
        системный голос. Настоящие звуки животных и «Повторюшка» работают отдельно.
      </Note>
    </div>
  );
}
