/* eslint-disable */

// function showChoice() {
//   let userChoice = confirm("请选择：按确定选择A，按取消选择B");
  
//   if (userChoice === true) {
//       // 用户选择了A (点击了"确定")
//       alert("你选择了A");
//       // 在这里添加选择A后的逻辑
//   } else {
//       // 用户选择了B (点击了"取消")
//       alert("你选择了B");
//       // 在这里添加选择B后的逻辑
//   }
// }


function get_reply_options_for_new_graphics(saved_svg="", frame_dsl=[], background_color = null){
  let content = "You are selecting a new object. Do you want to load this new graphic or keep the origin one?"
  let options = {
    "load_new_graphic": {
        default_value: false,
        type: "check",
    },
    "keep_origin_graphic": {
        default_value: false,
        type: "check",
    }
}

  let reply = {
    "type": "new_graphic",
    "content": content,
    "options": options,
    "action": "new_graphics_response",
    "saved_svg": saved_svg,
    "frame_dsl": frame_dsl,
    "background_color": background_color
  }

  console.log("Get reply for new graphics", reply)
  return reply
}

function new_graphics_response(system_message){
  console.log("Update new graphics:", system_message)

  let options = system_message.options;
  let saved_svg = system_message.saved_svg;
  let frame_dsl = system_message.frame_dsl;
  let background_color = system_message.background_color;

  if (get_option_value(options, "load_new_graphic")){
    console.log("You are going to load new graphic");
    updateStatus(ALREADY_SELECTED_TEXT, 'success');
    updateSVG(saved_svg, frame_dsl);
    if (background_color){
      updateBackground(background_color);
    }
  }
}


async function get_exist_dsl_from_message(info){
  let selected_dsl_ids = info.filter(d => d.name.startsWith('DSL_C_'))
      .map(d => d.name)

  let selected_rendered_instance = info.filter(d => d.name.startsWith('DSL_RENDERED_INSTANCE_'))
      .map(d => d.name)

  console.log("Selected DSL instances ids", selected_rendered_instance)

  selected_dsl_ids.push(...selected_rendered_instance)

  console.log("DSL_ids", selected_dsl_ids)

  let exist_dsl_in_current_frame = {}

  for (let i = 0; i < selected_dsl_ids.length; i ++){
      let dsl_id = selected_dsl_ids[i]
      if (dsl_id.startsWith('DSL_C_')){
          dsl_id = dsl_id.replace("DSL_C_", "DSL_");
      }

      let cached_dsl = await get_cached_dsl(dsl_id)

      console.log("Cached_dsl", cached_dsl, dsl_id)

      if (cached_dsl.success){
          console.log("cached dsl", cached_dsl)
          exist_dsl_in_current_frame[dsl_id] = cached_dsl.dsl
      }
  }

  return exist_dsl_in_current_frame
}

function get_existing_dsl_id_description(existing_dsl){
  if (!existing_dsl){
    console.log("No existing DSL");
    return []
  }
  let existing_dsl_list = [];
  Object.keys(existing_dsl).forEach(key => {
    console.log(`DSL_${key}: ${existing_dsl[key]}`);
    if (existing_dsl[key].dsl.dsl.description){
      existing_dsl_list.push({
        "id": key,
        "description": existing_dsl[key].dsl.dsl.description
      })
    }
    // existing_dsl_list.push({
    //   "id": key,
    //   "description": existing_dsl[key].dsl.dsl.description
    // })
  });
  console.log("Existing Dsl ID and description", existing_dsl_list);
  return existing_dsl_list;
}

