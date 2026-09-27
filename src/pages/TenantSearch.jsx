import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import pokemon from "../data/pokemon.json";
import items from "../data/items.json";
import { Autocomplete, PageTitle } from "../components.jsx";

function TenantSearch() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");

  const [selectedItems, setSelectedItems] = useState(() => {
    const itemNames = searchParams.getAll("item");

    return itemNames
      .map((name) =>
        items.find((item) => item.name.toLowerCase() === name.toLowerCase()),
      )
      .filter(Boolean);
  });

  const [activeSearch, setActiveSearch] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();

    selectedItems.forEach((item) => {
      params.append("item", item.name);
    });

    setSearchParams(params);
  }, [selectedItems, setSearchParams]);

  function getAvailableItems() {
    if (search.length < 3) {
      return [];
    }

    return items.filter(
      (item) =>
        !selectedItems.some((selected) => selected._id === item._id) &&
        item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }

  function resetSearch() {
    setSelectedItems([]);
    setSearch("");
    setActiveSearch(false);
    setSearchParams({});
  }

  function selectItem(item) {
    setSelectedItems((current) => [...current, item]);
    setSearch("");
    setActiveSearch(false);
  }

  function removeItem(itemId) {
    setSelectedItems((current) =>
      current.filter((item) => item._id !== itemId),
    );
  }

  function getPokemonResults() {
    return pokemon
      .map((selectedPokemon) => {
        const scoreBreakdown = [];
        let score = 0;

        selectedItems.forEach((item) => {
          const matchedFavorites = item.favoriteCategories.filter((category) =>
            selectedPokemon.favorites.some(
              (favorite) => favorite.toLowerCase() === category.toLowerCase(),
            ),
          );

          if (matchedFavorites.length > 0) {
            score += matchedFavorites.length;

            scoreBreakdown.push({
              item: item.name,
              favorites: matchedFavorites,
            });
          }
        });

        return {
          ...selectedPokemon,
          score,
          scoreBreakdown,
        };
      })
      .filter((selectedPokemon) => selectedPokemon.score >= 3)
      .sort((a, b) => b.score - a.score);
  }

  const pokemonResults = getPokemonResults();

  return (
    <div>
      <PageTitle
        help={
          <>
            <p>
              <strong>How to use: </strong>
              If you've built or decorated a house and want to find the Pokémon
              who would be happiest living there, add the items in the house to
              see which Pokémon have favorite categories that match and would be
              comfortable in their new home.
            </p>

            <p>
              <strong>Score:</strong> Each matching favorite category is worth 1
              point. Pokémon are ranked by their total score.
            </p>

            <p>
              <strong>Score Breakdown:</strong> Shows which selected items match
              the pokémon's favorite categories.
            </p>
          </>
        }
      >
        Select Furniture for Your House
      </PageTitle>
      <div className="pokemon-autocomplete">
        <Autocomplete
          placeholder="Search items..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => setActiveSearch(true)}
          onBlur={() => setActiveSearch(false)}
          isOpen={activeSearch && search.length >= 3}
          options={getAvailableItems()}
          getKey={(item) => item._id}
          renderOption={(item) => (
            <>
              <img src={item.imageURL} alt="" />
              <span>{item.name}</span>
            </>
          )}
          onSelect={selectItem}
        />
      </div>

      {selectedItems.length > 0 && (
        <div className="tenant-items">
          {selectedItems.map((item) => (
            <div className="card tenant-item-card" key={item._id}>
              <button
                className="clear-button clear-button-card"
                type="button"
                onClick={() => removeItem(item._id)}
              >
                ×
              </button>

              <img src={item.imageURL} alt={item.name} />

              <p>{item.name}</p>
              {item.tag && <p className="tenant-item-card-tag">{item.tag}</p>}
            </div>
          ))}
        </div>
      )}

      {selectedItems.length > 0 && (
        <button className="reset-button" onClick={resetSearch}>
          Reset Items
        </button>
      )}

      {selectedItems.length > 0 && (
        <>
          <div className="table-count">
            Showing {pokemonResults.length} potential tenants
          </div>
          <table className="data-table tenant-results-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Pokémon</th>
                <th>Score</th>
                <th>Score Breakdown</th>
              </tr>
            </thead>

            <tbody>
              {pokemonResults.map((selectedPokemon) => (
                <tr key={selectedPokemon._id}>
                  <td>
                    <img
                      src={selectedPokemon.imageURL}
                      alt={selectedPokemon.name}
                    />
                  </td>

                  <td>{selectedPokemon.name}</td>

                  <td>{selectedPokemon.score}</td>

                  <td>
                    <div className="multi-value-cell">
                      {selectedPokemon.scoreBreakdown.map((breakdown) => (
                        <div key={breakdown.item}>
                          <strong>{breakdown.item}</strong>
                          {" → "}
                          {breakdown.favorites.join(", ")}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default TenantSearch;
