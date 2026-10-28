import type { Ingredient, Recipe } from "../types";

function family(id: string) {
  if (/broccoli/.test(id)) return "broccoli";
  if (/carrot/.test(id)) return "carrot";
  if (/pumpkin|sweet-potato/.test(id)) return "pumpkin";
  if (/zucchini|cucumber/.test(id)) return "zucchini";
  if (/peas/.test(id)) return "peas";
  if (/avocado/.test(id)) return "avocado";
  if (/salmon|fish/.test(id)) return "fish";
  if (/turkey|chicken|beef|meat/.test(id)) return "meat";
  if (/egg/.test(id)) return "egg";
  if (/apple/.test(id)) return "apple";
  if (/pear/.test(id)) return "pear";
  if (/banana/.test(id)) return "banana";
  if (/mango/.test(id)) return "mango";
  if (/berry|blueberry|raspberry/.test(id)) return "berry";
  if (/oat|buckwheat|rice|grain|quinoa/.test(id)) return "grain";
  if (/pasta/.test(id)) return "pasta";
  if (/bread/.test(id)) return "bread";
  if (/yogurt|curd|cottage|cheese/.test(id)) return "dairy";
  if (/milk|formula/.test(id)) return "milk";
  if (/potato/.test(id)) return "potato";
  return "generic";
}

