import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import PokemonSearch from "./pages/PokemonSearch";
import PokemonAdvancedSearch from "./pages/PokemonAdvancedSearch";
import ItemSearch from "./pages/ItemSearch";
import RoommatePlanner from "./pages/RoommatePlanner";
import TenantSearch from "./pages/TenantSearch";

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
function App() {
  return (
    <BrowserRouter>
      <RememberPage />

      <nav className="navbar">
        <NavLink className="navbar-brand" to="/">
          Pokopia Search Tools
        </NavLink>
        <div className="navbar-links">
          <LastUrlLink to="/pokemon">Pokémon Compatibility</LastUrlLink>

          <LastUrlLink to="/pokemonAdvanced">
            Pokémon Advanced Search
          </LastUrlLink>

          <LastUrlLink to="/items">Item Search</LastUrlLink>

          <LastUrlLink to="/roommate-planner">Comfort Optimizer</LastUrlLink>

          <LastUrlLink to="/tenant">Tenant Search</LastUrlLink>
        </div>
      </nav>

      <main className="page-content">
        <div className="page-container">
          <Routes>
            <Route path="/pokemon" element={<PokemonSearch />} />
            <Route
              path="/pokemonAdvanced"
              element={<PokemonAdvancedSearch />}
            />
            <Route path="/items" element={<ItemSearch />} />
            <Route path="/roommate-planner" element={<RoommatePlanner />} />
            <Route path="/tenant" element={<TenantSearch />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}

export default App;
