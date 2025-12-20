const HEX_SIZE = 28;
const DIRECTIONS = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];

const formatter = new Intl.NumberFormat("es-ES");

const PROVINCES = [
  // Galicia
  { name: "A Coruña", population: 1120000, q: -3, r: -4 },
  { name: "Lugo", population: 322000, q: -2, r: -4 },
  { name: "Ourense", population: 304000, q: -2, r: -3 },
  { name: "Pontevedra", population: 944000, q: -3, r: -3 },
  // Norte
  { name: "Asturias", population: 1010000, q: -1, r: -4 },
  { name: "Cantabria", population: 585000, q: 0, r: -4 },
  { name: "Bizkaia", population: 1140000, q: 1, r: -5 },
  { name: "Gipuzkoa", population: 727000, q: 2, r: -5 },
  { name: "Álava", population: 333000, q: 1, r: -4 },
  { name: "Navarra", population: 661000, q: 2, r: -4 },
  { name: "La Rioja", population: 319000, q: 1, r: -3 },
  // Aragón y Cataluña
  { name: "Huesca", population: 221000, q: 2, r: -3 },
  { name: "Zaragoza", population: 956000, q: 2, r: -2 },
  { name: "Teruel", population: 134000, q: 2, r: -1 },
  { name: "Lleida", population: 440000, q: 3, r: -2 },
  { name: "Barcelona", population: 5700000, q: 4, r: -2 },
  { name: "Girona", population: 795000, q: 4, r: -3 },
  { name: "Tarragona", population: 843000, q: 3, r: -1 },
  // Comunidad Valenciana y Murcia
  { name: "Castellón", population: 590000, q: 4, r: -1 },
  { name: "Valencia", population: 2600000, q: 4, r: 0 },
  { name: "Alicante", population: 1900000, q: 4, r: 1 },
  { name: "Murcia", population: 1520000, q: 4, r: 2 },
  // Baleares
  { name: "Illes Balears", population: 1170000, q: 6, r: 1 },
  // Castilla y León
  { name: "León", population: 453000, q: -2, r: -2 },
  { name: "Zamora", population: 168000, q: -2, r: -1 },
  { name: "Salamanca", population: 329000, q: -2, r: 0 },
  { name: "Palencia", population: 160000, q: -1, r: -2 },
  { name: "Burgos", population: 355000, q: 0, r: -2 },
  { name: "Valladolid", population: 519000, q: -1, r: -1 },
  { name: "Soria", population: 88000, q: 1, r: -2 },
  { name: "Segovia", population: 153000, q: 0, r: -1 },
  { name: "Ávila", population: 156000, q: -1, r: 0 },
  // Madrid
  { name: "Madrid", population: 6800000, q: 0, r: 0 },
  // Castilla-La Mancha
  { name: "Guadalajara", population: 266000, q: 1, r: -1 },
  { name: "Cuenca", population: 198000, q: 2, r: 0 },
  { name: "Toledo", population: 707000, q: 0, r: 1 },
  { name: "Ciudad Real", population: 488000, q: 0, r: 2 },
  { name: "Albacete", population: 388000, q: 2, r: 1 },
  // Extremadura
  { name: "Cáceres", population: 392000, q: -2, r: 1 },
  { name: "Badajoz", population: 668000, q: -2, r: 2 },
  // Andalucía
  { name: "Huelva", population: 538000, q: -2, r: 3 },
  { name: "Sevilla", population: 1950000, q: -1, r: 3 },
  { name: "Cádiz", population: 1240000, q: -1, r: 4 },
  { name: "Córdoba", population: 776000, q: -1, r: 2 },
  { name: "Jaén", population: 620000, q: 0, r: 3 },
  { name: "Granada", population: 919000, q: 1, r: 3 },
  { name: "Almería", population: 732000, q: 2, r: 3 },
  { name: "Málaga", population: 1700000, q: 0, r: 4 },
  // Canarias
  { name: "Las Palmas", population: 1130000, q: -4, r: 4 },
  { name: "Santa Cruz de Tenerife", population: 1070000, q: -4, r: 5 },
];

const battleButton = document.getElementById("battleButton");
const resetButton = document.getElementById("resetButton");
const autoBattleToggle = document.getElementById("autoBattle");
const activeCountEl = document.getElementById("activeCount");
const populationTotalEl = document.getElementById("populationTotal");
const lastBattleEl = document.getElementById("lastBattle");
const provinceListEl = document.getElementById("provinceList");
const battleLogEl = document.getElementById("battleLog");
const mapContainer = document.getElementById("mapContainer");

