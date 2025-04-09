/* eslint-disable */

class DesignDSL {
  constructor(initialDSL = {}, dsl_id = null) {
    this.dsl = JSON.parse(JSON.stringify(initialDSL));
    if (dsl_id) {
      this.dsl_id = dsl_id;
    } else {
      let time_str = "DSL_" + getTimeStrMMDDHHMM();
      this.dsl_id = time_str;
    }

    this.dsl.id = this.dsl_id;

    if (!this.dsl.units) {
      this.dsl.units = [];
    }
    if (!this.dsl.relation) {
      this.dsl.relation = [];
    }
  }

  // 工具方法：通过ID查找单元和其父单元
  findUnitWithParent(id, units = this.dsl.units, parent = null) {
    for (let unit of units) {
      if (unit.id === id) return { unit, parent };
      if (unit.units) {
        const found = this.findUnitWithParent(id, unit.units, unit);
        if (found) return found;
      }
    }
    return null;
  }
  extractData(params) {
    const { target_id = "(Vector 88)", data_key = "scale" } = params;

    console.log(target_id, data_key);

    abstractData(this.dsl, "S_0_Group_49", "fill", 2);
    abstractData(this.dsl, "Vector 88", "scale", 2);

    // console.log("ADD FILL S_0_Group_49 DSL", JSON.stringify(this.dsl, null, 2));

    // console.log(
    //   "AFTER data extraction 2",
    //   JSON.stringify(new_result_dsl, null, 2)
    // );
  }

  addDescription(description_dict) {
    console.log("Description", description_dict);
    function update_unit_description(units) {
      units.forEach((unit) => {
        let unit_id = unit.id;
        if (description_dict[unit_id]) {
          unit.description = description_dict[unit_id];
        }
        if (unit.units) {
          update_unit_description(unit.units);
        }
      });
    }
    update_unit_description(this.dsl.units);
  }

  getAllUnitIds() {
    let ids = []
    function extractIds(unit) {
      if (unit?.id) {
        ids.push(unit.id)
      }
      if (unit?.units) {
        unit.units.forEach((sub_unit) => {
          extractIds(sub_unit)
        })
      }
    }
    extractIds(this.dsl)
    return ids;
  }

  createSingle(params) {
    const {
      id,
      sourceType,
      sourceData,
      targetId = null,
      origin_point = { x: 0, y: 0 },
      data_function = {},
    } = params;

    let processedSourceData = { ...sourceData };

    let newType = sourceType;

    // 处理 SVG 类型，检查是否只包含单个 path

    if (sourceType === "DSL") {
      console.log("Create a unit using DSL.", id, sourceData);
      let newUnit = sourceData.DSL;
      newUnit.id = id;
      console.log("Create a new unit", newUnit);
      this.dsl.units.push(newUnit);
      return this;
    } else if (sourceType === "SVG") {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = sourceData.code.trim();

      // 递归函数查找 path 或 rect 元素

      // 从根元素开始查找
      let elementResult;
      if (tempDiv.children.length === 1) {
        elementResult = findSingleElementWithFilter(tempDiv.children[0]);
      }

      console.log("current temp element", elementResult);

      if (elementResult?.element) {
        console.log("element result", elementResult);
        const element = elementResult.element;

        // 收集元素的所有属性
        const attributes = {};
        Array.from(element.attributes).forEach((attr) => {
          if (attr.name === "xmnls") {
            return;
          }
          if (
            elementResult.type === "PATH" &&
            attr.name !== "d" &&
            attr.name !== "xmlns"
          ) {
            attributes[attr.name] = attr.value;
          } else if (["RECT", "CIRCLE", "TEXT"].includes(elementResult.type)) {
            attributes[attr.name] = attr.value;
          }

        });

        // 设置基本数据
        processedSourceData = {
          type: elementResult.type,
          ...attributes,
        };

        // 如果找到了 filter，添加到处理后的数据中
        if (elementResult.filter) {
          processedSourceData.filter = elementResult.filter;
        }

        // 对于 PATH 类型，额外处理 path 数据
        if (elementResult.type === "PATH") {
          const pathData = element.getAttribute("d");
          if (pathData) {
            processedSourceData.path_d = pathData;
          }
        }
        if (elementResult.type === "TEXT") {
          // 首先获取 text 的内容
          processedSourceData.text_content = element.textContent;

          // 检查是否有 tspan 子元素
          const tspan = element.querySelector("tspan");
          if (tspan) {
            // 如果有 tspan，优先使用 tspan 的 x 和 y
            const tspanX = tspan.getAttribute("x");
            const tspanY = tspan.getAttribute("y");

            if (tspanX) {
              processedSourceData.x = tspanX;
            }
            if (tspanY) {
              processedSourceData.y = tspanY;
            }
            // 如果 tspan 有 text content，也可以单独存储
            processedSourceData.tspan_content = tspan.textContent;
          }

          // 如果没有设置 x 和 y（没有 tspan 或 tspan 没有定义），使用 text 本身的属性
          if (!processedSourceData.x && element.getAttribute("x")) {
            processedSourceData.x = element.getAttribute("x");
          }
          if (!processedSourceData.y && element.getAttribute("y")) {
            processedSourceData.y = element.getAttribute("y");
          }
        }
        // 更新 sourceType
        newType = elementResult.type;
      }
    }

    // 处理普通 PATH 类型
    else if (sourceType === "PATH" && typeof sourceData.d === "string") {
      processedSourceData = {
        ...sourceData,
        path_d: sourceData.d,
      };

      delete processedSourceData.d;
    }

    const newUnit = {
      id,
      type: "single",
      source: {
        type: newType,
        ...processedSourceData,
      },
      origin_point: origin_point,
      data_function: data_function,
    };

    if (targetId) {
      const targetUnit = this.findUnitWithParent(targetId)?.unit;
      if (!targetUnit) {
        throw new Error(`Target unit with id ${targetId} not found`);
      }
      if (!targetUnit.units) {
        targetUnit.units = [];
      }
      targetUnit.units.push(newUnit);
    } else {
      this.dsl.units.push(newUnit);
    }
    return this;
  }

