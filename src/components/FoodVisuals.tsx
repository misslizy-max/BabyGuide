import { useId } from "react";

type FoodVisualProps = {
  id: string;
  className?: string;
  title?: string;
};

const grainColors: Record<string, [string, string]> = {
  oats: ["#ead5a2", "#c79f62"],
  buckwheat: ["#9a6842", "#6e442c"],
  rice: ["#fff8df", "#ead9af"],
  millet: ["#f0cc5b", "#d0a83e"],
  bulgur: ["#d6ad6b", "#b8874d"],
};

export function FoodVisual({ id, className = "", title }: FoodVisualProps) {
  const uid = useId().replace(/:/g, "");
  const common = { className: `food-svg ${className}`, viewBox: "0 0 120 120", role: title ? "img" : undefined, "aria-label": title } as const;
  const shadow = <ellipse cx="60" cy="99" rx="34" ry="8" fill="#3a2d2118" />;

  if (id === "carrot") return <svg {...common}><defs><linearGradient id={`${uid}a`} x1="0" x2="1"><stop stopColor="#f79a31"/><stop offset="1" stopColor="#e86e22"/></linearGradient></defs>{shadow}<path d="M57 26C46 38 39 59 42 84c1 9 7 13 12 4 12-21 20-44 17-55-2-8-8-12-14-7Z" fill={`url(#${uid}a)`}/><path d="M57 27c-8-11-14-15-20-14 0 7 5 13 15 19M61 25c1-12 5-19 11-22 4 7 2 15-5 25M65 29c9-8 16-10 22-7-2 7-9 11-20 13" fill="none" stroke="#4c8f4d" strokeWidth="6" strokeLinecap="round"/><path d="M48 51l12 4M46 66l10 3M45 78l8 2" stroke="#c95d1c" strokeWidth="2" strokeLinecap="round"/></svg>;
  if (id === "zucchini" || id === "cucumber") return <svg {...common}><defs><linearGradient id={`${uid}a`} x1="0" x2="1"><stop stopColor="#85b65e"/><stop offset="1" stopColor="#3e7f43"/></linearGradient></defs>{shadow}<g transform="rotate(-15 60 58)"><rect x="28" y="38" width="67" height="34" rx="17" fill={`url(#${uid}a)`}/><ellipse cx="92" cy="55" rx="8" ry="14" fill="#d6e2a4"/><circle cx="91" cy="50" r="1.3" fill="#78945a"/><circle cx="88" cy="56" r="1.2" fill="#78945a"/><circle cx="94" cy="60" r="1.2" fill="#78945a"/><path d="M34 47c17-6 34-6 49-2" stroke="#b8d491" strokeWidth="2.4" strokeLinecap="round" opacity=".6"/></g></svg>;
  if (id === "broccoli") return <svg {...common}>{shadow}<path d="M55 57c-2 18-5 31-13 39h33c-8-11-11-23-10-39Z" fill="#77a65d"/><circle cx="48" cy="42" r="18" fill="#4f8a48"/><circle cx="67" cy="39" r="19" fill="#4a8243"/><circle cx="78" cy="50" r="15" fill="#5a934f"/><circle cx="36" cy="53" r="14" fill="#5b984f"/><circle cx="57" cy="53" r="17" fill="#4b8747"/></svg>;
  if (id === "cauliflower") return <svg {...common}>{shadow}<path d="M54 62c-2 13-6 24-14 34h38c-8-10-12-22-12-34Z" fill="#83a65f"/><circle cx="45" cy="46" r="17" fill="#f4edd8"/><circle cx="63" cy="39" r="19" fill="#fff6df"/><circle cx="78" cy="49" r="15" fill="#eee5cf"/><circle cx="35" cy="57" r="13" fill="#f7efd9"/><circle cx="59" cy="57" r="18" fill="#fff5dc"/></svg>;
  if (id === "pumpkin") return <svg {...common}>{shadow}<path d="M57 29c-3-9 0-16 8-19" stroke="#58794a" strokeWidth="6" strokeLinecap="round"/><ellipse cx="60" cy="64" rx="39" ry="30" fill="#e9852c"/><ellipse cx="48" cy="64" rx="18" ry="29" fill="#f49a35"/><ellipse cx="71" cy="64" rx="17" ry="29" fill="#df7524"/><path d="M60 35v57" stroke="#c5601e" strokeWidth="2" opacity=".55"/></svg>;
  if (id === "potato") return <svg {...common}>{shadow}<path d="M32 40c13-15 43-18 57-4 13 13 9 42-7 55-15 12-43 9-55-8-10-15-6-31 5-43Z" fill="#c59a66"/><circle cx="48" cy="51" r="2" fill="#8a6845"/><circle cx="72" cy="43" r="2.2" fill="#8a6845"/><circle cx="78" cy="68" r="2" fill="#8a6845"/><circle cx="45" cy="76" r="2.2" fill="#8a6845"/></svg>;
  if (["chicken", "turkey"].includes(id)) return <svg {...common}><defs><linearGradient id={`${uid}a`} x1="0" x2="1"><stop stopColor="#d99b68"/><stop offset="1" stopColor="#b96e43"/></linearGradient></defs>{shadow}<path d="M42 34c18-10 39-1 43 14 4 13-4 29-18 36-13 6-29 1-35-10-7-12-2-32 10-40Z" fill={`url(#${uid}a)`}/><path d="M78 77c7 4 11 9 12 15 5-3 10-1 12 3 3 6-3 11-9 10-4 6-12 6-15 1-2-4 0-8 4-11-3-5-7-8-12-11Z" fill="#f3e8d5"/><path d="M47 45c10-5 23-2 29 6" stroke="#f1c49b" strokeWidth="3" strokeLinecap="round" opacity=".6"/></svg>;
  if (id === "beef") return <svg {...common}>{shadow}<path d="M26 59c6-21 28-34 52-28 22 6 31 26 21 45-10 19-35 27-55 17-16-8-23-20-18-34Z" fill="#9c4d43"/><path d="M37 60c8-14 24-21 40-16 13 4 18 14 14 24-5 12-19 19-33 16-13-3-25-12-21-24Z" fill="#d68473"/><path d="M44 60c9-8 21-10 32-5" stroke="#f2c3ae" strokeWidth="4" strokeLinecap="round"/></svg>;
  if (id === "fish" || id === "salmon") return <svg {...common}>{shadow}<path d="M29 55c15-16 39-22 59-10 7 4 12 10 16 17-7 7-14 13-23 17-19 9-40 5-53-8 6-5 6-11 1-16Z" fill={id==="salmon"?"#e78b72":"#e8d8b5"}/><path d="M27 54 12 40c-2 13 0 25 9 35l8-7" fill="#83a7aa"/><circle cx="87" cy="57" r="2.5" fill="#443d38"/><path d="M45 55c11-5 24-5 35 0M47 65c11 4 21 4 31 0" stroke="#ffffffaa" strokeWidth="2" strokeLinecap="round"/></svg>;
  if (id === "egg") return <svg {...common}>{shadow}<path d="M31 63c0-23 12-42 29-42 18 0 31 19 31 42S78 98 60 98 31 87 31 63Z" fill="#f6efe1" stroke="#e3d6c4" strokeWidth="2"/><circle cx="60" cy="64" r="17" fill="#f4bd3d"/><circle cx="55" cy="59" r="4" fill="#ffd96b" opacity=".8"/></svg>;
  if (grainColors[id]) { const [a,b]=grainColors[id]; return <svg {...common}>{shadow}<path d="M25 50h70c0 28-14 46-35 46S25 78 25 50Z" fill="#e9ddd0"/><ellipse cx="60" cy="50" rx="35" ry="12" fill="#f5efe5"/><ellipse cx="60" cy="51" rx="30" ry="9" fill={a}/>{Array.from({length:10},(_,i)=><ellipse key={i} cx={38+(i%5)*11} cy={48+(i%2)*6} rx="3.5" ry="2" fill={b} transform={`rotate(${(i%3)*18} ${38+(i%5)*11} ${48+(i%2)*6})`}/>)}</svg>; }
  if (id === "curd" || id === "yogurt") return <svg {...common}>{shadow}<path d="M31 42h58l-5 50H36Z" fill="#e8d8cc"/><ellipse cx="60" cy="42" rx="29" ry="10" fill="#fff9ef"/><ellipse cx="60" cy="43" rx="23" ry="7" fill="#fffdf8"/><circle cx="50" cy="43" r="2" fill="#e8e0d6"/><circle cx="65" cy="45" r="2" fill="#e8e0d6"/><circle cx="73" cy="41" r="1.8" fill="#e8e0d6"/></svg>;
  if (id === "pear") return <svg {...common}>{shadow}<path d="M61 25c-1-9 2-15 9-20" stroke="#6e7446" strokeWidth="5" strokeLinecap="round"/><path d="M60 32c-6 0-11 5-13 13-3 12-15 17-18 31-3 15 10 27 30 27 21 0 34-12 31-28-3-13-15-19-18-30-2-8-6-13-12-13Z" fill="#b8cf67"/><path d="M66 18c7-7 15-8 21-5-3 7-9 11-18 11Z" fill="#5f8e51"/></svg>;
  if (id === "apple") return <svg {...common}>{shadow}<path d="M60 26c-1-9 2-15 8-20" stroke="#6b5338" strokeWidth="5" strokeLinecap="round"/><path d="M61 36c-16-12-39 2-38 25 1 24 19 42 37 42 20 0 38-18 37-42-1-22-21-36-36-25Z" fill="#d94a43"/><path d="M66 22c8-8 17-8 23-4-4 8-11 11-20 10Z" fill="#5d8b4d"/><path d="M39 53c5-8 12-11 20-12" stroke="#f18b83" strokeWidth="4" strokeLinecap="round" opacity=".7"/></svg>;
  if (id === "banana") return <svg {...common}>{shadow}<path d="M27 37c4 30 24 48 53 48 9 0 17-3 24-8-17 2-30-4-39-16-8-11-10-21-9-31-10 8-19 10-29 7Z" fill="#f2cf4d"/><path d="M27 37c-4-2-8-6-9-11M56 30c2-5 1-9-2-13" stroke="#8d7b33" strokeWidth="4" strokeLinecap="round"/><path d="M43 43c8 18 22 27 42 29" stroke="#d6af32" strokeWidth="3" strokeLinecap="round"/></svg>;
  if (id === "avocado") return <svg {...common}>{shadow}<path d="M60 20c-11 0-18 14-23 29-6 18-18 30-14 44 4 14 20 22 37 22s33-8 37-22c4-14-8-26-14-44-5-15-12-29-23-29Z" fill="#557e45"/><path d="M60 30c-9 0-14 12-18 25-5 16-13 26-10 36 3 9 14 14 28 14s25-5 28-14c3-10-5-20-10-36-4-13-9-25-18-25Z" fill="#bdd46c"/><circle cx="60" cy="76" r="16" fill="#9c6137"/></svg>;
  if (id === "tomato") return <svg {...common}>{shadow}<circle cx="60" cy="66" r="34" fill="#df4f3f"/><path d="M60 33c-8-9-18-11-26-8 5 4 9 10 11 17M60 33c8-9 18-11 26-8-5 4-9 10-11 17M60 33c0-8 4-14 10-18" fill="none" stroke="#4f8a4e" strokeWidth="6" strokeLinecap="round"/><path d="M39 53c7-7 16-10 26-9" stroke="#f0877d" strokeWidth="3" strokeLinecap="round"/></svg>;
  if (id === "berries") return <svg {...common}>{shadow}{[[45,55],[63,48],[76,61],[52,72],[69,76]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="12" fill="#5366a6"/><circle cx={x-3} cy={y-4} r="2.5" fill="#8692c2"/></g>)}<path d="M58 38c2-9 7-15 15-18M57 39c-6-7-12-9-18-7" stroke="#56834d" strokeWidth="4" strokeLinecap="round"/></svg>;
  if (id === "pasta") return <svg {...common}>{shadow}<path d="M24 52h72c-2 28-16 44-36 44S26 80 24 52Z" fill="#e7dacb"/><ellipse cx="60" cy="52" rx="36" ry="12" fill="#f2e8dc"/>{[0,1,2,3,4,5].map(i=><path key={i} d={`M${34+i*9} 49c8-10 12 12 20 2`} stroke="#e3b554" strokeWidth="5" strokeLinecap="round" fill="none"/>)}</svg>;
  if (id === "bread") return <svg {...common}>{shadow}<path d="M30 52c0-19 14-30 31-30 18 0 30 11 30 30v38H30Z" fill="#c98c51"/><path d="M37 52c0-13 10-22 24-22s23 9 23 22v31H37Z" fill="#e9c889"/><path d="M49 41c6-4 13-4 19 0M47 55c8-4 17-4 25 0" stroke="#d1a865" strokeWidth="2" strokeLinecap="round"/></svg>;
  if (id === "peas") return <svg {...common}>{shadow}<path d="M21 67c10-24 31-38 60-34 14 2 23 9 28 18-18 22-43 34-70 31-10-1-16-6-18-15Z" fill="#6ea25b"/><circle cx="43" cy="63" r="8" fill="#a9cc69"/><circle cx="62" cy="57" r="8" fill="#a4c867"/><circle cx="82" cy="52" r="8" fill="#a8ce6b"/></svg>;
  if (["lentil","beans","chickpea"].includes(id)) return <svg {...common}>{shadow}<path d="M25 50h70c0 28-14 46-35 46S25 78 25 50Z" fill="#e9ddd0"/><ellipse cx="60" cy="50" rx="35" ry="12" fill="#f5efe5"/>{Array.from({length:8},(_,i)=><ellipse key={i} cx={38+(i%4)*15} cy={50+(i%2)*10} rx="6" ry="4.5" fill={id==="chickpea"?"#d8b16e":id==="lentil"?"#a66b45":"#834b43"} transform={`rotate(${i*17} ${38+(i%4)*15} ${50+(i%2)*10})`}/>)}</svg>;
  if (id === "tofu") return <svg {...common}>{shadow}<path d="M32 43 60 29l30 14-29 16Z" fill="#fff5d9"/><path d="m32 43 29 16v32L32 75Z" fill="#eee2c8"/><path d="m61 59 29-16v32L61 91Z" fill="#e5d6b9"/></svg>;
  if (id === "milk" || id === "kefir") return <svg {...common}>{shadow}<path d="M40 32h40l7 61H33Z" fill="#f5f1e9"/><path d="M45 21h30l5 11H40Z" fill="#d8e1e6"/><path d="M40 54h40" stroke="#b6cad3" strokeWidth="8"/><path d="M47 70h26" stroke="#ffffff" strokeWidth="4" strokeLinecap="round"/></svg>;

  return <svg {...common}>{shadow}<ellipse cx="60" cy="62" rx="36" ry="27" fill="#e8dbc9"/><path d="M43 61c8-12 20-17 34-10 9 4 13 12 12 21-13 9-29 12-45 6-7-4-7-11-1-17Z" fill="#8da579"/></svg>;
}