const colorSeed = (i) => `hsl(${(i * 57) % 360}deg, 70%, 55%)`;

let state;
let autoBattleTimer;

function buildInitialState() {
  const cells = PROVINCES.map((cell, id) => ({ ...cell, id }));
  const owners = new Map();
  const provinces = new Map();

  cells.forEach((cell, idx) => {
    owners.set(idx, cell.name);
    provinces.set(cell.name, {
      name: cell.name,
      population: cell.population,
      color: colorSeed(idx),
      cells: [idx],
    });
  });

  const byCoord = new Map();
  cells.forEach((cell) => {
    byCoord.set(`${cell.q},${cell.r}`, cell.id);
  });

  return { cells, owners, provinces, byCoord, lastBattle: "—" };
}

function axialToPixel(q, r) {
  const x = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
  const y = HEX_SIZE * 1.5 * r;
  return { x, y };
}

function hexPoints(center, size) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    points.push({
      x: center.x + size * Math.cos(angle),
      y: center.y + size * Math.sin(angle),
    });
  }
  return points;
}

function lighten(color, amount = 0.15) {
  const match = color.match(/hsl\(([^)]+)\)/);
  if (!match) return color;
  const [h, s, l] = match[1].split(",").map((value) => parseFloat(value));
  const newL = Math.min(100, l + amount * 100);
  return `hsl(${h}, ${s}%, ${newL}%)`;
}

function shade(color, amount = 0.15) {
  const match = color.match(/hsl\(([^)]+)\)/);
  if (!match) return color;
  const [h, s, l] = match[1].split(",").map((value) => parseFloat(value));
  const newL = Math.max(0, l - amount * 100);
  return `hsl(${h}, ${s}%, ${newL}%)`;
}

function createGradient(defs, owner) {
  const id = `grad-${owner.name.replace(/\s+/g, "-")}`;
  const radial = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
  radial.setAttribute("id", id);
  radial.setAttribute("cx", "50%");
  radial.setAttribute("cy", "40%");
  radial.setAttribute("r", "70%");
  radial.innerHTML = `
    <stop offset="0%" stop-color="${lighten(owner.color, 0.18)}" stop-opacity="0.95" />
    <stop offset="70%" stop-color="${owner.color}" stop-opacity="0.95" />
    <stop offset="100%" stop-color="${shade(owner.color, 0.12)}" stop-opacity="1" />
  `;
  defs.appendChild(radial);
  return id;
}

function renderMap() {
  mapContainer.innerHTML = "";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("map__svg");

  const centers = state.cells.map((cell) => axialToPixel(cell.q, cell.r));
  const xs = centers.map((c) => c.x);
  const ys = centers.map((c) => c.y);
  const padding = 90;
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;
  svg.setAttribute("viewBox", `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  state.provinces.forEach((province) => createGradient(defs, province));
  svg.appendChild(defs);

  const cellsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const bordersGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const labelsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

  state.cells.forEach((cell) => {
    const ownerName = state.owners.get(cell.id);
    const owner = state.provinces.get(ownerName);
    const center = axialToPixel(cell.q, cell.r);
    const bump = Math.min(8, owner.cells.length * 0.6);
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const points = hexPoints(center, HEX_SIZE + bump)
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
    polygon.setAttribute("points", points);
    polygon.setAttribute("fill", `url(#grad-${owner.name.replace(/\s+/g, "-")})`);
    polygon.classList.add("map__hex");
    polygon.dataset.owner = owner.name;
    polygon.dataset.cell = cell.name;
    polygon.appendChild(createTitle(`${cell.name}\nPoblación: ${formatter.format(cell.population)}`));
    cellsGroup.appendChild(polygon);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", center.x);
    label.setAttribute("y", center.y + 4);
    label.classList.add("map__label");
    label.textContent = ownerName;
    labelsGroup.appendChild(label);
  });

  const seenBorders = new Set();
  state.cells.forEach((cell) => {
    const center = axialToPixel(cell.q, cell.r);
    const corners = hexPoints(center, HEX_SIZE + 0.5);
    DIRECTIONS.forEach((dir, i) => {
      const neighborKey = `${cell.q + dir[0]},${cell.r + dir[1]}`;
      const neighborId = state.byCoord.get(neighborKey);
      if (neighborId === undefined) return;
      if (neighborId < cell.id) return;
      const ownerA = state.owners.get(cell.id);
      const ownerB = state.owners.get(neighborId);
      if (ownerA === ownerB) return;
      const key = `${Math.min(cell.id, neighborId)}-${Math.max(cell.id, neighborId)}`;
      if (seenBorders.has(key)) return;
      seenBorders.add(key);
      const start = corners[i];
      const end = corners[(i + 1) % 6];
      const border = document.createElementNS("http://www.w3.org/2000/svg", "line");
      border.setAttribute("x1", start.x);
      border.setAttribute("y1", start.y);
      border.setAttribute("x2", end.x);
      border.setAttribute("y2", end.y);
      border.classList.add("map__border");
      bordersGroup.appendChild(border);
    });
  });

  svg.appendChild(cellsGroup);
  svg.appendChild(bordersGroup);
  svg.appendChild(labelsGroup);
  mapContainer.appendChild(svg);
}

