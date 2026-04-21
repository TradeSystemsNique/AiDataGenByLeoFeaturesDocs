
//+------------------------------------------------------------------+
//| Configuracion                                                    |
//+------------------------------------------------------------------+
// Solo el core sin lenguajes
import hljs from 'https://esm.sh/highlight.js/lib/core';
import fgblc_language from './Fgblc/fgblc_language.js';

//+------------------------------------------------------------------+
//| Configuracion                                                    |
//+------------------------------------------------------------------+
const FEATURES_PER_PAGE = 20;
// Color por tipo de categoria (se asigna dinamicamente segun orden de aparicion)
const TYPE_COLOR_POOL = [
    "#00d084", // verde accent
    "#0090ff", // azul
    "#ff6b35", // naranja
    "#a855f7", // purpura
    "#f59e0b", // amarillo
    "#ec4899", // rosa
    "#06b6d4", // cyan
    "#84cc16", // lima
];


//+------------------------------------------------------------------+
//| Estado global                                                    |
//+------------------------------------------------------------------+
let all_features = [];   // todas las features cargadas del JSON
let type_colors = {};   // mapa tipo -> color
let current_cat = "all";
let current_search  = "";
let current_page = 1;
let all_examples = []; // array string con todos los ejemplos

//+------------------------------------------------------------------+
//| Carga del JSON                                                   |
//+------------------------------------------------------------------+
async function load_features()
{
    try
    {
        // Cargar los dos JSON en paralelo con Promise.all
        const [features_res, examples_res] = await Promise.all([
            fetch("features.json"),
            fetch("Examples/main.json")
        ]);

        if (!features_res.ok)
            throw new Error("Failed to load features.json — status: " + features_res.status);

        if (!examples_res.ok)
            throw new Error("Could not load examples/main.json — status: " + examples_res.status);

        // Obtenemos los datos
        const features_data = await features_res.json();
        const examples_data = await examples_res.json();

        // Llenar los dos arrays
        all_features = features_data.features || [];
        all_examples = examples_data.examples || [];

        // Construir todo
        build_type_colors();
        build_sidebar();     
        render_page();
    }
    catch (err)
    {
        console.error(err);
        document.getElementById("featuresGrid").innerHTML =
            `<p style="color:var(--accent3);font-family:var(--mono);font-size:13px;">
                Error loading data: ${err.message}
             </p>`;
    }
}

/*
//+------------------------------------------------------------------+
//| Colores dinamicos por tipo                                       |
//+------------------------------------------------------------------+
*/

function build_type_colors()
{
    let color_index = 0;

    all_features.forEach(f =>
    {
        if (!type_colors[f.type])
        {
            type_colors[f.type] = TYPE_COLOR_POOL[color_index % TYPE_COLOR_POOL.length];
            color_index++;
        }
    });
}

function get_color(type_name)
{
    return type_colors[type_name] || "#275fc0";
}

/*
//+------------------------------------------------------------------+
//| Sidebar dinamico                                                 |
//+------------------------------------------------------------------+
*/

function build_sidebar()
{
    build_categories();  // usa all_features (primero catergoias parate incial)
    build_examples();    // usa all_examples
}


// Parte de exampels
function build_examples()
{
    const container = document.getElementById("sidebar_examples");
    container.innerHTML = "";

    all_examples.forEach(ex =>
    {
        const btn = document.createElement("button");
        btn.className = "filter-btn";
        btn.dataset.id = ex.id;

        btn.innerHTML = `
            <span class="dot" style="background:var(--muted)"></span>
            ${ex.id}
        `;

        btn.addEventListener("click", () => on_example_click(ex, btn));
        container.appendChild(btn);
    });
}
// Parte de categorias
function build_categories()
{
    const container = document.getElementById("sidebar_categories");
    container.innerHTML = "";

    // Boton "Todas"
    const total = all_features.length;
    container.innerHTML += make_sidebar_btn("all", "all", "#5a6478", total, current_cat === "all");

    // Un boton por cada tipo unico encontrado en el JSON
    const types = [...new Set(all_features.map(f => f.type))];

    types.forEach(type =>
    {
        const count = all_features.filter(f => f.type === type).length;
        const color = get_color(type);
        container.innerHTML += make_sidebar_btn(type, type, color, count, current_cat === type);
    });

    // Vincular eventos despues de insertar el HTML
    container.querySelectorAll(".filter-btn").forEach(btn =>
    {
        btn.addEventListener("click", () => on_filter_cat(btn));
    });
}

