import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import pokemon from "../data/pokemon.json";
import specialties from "../data/pokemonSpecialties.json";
import favorites from "../data/pokemonFavorites.json";
import idealHabitats from "../data/pokemonIdealHabitats.json";
import {
  Autocomplete,
  FavoriteCells,
  FilterChips,
  MatchModeToggle,
  PageTitle,
  SearchLink,
  SpecialtyCells,
} from "../components.jsx";

const FAVORITE_LIMIT = 6;

function readListParam(searchParams, paramName) {
  return searchParams.get(paramName)?.split(",").filter(Boolean) || [];
}

function PokemonSearch() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSpecialties = readListParam(searchParams, "specialties");
  const specialtyMatch = searchParams.get("specialtyMatch") || "OR";
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [specialtySearchActive, setSpecialtySearchActive] = useState(false);

  const selectedFavorites = readListParam(searchParams, "favorites");
  const favoriteMatch = searchParams.get("favoriteMatch") || "OR";
  const [favoriteSearch, setFavoriteSearch] = useState("");
  const [favoriteSearchActive, setFavoriteSearchActive] = useState(false);

  const selectedHabitats = readListParam(searchParams, "habitats");
  const [habitatSearch, setHabitatSearch] = useState("");
  const [habitatSearchActive, setHabitatSearchActive] = useState(false);

  const underwater = searchParams.get("underwater") || "all";

  function matchesIgnoreCase(value1, value2) {
    return value1.toLowerCase() === value2.toLowerCase();
  }

  const filteredPokemon = pokemon.filter((p) => {
    if (selectedSpecialties.length > 0) {
      if (specialtyMatch === "AND") {
        if (
          !selectedSpecialties.every((specialty) =>
            p.specialties.some((value) => matchesIgnoreCase(value, specialty)),
          )
        ) {
          return false;
        }
      } else {
        if (
          !selectedSpecialties.some((specialty) =>
            p.specialties.some((value) => matchesIgnoreCase(value, specialty)),
          )
        ) {
          return false;
        }
      }
    }

    if (selectedFavorites.length > 0) {
      if (favoriteMatch === "AND") {
        if (
          !selectedFavorites.every((favorite) =>
            p.favorites.some((value) => matchesIgnoreCase(value, favorite)),
          )
        ) {
          return false;
        }
      } else {
        if (
          !selectedFavorites.some((favorite) =>
            p.favorites.some((value) => matchesIgnoreCase(value, favorite)),
          )
        ) {
          return false;
        }
      }
    }

    if (
      selectedHabitats.length > 0 &&
      !selectedHabitats.some((habitat) =>
        matchesIgnoreCase(habitat, p.idealHabitat),
      )
    ) {
      return false;
    }

    if (underwater === "yes" && !p.canGoUnderwater) {
      return false;
    }

    if (underwater === "no" && p.canGoUnderwater) {
      return false;
    }

    return true;
  });

  function resetSearch() {
    setSearchParams({});
  }

  function setParam(paramName, value, emptyValue) {
    setSearchParams((params) => {
      if (value === emptyValue) {
        params.delete(paramName);
      } else {
        params.set(paramName, value);
      }

      return params;
    });
  }

  function addFilter(paramName, value) {
    setSearchParams((params) => {
      const current = readListParam(params, paramName);

      current.push(value);
      params.set(paramName, current.join(","));

      return params;
    });
  }

  function removeFilter(paramName, value) {
    setSearchParams((params) => {
      const updated = readListParam(params, paramName).filter(
        (item) => !matchesIgnoreCase(item, value),
      );

      if (updated.length > 0) {
        params.set(paramName, updated.join(","));
      } else {
        params.delete(paramName);
      }

      return params;
    });
  }

  return (
    <div>
      <PageTitle
        help={
          <>
            <p>
              <strong>How to use: </strong>
              Use the filters to narrow down the list of pokémon by their
              specialties, ideal habitat, favorites, or ability to go
              underwater.
            </p>

            <p>
              <strong>Specialties:</strong> Filter by one or more pokémon
              specialties.
            </p>

            <p>
              <strong>Ideal Habitat:</strong> Filter by one or more ideal
              habitats.
            </p>

            <p>
              <strong>Favorites:</strong> Filter by one or more favorite
              preferences.
            </p>

            <p>
              <strong>Underwater:</strong> Filter by whether pokémon can go
              underwater.
            </p>

            <p>
              <strong>Selecting OR / AND:</strong> When multiple values are
              selected, choose whether pokémon must match all selected values
              (AND) or at least one selected value (OR).
            </p>
          </>
        }
      >
        Pokémon Search
      </PageTitle>
      <div className="four-section-search">
        <div className="four-search-section">
          <h2 className="text-center">Specialties</h2>

          <Autocomplete
            className="four-section-search-bar"
            placeholder="Search specialties..."
            value={specialtySearch}
            onChange={(event) => setSpecialtySearch(event.target.value)}
            onFocus={() => setSpecialtySearchActive(true)}
            onBlur={() => setSpecialtySearchActive(false)}
            isOpen={specialtySearchActive}
            options={specialties
              .filter((specialty) =>
                specialty.name
                  .toLowerCase()
                  .includes(specialtySearch.toLowerCase()),
              )
              .filter(
                (specialty) =>
                  !selectedSpecialties.some((selected) =>
                    matchesIgnoreCase(selected, specialty.name),
                  ),
              )}
            getKey={(specialty) => specialty.name}
            onSelect={(specialty) => {
              addFilter("specialties", specialty.name);
              setSpecialtySearch("");
            }}
          />

          <FilterChips
            values={selectedSpecialties}
            onRemove={(specialty) => removeFilter("specialties", specialty)}
          />

          {selectedSpecialties.length > 1 && (
            <MatchModeToggle
              groupName="specialtyMatch"
              value={specialtyMatch}
              onChange={(value) => setParam("specialtyMatch", value, "OR")}
            />
          )}
        </div>

        <div className="four-search-section">
          <h2 className="text-center">Ideal Habitat</h2>

          <Autocomplete
            className="four-section-search-bar"
            placeholder="Search habitats..."
            value={habitatSearch}
            onChange={(event) => setHabitatSearch(event.target.value)}
            onFocus={() => setHabitatSearchActive(true)}
            onBlur={() => setHabitatSearchActive(false)}
            isOpen={habitatSearchActive}
            options={idealHabitats
              .filter((habitat) =>
                habitat.name.toLowerCase().includes(habitatSearch.toLowerCase()),
              )
              .filter(
                (habitat) =>
                  !selectedHabitats.some((selected) =>
                    matchesIgnoreCase(selected, habitat.name),
                  ),
              )}
            getKey={(habitat) => habitat.name}
            onSelect={(habitat) => {
              addFilter("habitats", habitat.name);
              setHabitatSearch("");
            }}
          />

          <FilterChips
            values={selectedHabitats}
            onRemove={(habitat) => removeFilter("habitats", habitat)}
          />

          {selectedHabitats.length > 1 && <MatchModeToggle readOnly />}
        </div>

        <div className="four-search-section">
          <h2 className="text-center">Favorites</h2>

          <Autocomplete
            className="four-section-search-bar"
            placeholder="Search favorites..."
            value={favoriteSearch}
            onChange={(event) => setFavoriteSearch(event.target.value)}
            onFocus={() => setFavoriteSearchActive(true)}
            onBlur={() => setFavoriteSearchActive(false)}
            isOpen={favoriteSearchActive}
            options={favorites
              .filter((favorite) =>
                favorite.name
                  .toLowerCase()
                  .includes(favoriteSearch.toLowerCase()),
              )
              .filter(
                (favorite) =>
                  !selectedFavorites.some((selected) =>
                    matchesIgnoreCase(selected, favorite.name),
                  ),
              )}
            getKey={(favorite) => favorite.name}
            onSelect={(favorite) => {
              addFilter("favorites", favorite.name);
              setFavoriteSearch("");
            }}
          />

          <FilterChips
            values={selectedFavorites}
            onRemove={(favorite) => removeFilter("favorites", favorite)}
          />

          {selectedFavorites.length > 1 && (
            <MatchModeToggle
              groupName="favoriteMatch"
              value={favoriteMatch}
              onChange={(value) => setParam("favoriteMatch", value, "OR")}
            />
          )}
        </div>

        <div className="four-search-section">
          <h2 className="text-center">Underwater</h2>

          <select
            className="search-input"
            value={underwater}
            onChange={(event) =>
              setParam("underwater", event.target.value, "all")
            }
          >
            <option value="all">All Pokémon</option>
            <option value="yes">Underwater only</option>
            <option value="no">No underwater</option>
          </select>
        </div>
      </div>

      {searchParams.toString() && (
        <button className="reset-button" onClick={resetSearch}>
          Reset Search
        </button>
      )}

      <div className="search-results">
        <div className="table-count">
          {filteredPokemon.length} Pokémon found
        </div>
        {filteredPokemon.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Specialties</th>
                <th>Ideal Habitat</th>
                <th colSpan={FAVORITE_LIMIT}>Favorites</th>
                <th>Can Go Underwater</th>
              </tr>
            </thead>

            <tbody>
              {filteredPokemon.map((p) => (
                <tr key={p.name}>
                  <td>
                    <img src={p.imageURL} alt={p.name} width="100" />
                  </td>
                  <td>
                    <SearchLink path="/roommate-finder" params={{ pokemon: p.name }}>
                      {p.name}
                    </SearchLink>
                  </td>
                  <td>
                    <SpecialtyCells specialties={p.specialties} />
                  </td>
                  <td>
                    <SearchLink
                      path="/pokemon-search"
                      params={{ habitats: p.idealHabitat }}
                    >
                      {p.idealHabitat}
                    </SearchLink>
                  </td>
                  <FavoriteCells
                    path="/pokemon-search"
                    favorites={p.favorites}
                    limit={FAVORITE_LIMIT}
                  />
                  <td>
                    <SearchLink
                      path="/pokemon-search"
                      params={{ underwater: p.canGoUnderwater }}
                    >
                      {p.canGoUnderwater ? "Yes" : "No"}
                    </SearchLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PokemonSearch;