async function updateSVG(svgData, frameChildren) {
  svgContainer.className = "fade-in";
  svgContainer.innerHTML = svgData;

  frame_existing_dsl = await get_exist_dsl_from_message(frameChildren)
  console.log("Existing DSL in Current Frame:", frame_existing_dsl);
  dsl_id_description = get_existing_dsl_id_description(frame_existing_dsl)
  console.log("Existing DSL and description in Current Frame:", dsl_id_description);

  check_svg_convert_path_to_rect(svgContainer.querySelector("svg"));

  let current_svg = svgContainer.querySelector("svg");
  let updated_svg_string = svgContainer.innerHTML;
  // console.log("updated_svg_string", updated_svg_string)
  currentSvgData = updated_svg_string;

  let selected_id = current_svg.firstElementChild?.getAttribute("id"); // get first element


  console.log("First element id", selected_id)

  chatService.UserMessage(
    `I have selected the group with id ${selected_id}.`,
    (no_reply = true)
  );
  // 显示SVG代码
  const svgCode = document.getElementById("svg-code");
  const svgTreeCode = document.getElementById("svg-tree-code");
  svgCode.style.display = "block";
  svgCode.textContent = updated_svg_string;

  // console.log("svg code", updated_svg_string)

  svgTreeCode.style.display = "block";
  const svg = svgContainer.querySelector("svg");
  if (svg) {
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.removeAttribute("preserveAspectRatio");
  }

  copyButton.style.display = "block";
  shareButton.style.display = "block";

  // 构建树状结构, 并保存历史
  // if (need_build_tree){
  //   const tree = buildSVGTree(svg.querySelector("g"));
  //   svgTreeHistory.push(tree);
  //   svgTreeCode.textContent = JSON.stringify(svgTreeHistory, null, 2);  
  // }

  console.log("selected_id", selected_id)

  if (selected_id.startsWith("DSL_RENDERED")) {
    console.log(selected_id);
    let cached_dsl = await get_cached_dsl(selected_id);

    console.log("Cached ids", cached_dsl);

    if (cached_dsl.success){
      let dsl_result = cached_dsl.dsl;
      let design_dsl = new DesignDSL(initialDSL = dsl_result.dsl.dsl);
      console.log("Design DSL from cached", design_dsl);
      let dialog_reply = get_reply_options_from_dsl(design_dsl, target_id = null, related_dsl = dsl_result)

      dsl_result.dialog_reply = dialog_reply;
      dsl_result.dsl = design_dsl; // update the dsl using DesignDSL class
      
      dialog_reply.content = "This a DSL-rendered graphic, I've loaded the cached DSL for you. " + dialog_reply.content;
      console.log("dialog_reply", dialog_reply);
      update_and_render_dsl_result(dsl_result);
      chatService.SystemResponse(dialog_reply);
      return;
      // We read from the backend.
    }
    if (global_dsl_manager[selected_id]) {
      chatService.SystemResponse(
        `The selected graphics is a DSL-rendered graphics. What do you want to do on this graphic?`
      );
      console.log("The information is stored in the global_dsl_manager");
      let dsl_result = global_dsl_manager[selected_id];
      console.log(dsl_result);
      update_and_render_dsl_result(dsl_result);

      chatService.SystemResponse(dsl_result.dialog_reply);

      return;
    }
    // performSVGAnalysis(updated_svg_string, chatService)
    // chatService.SystemResponse(`I've updated the parameters for you.`);
  } 

  DSL_REPRESENT_POINTS = calculate_represent_points_of_loaded_svg();
  console.log("DSL_REPRESENT_POINTS", DSL_REPRESENT_POINTS)

  let dsl_result = await performSVGAnalysis(updated_svg_string, chatService);
  console.log("DSL Perform Result", dsl_result);

  let dsl_describe = await describe_dsl(dsl_result.dsl.getDSL())
  console.log("dsl_describe", dsl_describe)
  dsl_result.dsl.addDescription(dsl_describe)
  console.log("UPDATE description", dsl_result.dsl.getDSL())

}

