/* eslint-disable */

function get_dsl_content(svg_string, analysisResult, exists_dsl_instance) {
  const currentdsl = new DesignDSL();
  console.log("Analysis Result", analysisResult);

  let repeat_id = analysisResult.base_object;
  let create_id = repeat_id;
  let parent_id = "(" + create_id + ")";


  if (["non_uniform_scale", 'single_direction_scale', 'translate_and_single_scale'].includes(analysisResult.type)) {
    let base_point = analysisResult.origin;
    let repeat_element = findElementFromSVGById(svg_string, repeat_id);
    console.log("single object", repeat_element.slice(0, 100));
    let data_function = {scale_y: "value.scale_y", scale_x: "scale_begin + index * scale_interval"}
    if (analysisResult.type === "non_uniform_scale"){
      data_function.scale_y = "value.scale_y" // "random() + 0.5";
    }

    currentdsl.createSingle({
      id: create_id,
      sourceType: "SVG",
      sourceData: {
        code: repeat_element,
      },
      data_function: data_function,
    });

    let repeat_source = {
      // x: 0,
      // y: 0,
      scale_begin: 1,
      scale_direction: 'x',
      scale_center: analysisResult.count_center,
      scale_interval: analysisResult.scale_interval,
      repeat_count: parseInt(analysisResult.count),
    }

    if (analysisResult.type === 'translate_and_single_scale'){
      repeat_source.interval_x = analysisResult.translation[0];
      repeat_source.interval_y = analysisResult.translation[1];
    }

    currentdsl.convertToRepeatUnit({
      targetUnitId: create_id,
      newParentId: parent_id,
      repeatParams: {
        coordinateSystem: "cartesian",
        repeatRule: "non_uniform_scale",
        source: repeat_source
      },
      origin_point: { x: -base_point[0], y: -base_point[1] },
      base_point: { x: base_point[0], y: base_point[1] },
      // encoded_data: analysisResult.scale_factors,
    });
    // 通过set data 的方式来做
    let value_info = analysisResult.scale_factors.map(d => d.scale_y)
    console.log("value_info", value_info)
    update_data_value(
      currentdsl.dsl,
      target_id = create_id,
      data_key = 'scale_y',
      value_info = value_info
    )
  }
  else if (analysisResult.type === "translate") {
    let base_point = [0, 0]
    if (analysisResult.C_0){
      base_point = analysisResult.C_0;
    }

    if (repeat_id in exists_dsl_instance) {
      let repeat_sub_dsl = exists_dsl_instance[repeat_id];
      currentdsl.createSingle({
        id: create_id,
        sourceType: "DSL",
        sourceData: {
          DSL: repeat_sub_dsl,
        },
      });
    } else {
      console.log("translate");
      let repeat_element = findElementFromSVGById(svg_string, repeat_id);
      console.log("Create single dsl object", repeat_element.slice(0, 100));
      currentdsl.createSingle({
        id: create_id,
        sourceType: "SVG",
        sourceData: {
          code: repeat_element,
        },
        data_function: { scale: "value" },
      });
    }
    console.log("REPEAT", analysisResult.count);

    currentdsl.convertToRepeatUnit({
      targetUnitId: create_id,
      newParentId: parent_id,
      repeatParams: {
        coordinateSystem: "cartesian",
        repeatRule: "even",
        source: {
          interval_x: analysisResult.interval[0],
          interval_y: analysisResult.interval[1],
          repeat_count: parseInt(analysisResult.count),
        },
      },
      origin_point: { x: -base_point[0], y: -base_point[1] },
      base_point: { x: base_point[0], y: base_point[1] },
      encoded_data: analysisResult.scales,
    });
  } else if (analysisResult.type === "rotate") {
    console.log("rotate");
    let center_point = analysisResult.rotate_center;
    let base_point = analysisResult.B_0;
    console.log("base_point", base_point);
    if (repeat_id in exists_dsl_instance) {
      let repeat_sub_dsl = exists_dsl_instance[repeat_id];
      console.log("repeat_sub_dsl", repeat_sub_dsl)
      currentdsl.createSingle({
        id: create_id,
        sourceType: "DSL",
        sourceData: {
          DSL: repeat_sub_dsl,
        },
      });
    } else {
      let repeat_element = findElementFromSVGById(
        svg_string,
        (targetId = repeat_id)
      );

      currentdsl.createSingle({
        id: create_id,
        sourceType: "SVG",
        sourceData: {
          code: repeat_element,
        },
        // origin_point: { x: base_point[0], y: base_point[1] },
        data_function: { scale: "value" },
      });
    }

    let encoded_data = null;

    if (analysisResult.need_rescale) {
      encoded_data = analysisResult.scales;
    }
    let relative_base = [
      base_point[0] - center_point[0],
      base_point[1] - center_point[1],
    ];

    console.log("Base_point_relative", relative_base);

    currentdsl.convertToRepeatUnit({
      targetUnitId: repeat_id,
      newParentId: parent_id,
      repeatParams: {
        coordinateSystem: "polar",
        repeatRule: "even",
        source: {
          theta: parseInt(analysisResult.degree),
          relative_base: {x: relative_base[0], y: relative_base[1]},
          repeat_count: parseInt(analysisResult.count),
        },
        // repeatCount: analysisResult.count,
      },
      base_point: { x: base_point[0], y: base_point[1] },
      origin_point: { x: -center_point[0], y: -center_point[1] },
      encoded_data: encoded_data,
    });
  }

  analysisResult.single_ids.forEach((single_id, i) => {
    if (single_id in exists_dsl_instance) {
      let repeat_sub_dsl = exists_dsl_instance[single_id];
      console.log("repeat_sub_dsl", repeat_sub_dsl)
      currentdsl.createSingle({
        id: single_id,
        sourceType: "DSL",
        sourceData: {
          DSL: repeat_sub_dsl,
        },
      });
    } else {
      let current_element = findElementFromSVGById(
        svg_string,
        (targetId = single_id)
      );

      currentdsl.createSingle({
        id: single_id,
        sourceType: "SVG",
        sourceData: {
          code: current_element,
        },
      });
    }

    // let current_element = findElementFromSVGById(
    //   svg_string,
    //   (targetId = single_id)
    // );
    // currentdsl.createSingle({
    //   id: `DSL_S_${i}_${single_id}`,
    //   sourceType: "SVG",
    //   sourceData: {
    //     code: current_element,
    //   },
    // });
  });

  currentdsl.moveToZero();

  console.log("First generate dsl", currentdsl.getDSL());
  return currentdsl;
}