// Boton del sidebar para categorias
function make_sidebar_btn(cat, label, color, count, is_active)
{
    const active_class = is_active ? " active" : "";
    return `
        <button class="filter-btn${active_class}" data-cat="${cat}">
            <span class="dot" style="background:${color}"></span>
            ${label}
            <span class="cat-count">${count}</span>
        </button>
    `;
}

/*
//+------------------------------------------------------------------+
//| Filtros                                                          |
//+------------------------------------------------------------------+
*/

function on_filter_cat(btn)
{   

    show_features_view()

    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    current_cat = btn.dataset.cat;
    current_page = 1;
    render_page();
}

function on_search(value)
{
    current_search = value.trim().toLowerCase();
    current_page = 1;
    render_page();
}

/*
//+------------------------------------------------------------------+
//| Filtrado                                                         |
//+------------------------------------------------------------------+
*/

function get_filtered()
{
    return all_features.filter(f =>
    {
        const match_cat = current_cat === "all" || f.type === current_cat;
        const match_search = !current_search
            || f.name.toLowerCase().includes(current_search)
            || f.desc.toLowerCase().includes(current_search)
            || f.type.toLowerCase().includes(current_search);

        return match_cat && match_search;
    });
}

/*
//+------------------------------------------------------------------+
//| Render principal                                                 |
//+------------------------------------------------------------------+
*/

function render_page()
{
    const filtered = get_filtered();
    const total_pages  = Math.max(1, Math.ceil(filtered.length / FEATURES_PER_PAGE));
    const page  = Math.min(current_page, total_pages);
    const start = (page - 1) * FEATURES_PER_PAGE;
    const page_items = filtered.slice(start, start + FEATURES_PER_PAGE);

    // Contador topbar
    document.getElementById("visibleCount").textContent = filtered.length;

    // Grid
    const grid = document.getElementById("featuresGrid");
    grid.innerHTML = "";
    page_items.forEach((f, idx) => grid.appendChild(make_card(f, start + idx)));

    // Estado vacio
    const empty = document.getElementById("emptyState");
    empty.classList.toggle("show", filtered.length === 0);

    // Paginacion
    render_pagination(page, total_pages);
}


//+------------------------------------------------------------------+
//| Card                                                             |
//+------------------------------------------------------------------+

function make_card(f, global_idx)
{
    const color = get_color(f.type);
    const num_str = "#" + String(global_idx + 1).padStart(3, "0");
    const param_count = f.params.length;

    const card = document.createElement("div");
    card.className = "feature-card";
    card.style.setProperty("--cat-color", color);

    card.innerHTML = `
        <div class="card_top">
            <div class="card_icon">${f.name.charAt(0)}</div>
            <div class="card_meta">
                <div class="card_name">${f.name}</div>
                <div class="card_sub">${num_str} &middot; ${param_count} param${param_count !== 1 ? "s" : ""}</div>
            </div>
            <div class="card_badges">
                <span class="badge badge_type" style="color:${color};border-color:${color};background:${color}18">
                    ${f.type}
                </span>
            </div>
        </div>
        <div class="card_desc">${f.desc}</div>
        <button class="card_expand_btn">
            <span class="arrow">&#9654;</span> ver parametros y ejemplo
        </button>
        <div class="card_detail">
            <div class="detail_section">
                <div class="detail_label">Parametros (${param_count})</div>
                <div class="params_list">${make_params_html(f.params)}</div>
            </div>
            <div class="detail_section">
                <div class="detail_label">Ejemplo DSL</div>
                <div class="dsl_block">${make_dsl_html(f)}</div>
            </div>
        </div>
    `;

    card.querySelector(".card_expand_btn").addEventListener("click", () =>
    {
        card.classList.toggle("expanded");
    });

    return card;
}

function make_params_html(params)
{
    if (!params.length)
        return `<span class="no_params">— sin parametros —</span>`;

    return params.map(p => `
        <div class="param_row">
            <span class="param_name">${p.name}</span>
            <span class="param_type">${p.type}</span>
        </div>
    `).join("");
}

function make_dsl_html(f)
{
    const raw = f.example || "";

    if (!raw)
        return `<span class="no_params">— sin ejemplo —</span>`;

    // Separar el string en: [Nombre] + [][] + (params)
    const match = raw.match(/^\[([^\]]*)\](\[[^\]]*\])\(([^)]*)\)$/);

    if (!match)
        return `<span class="dsl_sep">${raw}</span>`; // fallback: mostrar raw sin colorear

    const name = match[1]; // "Rsi_Valor"
    const second = match[2]; // "[]"
    const params = match[3]; // "Period=14|Applied=0"

    // Colorear params  Param=valor|Param2=valor2...
    const params_html = params
        ? params.replace(/([A-Za-z_]+)=([^|]+)/g,
            (_, key, val) =>
                `<span class="dsl_key">${key}</span>` +
                `<span class="dsl_sep">=</span>` +
                `<span class="dsl_val">${val}</span>`)
            .replace(/\|/g, `<span class="dsl_sep"> | </span>`)
        : "";

    return `[<span class="dsl_name">${name}</span>]${second}(${params_html})`;
}