export function IngredientGlyph({ id, label = "" }: { id: string; label?: string }) {
  const kind = family(id);
  return (
    <svg className="ingredient-glyph" viewBox="0 0 96 96" role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true}>
      {kind === "broccoli" && <><rect x="43" y="43" width="11" height="34" rx="5" fill="#789A69"/><circle cx="34" cy="39" r="17" fill="#97B982"/><circle cx="54" cy="31" r="19" fill="#86AA72"/><circle cx="68" cy="43" r="15" fill="#9DBD88"/></>}
      {kind === "carrot" && <><path d="M32 33L70 42 45 80Z" fill="#E99B5B"/><path d="M31 35C18 30 17 19 25 17c8-1 11 10 12 17M35 34c3-14 14-19 20-12 5 7-5 14-17 17" fill="none" stroke="#739D68" strokeWidth="7" strokeLinecap="round"/></>}
      {kind === "pumpkin" && <><ellipse cx="48" cy="55" rx="31" ry="25" fill="#E8A05D"/><ellipse cx="38" cy="55" rx="13" ry="24" fill="#F0B16C"/><ellipse cx="58" cy="55" rx="13" ry="24" fill="#D98F50"/><path d="M48 28c0-8 5-12 10-14" stroke="#708B5D" strokeWidth="7" strokeLinecap="round"/></>}
      {kind === "zucchini" && <><rect x="21" y="38" width="57" height="24" rx="12" fill="#8FB379" transform="rotate(-17 50 50)"/><path d="M25 56l9-6M67 37l8-5" stroke="#DDEBD4" strokeWidth="4" strokeLinecap="round"/></>}
      {kind === "peas" && <><path d="M17 58c17-30 46-32 64-7-20 21-47 24-64 7Z" fill="#8EB577"/><circle cx="34" cy="54" r="8" fill="#B6D39F"/><circle cx="49" cy="49" r="8" fill="#A9CB92"/><circle cx="64" cy="50" r="8" fill="#B9D7A2"/></>}
      {kind === "avocado" && <><path d="M48 15c15 21 27 37 27 51 0 14-12 24-27 24S21 80 21 66c0-14 12-30 27-51Z" fill="#90B66F"/><path d="M48 27c11 17 18 29 18 39 0 9-8 16-18 16s-18-7-18-16c0-10 7-22 18-39Z" fill="#C8DDA7"/><circle cx="48" cy="65" r="12" fill="#9A704E"/></>}
      {kind === "fish" && <><path d="M20 51c15-25 43-28 58-5-14 25-42 28-58 5Z" fill="#D8907D"/><path d="M20 51L8 35v32Z" fill="#C47F70"/><circle cx="66" cy="44" r="3" fill="#554642"/><path d="M35 44c8 5 13 12 15 20" stroke="#F4C4B9" strokeWidth="4" fill="none" strokeLinecap="round"/></>}
      {kind === "meat" && <><path d="M23 41c7-17 29-24 47-13 14 9 14 31 2 43-14 14-42 11-53-5-7-10-2-17 4-25Z" fill="#C98F7B"/><path d="M33 45c8-7 21-7 30 0M30 58c10-5 24-4 34 3" stroke="#EAC1B4" strokeWidth="5" strokeLinecap="round" fill="none"/></>}
      {kind === "egg" && <><path d="M48 13c18 24 27 41 27 55 0 15-12 24-27 24S21 83 21 68c0-14 9-31 27-55Z" fill="#FFF8E8" stroke="#E9D8BB" strokeWidth="3"/><circle cx="48" cy="62" r="16" fill="#F0C25D"/></>}
      {kind === "apple" && <><path d="M48 30c-8-10-25-5-29 9-5 18 9 44 29 47 20-3 34-29 29-47-4-14-21-19-29-9Z" fill="#D98678"/><path d="M48 29c-2-9 2-17 9-20" stroke="#6D855B" strokeWidth="6" strokeLinecap="round"/><path d="M55 15c10-2 16 3 18 9-10 4-17 0-18-9Z" fill="#8FAF72"/></>}
      {kind === "pear" && <><path d="M48 13c10 12 11 23 7 31 16 5 23 17 20 29-4 15-16 21-27 21S25 88 21 73c-3-12 4-24 20-29-4-8-3-19 7-31Z" fill="#B9C97C"/><path d="M49 18c1-8 6-12 11-14" stroke="#6F7E52" strokeWidth="5" strokeLinecap="round"/></>}
      {kind === "banana" && <><path d="M18 40c12 27 36 39 63 28-14 17-39 24-58 10C9 68 8 53 18 40Z" fill="#E7C761"/><path d="M20 42c4-5 8-8 12-10" stroke="#8F7B45" strokeWidth="4" strokeLinecap="round"/></>}
      {kind === "mango" && <><path d="M23 58c0-24 14-43 32-43 16 0 24 15 19 33-6 23-24 40-40 35-7-2-11-11-11-25Z" fill="#F0B65E"/><path d="M55 17c3-8 9-12 16-12" stroke="#718B61" strokeWidth="5" strokeLinecap="round"/></>}
      {kind === "berry" && <><circle cx="38" cy="52" r="19" fill="#A77BB0"/><circle cx="58" cy="46" r="18" fill="#8B6B9C"/><circle cx="55" cy="66" r="17" fill="#B386B9"/><path d="M45 25c7 6 14 7 22 3" stroke="#719064" strokeWidth="6" strokeLinecap="round"/></>}
      {kind === "grain" && <><path d="M18 49h60c0 23-12 36-30 36S18 72 18 49Z" fill="#D8BE94"/><path d="M24 47c8-15 40-16 49 0" fill="#EFE1C7"/><path d="M31 44l6-10M47 43l2-12M62 44l-5-10" stroke="#B99B70" strokeWidth="4" strokeLinecap="round"/></>}
      {kind === "pasta" && <><path d="M19 59c6-27 23-33 32-14s25 12 28-9M17 72c17-8 21 4 32 5 13 1 17-14 31-10" fill="none" stroke="#E4BC75" strokeWidth="9" strokeLinecap="round"/></>}
      {kind === "bread" && <><path d="M20 72V43c0-15 12-26 28-26s28 11 28 26v29Z" fill="#D8B07A"/><path d="M30 36c8-6 28-6 36 0M32 51h32" stroke="#EED3A8" strokeWidth="5" strokeLinecap="round"/></>}
      {kind === "dairy" && <><path d="M24 35h48l-6 50H30Z" fill="#F8F5ED" stroke="#C9D3D5" strokeWidth="3"/><ellipse cx="48" cy="35" rx="24" ry="7" fill="#DCE7E8"/><path d="M36 55c7-6 17-5 24 1" stroke="#D5A8B8" strokeWidth="6" strokeLinecap="round"/></>}
      {kind === "milk" && <><path d="M31 24h34l8 14v47H23V38Z" fill="#F7F7F2" stroke="#CBD8D7" strokeWidth="3"/><path d="M31 24l8-12h18l8 12M26 45h44" stroke="#AFC8C6" strokeWidth="5" fill="none"/><circle cx="48" cy="62" r="10" fill="#DCEBE9"/></>}
      {kind === "potato" && <><path d="M22 54c0-21 13-34 34-34 18 0 28 14 24 33-4 21-21 33-39 30-12-2-19-13-19-29Z" fill="#CFAE7A"/><circle cx="42" cy="42" r="3" fill="#9C7B55"/><circle cx="61" cy="57" r="3" fill="#9C7B55"/></>}
      {kind === "generic" && <><path d="M19 59c11-28 45-37 62-11-5 25-29 39-51 30-8-3-13-10-11-19Z" fill="#C6B4D2"/><path d="M32 56c12-7 23-9 35-6" stroke="#E9DFF0" strokeWidth="5" strokeLinecap="round"/></>}
    </svg>
  );
}

function slotTheme(slot: Recipe["slot"]) {
  if (slot === "breakfast") return ["#F5E6CE", "#E9C894"];
  if (slot === "lunch") return ["#E5EDD9", "#AFC596"];
  if (slot === "snack") return ["#F3DFE7", "#D9ADBF"];
  return ["#E9E2F0", "#C7B5D5"];
}