async function get_dsl_from_analysis_result(svg_string, analysisResult){
    const exists_dsl_instance = {};
    let defs_all = ''
    let use_global_dsl = false;
    let use_cached_dsl = true;

    console.log('Current sub instances key', Object.keys(analysisResult.sub_instance))
    console.log("analysisResult", analysisResult)

    let calculation_order = Object.keys(analysisResult.sub_instance).reverse()
    if (analysisResult.instance_order){
      console.log("We user correct instance order", analysisResult.instance_order);
      calculation_order = analysisResult.instance_order.reverse();
    }
    if (use_cached_dsl){
      console.log("Use cached dsl");
      let repeat_id = analysisResult.base_object;
      let ids_need_to_load = []
      if (repeat_id){
        ids_need_to_load.push(repeat_id);
      }

      ids_need_to_load.push(...analysisResult.single_ids)

      console.log("ids_need_to_load", ids_need_to_load)

      let count_ids = ids_need_to_load.length
      
      for (let i = 0; i < count_ids; i++){
        let load_id = ids_need_to_load[i];
        if (load_id?.startsWith("DSL_RENDERED_INSTANCE_")){
          let cached_dsl = await get_cached_dsl(load_id);
          console.log("Cached dsl", cached_dsl);
  
          let selected_dsl = cached_dsl.dsl.dsl.dsl
          exists_dsl_instance[load_id] = selected_dsl;
          let cached_represent_points = cached_dsl.dsl.represent_points;
          let svg_represent_points = DSL_REPRESENT_POINTS[load_id];
          console.log("Exists DSL instance", exists_dsl_instance);

          console.log("Represent Points", cached_represent_points, svg_represent_points);
  
          let transform_info = computeGeneralTransformation(
            srcPoints = cached_represent_points,
            dstPoints = svg_represent_points
          )
  
          if (selected_dsl.units[0].type === 'single'){
            selected_dsl.units.forEach(unit=>{
              unit.origin_point = {
                x: unit.origin_point.x - transform_info.translation.x,
                y: unit.origin_point.x - transform_info.translation.y
              }
            })
          }
          else{
            if (!selected_dsl.origin_point){
              selected_dsl.origin_point = {
                x: 0,
                y: 0
              }
            }
            selected_dsl.origin_point = {
              x: selected_dsl.origin_point.x - transform_info.translation.x,
              y: selected_dsl.origin_point.y - transform_info.translation.y
            }
          }
          console.log("Represent Points", cached_represent_points, svg_represent_points);
          console.log("Transform information from cached and figma", transform_info);
          defs_all += cached_dsl.dsl.defs_string; // Add previous dsl defs
        }
      }      
      console.log("Existing dsl needed to use!", exists_dsl_instance)
    }
    else if (calculation_order.length > 0) {
      calculation_order
      .forEach((instance_id, i) => {
        if (global_dsl_manager[instance_id] && use_global_dsl) {
          console.log("directly comes from the global dsl manager");
          exists_dsl_instance[instance_id] = global_dsl_manager[instance_id].dsl.getDSL();
          defs_all += global_dsl_manager[instance_id].defs_string;
        }
        else{
          console.log("Recalculate", i, instance_id);
          exists_dsl_instance[instance_id] = get_dsl_content(
            svg_string,
            analysisResult.sub_instance[instance_id],
            exists_dsl_instance
          ).getDSL();
          console.log("calculate result", exists_dsl_instance[instance_id])
        }
      });
    }
    console.log("Exists_dsl_instance", exists_dsl_instance);
    console.log(exists_dsl_instance);
    const currentdsl = get_dsl_content(
      svg_string,
      analysisResult,
      exists_dsl_instance
    );
    console.log("CURRENT_DSL", currentdsl.getDSL());
    // console.log("CURRENT_DSL", JSON.stringify(currentdsl.getDSL(), null, 2));

    console.log("Extract DATA")
    // currentdsl.extractData(target_id = "Vector 88", data_key = "scale");
    let defs_string = findDefsFromSVG(svg_string);
    let dsl_result = {
        'dsl': currentdsl,
        'defs_string': defs_all + defs_string
    }
    return dsl_result;
}

