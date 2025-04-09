/* eslint-disable */

/**
 * 根据路径表达式从嵌套结构中提取多维数组
 * 路径格式示例: "combine_0.all.combine_1.fill"
 * @param {Object|Array} data - 嵌套的 JSON 数据
 * @param {string} path - 路径表达式
 * @returns {Array} - 提取的多维数组
 */

function reshapeArray(originalArray, targetShape) {
  // 处理一维数组的情况
  // 处理一维数组的情况

  console.log("Original Array", originalArray);
  console.log("Target Shape", targetShape);

  if (targetShape.length === 0) {
    return originalArray[0];
  }

  if (targetShape.length === 1 && targetShape[0] === 0) {
    if (originalArray.length > 0) {
      return originalArray[0];
    }
  }
  if (targetShape.length === 1) {
    const size = targetShape[0];
    if (originalArray.length > size) {
      return originalArray.slice(0, size);
    } else {
      const result = [...originalArray];
      const lastElement = originalArray[originalArray.length - 1];
      while (result.length < size) {
        const getRandomElement = (array) => {
          const randomIndex = Math.floor(Math.random() * array.length);
          return originalArray[randomIndex];
        };

        result.push(getRandomElement(originalArray));
      }
      return result; // 这里已经返回了
    }
  }

  // 获取最后一个维度的大小
  const lastDimSize = targetShape[targetShape.length - 1];
  // ... 后续代码

  // 处理原始数组
  let processedArray;
  if (originalArray.length > lastDimSize) {
    processedArray = originalArray.slice(0, lastDimSize);
  } else {
    processedArray = [...originalArray];
    const lastElement = originalArray[originalArray.length - 1];
    while (processedArray.length < lastDimSize) {
      processedArray.push(lastElement);
    }
  }

  // 递归构建多维数组
  function buildArray(dimensions) {
    console.log("Dimensions", dimensions);
    if (dimensions.length === 0) {
      return [];
    }
    if (dimensions.length === 1) {
      return [...processedArray];
    }

    const result = [];
    const subArray = buildArray(dimensions.slice(1));
    for (let i = 0; i < dimensions[0]; i++) {
      result.push(JSON.parse(JSON.stringify(subArray)));
    }
    return result;
  }

  return buildArray(targetShape);
}
// 测试示例
// console.log(reshapeArray([1, 2, 3, 4], [2, 2]));
// // 输出: [[1, 2], [1, 2]]

// console.log(reshapeArray([1, 2], [2, 3]));
// // 输出: [[1, 2, 2], [1, 2, 2]]

// console.log(reshapeArray([1, 2, 3, 4, 5], [2, 2, 2]));
// // 输出: [[[1, 2], [1, 2]], [[1, 2], [1, 2]]]

