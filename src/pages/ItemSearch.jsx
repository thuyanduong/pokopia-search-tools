import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import items from "../data/items.json";
import categories from "../data/itemsCategories.json";
import tags from "../data/itemsTags.json";
import favorites from "../data/itemsFavorites.json";
import {
  Autocomplete,
  FilterChips,
  MatchModeToggle,
  PageTitle,
  SearchLink,
} from "../components.jsx";

const NO_TAG = "__NO_TAG__";

function matchesIgnoreCase(value1, value2) {
  return value1.toLowerCase() === value2.toLowerCase();
}

function readListParam(searchParams, paramName) {
  return searchParams.get(paramName)?.split(",").filter(Boolean) || [];
}

function ItemSearch() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategories = readListParam(searchParams, "categories");

  const selectedTags = readListParam(searchParams, "tags");

  const selectedFavorites = readListParam(searchParams, "favorites");

  const favoriteMatch = searchParams.get("favoriteMatch") || "OR";
  const nameFilter = searchParams.get("name") || "";

  const [nameSearch, setNameSearch] = useState(nameFilter);
  const [nameSearchActive, setNameSearchActive] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [categorySearchActive, setCategorySearchActive] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [tagSearchActive, setTagSearchActive] = useState(false);
  const [favoriteSearch, setFavoriteSearch] = useState("");
  const [favoriteSearchActive, setFavoriteSearchActive] = useState(false);

  const nameMatches =
    nameSearch.length >= 3
      ? items
          .filter((item) =>
            item.name.toLowerCase().includes(nameSearch.toLowerCase()),
          )
          .slice(0, 20)
      : [];

  const filteredItems = items.filter((item) => {
    if (
      nameFilter.length >= 3 &&
      !item.name.toLowerCase().includes(nameFilter.toLowerCase())
    ) {
      return false;
    }

    if (
      selectedCategories.length > 0 &&
      !selectedCategories.some((category) =>
        matchesIgnoreCase(category, item.category),
      )
    ) {
      return false;
    }

    if (selectedTags.length > 0) {
      const matchesTag = selectedTags.some((tag) => {
        if (tag === NO_TAG) {
          return item.tag === "";
        }

        return item.tag && matchesIgnoreCase(tag, item.tag);
      });

      if (!matchesTag) {
        return false;
      }
    }

    if (selectedFavorites.length > 0) {
      const matchesFavorite = (favorite) =>
        item.favoriteCategories.some((value) =>
          matchesIgnoreCase(value, favorite),
        );

      if (favoriteMatch === "AND") {
        if (!selectedFavorites.every(matchesFavorite)) {
          return false;
        }
      } else {
        if (!selectedFavorites.some(matchesFavorite)) {
          return false;
        }
      }
    }

    return true;
  });

  function resetSearch() {
    setSearchParams({});
    setNameSearch("");
    setCategorySearch("");
    setTagSearch("");
    setFavoriteSearch("");
  }

  function addFilter(paramName, value) {
    setSearchParams((params) => {
      const current = readListParam(params, paramName);

      if (!current.some((item) => matchesIgnoreCase(item, value))) {
        current.push(value);
      }

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

  function setMatchMode(value) {
    setSearchParams((params) => {
      if (value === "OR") {
        params.delete("favoriteMatch");
      } else {
        params.set("favoriteMatch", value);
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
              <strong>How to use: </strong> Use the filters to narrow down the
              list of items by name, category, tag, or favorite preferences.
            </p>
            <p>
              <strong>Name:</strong> Search for an item by name. The results
              update automatically as you type.
            </p>
            <p>
              <strong>Category:</strong> Filter by one or more item categories.
            </p>
            <p>
              <strong>Tag:</strong> Filter by one or more item tags.
            </p>
            <p>
              <strong>Favorites:</strong> Filter by one or more favorite
              preferences.
            </p>
            <p>
              <strong>Selecting OR / AND:</strong> When multiple favorites are
              selected, choose whether items must match all selected favorites
              (AND) or at least one selected favorite (OR).
            </p>
          </>
        }
      >
        Item Search
      </PageTitle>

      <div className="four-section-search">
        <div className="four-search-section">
          <h2 className="text-center">Name</h2>

          <Autocomplete
            className="four-section-search-bar"
            placeholder="Search items..."
            value={nameSearch}
            onChange={(event) => {
              const value = event.target.value;

              setNameSearch(value);

              setSearchParams((params) => {
                if (value.length >= 3) {
                  params.set("name", value);
                } else {
                  params.delete("name");
                }

                return params;
              });
            }}
            onFocus={() => setNameSearchActive(true)}
            onBlur={() => setNameSearchActive(false)}
            isOpen={nameSearchActive && nameMatches.length > 0}
            options={nameMatches}
            getKey={(item) => item._id}
            renderOption={(item) => (
              <>
                <img src={item.imageURL} alt="" />
                <span>{item.name}</span>
              </>
            )}
            onSelect={(item) => {
              setSearchParams((params) => {
                params.set("name", item.name);
                return params;
              });

              setNameSearch(item.name);
            }}
          />
        </div>

        <div className="four-search-section">
          <h2 className="text-center">Category</h2>

          <Autocomplete
            className="four-section-search-bar"
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(event) => setCategorySearch(event.target.value)}
            onFocus={() => setCategorySearchActive(true)}
            onBlur={() => setCategorySearchActive(false)}
            isOpen={categorySearchActive}
            options={categories
              .filter((category) =>
                category.name
                  .toLowerCase()
                  .includes(categorySearch.toLowerCase()),
              )
              .filter(
                (category) =>
                  !selectedCategories.some((selected) =>
                    matchesIgnoreCase(selected, category.name),
                  ),
              )}
            getKey={(category) => category.name}
            onSelect={(category) => {
              addFilter("categories", category.name);
              setCategorySearch("");
            }}
          />

          <FilterChips
            values={selectedCategories}
            onRemove={(category) => removeFilter("categories", category)}
          />

          {selectedCategories.length > 1 && <MatchModeToggle readOnly />}
        </div>

        <div className="four-search-section">
          <h2 className="text-center">Tag</h2>

          <Autocomplete
            className="four-section-search-bar"
            placeholder="Search tags..."
            value={tagSearch}
            onChange={(event) => setTagSearch(event.target.value)}
            onFocus={() => setTagSearchActive(true)}
            onBlur={() => setTagSearchActive(false)}
            isOpen={tagSearchActive}
            options={tags
              .filter((tag) =>
                tag.name.toLowerCase().includes(tagSearch.toLowerCase()),
              )
              .filter(
                (tag) =>
                  !selectedTags.some((selected) =>
                    matchesIgnoreCase(selected, tag.name),
                  ),
              )}
            getKey={(tag) => tag.name || NO_TAG}
            renderOption={(tag) => tag.name || "[No Tag]"}
            onSelect={(tag) => {
              addFilter("tags", tag.name || NO_TAG);
              setTagSearch("");
            }}
          />

          <FilterChips
            values={selectedTags}
            getLabel={(tag) => (tag === NO_TAG ? "[No Tag]" : tag)}
            onRemove={(tag) => removeFilter("tags", tag)}
          />

          {selectedTags.length > 1 && <MatchModeToggle readOnly />}
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
              onChange={setMatchMode}
            />
          )}
        </div>
      </div>

      {searchParams.toString() && (
        <button className="reset-button" onClick={resetSearch}>
          Reset Search
        </button>
      )}

      <div className="search-results">
        <div className="table-count">{filteredItems.length} Items found</div>

        {filteredItems.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Tag</th>
                <th>Favorites</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img src={item.imageURL} alt={item.name} width="100" />
                  </td>

                  <td>
                    <SearchLink path="/item-search" params={{ name: item.name }}>
                      {item.name}
                    </SearchLink>
                  </td>

                  <td>
                    <SearchLink
                      path="/item-search"
                      params={{ categories: item.category }}
                    >
                      {item.category}
                    </SearchLink>
                  </td>

                  <td>
                    {item.tag && (
                      <SearchLink path="/item-search" params={{ tags: item.tag }}>
                        {item.tag}
                      </SearchLink>
                    )}
                  </td>

                  <td>
                    <div className="multi-value-cell">
                      {item.favoriteCategories.map((favorite) => (
                        <div key={favorite}>
                          <SearchLink
                            path="/item-search"
                            params={{ favorites: favorite }}
                          >
                            {favorite}
                          </SearchLink>
                        </div>
                      ))}
                    </div>
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

export default ItemSearch;