function calculate_represent_points_of_loaded_svg(){
  const dsl_rendered_instance = document.querySelectorAll('[id^="DSL_RENDERED_INSTANCE_"]');
  let id_to_points = {};
  dsl_rendered_instance.forEach(element => {
    let id = element.id;
    let points = getRepresentPoints(element);
    id_to_points[id] = points;
  })
  console.log("DSL_rendered_instance elements", dsl_rendered_instance)
  console.log("id_to_points", id_to_points)
  return id_to_points;
}

function add_description_to_dsl(dsl, dsl_describe){

}

function get_reply_options_from_llm_answer(llm_answer, related_dsl = null, stored_dsl = null, all_unit_ids = [], existing_dsl = []){
  let content = null
  let existing_dsl_name = existing_dsl.map(item => item.id)
  if (llm_answer.type === "combine_dsl"){
    content = "You are going to add ##dsl_need_to_add## to the ##add_rule## of element ##target_id##. The distance is (##distance_x##, ##distance_y##)."
    combine_keys = ['dsl_need_to_add', 'add_rule', 'target_id']
    options = {
      "dsl_need_to_add": {
        default_value: llm_answer.dsl_need_to_add,
        type: "select",
        possible_values: existing_dsl_name
      },
      "add_rule": {
        default_value: llm_answer.add_rule,
        type: "select",
        possible_values: ["top", "bottom", "left", "right", 'center']
      },
      "target_id": {
        default_value: llm_answer.target_id,
        type: "select",
        possible_values: all_unit_ids
      },
      "distance_x": {
        default_value: llm_answer.distance_x,
        type: "number",
        sub_type: "number"
      },
      "distance_y": {
        default_value: llm_answer.distance_y,
        type: "number",
        sub_type: "number"
      }
    }
    // ["distance_x", "distance_y"].forEach(key => {
    //   let name_dict = {
    //     "distance_x": "horizontal distance",
    //     "distance_y": "vertical distance",
    //   }
    //   if (llm_answer[key]){
    //     content += `The ${name_dict[key]} is ##${key}##. `
    //     options[key] = {
    //       default_value: llm_answer[key],
    //       type: "number",
    //       sub_type: "number"
    //     }
    //   }
    // })
  }

  else if (llm_answer.type === "update_parameter"){
    content = "You are going to change the parameters of ##target_id##."
    options = {
      "target_id": {
        default_value: llm_answer.target_id,
        type: "string",
        sub_type: "string"
      }
    }
    llm_answer.update_list.forEach(update_item => {
      update_key = update_item.key
      let default_value =  update_item.value_data_function?update_item.value_data_function:update_item.value_list
      options[update_key] = {
        default_value: default_value,
      }
      options[update_key].type = Array.isArray(default_value)?"array":"string"
      content += `The parameter ${update_key} is updated to ##${update_key}##. `
    })
  }
  else if (llm_answer.type === "repeat_content"){

    content = "You are going to ##repeat_rule## the object ##target_id## by ##repeat_count##. "

    options = {
      "target_id": {
        default_value: llm_answer.target_id,
        type: "string",// "graphic_id",
        sub_type: "string",
        // graphic_code: "",
      },
      "repeat_rule": {
        default_value: llm_answer.repeat_rule,
        type: "select",
        possible_values: ["repeat", "translate"]
      },
      "repeat_count": {
        default_value: llm_answer.repeat_count,
        type: "number",
        sub_type: "repeat_times"
      }
    }

    if (llm_answer.repeat_rule === "translate"){
      content += "The translation is ##translate_distance_x## and ##translate_distance_y##. "
      options["translate_distance_x"] = {
        default_value: llm_answer.translate_distance_x,
        type: "number",
        sub_type: "number"
      }
      options["translate_distance_y"] = {
        default_value: llm_answer.translate_distance_y,
        type: "number",
        sub_type: "number"
      }
    }
    else if (llm_answer.repeat_rule === "rotate"){
      llm_answer.relative_base = {"x": 0, "y": 0}
      content += "The rotation angle is ##rotate_angle##, the relative base is ##relative_base##"
      options["rotate_angle"] = {
        default_value: llm_answer.rotate_angle,
        type: "number",
        sub_type: "angle"
      }
      options["relative_base"] = {
        default_value: llm_answer.relative_base,
        type: "coordinates",
        sub_type: "coordinates"
      }
    }
  }

  else {
    content = "You are going to change the following parameters. "
    options = {}
    Object.keys(llm_answer).forEach(key => {
      options[key] = {
        default_value: llm_answer[key],
        type: "string",
        sub_type: "string"
      }
      content += `The parameter ${key} is ##${key}##. `
    })
  }



  let reply = {
    "type": "llm_answer",
    "content": content,
    "options": options,
    "action": "update_llm_answer",
    "llm_answer": llm_answer,
    "stored_dsl": JSON.stringify({
      "dsl": related_dsl.dsl,
      "defs_string": related_dsl.defs_string
    })
  }
  if (stored_dsl){
    reply.stored_dsl = stored_dsl
  }
  else{
    reply.stored_dsl = JSON.stringify({
      "dsl": related_dsl.dsl,
      "defs_string": related_dsl.defs_string
    })
  }

  console.log("Get reply from LLM", JSON.stringify(reply, null, 2))
  reply.related_dsl = related_dsl
  return reply
}

