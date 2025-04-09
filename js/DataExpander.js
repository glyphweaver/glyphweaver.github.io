/* eslint-disable */

class DataExpander {
  expandData(data) {
    if (!data.type) {
      data.type = "combine";
    }
    let main_unit = this.expandUnit(data, null, 0);
    return {
      id: `DSL_${data.id}`,
      unit_instances: [main_unit],
      relation: [],
    };
  }

  processEncodedData(unit, parentData) {
    if (!unit.encoded_data?.value) {
      return Array.isArray(parentData) ? parentData : [];
    }

    if (unit.encoded_data.value === "parent[i]") {
      return parentData;
    }

    if (unit.encoded_data.value.startsWith("parent.")) {
      const dataPath = unit.encoded_data.value.slice(7);
      return parentData?.[dataPath];
    }

    return unit.encoded_data.value;
  }

  // 处理组合单元
  expandCombineUnit(
    unit,
    current_data,
    index = 0,
    repeat_id = null,
    parentSource = null
  ) {
    let unitData = unit.encoded_data;
    if (current_data) {
      unitData = current_data;
    }

    if (unit.encoded_data){
      unitData = unit.encoded_data; // use current data rather than from parent
    }
    // console.log("Parse", unit.id, unitData);

    const attributes = processDataFunction(
      unit,
      unitData,
      repeat_id,
      parentSource
    );
    let unit_base = unit.id?.replace(" ", "_").replace("DSL_", "");

    if (!unit_base) {
      unit_base = `${unit.type}_${index}`;
    }

    let calculated_source = {
      ...unit.source,
      ...attributes,
    };

    let combine_instance = {
      id: `DSL_C_${unit_base}`, // there will only be one combine unit, so just use it
      archetype_id: unit.id,
      type: "group",
      transform: { x: 0, y: 0 },
      attributes,
      instanceData: unitData,
      calculated_source: calculated_source,
      origin: {
        x: -(unit.origin_point?.x || 0),
        y: -(unit.origin_point?.y || 0),
        rotate: -(unit.origin_point?.rotate || 0),
      },
      children:
        unit.units?.flatMap((subUnit, idx) =>
          this.expandUnit(
            subUnit,
            unitData,
            idx,
            repeat_id,
            (parentSource = parentSource)
          )
        ) || [],
    };

    let children = combine_instance.children;
    // 处理 relation 中的 stick_to 逻辑
    if (unit.relation && unit.relation.length > 0) {
      console.log("relation 1", unit.relation);
      const childMap = new Map(children.map((c) => [c.archetype_id, c]));
      console.log("childMap for combine relation", childMap);
      unit.relation.forEach((rel) => {
        const sourceUnit = childMap.get(rel.source_id);
        const targetUnit = childMap.get(rel.target_id);
        // console.log("targetUnit", targetUnit);
        let selectPoint = null;
        if (sourceUnit && targetUnit) {
          if (
            [
              "left",
              "right",
              "top",
              "bottom",
              "center",
              "furthest",
              "first",
              "last",
            ].includes(rel.stick_to?.point) ||
            Number.isInteger(rel.stick_to?.point)
          ) {
            selectPoint = getSelectedPointByIds(
              targetUnit.points,
              rel.stick_to?.point
            );
          }

          if (selectPoint) {
            // console.log("Source Unit", sourceUnit.origin);
            let rel_distance_x = rel.stick_to.distance?.x || 0;
            let rel_distance_y = rel.stick_to.distance?.y || 0;
            sourceUnit.stick_move = {
              x: selectPoint.x + rel_distance_x,
              y: selectPoint.y + rel_distance_y,
              rotate: 0,
            };
          }
          // console.log("After stick_to: ", sourceUnit.stick_move);
        }
      });

      // Update new points according to stick_move
      children.forEach((child) => {
        child.points = getPoints(child);
      });
    }

    combine_instance.children = children;

    combine_instance.points = getPoints(combine_instance);

    return combine_instance;
  }

