import { useEffect, useRef, useState } from "react";
import { useApp } from "./hooks/useApp";
import { Link, Note } from "./components/UI";
import { ProfileScreen, Reminders } from "./screens/HomeProfile";
import { Today } from "./screens/Today";
import { AgeGuide } from "./screens/AgeGuide";
import {
  Library,
  Favorites,
  Recommendations,
  Article,
  Category,
  Development,
  Games,
  GameDetail,
  GuideDetail,
  Rhymes,
  RhymeDetail,
  Stories,
  StoryDetail,
  Sources,
  Cards,
  NotFound,
} from "./screens/Knowledge";
import {
  Diary,
  Sleep,
  Growth,
  Temperature,
  Medicines,
} from "./screens/Journal";
import {
  Recipes,
  RecipeDetail,
  Fortnight,
  MenuBuilder,
  SafeFood,
} from "./screens/Nutrition";
import { Weather } from "./screens/Weather";
import { Repeat, Words } from "./screens/Audio";
import { Child } from "./screens/Child";
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
      <Child
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
    case "more":
    case "library":
      content = <Library />;
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
      content = <Sleep />;
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
      content = <MenuBuilder />;
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
      content = <GuideDetail key={id} id={id} />;
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
          <GuideDetail id="speech-seven" />
        ) : id === "guide-home" ? (
          <GuideDetail id="safe-home" />
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
      content = [
        "nutrition",
        "sleep",
        "speech",
        "potty",
        "health",
        "guides",
        "regressions",
      ].includes(screen) ? (
        <Category id={screen} />
      ) : (
        <NotFound />
      );
  }
  const active =
    screen === "home"
      ? "home"
      : ["diary", "sleep-log", "growth", "temperature", "medicines", "words"].includes(
            screen,
          )
        ? "diary"
        : ["development", "games", "game", "age-guide", "recommendations"].includes(
              screen,
            )
          ? "development"
          : "library";
  return (
    <>
      <header className="topbar">
        <Link to="home" className="brand">
          <span className="brand-mark">♡</span>BabyGuide
          <span className="brand-dot">•</span>
        </Link>
        <div className="header-actions">
          <Link to="article/red-flags" className="emergency-link">
            SOS
          </Link>
          <Link to="child" className="mode-switch">
            🧸 {data.profile.name || "Ребёнок"}
          </Link>
          <Link to="profile" className="profile-link">
            <span className="avatar">
              {data.profile.name ? data.profile.name[0].toUpperCase() : "Б"}
            </span>
            <span className="sr-only">Профиль ребёнка</span>
          </Link>
        </div>
      </header>
      {error && (
        <div className="storage-warning">
          <Note danger>
            {error} <Link to="profile">Открыть профиль →</Link>
          </Note>
        </div>
      )}
      <main id="main" ref={main} tabIndex={-1} key={screen}>
        {content}
      </main>
      <footer className="footer">
        С заботой о маленьких и больших ♡<br />
        При угрозе жизни — 112. Справочник не заменяет осмотр.
      </footer>
      <nav className="bottom-nav" aria-label="Основная навигация">
        {[
          ["home", "⌂", "Сегодня"],
          ["development", "✦", "Развитие"],
          ["diary", "▤", "Дневник"],
          ["library", "▦", "Библиотека"],
        ].map(([path, icon, label]) => (
          <a
            key={path}
            href={"#" + path}
            className={active === path ? "active" : ""}
            aria-current={active === path ? "page" : undefined}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </a>
        ))}
      </nav>
    </>
  );
}