  moveSingleObject() {
    if (this.dsl.units.length === 1) {
      if (this.dsl.units[0]?.type === "single") {
        let only_single_origin = this.dsl.units[0].origin_point;
        this.dsl.origin_point = {
          x: -only_single_origin.x,
          y: -only_single_origin.y
        }
      }
    }
  }

  moveToZero() {
    if (this.dsl.units[0]?.type === "repeat") {
      let origin_move = {
        x: -this.dsl.units[0].origin_point.x,
        y: -this.dsl.units[0].origin_point.y,
      };
      console.log("Origin Move for Zero Origin:", origin_move.x, origin_move.y);
      this.dsl.units.forEach((unit) => {
        unit.origin_point.x += origin_move.x;
        unit.origin_point.y += origin_move.y;
      });
      // this.dsl.origin_point = {
      //   x: -origin_move.x,
      //   y: -origin_move.y,
      // }
    }
  }

  convertToRepeatUnit(params) {
    const {
      targetUnitId, // 要转换的节点ID，可以是单个ID或ID数组
      newParentId, // 新的repeat节点ID
      repeatParams, // 重复节点的参数
      origin_point = { x: 0, y: 0 }, // 原点
      data_function = {},
      base_point = { x: 0, y: 0 }, // 每个元素的中心点
      encoded_data = null,
    } = params;

    // 将 targetUnitId 统一转换为数组形式处理
    const targetIds = Array.isArray(targetUnitId)
      ? targetUnitId
      : [targetUnitId];
    const targetUnits = [];
    let parentUnit = null;

    // 找到所有目标节点
    for (const id of targetIds) {
      const found = this.findUnitWithParent(id);
      if (!found) {
        console.log("ERROR, unit id not find");
        return;
      }
      const { unit: targetUnit, parent } = found;
      // 更新坐标

      console.log("Before Initialize:", targetUnit, targetUnit.origin_point)

      if (!targetUnit.origin_point || !targetUnit.origin_point.x){
        targetUnit.origin_point = {x:0, y:0}
      }
      console.log("Before Repeat:", targetUnit.origin_point)

      targetUnit.origin_point.x = targetUnit.origin_point.x + base_point.x;
      targetUnit.origin_point.y = targetUnit.origin_point.y + base_point.y;

      console.log("After Repeat:", targetUnit.origin_point)

      targetUnits.push(targetUnit);
      // 记录父节点（假设所有目标节点都在同一个父节点下）
      if (!parentUnit) {
        parentUnit = parent;
      }
    }

    // 创建新的repeat节点
    const repeatUnit = {
      id: newParentId,
      type: "repeat",
      origin_point: origin_point,
      source: {
        type: "repeat",
        coordinate_system: repeatParams.coordinateSystem || "cartesian",
        repeat_rule: repeatParams.repeatRule || "even",
        ...repeatParams.source,
      },
      //   repeat_count: repeatParams.repeatCount || "1",
      units: targetUnits, // 将所有目标节点作为子节点
      data_function: data_function,
    };

    if (encoded_data !== null) {
      repeatUnit.encoded_data = encoded_data;
    }

    // 从原位置移除所有目标节点
    if (parentUnit) {
      parentUnit.units = parentUnit.units.filter(
        (u) => !targetIds.includes(u.id)
      );
      parentUnit.units.push(repeatUnit);
    } else {
      this.dsl.units = this.dsl.units.filter((u) => !targetIds.includes(u.id));
      this.dsl.units.push(repeatUnit);
    }
    // this.moveToZero();
    return this;
  }
  getDSL() {
    return this.dsl;
  }
}