  expandUnit(
    unit,
    parentData,
    parentIndex,
    repeat_id = null,
    parentSource = null
  ) {
    let current_data = parentData;
    // console.log(parentData, parentIndex);

    let final_repeat_id = parentIndex;
    if (repeat_id) {
      final_repeat_id = repeat_id;
    }

    if (parentData) {
      if (Array.isArray(parentData)) {
        // console.log("this is an array");
        if (parentIndex >= parentData.length && parentData.length > 0) {
          parentData[parentIndex] = parentData[0];
        }
        current_data = parentData[parentIndex];
      } else {
        // console.log("this is a dict");
        current_data = parentData[`combine_${parentIndex}`];
      }
    }

    // console.log("Expand", unit.type, unit.id, current_data);

    switch (unit.type) {
      case "repeat":
        return this.handleRepeatUnit(
          unit,
          current_data,
          parentIndex,
          repeat_id,
          (parentSource = parentSource)
        );
      case "single":
        return this.expandSingleUnit(
          unit,
          current_data,
          parentIndex,
          repeat_id,
          (parentSource = parentSource)
        );
      case "combine":
        return this.expandCombineUnit(
          unit,
          current_data,
          parentIndex,
          repeat_id,
          (parentSource = parentSource)
        );
      default:
        console.warn(`Unknown unit type: ${unit.type}`);
        return [];
    }
  }
  handleRepeatUnit(
    unit,
    currentData,
    parentIndex,
    repeat_id = null,
    parentSource = null
  ) {
    // console.log('current_unit', unit.repeat_count, unit)

    const count = unit.repeat_count
      ? parseInt(unit.repeat_count)
      : parseInt(unit.source.repeat_count);
    let encodedData;

    if (Array.isArray(currentData)) {
      encodedData = currentData;
    } else if (Array.isArray(unit.encoded_data)) {
      encodedData = unit.encoded_data;
    } else if (unit.encoded_data?.value) {
      if (unit.encoded_data.value === "parent[i]") {
        encodedData = currentData;
      } else if (unit.encoded_data.value.startsWith("parent.")) {
        const dataPath = unit.encoded_data.value.slice(7);
        encodedData = currentData?.[dataPath];
      } else {
        encodedData = unit.encoded_data;
      }
    } else {
      encodedData = unit.encoded_data || [];
    }

    let sub_array = encodedData;
    if (!Array.isArray(encodedData)) {
      sub_array = encodedData?.sub_array;
    }

    if (!Array.isArray(encodedData)) {
      console.warn(`Expected array for encoded data, got:`, encodedData);
      encodedData = [];
    }

    const unit_coordinate =
      unit.coordinate_system || unit.source.coordinate_system;

    let unit_calculated_source = unit.source
      ? unit.source
      : unit.repeat_distance;

    const attributes = processDataFunction(
      unit,
      currentData,
      parentIndex,
      parentSource
    );

    unit_calculated_source = {
      ...unit_calculated_source,
      ...attributes,
    };

    if (
      unit_coordinate === "cartesian" &&
      unit.source?.repeat_rule === "non_uniform_scale"
    ) {
      if (unit_calculated_source.scale_center) {
        unit_calculated_source.scale_begin =
          (-(unit_calculated_source.repeat_count - 1) *
            unit_calculated_source.scale_interval) /
          2;
      }
    }

    let unit_base = unit.id.replace("DSL_", "").replace(" ", "_");
    let sim_coordinate = unit_coordinate === "polar" ? "P" : "C";

    // 处理子单元及其 relation
    const children = Array.from({ length: count }, (_, i) => {
      const instanceChildren =
        unit.units?.flatMap((subUnit) =>
          this.expandUnit(
            subUnit,
            sub_array,
            i,
            (repeat_id = i),
            (parentSource = unit_calculated_source)
          )
        ) || [];

      // 计算 transform
      const transform =
        unit_coordinate === "polar"
          ? this.calculatePolarTransform(unit_calculated_source, i)
          : this.calculateCartesianTransform(unit_calculated_source, i);

      let repeat_instance = {
        id: `DSL_${unit_base}_R_${i}`,
        type: "group",
        transform,
        instanceData: encodedData[i],
        children: instanceChildren,
        origin: { x: 0, y: 0, rotate: 0 },
      };
      return repeat_instance;
    });
    // console.log("relation", unit.relation);

    children.forEach((child) => {
      child.children.forEach((grandson) => {
        grandson.points = getPoints(grandson); // Grandson points
      });
      child.points = getPoints(child); // each repeat points
    });

    // 处理 relation 中的 stick_to 逻辑
    if (unit.relation && unit.relation.length > 0) {
      console.log("relation 1", unit.relation);
      children.forEach((child, i) => {
        const childMap = new Map(
          child.children.map((c) => [c.archetype_id, c])
        );
        // console.log("childMap", childMap);
        unit.relation.forEach((rel) => {
          const sourceUnit = childMap.get(rel.source_id);
          const targetUnit = childMap.get(rel.target_id);
          // console.log("targetUnit", targetUnit);
          let selectPoint = null;
          if (sourceUnit && targetUnit) {
            if (
              [
                "left",
                "right",
                "top",
                "bottom",
                "center",
                "furthest",
                "first",
                "last",
              ].includes(rel.stick_to?.point) ||
              Number.isInteger(rel.stick_to?.point)
            ) {
              selectPoint = getSelectedPointByIds(
                targetUnit.points,
                rel.stick_to?.point
              );
            }

            if (selectPoint) {
              // console.log("Source Unit", sourceUnit.origin);
              let rel_distance_x = rel.stick_to.distance?.x || 0;
              let rel_distance_y = rel.stick_to.distance?.y || 0;
              sourceUnit.stick_move = {
                x: selectPoint.x + rel_distance_x,
                y: selectPoint.y + rel_distance_y,
                rotate: 0,
              };
            }
            // console.log("After stick_to: ", sourceUnit.stick_move);
          }
        });
      });

      // Update new points according to stick_move
      children.forEach((child) => {
        child.children.forEach((grandson) => {
          grandson.points = getPoints(grandson);
        });
        child.points = getPoints(child);
      });
    }

    let current_instance = {
      id: `DSL_R_${sim_coordinate}_${count}_${unit_base}`,
      archetype_id: unit.id,
      type: "group",
      transform: { x: 0, y: 0 },
      origin: {
        x: -(unit.origin_point?.x || 0),
        y: -(unit.origin_point?.y || 0),
        rotate: -(unit.origin_point?.rotate || 0),
      },
      instanceData: currentData,
      calculated_source: unit_calculated_source,
      children,
    };

    current_instance.points = getPoints(current_instance); // Add points
    return [current_instance];
  }
  calculatePolarTransform(attributes, index) {
    const theta =
      (attributes.theta || 0) * index + (attributes.theta_offset || 0);
    if (attributes.relative_base !== undefined) {
      const base = attributes.relative_base;
      let base_x = 0;
      let base_y = 0;
      if (Array.isArray(base)) {
        base_x = base[0];
        base_y = base[1];
      } else {
        base_x = base.x;
        base_y = base.y;
      }

      const baseRadius = Math.sqrt(base_x * base_x + base_y * base_y);
      let startAngle = 0;

      // 如果基点半径大于等于5，计算起始角度
      if (baseRadius >= 5) {
        // 将 -180 到 180 的范围转换为 0 到 360
        startAngle = (Math.atan2(base_y, base_x) * 180) / Math.PI;
        if (startAngle < 0) {
          startAngle += 360;
        }
      }

      const radius = baseRadius;
      // console.log("base_radius", radius)
      const finalAngle = ((theta + startAngle) * Math.PI) / 180;

      return {
        x: Math.cos(finalAngle) * radius,
        y: Math.sin(finalAngle) * radius,
        theta: theta,
      };
    } else {
      const radius = attributes.r_base || 0;
      const radians = (theta * Math.PI) / 180;
      return {
        x: Math.cos(radians) * radius,
        y: Math.sin(radians) * radius,
        theta,
      };
    }
  }

