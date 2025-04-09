/* eslint-disable */

// SVGRenderer.js
class SVGRenderer {
  constructor(svg) {
    this.svg = svg;
    this.svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    this.svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    this.svg.setAttribute("id", "dsl-renderer-svg");
  }

  getTimeString() {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hour = now.getHours().toString().padStart(2, "0");
    const minute = now.getMinutes().toString().padStart(2, "0");
    const second = now.getSeconds().toString().padStart(2, "0");

    return `${month}${day}${hour}${minute}${second}`;
  }
  renderExpandedData(data) {
    let mainGroup = this.svg.querySelector(".DSL_rendered_group");
    let current_id = `DSL_RENDERED_INSTANCE_${this.getTimeString()}`;
    if (!mainGroup) {
      // 如果不存在，创建新的 g 元素
      mainGroup = Utils.createSVGElement("g");
      mainGroup.setAttribute("id", current_id);
      mainGroup.setAttribute("class", "DSL_rendered_group");
      this.svg.appendChild(mainGroup);
    } else {
      // 如果存在，清空其内容
      while (mainGroup.firstChild) {
        mainGroup.removeChild(mainGroup.firstChild);
      }
      // 更新 id（如果需要）
      mainGroup.setAttribute("id", current_id);
    }
    // mainGroup.setAttribute("id", `DSL_RENDERED_INSTANCE_${this.getTimeString()}`);
    // mainGroup.setAttribute("class", "DSL_rendered_group")
    // mainGroup.setAttribute("class", "dsl-rendered-instance");
    const instances = data.unit_instances.flat();
    instances.forEach((instance) => {
      this.renderInstance(instance, mainGroup);
    });

    if (data.relation) {
      data.relation.forEach((relation) => {
        if (relation.type === "fixed-position") {
          mainGroup.setAttribute(
            "transform",
            `translate(${relation.position.x}, ${relation.position.y})`
          );
        }
      });
    }
    this.svg.appendChild(mainGroup);
    return current_id;
  }

  renderInstance(instance, parentElement) {
    // 创建一个组来容纳所有变换和元素
    const group = Utils.createSVGElement("g");

    // 设置组ID（如果是组元素）
    if (instance.type === "group") {
      group.setAttribute("id", instance.id);
    }

    // 先处理子元素（如果有）
    if (instance.type === "group" && instance.children?.length) {
      instance.children.forEach((child) => this.renderInstance(child, group));
    }

    // 创建基础图形（如果是元素）
    else if (instance.type === "element") {
      const sourceData = instance.calculated_source || instance.source;
      const element = this.createBaseShape(sourceData, instance.id);
      if (element) {
        // 处理非缩放属性
        Object.entries(instance.attributes || {})
          .filter(([attr]) => !attr.startsWith("scale"))
          .forEach(([attr, value]) => {
            element.setAttribute(Utils.convertToCamelCase(attr), value);
          });
        group.appendChild(element);
      }
    }

    // 构建变换链（顺序关键！）
    const transforms = [];

    // 1. 原点偏移（最内层变换）
    if (instance.origin) {
      transforms.push(
        `translate(${instance.origin.x || 0}, ${instance.origin.y || 0})`,
        `rotate(${instance.origin.rotate || 0})`
      );
    }

    // 2. 旋转和缩放（中间层变换）
    const theta =
      instance.transform?.theta || 0;
    if (theta !== 0 && instance.calculated_source?.type !== "repeat") {
      transforms.push(`rotate(${theta})`);
    }

    if (instance.attributes) {
      // console.log("instance x", instance.attributes.scale_x);
      const scaleX =
        instance.attributes.scale_x !== undefined
          ? instance.attributes.scale_x
          : 1;
      const scaleY =
        instance.attributes.scale_y !== undefined
          ? instance.attributes.scale_y
          : 1;

      // 只要有一个不等于 1，就应用缩放
      if (scaleX !== 1 || scaleY !== 1) {
        transforms.push(`scale(${scaleX}, ${scaleY})`);
      }

      // 如果没有定义 scale_x 和 scale_y，则检查统一的 scale
      if (
        instance.attributes.scale !== undefined &&
        instance.attributes.scale !== 1
      ) {
        transforms.push(`scale(${instance.attributes.scale})`);
      }
    }

    // 3. 位置变换（最外层变换）
    if (instance.transform) {
      transforms.push(
        `translate(${instance.transform.x || 0}, ${instance.transform.y || 0})`
      );
    }

    if (instance.stick_move) {
      transforms.push(
        `translate(${instance.stick_move.x || 0}, ${instance.stick_move.y || 0})`
      );
    }

    // 应用组合变换（注意顺序反转）
    if (transforms.length > 0) {
      group.setAttribute("transform", transforms.reverse().join(" "));
    }

    parentElement.appendChild(group);
  }

  createBaseShape(source, instanceId) {
    if (!source || !source.type) return null;

    let element;
    let debug_mode = false;
    switch (source.type.toUpperCase()) {
      case "RECT":
        element = Utils.createSVGElement("rect");
        element.setAttribute("id", `svg_rect_${instanceId}`);
        if (debug_mode) {
          element.setAttribute("stroke", `#fff`);
          element.setAttribute("stroke-width", `2`);
        }
        break;
      case "CIRCLE":
        element = Utils.createSVGElement("circle");
        element.setAttribute("id", `svg_circle_${instanceId}`);
        break;
      case "TEXT":
        element = Utils.createSVGElement("text");
        element.textContent = source.text_content;
        element.setAttribute("id", `svg_text_${instanceId}`);
        break;
      case "IMAGE":
        element = Utils.createSVGElement("image");
        element.setAttribute("href", source.url);
        element.setAttribute("id", `svg_image_${instanceId}`);
        break;
      case "PATH":
        element = Utils.createSVGElement("path");
        element.setAttribute("id", `svg_path_${instanceId}`);
        // 构建路径数据
        const pathData = this.buildPathData(source.path_data);
        element.setAttribute("d", pathData);
        break;
      case "SVG":
        // 创建一个新的 g 元素
        element = Utils.createSVGElement("g");
        element.setAttribute("id", `svg_code_container_${instanceId}`);
        // 直接设置 innerHTML
        element.innerHTML = source.code;
        break;
      default:
        return null;
    }

    if (source.type !== "SVG" && source.type !== "TEXT") {
      element.setAttribute("fill", "none");
    }

    for (let [key, value] of Object.entries(source)) {
      if (
        key === "type" ||
        key === "url" ||
        key === "path_data" ||
        key === "code"
      )
        continue;
      const attr = Utils.convertToCamelCase(key);
      element.setAttribute(attr, value);
    }

    return element;
  }

  buildPathData(pathCommands) {
    if (!pathCommands || !Array.isArray(pathCommands)) return "";

    return pathCommands
      .map((command) => {
        const type = command.type;
        const values = command.values;
        if (!values) return type;
        return `${type}${values.join(" ")}`;
      })
      .join(" ");
  }
}

// Utils.js
class Utils {
  static createSVGElement(type) {
    return document.createElementNS("http://www.w3.org/2000/svg", type);
  }

  static convertToCamelCase(str) {
    return str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
  }
}
