/* eslint-disable */

function findElementFromSVGById(svgString, targetId) {
  // 创建一个临时的DOM解析器
  const parser = new DOMParser();

  // 将SVG字符串解析为DOM文档
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  // 查找目标ID的元素
  const element = doc.getElementById(targetId);

  if (!element) {
    return null; // 如果没找到元素，返回null
  }

  // 返回元素的字符串表示
  return element.outerHTML;
}

function findDefsFromSVG(svgString) {
  // 创建一个临时的DOM解析器
  const parser = new DOMParser();

  // 将SVG字符串解析为DOM文档
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  // 查找目标ID的元素
  const defsElement = doc.querySelector("defs");
  const defsContent = defsElement ? defsElement.innerHTML : "";
  return defsContent;
}

function addDefsToSVG(svgElement, defsContent) {
  if (svgElement.querySelector("defs")) {
    svgElement.querySelector("defs").innerHTML = ""; // remove existing defs
  }

  // 检查是否已经存在defs元素
  let defsElement = svgElement.querySelector("defs");

  if (!defsElement) {
    // 如果不存在defs元素，创建一个新的
    defsElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "defs"
    );
    // 将新的defs插入到SVG的开头
    svgElement.insertBefore(defsElement, svgElement.firstChild);
  }

  // 添加新的defs内容
  defsElement.innerHTML += defsContent;
}

function fitSvgToContent(svg) {
  // 获取所有子元素的边界框
  const bbox = svg.getBBox();

  // 可选：添加一些padding
  const padding = 10;

  // 设置viewBox以适应内容
  svg.setAttribute(
    "viewBox",
    `${bbox.x - bbox.width * 0.05} ${bbox.y - bbox.height * 0.05} ${
      bbox.width * 1.1
    } ${bbox.height * 1.1}`
  );

  // 设置实际尺寸
  svg.setAttribute("width", bbox.width);
  svg.setAttribute("height", bbox.height);

  svg.setAttribute("width", bbox.width);
  svg.setAttribute("height", bbox.height);
}

function checkPathToRect(d) {
  // 解析路径字符串为点数组

  function parsePath(d) {
    // 首先将V和H命令转换为完整的坐标
    let path = d.trim();
    let points = [];
    let currentX = 0,
      currentY = 0;

    let min_error = 0.01;

    // 将路径分解为命令和坐标
    const commands = path.match(/[MLVHZ][^MLVHZ]*/g) || [];

    for (let cmd of commands) {
      const command = cmd[0];
      const coords = cmd
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(Number);

      switch (command) {
        case "M":
          currentX = coords[0];
          currentY = coords[1];
          points.push({ x: currentX, y: currentY });
          break;

        case "L":
          currentX = coords[0];
          currentY = coords[1];
          points.push({ x: currentX, y: currentY });
          break;

        case "V":
          currentY = coords[0];
          points.push({ x: currentX, y: currentY });
          break;

        case "H":
          currentX = coords[0];
          points.push({ x: currentX, y: currentY });
          break;

        case "Z":
          // 如果最后一个点不等于第一个点，添加闭合点
          if (
            points.length > 0 &&
            (Math.abs(points[0].x - points[points.length - 1].x) > 0.001 ||
              Math.abs(points[0].y - points[points.length - 1].y) > 0.001)
          ) {
            points.push({ x: points[0].x, y: points[0].y });
          }
          break;
      }
    }

    // 如果最后一个点与第一个点相同，移除它
    if (
      points.length > 4 &&
      Math.abs(points[0].x - points[points.length - 1].x) < 0.001 &&
      Math.abs(points[0].y - points[points.length - 1].y) < 0.001
    ) {
      points.pop();
    }

    return points;
  }
  // 检查点数组是否构成矩形
  function isRectangle(points) {
    if (points.length !== 4) return false;

    const edges = [];
    for (let i = 0; i < 4; i++) {
      const nextI = (i + 1) % 4;
      const dx = points[nextI].x - points[i].x;
      const dy = points[nextI].y - points[i].y;
      edges.push(Math.sqrt(dx * dx + dy * dy));
    }

    const epsilon = 0.1;
    if (
      Math.abs(edges[0] - edges[2]) > epsilon ||
      Math.abs(edges[1] - edges[3]) > epsilon
    ) {
      return false;
    }

    const diagonal1 = Math.sqrt(
      Math.pow(points[2].x - points[0].x, 2) +
        Math.pow(points[2].y - points[0].y, 2)
    );
    const diagonal2 = Math.sqrt(
      Math.pow(points[3].x - points[1].x, 2) +
        Math.pow(points[3].y - points[1].y, 2)
    );

    return Math.abs(diagonal1 - diagonal2) <= epsilon;
  }

  // 主要处理逻辑
  const points = parsePath(d);

  if (!isRectangle(points)) {
    return null;
  }

  let angle =
    Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x) *
    (180 / Math.PI);

  const width = Math.sqrt(
    Math.pow(points[1].x - points[0].x, 2) +
      Math.pow(points[1].y - points[0].y, 2)
  );
  const height = Math.sqrt(
    Math.pow(points[2].x - points[1].x, 2) +
      Math.pow(points[2].y - points[1].y, 2)
  );

  angle += 180;

  const center = {
    x: points[1].x,
    y: points[1].y,
  };

  return {
    width,
    height,
    center,
    angle,
  };
}