  calculateCartesianTransform(attributes, index) {
    if (attributes.x) {
      attributes.interval_x = attributes.x;
    }
    if (attributes.y) {
      attributes.interval_y = attributes.y;
    }
    return {
      x: (attributes.interval_x || 0) * index + (attributes.x_offset || 0),
      y: (attributes.interval_y || 0) * index,
    };
  }

  expandSingleUnit(
    unit,
    parentData,
    index = 0,
    repeat_id = 0,
    parentSource = null
  ) {
    // 首先处理 encoded_data
    let unitData = parentData;
    if (unit.encoded_data?.value) {
      if (unit.encoded_data.value.startsWith("parent.")) {
        const dataPath = unit.encoded_data.value.slice(7);
        unitData = parentData?.[dataPath];
      } else {
        unitData = unit.encoded_data.value;
      }
    }
    // 然后使用处理后的数据来计算属性
    const attributes = processDataFunction(
      unit,
      unitData,
      repeat_id,
      parentSource
    );

    const calculated_source = {
      ...unit.source,
      ...attributes,
    };
    let unit_base = unit.id.replace(" ", "_").replace("DSL_", "");

    const baseUnit = {
      id: `${unit_base}`, // `${unit_coordinate}_count_${count}_${unit.id}`
      archetype_id: unit.id,
      type: "element",
      transform: { x: 0, y: 0 },
      attributes,
      instanceData: unitData,
    };

    let single_unit = null;

    if (calculated_source?.type === "PATH") {
      single_unit = this.handlePathUnit(unit, baseUnit, calculated_source);
    } else {
      single_unit = {
        ...baseUnit,
        calculated_source: calculated_source,
        origin: {
          x: -(unit.origin_point?.x || 0),
          y: -(unit.origin_point?.y || 0),
          rotate: -(unit.origin_point?.rotate || 0),
        },
      };
    }
    let points = getPoints(single_unit);

    single_unit.points = points;
    return single_unit;
  }

