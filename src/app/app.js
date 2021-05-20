import * as d3 from "d3";
import * as topojson from "topojson-client";
import legend from "./legend";
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
  const colors = [
    "#d6e0f5",
    "#adc2eb",
    "#85a3e0",
    "#5c85d6",
    "#3366cc",
    "#2952a3",
    "#1f3d7a",
    "#142952",
  ];
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
    })
    .on("mouseover", (event, d) => {
      const { x, y } = event;

      const { fips, state, area_name, bachelorsOrHigher } =
        educationData[d.educationIndex];

      const tooltipText =
        `State: ${state}` +
        `\nCounty: ${area_name}` +
        `\nBachelors or Higher: ${bachelorsOrHigher}%` +
        `\nID: ${fips}`;

      d3.select("#root")
        .append("div")
        .attr("id", "tooltip")
        .style("left", `${x - 125}px`)
        .style("top", `${y - 170}px`)
        .attr(
          "data-education",
          educationData[d.educationIndex]["bachelorsOrHigher"]
        )
        .text(tooltipText);
    })
    .on("mouseout", () => {
      d3.select("#tooltip").remove();
    });

  // states
  svg
    .append("path")
    .datum(topojson.mesh(mapData, mapData.objects.states, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", path);

  // nation
  svg
    .append("path")
    .datum(topojson.feature(mapData, mapData.objects.nation))
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-linejoin", "round")
    .attr("d", path);

  // legend
  svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${width - 360}, 120)`)
    .append(() =>
      legend({
        color: colorScale,
        title: "Bachelor's or Higher (%)",
        width: 200,
        tickFormat: ".1f",
      })
    );

  // title
  svg
    .append("text")
    .attr("id", "title")
    .text("Education Level by County")
    .attr("x", "50%")
    .attr("y", "5%")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging");
}