// We find that some rects will be transfered to path, so we need to convert them back to rect
function check_svg_convert_path_to_rect(svgElement) {
  console.log("check_svg_convert_path_to_rect");
  // 检查svgElement是否存在且为SVGElement实例
  if (!svgElement || !(svgElement instanceof SVGElement)) {
    console.error("Invalid SVG element");
    return false;
  }

  // 获取所有path元素
  const paths = svgElement.querySelectorAll("path");

  paths.forEach((path) => {
    // 获取path的d属性
    const pathD = path.getAttribute("d");
    if (!pathD) return;

    // 尝试转换为矩形
    const rectData = checkPathToRect(pathD);

    if (rectData) {
      // 创建新的rect元素
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );

      // 复制path的所有属性到rect
      Array.from(path.attributes).forEach((attr) => {
        if (attr.name !== "d") {
          // 跳过d属性
          rect.setAttribute(attr.name, attr.value);
        }
      });

      rect.setAttribute("replace_path", "true"); // 添加一个自定义属性，用于标识这个rect是从path转换来的

      // 设置rect的特定属性
      rect.setAttribute("x", rectData.center.x);
      rect.setAttribute("y", rectData.center.y);
      rect.setAttribute("width", rectData.width);
      rect.setAttribute("height", rectData.height);

      // console.log("update path to rect", path.getAttribute('id'), rectData.center.x, rectData.center.y, rectData.width, rectData.height, rectData.angle);

      // 设置transform属性来处理旋转

      // 设置transform属性来处理旋转
      // 保留原有的transform属性（如果有的话）
      let existingTransform = path.getAttribute("transform") || "";
      let rotateTransform = `rotate(${rectData.angle} ${rectData.center.x} ${rectData.center.y})`;

      if (existingTransform) {
        // 如果已经有transform，添加到现有transform后面
        rect.setAttribute(
          "transform",
          `${existingTransform} ${rotateTransform}`
        );
      } else {
        rect.setAttribute("transform", rotateTransform);
      }

      // 替换原来的path元素
      path.parentNode.replaceChild(rect, path);
    }
  });
}

// 使用示例
// const pathD = "M258.186 255.259L214.843 230.235L93.8946 439.724L137.237 464.748L258.186 255.259Z";
// const result = pathToRect(pathD);
// console.log(result);

// 设置SVG元素的path元素的填充透明度
function setPathFillOpacity(svgElement, options = { opacity: "0" }) {
  // 检查svgElement是否存在且为SVGElement实例
  if (!svgElement || !(svgElement instanceof SVGElement)) {
    console.error("Invalid SVG element");
    return false;
  }

  try {
    // 获取所有path元素
    const paths = svgElement.querySelectorAll("path");

    paths.forEach((path) => {
      // 获取所有可能的fill相关属性
      const fillAttr = path.getAttribute("fill");
      const styleAttr = path.getAttribute("style");
      const computedStyle = window.getComputedStyle(path);

      // 解析style属性中的fill
      let styleFill = null;
      if (styleAttr) {
        const fillMatch = styleAttr.match(/fill:\s*([^;]*)/);
        if (fillMatch) {
          styleFill = fillMatch[1].trim();
        }
      }

      // 检查是否有明确的fill设置
      const hasFill =
        // 检查fill属性
        (fillAttr && fillAttr !== "none") ||
        // 检查style中的fill
        (styleFill && styleFill !== "none") ||
        // 检查计算样式
        (computedStyle.fill &&
          computedStyle.fill !== "none" &&
          computedStyle.fill !== "rgb(0, 0, 0)");

      if (!hasFill) {
        // 如果没有fill，设置fill-opacity
        if (styleAttr) {
          // 如果已经有style属性，添加到现有style中
          const newStyle =
            styleAttr.replace(/fill-opacity:[^;]+;?/, "") +
            `; fill-opacity: ${options.opacity};`;
          path.setAttribute("style", newStyle.replace(/;;/g, ";").trim());
        } else {
          // 如果没有style属性，直接设置fill-opacity属性
          path.setAttribute("fill-opacity", options.opacity);
        }

        // 记录修改（可选）
        path.dataset.autoFillOpacity = "true";
      }
    });

    return true;
  } catch (error) {
    console.error("Error setting path fill opacity:", error);
    return false;
  }
}