  handlePathUnit(unit, baseUnit, attributes) {
    // 获取缩放值,优先使用 scale_x/scale_y,没有则使用 scale
    const scale = attributes.scale || 1;
    let scaleX = attributes.scale_x;
    let scaleY = attributes.scale_y;

    attributes.old_scale = scale;
    attributes.old_scale_x = scaleX;
    attributes.old_scale_y = scaleY;

    if (attributes.scale_x === undefined) {
      scaleX = 1;
    }
    if (attributes.scale_y === undefined) {
      scaleY = 1;
    }

    scaleX = scaleX * scale;
    scaleY = scaleY * scale;

    const originX = unit.origin_point?.x || 0;
    const originY = unit.origin_point?.y || 0;

    // 处理 path_d 转换为 path_data
    let pathData = unit.source.path_data;
    if (!pathData && unit.source.path_d) {
      pathData = convertPathDToPathData(unit.source.path_d);
    }

    return {
      ...baseUnit,
      source: {
        ...unit.source,
        path_data: pathData.map((command) => ({
          type: command.type,
          values: command.type.match(/[A-Z]/)
            ? command.values?.map(
                (v, i) =>
                  i % 2 === 0
                    ? (v - originX) * scaleX // 偶数索引用 scaleX
                    : (v - originY) * scaleY // 奇数索引用 scaleY
              )
            : command.values,
        })),
      },
      origin: { x: 0, y: 0, rotate: 0 },
      // 重置 scale 相关属性为 1
      attributes: {
        ...attributes,
        scale: 1,
        scale_x: 1,
        scale_y: 1,
      },
    };
  }
}

function convertPathDToPathData(pathD) {
  if (!pathD) return [];
  return pathD
    .trim()
    .match(/[a-zA-Z][^a-zA-Z]*/g)
    .map((cmd) => {
      const type = cmd[0];

      // 处理 Z/z 命令的特殊情况
      if (type === "Z" || type === "z") {
        return { type: "Z" };
      }

      // 处理其他命令
      const values = cmd
        .substring(1)
        .trim()
        .split(/[\s,]+/)
        .filter((val) => val !== "")
        .map(Number);

      return { type, values };
    });
}