export function MealPlateVisual({ foods, className = "", label = "Тарелка с едой" }: { foods: string[]; className?: string; label?: string }) {
  const positions = ["food-pos-a","food-pos-b","food-pos-c","food-pos-d","food-pos-e","food-pos-f"];
  return <div className={`meal-plate-visual ${className}`} role="img" aria-label={label}>
    <svg className="real-plate-svg" viewBox="0 0 240 190" aria-hidden="true">
      <defs><radialGradient id="plateFill" cx="50%" cy="42%"><stop offset="0" stopColor="#fffefb"/><stop offset=".72" stopColor="#f6f1ea"/><stop offset="1" stopColor="#ded4c7"/></radialGradient></defs>
      <ellipse cx="120" cy="165" rx="76" ry="13" fill="#493b2e18"/>
      <ellipse cx="120" cy="92" rx="91" ry="68" fill="url(#plateFill)" stroke="#d7cec2" strokeWidth="6"/>
      <ellipse cx="120" cy="92" rx="68" ry="49" fill="#fffdf9" stroke="#ece4da" strokeWidth="2"/>
      <path d="M55 71c12-25 34-39 64-42" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity=".85"/>
    </svg>
    {foods.slice(0,6).map((id,index)=><FoodVisual key={`${id}-${index}`} id={id} className={`plate-food ${positions[index]}`} />)}
  </div>;
}
