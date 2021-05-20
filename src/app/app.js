import * as d3 from "d3";
import * as topojson from "topojson-client";
import "./app.scss";

export default function createChoroplethMap(mapData, educationData) {
  const width = 1100;
  const height = 750;

  const svg = d3
    .select("#root")
    .append("svg")
    .attr("id", "chart")
    .attr("viewBox", `0 0 ${width} ${height}`);

  // counties
  // path: reads and renders the object given to it
  // which may be any GeoJSON feature or geometry object
  const path = d3.geoPath();

  const educationMin = d3.min(educationData, (d) => d["bachelorsOrHigher"]);
  const educationMax = d3.max(educationData, (d) => d["bachelorsOrHigher"]);
  const colors = ["#ccccff", "#9999ff", "#6666ff", "#0000e6", "#000080"];
  const colorScale = d3
    .scaleQuantize()
    .domain([educationMin, educationMax])
    .range(colors);

  // translate map to the center of the svg
  const [transformX, transformY] = mapData["transform"]["translate"];
  mapData["transform"]["translate"] = [transformX + 95, transformY + 100];

  svg
    .append("g")
    .selectAll("path")
    .data(topojson.feature(mapData, mapData.objects.counties).features, (d) => {
      const educationIndex = educationData.findIndex(
        (county) => county["fips"] === d.id
      );
      d.educationIndex = educationIndex;

      return d;
    })
    .join("path")
    .attr("class", "county")
    .attr("d", path)
    .attr("fill", (d) => {
      const countyEducation = educationData[d.educationIndex];
      return colorScale(countyEducation["bachelorsOrHigher"]);
    })
    .attr("data-fips", (d) => {
      return d.id;
    })
    .attr("data-education", (d) => {
      const countyEducation = educationData[d.educationIndex];
      return countyEducation["bachelorsOrHigher"];
    });

  // states
  svg
    .append("path")
    .datum(topojson.mesh(mapData, mapData.objects.states, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", path);
}