function update_data_value(
  data,
  target_id = "S_0_Polygon 9",
  data_key = "fill",
  value_info = null,
  value_data_function = null
) {
  let data_path = findDataPathStr(data, target_id);

  let data_path_repeat_size = findDataPathWithRepeatSize(data, target_id);

  console.log("Data Key Path", data_path, data_path_repeat_size);

  let unit = findUnitById(data, (target_id = target_id));

  console.log("Update encoded_data", unit, data_key, value_info);

  if (unit && value_data_function) {
    let try_val = value_data_function.replace('index', ' 0 ')
            .replace("total_count", ' 10 ')
    
    if (/\brandom\(\)/.test(try_val)) {  
      try_val = try_val.replace(/\brandom\(\)/g, "Math.random()");  
    }
    
    try_val = try_val.replace("Math.Math.", "Math.")

    console.log("Try expression:", try_val)    

    let try_result = eval(try_val)


    console.log("Try result", try_val, try_result);
    if (!Number.isNaN(try_result)) {
      console.log("Try result", try_val, try_result);
      let key = data_key;
      if (data_key.startsWith("source.")) {
        key = data_key.replace("source.", "");
      }
      unit.data_function[key] = value_data_function;
      return;
    }
  }

  if (unit && value_info.length == 1) {
    console.log("Update data information", unit, data_key, value_info[0]);
    let key = data_key;
    if (data_key.startsWith("source.")) {
      key = data_key.replace("source.", "");
    }
    console.log("KEY", key, "origin");
    unit.source[key] = value_info[0];
    console.log(unit.source[key]);
    if (unit.data_function && unit.data_function[key]) {
      delete unit.data_function[key];
    }
    return;
  }

  let final_data_key = data_key;

  if (data_key.indexOf(".") > -1) {
    final_data_key = data_key.split(".")[1];
  }
  console.log("The update value is more than 1");
  if (unit.data_function) {
    unit.data_function[final_data_key] = `value['${final_data_key}']`; // `value.${data_key}`;
  }

  let repeat_size = data_path_repeat_size.repeatSizes;

  let shaped_data = reshapeArray(
    (originalArray = value_info),
    (targetShape = repeat_size)
  );

  console.log("Final Data", shaped_data);
  console.log("Shaped data size", getArrayDimensions(shaped_data));

  console.log("DSL content", JSON.stringify(data, null, 2));
  console.log(`Data Path of ${target_id}:`, data_path);

  let fill_data_path = data_path + "." + final_data_key;

  if (!fill_data_path.startsWith("combine_")) {
    fill_data_path = "combine_0." + fill_data_path;
  }
  console.log("fill_data_path", fill_data_path);
  if (!data.encoded_data) {
    data.encoded_data = {};
  }
  console.log("encoded_data", data.encoded_data);

  let encoded_data = setEncodedDataUsingValues(
    data.encoded_data,
    fill_data_path,
    shaped_data
  );
  data.encoded_data = encoded_data;
  console.log("updated", data.encoded_data);
  console.log(
    `After Update ${value_info} to target_id`,
    getSimValuesFromEncoded(data.encoded_data, fill_data_path)
  );
}

/**
 * 根据路径表达式将多维数组写入嵌套结构
 * 路径格式示例: "combine_0.all.combine_1.fill"
 * @param {Object|Array} data - 嵌套的 JSON 数据
 * @param {string} path - 路径表达式
 * @param {Array} values - 要写入的多维数组
 */
// function setEncodedDataUsingValues(data, path, values) {
//   const parts = path.split(".");
//   console.log("Setting encoding data", data, path, values)

//   // function _setRecursive(current, remainingParts, valueStack) {
//   //   if (remainingParts.length === 0) {
//   //     return;
//   //   }

//   //   const part = remainingParts[0];
//   //   const nextParts = remainingParts.slice(1);

//   //   if (part === "all") {
//   //     if (Array.isArray(current)) {
//   //       current.forEach((item, index) => {
//   //         if (index < valueStack.length) {
//   //           _setRecursive(item, nextParts, valueStack[index]);
//   //         }
//   //       });
//   //     }
//   //     return;
//   //   }

//   //   if (typeof current === "object" && current !== null) {
//   //     if (nextParts.length > 0) {
//   //       if (!current[part]) {
//   //         current[part] = nextParts[0] === "all" ? [] : {};
//   //       }
//   //       _setRecursive(current[part], nextParts, valueStack);
//   //     } else {
//   //       current[part] = valueStack;
//   //     }
//   //   }
//   // }

//   function _setRecursive(current, remainingParts, valueStack) {
//     if (remainingParts.length === 0) {
//       return;
//     }

//     const part = remainingParts[0];
//     const nextParts = remainingParts.slice(1);

//     if (part === "all") {
//       if (Array.isArray(current)) {
//         current.forEach((item, index) => {
//           // 确保数组中的每一项都是对象
//           if (typeof item !== "object" || item === null) {
//             current[index] = {};
//           }

//           if (nextParts.length === 1) {
//             // 直接赋值属性
//             current[index][nextParts[0]] = valueStack[index];
//           } else {
//             // 继续递归
//             _setRecursive(current[index], nextParts, valueStack[index]);
//           }
//         });
//       }
//       return;
//     }