function get_option_value(options, key) {
  if (!options[key]) {
    console.log("No such option", options, key);
    return 0;
  }
  if (options[key].value) {
    return options[key].value;
  } else {
    return options[key].default_value;
  }
}

function load_origin_dsl_to_related_dsl(system_message){
  let origin_dsl = JSON.parse(system_message.stored_dsl).dsl.dsl;
  let related_dsl = system_message.related_dsl;
  console.log("Setting origin dsl", JSON.stringify(origin_dsl, null, 2), related_dsl.dsl.dsl)
  related_dsl.dsl.dsl = origin_dsl;
}


function update_llm_answer(system_message){

  load_origin_dsl_to_related_dsl(system_message);

  // let origin_dsl = JSON.parse(system_message.stored_dsl).dsl.dsl;


  // let related_dsl = system_message.related_dsl;

  // console.log("Setting origin dsl", JSON.stringify(origin_dsl, null, 2), related_dsl.dsl.dsl)

  // related_dsl.dsl.dsl = origin_dsl;

  // Setting origin dsl

  console.log("Update LLM answer", system_message)

  let llm_answer = system_message.llm_answer;
  let options = system_message.options;
  if (llm_answer.type === "update_parameter"){

    let edit_keys = Object.keys(options);
    edit_keys.forEach(key => {
      if (llm_answer[key] !== undefined){
        llm_answer[key] = get_option_value(options, key);
      }
    })

    llm_answer.update_list.forEach(update_item => {
      if (edit_keys.includes(update_item.key)){
        let update_content = get_option_value(options, update_item.key);
        if (update_item.value_data_function){
          update_item.value_data_function = update_content;
        }
        else{
          update_item.value_list = update_content;
        }
      }
    })
    console.log("LLM answer", llm_answer)
  }
  else {
    let edit_keys = Object.keys(options);
    edit_keys.forEach(key => {
      if (llm_answer[key] !== undefined){
        llm_answer[key] = get_option_value(options, key);
        if(key === "relative_base"){
          let answer = get_option_value(options, key);
          llm_answer[key] = {x: answer.x, y: answer.y}
        }
      }
    })
  }

  console.log("LLM system_message", system_message)

  let run_status = rerender_dsl_change(system_message.related_dsl, llm_answer);

  if (run_status.success){
    update_and_render_dsl_result(system_message.related_dsl);
    console.log("Update LLM answer success!!!")
  }
  else{
    console.log("Error! Update LLM answer failed!!!")
  }
}