function downloadDataAsJSON(data, filename) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = now.toTimeString().slice(0, 5).replace(":", "-");
  const generatedFilename = `${filename}_expand_${dateStr}_${timeStr}.json`;

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = generatedFilename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

function computeGeneralTransformation(srcPoints, dstPoints) {
  // 我们需要解决方程组 A * [a, b, c, d, e, f]^T = B
  // 其中 A 是由源点构成的矩阵，B 是目标点构成的向量
  // [a, b, c, d, e, f] 是我们要求的变换矩阵参数

  // 构建矩阵 A 和向量 B
  const A = [];
  const B = [];

  for (let i = 0; i < srcPoints.length; i++) {
    const srcX = srcPoints[i].x;
    const srcY = srcPoints[i].y;
    const dstX = dstPoints[i].x;
    const dstY = dstPoints[i].y;

    // 每个点提供两个方程
    A.push([srcX, srcY, 0, 0, 1, 0]);
    A.push([0, 0, srcX, srcY, 0, 1]);

    B.push(dstX);
    B.push(dstY);
  }

  // 使用最小二乘法求解方程组
  const solution = solveLinearSystem(A, B);

  // 构建变换矩阵
  const matrix = [
    [solution[0], solution[1], solution[4]],
    [solution[2], solution[3], solution[5]],
    [0, 0, 1],
  ];

  // 从变换矩阵中提取平移、缩放和旋转
  const decomposed = decomposeMatrix(matrix);

  return {
    matrix: matrix,
    ...decomposed,
  };
}

// 使用最小二乘法求解线性方程组 Ax = B
function solveLinearSystem(A, B) {
  // 计算 A^T * A
  const ATA = [];
  for (let i = 0; i < 6; i++) {
    ATA[i] = [];
    for (let j = 0; j < 6; j++) {
      let sum = 0;
      for (let k = 0; k < A.length; k++) {
        sum += A[k][i] * A[k][j];
      }
      ATA[i][j] = sum;
    }
  }

  // 计算 A^T * B
  const ATB = [];
  for (let i = 0; i < 6; i++) {
    let sum = 0;
    for (let k = 0; k < A.length; k++) {
      sum += A[k][i] * B[k];
    }
    ATB[i] = sum;
  }

  // 求解 ATA * x = ATB
  // 这里使用高斯消元法
  const augmentedMatrix = [];
  for (let i = 0; i < 6; i++) {
    augmentedMatrix[i] = [...ATA[i], ATB[i]];
  }

  // 高斯消元
  for (let i = 0; i < 6; i++) {
    // 找到当前列中绝对值最大的元素
    let maxRow = i;
    let maxVal = Math.abs(augmentedMatrix[i][i]);

    for (let j = i + 1; j < 6; j++) {
      const absVal = Math.abs(augmentedMatrix[j][i]);
      if (absVal > maxVal) {
        maxRow = j;
        maxVal = absVal;
      }
    }

    // 交换行
    if (maxRow !== i) {
      [augmentedMatrix[i], augmentedMatrix[maxRow]] = [
        augmentedMatrix[maxRow],
        augmentedMatrix[i],
      ];
    }

    // 消元
    for (let j = i + 1; j < 6; j++) {
      const factor = augmentedMatrix[j][i] / augmentedMatrix[i][i];

      for (let k = i; k < 7; k++) {
        augmentedMatrix[j][k] -= factor * augmentedMatrix[i][k];
      }
    }
  }

  // 回代
  const solution = new Array(6).fill(0);
  for (let i = 5; i >= 0; i--) {
    let sum = augmentedMatrix[i][6];

    for (let j = i + 1; j < 6; j++) {
      sum -= augmentedMatrix[i][j] * solution[j];
    }

    solution[i] = sum / augmentedMatrix[i][i];
  }

  return solution;
}

// 从变换矩阵中分解出平移、缩放和旋转
function decomposeMatrix(matrix) {
  // 提取平移
  const translation = {
    x: Math.round(matrix[0][2], 1),
    y: Math.round(matrix[1][2], 1),
  };

  // 提取缩放和旋转
  // 注意：这里假设没有剪切变换
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];

  // 计算缩放
  const scaleX = Math.sqrt(a * a + b * b);
  const scaleY = Math.sqrt(c * c + d * d);

  // 计算旋转角度
  const rotation = Math.round((Math.atan2(b, a) * 180) / Math.PI, 1);

  return {
    translation,
    scale: {
      x: scaleX,
      y: scaleY,
    },
    rotation,
  };
}
