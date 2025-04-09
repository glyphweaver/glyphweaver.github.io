/* eslint-disable */
// RelationProcessor.js

class RelationProcessor {
  constructor(svg) {
    this.svg = svg;
  }

  processRelations(relations) {
    if (!relations) return;

    const dependencyGraph = new Map();
    const processed = new Set();

    relations.forEach((relation) => {
      if (relation.type === "fixed-position") {
        if (!dependencyGraph.has(relation.source)) {
          dependencyGraph.set(relation.source, {
            deps: [],
            relation: relation,
          });
        }
      } else if (relation.type === "fixed-distance") {
        if (!dependencyGraph.has(relation.target)) {
          dependencyGraph.set(relation.target, {
            deps: [relation.source],
            relation: relation,
          });
        }
      }
    });

    const processNode = (id) => {
      if (processed.has(id)) return;

      const node = dependencyGraph.get(id);
      if (!node) return;

      node.deps.forEach((depId) => {
        processNode(depId);
      });

      if (node.relation.type === "fixed-position") {
        this.handleFixedPosition(node.relation);
      } else if (node.relation.type === "fixed-distance") {
        this.handleFixedDistance(node.relation);
      }

      processed.add(id);
    };

    for (let id of dependencyGraph.keys()) {
      processNode(id);
    }
  }

  handleFixedPosition(relation) {
    const element = this.svg.getElementById(relation.source);
    if (!element) return;

    let positionGroup =
      element.closest(".position-group") || Utils.createSVGElement("g");
    positionGroup.classList.add("position-group");

    positionGroup.setAttribute(
      "transform",
      `translate(${relation.position.x}, ${relation.position.y})`
    );

    if (element.parentNode !== positionGroup) {
      element.parentNode.removeChild(element);
      positionGroup.appendChild(element);

      if (!positionGroup.parentNode) {
        this.svg.appendChild(positionGroup);
      }
    }
  }

  handleFixedDistance(relation) {
    const sourceElement = this.svg.getElementById(relation.source);
    const targetElement = this.svg.getElementById(relation.target);
    if (!sourceElement || !targetElement) return;

    const sourceBBox = sourceElement.getBBox();
    const sourceTransform = sourceElement
      .closest(".position-group")
      ?.getAttribute("transform");
    let sourceX = 0,
      sourceY = 0;

    if (sourceTransform) {
      const match = sourceTransform.match(/translate$([^,]+),\s*([^)]+)$/);
      if (match) {
        sourceX = parseFloat(match[1]);
        sourceY = parseFloat(match[2]);
      }
    }

    let distanceGroup =
      targetElement.closest(".distance-group") || Utils.createSVGElement("g");
    distanceGroup.classList.add("distance-group");

    const targetX = sourceX + relation.distance.x;
    const targetY = sourceY + relation.distance.y;

    distanceGroup.setAttribute(
      "transform",
      `translate(${targetX}, ${targetY})`
    );

    if (targetElement.parentNode !== distanceGroup) {
      targetElement.parentNode.removeChild(targetElement);
      distanceGroup.appendChild(targetElement);

      if (!distanceGroup.parentNode) {
        this.svg.appendChild(distanceGroup);
      }
    }
  }
}
