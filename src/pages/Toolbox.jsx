import { Link } from "react-router-dom";
import { PageTitle } from "../components.jsx";
import { SITE_NAME, TOOLS } from "../tools.js";

function Toolbox() {
  return (
    <div>
      <PageTitle
        help={
          <>
            <p>
              <strong>How to use: </strong>
              Pokémon Search and Item Search are lookups. Roommate Finder,
              Comfort Optimizer, and Move-In Match are planners that work
              through a home one step at a time.
            </p>

            <p>
              Every tool keeps what you picked in the address bar, so a plan can
              be bookmarked or shared as a link.
            </p>
          </>
        }
      >
        {SITE_NAME}
      </PageTitle>

      <div className="tool-grid">
        {TOOLS.map((tool) => (
          <Link className="card tool-card" key={tool.path} to={tool.path}>
            <h2 className="tool-card-name">{tool.name}</h2>

            <p className="tool-card-blurb">{tool.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Toolbox;
