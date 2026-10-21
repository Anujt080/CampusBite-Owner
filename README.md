# CampusBite Owner Dashboard

> Restaurant Operations, Kitchen Display System (KDS) & Floor Management System designed in **Google Stitch** (Project ID: `4409743892268089547`).

## 🎨 Google Stitch Design Alignment

This frontend faithfully implements the layout hierarchy, typography, colors, spacing tokens, and component specifications from the official Google Stitch project:

- **Typography**: Google Sans / Geist, Inter, and JetBrains Mono.
- **Icons**: Google Material Symbols Outlined.
- **Themes**: Full bidirectional support for **Dark Mode** and **Light Mode** preserving Stitch's tailored color tokens.
- **Visual Assets**: Includes high-resolution meal photography and brand assets downloaded directly from the Stitch canvas.

---

## 🚀 Key Features & Screen Implementations

### 1. Dashboard Overview
- **Real-Time Operational Metrics**: Live counts for New Orders, Active Kitchen Orders, Completed Orders, and Today's Verified Revenue.
- **Dynamic Kitchen Station Loads**: Real-time station capacity monitoring with idle/active states.
- **Sales Trends**: Dynamic top-selling items calculated from verified completed meals.
- **Live Floor & Orders Table**: Filterable by channel (*All*, *Table QR*, *Takeaway*), dietary preference, and urgency with quick lifecycle actions (*Accept*, *Start Prep*, *Mark Ready*, *Dispatch*).

### 2. Live Kitchen Display System (KDS & Dispatch)
- **4-Stage Kanban Workflow**:
  1. **New Orders**: Incoming tickets with pulsating timers, customer instructions, and Accept / Reject actions.
  2. **Accepted / Queued**: Waiting queue with "Start Cooking" transition.
  3. **Preparing**: Progress tracking with estimated turnaround and station routing.
  4. **Ready for Dispatch**: Handover pickup counter queue.
- **View Switcher**: Seamless toggle between *Kitchen Board* (Kanban) and *Dense Table* mode.
- **Slide-Over Ticket Drawer**: Inspection of ticket items, special instructions, and thermal KOT slip printing.
- **Audio Chime System**: Web Audio API synthesized kitchen bell alert on incoming tickets (with mute toggle).

### 3. Menu & Catalogue Management
- **In-Place Item Editing**: Edit existing items directly; updates in-place without duplicating records while retaining existing SKU and media.
- **Form Validation**: Strict validation preventing empty names, invalid categories, and negative prices.
- **Availability Toggles**: One-click toggling between `In Stock` and `Out of Stock` with instant status reflection.
- **Quick Item Creation**: Add new items with customizable name, category, price, dietary classification (Veg, Non-Veg, Egg), and description.
- **Catalogue Filtering & Search**: Instant real-time search, category pill filtering, dietary filters, and pagination.

### 4. Dining Tables & QR Code Stencils
- **Local Table Management**: Add new tables, customize seating capacity, and edit table details.
- **Independent Controls**: Table occupancy (*Occupied* vs *Vacant*) and customer ordering availability (*Enabled* vs *Disabled*) are strictly independent.
- **Safe Deletion**: Table deletion is guarded to prevent removing tables with active in-flight kitchen orders.
- **QR Code Inspection**: Vector QR code modal with preview and token details (prepared for backend cryptographic signature integration).

### 5. Walk-In Order POS Modal
- Quick cashier terminal (`+ New Walk-in`) to assemble in-person orders, select available tables (with ordering-disabled tables blocked), apply payment methods, and dispatch tokens directly into the live kitchen queue.

### 6. Order History & Digital Receipts
- Filterable archive of fulfilled orders with expandable GST digital receipt breakdown.

### 7. Payment Reconciliation & Audit Log
- Settlement metrics tracking *UPI Instant QR*, *Counter Cash POS*, and *Campus Smartcards*.
- Real-time audit log generated as meals are fulfilled and settled.

### 8. Persistence & State Management
- Browser-local persistence using `localStorage` for menu catalogue, table configurations, themes, and settings.

---

## 💻 Running Locally

Start a local static web server in this directory:

```bash
# Python
python -m http.server 8080

# Or with Node.js
npx serve .
```

Open `http://localhost:8080` in your web browser.
