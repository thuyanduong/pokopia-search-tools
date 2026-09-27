import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import pokemon from "../data/pokemon.json";
import favorites from "../data/itemsFavorites.json";
import items from "../data/items.json";
import {
  Autocomplete,
  Chip,
  PageTitle,
  RecommendationSection,
} from "../components.jsx";

const POKEMON_SLOTS = [0, 1, 2, 3];

const CONFLICTING_HABITATS = [
  ["Cool", "Warm"],
  ["Dark", "Bright"],
  ["Humid", "Dry"],
];

function getPokemonFromParams(searchParams) {
  return POKEMON_SLOTS.map((index) => {
    const name = searchParams.get(`pokemon${index + 1}`);

    return (
      pokemon.find((p) => p.name.toLowerCase() === name?.toLowerCase()) || null
    );
  });
}

function getSearchesFromParams(searchParams) {
  return POKEMON_SLOTS.map(
    (index) => searchParams.get(`pokemon${index + 1}`) || "",
  );
}

function RoommatePlanner() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedPokemon, setSelectedPokemon] = useState(() =>
    getPokemonFromParams(searchParams),
  );

  const [searches, setSearches] = useState(() =>
    getSearchesFromParams(searchParams),
  );

  const [activeSearch, setActiveSearch] = useState([
    false,
    false,
    false,
    false,
  ]);

  // Keep the URL synchronized with the selected Pokémon.
  useEffect(() => {
    const params = {};

    selectedPokemon.forEach((selected, index) => {
      if (selected) {
        params[`pokemon${index + 1}`] = selected.name;
      }
    });

    setSearchParams(params);
  }, [selectedPokemon, setSearchParams]);

  // Determine which favorite categories are shared by the selected Pokémon.
  const favoriteCategoryCounts = favorites
    .map((favorite) => {
      const count = selectedPokemon.reduce((count, selected) => {
        if (
          selected?.favorites.some(
            (pokemonFavorite) =>
              pokemonFavorite.toLowerCase() === favorite.name.toLowerCase(),
          )
        ) {
          return count + 1;
        }

        return count;
      }, 0);

      return {
        name: favorite.name,
        count,
      };
    })
    .filter((favorite) => favorite.count > 0)
    .sort((a, b) => b.count - a.count);

  function getRecommendations(filter) {
    return items
      .filter(filter)
      .map((item) => {
        const matchedCategories = item.favoriteCategories.filter((category) =>
          favoriteCategoryCounts.some(
            (favorite) =>
              favorite.name.toLowerCase() === category.toLowerCase(),
          ),
        );

        const pokemonSatisfied = selectedPokemon
          .filter((selected) =>
            selected?.favorites.some((favorite) =>
              matchedCategories.some(
                (category) => category.toLowerCase() === favorite.toLowerCase(),
              ),
            ),
          )
          .map((selected) => ({
            name: selected.name,
            matchedCategories: matchedCategories.filter((category) =>
              selected.favorites.some(
                (favorite) => favorite.toLowerCase() === category.toLowerCase(),
              ),
            ),
          }));

        return {
          ...item,
          matchedCategories,
          categoryMatchedCount: matchedCategories.length,
          pokemonSatisfied,
        };
      })
      .filter((item) => item.categoryMatchedCount > 0)
      .sort((a, b) => b.categoryMatchedCount - a.categoryMatchedCount);
  }

  const toyRecommendations = getRecommendations((item) => item.tag === "Toy");

  const relaxationRecommendations = getRecommendations(
    (item) => item.tag === "Relaxation",
  );

  const decorationRecommendations = getRecommendations(
    (item) => item.tag === "Decoration",
  );

  const everythingElseRecommendations = getRecommendations(
    (item) =>
      item.tag !== "Toy" &&
      item.tag !== "Relaxation" &&
      item.tag !== "Decoration",
  );

  function hasHabitatConflict(index) {
    const habitat = selectedPokemon[index]?.idealHabitat;

    if (!habitat) {
      return false;
    }

    return selectedPokemon.some(
      (selected, selectedIndex) =>
        selectedIndex !== index &&
        selected &&
        CONFLICTING_HABITATS.some(
          ([first, second]) =>
            (habitat === first && selected.idealHabitat === second) ||
            (habitat === second && selected.idealHabitat === first),
        ),
    );
  }

  function updateSearches(index, value) {
    setSearches((current) => {
      const updated = [...current];
      updated[index] = value;
      return updated;
    });
  }

  function clearSelectedPokemon(index) {
    setSelectedPokemon((current) => {
      const updated = [...current];
      updated[index] = null;
      return updated;
    });
  }

  function setSearchActive(index, isActive) {
    setActiveSearch((current) => {
      const updated = [...current];
      updated[index] = isActive;
      return updated;
    });
  }

  function handleSearchChange(index, value) {
    updateSearches(index, value);
    clearSelectedPokemon(index);
  }

  function selectPokemon(index, selected) {
    setSelectedPokemon((current) => {
      const updated = [...current];
      updated[index] = selected;
      return updated;
    });

    updateSearches(index, selected.name);
    setSearchActive(index, false);
  }

  function removePokemon(index) {
    clearSelectedPokemon(index);
    updateSearches(index, "");
  }

  function resetSearch() {
    setSelectedPokemon([null, null, null, null]);
    setSearches(["", "", "", ""]);
    setActiveSearch([false, false, false, false]);
    setSearchParams({});
  }

  function getAvailablePokemon(index) {
    return pokemon.filter(
      (candidate) =>
        !selectedPokemon.some(
          (selected, selectedIndex) =>
            selectedIndex !== index && selected?._id === candidate._id,
        ) && candidate.name.toLowerCase().includes(searches[index].toLowerCase()),
    );
  }

  function getHighlightClass(count) {
    if (count >= 3) {
      return "highlight-green";
    }

    if (count === 2) {
      return "highlight-light-green";
    }

    return "";
  }

  return (
    <div>
      <PageTitle
        help={
          <>
            <p>
              <strong>How to use: </strong>
              Select up to four pokémon to live together and find items that
              satisfy their favorite categories. Use these items in their shared
              home to maximize their comfort.
            </p>

            <p>
              <strong>Favorite Categories:</strong> Categories are ranked by how
              many selected pokémon have that favorite.
            </p>

            <p>
              <strong>Recommendations:</strong> Recommended items are grouped by
              item tag and ranked by how many favorite categories they satisfy.
            </p>

            <p>
              <strong>Pokémon Satisfied:</strong> Shows which selected pokémon
              have their favorite categories satisfied by each recommended item.
            </p>
          </>
        }
      >
        Comfort Optimizer
      </PageTitle>
      <div className="four-section-search">
        {POKEMON_SLOTS.map((index) => {
          const selected = selectedPokemon[index];

          return (
            <div className="four-search-section" key={index}>
              <h2 className="text-center">Pokémon {index + 1}</h2>

              <Autocomplete
                className="four-section-search-bar"
                placeholder="Search Pokémon..."
                value={searches[index]}
                onChange={(event) =>
                  handleSearchChange(index, event.target.value)
                }
                onFocus={() => setSearchActive(index, true)}
                onBlur={() => setSearchActive(index, false)}
                isOpen={activeSearch[index]}
                options={getAvailablePokemon(index)}
                getKey={(candidate) => candidate._id}
                renderOption={(candidate) => (
                  <>
                    <img src={candidate.imageURL} alt="" />
                    <span>{candidate.name}</span>
                  </>
                )}
                onSelect={(candidate) => selectPokemon(index, candidate)}
              >
                {selected && (
                  <button
                    className="clear-button clear-button-input"
                    type="button"
                    onClick={() => removePokemon(index)}
                  >
                    ×
                  </button>
                )}
              </Autocomplete>

              {selected && (
                <div className="card roommate-pokemon-card">
                  <button
                    className="clear-button clear-button-card"
                    type="button"
                    onClick={() => removePokemon(index)}
                  >
                    ×
                  </button>

                  <p className="roommate-pokemon-name">{selected.name}</p>

                  <img src={selected.imageURL} alt={selected.name} />

                  <div className="roommate-pokemon-habitat">
                    <strong>Ideal Habitat:</strong>

                    <Chip
                      className={
                        hasHabitatConflict(index) ? "highlight-red" : ""
                      }
                    >
                      {selected.idealHabitat}
                    </Chip>
                  </div>

                  <p className="roommate-pokemon-favorites-title">Favorites:</p>

                  <div className="roommate-pokemon-favorites">
                    {selected.favorites.slice(0, 5).map((favorite) => (
                      <Chip key={favorite}>{favorite}</Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedPokemon.some(Boolean) ? (
        <button className="reset-button" onClick={resetSearch}>
          Reset Pokémon
        </button>
      ) : null}

      {selectedPokemon.some(Boolean) && (
        <>
          <div className="favorite-categories">
            <table className="data-table favorite-categories-table">
              <thead>
                <tr>
                  <th>Favorite Categories</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    <div className="favorite-category-cards">
                      {favoriteCategoryCounts.map((favorite) => (
                        <div
                          className={`favorite-category-card ${getHighlightClass(
                            favorite.count,
                          )}`}
                          key={favorite.name}
                        >
                          {favorite.name} ({favorite.count})
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <RecommendationSection
            title="Toy Recommendations"
            items={toyRecommendations}
          />

          <RecommendationSection
            title="Relaxation Recommendations"
            items={relaxationRecommendations}
          />

          <RecommendationSection
            title="Decoration Recommendations"
            items={decorationRecommendations}
          />

          <RecommendationSection
            title="Other Favorite Items"
            items={everythingElseRecommendations}
          />
        </>
      )}
    </div>
  );
}

export default RoommatePlanner;
