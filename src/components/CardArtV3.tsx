type Props = { word: string; category: string };

const colors: Record<string,string> = {
  "Красный":"#D96F62","Жёлтый":"#EBC85E","Зелёный":"#7FA06E","Синий":"#6D91BF","Фиолетовый":"#9A79B5","Белый":"#F8F5EF",
};

function Face({ mood }: { mood: string }) {
  const sad = mood === "Грусть" || mood === "Страх";
  const angry = mood === "Злость";
  const surprised = mood === "Удивление";
  const calm = mood === "Спокойствие";
  return <g>
    <circle cx="160" cy="118" r="72" fill="#E9C2A8"/>
    <circle cx="135" cy="105" r={surprised?7:5} fill="#554A43"/><circle cx="185" cy="105" r={surprised?7:5} fill="#554A43"/>
    {angry&&<><path d="M122 90l25-8M173 82l25 8" stroke="#6A5148" strokeWidth="6" strokeLinecap="round"/></>}
    {calm&&<><path d="M124 104q11 8 22 0M174 104q11 8 22 0" fill="none" stroke="#554A43" strokeWidth="5" strokeLinecap="round"/></>}
    {surprised?<circle cx="160" cy="142" r="12" fill="#A9695B"/>:<path d={sad?"M135 151q25-22 50 0":"M132 137q28 31 56 0"} fill="none" stroke="#A9695B" strokeWidth="7" strokeLinecap="round"/>}
    {mood==="Радость"&&<><circle cx="111" cy="128" r="10" fill="#E19E91" opacity=".6"/><circle cx="209" cy="128" r="10" fill="#E19E91" opacity=".6"/></>}
  </g>;
}

function Animal({ word }: { word:string }) {
  const fill = word==="Корова"?"#EEE9E1":word==="Утка"?"#E7C85D":word==="Овца"?"#F4F0E8":word==="Лошадь"?"#B88E6C":word==="Собака"?"#C89B73":"#B9A08C";
  return <g>
    {word==="Утка"?<><ellipse cx="160" cy="128" rx="76" ry="54" fill={fill}/><circle cx="205" cy="86" r="38" fill={fill}/><path d="M235 89l42 15-42 12z" fill="#DFA168"/><circle cx="215" cy="78" r="5" fill="#3E3834"/></>:
    <><circle cx="160" cy="120" r="70" fill={fill}/>
    {word==="Кот"&&<><path d="M105 75l16-48 32 35M215 75l-16-48-32 35" fill={fill}/><path d="M119 58l8-22 15 17M201 58l-8-22-15 17" fill="#D9B6A3"/></>}
    {word==="Собака"&&<><ellipse cx="98" cy="92" rx="28" ry="49" fill="#9D795C" transform="rotate(18 98 92)"/><ellipse cx="222" cy="92" rx="28" ry="49" fill="#9D795C" transform="rotate(-18 222 92)"/></>}
    {word==="Корова"&&<><path d="M108 76L82 50M212 76l26-26" stroke="#B99A76" strokeWidth="10" strokeLinecap="round"/><path d="M106 79L82 72M214 79l24-7" stroke="#8D6E54" strokeWidth="13"/><circle cx="126" cy="89" r="17" fill="#66564C"/><circle cx="192" cy="142" r="14" fill="#66564C"/></>}
    {word==="Овца"&&<>{[110,135,160,185,210].map((x,i)=><circle key={i} cx={x} cy={65+(i%2)*5} r="28" fill="#FFFDF8"/>)}<circle cx="160" cy="126" r="54" fill="#D7C3AA"/></>}
    {word==="Лошадь"&&<><path d="M105 77l7-47 33 35M214 77l-8-47-31 35" fill={fill}/><path d="M212 59q38 38 4 92" fill="none" stroke="#6E503D" strokeWidth="16"/></>}
    <circle cx="136" cy="111" r="6" fill="#3E3834"/><circle cx="185" cy="111" r="6" fill="#3E3834"/><ellipse cx="160" cy="147" rx="34" ry="23" fill="#E6B7A1"/><circle cx="148" cy="148" r="4" fill="#6B584E"/><circle cx="172" cy="148" r="4" fill="#6B584E"/></>}
  </g>;
}

