/* eslint-disable */

// 添加发送SVG分析请求的函数
async function analyzeSVG(svgData) {
  try {
    const response = await fetch("http://127.0.0.1:5000/analyze-svg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ svg: svgData }),
    });
    const data = await response.json();
    if (data.error) {
      return { error: data.message };
    }
    return data.result;
  } catch (error) {
    console.error("Error:", error);
    return { error: error.message };
  }
}

// 添加发送SVG分析请求的函数
async function parseUserInput(userInput, focused_dialog) {
  let options = focused_dialog.options;

  console.log("focused_dialog", focused_dialog);

  let content = {
    setting: options,
    nl: userInput,
  };

  console.log("parse content", content);
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/parse_natural_language",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content }),
      }
    );
    const data = await response.json();
    if (data.error) {
      return { error: data.message };
    }

    console.log(data.result);

    return data.result;
  } catch (error) {
    console.error("Error:", error);
    return { error: error.message };
  }
}

function receive_message(event) {}

async function uploadDSLAndSVG(dsl_setting) {
  console.log("upload!!!");
  try {
    const payload = {
      dsl_setting: dsl_setting,
    };

    let server_position = "http://127.0.0.1:5000";
    let api_position = server_position + "/upload";
    const response = await fetch(api_position, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    let share_position = "http://127.0.0.1:5000";
    alert(
      `${share_position}/dsl_renderer.html?file=${data.filename}&type=setting`
    );
    console.log("share seccess!");

    return data;
  } catch (error) {
    console.error("Upload Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}


async function get_cached_dsl(name){
  const payload = {
    name: name
  };

  let server_position = "http://127.0.0.1:5000";
  let api_position = server_position + "/get_cached_dsl";
  const response = await fetch(api_position, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Upload failed");
  }
  return data;
}

async function cache_dsl(dsl_setting, name) {
  console.log("store!!!");
  try {
    const payload = {
      dsl: dsl_setting,
      name: name
    };

    let server_position = "http://127.0.0.1:5000";
    let api_position = server_position + "/cache_dsl";
    const response = await fetch(api_position, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    console.log("store seccess!");

    return data;
  } catch (error) {
    console.error("Upload Error:", error);
    return {
      success: false,
      error: error.message,
    };
    
  }
}



async function describe_dsl(dsl) {
  console.log("DESCRIBE DSL")
  let sim_dsl = {
    id: dsl.id,
    type: dsl.type,
    units: dsl.units
  }

  let background_color = current_background
  let svg = document.querySelector('#svg-container').querySelector('svg').outerHTML;
  // if (localStorage.getItem('DESCRIBE_dsl' + dsl.id)){
  //   console.log("Load from local storage");
  //   return localStorage.getItem('DESCRIBE_dsl' + dsl.id)
  // }
  try {
    const payload = {
      dsl: sim_dsl,
      svg: svg,
      background_color: background_color
    };

    let server_position = "http://127.0.0.1:5000";
    let api_position = server_position + "/describe_dsl";
    const response = await fetch(api_position, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Receive Information", data);
    // localStorage.setItem('DESCRIBE_dsl' + dsl.id, data.result)
    return data.result;
  } catch (error) {
    console.error("Upload Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}



// async function captureSvg(dsl_json) {
//   // 获取 SVG 容器
//   const svgContainer = document.getElementById("svg-container");

//   console.timeLog("Capture");

//   // 使用 html2canvas 捕获 SVG 并转换为图像
//   html2canvas(svgContainer).then((canvas) => {
//     // 将 canvas 转换为 Base64 图像，指定为 JPEG 格式和质量
//     const imageBase64 = canvas.toDataURL("image/jpeg", 0.9); // 0.9 是质量参数，范围从 0 到 1

//     let server_position = "http://127.0.0.1:5000";
//     let api_position = server_position + "/describe_dsl";

//     // 发送到后端
//     fetch(api_position, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({"image": imageBase64, "dsl": dsl_json}),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         console.log("Success:", data);
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   });
// }