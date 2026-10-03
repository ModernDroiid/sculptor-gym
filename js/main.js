const header = document.getElementById("header");
const nav = document.getElementById("nav");
const menuToggle = document.querySelector(".menu-toggle");

/* Header: se oculta al bajar y reaparece al subir ------------------------ */

let lastScroll = window.scrollY;

window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    const menuOpen = nav.classList.contains("is-open");

    header.classList.toggle("is-scrolled", currentScroll > 8);
    header.classList.toggle("is-hidden", !menuOpen && currentScroll > lastScroll && currentScroll > 200);

    lastScroll = currentScroll;
}, { passive: true });

/* Menú móvil ------------------------------------------------------------- */

function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
}

menuToggle.addEventListener("click", () => {
    setMenu(!nav.classList.contains("is-open"));
});

nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        menuToggle.focus();
    }
});

document.addEventListener("click", event => {
    if (nav.classList.contains("is-open") && !header.contains(event.target)) {
        setMenu(false);
    }
});

/* Enlace activo según la sección visible --------------------------------- */

const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
const sections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
            const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
            if (isCurrent) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        });
    });
}, { rootMargin: "-45% 0px -50% 0px" });

sections.forEach(section => sectionObserver.observe(section));

/* Abierto / cerrado ahora (hora de Bogotá) -------------------------------- */

// Horario por día de la semana (0 = domingo), en horas de 24 h.
const HOURS = {
    0: [7, 16],
    1: [5, 22], 2: [5, 22], 3: [5, 22], 4: [5, 22], 5: [5, 22],
    6: [6, 19]
};

function formatHour(hour) {
    const suffix = hour < 12 ? "a. m." : "p. m.";
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${h12}:00 ${suffix}`;
}

function bogotaNow() {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Bogota",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23"
    }).formatToParts(new Date());

    const get = type => parts.find(part => part.type === type).value;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return {
        day: days.indexOf(get("weekday")),
        time: Number(get("hour")) + Number(get("minute")) / 60
    };
}

function updateOpenStatus() {
    const { day, time } = bogotaNow();
    const [opens, closes] = HOURS[day];
    const isOpen = time >= opens && time < closes;

    let message;
    if (isOpen) {
        message = `Abierto ahora. Cerramos a las ${formatHour(closes)}`;
    } else if (time < opens) {
        message = `Cerrado. Abrimos hoy a las ${formatHour(opens)}`;
    } else {
        const tomorrow = (day + 1) % 7;
        message = `Cerrado. Abrimos mañana a las ${formatHour(HOURS[tomorrow][0])}`;
    }

    document.querySelectorAll("[data-open-status]").forEach(badge => {
        badge.classList.toggle("is-open", isOpen);
        badge.querySelector("[data-open-status-text]").textContent = message;
        badge.hidden = false;
    });

    document.querySelectorAll(".schedule-table tr[data-days]").forEach(row => {
        const days = row.dataset.days.split(",").map(Number);
        row.classList.toggle("is-today", days.includes(day));
    });
}

updateOpenStatus();
setInterval(updateOpenStatus, 60 * 1000);

/* Sedes y mapa ------------------------------------------------------------ */

const locations = document.querySelectorAll(".location");
const map = document.getElementById("gym-map");
const mapName = document.getElementById("map-name");
const mapAddress = document.getElementById("map-address");
const mapDirections = document.getElementById("map-directions");

locations.forEach(location => {
    location.addEventListener("click", () => {
        locations.forEach(item => {
            item.classList.remove("is-active");
            item.setAttribute("aria-pressed", "false");
        });

        location.classList.add("is-active");
        location.setAttribute("aria-pressed", "true");

        const query = encodeURIComponent(location.dataset.query);
        map.src = `https://www.google.com/maps?q=${query}&output=embed`;
        mapDirections.href = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
        mapName.textContent = location.querySelector(".location-name").textContent;
        mapAddress.textContent = location.querySelector(".location-address").textContent;

        if (window.matchMedia("(max-width: 960px)").matches) {
            map.closest(".map-panel").scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
});

/* Año del footer ---------------------------------------------------------- */

document.getElementById("year").textContent = new Date().getFullYear();