const dsl = new DesignDSL();

// 1. 创建单个节点
dsl.createSingle({
  id: "branch_thing",
  sourceType: "SVG",
  sourceData: {
    code: `<g id="Group_2" filter="url(#filter0_d_105_226)"> <path id="Vector_3" d="M94.7065 213L92.6697 62.1166" stroke="#C1C1C1" stroke-width="7.19791"/> <path id="Vector_4" d="M64.1799 106.887L92.5183 87.9927L121.713 105.534" stroke="white" stroke-width="7.19791"/> <path id="Vector_5" d="M77.7986 120.398L93.0439 110.234L108.75 119.671" stroke="white" stroke-width="7.19791"/> <path id="Vector_6" d="M79.5908 137.889L93.4754 128.632L107.778 137.226" stroke="white" stroke-width="7.19791"/> <path id="Vector_7" d="M80.0371 156.934L93.9219 147.677L108.231 156.272" stroke="white" stroke-width="7.19791"/> <path id="Vector_8" d="M75.783 180.557L94.4038 168.133L113.594 179.665" stroke="white" stroke-width="7.19791"/> <path id="Vector_9" d="M85.5869 195.322L94.9012 189.108L104.496 194.874" stroke="white" stroke-width="7.19791"/> <path id="Vector_10" d="M66.6565 88.6058L92.1229 71.1294L118.381 87.3823" stroke="white" stroke-width="7.19791"/> </g>`,
  },
  origin_point: { x: 93, y: 62, rotate: 90 },
});

// 1. 创建单个节点
dsl.createSingle({
  id: "hexagon2",
  sourceType: "SVG",
  sourceData: {
    code: `<g id="Group" filter="url(#filter0_d_105_223)"> <path id="Vector" d="M119.871 155.651L62 122.238V55.4128L119.871 22L177.742 55.4128V122.238L119.871 155.651Z" fill="#873DAA"/> <path id="Vector_2" d="M174.143 120.158L119.871 151.49L65.5989 120.158V57.4931L119.871 26.1536L174.143 57.4931V120.158Z" stroke="white" stroke-width="7.19791"/> </g>`,
  },
  origin_point: { x: -80, y: -410 },
});

function re_render_current_dsl() {
  console.log("No debug");
}

// 2. 将节点转换为重复节点的子节点
dsl.convertToRepeatUnit({
  targetUnitId: "branch_thing",
  newParentId: "repeat_branches",
  repeatParams: {
    coordinateSystem: "polar",
    repeatRule: "even",
    source: {
      theta: 60,
      r_base: 60,
      theta_offset: 90,
    },
    repeatCount: 5,
  },
  origin_point: { x: -200, y: -500 },
});

function findSingleElementWithFilter(element) {
  if (element.tagName.toLowerCase() === "path") {
    const filter = element.getAttribute("filter");
    return {
      type: "PATH",
      element: element,
      filter: filter,
    };
  } else if (element.tagName.toLowerCase() === "rect") {
    const filter = element.getAttribute("filter");
    return {
      type: "RECT",
      element: element,
      filter: filter,
    };
  }
  else if (element.tagName.toLowerCase() === "circle") {
    const filter = element.getAttribute("filter");
    return {
      type: "CIRCLE",
      element: element,
      filter: filter,
    };
  }
  else if (element.tagName.toLowerCase() === "text") {
    const filter = element.getAttribute("filter");
    return {
      type: "TEXT",
      element: element,
      filter: filter,
    };
  }



  if (element.children.length > 0) {
    for (const child of element.children) {
      const result = findSingleElementWithFilter(child);
      if (result?.element) {
        return result;
      }
    }
  }

  return null;
}

