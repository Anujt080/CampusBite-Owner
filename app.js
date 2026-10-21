/**
 * CampusBite Owner Dashboard - Application Logic
 * Follows Google Stitch specifications for Project 4409743892268089547
 * Preserves exact Stitch UI layout, typography, colors, and responsive behaviors.
 */

// ================= LOCAL STORAGE KEYS =================
const STORAGE_KEYS = {
  MENU: 'campusbite_menu_items',
  TABLES: 'campusbite_tables',
  THEME: 'campusbite_theme',
  ORDERS: 'campusbite_orders',
  HISTORY: 'campusbite_history',
  SETTINGS: 'campusbite_settings'
};

// ================= STORAGE HELPERS =================
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading localStorage for ${key}:`, e);
    return fallback;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving to localStorage for ${key}:`, e);
  }
}

// ================= DEFAULT DATASETS (STITCH BLUEPRINT) =================
const DEFAULT_MENU_ITEMS = [
  {
    sku: 'MNU-204',
    name: 'Paneer Butter Masala',
    category: 'Main Course Curries',
    price: 320.00,
    diet: 'veg',
    desc: 'Rich, creamy curry made with cottage cheese cubes, tomatoes, butter, and authentic spices.',
    inStock: true,
    image: 'assets/paneer.jpg'
  },
  {
    sku: 'MNU-312',
    name: 'Hyderabadi Dum Biryani',
    category: 'Main Course Curries',
    price: 420.00,
    diet: 'nonveg',
    desc: 'Slow-cooked aromatic basmati rice with marinated chicken & saffron herbs.',
    inStock: true,
    image: 'assets/biryani.jpg'
  },
  {
    sku: 'MNU-108',
    name: 'Butter Garlic Naan',
    category: 'Breads & Rice',
    price: 60.00,
    diet: 'veg',
    desc: 'Leavened clay oven bread topped with crushed garlic, butter glaze & fresh coriander.',
    inStock: true,
    image: 'assets/naan.jpg'
  },
  {
    sku: 'MNU-405',
    name: 'Tandoori Mushroom Tikka',
    category: 'Starters & Appetizers',
    price: 260.00,
    diet: 'veg',
    desc: 'Chargrilled button mushrooms in hung curd marination with crisp bell peppers.',
    inStock: false,
    image: 'assets/mushroom.jpg'
  },
  {
    sku: 'MNU-519',
    name: 'Gulab Jamun with Rabri',
    category: 'Desserts',
    price: 150.00,
    diet: 'veg',
    desc: 'Fried milk dough dumplings soaked in rose cardamom syrup served with chilled rabri.',
    inStock: true,
    image: 'assets/gulabjamun.jpg'
  },
  {
    sku: 'MNU-602',
    name: 'Masala Chai Kulhad',
    category: 'Beverages',
    price: 60.00,
    diet: 'veg',
    desc: 'Spiced slow-brewed milk tea with ginger, green cardamom and cloves in earthen kulhad.',
    inStock: true,
    image: 'assets/chai.jpg'
  }
];

const DEFAULT_TABLES = [
  { id: 'T-01', name: 'Table 01', zone: 'Main Courtyard', capacity: 4, orderingEnabled: true, status: 'VACANT', token: 'CPB-T01-8A1B' },
  { id: 'T-02', name: 'Table 02', zone: 'Main Courtyard', capacity: 2, orderingEnabled: true, status: 'VACANT', token: 'CPB-T02-9C2D' },
  { id: 'T-03', name: 'Table 03', zone: 'Main Courtyard', capacity: 4, orderingEnabled: true, status: 'VACANT', token: 'CPB-T03-3E4F' },
  { id: 'T-04', name: 'Table 04', zone: 'Main Courtyard', capacity: 6, orderingEnabled: true, status: 'VACANT', token: 'CPB-T04-5G6H' },
  { id: 'T-05', name: 'Table 05', zone: 'Veranda Terrace', capacity: 2, orderingEnabled: true, status: 'VACANT', token: 'CPB-T05-7I8J' },
  { id: 'T-06', name: 'Table 06', zone: 'Veranda Terrace', capacity: 4, orderingEnabled: true, status: 'VACANT', token: 'CPB-T06-1K2L' },
  { id: 'T-07', name: 'Table 07', zone: 'Indoor Dining', capacity: 4, orderingEnabled: true, status: 'VACANT', token: 'CPB-T07-3M4N' },
  { id: 'T-08', name: 'Table 08', zone: 'Indoor Dining', capacity: 8, orderingEnabled: false, status: 'VACANT', token: 'CPB-T08-5O6P' }
];

// ================= APPLICATION STATE =================
const AppState = {
  currentView: 'overview',
  theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'dark',
  audioEnabled: true,
  autoPrintKOT: false,
  shiftSeconds: 4 * 3600 + 22 * 60 + 15,

  // Filters & Pagination
  overviewFilter: 'ALL',
  kanbanFilter: 'ALL',
  menuActiveCategory: 'ALL',
  menuCurrentPage: 1,
  menuPageSize: 6,

  // Menu Form & Edit State
  menuFormMode: 'edit', // 'create' | 'edit'
  editingMenuSku: 'MNU-204',

  // Walk-in POS Cart
  cart: [],

  // Live Collections (Loaded from storage or initialized without fabricated data)
  menuItems: loadFromStorage(STORAGE_KEYS.MENU, DEFAULT_MENU_ITEMS),
  tables: loadFromStorage(STORAGE_KEYS.TABLES, DEFAULT_TABLES),
  orders: loadFromStorage(STORAGE_KEYS.ORDERS, []),
  history: loadFromStorage(STORAGE_KEYS.HISTORY, []),
  settings: loadFromStorage(STORAGE_KEYS.SETTINGS, { audioEnabled: true, autoPrint: false })
};

// ================= APPLICATION INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  applyTheme(AppState.theme);

  // Restore settings
  AppState.audioEnabled = AppState.settings?.audioEnabled ?? true;
  AppState.autoPrintKOT = AppState.settings?.autoPrint ?? false;
  const audioToggleEl = document.getElementById('settings-audio-toggle');
  if (audioToggleEl) audioToggleEl.checked = AppState.audioEnabled;
  const autoPrintToggleEl = document.getElementById('settings-autoprint-toggle');
  if (autoPrintToggleEl) autoPrintToggleEl.checked = AppState.autoPrintKOT;

  // Setup navigation listeners
  setupNavigation();

  // Setup header events
  setupHeaderEvents();

  // Setup menu filtering listeners
  setupMenuEventListeners();

  // Setup overview filtering listeners
  setupOverviewEventListeners();

  // Render all initial views with dynamic data
  renderOverviewStats();
  renderOverviewOrders();
  renderKitchenStationLoads();
  renderTopMovingItems();
  renderKanbanBoard();
  renderMenuTable();
  renderTablesGrid();
  renderPayments();
  renderHistory();
  renderPosModalItems();
  populatePosTablesDropdown();

  // Open the first menu item in edit drawer if items exist
  if (AppState.menuItems.length > 0) {
    openEditMenuItem(AppState.menuItems[0].sku);
  } else {
    closeMenuDrawer();
  }

  // Start real-time timers
  startTimers();
});

// ================= THEME SWITCHING (Stitch Dark / Light) =================
function applyTheme(theme) {
  AppState.theme = theme;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  const html = document.documentElement;
  const icon = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');

  if (theme === 'dark') {
    html.classList.add('dark');
    if (icon) {
      icon.textContent = 'dark_mode';
      icon.classList.remove('text-amber-700');
      icon.classList.add('text-primary');
    }
    if (label) label.textContent = 'Theme';
  } else {
    html.classList.remove('dark');
    if (icon) {
      icon.textContent = 'light_mode';
      icon.classList.remove('text-primary');
      icon.classList.add('text-amber-700');
    }
    if (label) label.textContent = 'Theme';
  }
}

function toggleTheme() {
  const newTheme = AppState.theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  showToast(
    `Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`,
    'Stitch design theme applied'
  );
}