function add_annotation_layer(){
  document.querySelector("#svg-container")
    .querySelector("svg")
    .appendChild(
      document.createElementNS("http://www.w3.org/2000/svg", "g")
    ).setAttribute("id", "annotation-layer");
}

function render_analysis_result(analysisResult, svgContainer) {
  console.log("analysisResult", analysisResult);
  // 获取 SVG 容器中的 Group_2 元素
  const originalGroup = svgContainer.querySelector("#Group_2");

  if (originalGroup) {
    // 获取父元素
    const parentElement = originalGroup.parentElement;

    // 获取父元素的变换矩阵
    const parentCTM = parentElement.getCTM();
    if (parentCTM) {
      // 全局旋转中心点
      // 使用全局坐标作为旋转中心
      const centerX = analysisResult.rotate_center[0];
      const centerY = analysisResult.rotate_center[1];

      for (let i = 0; i < 4; i++) {
        const copy1 = originalGroup.cloneNode(true);
        copy1.id = "Group_2_Copy" + i;
        copy1.setAttribute(
          "transform",
          `rotate(${-60 * (i + 2)}, ${centerX}, ${centerY})`
        );
        copy1.style.opacity = "0.5";
        parentElement.appendChild(copy1);
      }
    }
  }

  fitSvgToContent(svgContainer.querySelector("svg"));
}
