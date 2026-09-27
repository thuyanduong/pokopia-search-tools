import { useState } from "react";

/* Shared building blocks used by the search pages. */

function cx(...values) {
  return values.filter(Boolean).join(" ");
}

function buildHref(path, params) {
  const query = Object.entries(params || {})
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return query ? `${path}?${query}` : path;
}

function getCountHighlightClass(count) {
  if (count >= 3) {
    return "highlight-green";
  }

  if (count === 2) {
    return "highlight-light-green";
  }

  return "";
}

export function Help({ children }) {
  return (
    <span className="help">
      ?
      <span className="help-tooltip">{children}</span>
    </span>
  );
}

export function PageTitle({ children, className, help }) {
  return (
    <h1 className={cx("title", className)}>
      {children}
      <Help>{help}</Help>
    </h1>
  );
}

export function Autocomplete({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  className,
  inputClassName,
  isOpen,
  options,
  getKey,
  renderOption,
  onSelect,
  keepFocus,
  children,
}) {
  return (
    <div className={cx("autocomplete", className)}>
      <input
        className={cx("search-input", inputClassName)}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />

      {children}

      {isOpen && (
        <div className="autocomplete-dropdown">
          {options.map((option) => (
            <div
              className="autocomplete-option"
              key={getKey(option)}
              onMouseDown={(event) => {
                /* Pokémon Compatibility keeps its input focused after a selection. */
                if (keepFocus) {
                  event.preventDefault();
                }

                onSelect(option);
              }}
            >
              {renderOption ? renderOption(option) : option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Chip({ children, className }) {
  return <span className={cx("filter-chip", className)}>{children}</span>;
}

export function FilterChips({ values, getKey, getLabel, onRemove }) {
  return (
    <div className="filter-chips">
      {values.map((value) => (
        <Chip key={getKey ? getKey(value) : value}>
          {getLabel ? getLabel(value) : value}

          <button
            className="clear-button clear-button-chip"
            type="button"
            onClick={() => onRemove(value)}
          >
            ×
          </button>
        </Chip>
      ))}
    </div>
  );
}

export function MatchModeToggle({
  groupName,
  value,
  onChange,
  readOnly = false,
}) {
  if (readOnly) {
    return (
      <div className="or-and-filter">
        <label>
          <input type="radio" checked readOnly />
          OR
        </label>
      </div>
    );
  }

  return (
    <div className="or-and-filter">
      <label>
        <input
          type="radio"
          name={groupName}
          value="OR"
          checked={value === "OR"}
          onChange={() => onChange("OR")}
        />
        OR
      </label>

      <label>
        <input
          type="radio"
          name={groupName}
          value="AND"
          checked={value === "AND"}
          onChange={() => onChange("AND")}
        />
        AND
      </label>
    </div>
  );
}

export function SearchLink({ path, params, children }) {
  return (
    <a
      className="search-link"
      href={buildHref(path, params)}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export function SpecialtyCells({ specialties }) {
  return (
    <div className="multi-value-cell">
      {specialties.map((specialty) => (
        <div key={specialty}>
          <SearchLink
            path="/pokemonAdvanced"
            params={{ specialties: specialty }}
          >
            {specialty}
          </SearchLink>
        </div>
      ))}
    </div>
  );
}

export function FavoriteCells({ path, favorites, limit, highlights }) {
  return Array.from({ length: limit }, (_, index) => favorites[index]).map(
    (favorite, index) => {
      const isHighlighted = (highlights || []).some(
        (highlight) => highlight.toLowerCase() === favorite?.toLowerCase(),
      );

      let className;

      if (highlights) {
        className = isHighlighted ? "highlight-light-green" : "";
      }

      return (
        <td key={index} className={className}>
          <SearchLink path={path} params={{ favorites: favorite }}>
            {favorite}
          </SearchLink>
        </td>
      );
    },
  );
}

export function RecommendationSection({ title, items }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="recommendations-section">
      <table className="data-table">
        <thead>
          <tr>
            <th>
              <button
                className="collapse-button"
                type="button"
                onClick={() => setIsOpen((current) => !current)}
              >
                <span>
                  {title} ({items.length} items)
                </span>
                <span>{isOpen ? "▲" : "▼"}</span>
              </button>
            </th>
          </tr>
        </thead>
      </table>

      {isOpen && (
        <table className="data-table recommendations-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Matched Count</th>
              <th>Matched Categories</th>
              <th>Pokémon Satisfied</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>
                  <img src={item.imageURL} alt={item.name} />
                </td>

                <td>{item.name}</td>

                <td
                  className={getCountHighlightClass(item.categoryMatchedCount)}
                >
                  {item.categoryMatchedCount}
                </td>

                <td>{item.matchedCategories.join(", ")}</td>

                <td>
                  {item.pokemonSatisfied.map((satisfied) => (
                    <div key={satisfied.name}>
                      <strong>{satisfied.name}</strong>
                      {" → "}
                      {satisfied.matchedCategories.join(", ")}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