function Transport({ word }: { word:string }) {
  if(word==="Самолёт") return <g><path d="M65 132l190-70 19 18-72 58 48 35-15 18-75-26-42 41-15-9 20-55-58 9z" fill="#8FA9BF"/><circle cx="199" cy="117" r="6" fill="#FFF"/></g>;
  if(word==="Корабль") return <g><path d="M70 145h190l-32 50H102z" fill="#7796AD"/><rect x="122" y="95" width="92" height="52" rx="6" fill="#F1EEE8"/><rect x="145" y="66" width="45" height="30" fill="#D58D77"/><path d="M42 202q55-22 110 0t110 0" fill="none" stroke="#9FC2D1" strokeWidth="12" strokeLinecap="round"/></g>;
  if(word==="Велосипед") return <g><circle cx="105" cy="165" r="44" fill="none" stroke="#6B7E8D" strokeWidth="9"/><circle cx="220" cy="165" r="44" fill="none" stroke="#6B7E8D" strokeWidth="9"/><path d="M105 165l47-65 35 65h-82l32-47h62l21 47" fill="none" stroke="#C57E68" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/><path d="M141 93h31M205 90l-21 9" stroke="#5C514A" strokeWidth="8" strokeLinecap="round"/></g>;
  if(word==="Поезд") return <g><rect x="54" y="99" width="204" height="82" rx="18" fill="#9AAE8C"/><rect x="78" y="68" width="92" height="47" rx="10" fill="#C97864"/><rect x="184" y="114" width="45" height="34" rx="5" fill="#DDE9ED"/><circle cx="100" cy="187" r="24" fill="#5A5551"/><circle cx="218" cy="187" r="24" fill="#5A5551"/><path d="M46 204h230" stroke="#7B6A5D" strokeWidth="8"/></g>;
  const bus = word==="Автобус";
  return <g><rect x="50" y={bus?80:108} width="220" height={bus?103:72} rx="22" fill={bus?"#D4A668":"#C77962"}/>{bus&&<>{[70,118,166,214].map(x=><rect key={x} x={x} y="98" width="35" height="36" rx="5" fill="#DCE9ED"/>)}</>}<rect x="185" y={bus?140:120} width="54" height="25" rx="6" fill="#DCE9ED"/><circle cx="94" cy="183" r="24" fill="#55514E"/><circle cx="226" cy="183" r="24" fill="#55514E"/><circle cx="94" cy="183" r="10" fill="#D7D1CB"/><circle cx="226" cy="183" r="10" fill="#D7D1CB"/></g>;
}

function Food({ word }: { word:string }) {
  if(word==="Банан") return <g><path d="M92 68q25 119 145 97-22 65-96 42Q72 186 69 91z" fill="#E8C552"/><path d="M92 69l-6-25" stroke="#80664D" strokeWidth="10" strokeLinecap="round"/></g>;
  if(word==="Морковь") return <g><path d="M120 80q40-18 80 0l-38 132z" fill="#DF8E55"/><path d="M158 80q-32-37-48-52M162 78q8-45 15-58M169 81q38-34 48-48" stroke="#7EA06E" strokeWidth="13" strokeLinecap="round"/></g>;
  if(word==="Хлеб") return <g><path d="M80 98q0-52 80-52t80 52v99H80z" fill="#D7AE74"/><path d="M108 81l20 22M155 69l12 27M202 81l-18 22" stroke="#F2D5A4" strokeWidth="9" strokeLinecap="round"/></g>;
  if(word==="Вода") return <g><path d="M160 36C129 82 99 118 99 157a61 61 0 00122 0c0-39-30-75-61-121z" fill="#83B8D1"/><path d="M126 151q15 25 34 18" fill="none" stroke="#D7EEF5" strokeWidth="9" strokeLinecap="round"/></g>;
  const pear = word==="Груша";
  return <g><path d={pear?"M160 56q-26 7-22 45-54 33-49 89 5 49 71 49t71-49q5-56-49-89 4-38-22-45z":"M160 63c-20-35-77-17-83 43-9 87 67 126 83 126s92-39 83-126c-6-60-63-78-83-43z"} fill={pear?"#A8BD69":"#D96E5C"}/><path d="M160 69q8-33 32-43" fill="none" stroke="#6D7754" strokeWidth="10" strokeLinecap="round"/><path d="M177 41q27-11 43 3-21 20-43 10z" fill="#7FA06C"/></g>;
}