function processDataFunction(unit, unitData, i, parentSource = null) {
  const dataFunction = unit.data_function || {};
  // console.log(unit.data_function, unitData);
  return Object.entries(dataFunction).reduce((acc, [attr, expr]) => {
    // 如果表达式包含 "value." 开头，说明是要访问 unitData 的属性
    let index = i; // 用来表示当前的索引 例如  data_function.scale_x = "scale_begin + index * scale_interval"
    if (expr.includes("total_count")) {
      expr = expr.replace("total_count", "repeat_count");
    }
    if (expr.includes("index")) {
      expr = expr.replace("index", index.toString());
    }
    if (expr.includes("value")) {
      expr = expr.replace("value", "unitData");
    } else if (expr.startsWith("currentData")) {
      expr = expr.replace("currentData", "unitData");
    }

    if (/\brandom\(\)/.test(expr)) {
      expr = expr.replace(/\brandom\(\)/g, "Math.random()");
    }

    expr = expr.replace("Math.Math.", "Math.");

    if (parentSource) {
      // 将 unit.source 中的值注入到表达式中
      // console.log("old expr", expr)
      Object.entries(parentSource).forEach(([key, value]) => {
        expr = expr.replace(new RegExp(`\\b${key}\\b`, "g"), value);
      });
      // console.log("new expr", expr)
    }

    if (expr.indexOf("unitData") >= 0) {
      if (unitData) {
        acc[attr] = eval(expr);
      } else {
        // console.log("no data");
        acc[attr] = 1;
      }
    } else {
      acc[attr] = eval(expr);
    }
    if (attr.startsWith("scale")) {
      // console.log("final result", attr, acc[attr])
    }
    return acc;
  }, {});
}


function get_points_from_svg(svg){

}

function getPoints(instance) {
  let points = [];
  let source = instance.calculated_source || instance.source;

  // 处理不同类型的图形
  if (source?.type === "PATH") {
    // 原有的 PATH 处理逻辑保持不变
    const pathData =
      source?.path_data || convertPathDToPathData(source?.path_d);

    if (!pathData || pathData.length === 0) return null;

    // 提取所有点
    // 提取所有点
    pathData.forEach((command, index) => {
      const values = command.values;
      let prevPoint =
        points.length > 0 ? points[points.length - 1] : { x: 0, y: 0 };

      if (["M", "m", "L", "l", "T", "t"].includes(command.type)) {
        points.push({ x: values[0], y: values[1] });
      } else if (["C", "c"].includes(command.type)) {
        points.push({ x: values[4], y: values[5] });
      } else if (["S", "s", "Q", "q"].includes(command.type)) {
        points.push({ x: values[2], y: values[3] });
      } else if (["A", "a"].includes(command.type)) {
        points.push({ x: values[5], y: values[6] });
      } else if (command.type === "H" || command.type === "h") {
        // 水平线，y 不变
        let newX = values[0];
        if (command.type === "h") {
          newX += prevPoint.x; // 相对路径
        }
        points.push({ x: newX, y: prevPoint.y });
      } else if (command.type === "V" || command.type === "v") {
        // 垂直线，x 不变
        let newY = values[0];
        if (command.type === "v") {
          newY += prevPoint.y; // 相对路径
        }
        points.push({ x: prevPoint.x, y: newY });
      }
    });

    // 处理 "Z" 情况
    const lastCommand = pathData[pathData.length - 1];
    if (lastCommand.type === "Z" && points.length > 0) {
      const firstMove = pathData.find(
        (cmd) => cmd.type === "M" || cmd.type === "m"
      );
      if (firstMove) {
        points[points.length - 1] = {
          x: firstMove.values[0],
          y: firstMove.values[1],
        };
      }
    }
  } else if (source?.type === "RECT" || source?.type === "image") {
    // 处理矩形
    const x = Number(source.x) || 0;
    const y = Number(source.y) || 0;
    const width = Number(source.width) || 0;
    const height = Number(source.height) || 0;

    // 按顺时针添加四个角点
    points = [
      { x: x, y: y }, // 左上
      { x: x + width, y: y }, // 右上
      { x: x + width, y: y + height }, // 右下
      { x: x, y: y + height }, // 左下
    ];
  } else if (source?.type === "CIRCLE") {
    // 处理圆形
    const cx = source.cx || 0;
    const cy = source.cy || 0;
    const r = source.r || 0;

    // 添加圆心和四个方向的点
    points = [
      { x: cx, y: cy }, // 圆心
      { x: cx, y: cy - r }, // 上
      { x: cx + r, y: cy }, // 右
      { x: cx, y: cy + r }, // 下
      { x: cx - r, y: cy }, // 左
    ];
  }

  if (instance.children) {
    instance.children.forEach((child) => {
      childPoints = child.points || [];
      points = points.concat(childPoints);
    });
  }

  let transformed_points = points.map((point) => {
    let { x, y } = point;

    // 1. **原点偏移 (translate + rotate)**
    if (instance.origin) {
      let originX = instance.origin.x || 0;
      let originY = instance.origin.y || 0;
      let originTheta = instance.origin.rotate || 0;

      // 先平移
      x += originX;
      y += originY;

      // 再旋转 (以原点为中心)
      if (originTheta !== 0) {
        let radians = (originTheta * Math.PI) / 180;
        let cosT = Math.cos(radians);
        let sinT = Math.sin(radians);
        let newX = x * cosT - y * sinT;
        let newY = x * sinT + y * cosT;
        x = newX;
        y = newY;
      }
    }

    // 2. **旋转 theta**
    let theta = instance.transform?.theta || 0;
    if (theta !== 0 && instance.calculated_source?.type !== "repeat") {
      let radians = (theta * Math.PI) / 180;
      let cosT = Math.cos(radians);
      let sinT = Math.sin(radians);
      let newX = x * cosT - y * sinT;
      let newY = x * sinT + y * cosT;
      x = newX;
      y = newY;
    }

    // 3. **缩放 (scale_x, scale_y, scale)**
    if (instance.attributes) {
      let scaleX = instance.attributes.scale_x ?? 1;
      let scaleY = instance.attributes.scale_y ?? 1;

      // 如果有统一的 scale 值，则应用
      if (instance.attributes.scale !== undefined) {
        scaleX *= instance.attributes.scale;
        scaleY *= instance.attributes.scale;
      }

      x *= scaleX;
      y *= scaleY;
    }

    // 4. **最外层变换 (translate)**
    if (instance.transform) {
      x += instance.transform.x || 0;
      y += instance.transform.y || 0;
    }

    if (instance.stick_move) {
      x += instance.stick_move.x || 0;
      y += instance.stick_move.y || 0;
    }
    return { x, y };
  });

  return transformed_points;
}

