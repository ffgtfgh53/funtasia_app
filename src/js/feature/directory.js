import { Navigation } from "@/js/events/navigation.js";
import { hideBottomSheet } from "@/js/ui_ux/ui.js";

let cachedFuntasiaData = null;
let dataLoadingPromise = null;

/* ── Color Maps ──────────────────────────────────────────── */

/** Zone → accent colors for icon bg, text, bar */
const zoneColorMap = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-600",   bar: "bg-blue-500"   },
  green:  { bg: "bg-green-50",  text: "text-green-600",  bar: "bg-green-500"  },
  orange: { bg: "bg-orange-50", text: "text-orange-600", bar: "bg-orange-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", bar: "bg-purple-500" },
  red:    { bg: "bg-red-50",    text: "text-red-600",    bar: "bg-red-500"    },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-600", bar: "bg-yellow-500" },
  brown:  { bg: "bg-amber-50",  text: "text-amber-800",  bar: "bg-amber-600"  },
};

/** Tag → pill/chip hex color */
const tagColorMap = {
  Game:        "#2563eb", // blue-600
  Performance: "#7c3aed", // violet-600
  Acad:        "#0d9488", // teal-600
  Food:        "#dc2626", // red-600
  Drinks:      "#0ea5e9", // sky-500
  Merch:       "#d97706", // amber-600
  Photos:      "#db2777", // pink-600
};

const fallbackTagColor = "#6b7280"; // gray-500

/* ── Filter State ────────────────────────────────────────── */

const filterState = {
  search: "",
  level: "",      // "" = all
  zone: "",       // "" = all
  tags: new Set() // multi-select
};

/* ── Data Fetching ───────────────────────────────────────── */

async function fetchDirectoryData() {
  if (dataLoadingPromise) return dataLoadingPromise;

  dataLoadingPromise = (async () => {
    try {
      const response = await fetch(`${ASSETS_BASE_URL}/json/funtasia_data.json`);
      cachedFuntasiaData = await response.json();
      return cachedFuntasiaData;
    } catch (e) {
      console.error("Failed to fetch directory data:", e);
      throw e;
    }
  })();

  return dataLoadingPromise;
}

/* ── Tag Helpers ─────────────────────────────────────────── */

/** Normalise Tags field (string | string[] | empty) into a clean array */
function parseTags(rawTags) {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) return rawTags.map(t => t.trim()).filter(Boolean);
  return rawTags.split(",").map(t => t.trim()).filter(Boolean);
}

/** Collect every unique tag from the full dataset */
function collectAllTags(funtasiaData) {
  const tags = new Set();
  const levels = Object.keys(funtasiaData);
  levels.forEach(level => {
    if (!Array.isArray(funtasiaData[level])) return;
    funtasiaData[level].forEach(item => {
      parseTags(item["Tags"]).forEach(t => tags.add(t));
    });
  });
  return [...tags].sort();
}

/* ── Zone Color Helper ───────────────────────────────────── */

function getZoneColors(zoneName) {
  if (!zoneName) return { bg: "bg-gray-50", text: "text-gray-600", bar: "bg-gray-500" };
  const lower = zoneName.toLowerCase();
  for (const [key, colors] of Object.entries(zoneColorMap)) {
    if (lower.includes(key)) return colors;
  }
  return { bg: "bg-surface-variant", text: "text-on-surface-variant", bar: "bg-outline" };
}

/* ── Filtering ───────────────────────────────────────────── */

/**
 * Returns a flat array of { item, level } objects that pass all active filters.
 * Filters are AND-ed: level ∩ zone ∩ tags ∩ search.
 * Tags use OR within themselves (item matches if it has ANY selected tag).
 */