function ObjectArt({ word }: { word:string }) {
  if(word==="Мяч") return <g><circle cx="160" cy="132" r="82" fill="#F3F0E9" stroke="#6B7F93" strokeWidth="8"/><path d="M160 50l28 35-11 42h-34l-11-42z" fill="#C77763"/><path d="M81 117l50-32M239 117l-50-32M113 198l30-70M207 198l-30-70" stroke="#6B7F93" strokeWidth="8"/></g>;
  if(word==="Чашка") return <g><path d="M90 77h126v109q0 28-28 28h-70q-28 0-28-28z" fill="#A9BF98"/><path d="M216 103h21q37 0 37 35t-37 35h-21" fill="none" stroke="#A9BF98" strokeWidth="18"/><path d="M113 101h78" stroke="#fff" strokeWidth="8" opacity=".6"/></g>;
  if(word==="Книга") return <g><path d="M53 62q56-22 101 8v139q-45-30-101-7z" fill="#D57D68"/><path d="M267 62q-56-22-101 8v139q45-30 101-7z" fill="#C96958"/><path d="M160 72v139" stroke="#F1DAD3" strokeWidth="8"/><path d="M80 94h50M80 119h58M192 94h50M184 119h58" stroke="#F5E8E3" strokeWidth="7" strokeLinecap="round"/></g>;
  if(word==="Ложка") return <g><ellipse cx="160" cy="68" rx="38" ry="50" fill="#B9C5C9"/><rect x="151" y="109" width="18" height="126" rx="9" fill="#9FAFB4"/></g>;
  if(word==="Шапка") return <g><path d="M82 168q0-91 78-91t78 91z" fill="#87A5BE"/><rect x="68" y="163" width="184" height="38" rx="18" fill="#6E8CA6"/><circle cx="160" cy="61" r="25" fill="#A7BED1"/></g>;
  return <g><rect x="142" y="60" width="36" height="150" rx="18" fill="#75A2B6"/><rect x="119" y="45" width="82" height="40" rx="12" fill="#E7E4DF"/>{[127,142,157,172,187].map(x=><path key={x} d={`M${x} 47v-21`} stroke="#B7D1D9" strokeWidth="5"/> )}</g>;
}

function ShapeArt({ word }: { word:string }) {
  const fill = word==="Сердце"?"#D8848C":"#7FA3C1";
  if(word==="Круг") return <circle cx="160" cy="132" r="82" fill="#D96F62"/>;
  if(word==="Квадрат") return <rect x="82" y="54" width="156" height="156" rx="12" fill="#6D91BF"/>;
  if(word==="Треугольник") return <path d="M160 48l94 164H66z" fill="#D96F62"/>;
  if(word==="Звезда") return <path d="M160 42l27 59 65 7-48 44 13 64-57-32-57 32 13-64-48-44 65-7z" fill="#E3BD52"/>;
  if(word==="Сердце") return <path d="M160 218C74 165 61 112 88 78c25-31 63-20 72 7 9-27 47-38 72-7 27 34 14 87-72 140z" fill={fill}/>;
  return <path d="M160 46l88 86-88 86-88-86z" fill="#D79558"/>;
}

