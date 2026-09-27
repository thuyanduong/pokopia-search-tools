import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { SITE_NAME, TOOLS } from "./tools.js";
import Toolbox from "./pages/Toolbox";
import PokemonSearch from "./pages/PokemonSearch";
import ItemSearch from "./pages/ItemSearch";
import RoommateFinder from "./pages/RoommateFinder";
import ComfortOptimizer from "./pages/ComfortOptimizer";
import MoveInMatch from "./pages/MoveInMatch";

/* The paths the tools lived at before they were renamed. */
const LEGACY_ROUTES = [
  { from: "/pokemon", to: "/roommate-finder" },
  { from: "/pokemonAdvanced", to: "/pokemon-search" },
  { from: "/items", to: "/item-search" },
  { from: "/roommate-planner", to: "/comfort-optimizer" },
  { from: "/tenant", to: "/move-in-match" },
];

function RememberPage() {
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem(
      `lastUrl:${location.pathname}`,
      location.pathname + location.search,
    );
  }, [location]);

  return null;
}

function LastUrlLink({ to, children }) {
  const navigate = useNavigate();

  function handleClick(e) {
    e.preventDefault();

    const lastUrl = sessionStorage.getItem(`lastUrl:${to}`);

    navigate(lastUrl || to);
  }

  return (
    <NavLink to={to} onClick={handleClick}>
      {children}
    </NavLink>
  );
}

/* Sends an old path, plus whatever query state it carried, to the tool's new path. */
function LegacyRedirect({ to }) {
  const location = useLocation();

  return <Navigate to={`${to}${location.search}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <RememberPage />

      <nav className="navbar">
        <NavLink className="navbar-brand" to="/">
          {SITE_NAME}
        </NavLink>
        <div className="navbar-links">
          {TOOLS.map((tool) => (
            <LastUrlLink key={tool.path} to={tool.path}>
              {tool.name}
            </LastUrlLink>
          ))}
        </div>
      </nav>

      <main className="page-content">
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Toolbox />} />
            <Route path="/pokemon-search" element={<PokemonSearch />} />
            <Route path="/item-search" element={<ItemSearch />} />
            <Route path="/roommate-finder" element={<RoommateFinder />} />
            <Route path="/comfort-optimizer" element={<ComfortOptimizer />} />
            <Route path="/move-in-match" element={<MoveInMatch />} />

            {LEGACY_ROUTES.map((route) => (
              <Route
                key={route.from}
                path={route.from}
                element={<LegacyRedirect to={route.to} />}
              />
            ))}
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}

export default App;
