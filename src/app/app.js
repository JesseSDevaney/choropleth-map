import * as d3 from "d3";
import * as topojson from "topojson-client";
import "./app.scss";

export default function createChoroplethMap(usData, educationData) {
  const width = 1100;
  const height = 750;

  const svg = d3
    .select("#root")
    .append("svg")
    .attr("id", "chart")
    .attr("viewBox", `0 0 ${width} ${height}`);

  // counties
  const path = d3.geoPath();

  const educationMin = d3.min(educationData, (d) => d["bachelorsOrHigher"]);
  const educationMax = d3.max(educationData, (d) => d["bachelorsOrHigher"]);
  const colors = ["#ccccff", "#9999ff", "#6666ff", "#0000e6", "#000080"];
  const colorScale = d3.scaleQuantize([educationMin, educationMax], colors);

  //translate counties on page
  const [transformX, transformY] = usData["transform"]["translate"];
  usData["transform"]["translate"] = [transformX + 70, transformY + 90];

  svg
    .append("g")
    .selectAll("path")
    .data(topojson.feature(usData, usData.objects.counties).features)
    .join("path")
    .attr("class", "county")
    .attr("fill", (d) => {
      const countyEducation = educationData.find(
        (county) => county["fips"] === d.id
      );

      return colorScale(countyEducation["bachelorsOrHigher"]);
    })
    .attr("d", path)
    .attr("data-fips", (d) => {
      return d.id;
    })
    .attr("data-education", (d) => {
      const countyEducation = educationData.find(
        (county) => county["fips"] === d.id
      );
      return countyEducation["bachelorsOrHigher"];
    });

}