//     if (typeof current === "object" && current !== null) {
//       if (nextParts.length > 0) {
//         if (!current[part]) {
//           current[part] = nextParts[0] === "all" ? [] : {};
//         }
//         _setRecursive(current[part], nextParts, valueStack);
//       } else {
//         current[part] = valueStack;
//       }
//     }
//   }

//   const structuredValues = prepareValues(parts, values);
//   _setRecursive(data, parts, structuredValues);
// }

// function setEncodedDataUsingValues(data, path, values) {
//   const parts = path.split(".");
//   console.log("Setting encoding data", data, path, values);

//   function _setRecursive(current, remainingParts, valueStack) {
//     if (remainingParts.length === 0) {
//       return;
//     }

//     const part = remainingParts[0];
//     const nextParts = remainingParts.slice(1);

//     if (part === "all") {
//       if (!Array.isArray(current)) {
//         return;
//       }

//       // **确保数组至少有 values.length 个元素，并初始化为空对象**
//       while (current.length < valueStack.length) {
//         current.push({});
//       }

//       current.forEach((item, index) => {
//         if (typeof item !== "object" || item === null) {
//           current[index] = {};
//         }

//         if (nextParts.length === 1) {
//           // **直接赋值 scale 等属性**
//           current[index][nextParts[0]] = valueStack[index];
//         } else {
//           // **继续递归**
//           _setRecursive(current[index], nextParts, valueStack[index]);
//         }
//       });
//       return;
//     }

//     if (typeof current === "object" && current !== null) {
//       if (!current[part]) {
//         current[part] = nextParts[0] === "all" ? [] : {};
//       }
//       _setRecursive(current[part], nextParts, valueStack);
//     }
//   }

//   _setRecursive(data, parts, values);
// }

function setEncodedDataUsingValues(data, path, values) {
  function merge(obj1, obj2) {
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      return obj1
        .map((item, index) =>
          index < obj2.length ? merge(item, obj2[index]) : item
        )
        .concat(obj2.slice(obj1.length));
    } else if (
      typeof obj1 === "object" &&
      obj1 !== null &&
      typeof obj2 === "object" &&
      obj2 !== null
    ) {
      let result = { ...obj1 };
      for (let key in obj2) {
        result[key] = key in obj1 ? merge(obj1[key], obj2[key]) : obj2[key];
      }
      return result;
    }
    return obj2;
  }

  let new_data = setEncodedDataUsingValues_runner({}, path, values);
  console.log("new_data", new_data);
  let merged = merge(new_data, data);
  console.log("merged", merged);
  return merged;
}

function setEncodedDataUsingValues_runner(baseDict, path, values) {
  function _setNestedValue(currentDict, parts, values, depth = 0) {
    if (parts.length === 0) {
      return Array.isArray(values) ? values[0] : values;
    }

    const currentKey = parts[0];
    const remainingParts = parts.slice(1);

    // 处理 'all' 关键字
    if (currentKey === "all") {
      if (remainingParts.length === 0) {
        return values;
      }

      return values.map((value) => {
        const nextDict = {};
        return _setNestedValue(nextDict, remainingParts, [value], depth + 1);
      });
    }

    // 处理普通键
    if (remainingParts.length === 0) {
      currentDict[currentKey] = Array.isArray(values) ? values[0] : values;
    } else {
      if (!(currentKey in currentDict)) {
        currentDict[currentKey] = {};
      }
      currentDict[currentKey] = _setNestedValue(
        currentKey in currentDict ? currentDict[currentKey] : {},
        remainingParts,
        values,
        depth + 1
      );
    }

    return currentDict;
  }

  // 分割路径
  const pathParts = path.split(".");

  // 处理根级别
  if (pathParts[0] === "all") {
    return values.map((value) => {
      const nextDict = {};
      return _setNestedValue(nextDict, pathParts.slice(1), [value]);
    });
  } else {
    return _setNestedValue(baseDict, pathParts, values);
  }
}

