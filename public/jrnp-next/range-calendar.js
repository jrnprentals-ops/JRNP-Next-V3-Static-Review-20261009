(function () {
  "use strict";

  var root = document.getElementById("range-calendar");
  var checkin = document.getElementById("checkin");
  var checkout = document.getElementById("checkout");
  if (!root || !checkin || !checkout) return;

  var weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  var today = startOfDay(new Date());
  var maxMonth = new Date(today.getFullYear(), today.getMonth() + 18, 1);
  var cursor = new Date(today.getFullYear(), today.getMonth(), 1);
  var start = null;
  var end = null;
  var writing = false;

  root.innerHTML = [
    '<div class="range-calendar-head">',
    '  <button type="button" class="range-calendar-nav" data-dir="-1" aria-label="Previous month">‹</button>',
    '  <p class="range-calendar-label" data-label></p>',
    '  <button type="button" class="range-calendar-nav" data-dir="1" aria-label="Next month">›</button>',
    "</div>",
    '<div class="range-calendar-week" aria-hidden="true">',
    weekday.map(function (day) { return "<span>" + day + "</span>"; }).join(""),
    "</div>",
    '<div class="range-calendar-grid" role="grid" data-grid></div>',
    '<p class="range-calendar-status" data-status aria-live="polite"></p>'
  ].join("");

  var label = root.querySelector("[data-label]");
  var grid = root.querySelector("[data-grid]");
  var status = root.querySelector("[data-status]");

  root.addEventListener("click", function (event) {
    var nav = event.target.closest("[data-dir]");
    if (nav) {
      moveMonth(Number(nav.dataset.dir));
      return;
    }
    var day = event.target.closest("[data-date]");
    if (!day || day.disabled) return;
    choose(parseISO(day.dataset.date));
  });

  root.addEventListener("keydown", function (event) {
    var day = event.target.closest("[data-date]");
    if (!day) return;
    var current = parseISO(day.dataset.date);
    var next = null;
    if (event.key === "ArrowRight") next = addDays(current, 1);
    if (event.key === "ArrowLeft") next = addDays(current, -1);
    if (event.key === "ArrowDown") next = addDays(current, 7);
    if (event.key === "ArrowUp") next = addDays(current, -7);
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!day.disabled) choose(current);
      return;
    }
    if (!next) return;
    event.preventDefault();
    if (next < today || next >= addMonths(maxMonth, 1)) return;
    cursor = new Date(next.getFullYear(), next.getMonth(), 1);
    draw();
    var target = grid.querySelector('[data-date="' + iso(next) + '"]');
    if (target) target.focus();
  });

  checkin.addEventListener("change", syncFromFields);
  checkout.addEventListener("change", syncFromFields);
  syncFromFields();
  // home.js pre-fills dates from the URL later in the deferred script order.
  document.addEventListener("DOMContentLoaded", syncFromFields, { once: true });

  function choose(date) {
    if (!start || end) {
      start = date;
      end = null;
    } else if (date.getTime() <= start.getTime()) {
      start = date;
      end = null;
    } else {
      end = date;
    }
    writeFields();
    draw();
  }

  function syncFromFields() {
    if (writing) return;
    start = parseISO(checkin.value);
    end = parseISO(checkout.value);
    if (end && start && end.getTime() <= start.getTime()) end = null;
    if (start) cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    draw();
  }

  function writeFields() {
    writing = true;
    setValue(checkin, start);
    setValue(checkout, end);
    writing = false;
    status.textContent = summary();
  }

  function setValue(input, date) {
    var value = date ? iso(date) : "";
    if (input.value === value) return;
    input.value = value;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function moveMonth(offset) {
    var next = new Date(cursor.getFullYear(), cursor.getMonth() + offset, 1);
    if (next < new Date(today.getFullYear(), today.getMonth(), 1) || next > maxMonth) return;
    cursor = next;
    draw();
  }

  function draw() {
    label.textContent = cursor.toLocaleString("en-US", { month: "long", year: "numeric" });
    var previous = root.querySelector('[data-dir="-1"]');
    var next = root.querySelector('[data-dir="1"]');
    previous.disabled = cursor <= new Date(today.getFullYear(), today.getMonth(), 1);
    next.disabled = cursor >= maxMonth;
    grid.replaceChildren();

    var first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    var lead = first.getDay();
    var count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    var index;
    for (index = 0; index < lead; index += 1) grid.append(blank());
    for (index = 1; index <= count; index += 1) {
      grid.append(dayButton(new Date(cursor.getFullYear(), cursor.getMonth(), index)));
    }
    status.textContent = summary();
  }

  function blank() {
    var item = document.createElement("span");
    item.className = "range-calendar-empty";
    item.setAttribute("aria-hidden", "true");
    return item;
  }

  function dayButton(date) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "range-calendar-day";
    button.textContent = String(date.getDate());
    button.dataset.date = iso(date);
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", date.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric"
    }));
    if (date < today) button.disabled = true;
    if (same(date, today)) button.classList.add("is-today");
    if (same(date, start)) button.classList.add("is-start");
    if (same(date, end)) button.classList.add("is-end");
    if (start && end && date > start && date < end) button.classList.add("is-between");
    button.setAttribute("aria-pressed", String(same(date, start) || same(date, end)));
    return button;
  }

  function summary() {
    if (start && end) return "Arrival " + spoken(start) + ", departure " + spoken(end) + ".";
    if (start) return "Arrival " + spoken(start) + ". Choose a departure date.";
    return "Choose an arrival date, then a departure date.";
  }

  function spoken(date) {
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, count) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);
  }

  function addMonths(date, count) {
    return new Date(date.getFullYear(), date.getMonth() + count, 1);
  }

  function parseISO(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
    return new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10)));
  }

  function iso(date) {
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }

  function same(a, b) {
    return Boolean(a && b && iso(a) === iso(b));
  }
})();