//+------------------------------------------------------------------+
//| Paginacion                                                       |
//+------------------------------------------------------------------+

function render_pagination(page, total_pages)
{
    const container = document.getElementById("pagination");
    container.innerHTML = "";

    if (total_pages <= 1)
        return;

    // Anterior
    container.appendChild(make_page_btn("← Previous", page > 1, () => go_to_page(page - 1)));

    // Numeros de pagina con ellipsis
    const page_numbers = get_page_numbers(page, total_pages);
    page_numbers.forEach(n =>
    {
        if (n === "...")
        {
            const dots = document.createElement("span");
            dots.className = "page_dots";
            dots.textContent = "...";
            container.appendChild(dots);
        }
        else
        {
            container.appendChild(make_page_btn(n, true, () => go_to_page(n), n === page));
        }
    });

    // Siguiente
    container.appendChild(make_page_btn("Next →", page < total_pages, () => go_to_page(page + 1)));
}

function make_page_btn(label, enabled, on_click, is_active = false)
{
    const btn = document.createElement("button");
    btn.className = "page_btn" + (is_active ? " active" : "");
    btn.textContent = label;
    btn.disabled = !enabled;
    if (enabled) btn.addEventListener("click", on_click);
    return btn;
}

function get_page_numbers(page, total)
{
    // Muestra siempre primera, ultima y ventana de 2 alrededor de la pagina actual
    const pages = new Set();
    pages.add(1);
    pages.add(total);
    for (let i = Math.max(1, page - 2); i <= Math.min(total, page + 2); i++)
        pages.add(i);

    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    let prev = 0;

    sorted.forEach(n =>
    {
        if (n - prev > 1) result.push("...");
        result.push(n);
        prev = n;
    });

    return result;
}

function go_to_page(page)
{
    current_page = page;
    render_page();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function show_features_view()
{
    document.getElementById("featuresGrid").style.display = "";
    document.getElementById("pagination").style.display = "";
    document.getElementById("example_view").style.display = "none";
}

//+------------------------------------------------------------------+
//| Ejemplos                                                         |
//+------------------------------------------------------------------+
const examples_cache = {};

async function on_example_click(ex, btn)
{
    document.querySelectorAll("#sidebar_examples .filter-btn")
        .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Si ya esta en cache, solo mostrarlo
    if (examples_cache[ex.id])
    {
        console.log(ex.id);
        show_example_view(ex, examples_cache[ex.id]);
        return;
    }

    // Recibimos el codigo
    const response = await fetch(`Examples/${ex.file}`);
    console.log(response);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let code;
    if (bytes[0] === 0xFF && bytes[1] === 0xFE)
        code = new TextDecoder("utf-16le").decode(buffer);
    else if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF)
        code = new TextDecoder("utf-8").decode(buffer.slice(3));
    else
        code = new TextDecoder("utf-8").decode(buffer);
    
    // Aplicamos highligh
    const code_el = document.createElement("code");
    code_el.textContent = code;
    code_el.className = "language-fgblc";
    hljs.highlightElement(code_el);

    // Guardar el innerHTML ya coloreado en cache
    examples_cache[ex.id] = code_el.innerHTML;
    show_example_view(ex, examples_cache[ex.id]);
}


// Mostrar en base a json y code
function show_example_view(ex, highlighted_html)
{
    // features  
    document.getElementById("featuresGrid").style.display = "none";
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("pagination").style.display = "none";

    // demas..
    document.getElementById("example_view").style.display = "";
    document.getElementById("example_desc").textContent = ex.desc;

    // Insertar HTML ya coloreado directamente
    const code_el = document.getElementById("example_code");
    code_el.className = "language-fgblc";
    code_el.innerHTML = highlighted_html;  // ya coloreado, no necesita highlight
}

//+------------------------------------------------------------------+
//| Lenguaje dsl fgblc                                               |
//+------------------------------------------------------------------+
 
    
 

//+------------------------------------------------------------------+
//| Init                                                             |
//+------------------------------------------------------------------+
function Main()
{

    hljs.registerLanguage('fgblc', fgblc_language)

    // Agregamos un evento a edit input (on searh)
    document.getElementById("searchInput").addEventListener("input", e =>
    {
        on_search(e.target.value);
    });
    
    // Cargamos el json..
    load_features();
}

// Main
Main()