// function setEncodedDataUsingValues(data, path, values) {
//   const parts = path.split('.');
//   console.log("Setting encoding data", JSON.stringify(data, null, 2), path, values);

//   function _setRecursive(current, parts, valueStack) {
//     if (parts.length === 0) return;

//     const part = parts[0];
//     const remainingParts = parts.slice(1);
//     const nextPart = remainingParts[0];

//     // 初始化当前层
//     if (current[part] === undefined) {
//       // 如果下一部分是'all'，则初始化为数组
//       if (nextPart === 'all') {
//         current[part] = [];
//       } else if (/^combine_\d+$/.test(part)) {
//         current[part] = {};
//       } else {
//         current[part] = (part === 'all') ? [] : {};
//       }
//     }

//     const currentValue = current[part];

//     if (part === 'all') {
//       if (!Array.isArray(currentValue)) {
//         current[part] = [];
//       }
//       const arr = current[part];
//       // 确保数组长度与valueStack一致
//       while (arr.length < valueStack.length) arr.push({});
//       // 遍历每个元素处理后续路径
//       arr.forEach((item, index) => {
//         if (typeof item !== 'object' || item === null) {
//           arr[index] = {};
//         }
//         const subValue = Array.isArray(valueStack) ? valueStack[index] : valueStack;
//         _setRecursive(arr[index], remainingParts, subValue);
//       });
//     } else {
//       if (remainingParts.length === 0) {
//         // 到达路径末端，设置值
//         current[part] = valueStack;
//       } else {
//         _setRecursive(currentValue, remainingParts, valueStack);
//       }
//     }
//   }

//   _setRecursive(data, parts, values);
// }
// 测试用例
function test_new_set() {
  let data = { combine_0: [] };
  let path = "combine_0.all.scale";
  let values = [10, 20, 30];

  setEncodedDataUsingValues(data, path, values);
  console.log("test new set", JSON.stringify(data, null, 2));

  data = {};
  setEncodedDataUsingValues(data, "combine_0.all.combine_1.fill", [
    "#FF0000",
    "#FF7F00",
    "#FFFF00",
  ]);

  console.log("test new set222", JSON.stringify(data, null, 2));

  // 测试用例
  const obj1 = {
    combine_0: [
      { combine_1: { fill: "#FF0000" } },
      { combine_1: { fill: "#FF7F00" } },
      { combine_1: { fill: "#FFFF00" } },
    ],
  };

  const obj2 = {
    combine_0: [
      { combine_2: { fill: "#FF0000" } },
      { combine_2: { fill: "#FF7F00" } },
      { combine_2: { fill: "#FFFF00" } },
    ],
  };

  // console.log(JSON.stringify(merge(obj1, obj2), null, 2));
}

test_new_set();

function getSimValuesFromEncoded(data, path) {
  const parts = path.split(".");

  function _getRecursive(current, remainingParts) {
    if (remainingParts.length === 0) {
      return current;
    }

    const part = remainingParts[0];
    const nextParts = remainingParts.slice(1);

    if (part === "all") {
      if (Array.isArray(current)) {
        return current.map((item) => _getRecursive(item, nextParts));
      }
      return [];
    }

    if (typeof current === "object" && current !== null) {
      if (Array.isArray(current)) {
        return current.map((item) => _getRecursive(item, [part, ...nextParts]));
      }
      return _getRecursive(current[part], nextParts);
    }

    return null;
  }

  const result = _getRecursive(data, parts);
  return flatten(result);
}

/**
 * 将嵌套数组展平为一维数组
 * @param {Array} arr - 嵌套数组
 * @returns {Array} - 展平后的一维数组
 */
function flatten(arr) {
  return arr.reduce((acc, item) => {
    if (Array.isArray(item)) {
      return acc.concat(flatten(item));
    }
    return acc.concat(item);
  }, []);
}