function getFilteredData(funtasiaData) {
  const results = [];
  const levelsToSearch = filterState.level
    ? [filterState.level]
    : Object.keys(funtasiaData);

  levelsToSearch.forEach(level => {
    if (!Array.isArray(funtasiaData[level])) return;
    funtasiaData[level].forEach(item => {
      // Zone filter
      if (filterState.zone) {
        const itemZone = (item["Zone"] || "").trim();
        if (itemZone.toLowerCase() !== filterState.zone.toLowerCase()) return;
      }

      // Tag filter (OR: item must have at least one selected tag)
      if (filterState.tags.size > 0) {
        const itemTags = parseTags(item["Tags"]);
        const hasMatch = itemTags.some(t => filterState.tags.has(t));
        if (!hasMatch) return;
      }

      // Search filter
      if (filterState.search) {
        const q = filterState.search.toLowerCase();
        const name = (item["Booth Name"] || "").toLowerCase();
        const desc = (item["Booth Description"] || "").toLowerCase();
        const id   = (item["Booth ID"] || "").toLowerCase();
        if (!name.includes(q) && !desc.includes(q) && !id.includes(q)) return;
      }

      results.push({ item, level });
    });
  });

  return results;
}

/* ── Rendering ───────────────────────────────────────────── */

function renderDirectory(container, funtasiaData) {
  container.innerHTML = "";

  const filtered = getFilteredData(funtasiaData);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center px-6">
        <span class="material-symbols-outlined text-[40px] text-on-surface-variant/30 mb-3">search_off</span>
        <p class="font-headline font-bold text-on-surface-variant/50 text-sm">No results found</p>
        <p class="text-on-surface-variant/40 text-xs mt-1">Try adjusting your filters or search term</p>
      </div>`;
    return;
  }

  // Group by level, then by zone
  const grouped = {};
  filtered.forEach(({ item, level }) => {
    if (!grouped[level]) grouped[level] = {};
    let zone = item["Zone"];
    if (!zone || zone.trim() === "-") zone = "Other Zones";
    else zone = zone.trim();
    if (!grouped[level][zone]) grouped[level][zone] = [];
    grouped[level][zone].push(item);
  });

  const levelOrder = ["b3", "b2", "b1", "l1", "l2", "l3"];
  const sortedLevels = Object.keys(grouped).sort(
    (a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b)
  );

  sortedLevels.forEach(level => {
    const levelSection = document.createElement("div");
    levelSection.className = "mb-8";

    const levelHeader = document.createElement("h3");
    levelHeader.className = "font-headline font-extrabold text-xl text-primary mb-4 px-4 tracking-tight border-b-2 border-primary/20 pb-2";
    levelHeader.textContent = `Level ${level.replace("l", "").replace("b", "B")}`;
    levelSection.appendChild(levelHeader);

    for (const [zone, items] of Object.entries(grouped[level])) {
      const zoneBlock = document.createElement("div");
      zoneBlock.className = "mb-6 last:mb-0";
      const zoneColors = getZoneColors(zone);

      const zoneHeader = document.createElement("h4");
      zoneHeader.className = `text-xs font-bold tracking-[0.1em] uppercase px-4 mb-3 ${zoneColors.text}`;
      zoneHeader.textContent = zone;
      zoneBlock.appendChild(zoneHeader);

      const itemsContainer = document.createElement("div");
      itemsContainer.className = "space-y-2";

      items.forEach(item => {
        const itemEl = document.createElement("div");
        itemEl.className = "modal-list-item";

        let boothName = item["Booth Name"] || "Unnamed Booth";
        if (boothName === "-") boothName = "Unnamed Booth";
        const boothDesc = item["Booth Description"] || "No description available.";
        const boothNum = item["Booth ID"];
        const itemTags = parseTags(item["Tags"]);

        // Build tag pills HTML
        const tagPillsHTML = itemTags.map(tag => {
          const color = tagColorMap[tag] || fallbackTagColor;
          return `<span class="tag-pill" style="--pill-color: ${color};">${tag}</span>`;
        }).join("");

        itemEl.onclick = () => {
          Navigation.switchFloor(level);
          hideBottomSheet();
          window.parent.postMessage({ type: 'selectPOI', id: boothNum, floor: level }, '*');

          const dirModalOuter = document.getElementById("directory-modal-wrapper");
          if(dirModalOuter) dirModalOuter.style.display = 'none';
          
          const openDirBtn = document.getElementById('open-directory-btn');
          const openSettingsBtn = document.getElementById('open-settings-btn');
          if(openDirBtn) openDirBtn.style.display = 'flex';
          if(openSettingsBtn) openSettingsBtn.style.display = 'flex';
        };

        itemEl.innerHTML = `
          <div class="modal-item-icon-wrapper ${zoneColors.bg} ${zoneColors.text}">
            <span class="material-symbols-outlined text-[20px]" data-icon="festival">festival</span>
          </div>
          <div class="modal-item-accent-bar ${zoneColors.bar}"></div>
          <div class="modal-item-content">
            <div class="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 class="modal-item-title leading-tight">${boothNum ? `${boothNum}: ` : ''}${boothName}</h3>
              ${tagPillsHTML}
            </div>
            <p class="modal-item-subtitle mt-0.5 opacity-80 line-clamp-2">${boothDesc}</p>
          </div>
          <span class="modal-item-chevron">chevron_right</span>
        `;
        itemsContainer.appendChild(itemEl);
      });

      zoneBlock.appendChild(itemsContainer);
      levelSection.appendChild(zoneBlock);
    }

    container.appendChild(levelSection);
  });
}

/* ── Tag Chip Population ─────────────────────────────────── */

function populateTagChips(funtasiaData) {
  const tagsContainer = document.getElementById("filter-tags-container");
  if (!tagsContainer) return;

  tagsContainer.innerHTML = "";
  const allTags = collectAllTags(funtasiaData);

  allTags.forEach(tag => {
    const chip = document.createElement("button");
    chip.className = "filter-chip";
    chip.textContent = tag;
    const color = tagColorMap[tag] || fallbackTagColor;
    chip.style.setProperty("--chip-color", color);

    if (filterState.tags.has(tag)) chip.classList.add("active");

    chip.addEventListener("click", () => {
      if (filterState.tags.has(tag)) {
        filterState.tags.delete(tag);
        chip.classList.remove("active");
      } else {
        filterState.tags.add(tag);
        chip.classList.add("active");
      }
      applyFilters();
    });

    tagsContainer.appendChild(chip);
  });
}

/* ── Filter Application ──────────────────────────────────── */

function applyFilters() {
  const container = document.getElementById("funtasia-directory-list");
  if (!container || !cachedFuntasiaData) return;
  renderDirectory(container, cachedFuntasiaData);
}

/* ── Filter Event Binding ────────────────────────────────── */

function bindFilterEvents() {
  // Search
  const searchInput = document.getElementById("directory-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      filterState.search = e.target.value;
      applyFilters();
    });
  }

  // Level dropdown
  const levelSelect = document.getElementById("filter-level");
  if (levelSelect) {
    levelSelect.addEventListener("change", (e) => {
      filterState.level = e.target.value;
      applyFilters();
    });
  }

  // Zone dropdown
  const zoneSelect = document.getElementById("filter-zone");
  if (zoneSelect) {
    zoneSelect.addEventListener("change", (e) => {
      filterState.zone = e.target.value;
      applyFilters();
    });
  }

  // Clear All
  const clearBtn = document.getElementById("filter-clear-all-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      filterState.search = "";
      filterState.level = "";
      filterState.zone = "";
      filterState.tags.clear();

      // Reset UI controls
      if (searchInput) searchInput.value = "";
      if (levelSelect) levelSelect.value = "";
      if (zoneSelect) zoneSelect.value = "";

      // Reset tag chips
      document.querySelectorAll("#filter-tags-container .filter-chip").forEach(chip => {
        chip.classList.remove("active");
      });

      applyFilters();
    });
  }
}

/* ── Public Init ─────────────────────────────────────────── */

export function initDirectory() {
  const container = document.getElementById("funtasia-directory-list");
  if (!container) return;

  bindFilterEvents();

  if (cachedFuntasiaData) {
    populateTagChips(cachedFuntasiaData);
    renderDirectory(container, cachedFuntasiaData);
  } else {
    container.innerHTML = "Loading directory..."; 
    fetchDirectoryData()
        .then(data => {
          populateTagChips(data);
          renderDirectory(container, data);
        })
        .catch(e => {
            container.innerHTML = "Failed to load directory data.";
        });
  }
}