function createTitle(text) {
  const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
  title.textContent = text;
  return title;
}

function updateCards() {
  const provinces = Array.from(state.provinces.values()).sort((a, b) => b.population - a.population);
  provinceListEl.innerHTML = "";
  provinces.forEach((province) => {
    const card = document.createElement("article");
    card.classList.add("card");
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "8px";
    const colorDot = document.createElement("div");
    colorDot.classList.add("card__color");
    colorDot.style.background = province.color;
    const title = document.createElement("p");
    title.classList.add("card__title");
    title.textContent = province.name;
    const meta = document.createElement("p");
    meta.classList.add("card__meta");
    meta.textContent = `${formatter.format(province.population)} hab. · ${province.cells.length} celdas`;
    header.appendChild(colorDot);
    header.appendChild(title);
    card.appendChild(header);
    card.appendChild(meta);
    provinceListEl.appendChild(card);
  });
}

function updateStats() {
  activeCountEl.textContent = state.provinces.size;
  const totalPopulation = Array.from(state.provinces.values()).reduce((sum, p) => sum + p.population, 0);
  populationTotalEl.textContent = `${formatter.format(totalPopulation)} hab.`;
  lastBattleEl.textContent = state.lastBattle;
}

function logBattle(text) {
  const entry = document.createElement("p");
  entry.classList.add("log__entry");
  entry.textContent = text;
  battleLogEl.prepend(entry);
  while (battleLogEl.children.length > 8) {
    battleLogEl.removeChild(battleLogEl.lastChild);
  }
}

function battleOnce() {
  const contenders = Array.from(state.provinces.keys());
  if (contenders.length < 2) return;
  const [aIdx, bIdx] = pickTwo(contenders.length);
  const attackerName = contenders[aIdx];
  const defenderName = contenders[bIdx];
  const attacker = state.provinces.get(attackerName);
  const defender = state.provinces.get(defenderName);

  const attackerScore = attacker.population * randomIn(0.92, 1.18);
  const defenderScore = defender.population * randomIn(0.92, 1.18);
  const winner = attackerScore >= defenderScore ? attacker : defender;
  const loser = winner === attacker ? defender : attacker;

  absorb(winner.name, loser.name);
  const summary = `${winner.name} conquista ${loser.name} ( ${formatter.format(winner.population)} hab. )`;
  state.lastBattle = summary;
  logBattle(summary);
  renderMap();
  updateStats();
  updateCards();

  if (state.provinces.size <= 1) {
    autoBattleToggle.checked = false;
    clearInterval(autoBattleTimer);
    logBattle(`${winner.name} domina todo el mapa`);
  }
}

function absorb(winnerName, loserName) {
  const winner = state.provinces.get(winnerName);
  const loser = state.provinces.get(loserName);
  if (!winner || !loser) return;
  winner.population += loser.population;
  loser.cells.forEach((cellId) => {
    winner.cells.push(cellId);
    state.owners.set(cellId, winner.name);
  });
  state.provinces.delete(loser.name);
}

function pickTwo(max) {
  const a = Math.floor(Math.random() * max);
  let b = Math.floor(Math.random() * max);
  while (b === a) b = Math.floor(Math.random() * max);
  return [a, b];
}

function randomIn(min, max) {
  return Math.random() * (max - min) + min;
}

function reset() {
  state = buildInitialState();
  renderMap();
  updateCards();
  updateStats();
  battleLogEl.innerHTML = "";
  if (autoBattleTimer) clearInterval(autoBattleTimer);
  autoBattleToggle.checked = false;
}

function handleAutoBattleChange() {
  if (autoBattleToggle.checked) {
    autoBattleTimer = setInterval(battleOnce, 2000);
  } else if (autoBattleTimer) {
    clearInterval(autoBattleTimer);
  }
}

battleButton.addEventListener("click", battleOnce);
resetButton.addEventListener("click", reset);
autoBattleToggle.addEventListener("change", handleAutoBattleChange);
window.addEventListener("resize", () => requestAnimationFrame(renderMap));

reset();