export function RecipeHeroVisual({ recipe, compact = false }: { recipe: Recipe; compact?: boolean }) {
  const ingredients = recipe.ingredients.filter((item) => !["water", "oil"].includes(item.id)).slice(0, compact ? 3 : 5);
  const [a, b] = slotTheme(recipe.slot);
  return (
    <div className={"recipe-hero-art" + (compact ? " compact" : "")} style={{ background: `linear-gradient(145deg, ${a}, #fffaf4)` }} role="img" aria-label={`Иллюстрация блюда ${recipe.name}`}>
      <div className="recipe-plate"><span /></div>
      <div className="recipe-food-cluster">
        {ingredients.map((item, index) => (
          <span key={`${item.id}-${index}`} className={`recipe-food food-${index}`}><IngredientGlyph id={item.id} /></span>
        ))}
      </div>
      {!compact && <div className="recipe-art-label"><span style={{ background: b }} /><strong>{recipe.name}</strong><small>{recipe.minutes} мин · от {recipe.minAge} мес.</small></div>}
    </div>
  );
}

export function IngredientVisualList({ ingredients }: { ingredients: Ingredient[] }) {
  return (
    <div className="ingredient-visual-list">
      {ingredients.filter((item) => item.id !== "water").map((item) => (
        <article key={item.id}>
          <IngredientGlyph id={item.id} label={item.name} />
          <div><strong>{item.name}</strong><small>{item.grams} {item.unit || "г"}</small></div>
        </article>
      ))}
    </div>
  );
}

function stepKind(text: string) {
  const lower = text.toLowerCase();
  if (/мой|вымой|промой|ополос/.test(lower)) return "wash";
  if (/нареж|измельч|разреж|кубик|кусоч/.test(lower)) return "cut";
  if (/вар|туш|пар|запек|готов/.test(lower)) return "cook";
  if (/смеш|перемеш|соедин|размять|пюр/.test(lower)) return "mix";
  return "serve";
}

function StepGlyph({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      {kind === "wash" && <><path d="M36 10c12 16 18 27 18 37 0 11-8 18-18 18s-18-7-18-18c0-10 6-21 18-37Z" fill="#B9D9E5"/><path d="M27 47c5 5 13 6 19 1" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round"/></>}
      {kind === "cut" && <><path d="M14 53h44" stroke="#B89A73" strokeWidth="8" strokeLinecap="round"/><path d="M20 44L51 16" stroke="#7A8588" strokeWidth="7" strokeLinecap="round"/><path d="M47 14l10 10" stroke="#A86F61" strokeWidth="8" strokeLinecap="round"/></>}
      {kind === "cook" && <><path d="M17 31h38l-5 28H22Z" fill="#B8C6AF"/><path d="M13 29h46M28 21h16" stroke="#71806C" strokeWidth="5" strokeLinecap="round"/><path d="M25 14c-4-5 1-9 0-13M38 14c-4-5 1-9 0-13M50 14c-4-5 1-9 0-13" stroke="#D4A991" strokeWidth="3" fill="none" strokeLinecap="round"/></>}
      {kind === "mix" && <><circle cx="34" cy="41" r="22" fill="#E7D6BE"/><path d="M45 10L31 45" stroke="#9A8069" strokeWidth="6" strokeLinecap="round"/><path d="M25 44c7-6 14-6 21 0" stroke="#C19F6E" strokeWidth="5" fill="none" strokeLinecap="round"/></>}
      {kind === "serve" && <><ellipse cx="36" cy="45" rx="26" ry="16" fill="#E7DED1"/><ellipse cx="36" cy="41" rx="22" ry="13" fill="#FFF9EF"/><path d="M23 39c8-8 18-9 27-2" stroke="#A6BC8F" strokeWidth="7" strokeLinecap="round"/></>}
    </svg>
  );
}

export function RecipeStepsVisual({ steps }: { steps: string[] }) {
  return (
    <div className="recipe-steps-visual">
      {steps.map((step, index) => (
        <article key={`${index}-${step}`}>
          <div><StepGlyph kind={stepKind(step)} /><span>{index + 1}</span></div>
          <p>{step}</p>
        </article>
      ))}
    </div>
  );
}

export function TextureVisual({ recipe }: { recipe: Recipe }) {
  const stage = recipe.minAge < 8 ? 0 : recipe.minAge < 12 ? 1 : 2;
  const labels = [
    ["Размять", "Мягкая текстура легко меняется ложкой или пальцами"],
    ["Взять рукой", "Мягкие формы, которые удобно удерживать и раздавить"],
    ["Семейная подача", "Адаптируем размер, мягкость, соль и опасные формы"],
  ];
  return (
    <div className="texture-visual" aria-label="Схема текстуры и подачи">
      {labels.map(([title, text], index) => (
        <article key={title} className={index === stage ? "active" : index < stage ? "passed" : ""}>
          <div className={`texture-shape texture-${index}`}><i /><b /></div>
          <strong>{title}</strong>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}
