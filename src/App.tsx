import { useEffect, useRef, useState } from "react";
import { useApp } from "./hooks/useApp";
import { Link, Note } from "./components/UI";
import { ProfileScreen, Reminders } from "./screens/HomeProfile";
import { Today } from "./screens/Today";
import { AgeGuide } from "./screens/AgeGuide";
import { HealthHub } from "./screens/HealthHub";
import { Routines } from "./screens/Routines";
import { VoiceSettings } from "./screens/VoiceSettings";
import { SleepV3 } from "./screens/SleepV3";
import { MenuBuilderV3 } from "./screens/MenuBuilderV3";
import { FirstAidKit } from "./screens/FirstAidKit";
import { ChildV3 } from "./screens/ChildV3";
import { GuideDetailV3 } from "./screens/GuideDetailV3";
import { ManualsV3 } from "./screens/ManualsV3";
import { NutritionHomeV3 } from "./screens/NutritionHomeV3";
import { MoreV3 } from "./screens/MoreV3";
import {
  Library,
  Favorites,
  Recommendations,
  Article,
  Category,
  Development,
  Games,
  GameDetail,
  Rhymes,
  RhymeDetail,
  Stories,
  StoryDetail,
  Sources,
  Cards,
  NotFound,
} from "./screens/Knowledge";
import { Diary, Growth, Temperature, Medicines } from "./screens/Journal";
import {
  Recipes,
  RecipeDetail,
  Fortnight,
  SafeFood,
} from "./screens/Nutrition";
import { Weather } from "./screens/Weather";
import { Repeat, Words } from "./screens/Audio";
function readRoute() {
  try {
    return decodeURIComponent(location.hash.slice(1) || "home");
  } catch {
    return "missing";
  }
}
function childFlag() {
  try {
    return localStorage.getItem("babyguide.child") === "true";
  } catch {
    return false;
  }
}
export default function App() {
  const { data, error, notify } = useApp();
  const [route, setRoute] = useState(readRoute),
    [child, setChild] = useState(
      () => childFlag() || readRoute().startsWith("child"),
    );
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const change = () => {
      setRoute(readRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    const offline = () =>
      notify("Вы офлайн: справочник и дневники доступны; погода требует сети.");
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("hashchange", change);
      window.removeEventListener("offline", offline);
    };
  }, []);
  useEffect(() => {
    if (route === "child" || route.startsWith("child/")) {
      setChild(true);
      try {
        localStorage.setItem("babyguide.child", "true");
      } catch {}
    }
    main.current?.focus({ preventScroll: true });
    const title = document.querySelector("h1")?.textContent;
    document.title = (title || "BabyGuide") + " · BabyGuide";
  }, [route]);
  useEffect(() => {
    if (child && route !== "child" && !route.startsWith("child/")) {
      history.replaceState(null, "", "#child");
      setRoute("child");
    }
  }, [child, route]);
  if (child || route === "child" || route.startsWith("child/"))
    return (
      <ChildV3
        path={route.startsWith("child") ? route : "child"}
        onExit={() => {
          try {
            localStorage.removeItem("babyguide.child");
          } catch {}
          setChild(false);
          location.hash = "home";
          setRoute("home");
        }}
      />
    );
  const [screen, id] = route.split("/");
  let content;
  switch (screen) {
    case "home":
      content = <Today />;
      break;
    case "age-guide":
      content = <AgeGuide />;
      break;
    case "health":
      content = <HealthHub />;
      break;
    case "first-aid-kit":
      content = <FirstAidKit />;
      break;
    case "manuals":
      content = <ManualsV3 />;
      break;
    case "routines":
      content = <Routines />;
      break;
    case "voice-settings":
      content = <VoiceSettings />;
      break;
    case "more":
      content = <MoreV3 />;
      break;
    case "library":
      content = <Library />;
      break;
    case "nutrition":
      content = <NutritionHomeV3 />;
      break;
    case "recommendations":
      content = <Recommendations />;
      break;
    case "diary":
      content = <Diary />;
      break;
    case "profile":
      content = <ProfileScreen />;
      break;
    case "development":
      content = <Development key={id} selected={id} />;
      break;
    case "growth":
      content = <Growth />;
      break;
    case "sleep-log":
      content = <SleepV3 />;
      break;
    case "temperature":
      content = <Temperature />;
      break;
    case "medicines":
      content = <Medicines />;
      break;
    case "weather":
      content = <Weather />;
      break;
    case "recipes":
      content = <Recipes />;
      break;
    case "recipe":
      content = <RecipeDetail id={id} />;
      break;
    case "menu":
      content = <Fortnight />;
      break;
    case "menu-builder":
      content = <MenuBuilderV3 />;
      break;
    case "safe-food":
      content = <SafeFood />;
      break;
    case "games":
      content = <Games />;
      break;
    case "game":
      content = <GameDetail id={id} />;
      break;
    case "guide":
      content = <GuideDetailV3 key={id} id={id} />;
      break;
    case "rhymes":
      content = <Rhymes />;
      break;
    case "rhyme":
      content = <RhymeDetail id={id} />;
      break;
    case "stories":
      content = <Stories />;
      break;
    case "story":
      content = <StoryDetail id={id} />;
      break;
    case "cards":
      content = <Cards />;
      break;
    case "words":
      content = <Words />;
      break;
    case "repeat":
      content = <Repeat />;
      break;
    case "sources":
      content = <Sources />;
      break;
    case "article":
      content =
        id === "guide-week" ? (
          <GuideDetailV3 id="speech-seven" />
        ) : id === "guide-home" ? (
          <GuideDetailV3 id="safe-home" />
        ) : (
          <Article id={id} />
        );
      break;
    case "favorites":
      content = <Favorites />;
      break;
    case "reminders":
      content = <Reminders />;
      break;
    default:
      content = ["sleep", "speech", "potty", "guides", "regressions"].includes(screen) ? (
        <Category id={screen} />
      ) : (
        <NotFound />
      );
  }
  const active =
    screen === "home"
      ? "home"
      : ["development", "games", "game", "age-guide", "recommendations", "routines", "voice-settings"].includes(screen)
        ? "development"
        : ["nutrition", "recipes", "recipe", "menu", "menu-builder", "safe-food"].includes(screen)
          ? "nutrition"
          : ["diary", "sleep-log", "growth", "temperature", "medicines", "words"].includes(screen)
            ? "diary"
            : "more";
  return (
    <>
      <header className="topbar">
        <Link to="home" className="brand">
          <span className="brand-mark">♡</span>BabyGuide
          <span className="brand-dot">•</span>
        </Link>
        <div className="header-actions">
          <Link to="article/red-flags" className="emergency-link">SOS</Link>
          <Link to="child" className="mode-switch"><span aria-hidden="true">◌</span> {data.profile.name || "Ребёнок"}</Link>
          <Link to="profile" className="profile-link"><span className="avatar">{data.profile.name ? data.profile.name[0].toUpperCase() : "Б"}</span><span className="sr-only">Профиль ребёнка</span></Link>
        </div>
      </header>
      {error && <div className="storage-warning"><Note danger>{error} <Link to="profile">Открыть профиль →</Link></Note></div>}
      <main id="main" ref={main} tabIndex={-1} key={screen}>{content}</main>
      <footer className="footer">С заботой о маленьких и больших ♡<br />При угрозе жизни — 112. Справочник не заменяет осмотр.</footer>
      <nav className="bottom-nav bottom-nav-v3" aria-label="Основная навигация">
        {[
          ["home", "⌂", "Сегодня"],
          ["development", "✦", "Развитие"],
          ["nutrition", "○", "Питание"],
          ["diary", "▤", "Дневник"],
          ["more", "•••", "Ещё"],
        ].map(([path, icon, label]) => (
          <a key={path} href={"#" + path} className={active === path ? "active" : ""} aria-current={active === path ? "page" : undefined}><span aria-hidden="true">{icon}</span>{label}</a>
        ))}
      </nav>
    </>
  );
}