function get_reply_options_from_dsl(design_dsl, target_id = null, related_dsl = null){

  let found = design_dsl.findUnitWithParent(target_id);
  let current_unit = null;
  if (!found){
    // console.log("Get DSL", design_dsl, design_dsl.getDSL(), design_dsl.getDSL().units[0])
    current_unit = design_dsl.getDSL().units[0];
  }
  else{
    current_unit = found.unit;
  }

  function get_sub_type(key){
    let sub_type_dict = {
      "interval_x": "number",
      "interval_y": "number",
      "theta": "angle",
      "repeat_count": "repeat_times",
      "origin_point": "coordinates",
      "relative_base": "coordinates",
      "fill": "color",
      "stroke": "color",
      "stroke-width": "number"
    }
    if (sub_type_dict.hasOwnProperty(key)){
      return sub_type_dict[key]
    }
    return null
  }


  function get_key_type(key){
    let sub_type_dict = {
      "interval_x": "number",
      "interval_y": "number",
      "width": "number",
      "theta": "number",
      "height": "number",
      "repeat_count": "number",
      "origin_point": "coordinates",
      "fill": "color",
      "stroke": "color",
      "stroke-width": "number",
      "relative_base": "coordinates"
    }
    if (sub_type_dict.hasOwnProperty(key)){
      return sub_type_dict[key]
    }
    return "string"
  }

  function get_describe(key){
    let describe_dict = {
      "interval_x": "The repeat distance of x direction is",
      "interval_y": "The interval in horizon direction  is",
      "origin_point": "The center this object is",
      "fill": "The fill color is",
      "stroke": "The stroke is",
      "theta": "The rotation angle is",
      "width": "The width is",
      "height": "The height is",
      "relative_base": "The base point is"
    }
    if (describe_dict.hasOwnProperty(key)){
      return describe_dict[key] + ` ##${key}##. `
    }
    return `The ${key} is ##${key}##. `;
  }

  let describe_content = ''

  let options = {}

  if (current_unit?.type === 'repeat'){

    let possible_keys = ['interval_x', 'interval_y', 'repeat_count', 'theta', 'relative_base', 'scale_x', 'scale_y']
    describe_content = "You may want to repeat it by ##repeat_count##. "
    possible_keys.forEach(key => {
      if (current_unit.source.hasOwnProperty(key) || current_unit.data_function.hasOwnProperty(key)){
        if ( key !== "repeat_count"){
          describe_content += get_describe(key)
        }
        let default_value = null
        let key_type = get_key_type(key)
        if (current_unit.data_function.hasOwnProperty(key)){
          default_value = current_unit.data_function[key]
        } else if (current_unit.source.hasOwnProperty(key)){
          default_value = current_unit.source[key]
        }

        options[key] = {
          default_value: default_value,
          type: key_type
        }
        let sub_type = get_sub_type(key)
        if (key_type === "string"){
          console.log("current_unit.source[key]", current_unit.source[key])
          options[key].default_value = default_value
        }
        if (sub_type){
          options[key].sub_type = sub_type
        }
      }
    })
  }

  // ADD FILL S_0_Group_49 DSL {
  //   "id": "DSL_0309_212112",
  //   "units": [
  //     {
  //       "id": "S_0_Rectangle 241",
  //       "type": "single",
  //       "source": {
  //         "type": "RECT",
  //         "xmlns": "http://www.w3.org/2000/svg",
  //         "id": "Rectangle 241",
  //         "width": "115",
  //         "height": "986",
  //         "fill": "#D9D9D9"
  //       },
  //       "origin_point": {
  //         "x": 0,
  //         "y": 0
  //       },
  //       "data_function": {}
  //     }
  //   ],
  //   "relation": []
  // }

  else if (current_unit?.type === "single"){
    describe_content = "You selected a single object. "
    possible_keys = ['width', 'height', 'origin_point', 'fill', 'stroke', 'stroke-width', 'text_content', "font-size"]
    possible_keys.forEach(key => {
      if (current_unit.source.hasOwnProperty(key)){
        describe_content += get_describe(key)
        options[key] = {
          default_value: current_unit.source[key],
          type: get_key_type(key),
          sub_type: get_sub_type(key)
        }
      }
    })
    if (current_unit?.hasOwnProperty("origin_point")){
      describe_content += "The center this object is ##origin_point##."
      options["origin_point"] = {
        default_value: current_unit.origin_point,
        type: "coordinates"
      }
    }  
  }
  else {
    describe_content = "This is a empty group. "
  }

 
  // options['target_id'] = {
  //   default_value: current_unit.id,
  //   value: current_unit.id,
  //   type: "string"
  // }

  let reply = {
    "type": "update_dsl",
    "content": describe_content,
    "options": options,
    "action": "update_parameter_new",
    "target_id": current_unit?.id,
    "stored_dsl": JSON.stringify({
      "dsl": related_dsl.dsl,
      "defs_string": related_dsl.defs_string
    })
  }
  // console.log("Reply from DSL: ", JSON.stringify(options, null, 2))
  reply.related_dsl = related_dsl
  return reply
}
// 使用async/await来处理分析结果
async function performSVGAnalysis(svgData, chatService) {
  // Analyze according to the content.
  const analysisResult = await analyzeSVG(svgData);

  let dsl_result = await get_dsl_from_analysis_result(svgData, analysisResult);

  let dialog_reply = get_reply_options_from_dsl(dsl_result.dsl, target_id = null, related_dsl = dsl_result);

  console.log("dsl_result", dsl_result);
  console.log("analysis result", analysisResult);

  dsl_result.backgroundColor = current_background;
  console.log(dialog_reply)
  dialog_reply.related_dsl = dsl_result;
  dsl_result.dialog_reply = dialog_reply;
  update_and_render_dsl_result(dsl_result);
  chatService.SystemResponse(dialog_reply);
  return dsl_result;
}

