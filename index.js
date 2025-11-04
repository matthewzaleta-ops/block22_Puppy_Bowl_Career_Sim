//If you would like to, you can create a variable to store the API_URL here.
//This is optional. if you do not want to, skip this and move on.

const BASE = "https://fsa-puppy-bowl.herokuapp.com/api/";
const COHORT = "2510-matt";
const RESOURCE = "/players";
const API = BASE + COHORT + RESOURCE;

/////////////////////////////
/*This looks like a good place to declare any state or global variables you might need*/

let players = [];
let selectedPlayer;

////////////////////////////

/**
 * Fetches all players from the API.
 * This function should not be doing any rendering
 * @returns {Object[]} the array of player objects
 */
async function fetchAllPlayers() {
  try {
    const response = await fetch(API);
    const result = await response.json();

    players = result.data.players;
    render();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Fetches a single player from the API.
 * This function should not be doing any rendering
 * @param {number} playerId
 * @returns {Object} the player object
 */
const fetchSinglePlayer = async (playerId) => {
  try {
    const response = await fetch(`${API}/${playerId}`);
    const result = await response.json();
    return result.data.player;
  } catch (error) {
    console.error(error);
  }
};

async function getPlayer(playerId) {
  selectedPlayer = await fetchSinglePlayer(playerId);
  render();
}

function PlayerListItem(player) {
  const $li = document.createElement("li");
  $li.classList.add("liclass");
  $li.innerHTML = `
    <img class="player-img" src="${player.imageUrl}" alt="${player.name}" />
    <a class= "player-name" href="#selected">${player.name}</a>

  `;
  $li.addEventListener("click", () => getPlayer(player.id));
  return $li;
}

function PlayerList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("lineup");

  const $players = players.map(PlayerListItem);
  $ul.replaceChildren(...$players);

  return $ul;
}

function PlayerDetails() {
  if (!selectedPlayer) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a player to learn more details.";
    return $p;
  }
  const { name, id, breed, status, team, imageUrl } = selectedPlayer;

  const $player = document.createElement("section");
  $player.classList.add("player");
  $player.innerHTML = `

<figure>
<img class="player-profile-img" alt="${name}" src="${imageUrl}" />
</figure>
<p><strong>Name: </strong>${name}</p>
<p><strong>ID: </strong>#${id}</p>
<p><strong>Breed:</strong> ${breed}</p>
<p><strong>Team: </strong> ${team?.name}</p>
<p><strong>Status:</strong> ${status}</p>
<button class="remove-btn">Remove Player</button>
`;

  $player.querySelector(".remove-btn").addEventListener("click", () => {
    removePlayer(id);
  });

  return $player;
}

/**
 * Adds a new player to the roster via the API.
 * Once a player is added to the database, the new player
 * should appear in the all players page without having to refresh
 * @param {Object} newPlayer the player to add
 */
/* Note: we need data from our user to be able to add a new player
 * Do we have a way to do that currently...?
 */
/**
 * Note#2: addNewPlayer() expects you to pass in a
 * new player object when you call it. How can we
 * create a new player object and then pass it to addNewPlayer()?
 */

const addNewPlayer = async (newPlayer) => {
  try {
    await fetch(API, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(newPlayer),
    });
    await getPlayer();
  } catch (error) {
    console.error(error);
  }
};

function NewPlayerForm() {
  const $form = document.createElement("form");
  $form.classList.add("new-player-form");
  $form.innerHTML = `
  <label class="newPlayerItems">
  Name
  <input name="name" required />
  </label>
  <label class="newPlayerItems">
  Breed
  <input name="breed" required />
  </label>
  <label class="newPlayerItems">
  Status
  <input name="status" />
  </label>
    <label class="newPlayerItems">
  Team
  <input name="status" />
  </label>
  <label class="newPlayerItems">
  Image URL
  <input name="imageUrl" />
  </label>
  <button class ="remove-btn" >Add Player</button>
  `;
  $form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData($form);
    /*const status = new Status(data.get("status")).toISOString();*/
    const newPlayer = {
      name: formData.get("name"),
      breed: formData.get("breed"),
      status: formData.get("status") || "bench",
      team: formData.get("team"),
      imageUrl: formData.get("imageUrl"),
    };

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(newPlayer),
      });
      const json = await response.json();
      players.push(json.data.newPlayer);
      render();
    } catch (error) {
      console.error(error);
    }
  });

  return $form;
}

//TODO

/**
 * Removes a player from the roster via the API.
 * Once the player is removed from the database,
 * the player should also be removed from our view without refreshing
 * @param {number} playerId the ID of the player to remove
 */
/**
 * Note: In order to call removePlayer() some information is required.
 * Unless we get that information, we cannot call removePlayer()....
 */
/**
 * Note#2: Don't be afraid to add parameters to this function if you need to!
 */

const removePlayer = async (playerId) => {
  try {
    await fetch(`${API}/${playerId}`, {
      method: "DELETE",
    });
    players = players.filter((p) => p.id !== playerId);
    render();
    selectedPlayer = undefined;
    render();
  } catch (error) {
    console.error(error);
  }
  //TODO
};

/**
 * Updates html to display a list of all players or a single player page.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player in the all player list is displayed with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, for each player we should be able to:
 * - See details of a single player. The page should show
 *    specific details about the player clicked
 * - Remove from roster. when clicked, should remove the player
 *    from the database and our current view without having to refresh
 *
 */
const render = () => {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
<h1>Puppy Bowl</h1>
<main>
<section>
<h2>Lineup</h2>
<PlayerList></PlayerList>
</section>
<section id="selected">
<h2>Player Details</h2>
<PlayerDetails></PlayerDetails>
</section>
<section>
<h2>Add a New Player</h2>
<NewPlayerForm></NewPlayerForm>
</section>
</main>
`;
  $app.querySelector("PlayerList").replaceWith(PlayerList());
  $app.querySelector("PlayerDetails").replaceWith(PlayerDetails());
  $app.querySelector("NewPlayerForm").replaceWith(NewPlayerForm());
  // TODO
};

/**
 * Initializes the app by calling render
 * HOWEVER....
 */
const init = async () => {
  await fetchAllPlayers();
  //await addNewPlayer();
  //Before we render, what do we always need...?

  render();
};

init();