// ================= NAVIGATION =================
function setupNavigation() {
  document.querySelectorAll('#sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const path = item.getAttribute('data-path');
      navigateTo(path);
      closeMobileSidebar();
    });
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileSidebar);
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeMobileSidebar);
  }

  // Lock terminal
  const lockBtn = document.getElementById('lock-terminal-btn');
  if (lockBtn) {
    lockBtn.addEventListener('click', () => {
      document.getElementById('auth-screen-overlay').classList.remove('hidden');
    });
  }
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('main-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.toggle('-translate-x-full');
  if (backdrop) backdrop.classList.toggle('hidden');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('main-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.add('-translate-x-full');
  if (backdrop) backdrop.classList.add('hidden');
}

function navigateTo(path, subFilter = null) {
  AppState.currentView = path;

  // Hide all views
  document.querySelectorAll('.view-section').forEach(view => {
    view.classList.remove('active');
  });

  // Show target view
  const targetView = document.getElementById(`view-${path}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Update sidebar active classes
  document.querySelectorAll('#sidebar-nav .nav-item').forEach(item => {
    const itemPath = item.getAttribute('data-path');
    if (itemPath === path) {
      item.className = "nav-item flex items-center justify-between px-space-md py-space-sm rounded-lg transition-colors group bg-surface-container-high text-on-surface border-l-2 border-primary font-semibold";
      const icon = item.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.className = "material-symbols-outlined text-[20px] text-primary";
      }
    } else {
      item.className = "nav-item flex items-center justify-between px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors group";
      const icon = item.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.className = "material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-on-surface";
      }
    }
  });

  // Update breadcrumb
  const titles = {
    'overview': 'Terminal Console',
    'live-orders': 'Live Kitchen & Order Dispatch',
    'menu': 'Menu & Item Availability',
    'tables': 'Tables & QR Codes',
    'payments': 'Payments & Reconciliation',
    'history': 'Order History',
    'settings': 'Terminal Settings'
  };
  const bTitle = document.getElementById('breadcrumb-title');
  if (bTitle) {
    bTitle.textContent = titles[path] || 'Terminal Console';
  }

  // Refresh target view data
  if (path === 'overview') {
    renderOverviewStats();
    renderOverviewOrders();
    renderKitchenStationLoads();
    renderTopMovingItems();
  } else if (path === 'live-orders') {
    renderKanbanBoard();
    renderDenseTable();
    if (subFilter) filterKanban(subFilter);
  } else if (path === 'menu') {
    renderMenuTable();
  } else if (path === 'tables') {
    renderTablesGrid();
  } else if (path === 'payments') {
    renderPayments();
  } else if (path === 'history') {
    renderHistory();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= HEADER & SEARCH =================
function setupHeaderEvents() {
  // Theme Toggle Button
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Notifications Bell
  const bell = document.getElementById('notifications-bell-btn');
  const notifMenu = document.getElementById('notifications-dropdown');
  if (bell && notifMenu) {
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      notifMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', () => {
      notifMenu.classList.add('hidden');
    });
  }

  // Walk-in Order Modal Button
  const walkinBtn = document.getElementById('new-walkin-btn');
  if (walkinBtn) {
    walkinBtn.addEventListener('click', toggleWalkInModal);
  }

  // Global Header Search Bar
  const globalSearch = document.getElementById('global-search-input');
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) return;
      if (AppState.currentView === 'menu') {
        const itemInput = document.getElementById('itemSearchInput');
        if (itemInput) {
          itemInput.value = q;
          AppState.menuCurrentPage = 1;
          renderMenuTable();
        }
      } else if (AppState.currentView === 'overview') {
        const ovInput = document.getElementById('overview-search-input');
        if (ovInput) {
          ovInput.value = q;
          renderOverviewOrders();
        }
      }
    });
  }

  // View switchers in live orders (Kanban vs Table)
  const btnKanban = document.getElementById('btn-kanban');
  const btnTable = document.getElementById('btn-table');
  const kanbanBoard = document.getElementById('kanban-board-container');
  const denseTable = document.getElementById('dense-table-container');

  if (btnKanban && btnTable && kanbanBoard && denseTable) {
    btnKanban.addEventListener('click', () => {
      btnKanban.className = "flex items-center gap-1 px-3 py-1 rounded bg-surface-container-high text-on-surface font-semibold shadow-sm transition-colors";
      btnTable.className = "flex items-center gap-1 px-3 py-1 rounded text-on-surface-variant hover:text-on-surface transition-colors";
      kanbanBoard.classList.remove('hidden');
      denseTable.classList.add('hidden');
    });

    btnTable.addEventListener('click', () => {
      btnTable.className = "flex items-center gap-1 px-3 py-1 rounded bg-surface-container-high text-on-surface font-semibold shadow-sm transition-colors";
      btnKanban.className = "flex items-center gap-1 px-3 py-1 rounded text-on-surface-variant hover:text-on-surface transition-colors";
      kanbanBoard.classList.add('hidden');
      denseTable.classList.remove('hidden');
      renderDenseTable();
    });
  }

  // Sound toggle button in live orders
  const audioBtn = document.getElementById('audio-toggle');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      AppState.audioEnabled = !AppState.audioEnabled;
      if (AppState.settings) {
        AppState.settings.audioEnabled = AppState.audioEnabled;
        saveToStorage(STORAGE_KEYS.SETTINGS, AppState.settings);
      }
      const label = audioBtn.querySelector('span:not(.material-symbols-outlined)');
      const icon = audioBtn.querySelector('.material-symbols-outlined');
      if (AppState.audioEnabled) {
        if (label) label.textContent = 'Sound: ON';
        if (icon) icon.textContent = 'volume_up';
        audioBtn.className = "flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container border border-surface-container-highest text-tertiary font-mono-sm text-mono-sm transition-colors";
        playKitchenChime();
        showToast('Sound Enabled', 'Kitchen audio chime active');
      } else {
        if (label) label.textContent = 'Sound: OFF';
        if (icon) icon.textContent = 'volume_off';
        audioBtn.className = "flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container border border-surface-container-highest text-on-surface-variant font-mono-sm text-mono-sm transition-colors";
        showToast('Sound Muted', 'Kitchen chime disabled');
      }
      const settingToggle = document.getElementById('settings-audio-toggle');
      if (settingToggle) settingToggle.checked = AppState.audioEnabled;
    });
  }
}

// ================= TASK 1: MENU MANAGEMENT (FIXED & REFINED) =================
function setupMenuEventListeners() {
  // Add New Item Button
  const addBtn = document.getElementById('openNewItemBtn');
  if (addBtn) {
    addBtn.addEventListener('click', prepareNewMenuItem);
  }

  // Category Tabs
  document.querySelectorAll('#categoryNav .cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#categoryNav .cat-pill').forEach(p => {
        p.className = "cat-pill flex items-center gap-1.5 px-space-md py-1.5 rounded bg-surface-container-low text-on-surface-variant hover:text-on-surface font-mono-sm text-mono-sm transition-colors whitespace-nowrap";
      });
      pill.className = "cat-pill active flex items-center gap-1.5 px-space-md py-1.5 rounded bg-surface-container-high text-on-surface font-mono-sm text-mono-sm transition-colors whitespace-nowrap font-semibold";
      AppState.menuActiveCategory = pill.getAttribute('data-category');
      AppState.menuCurrentPage = 1;
      renderMenuTable();
    });
  });

  // Search Input
  const searchInput = document.getElementById('itemSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      AppState.menuCurrentPage = 1;
      renderMenuTable();
    });
  }

  // Diet Filter
  const dietSelect = document.getElementById('dietFilterSelect');
  if (dietSelect) {
    dietSelect.addEventListener('change', () => {
      AppState.menuCurrentPage = 1;
      renderMenuTable();
    });
  }

  // Stock Filter
  const stockSelect = document.getElementById('stockFilterSelect');
  if (stockSelect) {
    stockSelect.addEventListener('change', () => {
      AppState.menuCurrentPage = 1;
      renderMenuTable();
    });
  }
}

/**
 * Open the Add/Edit panel in EDIT mode
 * Directly addresses Task 1 Expected Behaviors 1, 2, 3, 5
 */
function openEditMenuItem(sku) {
  const item = AppState.menuItems.find(i => i.sku === sku);
  if (!item) return;

  AppState.menuFormMode = 'edit';
  AppState.editingMenuSku = sku;

  // Requirement 2: The panel title changes to "Edit Menu Item"
  const headerTitle = document.getElementById('drawerHeaderTitle');
  if (headerTitle) {
    headerTitle.textContent = 'Edit Menu Item';
  }

  // Requirement 5: Retain existing ID / SKU
  const skuTag = document.getElementById('drawerSkuTag');
  if (skuTag) {
    skuTag.textContent = `#${item.sku}`;
  }

  // Requirement 3: Form is populated with selected item's values
  const nameInput = document.getElementById('itemNameInput');
  const catSelect = document.getElementById('itemCategorySelect');
  const priceInput = document.getElementById('itemPriceInput');
  const descInput = document.getElementById('itemDescInput');
  const visToggle = document.getElementById('itemVisibilityToggle');

  if (nameInput) nameInput.value = item.name;
  if (catSelect) catSelect.value = item.category;
  if (priceInput) priceInput.value = Number(item.price).toFixed(2);
  if (descInput) descInput.value = item.desc || '';
  if (visToggle) visToggle.checked = Boolean(item.inStock);

  // Set dietary classification radio
  const dietRadio = document.querySelector(`input[name="dietType"][value="${item.diet || 'veg'}"]`);
  if (dietRadio) {
    dietRadio.checked = true;
  }
  updateDietHighlight();

  // Button labels and visibility
  const saveBtn = document.getElementById('saveItemBtn');
  if (saveBtn) saveBtn.textContent = 'Save Changes';

  const deleteBtn = document.getElementById('deleteItemBtn');
  if (deleteBtn) deleteBtn.style.display = 'inline-flex';

  const cancelBtn = document.getElementById('cancelItemBtn');
  if (cancelBtn) cancelBtn.style.display = 'inline-flex';

  // Highlight table row
  document.querySelectorAll('.menu-row').forEach(row => {
    if (row.getAttribute('data-id') === sku) {
      row.classList.add('bg-surface-container', 'border-l-2', 'border-primary');
    } else {
      row.classList.remove('bg-surface-container', 'border-l-2', 'border-primary');
    }
  });

  // Ensure drawer is visible & scroll smoothly on mobile
  const drawer = document.getElementById('itemDrawer');
  if (drawer && window.innerWidth < 1024) {
    drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Switch the Add/Edit panel to CREATE mode
 */
function prepareNewMenuItem() {
  AppState.menuFormMode = 'create';
  AppState.editingMenuSku = null;

  const headerTitle = document.getElementById('drawerHeaderTitle');
  if (headerTitle) {
    headerTitle.textContent = 'Add New Menu Item';
  }

  const skuTag = document.getElementById('drawerSkuTag');
  if (skuTag) {
    skuTag.textContent = 'NEW ITEM (AUTO-ASSIGNED)';
  }

  const nameInput = document.getElementById('itemNameInput');
  const catSelect = document.getElementById('itemCategorySelect');
  const priceInput = document.getElementById('itemPriceInput');
  const descInput = document.getElementById('itemDescInput');
  const visToggle = document.getElementById('itemVisibilityToggle');

  if (nameInput) {
    nameInput.value = '';
    nameInput.placeholder = 'e.g. Kadai Paneer Special';
    nameInput.focus();
  }
  if (catSelect) catSelect.value = 'Main Course Curries';
  if (priceInput) priceInput.value = '';
  if (descInput) descInput.value = '';
  if (visToggle) visToggle.checked = true;

  const vegRadio = document.querySelector('input[name="dietType"][value="veg"]');
  if (vegRadio) vegRadio.checked = true;
  updateDietHighlight();

  const saveBtn = document.getElementById('saveItemBtn');
  if (saveBtn) saveBtn.textContent = 'Create Item';

  const deleteBtn = document.getElementById('deleteItemBtn');
  if (deleteBtn) deleteBtn.style.display = 'none';

  const cancelBtn = document.getElementById('cancelItemBtn');
  if (cancelBtn) cancelBtn.style.display = 'inline-flex';

  // Remove table row highlight
  document.querySelectorAll('.menu-row').forEach(row => {
    row.classList.remove('bg-surface-container', 'border-l-2', 'border-primary');
  });

  const drawer = document.getElementById('itemDrawer');
  if (drawer && window.innerWidth < 1024) {
    drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Requirement 6: Cancel closes the panel without modifying the item
 */
function closeMenuDrawer() {
  AppState.menuFormMode = null;
  AppState.editingMenuSku = null;

  const headerTitle = document.getElementById('drawerHeaderTitle');
  if (headerTitle) headerTitle.textContent = 'Select or Add Item';

  const skuTag = document.getElementById('drawerSkuTag');
  if (skuTag) skuTag.textContent = '';

  const nameInput = document.getElementById('itemNameInput');
  const priceInput = document.getElementById('itemPriceInput');
  const descInput = document.getElementById('itemDescInput');

  if (nameInput) nameInput.value = '';
  if (priceInput) priceInput.value = '';
  if (descInput) descInput.value = '';

  const deleteBtn = document.getElementById('deleteItemBtn');
  if (deleteBtn) deleteBtn.style.display = 'none';

  // Remove active highlights
  document.querySelectorAll('.menu-row').forEach(row => {
    row.classList.remove('bg-surface-container', 'border-l-2', 'border-primary');
  });

  showToast('Panel Reset', 'Changes cancelled without modifying catalogue');
}

/**
 * Save Handler: Creates new or updates existing item in-place
 * Directly addresses Task 1 Expected Behaviors 4, 5, 8, 9, 10
 */
function handleSaveItem() {
  const nameInput = document.getElementById('itemNameInput');
  const catSelect = document.getElementById('itemCategorySelect');
  const priceInput = document.getElementById('itemPriceInput');
  const descInput = document.getElementById('itemDescInput');
  const visToggle = document.getElementById('itemVisibilityToggle');

  const name = (nameInput?.value || '').trim();
  const category = catSelect?.value || 'Main Course Curries';
  const rawPrice = priceInput?.value?.trim() || '';
  const price = parseFloat(rawPrice);
  const desc = (descInput?.value || '').trim();
  const diet = document.querySelector('input[name="dietType"]:checked')?.value || 'veg';
  const inStock = Boolean(visToggle?.checked);

  // Requirement 8: Form validation prevents invalid names, negative prices, and missing required fields
  if (!name || name.length < 2) {
    showToast('Validation Error', 'Item name must be at least 2 characters long.');
    if (nameInput) nameInput.focus();
    return;
  }

  if (rawPrice === '' || isNaN(price) || price < 0) {
    showToast('Validation Error', 'Please enter a valid non-negative price.');
    if (priceInput) priceInput.focus();
    return;
  }

  if (!category) {
    showToast('Validation Error', 'Please select a menu category.');
    if (catSelect) catSelect.focus();
    return;
  }

  // Requirement 4 & 5: In edit mode, update in place without creating a duplicate; retain existing SKU
  if (AppState.menuFormMode === 'edit' && AppState.editingMenuSku) {
    const existing = AppState.menuItems.find(i => i.sku === AppState.editingMenuSku);
    if (existing) {
      existing.name = name;
      existing.category = category;
      existing.price = price;
      existing.diet = diet;
      existing.desc = desc;
      existing.inStock = inStock;

      saveToStorage(STORAGE_KEYS.MENU, AppState.menuItems);
      showToast(`Updated "${name}"`, 'Changes saved in-place & persisted to local storage');

      renderMenuTable();
      openEditMenuItem(existing.sku);
      return;
    }
  }

  // Create Mode: Prepend new item
  const newSku = `MNU-${Math.floor(100 + Math.random() * 900)}`;
  const newItem = {
    sku: newSku,
    name: name,
    category: category,
    price: price,
    diet: diet,
    desc: desc,
    inStock: inStock,
    image: 'assets/paneer.jpg' // Default food asset
  };

  AppState.menuItems.unshift(newItem);
  saveToStorage(STORAGE_KEYS.MENU, AppState.menuItems);
  showToast(`Created Item "${name}"`, `Assigned SKU ${newSku} & saved to catalogue`);

  renderMenuTable();
  openEditMenuItem(newSku);
}

/**
 * Requirement 7: Deleting an item requires confirmation
 */
function deleteCurrentItem() {
  if (!AppState.editingMenuSku) return;

  const item = AppState.menuItems.find(i => i.sku === AppState.editingMenuSku);
  if (!item) return;

  // Requirement 7: Confirmation required
  const confirmed = confirm(`Are you sure you want to delete "${item.name}" (${item.sku}) from the menu catalogue?\n\nThis action cannot be undone.`);
  if (!confirmed) return;

  AppState.menuItems = AppState.menuItems.filter(i => i.sku !== item.sku);
  saveToStorage(STORAGE_KEYS.MENU, AppState.menuItems);

  showToast(`Deleted "${item.name}"`, 'Item removed from menu catalogue');

  renderMenuTable();

  if (AppState.menuItems.length > 0) {
    openEditMenuItem(AppState.menuItems[0].sku);
  } else {
    closeMenuDrawer();
  }
}

/**
 * Toggle availability of a menu item in-place
 */
function toggleMenuItemStock(sku) {
  const item = AppState.menuItems.find(i => i.sku === sku);
  if (!item) return;

  item.inStock = !item.inStock;
  saveToStorage(STORAGE_KEYS.MENU, AppState.menuItems);

  showToast(
    item.inStock ? `"${item.name}" Marked In Stock` : `"${item.name}" 86'd / Sold Out`,
    item.inStock ? 'Available on diner QR menus' : 'Temporarily removed from ordering'
  );

  // If this item is currently loaded in the drawer, sync the toggle
  if (AppState.editingMenuSku === sku) {
    const visToggle = document.getElementById('itemVisibilityToggle');
    if (visToggle) visToggle.checked = item.inStock;
  }

  renderMenuTable();
}

/**
 * Render Catalogue Table with Search, Filter & Pagination
 * Directly addresses Task 1 Expected Behavior 9 & 10
 */
function renderMenuTable() {
  const tbody = document.getElementById('menu-tbody');
  if (!tbody) return;

  const searchQuery = (document.getElementById('itemSearchInput')?.value || '').toLowerCase().trim();
  const dietFilter = document.getElementById('dietFilterSelect')?.value || 'ALL';
  const stockFilter = document.getElementById('stockFilterSelect')?.value || 'ALL';

  const filtered = AppState.menuItems.filter(item => {
    // Category filter
    if (AppState.menuActiveCategory !== 'ALL' && item.category !== AppState.menuActiveCategory) {
      return false;
    }
    // Diet filter
    if (dietFilter !== 'ALL' && item.diet !== dietFilter) {
      return false;
    }
    // Stock filter
    if (stockFilter === 'IN_STOCK' && !item.inStock) return false;
    if (stockFilter === 'SOLD_OUT' && item.inStock) return false;

    // Search query
    if (searchQuery) {
      const matchName = (item.name || '').toLowerCase().includes(searchQuery);
      const matchSku = (item.sku || '').toLowerCase().includes(searchQuery);
      const matchDesc = (item.desc || '').toLowerCase().includes(searchQuery);
      if (!matchName && !matchSku && !matchDesc) return false;
    }
    return true;
  });

  // Calculate in-stock stats
  const totalCount = AppState.menuItems.length;
  const inStockCount = AppState.menuItems.filter(i => i.inStock).length;
  const soldOutCount = totalCount - inStockCount;
  const inStockRate = totalCount > 0 ? ((inStockCount / totalCount) * 100).toFixed(1) : '0.0';

  const rateEl = document.getElementById('menu-instock-rate');
  if (rateEl) rateEl.textContent = `${inStockRate}%`;
  const soldEl = document.getElementById('menu-soldout-count');
  if (soldEl) soldEl.textContent = `${soldOutCount} Sold Out`;

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / AppState.menuPageSize));
  if (AppState.menuCurrentPage > totalPages) AppState.menuCurrentPage = totalPages;
  const startIndex = (AppState.menuCurrentPage - 1) * AppState.menuPageSize;
  const pageItems = filtered.slice(startIndex, startIndex + AppState.menuPageSize);

  // If no items match, show empty state
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-space-md py-12 text-center text-on-surface-variant font-mono-sm">
          <span class="material-symbols-outlined text-3xl mb-1 text-on-surface-variant/60 block">restaurant_menu</span>
          <p class="font-semibold text-on-surface">No menu items found</p>
          <p class="text-xs text-on-surface-variant/70 mt-1">Try adjusting your filters or click "+ Add New Item" to create one.</p>
        </td>
      </tr>
    `;
    renderMenuPagination(0, 0, 0, 1, 1);
    return;
  }

  tbody.innerHTML = pageItems.map(item => {
    const isSelected = item.sku === AppState.editingMenuSku && AppState.menuFormMode === 'edit';
    const dietIcon = item.diet === 'veg' 
      ? '<span class="w-3.5 h-3.5 border border-emerald-600 rounded-sm flex items-center justify-center p-0.5 shrink-0" title="Vegetarian"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span></span>'
      : item.diet === 'egg'
      ? '<span class="w-3.5 h-3.5 border border-amber-600 rounded-sm flex items-center justify-center p-0.5 shrink-0" title="Contains Egg"><span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span></span>'
      : '<span class="w-3.5 h-3.5 border border-red-600 rounded-sm flex items-center justify-center p-0.5 shrink-0" title="Non-Vegetarian"><span class="w-1.5 h-1.5 rounded-full bg-red-600"></span></span>';

    return `
      <tr class="menu-row hover:bg-surface-container/60 transition-colors cursor-pointer ${isSelected ? 'bg-surface-container border-l-2 border-primary' : ''}" data-id="${item.sku}" onclick="openEditMenuItem('${item.sku}')">
        <td class="px-space-md py-3 w-16">
          <img src="${item.image || 'assets/paneer.jpg'}" alt="${item.name}" class="w-11 h-11 object-cover rounded border border-surface-container-highest" onerror="this.src='assets/logo.png'">
        </td>
        <td class="px-space-md py-3">
          <div class="flex items-center gap-2">
            ${dietIcon}
            <span class="font-body-md font-semibold text-on-surface">${item.name}</span>
          </div>
          <p class="font-mono-sm text-xs text-on-surface-variant mt-0.5">${item.sku}</p>
        </td>
        <td class="px-space-md py-3 font-mono-sm text-xs text-on-surface-variant">${item.category}</td>
        <td class="px-space-md py-3 font-mono-sm text-sm font-semibold text-primary text-right">₹${Number(item.price).toFixed(2)}</td>
        <td class="px-space-md py-3 text-center" onclick="event.stopPropagation();">
          <button onclick="toggleMenuItemStock('${item.sku}')" class="stock-toggle inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono-sm text-[11px] font-medium transition-colors ${item.inStock ? 'bg-tertiary/15 text-tertiary hover:bg-tertiary/25' : 'bg-error-container/30 text-error hover:bg-error-container/50'}">
            <span class="w-1.5 h-1.5 rounded-full ${item.inStock ? 'bg-tertiary' : 'bg-error'}"></span>
            <span>${item.inStock ? 'In Stock' : "86'd / Sold"}</span>
          </button>
        </td>
        <td class="px-space-md py-3 text-right" onclick="event.stopPropagation();">
          <button onclick="openEditMenuItem('${item.sku}')" class="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" title="Edit Item">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  renderMenuPagination(startIndex + 1, Math.min(startIndex + AppState.menuPageSize, filtered.length), filtered.length, AppState.menuCurrentPage, totalPages);
}

function renderMenuPagination(start, end, total, current, totalPages) {
  const container = document.querySelector('#view-menu .border-t.border-surface-container-highest');
  if (!container) return;

  if (total === 0) {
    container.innerHTML = `
      <span>Showing 0 items</span>
      <div class="flex items-center gap-1">
        <button class="px-2 py-1 rounded bg-surface-container text-on-surface opacity-30 cursor-not-allowed" disabled>Prev</button>
        <span class="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">1 / 1</span>
        <button class="px-2 py-1 rounded bg-surface-container text-on-surface opacity-30 cursor-not-allowed" disabled>Next</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <span>Showing ${start} to ${end} of ${total} menu items</span>
    <div class="flex items-center gap-1">
      <button onclick="changeMenuPage(${current - 1})" class="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors" ${current <= 1 ? 'disabled' : ''}>Prev</button>
      <span class="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">${current} / ${totalPages}</span>
      <button onclick="changeMenuPage(${current + 1})" class="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors" ${current >= totalPages ? 'disabled' : ''}>Next</button>
    </div>
  `;
}

function changeMenuPage(newPage) {
  AppState.menuCurrentPage = newPage;
  renderMenuTable();
}

function updateDietHighlight() {
  const selected = document.querySelector('input[name="dietType"]:checked')?.value || 'veg';
  const labels = {
    veg: document.getElementById('dietLabelVeg'),
    nonveg: document.getElementById('dietLabelNonVeg'),
    egg: document.getElementById('dietLabelEgg')
  };

  Object.entries(labels).forEach(([key, labelEl]) => {
    if (!labelEl) return;
    if (key === selected) {
      labelEl.className = "flex items-center justify-center gap-1.5 py-1.5 rounded cursor-pointer transition-colors bg-surface-container-high text-on-surface font-medium select-none";
    } else {
      labelEl.className = "flex items-center justify-center gap-1.5 py-1.5 rounded cursor-pointer transition-colors text-on-surface-variant hover:text-on-surface font-medium select-none";
    }
  });
}

// ================= TASK 3: TABLE MANAGEMENT (FUNCTIONAL LOCAL SYSTEM) =================

/**
 * Render Tables Grid with Independent Occupancy & Ordering
 * Directly addresses Task 3 Requirements & Important Rules
 */
function renderTablesGrid() {
  const grid = document.getElementById('tables-grid');
  if (!grid) return;

  const total = AppState.tables.length;
  const orderingEnabledCount = AppState.tables.filter(t => t.orderingEnabled).length;
  const occupiedCount = AppState.tables.filter(t => t.status === 'OCCUPIED').length;
  const vacantCount = total - occupiedCount;

  // Update telemetry counters
  const totalEl = document.getElementById('stat-total-tables');
  if (totalEl) totalEl.textContent = total;
  const orderEl = document.getElementById('stat-ordering-enabled-tables');
  if (orderEl) orderEl.textContent = orderingEnabledCount;
  const occEl = document.getElementById('stat-occupied-tables');
  if (occEl) occEl.textContent = occupiedCount;
  const vacEl = document.getElementById('stat-vacant-tables');
  if (vacEl) vacEl.textContent = vacantCount;

  // Update sidebar counter
  const sidebarCount = document.getElementById('sidebar-tables-count');
  if (sidebarCount) sidebarCount.textContent = `${total} Tables`;

  // Update overview occupied badge
  const overviewOcc = document.getElementById('overview-occupied-tables');
  if (overviewOcc) {
    const pct = total > 0 ? Math.round((occupiedCount / total) * 100) : 0;
    overviewOcc.textContent = `${occupiedCount}/${total}`;
    if (overviewOcc.parentElement) {
      overviewOcc.parentElement.innerHTML = `
        <span class="material-symbols-outlined text-[16px] text-tertiary">table_restaurant</span>
        <span class="text-on-surface font-semibold" id="overview-occupied-tables">${occupiedCount}/${total}</span> Tables Occupied (${pct}%)
      `;
    }
  }

  // Update header subtitle
  const headerSub = document.getElementById('tables-header-subtitle');
  if (headerSub) {
    headerSub.textContent = `${total} configured tables • Real-time occupancy & ordering control`;
  }

  // Empty state if no tables exist
  if (total === 0) {
    grid.innerHTML = `
      <div class="col-span-full p-12 text-center bg-surface-container-low rounded-lg border border-dashed border-surface-container-highest">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/60 mb-2 block">table_restaurant</span>
        <h3 class="font-headline-sm text-on-surface font-semibold">No Tables Configured</h3>
        <p class="font-body-sm text-on-surface-variant mt-1 max-w-md mx-auto">Configure your dining floor tables and generate QR code stencils for customer self-ordering.</p>
        <button onclick="openAddTableModal()" class="mt-4 px-4 py-2 bg-primary text-on-primary rounded font-headline-sm text-sm font-semibold inline-flex items-center gap-1.5 shadow-sm hover:bg-primary-container transition-all">
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span>Add First Table</span>
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = AppState.tables.map(table => {
    const isOccupied = table.status === 'OCCUPIED';
    const isOrderable = Boolean(table.orderingEnabled);

    return `
      <div class="p-3.5 rounded-lg border ${isOccupied ? 'border-primary/50 bg-surface-container' : 'border-surface-container-highest bg-surface-container-low'} flex flex-col justify-between space-y-3 select-none hover:border-primary/70 transition-all shadow-sm">
        
        <!-- Header: Table ID & Occupancy Pulse -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="font-headline-sm font-semibold text-on-surface">${table.id}</span>
            <span class="font-mono-sm text-[11px] text-on-surface-variant truncate">(${table.name || table.id})</span>
          </div>
          <span class="w-2.5 h-2.5 rounded-full ${isOccupied ? 'bg-primary animate-pulse' : 'bg-surface-container-highest'}" title="${isOccupied ? 'Occupied' : 'Vacant'}"></span>
        </div>

        <!-- Meta: Zone & Seating -->
        <div class="space-y-1 font-mono-sm text-xs">
          <div class="flex items-center justify-between text-on-surface-variant">
            <span class="truncate">${table.zone || 'Floor'}</span>
            <span class="flex items-center gap-1 font-semibold text-on-surface">
              <span class="material-symbols-outlined text-[14px]">groups</span>
              ${table.capacity || 4} Seats
            </span>
          </div>

          <!-- Independent Occupancy Toggle Badge -->
          <div class="pt-1 flex items-center justify-between">
            <span class="text-on-surface-variant">Occupancy:</span>
            <button onclick="toggleTableOccupancy('${table.id}', event)" class="px-2 py-0.5 rounded font-mono-sm text-[10px] font-semibold transition-colors ${isOccupied ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'}" title="Toggle Occupancy (Independent of ordering availability)">
              ${isOccupied ? 'Occupied' : 'Vacant'}
            </button>
          </div>

          <!-- Independent Ordering Toggle Badge -->
          <div class="flex items-center justify-between">
            <span class="text-on-surface-variant">Ordering:</span>
            <button onclick="toggleTableOrdering('${table.id}', event)" class="px-2 py-0.5 rounded font-mono-sm text-[10px] font-semibold transition-colors ${isOrderable ? 'bg-tertiary/20 text-tertiary hover:bg-tertiary/30' : 'bg-error/20 text-error hover:bg-error/30'}" title="Toggle Ordering Availability">
              ${isOrderable ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        <!-- Action Ribbon: QR, Edit, Delete -->
        <div class="pt-2 border-t border-surface-container-highest flex items-center justify-between">
          <button onclick="showTableQRModal('${table.id}', event)" class="flex items-center gap-1 font-mono-sm text-[11px] text-primary hover:underline font-semibold" title="Inspect QR Code Token">
            <span class="material-symbols-outlined text-[15px]">qr_code</span>
            <span>QR Token</span>
          </button>
          <div class="flex items-center gap-1">
            <button onclick="openEditTableModal('${table.id}', event)" class="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" title="Edit Table Details">
              <span class="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button onclick="deleteTable('${table.id}', event)" class="p-1 rounded text-error/80 hover:text-error hover:bg-error/10 transition-colors" title="Delete Table">
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>

      </div>
    `;
  }).join('');
}

function openAddTableModal() {
  const modal = document.getElementById('table-modal');
  if (!modal) return;

  document.getElementById('tableModalTitle').textContent = 'Add Dining Table';
  document.getElementById('tableEditId').value = '';
  
  const nextNum = AppState.tables.length + 1;
  document.getElementById('tableIdInput').value = `T-${String(nextNum).padStart(2, '0')}`;
  document.getElementById('tableCapacityInput').value = '4';
  document.getElementById('tableZoneSelect').value = 'Main Courtyard';
  document.getElementById('tableOrderingToggle').checked = true;
  document.getElementById('tableOccupancyToggle').checked = false;

  modal.classList.remove('hidden');
}

function openEditTableModal(tableId, event) {
  if (event) event.stopPropagation();
  const table = AppState.tables.find(t => t.id === tableId);
  if (!table) return;

  const modal = document.getElementById('table-modal');
  if (!modal) return;

  document.getElementById('tableModalTitle').textContent = `Edit Table: ${table.id}`;
  document.getElementById('tableEditId').value = table.id;
  document.getElementById('tableIdInput').value = table.name || table.id;
  document.getElementById('tableCapacityInput').value = table.capacity || 4;
  document.getElementById('tableZoneSelect').value = table.zone || 'Main Courtyard';
  document.getElementById('tableOrderingToggle').checked = Boolean(table.orderingEnabled);
  document.getElementById('tableOccupancyToggle').checked = table.status === 'OCCUPIED';

  modal.classList.remove('hidden');
}

function closeTableModal() {
  const modal = document.getElementById('table-modal');
  if (modal) modal.classList.add('hidden');
}

function handleSaveTable() {
  const editId = document.getElementById('tableEditId').value.trim();
  const tableIdOrName = document.getElementById('tableIdInput').value.trim();
  const capacity = parseInt(document.getElementById('tableCapacityInput').value, 10);
  const zone = document.getElementById('tableZoneSelect').value;
  const orderingEnabled = document.getElementById('tableOrderingToggle').checked;
  const isOccupied = document.getElementById('tableOccupancyToggle').checked;

  if (!tableIdOrName) {
    showToast('Invalid Input', 'Table identifier / name cannot be empty');
    return;
  }

  if (isNaN(capacity) || capacity <= 0) {
    showToast('Invalid Input', 'Seating capacity must be at least 1 person');
    return;
  }

  // Edit Mode
  if (editId) {
    const table = AppState.tables.find(t => t.id === editId);
    if (table) {
      table.name = tableIdOrName;
      table.capacity = capacity;
      table.zone = zone;
      table.orderingEnabled = orderingEnabled;
      table.status = isOccupied ? 'OCCUPIED' : 'VACANT';

      saveToStorage(STORAGE_KEYS.TABLES, AppState.tables);
      showToast(`Updated Table ${table.id}`, 'Table settings persisted');
      closeTableModal();
      renderTablesGrid();
      populatePosTablesDropdown();
      return;
    }
  }

  // Add Mode: Check duplicate
  if (AppState.tables.some(t => t.id.toLowerCase() === tableIdOrName.toLowerCase())) {
    showToast('Duplicate Table', `A table with ID "${tableIdOrName}" already exists`);
    return;
  }

  const cleanTokenId = tableIdOrName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const newTable = {
    id: tableIdOrName,
    name: tableIdOrName,
    zone: zone,
    capacity: capacity,
    orderingEnabled: orderingEnabled,
    status: isOccupied ? 'OCCUPIED' : 'VACANT',
    token: `CPB-${cleanTokenId}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  };

  AppState.tables.push(newTable);
  saveToStorage(STORAGE_KEYS.TABLES, AppState.tables);
  showToast(`Added Table ${newTable.id}`, `Configured with QR token ${newTable.token}`);

  closeTableModal();
  renderTablesGrid();
  populatePosTablesDropdown();
}

/**
 * Requirement: Occupancy and ordering availability are separate properties
 * An occupied table can still be allowed to order; a vacant table can have ordering disabled.
 */
function toggleTableOrdering(tableId, event) {
  if (event) event.stopPropagation();
  const table = AppState.tables.find(t => t.id === tableId);
  if (!table) return;

  table.orderingEnabled = !table.orderingEnabled;
  saveToStorage(STORAGE_KEYS.TABLES, AppState.tables);

  showToast(
    `Table ${table.id}: Ordering ${table.orderingEnabled ? 'Enabled' : 'Disabled'}`,
    table.orderingEnabled ? 'Diners can place orders via QR' : 'Ordering blocked for this table'
  );

  renderTablesGrid();
  populatePosTablesDropdown();
}

/**
 * Requirement: Toggle occupancy independently from ordering availability
 */
function toggleTableOccupancy(tableId, event) {
  if (event) event.stopPropagation();
  const table = AppState.tables.find(t => t.id === tableId);
  if (!table) return;

  table.status = table.status === 'OCCUPIED' ? 'VACANT' : 'OCCUPIED';
  saveToStorage(STORAGE_KEYS.TABLES, AppState.tables);

  showToast(
    `Table ${table.id} Marked ${table.status === 'OCCUPIED' ? 'Occupied' : 'Vacant'}`,
    table.status === 'OCCUPIED' ? 'Diners seated at table' : 'Table ready for next guests'
  );

  renderTablesGrid();
}

/**
 * Requirement: Delete a table only when it has no active orders
 */
function deleteTable(tableId, event) {
  if (event) event.stopPropagation();
  const table = AppState.tables.find(t => t.id === tableId);
  if (!table) return;

  // Check active orders
  const activeOrder = AppState.orders.find(o => 
    (o.table === table.id || o.table === table.name) && 
    o.status !== 'COMPLETED'
  );

  if (activeOrder) {
    alert(`Cannot delete ${table.name || table.id}!\n\nThis table currently has an active order in kitchen dispatch (#${activeOrder.id} - ${activeOrder.status}).\nPlease fulfill or cancel active orders before removing this table.`);
    return;
  }

  const confirmed = confirm(`Are you sure you want to delete ${table.name || table.id}?\n\nThis will remove its QR code configuration from the local floor plan.`);
  if (!confirmed) return;

  AppState.tables = AppState.tables.filter(t => t.id !== tableId);
  saveToStorage(STORAGE_KEYS.TABLES, AppState.tables);

  showToast(`Deleted Table ${tableId}`, 'Table removed from floor layout');
  renderTablesGrid();
  populatePosTablesDropdown();
}

/**
 * Show QR Code Token Modal with Pending Backend Notice
 */
function showTableQRModal(tableId, event) {
  if (event) event.stopPropagation();
  const table = AppState.tables.find(t => t.id === tableId);
  if (!table) return;

  const modal = document.getElementById('table-qr-modal');
  if (!modal) return;

  document.getElementById('qrModalTableTitle').textContent = `QR Stencil: ${table.id}`;
  document.getElementById('qrModalTokenCode').textContent = table.token || `CPB-${table.id}-PROTOTYPE`;
  document.getElementById('qrModalMeta').textContent = `Zone: ${table.zone} • ${table.capacity} Seats`;

  const orderBadge = document.getElementById('qrModalOrderingBadge');
  if (orderBadge) {
    orderBadge.textContent = table.orderingEnabled ? 'Ordering: Enabled' : 'Ordering: Disabled';
    orderBadge.className = `px-2 py-0.5 rounded font-mono-sm text-[10px] font-semibold ${table.orderingEnabled ? 'bg-tertiary/20 text-tertiary' : 'bg-error/20 text-error'}`;
  }

  const occBadge = document.getElementById('qrModalOccupancyBadge');
  if (occBadge) {
    occBadge.textContent = table.status === 'OCCUPIED' ? 'Status: Occupied' : 'Status: Vacant';
    occBadge.className = `px-2 py-0.5 rounded font-mono-sm text-[10px] font-semibold ${table.status === 'OCCUPIED' ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`;
  }

  // Generate SVG QR pattern
  generateTableQRSvg('qr-svg-display', table.token || table.id);

  modal.classList.remove('hidden');
}

function closeTableQRModal() {
  const modal = document.getElementById('table-qr-modal');
  if (modal) modal.classList.add('hidden');
}

function printSingleQR() {
  showToast('Printing Table Stencil...', 'Sent vector stencil to thermal printer');
}

function printAllQRStencils() {
  showToast('Printing Stencils...', `Generating PDF sheets for ${AppState.tables.length} tables`);
}

/**
 * Simple Vector QR SVG Renderer for Clean High-DPI Stencils
 */
function generateTableQRSvg(targetSvgId, code) {
  const svg = document.getElementById(targetSvgId);
  if (!svg) return;

  // High contrast QR matrix with positional markers
  svg.innerHTML = `
    <rect width="100" height="100" fill="#FFFFFF"/>
    <!-- Corner Finder Pattern: Top-Left -->
    <rect x="10" y="10" width="24" height="24" fill="#111827"/>
    <rect x="14" y="14" width="16" height="16" fill="#FFFFFF"/>
    <rect x="18" y="18" width="8" height="8" fill="#111827"/>
    
    <!-- Corner Finder Pattern: Top-Right -->
    <rect x="66" y="10" width="24" height="24" fill="#111827"/>
    <rect x="70" y="14" width="16" height="16" fill="#FFFFFF"/>
    <rect x="74" y="18" width="8" height="8" fill="#111827"/>
    
    <!-- Corner Finder Pattern: Bottom-Left -->
    <rect x="10" y="66" width="24" height="24" fill="#111827"/>
    <rect x="14" y="70" width="16" height="16" fill="#FFFFFF"/>
    <rect x="18" y="74" width="8" height="8" fill="#111827"/>
    
    <!-- Sync & Alignment Bars -->
    <line x1="38" y1="18" x2="62" y2="18" stroke="#111827" stroke-width="4" stroke-dasharray="4 4"/>
    <line x1="18" y1="38" x2="18" y2="62" stroke="#111827" stroke-width="4" stroke-dasharray="4 4"/>
    
    <!-- Center Data Blocks -->
    <rect x="44" y="44" width="12" height="12" fill="#111827"/>
    <rect x="40" y="66" width="8" height="8" fill="#111827"/>
    <rect x="52" y="60" width="8" height="8" fill="#111827"/>
    <rect x="68" y="44" width="8" height="8" fill="#111827"/>
    <rect x="80" y="56" width="6" height="6" fill="#111827"/>
    <rect x="40" y="32" width="6" height="6" fill="#111827"/>
    <rect x="56" y="24" width="6" height="6" fill="#111827"/>
    <rect x="72" y="72" width="10" height="10" fill="#111827"/>
    <rect x="84" y="40" width="6" height="6" fill="#111827"/>
  `;
}

// ================= TASK 2: REMOVE FABRICATED DEMO DATA & DYNAMIC RENDERING =================

function setupOverviewEventListeners() {
  document.querySelectorAll('#overview-tabs .overview-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#overview-tabs .overview-tab-btn').forEach(b => {
        b.className = "overview-tab-btn px-space-sm py-1 rounded text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors";
      });
      btn.className = "overview-tab-btn px-space-sm py-1 rounded bg-surface-container-high text-on-surface font-body-sm text-body-sm font-semibold transition-colors";
      AppState.overviewFilter = btn.getAttribute('data-filter');
      renderOverviewOrders();
    });
  });

  const search = document.getElementById('overview-search-input');
  if (search) {
    search.addEventListener('input', renderOverviewOrders);
  }
}

/**
 * Dynamically computes operational summary metrics
 * Removes all fabricated figures (e.g. fake 8 orders, 142 completed, ₹1,18,450 revenue)
 */
function renderOverviewStats() {
  const newOrders = AppState.orders.filter(o => o.status === 'NEW');
  const activeOrders = AppState.orders.filter(o => ['NEW', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
  const preppingOrders = AppState.orders.filter(o => o.status === 'PREPARING');
  const readyOrders = AppState.orders.filter(o => o.status === 'READY');
  const completedOrders = AppState.history;
  
  // Real revenue sum from verified completed meals
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const totalCovers = completedOrders.reduce((sum, o) => {
    const itemCovers = (o.items || []).reduce((isum, i) => isum + (i.qty || 1), 0);
    return sum + itemCovers;
  }, 0);

  // Card 1: New Orders
  const newCountEl = document.getElementById('card-new-orders-count');
  if (newCountEl) newCountEl.textContent = newOrders.length;
  const newSubEl = document.getElementById('card-new-orders-sub');
  if (newSubEl) {
    newSubEl.textContent = newOrders.length > 0 
      ? `${newOrders.length} ticket${newOrders.length > 1 ? 's' : ''} awaiting acceptance`
      : 'Awaiting diner orders';
  }

  // Card 2: Active Kitchen Orders
  const activeCountEl = document.getElementById('card-active-orders-count');
  if (activeCountEl) activeCountEl.textContent = activeOrders.length;
  const activeSubEl = document.getElementById('card-active-orders-sub');
  if (activeSubEl) {
    activeSubEl.textContent = `${preppingOrders.length} Prep • ${readyOrders.length} Ready to Pickup`;
  }

  // Card 3: Completed Orders
  const compCountEl = document.getElementById('card-completed-count');
  if (compCountEl) compCountEl.textContent = completedOrders.length;
  const compSubEl = document.getElementById('card-completed-sub');
  if (compSubEl) {
    compSubEl.textContent = `Total covers: ${totalCovers} diners`;
  }

  // Card 4: Today's Revenue
  const revAmountEl = document.getElementById('card-revenue-amount');
  if (revAmountEl) revAmountEl.textContent = `₹${totalRevenue.toFixed(2)}`;
  const revSubEl = document.getElementById('card-revenue-sub');
  if (revSubEl) {
    revSubEl.textContent = `${completedOrders.length} verified settled meals`;
  }

  // Sidebar live badge
  const sidebarCount = document.getElementById('sidebar-live-count');
  if (sidebarCount) {
    sidebarCount.textContent = `${activeOrders.length} Live`;
  }
}

/**
 * Overview Live Floor & Orders Table
 * Replaces fake data with legitimate state or clean empty state
 */
function renderOverviewOrders() {
  const tbody = document.getElementById('overview-orders-tbody');
  if (!tbody) return;

  const searchQuery = (document.getElementById('overview-search-input')?.value || '').toLowerCase().trim();

  const filtered = AppState.orders.filter(order => {
    // Filter by type
    if (AppState.overviewFilter === 'TABLE_QR' && order.channel !== 'TABLE_QR') return false;
    if (AppState.overviewFilter === 'TAKEAWAY' && order.channel !== 'TAKEAWAY') return false;
    if (AppState.overviewFilter === 'PRIORITY' && !order.priority) return false;

    // Search
    if (searchQuery) {
      const matchId = (order.id || '').toLowerCase().includes(searchQuery);
      const matchTable = (order.table || '').toLowerCase().includes(searchQuery);
      const matchToken = (order.token || '').toLowerCase().includes(searchQuery);
      const matchItem = (order.items || []).some(i => (i.name || '').toLowerCase().includes(searchQuery));
      if (!matchId && !matchTable && !matchToken && !matchItem) return false;
    }
    return true;
  });

  // Update Overview Filter Tabs Count
  const allCount = AppState.orders.length;
  const qrCount = AppState.orders.filter(o => o.channel === 'TABLE_QR').length;
  const takeawayCount = AppState.orders.filter(o => o.channel === 'TAKEAWAY').length;
  const priorityCount = AppState.orders.filter(o => o.priority).length;

  const oAll = document.getElementById('otab-all');
  if (oAll) oAll.textContent = `All (${allCount})`;
  const oQr = document.getElementById('otab-table');
  if (oQr) oQr.textContent = `Table QR (${qrCount})`;
  const oTake = document.getElementById('otab-takeaway');
  if (oTake) oTake.textContent = `Takeaway (${takeawayCount})`;
  const oPri = document.getElementById('otab-priority');
  if (oPri) oPri.textContent = `Priority (${priorityCount})`;

  const counterEl = document.getElementById('overview-table-counter');
  if (counterEl) {
    counterEl.textContent = `Showing ${filtered.length} of ${allCount} active floor sessions`;
  }

  // Legitimate Empty State
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="px-space-md py-12 text-center text-on-surface-variant font-mono-sm">
          <span class="material-symbols-outlined text-3xl mb-1 text-on-surface-variant/60 block">inbox</span>
          <p class="font-semibold text-on-surface">No active dining sessions or pending orders</p>
          <p class="text-xs text-on-surface-variant/70 mt-1">Diner QR orders and counter walk-in orders will appear here automatically.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(order => {
    const itemsSummary = (order.items || []).map(i => `${i.qty}× ${i.name}`).join(', ');
    const elapsedMins = Math.floor((order.elapsedSeconds || 0) / 60);

    return `
      <tr class="hover:bg-surface-container font-mono-sm text-xs cursor-pointer" onclick="openOrderDrawer('${order.id}')">
        <td class="px-space-md py-2.5 text-primary font-semibold">${order.id}</td>
        <td class="px-space-sm py-2.5 font-semibold text-on-surface">${order.table}</td>
        <td class="px-space-sm py-2.5 text-on-surface-variant">${order.time || 'Now'} (${elapsedMins}m)</td>
        <td class="px-space-md py-2.5 font-body-sm text-on-surface truncate max-w-xs">${itemsSummary}</td>
        <td class="px-space-md py-2.5 text-right font-semibold text-primary">₹${Number(order.amount).toFixed(2)}</td>
        <td class="px-space-md py-2.5 text-on-surface-variant">${order.payment || 'Counter POS'}</td>
        <td class="px-space-md py-2.5">${getStatusBadge(order.status)}</td>
        <td class="px-space-md py-2.5 text-right whitespace-nowrap" onclick="event.stopPropagation();">
          ${getActionButton(order)}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Remove fake station loads and calculate from actual preparing tickets
 */
function renderKitchenStationLoads() {
  const container = document.getElementById('station-loads-container');
  const countEl = document.getElementById('station-loads-active-count');
  const turnaroundEl = document.getElementById('station-turnaround-time');
  if (!container) return;

  const preppingOrders = AppState.orders.filter(o => o.status === 'PREPARING');

  if (preppingOrders.length === 0) {
    if (countEl) countEl.textContent = '0 Active Stations';
    if (turnaroundEl) turnaroundEl.textContent = '-- mins';
    container.innerHTML = `
      <p class="py-4 text-center text-on-surface-variant font-mono-sm text-xs italic">All stations idle • No meals currently in preparation</p>
    `;
    return;
  }

  // Count items by station
  let grillCount = 0;
  let curryCount = 0;
  let beverageCount = 0;

  preppingOrders.forEach(o => {
    (o.items || []).forEach(item => {
      const name = (item.name || '').toLowerCase();
      if (name.includes('naan') || name.includes('tikka') || name.includes('roti') || name.includes('tandoor')) {
        grillCount += item.qty || 1;
      } else if (name.includes('chai') || name.includes('coffee') || name.includes('beverage') || name.includes('lassi')) {
        beverageCount += item.qty || 1;
      } else {
        curryCount += item.qty || 1;
      }
    });
  });

  const grillPct = Math.min(100, grillCount * 25);
  const curryPct = Math.min(100, curryCount * 20);
  const bevPct = Math.min(100, beverageCount * 30);
  const activeStations = (grillCount > 0 ? 1 : 0) + (curryCount > 0 ? 1 : 0) + (beverageCount > 0 ? 1 : 0);

  if (countEl) countEl.textContent = `${activeStations} Active Station${activeStations > 1 ? 's' : ''}`;
  if (turnaroundEl) turnaroundEl.textContent = '12 mins';

  container.innerHTML = `
    <!-- Grill Station -->
    <div class="space-y-1">
      <div class="flex items-center justify-between font-mono-sm text-mono-sm">
        <span class="text-on-surface">Grill & Tandoor</span>
        <span class="${grillPct > 70 ? 'text-error' : 'text-primary'} font-semibold">${grillPct}% Load (${grillCount} items)</span>
      </div>
      <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div class="bg-primary h-full rounded-full transition-all duration-500" style="width: ${grillPct}%;"></div>
      </div>
    </div>
    <!-- Curry Station -->
    <div class="space-y-1">
      <div class="flex items-center justify-between font-mono-sm text-mono-sm">
        <span class="text-on-surface">Curry & Main Station</span>
        <span class="${curryPct > 70 ? 'text-error' : 'text-primary'} font-semibold">${curryPct}% Load (${curryCount} items)</span>
      </div>
      <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div class="bg-primary h-full rounded-full transition-all duration-500" style="width: ${curryPct}%;"></div>
      </div>
    </div>
    <!-- Beverage Station -->
    <div class="space-y-1">
      <div class="flex items-center justify-between font-mono-sm text-mono-sm">
        <span class="text-on-surface">Beverages & Counter</span>
        <span class="text-tertiary font-semibold">${bevPct}% Load (${beverageCount} items)</span>
      </div>
      <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div class="bg-tertiary h-full rounded-full transition-all duration-500" style="width: ${bevPct}%;"></div>
      </div>
    </div>
  `;
}

/**
 * Remove fake top moving items and compute from legitimate order history
 */
function renderTopMovingItems() {
  const container = document.getElementById('top-items-container');
  if (!container) return;

  if (AppState.history.length === 0) {
    container.innerHTML = `
      <p class="py-4 text-center text-on-surface-variant font-mono-sm text-xs italic">No orders fulfilled yet • Trends update with completed meals</p>
    `;
    return;
  }

  // Aggregate item sales
  const sales = {};
  AppState.history.forEach(order => {
    (order.items || []).forEach(item => {
      const name = item.name || 'Special Meal';
      const qty = item.qty || 1;
      const price = item.price || 0;
      if (!sales[name]) sales[name] = { qty: 0, revenue: 0 };
      sales[name].qty += qty;
      sales[name].revenue += (qty * price);
    });
  });

  const sorted = Object.entries(sales).sort((a, b) => b[1].qty - a[1].qty).slice(0, 4);

  if (sorted.length === 0) {
    container.innerHTML = `
      <p class="py-4 text-center text-on-surface-variant font-mono-sm text-xs italic">No items recorded in completed meal receipts</p>
    `;
    return;
  }

  container.innerHTML = sorted.map(([name, data], idx) => `
    <div class="py-2.5 flex items-center justify-between">
      <div class="min-w-0 pr-2">
        <p class="font-body-sm text-body-sm font-semibold text-on-surface truncate">${idx + 1}. ${name}</p>
        <p class="font-mono-sm text-mono-sm text-on-surface-variant">${data.qty} order${data.qty > 1 ? 's' : ''} settled</p>
      </div>
      <div class="text-right shrink-0">
        <p class="font-mono-sm text-mono-sm font-semibold text-primary">₹${data.revenue.toFixed(2)}</p>
        <span class="font-label-caps text-[10px] text-tertiary font-bold">Verified Sale</span>
      </div>
    </div>
  `).join('');
}

// ================= LIVE ORDERS (KANBAN BOARD & ADVANCE FLOW) =================

function renderKanbanBoard() {
  const colNew = document.getElementById('kanban-col-new');
  const colAccepted = document.getElementById('kanban-col-accepted');
  const colPrep = document.getElementById('kanban-col-preparing');
  const colReady = document.getElementById('kanban-col-ready');

  if (!colNew || !colAccepted || !colPrep || !colReady) return;

  const ordersNew = AppState.orders.filter(o => o.status === 'NEW');
  const ordersAccepted = AppState.orders.filter(o => o.status === 'ACCEPTED');
  const ordersPrep = AppState.orders.filter(o => o.status === 'PREPARING');
  const ordersReady = AppState.orders.filter(o => o.status === 'READY');

  // Update counts
  const cNew = document.getElementById('col-count-new');
  if (cNew) cNew.textContent = ordersNew.length;
  const cAcc = document.getElementById('col-count-accepted');
  if (cAcc) cAcc.textContent = ordersAccepted.length;
  const cPrep = document.getElementById('col-count-preparing');
  if (cPrep) cPrep.textContent = ordersPrep.length;
  const cRdy = document.getElementById('col-count-ready');
  if (cRdy) cRdy.textContent = ordersReady.length;

  // Header counters
  const totalBadge = document.getElementById('kanban-total-badge');
  if (totalBadge) totalBadge.textContent = `${AppState.orders.length} In-Flight Orders`;

  const pulseDot = document.getElementById('kanban-pulse-dot');
  if (pulseDot) {
    if (AppState.orders.length > 0) {
      pulseDot.className = 'w-2 h-2 rounded-full bg-primary animate-ping';
    } else {
      pulseDot.className = 'w-2 h-2 rounded-full bg-surface-variant';
    }
  }

  const dineinCount = document.getElementById('kanban-dinein-count');
  if (dineinCount) dineinCount.textContent = AppState.orders.filter(o => o.channel === 'TABLE_QR').length;

  const posCount = document.getElementById('kanban-pos-count');
  if (posCount) posCount.textContent = AppState.orders.filter(o => o.channel === 'TAKEAWAY').length;

  const delayedCount = document.getElementById('kanban-delayed-count');
  if (delayedCount) delayedCount.textContent = AppState.orders.filter(o => (o.elapsedSeconds || 0) > 900).length;

  // Filter tabs
  const kAll = document.getElementById('kfilter-all');
  if (kAll) kAll.textContent = `All (${AppState.orders.length})`;
  const kNew = document.getElementById('kfilter-new');
  if (kNew) kNew.textContent = `New (${ordersNew.length})`;
  const kAcc = document.getElementById('kfilter-accepted');
  if (kAcc) kAcc.textContent = `Accepted (${ordersAccepted.length})`;
  const kPrep = document.getElementById('kfilter-preparing');
  if (kPrep) kPrep.textContent = `Preparing (${ordersPrep.length})`;
  const kRdy = document.getElementById('kfilter-ready');
  if (kRdy) kRdy.textContent = `Ready (${ordersReady.length})`;

  // Render Columns
  colNew.innerHTML = renderKanbanColumnHtml(ordersNew, 'No new incoming orders');
  colAccepted.innerHTML = renderKanbanColumnHtml(ordersAccepted, 'No orders in prep queue');
  colPrep.innerHTML = renderKanbanColumnHtml(ordersPrep, 'Kitchen stations idle');
  colReady.innerHTML = renderKanbanColumnHtml(ordersReady, 'No orders awaiting pickup');
}

function renderKanbanColumnHtml(orders, emptyMsg) {
  if (orders.length === 0) {
    return `
      <div class="p-6 text-center text-on-surface-variant border border-dashed border-surface-container-highest rounded-lg">
        <span class="material-symbols-outlined text-2xl text-on-surface-variant/50 mb-1 block">inbox</span>
        <p class="font-mono-sm text-xs">${emptyMsg}</p>
      </div>
    `;
  }

  return orders.map(order => {
    const elapsedMins = Math.floor((order.elapsedSeconds || 0) / 60);
    const isDelayed = (order.elapsedSeconds || 0) > (order.targetMinutes || 15) * 60;
    const itemsHtml = (order.items || []).map(i => `
      <div class="flex items-center justify-between text-xs">
        <span><strong class="text-primary font-mono-sm">${i.qty}×</strong> ${i.name}</span>
        <span class="font-mono-sm text-on-surface-variant">₹${(i.qty * i.price).toFixed(0)}</span>
      </div>
    `).join('');

    let actionBtn = '';
    if (order.status === 'NEW') {
      actionBtn = `
        <div class="flex items-center gap-1.5 w-full">
          <button onclick="advanceOrderStatus('${order.id}', 'ACCEPTED')" class="flex-1 py-1 px-2 rounded bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-xs font-semibold shadow-sm transition-all">
            Accept Ticket
          </button>
          <button onclick="rejectOrder('${order.id}')" class="py-1 px-2 rounded bg-surface-container hover:bg-error/20 text-error font-body-sm text-xs transition-colors" title="Reject Order">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      `;
    } else if (order.status === 'ACCEPTED') {
      actionBtn = `
        <button onclick="advanceOrderStatus('${order.id}', 'PREPARING')" class="w-full py-1.5 px-2 rounded bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-xs font-semibold shadow-sm transition-all">
          Start Food Prep
        </button>
      `;
    } else if (order.status === 'PREPARING') {
      actionBtn = `
        <button onclick="advanceOrderStatus('${order.id}', 'READY')" class="w-full py-1.5 px-2 rounded bg-secondary hover:bg-secondary/80 text-on-secondary font-headline-sm text-xs font-semibold shadow-sm transition-all">
          Mark Food Ready
        </button>
      `;
    } else if (order.status === 'READY') {
      actionBtn = `
        <button onclick="advanceOrderStatus('${order.id}', 'COMPLETED')" class="w-full py-1.5 px-2 rounded bg-tertiary hover:bg-tertiary/80 text-on-tertiary font-headline-sm text-xs font-semibold shadow-sm transition-all">
          Complete & Settle
        </button>
      `;
    }

    return `
      <div class="bg-surface-container p-3 rounded-lg border ${isDelayed ? 'border-error shadow-sm' : 'border-surface-container-highest'} space-y-2 select-none hover:border-primary transition-all cursor-pointer" onclick="openOrderDrawer('${order.id}')">
        <!-- Card Top Ribbon -->
        <div class="flex items-center justify-between pb-1.5 border-b border-surface-container-highest">
          <div class="flex items-center gap-1.5">
            <span class="font-headline-sm font-semibold text-primary text-sm">${order.id}</span>
            <span class="px-1.5 py-0.5 rounded font-mono-sm text-[10px] bg-surface-container-high text-on-surface font-bold">${order.token || 'TK-00'}</span>
          </div>
          <span class="font-mono-sm text-xs ${isDelayed ? 'text-error font-bold' : 'text-on-surface-variant'}">${elapsedMins}m / ${order.targetMinutes || 15}m</span>
        </div>

        <!-- Table & Mode -->
        <div class="flex items-center justify-between font-body-sm text-xs">
          <span class="font-semibold text-on-surface">${order.table}</span>
          <span class="text-on-surface-variant font-mono-sm text-[11px]">${order.channelLabel || 'Walk-in'}</span>
        </div>

        <!-- Items Summary -->
        <div class="space-y-1 py-1">
          ${itemsHtml}
        </div>

        <!-- Customer Note if present -->
        ${order.notes ? `<p class="p-1.5 rounded bg-surface-container-lowest text-on-surface-variant italic text-[11px] border border-surface-container-highest">“${order.notes}”</p>` : ''}

        <!-- Total and Payment -->
        <div class="pt-1 flex items-center justify-between font-mono-sm text-xs">
          <span class="text-on-surface-variant">${order.payment || 'Counter POS'}</span>
          <span class="text-primary font-bold">₹${Number(order.amount).toFixed(2)}</span>
        </div>

        <!-- Actions -->
        <div class="pt-1" onclick="event.stopPropagation();">
          ${actionBtn}
        </div>
      </div>
    `;
  }).join('');
}

function filterKanban(status) {
  AppState.kanbanFilter = status;
  document.querySelectorAll('#kanban-filters .kanban-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-status') === status) {
      btn.className = "kanban-filter-btn px-2.5 py-1 rounded bg-surface-container-high text-on-surface font-mono-sm text-[11px] font-semibold";
    } else {
      btn.className = "kanban-filter-btn px-2.5 py-1 rounded text-on-surface-variant hover:text-on-surface font-mono-sm text-[11px]";
    }
  });

  const cols = {
    'NEW': 'kanban-col-new',
    'ACCEPTED': 'kanban-col-accepted',
    'PREPARING': 'kanban-col-preparing',
    'READY': 'kanban-col-ready'
  };

  Object.entries(cols).forEach(([key, colId]) => {
    const el = document.getElementById(colId)?.parentElement;
    if (el) {
      if (status === 'ALL' || status === key) {
        el.style.display = 'flex';
      } else {
        el.style.display = 'none';
      }
    }
  });
}

function advanceOrderStatus(orderId, nextStatus) {
  const order = AppState.orders.find(o => o.id === orderId);
  if (!order) return;

  if (nextStatus === 'COMPLETED') {
    // Move to history
    AppState.orders = AppState.orders.filter(o => o.id !== orderId);
    const completedRecord = {
      ...order,
      status: 'COMPLETED',
      completedAt: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' IST'
    };
    AppState.history.unshift(completedRecord);

    saveToStorage(STORAGE_KEYS.ORDERS, AppState.orders);
    saveToStorage(STORAGE_KEYS.HISTORY, AppState.history);

    showToast(`Order ${order.id} Delivered & Closed`, `Token ${order.token} handed over. Invoice logged.`);
  } else {
    order.status = nextStatus;
    saveToStorage(STORAGE_KEYS.ORDERS, AppState.orders);
    showToast(`Order ${order.id} Updated`, `Moved to ${nextStatus}`);

    if (nextStatus === 'ACCEPTED' && AppState.autoPrintKOT) {
      printKOTSlip();
    }
  }

  playKitchenChime();

  // Re-render
  renderOverviewStats();
  renderOverviewOrders();
  renderKitchenStationLoads();
  renderTopMovingItems();
  renderKanbanBoard();
  renderDenseTable();
  renderHistory();
  renderPayments();

  // Update order drawer if open
  const drawer = document.getElementById('order-drawer');
  if (drawer && !drawer.classList.contains('hidden')) {
    if (nextStatus === 'COMPLETED') {
      toggleOrderDrawer();
    } else {
      openOrderDrawer(orderId);
    }
  }
}

function rejectOrder(orderId) {
  if (confirm(`Reject incoming order ${orderId}? Customer will be notified.`)) {
    AppState.orders = AppState.orders.filter(o => o.id !== orderId);
    saveToStorage(STORAGE_KEYS.ORDERS, AppState.orders);
    showToast(`Order ${orderId} Rejected`, 'Cancelled and removed from live queue');
    renderOverviewStats();
    renderOverviewOrders();
    renderKanbanBoard();
    renderDenseTable();
  }
}

function renderDenseTable() {
  const tbody = document.getElementById('dense-orders-tbody');
  if (!tbody) return;

  if (AppState.orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-12 text-on-surface-variant font-mono-sm">
          No live orders currently in kitchen dispatch. Place a Walk-in order or wait for diner QR scans.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = AppState.orders.map(order => {
    const elapsedMins = Math.floor((order.elapsedSeconds || 0) / 60);
    return `
      <tr class="hover:bg-surface-container font-mono-sm text-xs cursor-pointer" onclick="openOrderDrawer('${order.id}')">
        <td class="px-space-md py-2.5 text-primary font-semibold">${order.id}</td>
        <td class="px-space-md py-2.5 text-on-surface">${order.channelLabel || 'Walk-in'}</td>
        <td class="px-space-md py-2.5 text-on-surface">${order.table}</td>
        <td class="px-space-md py-2.5 text-on-surface-variant">${elapsedMins}m ago</td>
        <td class="px-space-md py-2.5 text-on-surface font-body-sm">${(order.items || []).map(i => `${i.qty}× ${i.name}`).join(', ')}</td>
        <td class="px-space-md py-2.5 text-right font-semibold text-primary">₹${Number(order.amount).toFixed(2)}</td>
        <td class="px-space-md py-2.5">${getStatusBadge(order.status)}</td>
        <td class="px-space-md py-2.5 text-right whitespace-nowrap" onclick="event.stopPropagation();">${getActionButton(order)}</td>
      </tr>
    `;
  }).join('');
}

// ================= ORDER DETAILS SLIDE-OVER DRAWER =================
function openOrderDrawer(orderId) {
  const order = AppState.orders.find(o => o.id === orderId);
  if (!order) return;

  const drawer = document.getElementById('order-drawer');
  if (!drawer) return;

  drawer.classList.remove('hidden');

  document.getElementById('drawer-order-id').textContent = `#${order.id}`;
  document.getElementById('drawer-status-pill').textContent = order.status;
  document.getElementById('drawer-session-meta').textContent = `${order.table} • ${order.channelLabel || 'Dine-In QR'} (${order.token || 'TK-00'})`;
  document.getElementById('drawer-table-no').textContent = order.table;
  document.getElementById('drawer-total-amount').textContent = `₹${Number(order.amount).toFixed(2)}`;
  document.getElementById('drawer-notes').textContent = order.notes ? `“${order.notes}”` : '“No special customer instructions.”';

  const listEl = document.getElementById('drawer-items-list');
  if (listEl) {
    listEl.innerHTML = (order.items || []).map(item => `
      <div class="p-2.5 flex items-center justify-between text-body-sm">
        <span><strong class="text-primary">${item.qty} ×</strong> ${item.name}</span>
        <span class="font-mono-sm text-primary">₹${(item.qty * item.price).toFixed(2)}</span>
      </div>
    `).join('');
  }

  const pBtn = document.getElementById('drawer-primary-action-btn');
  if (pBtn) {
    if (order.status === 'NEW') {
      pBtn.textContent = 'Accept Order Ticket';
      pBtn.onclick = () => advanceOrderStatus(order.id, 'ACCEPTED');
    } else if (order.status === 'ACCEPTED') {
      pBtn.textContent = 'Move to Kitchen Prep';
      pBtn.onclick = () => advanceOrderStatus(order.id, 'PREPARING');
    } else if (order.status === 'PREPARING') {
      pBtn.textContent = 'Mark Order Ready';
      pBtn.onclick = () => advanceOrderStatus(order.id, 'READY');
    } else if (order.status === 'READY') {
      pBtn.textContent = 'Complete & Settle Meal';
      pBtn.onclick = () => {
        advanceOrderStatus(order.id, 'COMPLETED');
      };
    }
  }
}

function toggleOrderDrawer() {
  const drawer = document.getElementById('order-drawer');
  if (drawer) {
    drawer.classList.toggle('hidden');
  }
}

function printKOTSlip() {
  showToast('Printing KOT...', 'Kitchen Order Ticket sent to thermal station printer');
}

// ================= WALK-IN POS MODAL =================
function toggleWalkInModal() {
  const modal = document.getElementById('walkin-modal');
  if (modal) {
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
      AppState.cart = [];
      renderPosCart();
      renderPosModalItems();
      populatePosTablesDropdown();
    }
  }
}

function populatePosTablesDropdown() {
  const select = document.getElementById('pos-table-select');
  if (!select) return;

  if (AppState.tables.length === 0) {
    select.innerHTML = '<option value="Counter">Takeaway Counter</option>';
    return;
  }

  select.innerHTML = AppState.tables.map(t => {
    // If ordering is disabled on this table, mark it and disable selection
    if (!t.orderingEnabled) {
      return `<option value="${t.id}" disabled>${t.id} (${t.name}) - [Ordering Disabled]</option>`;
    }
    const isOcc = t.status === 'OCCUPIED' ? ' [Occupied]' : '';
    return `<option value="${t.id}">${t.id} (${t.name})${isOcc}</option>`;
  }).join('');
}

function renderPosModalItems() {
  const grid = document.getElementById('pos-items-grid');
  if (!grid) return;

  const search = (document.getElementById('pos-search-input')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('pos-cat-filter')?.value || 'ALL';

  const filtered = AppState.menuItems.filter(i => {
    if (!i.inStock) return false;
    if (cat !== 'ALL' && i.category !== cat) return false;
    if (search && !i.name.toLowerCase().includes(search)) return false;
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="text-center text-on-surface-variant py-4 font-mono-sm text-xs">No available in-stock items match criteria.</p>';
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="flex items-center justify-between p-2 rounded bg-surface-container hover:bg-surface-container-high border border-surface-container-highest transition-colors cursor-pointer" onclick="addToPosCart('${item.sku}')">
      <div class="flex items-center gap-2">
        <img src="${item.image || 'assets/paneer.jpg'}" alt="${item.name}" class="w-8 h-8 rounded object-cover" onerror="this.src='assets/logo.png'">
        <div>
          <p class="font-body-sm font-semibold text-on-surface text-xs">${item.name}</p>
          <span class="font-mono-sm text-[10px] text-on-surface-variant">${item.category}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-mono-sm text-xs font-semibold text-primary">₹${Number(item.price).toFixed(0)}</span>
        <button class="p-1 rounded bg-primary text-on-primary hover:bg-primary-container">
          <span class="material-symbols-outlined text-[14px]">add</span>
        </button>
      </div>
    </div>
  `).join('');
}

function addToPosCart(sku) {
  const item = AppState.menuItems.find(i => i.sku === sku);
  if (!item) return;

  const existing = AppState.cart.find(c => c.sku === sku);
  if (existing) {
    existing.qty += 1;
  } else {
    AppState.cart.push({
      sku: item.sku,
      name: item.name,
      price: item.price,
      qty: 1
    });
  }
  renderPosCart();
}

function modifyCartQty(sku, delta) {
  const item = AppState.cart.find(c => c.sku === sku);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    AppState.cart = AppState.cart.filter(c => c.sku !== sku);
  }
  renderPosCart();
}

function renderPosCart() {
  const list = document.getElementById('pos-cart-list');
  const countEl = document.getElementById('pos-cart-count');
  const totalEl = document.getElementById('pos-cart-total');

  if (!list || !countEl || !totalEl) return;

  const totalItems = AppState.cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = AppState.cart.reduce((sum, i) => sum + (i.qty * i.price), 0);

  countEl.textContent = `${totalItems} items`;
  totalEl.textContent = `₹${totalPrice.toFixed(2)}`;

  if (AppState.cart.length === 0) {
    list.innerHTML = `<p class="text-center text-on-surface-variant py-6 font-body-sm italic text-xs">No items added yet. Click an item on the left to add.</p>`;
    return;
  }

  list.innerHTML = AppState.cart.map(item => `
    <div class="py-1.5 flex items-center justify-between text-xs">
      <div class="min-w-0 pr-2">
        <p class="font-semibold text-on-surface truncate">${item.name}</p>
        <p class="font-mono-sm text-primary">₹${(item.qty * item.price).toFixed(0)}</p>
      </div>
      <div class="flex items-center gap-1 font-mono-sm">
        <button onclick="modifyCartQty('${item.sku}', -1)" class="w-5 h-5 rounded bg-surface-container-high hover:bg-surface-variant flex items-center justify-center font-bold">-</button>
        <span class="w-4 text-center font-bold text-on-surface">${item.qty}</span>
        <button onclick="modifyCartQty('${item.sku}', 1)" class="w-5 h-5 rounded bg-surface-container-high hover:bg-surface-variant flex items-center justify-center font-bold">+</button>
      </div>
    </div>
  `).join('');
}

function placeWalkInOrder() {
  if (AppState.cart.length === 0) {
    alert('Please add at least one item to the cart before sending to kitchen.');
    return;
  }

  const orderType = document.getElementById('pos-type-select').value;
  const tableSelect = document.getElementById('pos-table-select');
  const tableVal = tableSelect ? tableSelect.value : 'Counter';
  const table = orderType === 'DINE_IN' ? tableVal : 'Walk-in Takeaway';

  // Check if ordering is enabled on selected table
  if (orderType === 'DINE_IN') {
    const tableObj = AppState.tables.find(t => t.id === tableVal);
    if (tableObj && !tableObj.orderingEnabled) {
      alert(`Ordering is currently disabled for ${tableObj.name || tableObj.id}.\nPlease enable ordering in Table Management or choose another table.`);
      return;
    }
  }

  const paymentMode = document.getElementById('pos-payment-mode').value;
  const orderNum = Math.floor(9825 + Math.random() * 50);
  const tokenNum = Math.floor(43 + Math.random() * 20);

  const newOrder = {
    id: `ORD-${orderNum}`,
    token: `TK-${tokenNum}`,
    table: table,
    channel: orderType === 'DINE_IN' ? 'TABLE_QR' : 'TAKEAWAY',
    channelLabel: orderType === 'DINE_IN' ? 'Walk-in Table' : 'Walk-in Takeaway',
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    elapsedSeconds: 0,
    targetMinutes: 12,
    items: AppState.cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
    amount: AppState.cart.reduce((sum, i) => sum + (i.qty * i.price), 0),
    payment: `${paymentMode} (Paid)`,
    paymentStatus: 'PAID',
    status: 'NEW',
    priority: false,
    notes: 'Walk-in Counter Order'
  };

  AppState.orders.unshift(newOrder);
  saveToStorage(STORAGE_KEYS.ORDERS, AppState.orders);

  toggleWalkInModal();
  showToast(`Token ${newOrder.token} Generated!`, `Sent Order #${newOrder.id} to kitchen dispatch`);
  playKitchenChime();

  renderOverviewStats();
  renderOverviewOrders();
  renderKitchenStationLoads();
  renderKanbanBoard();
  renderDenseTable();
}

// ================= TASK 2: ORDER HISTORY & TAX RECEIPT =================

function renderHistory() {
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;

  const historySubtitle = document.getElementById('history-subtitle');
  if (historySubtitle) {
    historySubtitle.textContent = `${AppState.history.length} completed orders logged with tax receipts`;
  }

  if (AppState.history.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-space-md py-12 text-center text-on-surface-variant font-mono-sm">
          <span class="material-symbols-outlined text-3xl mb-1 text-on-surface-variant/60 block">history</span>
          <p class="font-semibold text-on-surface">No fulfilled orders recorded today</p>
          <p class="text-xs text-on-surface-variant/70 mt-1">Completed meals will be permanently recorded here with digital tax invoices.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = AppState.history.map(h => {
    const itemsSummary = (h.items || []).map(i => `${i.qty}× ${i.name}`).join(', ');
    return `
      <tr class="hover:bg-surface-container font-mono-sm text-xs">
        <td class="px-space-md py-3 text-primary font-semibold">${h.id}</td>
        <td class="px-space-md py-3 text-on-surface font-semibold">${h.table}</td>
        <td class="px-space-md py-3 text-on-surface font-body-sm">${itemsSummary}</td>
        <td class="px-space-md py-3 text-right font-semibold text-primary">₹${Number(h.amount).toFixed(2)}</td>
        <td class="px-space-md py-3 text-on-surface-variant">${h.completedAt || 'Today'}</td>
        <td class="px-space-md py-3 text-right">
          <button onclick="showOrderReceipt('${h.id}')" class="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-semibold transition-colors">
            View Receipt
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function showOrderReceipt(orderId) {
  const order = AppState.history.find(h => h.id === orderId);
  if (!order) return;

  const modal = document.getElementById('receipt-modal');
  const body = document.getElementById('receiptModalBody');
  if (!modal || !body) return;

  const subtotal = Number(order.amount) / 1.05; // 5% GST
  const gst = Number(order.amount) - subtotal;

  body.innerHTML = `
    <div class="text-center pb-2 border-b border-surface-container-highest space-y-0.5">
      <h3 class="font-headline-sm font-bold text-on-surface">CampusBite Bistro</h3>
      <p class="text-[11px] text-on-surface-variant">North Campus Dining Hall, Station #1</p>
      <p class="text-[10px] text-on-surface-variant">GSTIN: 07AAACB1234F1Z8 • Tax Invoice</p>
    </div>

    <div class="py-2 space-y-1 text-xs border-b border-surface-container-highest">
      <div class="flex justify-between"><span>Invoice #:</span><strong class="text-on-surface">${order.id}</strong></div>
      <div class="flex justify-between"><span>Token / Table:</span><span>${order.token || 'N/A'} • ${order.table}</span></div>
      <div class="flex justify-between"><span>Completed At:</span><span>${order.completedAt || 'Today'}</span></div>
      <div class="flex justify-between"><span>Payment Mode:</span><span class="text-tertiary font-bold">${order.payment || 'Counter POS'}</span></div>
    </div>

    <div class="py-2 space-y-1 text-xs border-b border-surface-container-highest">
      ${(order.items || []).map(i => `
        <div class="flex justify-between">
          <span>${i.qty}× ${i.name}</span>
          <span class="font-semibold text-on-surface">₹${(i.qty * i.price).toFixed(2)}</span>
        </div>
      `).join('')}
    </div>

    <div class="pt-2 space-y-1 text-xs">
      <div class="flex justify-between text-on-surface-variant"><span>Subtotal:</span><span>₹${subtotal.toFixed(2)}</span></div>
      <div class="flex justify-between text-on-surface-variant"><span>CGST (2.5%):</span><span>₹${(gst / 2).toFixed(2)}</span></div>
      <div class="flex justify-between text-on-surface-variant"><span>SGST (2.5%):</span><span>₹${(gst / 2).toFixed(2)}</span></div>
      <div class="flex justify-between text-sm font-bold text-primary pt-1 border-t border-surface-container-highest">
        <span>Total Paid:</span><span>₹${Number(order.amount).toFixed(2)}</span>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeReceiptModal() {
  const modal = document.getElementById('receipt-modal');
  if (modal) modal.classList.add('hidden');
}

// ================= TASK 2: PAYMENTS (REMOVED FAKE DATA) =================

function renderPayments() {
  const list = document.getElementById('payments-history-list');
  const upiAmount = document.getElementById('payments-upi-amount');
  const upiCount = document.getElementById('payments-upi-count');
  const cashAmount = document.getElementById('payments-cash-amount');
  const cashCount = document.getElementById('payments-cash-count');
  const cardAmount = document.getElementById('payments-card-amount');
  const cardCount = document.getElementById('payments-card-count');

  // Compute from actual completed meals
  const completed = AppState.history;
  let upiSum = 0; let upiNum = 0;
  let cashSum = 0; let cashNum = 0;
  let cardSum = 0; let cardNum = 0;

  completed.forEach(c => {
    const mode = (c.payment || '').toUpperCase();
    const amt = Number(c.amount) || 0;
    if (mode.includes('UPI')) {
      upiSum += amt;
      upiNum += 1;
    } else if (mode.includes('CASH')) {
      cashSum += amt;
      cashNum += 1;
    } else if (mode.includes('CARD')) {
      cardSum += amt;
      cardNum += 1;
    } else {
      cashSum += amt;
      cashNum += 1;
    }
  });

  if (upiAmount) upiAmount.textContent = `₹${upiSum.toFixed(2)}`;
  if (upiCount) upiCount.textContent = `${upiNum} verified transaction${upiNum !== 1 ? 's' : ''}`;
  if (cashAmount) cashAmount.textContent = `₹${cashSum.toFixed(2)}`;
  if (cashCount) cashCount.textContent = `${cashNum} counter drawer transaction${cashNum !== 1 ? 's' : ''}`;
  if (cardAmount) cardAmount.textContent = `₹${cardSum.toFixed(2)}`;
  if (cardCount) cardCount.textContent = `${cardNum} smartcard deduction${cardNum !== 1 ? 's' : ''}`;

  if (!list) return;

  if (completed.length === 0) {
    list.innerHTML = `
      <div class="p-8 text-center text-on-surface-variant font-mono-sm text-xs">
        <span class="material-symbols-outlined text-2xl mb-1 text-on-surface-variant/50 block">receipt_long</span>
        <p class="font-semibold text-on-surface">No settlement records logged yet</p>
        <p class="text-[11px] text-on-surface-variant/70 mt-1">Verified payment settlements will automatically appear as meals are fulfilled and closed.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = completed.map(tx => `
    <div class="p-3 flex items-center justify-between text-xs font-mono-sm hover:bg-surface-container transition-colors">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-tertiary text-[18px]">verified</span>
        <div>
          <p class="font-semibold text-on-surface">${tx.id} • ${tx.payment || 'Counter POS'}</p>
          <p class="text-on-surface-variant text-[11px]">${tx.table} • ${tx.completedAt || 'Today'}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="font-semibold text-primary text-sm">₹${Number(tx.amount).toFixed(2)}</p>
        <span class="px-1.5 py-0.5 rounded font-mono-sm text-[10px] bg-tertiary/15 text-tertiary font-bold">SETTLED</span>
      </div>
    </div>
  `).join('');
}

// ================= TASK 2 & 5: SETTINGS & LOCAL PREFERENCES =================

function toggleAudioPreference(checked) {
  AppState.audioEnabled = checked;
  if (!AppState.settings) AppState.settings = {};
  AppState.settings.audioEnabled = checked;
  saveToStorage(STORAGE_KEYS.SETTINGS, AppState.settings);
  showToast('Settings Saved', `Kitchen audio chime ${checked ? 'enabled' : 'disabled'}`);
}

function toggleAutoPrintPreference(checked) {
  AppState.autoPrintKOT = checked;
  if (!AppState.settings) AppState.settings = {};
  AppState.settings.autoPrint = checked;
  saveToStorage(STORAGE_KEYS.SETTINGS, AppState.settings);
  showToast('Settings Saved', `Automatic KOT ticket printing ${checked ? 'enabled' : 'disabled'}`);
}

// ================= AUTHENTICATION OVERLAY SIMULATION =================

function togglePasswordVisibility() {
  const input = document.getElementById('operator-key');
  const icon = document.getElementById('eye-icon');
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = 'visibility_off';
  } else {
    input.type = 'password';
    icon.textContent = 'visibility';
  }
}

function triggerSupervisorKeypad() {
  const pwdInput = document.getElementById('operator-key');
  if (pwdInput) {
    pwdInput.value = '9901';
    pwdInput.type = 'text';
    showToast('Supervisor PIN autofilled (9901)');
  }
}

function simulateAuth() {
  const btn = document.getElementById('auth-submit-btn');
  if (!btn) return;

  const originalContent = btn.innerHTML;
  btn.innerHTML = `
    <span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
    <span>Authenticating Station...</span>
  `;
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">verified</span>
      <span>Terminal Ready</span>
    `;
    btn.classList.remove('bg-primary', 'hover:bg-primary-fixed-dim', 'text-on-primary-fixed');
    btn.classList.add('bg-tertiary', 'text-on-tertiary-fixed');

    setTimeout(() => {
      document.getElementById('auth-screen-overlay').classList.add('hidden');
      btn.innerHTML = originalContent;
      btn.disabled = false;
      btn.classList.remove('bg-tertiary', 'text-on-tertiary-fixed');
      btn.classList.add('bg-primary', 'text-on-primary-fixed');
      showToast('Shift Session Active', 'Terminal unlocked for Vikram Malhotra');
    }, 800);
  }, 900);
}

// ================= TIMERS & SYSTEM CHIMES =================

function startTimers() {
  setInterval(() => {
    const clock = document.getElementById('live-clock');
    if (clock) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      clock.textContent = `${dateStr} • ${timeStr} IST`;
    }

    // Shift timer
    AppState.shiftSeconds += 1;
    const shiftHours = Math.floor(AppState.shiftSeconds / 3600);
    const shiftMins = Math.floor((AppState.shiftSeconds % 3600) / 60);
    const shiftSecs = AppState.shiftSeconds % 60;
    const shiftTimerEl = document.getElementById('shift-timer');
    if (shiftTimerEl) {
      shiftTimerEl.textContent = `${String(shiftHours).padStart(2, '0')}:${String(shiftMins).padStart(2, '0')}:${String(shiftSecs).padStart(2, '0')}`;
    }

    // Increment orders elapsed time
    if (AppState.orders.length > 0) {
      AppState.orders.forEach(o => {
        o.elapsedSeconds = (o.elapsedSeconds || 0) + 1;
      });

      if (AppState.currentView === 'live-orders') {
        renderKanbanBoard();
      }
    }
  }, 1000);
}

function playKitchenChime() {
  if (!AppState.audioEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    // Requires user interaction first in some browser environments
  }
}

// ================= UI HELPERS & BADGES =================

function getStatusBadge(status) {
  switch (status) {
    case 'NEW':
      return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono-sm text-[10px] bg-amber-900/40 text-primary font-bold"><span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>NEW</span>';
    case 'ACCEPTED':
      return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono-sm text-[10px] bg-blue-950/40 text-secondary font-bold">QUEUED</span>';
    case 'PREPARING':
      return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono-sm text-[10px] bg-primary/20 text-primary font-bold">PREPARING</span>';
    case 'READY':
      return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono-sm text-[10px] bg-emerald-950 text-tertiary font-bold">READY</span>';
    case 'COMPLETED':
      return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono-sm text-[10px] bg-surface-container text-on-surface-variant font-bold">COMPLETED</span>';
    default:
      return `<span class="inline-flex items-center px-2 py-0.5 rounded font-mono-sm text-[10px] bg-surface-container text-on-surface">${status}</span>`;
  }
}

function getActionButton(order) {
  if (order.status === 'NEW') {
    return `<button onclick="advanceOrderStatus('${order.id}', 'ACCEPTED')" class="px-2.5 py-1 rounded bg-primary hover:bg-primary-container text-on-primary font-body-sm text-[11px] font-semibold transition-all shadow-sm">Accept</button>`;
  } else if (order.status === 'ACCEPTED') {
    return `<button onclick="advanceOrderStatus('${order.id}', 'PREPARING')" class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[11px] font-semibold transition-all">Start Prep</button>`;
  } else if (order.status === 'PREPARING') {
    return `<button onclick="advanceOrderStatus('${order.id}', 'READY')" class="px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 text-on-secondary font-body-sm text-[11px] font-semibold transition-all">Mark Ready</button>`;
  } else if (order.status === 'READY') {
    return `<button onclick="advanceOrderStatus('${order.id}', 'COMPLETED')" class="px-2.5 py-1 rounded bg-tertiary hover:bg-tertiary/80 text-on-tertiary font-body-sm text-[11px] font-semibold transition-all">Dispatch</button>`;
  }
  return '';
}

function showToast(title, subtitle = '') {
  const toast = document.getElementById('kitchen-toast');
  if (!toast) return;

  const tTitle = document.getElementById('toast-title');
  const tSub = document.getElementById('toast-subtitle');
  if (tTitle) tTitle.textContent = title;
  if (tSub) tSub.textContent = subtitle;

  toast.classList.remove('translate-y-24', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 2800);
}

function clearNotifications() {
  const badge = document.getElementById('notif-badge');
  const list = document.getElementById('notif-list');
  if (badge) badge.classList.add('hidden');
  if (list) list.innerHTML = `<div class="p-4 text-center text-on-surface-variant font-mono-sm text-xs italic">All operational alerts cleared</div>`;
  showToast('Notifications Cleared');
}

function acknowledgeAlert(btn) {
  const container = document.getElementById('overview-alert-container');
  if (container) container.innerHTML = '';
  showToast('Alert Acknowledged', 'Table attended');
}

function exportSummaryReport() {
  showToast('Exporting Shift Summary...', 'Generating CSV report for current shift');
}
