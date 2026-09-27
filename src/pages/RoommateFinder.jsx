import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import pokemon from "../data/pokemon.json";
import {
  Autocomplete,
  FavoriteCells,
  Help,
  PageTitle,
  SearchLink,
  SpecialtyCells,
} from "../components.jsx";

function SearchOption({ label, paramName, checked, onChange }) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(paramName, event.target.checked)}
      />
      {label}
    </label>
  );
}

function RoommateFinder() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("pokemon") || "");

  const selectedPokemonName = searchParams.get("pokemon");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const selectedPokemon = pokemon.find(
    (p) => p.name.toLowerCase() === selectedPokemonName?.toLowerCase(),
  );

  const considerFlavor = searchParams.get("considerFlavor") === "true";

  const showConflictingHabitats =
    searchParams.get("showConflictingHabitats") === "true";

  const onlyShowUnderwater = searchParams.get("onlyShowUnderwater") === "true";

  const favoriteLimit = considerFlavor ? 6 : 5;

  const matches = pokemon.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSelect(selected) {
    setSearch(selected.name);

    setSearchParams((params) => {
      params.set("pokemon", selected.name);
      return params;
    });
  }

  function resetSearch() {
    setSearch("");

    setSearchParams((params) => {
      params.delete("pokemon");
      params.delete("considerFlavor");
      params.delete("showConflictingHabitats");
      params.delete("onlyShowUnderwater");

      return params;
    });
  }

  function setFlag(paramName, value) {
    setSearchParams((params) => {
      if (value) {
        params.set(paramName, "true");
      } else {
        params.delete(paramName);
      }

      return params;
    });
  }

  function getCommonFavorites(selected, candidate) {
    return candidate.favorites
      .slice(0, favoriteLimit)
      .filter((favorite) =>
        selected.favorites
          .slice(0, favoriteLimit)
          .some(
            (selectedFavorite) =>
              selectedFavorite.toLowerCase() === favorite.toLowerCase(),
          ),
      ).length;
  }

  function getHabitatPriority(selectedHabitat, candidateHabitat) {
    const selected = selectedHabitat.toLowerCase();
    const candidate = candidateHabitat.toLowerCase();

    const conflicts = {
      dry: "humid",
      humid: "dry",
      warm: "cool",
      cool: "warm",
      bright: "dark",
      dark: "bright",
    };

    if (selected === candidate) {
      return 0;
    }

    if (conflicts[selected] === candidate) {
      return 2;
    }

    return 1;
  }

  const potentialRoommates = selectedPokemon
    ? pokemon
        .filter((p) => p._id !== selectedPokemon._id)
        .map((p) => ({
          pokemon: p,
          commonFavorites: getCommonFavorites(selectedPokemon, p),
          habitatPriority: getHabitatPriority(
            selectedPokemon.idealHabitat,
            p.idealHabitat,
          ),
        }))
        .filter(
          (p) =>
            p.commonFavorites >= 1 &&
            (showConflictingHabitats || p.habitatPriority !== 2) &&
            (!onlyShowUnderwater || p.pokemon.canGoUnderwater),
        )
        .sort((a, b) => {
          if (b.commonFavorites !== a.commonFavorites) {
            return b.commonFavorites - a.commonFavorites;
          }

          if (a.habitatPriority !== b.habitatPriority) {
            return a.habitatPriority - b.habitatPriority;
          }

          return 0;
        })
    : [];

  return (
    <div>
      <div className="roommate-finder-search text-center">
        <PageTitle
          help={
            <p>
              <strong>How to use: </strong>
              Search for a pokémon by name and select it from the dropdown to
              view its stats. You’ll also see potential roommates based on
              shared favorites and ideal habitat. A potential roommate is a
              pokémon that shares at least one favorite category with the
              selected pokémon.
            </p>
          }
        >
          Roommate Finder
        </PageTitle>
        <Autocomplete
          className="pokemon-autocomplete"
          inputClassName="pokemon-autocomplete-input"
          placeholder="Type a Pokémon's name..."
          value={search}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onChange={(event) => {
            setSearch(event.target.value);

            setSearchParams((params) => {
              params.delete("pokemon");
              return params;
            });
          }}
          isOpen={isSearchFocused && !selectedPokemon && matches.length > 0}
          options={matches}
          getKey={(p) => p._id}
          renderOption={(p) => (
            <>
              <img src={p.imageURL} alt="" />
              <span>{p.name}</span>
            </>
          )}
          onSelect={handleSelect}
          keepFocus
        />
      </div>

      {selectedPokemon && (
        <button className="reset-button" onClick={resetSearch}>
          Reset Search
        </button>
      )}

      {selectedPokemon && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Specialties</th>
              <th>Ideal Habitat</th>
              <th colSpan={favoriteLimit}>
                <div className="title">
                  <span>Favorites</span>
                  <Help>
                    This table will link to items in this favorite category.
                  </Help>
                </div>
              </th>
              <th>Can Go Underwater</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                <img
                  src={selectedPokemon.imageURL}
                  alt={selectedPokemon.name}
                  width="100"
                />
              </td>
              <td>
                <SearchLink
                  path="/roommate-finder"
                  params={{ pokemon: selectedPokemon.name }}
                >
                  {selectedPokemon.name}
                </SearchLink>
              </td>
              <td>
                <SpecialtyCells specialties={selectedPokemon.specialties} />
              </td>
              <td>
                <SearchLink
                  path="/pokemon-search"
                  params={{ habitats: selectedPokemon.idealHabitat }}
                >
                  {selectedPokemon.idealHabitat}
                </SearchLink>
              </td>
              <FavoriteCells
                path="/item-search"
                favorites={selectedPokemon.favorites}
                limit={favoriteLimit}
              />
              <td
                className={
                  onlyShowUnderwater && !selectedPokemon.canGoUnderwater
                    ? "highlight-red"
                    : ""
                }
              >
                <SearchLink
                  path="/pokemon-search"
                  params={{ underwater: selectedPokemon.canGoUnderwater }}
                >
                  {selectedPokemon.canGoUnderwater ? "Yes" : "No"}
                </SearchLink>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {selectedPokemon && potentialRoommates.length > 0 && (
        <div className="potential-roommates">
          <PageTitle
            className="potential-roommates-title"
            help={
              <>
                <p>
                  <strong>How to use: </strong>Roommates are ordered by the
                  number of shared favorites, with those sharing more favorites
                  appearing higher on the list. Among pokémon with the same
                  number of shared favorites, priority is given to those with
                  the same ideal habitat. Shared favorites and matching ideal
                  habitats are highlighted in green.
                </p>
                <p>
                  <strong>Consider favorite flavor:</strong> Includes favorite
                  flavor when comparing pokémon for potential roommates.
                </p>

                <p>
                  <strong>Show conflicting habitats:</strong> Includes pokémon
                  whose ideal habitat directly conflicts with the selected
                  pokémon.
                </p>

                <p>
                  <strong>Only show underwater pokémon:</strong> Shows only
                  potential roommates that can go underwater.
                </p>
              </>
            }
          >
            Potential Roommates
          </PageTitle>
          <div className="pokemon-search-options">
            <SearchOption
              label="Consider favorite flavor"
              paramName="considerFlavor"
              checked={considerFlavor}
              onChange={setFlag}
            />

            <SearchOption
              label="Show conflicting habitats"
              paramName="showConflictingHabitats"
              checked={showConflictingHabitats}
              onChange={setFlag}
            />

            <SearchOption
              label="Only show underwater pokémon"
              paramName="onlyShowUnderwater"
              checked={onlyShowUnderwater}
              onChange={setFlag}
            />
          </div>

          <div className="table-count">
            Showing {potentialRoommates.length} potential roommates
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Specialties</th>
                <th>Ideal Habitat</th>
                <th colSpan={favoriteLimit}>
                  <div className="title">
                    <span>Favorites</span>
                    <Help>
                      This table will link to Pokémon that have this favorite
                      category.
                    </Help>
                  </div>
                </th>
                <th>Can Go Underwater</th>
              </tr>
            </thead>

            <tbody>
              {potentialRoommates.map(({ pokemon: roommate }) => (
                <tr key={roommate._id}>
                  <td>
                    <img
                      src={roommate.imageURL}
                      alt={roommate.name}
                      width="100"
                    />
                  </td>
                  <td>
                    <SearchLink
                      path="/roommate-finder"
                      params={{ pokemon: roommate.name }}
                    >
                      {roommate.name}
                    </SearchLink>
                  </td>
                  <td>
                    <SpecialtyCells specialties={roommate.specialties} />
                  </td>
                  <td
                    className={
                      roommate.idealHabitat.toLowerCase() ===
                      selectedPokemon.idealHabitat.toLowerCase()
                        ? "highlight-green"
                        : getHabitatPriority(
                              selectedPokemon.idealHabitat,
                              roommate.idealHabitat,
                            ) === 2
                          ? "highlight-red"
                          : ""
                    }
                  >
                    <SearchLink
                      path="/pokemon-search"
                      params={{ habitats: roommate.idealHabitat }}
                    >
                      {roommate.idealHabitat}
                    </SearchLink>
                  </td>
                  <FavoriteCells
                    path="/pokemon-search"
                    favorites={roommate.favorites}
                    limit={favoriteLimit}
                    highlights={selectedPokemon.favorites.slice(
                      0,
                      favoriteLimit,
                    )}
                  />
                  <td>
                    <SearchLink
                      path="/pokemon-search"
                      params={{ underwater: roommate.canGoUnderwater }}
                    >
                      {roommate.canGoUnderwater ? "Yes" : "No"}
                    </SearchLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RoommateFinder;