function update_and_render_dsl_result(dsl_result) {
  if (dsl_result.render_id) {
    console.log("Rerender according to existing dsl", dsl_result.render_id);
  }
  else {
    console.log("Render using generated dsl")
  }
  let current_dsl = dsl_result.dsl;
  let defs_string = dsl_result.defs_string;
  // updateBackground(dsl_result.backgroundColor);
  // updateStatus(ALREADY_SELECTED_TEXT, "success");
  let render_id = render_dsl_result(current_dsl, defs_string);
  dsl_result.render_id = render_id;
  current_dsl_content = dsl_result;  // update current dsl content;
  console.log("render_id", render_id);
  console.log("Current dsl content", current_dsl_content);
  current_selected_dsl = dsl_result; // this is a globle dsl result;

  // Every time we will update the debug window.
  document.getElementById("svg-tree-code").textContent = JSON.stringify(dsl_result.dsl.getDSL(), null, 2);  

}

function render_dsl_result(current_dsl, defs_string, fit_svg = true){
  updateStatus(ALREADY_SELECTED_TEXT, "success");

  // console.log("render_dsl_result", current_dsl, defs_string)
  
  const pattern = new PatternGenerator("svg-container");

  // remove previous svg
  document.querySelector("#svg-container")
    .querySelector("svg").innerHTML = "";

  let current_render_id = null;

  if (current_dsl){
    current_dsl.moveSingleObject()
      current_render_id = pattern.generateFromJSON(current_dsl.getDSL());
      // downloadDataAsJSON(pattern._expanded_data, 'expand_data.json');
  }
  else {
    console.log("No current dsl");
    return null;
  }

  add_annotation_layer()

  let svg_element = document
    .querySelector("#svg-container")
    .querySelector("svg");

  // console.log("defs string", defs_string)

  if (defs_string) {
    console.log("ADD to defs string")
    addDefsToSVG(svg_element, defs_string);
    
  }
  if (fit_svg) {
      fitSvgToContent(
          document.getElementById("svg-container").querySelector("svg")
      );
  }
  setPathFillOpacity(svg_element); // 我们需要设置为 0， 因为我们不希望他们是黑色的

  // chatService.drawRotationIcon()

  return current_render_id
}