function ActionArt({ word }: { word:string }) {
  if(word==="Спать") return <g><rect x="66" y="153" width="200" height="38" rx="15" fill="#C5B4D3"/><rect x="84" y="118" width="78" height="44" rx="20" fill="#F2E8DC"/><circle cx="148" cy="118" r="37" fill="#E7BEA7"/><path d="M137 119q9 7 18 0" fill="none" stroke="#5B514A" strokeWidth="5" strokeLinecap="round"/><text x="205" y="91" fontSize="28" fill="#8D7AA0">z</text><text x="229" y="66" fontSize="20" fill="#8D7AA0">z</text></g>;
  if(word==="Есть") return <g><circle cx="160" cy="116" r="55" fill="#E6BDA6"/><circle cx="143" cy="105" r="5" fill="#4F4741"/><circle cx="178" cy="105" r="5" fill="#4F4741"/><path d="M148 137q13 12 26 0" fill="none" stroke="#A76659" strokeWidth="6"/><path d="M230 56v130M215 56v48q15 18 30 0V56" fill="none" stroke="#A9B4B8" strokeWidth="9" strokeLinecap="round"/></g>;
  const run=word==="Бежать"; const wave=word==="Махать"; const hug=word==="Обнимать";
  return <g><circle cx="160" cy="67" r="30" fill="#E4B79F"/><path d="M160 98v70" stroke="#7D8FA0" strokeWidth="17" strokeLinecap="round"/><path d={wave?"M155 115L94 69M164 119l52 24":hug?"M155 119l-54 18M165 119l54 18":"M158 118l-48 26M164 118l48-30"} stroke="#7D8FA0" strokeWidth="15" strokeLinecap="round"/><path d={run?"M158 164l-55 48M165 164l59 25":"M158 164l-32 58M165 164l38 58"} stroke="#7D8FA0" strokeWidth="17" strokeLinecap="round"/>{hug&&<circle cx="160" cy="137" r="42" fill="#D7A6AA" opacity=".42"/>}</g>;
}

function FirstWordArt({ word }: { word:string }) {
  if(word==="Мама"||word==="Папа") return <g><circle cx="160" cy="106" r="62" fill="#E5B99E"/><path d={word==="Мама"?"M98 103q4-79 62-79t62 79q-25-42-62-42t-62 42":"M99 100q4-71 61-71t61 71q-31-27-61-27t-61 27"} fill={word==="Мама"?"#765848":"#665447"}/><circle cx="140" cy="108" r="5" fill="#443D39"/><circle cx="181" cy="108" r="5" fill="#443D39"/><path d="M144 137q16 16 32 0" fill="none" stroke="#A6675A" strokeWidth="6" strokeLinecap="round"/><path d="M99 230q13-73 61-73t61 73z" fill={word==="Мама"?"#C69DB9":"#8EA8BD"}/></g>;
  if(word==="Да") return <g><path d="M115 215V94q0-21 20-21 17 0 17 18V50q0-20 19-20t19 20v43-27q0-19 18-19t18 19v37-14q0-18 17-18t17 18v53q0 78-70 78h-33z" fill="#E2B89D"/><path d="M120 145l27 27 59-70" fill="none" stroke="#6C9C6A" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/></g>;
  return <g><path d="M101 178q25-88 71-88 40 0 58 61" fill="none" stroke="#E1B69A" strokeWidth="39" strokeLinecap="round"/><path d={word==="Пока"?"M105 106q-30-35-49-19M110 119q-42 1-51 19":word==="Дай"?"M225 113q42-6 58 15M229 133q32 22 45 48":"M222 140q41 16 50 50"} fill="none" stroke="#E1B69A" strokeWidth="16" strokeLinecap="round"/><circle cx="172" cy="71" r="28" fill="#E1B69A"/></g>;
}

export function CardArtV3({ word, category }: Props) {
  return <svg className="card-art-v3" viewBox="0 0 320 260" role="img" aria-label={word}>
    <rect width="320" height="260" rx="34" fill="transparent"/>
    {category==="Животные"?<Animal word={word}/>
      :category==="Транспорт"?<Transport word={word}/>
      :category==="Еда"?<Food word={word}/>
      :category==="Предметы"?<ObjectArt word={word}/>
      :category==="Эмоции"?<Face mood={word}/>
      :category==="Действия"?<ActionArt word={word}/>
      :category==="Цвета"?<g><circle cx="160" cy="130" r="88" fill={colors[word]||"#CCC"} stroke={word==="Белый"?"#D6D0C7":"none"} strokeWidth="7"/><circle cx="132" cy="102" r="17" fill="#fff" opacity=".32"/></g>
      :category==="Формы"?<ShapeArt word={word}/>
      :<FirstWordArt word={word}/>} 
  </svg>;
}
