// Basic Pokémon-type list
const POKEMON_TYPES = [
  "Normal",
  "Fire",
  "Water",
  "Grass",
  "Electric",
  "Ice",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Psychic",
  "Bug",
  "Rock",
  "Ghost",
  "Dragon",
  "Dark",
  "Steel",
  "Fairy"
];

const MAX_TEAM_SIZE = 6;

// DOM elements
const primaryTypeSelect = document.getElementById("primary-type");
const secondaryTypeSelect = document.getElementById("secondary-type");
const addForm = document.getElementById("add-form");
const teamSlotsContainer = document.getElementById("team-slots");
const clearTeamButton = document.getElementById("clear-team");
const coverageGrid = document.getElementById("coverage-grid");

// --- State management ---

let team = loadTeamFromStorage();

// --- Init ---

populateTypeSelects();
renderTeam();
renderCoverage();

// --- Functions ---

function populateTypeSelects() {
  POKEMON_TYPES.forEach((type) => {
    const opt1 = document.createElement("option");
    opt1.value = type;
    opt1.textContent = type;
    primaryTypeSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = type;
    opt2.textContent = type;
    secondaryTypeSelect.appendChild(opt2);
  });
}

function loadTeamFromStorage() {
  try {
    const raw = localStorage.getItem("team-builder-team");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Failed to load team from storage", e);
    return [];
  }
}

function saveTeamToStorage() {
  try {
    localStorage.setItem("team-builder-team", JSON.stringify(team));
  } catch (e) {
    console.warn("Failed to save team", e);
  }
}

function renderTeam() {
  teamSlotsContainer.innerHTML = "";

  for (let i = 0; i < MAX_TEAM_SIZE; i++) {
    const slot = document.createElement("div");
    slot.className = "team-slot";

    const indexEl = document.createElement("div");
    indexEl.className = "slot-index";
    indexEl.textContent = i + 1;

    const mainEl = document.createElement("div");
    mainEl.className = "slot-main";

    const actionsEl = document.createElement("div");
    actionsEl.className = "slot-actions";

    if (team[i]) {
      const member = team[i];

      const nameEl = document.createElement("div");
      nameEl.className = "slot-name";
      nameEl.textContent = member.name;

      const metaEl = document.createElement("div");
      metaEl.className = "slot-meta";

      const primaryPill = createTypePill(member.primaryType);
      metaEl.appendChild(primaryPill);

      if (member.secondaryType) {
        const secondaryPill = createTypePill(member.secondaryType);
        metaEl.appendChild(secondaryPill);
      }

      if (member.role) {
        const rolePill = document.createElement("div");
        rolePill.className = "role-pill";
        rolePill.textContent = member.role;
        metaEl.appendChild(rolePill);
      }

      const notesEl = document.createElement("div");
      notesEl.className = "slot-notes";
      notesEl.textContent = member.notes || "";

      mainEl.appendChild(nameEl);
      mainEl.appendChild(metaEl);
      if (member.notes) {
        mainEl.appendChild(notesEl);
      }

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.type = "button";
      removeBtn.innerHTML = "✕";
      removeBtn.title = "Remove from team";
      removeBtn.addEventListener("click", () => {
        removeMember(i);
      });

      actionsEl.appendChild(removeBtn);
    } else {
      const emptyLabel = document.createElement("div");
      emptyLabel.className = "slot-name";
      emptyLabel.style.color = "#666b8f";
      emptyLabel.textContent = "Empty slot";
      mainEl.appendChild(emptyLabel);
    }

    slot.appendChild(indexEl);
    slot.appendChild(mainEl);
    slot.appendChild(actionsEl);
    teamSlotsContainer.appendChild(slot);
  }
}

function createTypePill(type) {
  const pill = document.createElement("div");
  pill.className = "type-pill";
  pill.textContent = type;
  return pill;
}

function removeMember(index) {
  team.splice(index, 1);
  saveTeamAndRerender();
}

// --- Coverage analysis (very simple placeholder) ---

function calculateCoverage() {
  const coverage = {};

  POKEMON_TYPES.forEach((type) => {
    coverage[type] = 0;
  });

  team.forEach((member) => {
    if (!member) return;
    const uniqueTypes = new Set();
    if (member.primaryType) uniqueTypes.add(member.primaryType);
    if (member.secondaryType) uniqueTypes.add(member.secondaryType);

    uniqueTypes.forEach((type) => {
      // Here we treat each member type as an "attacking type" for STAB.
      if (coverage[type] !== undefined) {
        coverage[type] += 1;
      }
    });
  });

  return coverage;
}

function renderCoverage() {
  coverageGrid.innerHTML = "";
  const coverage = calculateCoverage();

  POKEMON_TYPES.forEach((type) => {
    const cell = document.createElement("div");
    cell.className = "coverage-cell";

    const label = document.createElement("div");
    label.className = "coverage-label";

    const pill = document.createElement("div");
    pill.className = "coverage-type-pill";
    pill.textContent = type;

    const text = document.createElement("span");
    text.textContent = "Coverage";

    label.appendChild(pill);
    label.appendChild(text);

    const count = document.createElement("div");
    count.className = "coverage-count";
    count.textContent = coverage[type];

    cell.appendChild(label);
    cell.appendChild(count);
    coverageGrid.appendChild(cell);
  });
}

// --- Form handling ---

addForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (team.length >= MAX_TEAM_SIZE) {
    alert(`Your team is already full (max ${MAX_TEAM_SIZE}).`);
    return;
  }

  const formData = new FormData(addForm);

  const name = formData.get("name").toString().trim();
  const primaryType = formData.get("primaryType").toString();
  const secondaryType = formData.get("secondaryType").toString() || "";
  const role = formData.get("role").toString();
  const notes = formData.get("notes").toString().trim();

  if (!name || !primaryType) {
    return;
  }

  const member = {
    name,
    primaryType,
    secondaryType: secondaryType || null,
    role: role || null,
    notes
  };

  team.push(member);
  saveTeamAndRerender();
  addForm.reset();
});

clearTeamButton.addEventListener("click", () => {
  if (team.length === 0) return;
  const confirmed = window.confirm("Clear the entire team?");
  if (!confirmed) return;
  team = [];
  saveTeamAndRerender();
});

function saveTeamAndRerender() {
  saveTeamToStorage();
  renderTeam();
  renderCoverage();
}