/**
 * 根据路径表达式准备多维数组
 * @param {Array} parts - 路径分割后的数组
 * @param {Array} values - 原始值数组
 * @returns {Array} - 结构化后的多维数组
 */
function prepareValues(parts, values) {
  if (parts.length === 0) {
    return values;
  }

  const part = parts[0];
  if (part === "all") {
    if (!Array.isArray(values)) {
      throw new Error("Values must be an array when using 'all' in path");
    }
    return values.map((value) => prepareValues(parts.slice(1), value));
  }

  // 如果当前部分不是 "all"，则直接返回 values，并继续处理剩余的 parts
  return prepareValues(parts.slice(1), values);
}

function test_get_set_data() {
  // 示例数据（对应你提供的 JSON 结构）
  let test_data = {
    combine_0: [
      {
        combine_1: { fill: "#FF0000" },
        combine_0: [
          { combine_0: [{ scale: 1.0 }, { scale: 1.1 }] },
          { combine_0: [{ scale: 1.2 }, { scale: 1.3 }] },
        ],
      },
      {
        combine_1: { fill: "#00FF00" },
        combine_0: [
          { combine_0: [{ scale: 2.0 }, { scale: 2.1 }] },
          { combine_0: [{ scale: 2.2 }, { scale: 2.3 }] },
        ],
      },
    ],
  };

  // 提取 fill 值
  console.log(
    getSimValuesFromEncoded(test_data, "combine_0.all.combine_1.fill")
  );
  // 输出: ['#FF0000', '#00FF00']

  // 提取三维 scale 数组
  console.log(
    getSimValuesFromEncoded(
      test_data,
      "combine_0.all.combine_0.all.combine_0.all.scale"
    )
  );
  // 输出: [[[1.0, 1.1], [1.2, 1.3]], [[2.0, 2.1], [2.2, 2.3]]]

  // 修改 fill 值
  setEncodedDataUsingValues(test_data, "combine_0.all.combine_1.fill", [
    "#0000FF",
    "#FFFF00",
  ]);
  console.log(
    "After Update ['#0000FF', '#FFFF00']",
    getSimValuesFromEncoded(test_data, "combine_0.all.combine_1.fill")
  );
  // 输出: ['#0000FF', '#FFFF00']

  console.log(JSON.stringify(test_data, null, 2));

  // 修改三维 scale 数组
  const newScales = [
    [
      [1.5, 1.6],
      [1.7, 1.8],
    ],
    [
      [2.5, 2.6],
      [2.7, 2.8],
    ],
  ];
  setEncodedDataUsingValues(
    test_data,
    "combine_0.all.combine_0.all.combine_0.all.scale",
    newScales
  );
  console.log(
    getSimValuesFromEncoded(
      test_data,
      "combine_0.all.combine_0.all.combine_0.all.scale"
    )
  );
  // 输出: [[[1.5, 1.6], [1.7, 1.8]], [[2.5, 2.6], [2.7, 2.8]]]

  // 测试数据 - 没有 combine_1 的结构
  let test_data2 = {
    combine_0: [
      {
        combine_0: [
          { combine_0: [{ scale: 1.0 }, { scale: 1.1 }] },
          { combine_0: [{ scale: 1.2 }, { scale: 1.3 }] },
        ],
      },
      {
        combine_0: [
          { combine_0: [{ scale: 2.0 }, { scale: 2.1 }] },
          { combine_0: [{ scale: 2.2 }, { scale: 2.3 }] },
        ],
      },
    ],
  };

  // 要插入的值
  const fillValues = ["#FF0000", "#00FF00"];

  // 使用 setEncodedDataUsingValues 插入新的 combine_1.fill 结构
  setEncodedDataUsingValues(
    test_data2,
    "combine_0.all.combine_1.fill",
    fillValues
  );

  // 验证插入结果
  console.log(
    getSimValuesFromEncoded(test_data2, "combine_0.all.combine_1.fill")
  );
  // 输出: ['#FF0000', '#00FF00']

  // 查看完整结构
  console.log("SET DATA ???", JSON.stringify(test_data2, null, 2));
}

