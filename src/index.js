import createChoroplethMap from "./app/app";
import "./index.scss";

function ready() {
  Promise.all([
    fetch(
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
    ).then((usResponse) => usResponse.json()),
    fetch(
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
    ).then((educationResponse) => educationResponse.json()),
  ])
    .then(([usData, educationData]) => {
      createChoroplethMap(usData, educationData);
    })
    .catch((error) => {
      console.log(error);
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}
