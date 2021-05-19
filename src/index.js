import createChoroplethMap from "./app/app";
import "./index.scss";

function ready() {
  createChoroplethMap();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}