function getSelectedPointByIds(points, ids) {
  if (points.length === 0) return null;

  // 计算特殊点
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const furthestPoint = points.reduce((max, point) =>
    point.x * point.x + point.y * point.y > max.x * max.x + max.y * max.y
      ? point
      : max
  );
  const topPoint = points.reduce((min, point) =>
    point.y < min.y ? point : min
  );
  const rightPoint = points.reduce((max, point) =>
    point.x > max.x ? point : max
  );
  const leftPoint = points.reduce((min, point) =>
    point.x < min.x ? point : min
  );
  const bottomPoint = points.reduce((max, point) =>
    point.y > max.y ? point : max
  );

  const centerPoint = {
    x: (leftPoint.x + rightPoint.x) / 2,
    y: (topPoint.y + bottomPoint.y) / 2,
  };

  // 处理不同类型的 ids
  if (typeof ids === "string") {
    switch (ids) {
      case "first":
        return firstPoint;
      case "last":
        return lastPoint;
      case "furthest":
        return furthestPoint;
      case "top":
        return topPoint;
      case "right":
        return rightPoint;
      case "left":
        return leftPoint;
      case "bottom":
        return bottomPoint;
      case "center":
        return unit.source?.type === "CIRCLE" ? firstPoint : centerPoint;
      default:
        return null;
    }
  } else if (typeof ids === "number") {
    const index = ids < 0 ? points.length - 1 : ids;
    return index >= 0 && index < points.length ? points[index] : null;
  }

  return points[0];
}


// 主函数：从 SVG 元素中提取所有点
function getPointsFromSVG(element, currentTransform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) {
  let points = [];

  // 获取当前元素的 transform 属性
  let transformStr = element.getAttribute('transform') || '';
  let transformMatrix = parseTransform(transformStr);
  // 将当前变换与父变换组合
  let combinedMatrix = matrixMultiply(currentTransform, transformMatrix);

  // 根据元素类型提取点
  if (element.tagName === 'path') {
    let pathData = convertPathDToPathData(element.getAttribute('d') || '');
    let pathPoints = getPointsFromPathData(pathData);
    pathPoints.forEach(point => {
      let transformedPoint = applyTransform(point, combinedMatrix);
      points.push(transformedPoint);
    });
  } else if (element.tagName === 'rect') {
    let rectPoints = getPointsFromRect(element);
    rectPoints.forEach(point => {
      let transformedPoint = applyTransform(point, combinedMatrix);
      points.push(transformedPoint);
    });
  }

  // 递归处理子元素
  Array.from(element.children).forEach(child => {
    let childPoints = getPointsFromSVG(child, combinedMatrix);
    points = points.concat(childPoints);
  });

  return points;
}