function abstractData(svgData, targetId, dataKey, mode) {
  function mergeTrees(tree1, tree2) {
    // 如果其中一个是 null 或 undefined，返回另一个
    if (!tree1) return tree2;
    if (!tree2) return tree1;

    // 如果是数组，递归合并每个元素
    if (Array.isArray(tree1) && Array.isArray(tree2)) {
      return tree1.map((item, index) => mergeTrees(item, tree2[index]));
    }

    // 如果都是对象
    if (typeof tree1 === "object" && typeof tree2 === "object") {
      const result = { ...tree1 };

      // 遍历 tree2 的所有键
      for (const key in tree2) {
        if (key in tree1) {
          // 如果键在两个树中都存在，递归合并
          result[key] = mergeTrees(tree1[key], tree2[key]);
        } else {
          // 如果键只在 tree2 中存在，直接复制
          result[key] = tree2[key];
        }
      }

      return result;
    }

    // 如果不是对象或数组，返回 tree2 的值（覆盖 tree1 的值）
    return tree2;
  }
  // Helper function to get default value for a data key
  function getDefaultValue(source, dataKey) {
    if (dataKey in source) {
      let value = source[dataKey];
      if (typeof value === "number") {
        const fluctuation = (Math.random() - 0.5) * 0.4; // -20% to +20%
        value *= 1 + fluctuation;
      }
      return value;
    }
    return 1; // Default value if not found in source
  }

  // Helper function to find the path to the target unit
  function findPath(units, targetId, path = []) {
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      if (unit.id === targetId) {
        return [...path, { unit, index: i }];
      }
      if ((unit.type === "repeat" || unit.type === "combine") && unit.units) {
        const subPath = findPath(unit.units, targetId, [
          ...path,
          { unit, index: i },
        ]);
        if (subPath) return subPath;
      }
    }
    return null;
  }

  // Validate mode
  if (mode !== 1 && mode !== 2) {
    console.log("MODE", mode);
    throw new Error("Invalid mode: must be 1 or 2");
  }

  let origin_encoded_data = svgData.encoded_data;

  // Find the target unit and its path
  const path = findPath(svgData.units, targetId);
  console.log("Find A Layer PATH", path);
  if (!path) {
    console.log(`Unit with id "${targetId}" not found`);
    console.log("so we don't need to update the DSL");
    return svgData;
  }
  const targetUnit = path[path.length - 1].unit;

  // Initialize data_function if it doesn't exist
  if (!targetUnit.data_function) {
    targetUnit.data_function = {};
  }

  // Set data_function based on mode
  targetUnit.data_function[dataKey] = mode === 1 ? "value" : `value.${dataKey}`;

  // Set encoded_data based on mode
  const defaultValue = getDefaultValue(targetUnit.source, dataKey);
  if (mode === 1) {
    targetUnit.encoded_data = defaultValue;
  } else {
    targetUnit.encoded_data = { [dataKey]: defaultValue };
  }

  // Propagate encoded_data upward
  let currentEncodedData = targetUnit.encoded_data;
  for (let i = path.length - 2; i >= 0; i--) {
    const parent = path[i].unit;
    console.log("current_parent:", i, parent);

    if (parent.type === "repeat") {
      const repeatCount = parent.source.repeat_count;
      currentEncodedData = Array.from({ length: repeatCount }, () => {
        if (typeof currentEncodedData === "number") {
          return currentEncodedData * (0.8 + Math.random() * 0.4);
        } else if (typeof currentEncodedData === "object") {
          const newObj = {};
          for (const key in currentEncodedData) {
            if (typeof currentEncodedData[key] === "number") {
              newObj[key] =
                currentEncodedData[key] * (0.8 + Math.random() * 0.4);
            } else {
              newObj[key] = currentEncodedData[key];
            }
          }
          return newObj;
        }
      });
      parent.encoded_data = currentEncodedData; // 更新父级的 encoded_data
    } else if (parent.type === "combine") {
      // 对于 combine 类型，将当前 encoded_data 嵌套在父级的 encoded_data 中
      parent.encoded_data = {
        [`combine_${path[i + 1].index}`]: currentEncodedData,
      };
      currentEncodedData = parent.encoded_data; // 更新 currentEncodedData
    } else {
      // 对于其他类型，简单传递
      parent.encoded_data = currentEncodedData;
      currentEncodedData = parent.encoded_data;
    }
    parent.encoded_data = null;
  }

  // Handle root level outside the loop
  if (path.length > 0) {
    const rootIndex = path[0].index;
    if (!svgData.encoded_data) {
      svgData.encoded_data = {};
    }

    new_encoded_data = {};
    new_encoded_data[`combine_${rootIndex}`] = currentEncodedData;

    svgData.encoded_data = mergeTrees(origin_encoded_data, new_encoded_data);
  }
  return svgData;
}