function findUnitById(data, target_id) {
  console.log("Find target id", data, target_id);
  // 如果当前节点就是目标
  if (data.id === target_id) {
    return data;
  }

  // 如果没有子节点，返回 null
  if (!data.units) {
    return null;
  }

  // 遍历所有子节点
  for (let unit of data.units) {
    const result = findUnitById(unit, target_id);
    if (result) {
      return result;
    }
  }
  return null;
}

function findParentUnitById(data, target_id, parent = null) {
  // 如果当前节点就是目标
  if (data.id === target_id) {
    return parent; // 返回父节点
  }

  // 如果没有子节点，返回 null
  if (!data.units) {
    return null;
  }

  // 遍历所有子节点
  for (let unit of data.units) {
    const result = findParentUnitById(unit, target_id, data); // 将当前节点作为父节点传递
    if (result) {
      return result;
    }
  }
  return null;
}

function findDataPathWithRepeatSize(data, target_id) {
  function getPath(unit) {
    let path = [];
    let repeatSizes = []; // 用于记录repeat节点的repeat_time

    // 如果当前节点是目标 vector
    if (unit.id === target_id) {
      return { path, repeatSizes };
    }

    if (!unit.units) {
      return null;
    }

    // 遍历子节点
    for (let i = 0; i < unit.units.length; i++) {
      const childUnit = unit.units[i];
      const childResult = getPath(childUnit);

      if (childResult !== null) {
        // 根据父节点类型添加路径
        if (unit.type === "repeat") {
          path.unshift("all");
          // 记录repeat节点的source.repeat_time
          if (unit.source && typeof unit.source.repeat_count !== "undefined") {
            repeatSizes.push(unit.source.repeat_count);
          } else {
            repeatSizes.push(0); // 如果没有repeat_time，默认值为0
          }
        } else if (unit.type === "combine") {
          path.unshift(`combine_${i}`);
        }
        return {
          path: [...path, ...childResult.path],
          repeatSizes: [...repeatSizes, ...childResult.repeatSizes],
        };
      }
    }

    return null;
  }

  const result = getPath(data);
  if (result === null) {
    return {
      pathStr: "",
      repeatSizes: [],
    };
  }

  return {
    pathStr: result.path.join("."),
    repeatSizes: result.repeatSizes,
  };
}

function findDataPathStr(data, target_id) {
  function getPath(unit) {
    let path = [];

    // 如果当前节点是目标 vector
    if (unit.id === target_id) {
      return path;
    }

    if (!unit.units) {
      return null;
    }

    // 遍历子节点
    for (let i = 0; i < unit.units.length; i++) {
      const childUnit = unit.units[i];
      const childPath = getPath(childUnit);

      if (childPath !== null) {
        // 根据父节点类型添加路径
        if (unit.type === "repeat") {
          path.unshift("all");
        } else if (unit.type === "combine") {
          path.unshift(`combine_${i}`);
        }
        return [...path, ...childPath];
      }
    }

    return null;
  }

  const path = getPath(data);
  return path.join(".");
}

function getArrayDimensions(arr) {
  if (!Array.isArray(arr)) return [];

  const dimensions = [];

  function checkDimension(currentArr, depth = 0) {
    if (!Array.isArray(currentArr)) return depth;

    if (dimensions.length <= depth) {
      dimensions.push(currentArr.length);
    } else if (dimensions[depth] !== currentArr.length) {
      throw new Error(`Inconsistent array length at depth ${depth}`);
    }

    const subDepths = currentArr.map((item) => checkDimension(item, depth + 1));
    const maxDepth = Math.max(...subDepths);

    if (subDepths.some((d) => d !== maxDepth)) {
      throw new Error(`Inconsistent array depth at depth ${depth}`);
    }

    return maxDepth;
  }

  try {
    checkDimension(arr);
    return dimensions;
  } catch (e) {
    console.error(e.message);
    return null;
  }
}