// 从 path 的 pathData 中提取点
function getPointsFromPathData(pathData) {
  let points = [];
  let currentPoint = { x: 0, y: 0 }; // 跟踪当前点以处理相对命令

  pathData.forEach(command => {
    let type = command.type;
    let values = command.values;

    if (['M', 'L', 'T'].includes(type)) {
      let x = values[0];
      let y = values[1];
      if (type.toLowerCase() === type) { // 相对命令
        x += currentPoint.x;
        y += currentPoint.y;
      }
      points.push({ x, y });
      currentPoint = { x, y };
    } else if (type === 'C' || type === 'c') {
      let x = values[4];
      let y = values[5];
      if (type === 'c') {
        x += currentPoint.x;
        y += currentPoint.y;
      }
      points.push({ x, y });
      currentPoint = { x, y };
    } else if (['S', 'Q'].includes(type)) {
      let x = values[2];
      let y = values[3];
      if (type.toLowerCase() === type) {
        x += currentPoint.x;
        y += currentPoint.y;
      }
      points.push({ x, y });
      currentPoint = { x, y };
    } else if (type === 'A' || type === 'a') {
      let x = values[5];
      let y = values[6];
      if (type === 'a') {
        x += currentPoint.x;
        y += currentPoint.y;
      }
      points.push({ x, y });
      currentPoint = { x, y };
    } else if (type === 'H' || type === 'h') {
      let x = values[0];
      if (type === 'h') {
        x += currentPoint.x;
      }
      points.push({ x, y: currentPoint.y });
      currentPoint = { x, y: currentPoint.y };
    } else if (type === 'V' || type === 'v') {
      let y = values[0];
      if (type === 'v') {
        y += currentPoint.y;
      }
      points.push({ x: currentPoint.x, y });
      currentPoint = { x: currentPoint.x, y };
    } else if (type === 'Z' || type === 'z') {
      // 闭合路径，不添加新点，但更新当前点为起点（如果需要）
      if (points.length > 0) {
        currentPoint = points[0];
      }
    }
  });

  return points;
}

// 从 rect 元素中提取四个角点
function getPointsFromRect(rect) {
  let x = Number(rect.getAttribute('x') || 0);
  let y = Number(rect.getAttribute('y') || 0);
  let width = Number(rect.getAttribute('width') || 0);
  let height = Number(rect.getAttribute('height') || 0);

  // 顺序：左上、右上、右下、左下，与参考函数一致
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height }
  ];
}

// 解析 transform 属性为变换矩阵
function parseTransform(transformStr) {
  let matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // 单位矩阵
  if (!transformStr) return matrix;

  let commands = transformStr.match(/\w+\([^)]*\)/g);
  if (!commands) return matrix;

  commands.forEach(cmd => {
    let [command, argsStr] = cmd.split('(');
    argsStr = argsStr.replace(')', '');
    let args = argsStr.split(/[\s,]+/).map(Number);

    let cmdMatrix;
    if (command === 'translate') {
      let tx = args[0] || 0;
      let ty = args[1] || 0;
      cmdMatrix = [[1, 0, tx], [0, 1, ty], [0, 0, 1]];
    } else if (command === 'rotate') {
      let theta = args[0] || 0;
      theta = theta * Math.PI / 180; // 转换为弧度
      let cosT = Math.cos(theta);
      let sinT = Math.sin(theta);
      cmdMatrix = [[cosT, -sinT, 0], [sinT, cosT, 0], [0, 0, 1]];
    } else if (command === 'scale') {
      let sx = args[0] || 1;
      let sy = args.length > 1 ? args[1] : sx;
      cmdMatrix = [[sx, 0, 0], [0, sy, 0], [0, 0, 1]];
    }

    if (cmdMatrix) {
      matrix = matrixMultiply(matrix, cmdMatrix);
    }
  });

  return matrix;
}

// 矩阵乘法
function matrixMultiply(a, b) {
  let result = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

// 应用变换矩阵到点
function applyTransform(point, matrix) {
  let x = point.x;
  let y = point.y;
  let xNew = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2];
  let yNew = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2];
  return { x: xNew, y: yNew };
}