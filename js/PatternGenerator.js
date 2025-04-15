/* eslint-disable */

class PatternGenerator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    // 先检查容器中是否已经存在SVG元素
    this.svg = this.container.querySelector("svg");

    // 如果没有找到SVG元素，则创建新的
    if (!this.svg) {
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.container.appendChild(this.svg);
    }

    this.renderer = new SVGRenderer(this.svg);
    this.expander = new DataExpander();
    this.relationProcessor = new RelationProcessor(this.svg);

    // 创建下载按钮容器
    this.downloadContainer = document.createElement("div");
    this.downloadContainer.style.position = "absolute";
    this.downloadContainer.style.top = "10px";
    this.downloadContainer.style.right = "10px";
    this.downloadContainer.id = "download-container";

    this.container.appendChild(this.downloadContainer);

    this.initializeSVG();
  }

  initializeSVG() {
    const containerRect = this.container.getBoundingClientRect();
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.setAttribute(
      "viewBox",
      `0 0 ${containerRect.width} ${containerRect.height}`
    );
  }

  generateFromJSON(data, download = false) {
    const expandedData = this.expander.expandData(data);
    if (download) {
      this.downloadJSON(expandedData, data.units[0].id);
      console.log("Calculate points", expandedData.unit_instances[0])
    }
    this._expanded_data = expandedData;
    //   this.svg.innerHTML = "";
    let this_render_id = this.renderer.renderExpandedData(expandedData);
    console.log("Render id: ", this_render_id);
    this.relationProcessor.processRelations(data.relation);
    return this_render_id;
  }

  downloadJSON(data, filename) {
    // 清除之前的下载按钮
    this.downloadContainer.innerHTML = "";

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = now.toTimeString().slice(0, 5).replace(":", "-");
    const generatedFilename = `${filename}_expand_${dateStr}_${timeStr}.json`;

    const button = document.createElement("button");
    button.innerHTML = "Download Expanded JSON";
    button.style.padding = "8px 16px";
    button.style.backgroundColor = "#4CAF50";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";
    button.style.fontSize = "14px";
    button.id = "download-button";
    button.className = "render-button";

    button.addEventListener("mouseover", () => {
      button.style.backgroundColor = "#45a049";
    });

    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = "#4CAF50";
    });

    button.onclick = () => {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = generatedFilename;
      a.click();
      URL.revokeObjectURL(url);
    };

    this.downloadContainer.appendChild(button);
  }
}