function findSinglePathWithFilter(element) {
  // 用于存储找到的结果
  const result = {
    pathElement: null,
    filter: null,
  };

  // 如果是 path 元素，直接返回
  if (element.tagName.toLowerCase() === "path") {
    result.pathElement = element;
    return result;
  }

  // 如果是 g 元素，检查子元素
  if (element.tagName.toLowerCase() === "g") {
    const children = Array.from(element.children);
    // 如果只有一个子元素
    if (children.length === 1) {
      // 检查当前 g 是否有 filter
      const filterAttr = element.getAttribute("filter");
      const childResult = findSinglePathWithFilter(children[0]);

      // 如果找到了 path 并且当前 g 有 filter
      if (childResult.pathElement && filterAttr) {
        childResult.filter = filterAttr;
      }

      return childResult;
    }
  }
  return result;
}

function getTimeStrMMDDHHMM() {
  let d = new Date();
  return (
    (d.getMonth() + 1).toString().padStart(2, "0") +
    d.getDate().toString().padStart(2, "0") +
    "_" +
    d.getHours().toString().padStart(2, "0") +
    d.getMinutes().toString().padStart(2, "0") +
    d.getSeconds().toString().padStart(2, "0")
  );
}

// function abstractData(svgData, targetId, dataKey, mode) {
//   // Helper function to get default value for a data key
//   function getDefaultValue(source, dataKey) {
//     if (dataKey in source) {
//       let value = source[dataKey];
//       if (typeof value === "number") {
//         const fluctuation = (Math.random() - 0.5) * 0.4; // -20% to +20%
//         value *= 1 + fluctuation;
//       }
//       return value;
//     }
//     return 1; // Default value if not found in source
//   }

//   // Helper function to find the path to the target unit
//   function findPath(units, targetId, path = []) {
//     for (let i = 0; i < units.length; i++) {
//       const unit = units[i];
//       if (unit.id === targetId) {
//         return [...path, { unit, index: i }];
//       }
//       if ((unit.type === "repeat" || unit.type === 'combine') && unit.units) {
//         const subPath = findPath(unit.units, targetId, [
//           ...path,
//           { unit, index: i },
//         ]);
//         if (subPath) return subPath;
//       }
//     }
//     return null;
//   }

//   // Validate mode
//   if (mode !== 1 && mode !== 2) {
//     console.log("MODE", mode);
//     throw new Error("Invalid mode: must be 1 or 2");
//   }

//   // Find the target unit and its path
//   const path = findPath(svgData.units, targetId);

//   console.log("Find A Layer PATH", path);
//   if (!path) {
//     console.log(`Unit with id "${targetId}" not found`);
//     console.log("so we don't need to update the DSL")
//     return svgData
//   }
//   const targetUnit = path[path.length - 1].unit; // this is correct

//   // Initialize data_function if it doesn't exist
//   if (!targetUnit.data_function) {
//     targetUnit.data_function = {};
//   }

//   // Set data_function based on mode
//   targetUnit.data_function[dataKey] = mode === 1 ? "value" : `value.${dataKey}`;

//   // Set encoded_data based on mode
//   const defaultValue = getDefaultValue(targetUnit.source, dataKey);
//   if (mode === 1) {
//     targetUnit.encoded_data = defaultValue;
//   } else {
//     targetUnit.encoded_data = { [dataKey]: defaultValue };
//   }

//   // Propagate encoded_data upward
//   let currentEncodedData = targetUnit.encoded_data;
//   for (let i = path.length - 2; i >= 0; i--) { // Changed: i > 0
//     const parent = path[i].unit;
//     console.log("current_parent:", i, parent);
//     if (parent.type === "repeat") {
//       const repeatCount = parent.source.repeat_count;
//       parent_encoded_data = Array.from({ length: repeatCount }, () => {
//         if (typeof currentEncodedData === "number") {
//           return currentEncodedData * (0.8 + Math.random() * 0.4);
//         } else if (typeof currentEncodedData === "object") {
//           const newObj = {};
//           for (const key in currentEncodedData) {
//             if (typeof currentEncodedData[key] === "number") {
//               newObj[key] = currentEncodedData[key] * (0.8 + Math.random() * 0.4);
//             } else {
//               newObj[key] = currentEncodedData[key];
//             }
//           }
//           return newObj;
//         }
//       });
//       currentEncodedData = parent_encoded_data;
//     }
//   }

//   // Handle root level outside the loop
//   if (path.length > 0) {
//     const rootIndex = path[0].index;
//     if (!svgData.encoded_data) {
//       svgData.encoded_data = {};
//     }
//     svgData.encoded_data[`combine_${rootIndex}`] = currentEncodedData;
//   }

//   return svgData;
// }