function updateStatus(text, type = "normal") {
  statusText.textContent = text;
  statusText.className = `status ${type}`;
  if (type === "success") {
    statusText.style.display = "none";
  } else {
    statusText.style.display = "block";
  }
}

function updateBackground(color) {
  document.body.style.backgroundColor = color;
  svgContainer.style.backgroundColor = color;
}

function buildSVGTree(element) {
  // 只保存g和path元素
  if (
    element.tagName.toLowerCase() !== "g" &&
    element.tagName.toLowerCase() !== "path"
  ) {
    return null;
  }
  const tree = {
    tag: element.tagName.toLowerCase(),
    id: element.id || "",
    children: [],
  };

  // 递归处理子元素
  Array.from(element.children).forEach((child) => {
    tree.children.push(buildSVGTree(child));
  });

  return tree;
}

function showEmptyState() {
  currentSvgData = null;
  svgContainer.className = "empty fade-in";
  svgContainer.innerHTML =
    "<div>Please select a group in Figma interface.</div>";

  // 隐藏SVG代码
  const svgCode = document.getElementById("svg-code");
  // svgCode.style.display = 'none';
  svgCode.textContent = "";

  copyButton.style.display = "none";
  shareButton.style.display = "none";
}

function extractSVGContent() {
  // 获取原始 SVG 元素
  const originalSvg = document
    .querySelector("#svg-container")
    .querySelector("svg");

  // 创建新的 SVG 元素
  const newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  // 复制原始 SVG 的属性
  Array.from(originalSvg.attributes).forEach((attr) => {
    newSvg.setAttribute(attr.name, attr.value);
  });

  if (newSvg.getAttribute("viewBox")){
    const viewBox = newSvg.getAttribute('viewBox').split(' ');
    const width = viewBox[2];
    const height = viewBox[3];
    
    newSvg.setAttribute('width', width);
    newSvg.setAttribute('height', height);
  }

  // 获取目标 group
  const targetGroup = originalSvg.querySelector(".DSL_rendered_group");
  if (!targetGroup) return null;

  // 复制所有的 defs
  const originalDefs = originalSvg.querySelector("defs");
  if (originalDefs) {
    newSvg.appendChild(originalDefs.cloneNode(true));
  }

  // 添加目标 group 到新的 SVG
  newSvg.appendChild(targetGroup.cloneNode(true));

  // 生成 SVG 字符串
  const svg_string = newSvg.outerHTML;

  let represent_points = getRepresentPoints(newSvg)

  // 创建下载链接

  const blob = new Blob([svg_string], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  // const a = document.createElement('a');
  // a.href = url;
  // a.download = 'extracted.svg';
  // a.click();
  URL.revokeObjectURL(url);

  console.log("copy svg_string", svg_string);

  return { svg_string, represent_points };
}

function getRepresentPoints(newSvg){
  let points = getPointsFromSVG(newSvg)
  console.log("points", points);
  let point_num = points.length;
  let represent_point_ids = [0, parseInt(point_num / 3), parseInt(point_num / 3) * 2, point_num - 1];
  let represent_points = represent_point_ids.map((id) => points[id]);
  return represent_points
}

function set_up_share_button() {
  function share_current_dsl() {
    console.log("Share current dsl");

    console.log("current_dsl_content", current_dsl_content);

    if (current_dsl_content) {
      dsl_setting = {
        dsl: current_dsl_content.dsl.getDSL(),
        defs_string: current_dsl_content.defs_string,
        background_color: current_dsl_content.backgroundColor,
      };
      uploadDSLAndSVG(dsl_setting);
    }
  }

  shareButton.addEventListener("click", () => {
    share_current_dsl();
  });
}

// 使用函数
// const svg_string = extractSVGContent();
