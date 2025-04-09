/* eslint-disable */

class ChatService {
  constructor(document, language) {
    this.default_response = {
      no_select: {
        ch: "请选择一个组",
        en: "Please select a group",
      },
    };
    this.language = language;
    this.document = document;
    this.chatBody = this.document.getElementById("chat-body");
    this.sendButton = this.document.getElementById("send-button");
    this.iconMap = {
      angle: `<svg class="icon" id="icon_angle" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M4 4V11.5V12H4.5H12V11H9C9 8.79086 7.20914 7 5 7V4H4ZM5 8V11H8C8 9.34315 6.65685 8 5 8Z" fill="black" fill-opacity="0.3"/>
                        </svg>`,
      repeat_times: `<svg id="icon_repeat_times" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10.1818 6.18182V5.09091C10.1818 4.48842 9.6934 4 9.09091 4H5.09091C4.48842 4 4 4.48842 4 5.09091V9.09091C4 9.6934 4.48842 10.1818 5.09091 10.1818H6.18182M10.1818 6.18182H10.9091C11.5116 6.18182 12 6.67023 12 7.27273V10.9091C12 11.5116 11.5116 12 10.9091 12H7.27273C6.67023 12 6.18182 11.5116 6.18182 10.9091V10.1818M10.1818 6.18182H7.27273C6.67023 6.18182 6.18182 6.67023 6.18182 7.27273V10.1818" stroke="black" stroke-opacity="0.3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`,

      Group: `<svg id="icon_group" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M9 3H7V4H9V3ZM11.5 12H12V11.5H13V12V13H12H11.5V12ZM4 7V9H3V7H4ZM12 4.5V4H11.5V3H12H13V4V4.5H12ZM12 7V9H13V7H12ZM4 4.5V4H4.5V3H4H3V4V4.5H4ZM3 12V11.5H4V12H4.5V13H4H3V12ZM9 12H7V13H9V12Z" fill="black" fill-opacity="0.3"/>
                        </svg>`,
      Vector: `<svg id="icon_vector" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M11 4H5C4.44772 4 4 4.44772 4 5V11C4 11.5523 4.44772 12 5 12H11C11.5523 12 12 11.5523 12 11V5C12 4.44772 11.5523 4 11 4ZM5 3C3.89543 3 3 3.89543 3 5V11C3 12.1046 3.89543 13 5 13H11C12.1046 13 13 12.1046 13 11V5C13 3.89543 12.1046 3 11 3H5Z" fill="black" fill-opacity="0.3"/>
                        </svg>`,
      "Complex Vector": `<svg id="icon_complex_vector" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.315 6.336L3.836 6.193L3.686 6.696L4.165 6.839L4.315 6.336ZM4.615 5.33L4.136 5.187L3.986 5.69L4.465 5.833L4.615 5.33ZM4.287 4.684L4.766 4.827L4.916 4.324L4.437 4.181L4.287 4.684ZM5.217 3.319L4.738 3.176L4.588 3.679L5.067 3.822L5.217 3.319ZM10.783 12.712L11.262 12.855L11.412 12.352L10.933 12.209L10.783 12.712ZM11.713 11.347L11.234 11.204L11.084 11.707L11.563 11.85L11.713 11.347ZM11.385 10.701L11.864 10.844L12.014 10.341L11.535 10.198L11.385 10.701ZM11.685 9.695L12.164 9.838L12.314 9.335L11.835 9.192L11.685 9.695ZM5.5 3.25C6.19 3.25 6.75 2.69 6.75 2C6.75 1.31 6.19 0.75 5.5 0.75C4.81 0.75 4.25 1.31 4.25 2C4.25 2.69 4.81 3.25 5.5 3.25ZM5.5 1.25C5.914 1.25 6.25 1.586 6.25 2C6.25 2.414 5.914 2.75 5.5 2.75C5.086 2.75 4.75 2.414 4.75 2C4.75 1.586 5.086 1.25 5.5 1.25ZM10.5 12.75C9.81 12.75 9.25 13.31 9.25 14C9.25 14.69 9.81 15.25 10.5 15.25C11.19 15.25 11.75 14.69 11.75 14C11.75 13.31 11.19 12.75 10.5 12.75ZM10.5 14.75C10.086 14.75 9.75 14.414 9.75 14C9.75 13.586 10.086 13.25 10.5 13.25C10.914 13.25 11.25 13.586 11.25 14C11.25 14.414 10.914 14.75 10.5 14.75ZM13.5 3C12.672 3 12 3.672 12 4.5C12 4.955 12.206 5.357 12.526 5.632C12.515 5.623 12.501 5.619 12.49 5.609C12.242 6.165 11.922 6.84 11.56 7.513C10.068 10.285 9.223 10.5 9 10.5C8.907 10.5 8.734 10.5 8.613 9.954C8.5 9.445 8.5 8.711 8.5 8C8.5 7.236 8.5 6.445 8.363 5.829C8.119 4.731 7.487 4.5 7 4.5C6.066 4.5 5.065 5.43 3.951 7.323L3.535 7.198L3.385 7.701L3.686 7.791C3.644 7.867 3.603 7.934 3.56 8.013C3.514 8.098 3.477 8.178 3.433 8.263L3.235 8.204L3.085 8.707L3.191 8.739C3.11 8.902 3.029 9.06 2.955 9.216L2.935 9.21L2.894 9.349C2.788 9.574 2.678 9.805 2.589 10.004C2.605 10.005 2.619 10.013 2.634 10.015C2.588 10.009 2.546 10 2.5 10C1.672 10 1 10.672 1 11.5C1 12.328 1.672 13 2.5 13C3.328 13 4 12.328 4 11.5C4 11.045 3.793 10.643 3.474 10.368C3.485 10.377 3.5 10.382 3.51 10.391C3.758 9.835 4.078 9.16 4.44 8.487C5.932 5.715 6.777 5.5 7 5.5C7.093 5.5 7.266 5.5 7.387 6.046C7.5 6.555 7.5 7.29 7.5 8C7.5 8.764 7.5 9.555 7.637 10.171C7.881 11.269 8.513 11.5 9 11.5C9.93 11.5 10.926 10.579 12.034 8.704L12.466 8.833L12.616 8.33L12.3 8.235C12.347 8.15 12.393 8.075 12.441 7.986C12.482 7.91 12.515 7.839 12.555 7.763L12.767 7.826L12.917 7.323L12.797 7.287C12.878 7.125 12.96 6.966 13.034 6.81L13.067 6.82L13.135 6.594C13.231 6.389 13.332 6.177 13.414 5.995C13.398 5.994 13.385 5.986 13.369 5.984C13.412 5.991 13.455 6 13.5 6C14.328 6 15 5.328 15 4.5C15 3.672 14.328 3 13.5 3ZM3.5 11.5C3.5 12.051 3.051 12.5 2.5 12.5C1.949 12.5 1.5 12.051 1.5 11.5C1.5 10.949 1.949 10.5 2.5 10.5C3.051 10.5 3.5 10.949 3.5 11.5ZM13.5 5.5C12.949 5.5 12.5 5.051 12.5 4.5C12.5 3.949 12.949 3.5 13.5 3.5C14.051 3.5 14.5 3.949 14.5 4.5C14.5 5.051 14.051 5.5 13.5 5.5Z" fill="black" fill-opacity="0.3"/>
                        </svg>`,
      Frame: `<svg id="icon_frame" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M6 2.5V3V5H10V3V2.5H11V3V5H13H13.5V6H13H11L11 10H13H13.5V11H13H11V13V13.5H10V13V11H6V13V13.5H5V13V11H3H2.5V10H3H5L5 6H3H2.5V5H3H5V3V2.5H6ZM10 10V6H6L6 10H10Z" fill="black" fill-opacity="0.3"/>
                        </svg>`,
      Component: `<svg id="icon_component" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.74254 4.74819L7.99981 2.50024L10.2571 4.74819L7.99981 6.99614L5.74254 4.74819ZM4.74795 10.2573L2.5 8.00004L4.74795 5.74278L6.9959 8.00004L4.74795 10.2573ZM10.2571 11.2519L7.9998 13.4999L5.74253 11.2519L7.9998 9.00396L10.2571 11.2519ZM13.4996 8.00006L11.2517 5.74279L9.00371 8.00006L11.2517 10.2573L13.4996 8.00006Z" fill="#7B61FF"/>
                        </svg>`,
      Instance: `<svg id="icon_instance" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M1.82812 8L2.164 7.66412L7.664 2.16412L7.99988 1.82825L8.33575 2.16412L13.8358 7.66412L14.1716 8L13.8358 8.33587L8.33575 13.8359L7.99988 14.1717L7.664 13.8359L2.164 8.33587L1.82812 8ZM7.99988 12.8282L12.8281 8L7.99988 3.17175L3.17163 8L7.99988 12.8282Z" fill="#7B61FF" fill-opacity="0.4"/>
                        </svg>`,
      Text: `<svg id="icon_text" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M3 3H3.5H8H12.5H13V3.5V6H12V4H8.5V12H10V13H8H6V12H7.5V4H4V6H3V3.5V3Z" fill="black" fill-opacity="0.3"/>
                        </svg>`,
      Image: `<svg id="icon_image" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M13 3H3L3 9.29289L5.14645 7.14645L5.5 6.79289L5.85355 7.14645L11.7071 13H13V3ZM3 13L3 10.7071L5.5 8.20711L10.2929 13H3ZM3 2C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2H3ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM12 6C12 7.10457 11.1046 8 10 8C8.89543 8 8 7.10457 8 6C8 4.89543 8.89543 4 10 4C11.1046 4 12 4.89543 12 6Z" fill="black" fill-opacity="0.3"/>
                        </svg>`,
      Y: `<svg id="icon_y" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.625 4H5.73438L7.95312 7.73438H8.04688L10.2656 4H11.375L8.48438 8.70313V12H7.51562V8.70313L4.625 4Z" fill="black" fill-opacity="0.3"/>
                    </svg>`,
      X: `<svg id="icon_x" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.90625 4L7.96875 7.32812H8.03125L10.0938 4H11.2344L8.71875 8L11.2344 12H10.0938L8.03125 8.73438H7.96875L5.90625 12H4.76562L7.34375 8L4.76562 4H5.90625Z" fill="black" fill-opacity="0.3"/>
                    </svg>`,
      Rotation_icon: (fill = "#FF00FF") => `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="white" stroke-width="3"/>
                    <circle cx="6" cy="6" r="4.5" stroke="${fill}"/>
                    </svg>`,
    };
    // 对话历史
    this.dialog = [];
    this.Start();
    this.focus_id = 0;
  }
  set_default_input (input) {
    const textarea = document.getElementById("chat-input");
    textarea.value = input;
  }
  get_default_response (response_type) {
    return this.default_response[response_type][this.language];
  }
  // get_current_focus_chat () {
  //   if (!this.focus_id) {
  //     return null
  //   }
  //   if (this.dialog.length > 0) {
  //     return this.dialog[this.focus_id - 1]
  //   }
  //   else {
  //     return null
  //   }
  // }


  get_current_focus_chat() {
    if (!this.focus_id || this.dialog.length === 0) {
      return null;
    }
  
    let focusChat = this.dialog[this.focus_id - 1];
  
    if (focusChat && focusChat.related_dsl) {
      return focusChat;
    }
  
    // 从 this.dialog.length - 1 开始向前查找
    for (let i = this.dialog.length - 1; i >= 0; i--) {
      if (this.dialog[i] && this.dialog[i].related_dsl) {
        return this.dialog[i];
      }
    }
  
    return null;
  }
  

  Start () {
    // 创建textarea的监听器
    const document = this.document;
    document.addEventListener("DOMContentLoaded", function () {
      const textarea = document.getElementById("chat-input");
      const button = document.getElementById("send-button");

      textarea.focus();

      textarea.addEventListener("input", function () {
        // 自动调整高度
        textarea.style.height = "auto"; // 重置高度以计算新的高度
        const lineCount = (textarea.value.match(/\n/g) || []).length + 1;

        if (textarea.scrollHeight > 200) {
          textarea.style.height = "200px"; // 设置最大高度
          textarea.style.overflowY = "scroll"; // 显示滚动条
        } else {
          if (lineCount > 1) {
            textarea.style.height = textarea.scrollHeight + "px"; // 根据内容调整高度
          } else {
            textarea.style.height = "28px"; // 设置初始高度
          }
          textarea.style.overflowY = "none";
        }

        // 显示或隐藏发送按钮
        if (textarea.value.trim() === "") {
          button.style.display = "none";
        } else {
          button.style.display = "block";
        }
      });
    });

    this.chatInput = this.document.getElementById("chat-input");
    // 按 sendbutton 发送消息
    this.sendButton.addEventListener("click", () => {
      const userMessage = this.chatInput.value.trim();
      if (userMessage) {
        this.UserMessage(userMessage);
      }

      // 清空输入框并滚动到底部
      this.chatInput.value = "";
      this.chatBody.scrollTop = this.chatBody.scrollHeight;

      // 隐藏发送按钮
      const button = this.document.getElementById("send-button");
      button.style.display = "none";

      // 将textarea高度重置为初始高度
      this.chatInput.style.height = "28px";

      // 隐藏滚动条
      this.chatInput.style.overflowY = "hidden";
    });

    // 按下 Enter 键发送消息
    this.chatInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); // 阻止换行行为
        this.sendButton.click(); // 模拟发送按钮点击事件
      }
    });
  }

  // 用户消息
  UserMessage (message, no_reply = false) {
    const userMessageDiv = this.document.createElement("div");
    userMessageDiv.className = "chat-message user";
    userMessageDiv.innerHTML = `<div class="message-text">${message}</div>`;
    this.chatBody.appendChild(userMessageDiv);


    let current_dialog = {
      role: "user",
      content: message,
    };
    this.dialog.push(current_dialog);


    if (no_reply) {
      return
    }

    let last_options = null;
    let focused_dialog = this.get_current_focus_chat()
    if (focused_dialog && focused_dialog.hasOwnProperty("options")) {
      last_options = focused_dialog.options;
      console.log("last_system", focused_dialog);
      console.log("system_input", this.dialog);
    }
    // 保存用户消息

    if (last_options) {
      user_input_update(message, focused_dialog);
    } else {
      this.SystemResponse(dialog[0]);
      this.SystemResponse(this.get_default_response("no_select"));
    }
  }

  // 系统回复
  SystemResponse (response) {
    // 保存系统回复
    this.dialog.push(response);

    let chat_service = this;
    console.log("Default Response", response);
    const systemMessageDiv = this.document.createElement("div");
    systemMessageDiv.className = "chat-message assistant";

    // 如果用户输入了消息，则回复
    if (typeof response === "string") {
      systemMessageDiv.innerHTML = `<div class="message-text">${response}</div>`;
      this.chatBody.appendChild(systemMessageDiv);
    } else if (response) {
      // check_list容器，用于存储checkbox的选项，用于后续在最后添加check
      let check_list = Object.entries(response.options)
          .filter(([_, option]) => option.type === 'check')
          .map(([id, option]) => ({id, option}));
      // 解析response.content, 将content中的参数替换为html的input类型
      const content = response.content.replace(/##([\w-]+)##/g, (match, p1) => {
        if (!response.options[p1]) {
          return;
        }
        const option = response.options[p1];
        //为graphic_id
        if (option.type === "graphic_id") {
          return this.createGraphicElement(option, p1)
        }
        // 为dropdown类型
        if (option.hasOwnProperty("possible_values")) {
          return this.createDropdownElement(option, p1);
        }
        if (option.type === "coordinates") {
          return this.createXYElement(option, p1);
        } else if (option.type === "color") {
          return this.createColorElement(option, p1); // 使用颜色选择器和文本框
        }
        return this.createInputElement(option, p1);
      });

      const assistantMessageDiv = this.document.createElement("div");
      assistantMessageDiv.className = "chat-message assistant";


      


      const messageTextDiv = this.document.createElement("div");
      messageTextDiv.className = "message-text";
      messageTextDiv.id = "message-text_" + this.dialog.length;
   
      messageTextDiv.innerHTML = content;

      // 在messageTextDiv中添加check_list
      const checksContainer = document.createElement('div');
      checksContainer.className = 'check-list';
      check_list.forEach(({id, option}) => {
        const checkElement = this.createCheckElement(option, id);
        checksContainer.appendChild(checkElement);
      });

      messageTextDiv.appendChild(checksContainer);


      if (response.hasOwnProperty("related_dsl")){
        let undo_button = d3.select(messageTextDiv)
          .append('button')
          .text("Undo")
          .attr('class', 'undo-button')
        
        undo_button.on('click', function(event) {
          console.log("the stored_dsl", response.stored_dsl);
          load_origin_dsl_to_related_dsl(response)
          update_and_render_dsl_result(response.related_dsl);
          add_annotation_layer()
        })
      }
      
      // 更新focus_id
      this.focus_id = this.dialog.length;
      let current_focus_id = this.focus_id;

      assistantMessageDiv.setAttribute('id', 'message-div-' + current_focus_id);

      messageTextDiv.addEventListener(
        "click",
        (event) => {
          chat_service.focus_id = current_focus_id;
        }
      )

      // 为当前新创建的消息添加监听Enter键发送消息
      messageTextDiv.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault(); // 阻止换行行为
          this.sendAllValue(current_focus_id);
        }
      });

      // 为当前新创建的消息添加事件监听
      messageTextDiv.addEventListener(
        "blur",
        (event) => {
          if (event.target.closest(".message-text-input")) {
            console.log("更新", event.target);
            this.sendAllValue(current_focus_id);
          }
        },
        true
      );

      assistantMessageDiv.appendChild(messageTextDiv);
      this.chatBody.appendChild(assistantMessageDiv);
    }

    this.chatBody.scrollTop = this.chatBody.scrollHeight;
  }

  createCheckElement(option,id) {

    const value = getValue(option);
    const self = this;

    const checkContainer = d3.create('div')
      .attr('class', 'message-text-input')
    
    const checkDiv = checkContainer.append('div')
      .attr('class', value ? 'check selected' : 'check')
      .attr('id', id)
      .text(id.replaceAll("_", " "))
      .on('click', function(event) {
        const element = d3.select(this);
        // 获取event.target的父元素
        const parent = event.target.parentElement.parentElement.parentElement;
        if (element.classed('selected')) {
            element.classed('selected', false);
            // 移除 svg
            element.select('svg').remove();
            sendParameters(parent)
        } else {
            element.classed('selected', true);
            // 添加 svg
            const svg = createSelectIcon();
            element.node().insertBefore(svg, element.node().firstChild);
            // 点击后
            sendParameters(parent)
        }
        console.log('Selected:', element.text());
    });
    if (value) {
        const svg = createSelectIcon();
        checkDiv.node().insertBefore(svg, checkDiv.node().firstChild);
    }
    return checkContainer.node();
  }


  createRotationCenterElement (position, id) {
    // 在左侧SVG中添加旋转中心图标，且获取填充颜色
    const fill = this._drawRotationIcon(position, id);
    this._drawAnnotationAxis();
    // const fill = "#FF00FF";
    return `<div class="message-text-input">
                    <div class="input-icon" style="width: 12px; height: 16px;">
                        ${this.iconMap["Rotation_icon"](fill)}
                    </div>
                </div>`;
  }

  createGraphicElement (option, id) {
    // 如果存在value，则使用value，否则使用default_value
    var option_value = getValue(option);

    // 获取对应的graphic
    const graphic = option.graphic_code;
    const filter = option.filter_code;

    // 获取适合当前图形的 viewBox, 并进行setOpacity
    const { svgElement, viewBox } = extractViewBoxFromPath(graphic);

    // 创建 SVG 容器
    let svgContainer = `
            <svg id="${id}-icon" width="16" height="16" viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}" preserveAspectRatio="xMidYMid meet" xmlns='http://www.w3.org/2000/svg'>
                <defs>
                    <filter id="graphic_filter">
                        ${filter}
                    </filter>
                </defs>
                <g ${filter ? `filter="url(#graphic_filter)"` : ""}>
                    ${svgElement}
                </g>
            </svg>
        `;

    let dropdown = `<div class="message-text-input" id="${id}-wrapper">
                <div class="dropdown-display" onclick="toggleDropdown('${id}')">
                    <div class="input-icon">
                        ${svgContainer}
                    </div>
                    ${option_value.replace("#", "").replace(/_/g, " ")}
                </div>
                <div class="dropdown-options" id="${id}-options">`;

    // 添加所有选项
    option.possible_values.forEach((value) => {
      // 判断是否为当前选中值
      const isDefault = value === option.default_value;
      // 判断是否与default_value相等, 若相等则使用svgContainer, 否则使用默认图标
      const icon =isDefault? svgContainer : this.iconMap["Group"];
      dropdown += `
                <div class="option-item" data-value="${value}" onclick="selectOption('${id}', '${value}', '${isDefault}')">
                    ${icon}
                    ${value.replace("#", "").replace(/_/g, " ")}
                </div>`;
    });

    dropdown += `</div>
            <select class="hidden-select" id="${id}" onchange="updateDropdownValue(this)">
                <option value="${option_value}" selected>${option_value
        .replace("#", "")
        .replace(/_/g, " ")}</option>
                ${option.possible_values
        .map(
          (v) =>
            `<option value="${v}">${v
              .replace("#", "")
              .replace(/_/g, " ")}</option>`
        )
        .join("")}
            </select>
            </div>`;
    return dropdown;
  }

  createDropdownElement (option, id) {
    // 如果存在value，则使用value，否则使用default_value
    var option_value = getValue(option);
    const LayerType = option_value.replace("#", "").split("_")[0];
    let dropdown = `<div class="message-text-input" id="${id}-wrapper">
                <div class="dropdown-display" onclick="toggleDropdown('${id
      }')">
                    ${this.iconMap[LayerType]
        ? `<div class="input-icon">
                    ${this.iconMap[LayerType]}
                </div>`
        : ""
      }
                    ${option_value.replace("#", "").replace(/_/g, " ")}
                </div>
                <div class="dropdown-options" id="${id}-options">`;

    // 添加所有选项
    option.possible_values.forEach((value) => {
      // 判断是否为当前选中值
      const isDefault = value === option.default_value;
      const LayerType = value.replace("#", "").split("_")[0]; // 获取首字母作为图标类型
      dropdown += `
                <div class="option-item" data-value="${value}" onclick="selectOption('${id
        }', '${value}', '${isDefault}')">
                    ${this.iconMap[LayerType] ? this.iconMap[LayerType] : ""}
                    ${value.replace("#", "").replace(/_/g, " ")}
                </div>`;
    });

    dropdown += `</div>
            <select class="hidden-select" id="${id}" onchange="updateDropdownValue(this)">
                <option value="${option_value}" selected>${option_value
        .replace("#", "")
        .replace(/_/g, " ")}</option>
                ${option.possible_values
        .map(
          (v) =>
            `<option value="${v}">${v
              .replace("#", "")
              .replace(/_/g, " ")}</option>`
        )
        .join("")}
            </select>
            </div>`;
    return dropdown;
  }

  createXYElement(option, id, fill = "#FF00FF") {
    // 如果存在value，则使用value，否则使用default_value
    var option_value = getValue(option);

    const rotation_icon = this.createRotationCenterElement(option_value, id, fill);

    const div_X = `
                <div class="message-text-input">
                    <div class="input-wrapper">
                        <div class="input-icon">
                            ${this.iconMap["X"]}
                        </div>
                        <input type="number" 
                                    value="${option_value.x}"
                                    class = "${option.type}"
                                    id = "${id + "#_#x"}"
                                    style = "width: ${option_value.x.toString().length + "ch"
      }" 
                                    oninput="this.style.width = this.value.length + 'ch'" />
                    </div>
                </div>`;
    const div_y = `
                <div class="message-text-input">
                    <div class="input-wrapper">
                        <div class="input-icon">
                            ${this.iconMap["Y"]}
                        </div>
                        <input type="number" 
                                    value="${option_value.y}"
                                    class = "${option.type}"
                                    id = "${id + "#_#y"}"
                                    style = "width: ${option_value.y.toString().length + "ch"
      }" 
                                    oninput="this.style.width = this.value.length + 'ch'" />
                    </div>
                </div>`;
    return rotation_icon + div_X + div_y;
  }

  createColorElement (option, id) {
    // 如果存在value，则使用value，否则使用default_value
    var option_value = getValue(option);

    return `<div class="message-text-input">
                    <div class="input-wrapper">
                        <div>
                            <input type="color" 
                                    id = "${id}"
                                    value="${option_value}"
                                    onchange="updateColorInputs('${id}', '${id}_textInput')"
                                    /> <!-- 颜色选择器 -->
                        </div>
                        <input type="string" 
                                id = "${id}_textInput"
                                value="${option_value}"
                                style="width: ${option_value.toString().length}ch"
                                oninput="updateColorInputs('${id}_textInput', '${id}')"
                                /> <!-- 文本输入框 -->
                    </div>
                </div>`;
  }

  createInputElement (option, id) {
    // 如果存在value，则使用value，否则使用default_value
    var option_value = getValue(option);
    // 确定图标类型和生成图标HTML
    const iconType = option.sub_type || option.type;
    const icon = this.iconMap[iconType]
      ? `<div class="input-icon">${this.iconMap[iconType]}</div>`
      : "";

    // 处理 times_block
    const times_block =
      option.sub_type === "repeat_times"
        ? `<div style="opacity:0.4">times</div>`
        : "";

    return `
            <div class="message-text-input">
                <div class="input-wrapper">
                    ${icon}
                    <input 
                        type="${option.type}"
                        value="${option_value}"
                        id="${id}"
                        style="width: ${option_value.toString().length}ch"
                        oninput="getInputWidth(this)"
                    />
                    ${times_block}
                </div>
            </div>
        `;
  }

  checkAndRemoveLastSelectNew () {
    if (this.focus_id){
      let last_dialog = this.dialog[this.focus_id - 1];
      console.log("Check last dialog: ", last_dialog, this.focus_id);
      if (last_dialog?.type === "new_graphic"){
        this.dialog.pop()  // remove the last dialog if it's new graphic.
        this.focus_id -= 1;
        d3.select(this.chatBody)
          .selectAll(`#message-div-${this.focus_id + 1}`)
          .remove();
      }
    }
  }

  // 发送当前的全部参数 
  sendAllValue (focus_id = null) {
    if (focus_id) {
      this.focus_id = focus_id;
    }
    else {
      focus_id = this.focus_id;
    }

    // 检查点击的目标是否是消息文本
    const messageContainer = this.document.getElementById(
      `message-text_${this.focus_id}`
    );
    if (!messageContainer) return;

    // 获取对应id的options
    let current_dialog = this.dialog[this.focus_id - 1];

    let options = current_dialog.options;

    // 获取messageContainer下的所有message-text-input
    const messageinputs = messageContainer.querySelectorAll(
      ".message-text-input"
    );

    // 遍历inputs，获取它们的id和value
    messageinputs.forEach((messageinput) => {
      // 获取message-text-input下的第一个input(防止color由于有两个input，被重复赋值)
      const input = messageinput.querySelector("input");
      const select = messageinput.querySelector("select");
      const check = messageinput.querySelector(".check");
      if (input) {
        // 如果为coordinates
        if (input.className == "coordinates") {
          const [name, xy] = input.id.split("#_#");
          options[name].value = {
            ...(options[name].value ?? {}),
            [xy]: Number(input.value),
          };
        } else {
            options[input.id].value = parseInputValue(input);
        }
      }else if (select) { // 如果为select类型
          // 获取去除idx的select.id
          const selectId = select.id.split("_#")[0];
          options[selectId].value = select.value;
      } else if (check) { // 如果为check类型
          options[check.id].value = check.classList.contains('selected');
      }
      
    });

    console.log("sendAllValue", options);

    this.run_action_function(current_dialog);

    // 左侧svg重绘后绘制旋转图标和坐标轴
    this.drawRotationIcon(this.focus_id);
    this._drawAnnotationAxis();

    return options;
  }

  run_action_function (current_dialog) {

    let action_function = current_dialog.action;
    if (!action_function) return;
    let running_sentence = `${action_function}(current_dialog)`;
    console.log("Run: ", running_sentence);
    eval(running_sentence);
  }

  // 改变coordinate的值
  updateCoordinateValue (input, id) {
    const messageContainer = this.document.getElementById(
      `message-text_${this.focus_id}`
    );

    const xInput = messageContainer.querySelector(`[id="${id}#_#x"]`);
    const yInput = messageContainer.querySelector(`[id="${id}#_#y"]`);

    xInput.value = input.x;
    yInput.value = input.y;

    // 更新xInput和yInput的宽度
    getInputWidth(xInput);
    getInputWidth(yInput);
  }

  //绘制旋转图标的对外接口
  drawRotationIcon (focus_id = null) {
    // 如果focus_id存在，则获取对应的input
    if (focus_id) {
      this.focus_id = focus_id;
    }

    // 获取更新后的坐标
    const messageContainer = this.document.getElementById(
      `message-text_${this.focus_id}`
    );

    if (!messageContainer){
      return;
    }

    d3.select("#annotation-layer")
      .selectAll(".annotation_selection_icon")
      .remove()
    d3.select("#annotation-layer")
      .selectAll(".annotation_axis")
      .remove()

    // 获取所有coordinates类的元素
    const coordinates = messageContainer.querySelectorAll(".coordinates");
    if (!coordinates) return;

    // 用 Set 记录已处理的 ID
    const processedIds = new Set();

    // 处理每个坐标元素
    coordinates.forEach(coordinate => {
      const id = coordinate.id.split("#_#")[0];

      // 检查 ID 是否已处理
      if (processedIds.has(id)) {
        return; // 跳过已处理的 ID
      }

      const X = Number(messageContainer.querySelector(`[id="${id}#_#x"]`).value);
      const Y = Number(messageContainer.querySelector(`[id="${id}#_#y"]`).value);

      const input = { x: X, y: Y };
      // 为每个坐标创建旋转图标
      this._drawRotationIcon(input, id);
      // 记录已处理的 ID
      processedIds.add(id);
    });
  }

  //在左边的SVG上绘制rotation_icon
  _drawRotationIcon (position, id) {
    // 保存 this 引用
    const self = this;

    const svg = d3.select("#svg-container").select("#dsl-renderer-svg");
    const annotationLayer = svg.select("#annotation-layer");
    if(!annotationLayer.node()) return;
    const viewBox = svg.attr("viewBox").split(" ").map(Number);
    const clientWidth = svg.node().clientWidth;
    const clientHeight = svg.node().clientHeight;
    const [minX, minY, width, height] = viewBox;
    const iconSize = 12;
    const scale = Math.max(width / clientWidth, height / clientHeight);

    // 生成颜色
    const fill = `hsl(${annotationLayer.selectAll('.annotation_selection_icon').size()* 137.5}, 100%, 50%)`;

    // 创建旋转图标
    const iconSvg = rotation_iconSvg(position, id, scale, fill, iconSize);

    // 将图标添加到注释层
    annotationLayer.node().appendChild(iconSvg);


    d3.select(iconSvg)
      .classed("annotation_selection_icon", true)

    // 获取旋转图标元素 
    let icon = d3.select(`#${id}-icon`);

    // 绑定拖拽行为到图标
    icon.call(drag());

    function drag() {
      return d3.drag()
        .on('start', dragStarted) // 开始
        .on('drag', dragged)  // 执行中
        .on('end', dragEnded); // 结束
    };
  
    function dragStarted() {};

    function dragged(event) {
      // 获取原始鼠标事件
      const mouseEvent = event.sourceEvent;
      
      // 创建SVG坐标点
      const pt = svg.node().createSVGPoint();
      pt.x = mouseEvent.clientX;
      pt.y = mouseEvent.clientY;
      
      // 转换为SVG坐标系统
      const svgP = pt.matrixTransform(svg.node().getScreenCTM().inverse());
      
      // 计算图标位置（考虑图标大小的偏移）
      const iconX = svgP.x - scale * iconSize/2;  // 减去图标宽度的一半
      const iconY = svgP.y - scale * iconSize/2;  // 减去图标高度的一半
  
      // 更新图标位置
      icon.attr('x', iconX)
          .attr('y', iconY);
  
      // 更新坐标输入框的值（使用图标中心点坐标）
      self.updateCoordinateValue({
          x: Number(svgP.x.toFixed(2)), 
          y: Number(svgP.y.toFixed(2))
      }, id);
    };
  
    function dragEnded() { // drag end
      self.sendAllValue()
    };

    

    // 返回颜色用于绘制对话框中图标的颜色
    return fill;
  }

  _drawAnnotationAxis () {
    const svg = d3.select("#svg-container").select("#dsl-renderer-svg");
    const annotationLayer = svg.select("#annotation-layer");
    // 获取svg-container的background-color
    const backgroundColor = d3.select("#svg-container").style("background-color");
    // 获取background-color的对比色
    const contrastColor = d3.hsl(backgroundColor).l > 0.5 ? "black" : "white";
    if(!annotationLayer.node()) return;
    const viewBox = svg.attr("viewBox").split(" ").map(Number);
    const clientWidth = svg.node().clientWidth;
    const clientHeight = svg.node().clientHeight;
    const [minX, minY, width, height] = viewBox;
    const scale = Math.max(width / clientWidth, height / clientHeight);

    //判断annotationLayer中是否存在annotation_axis
    if (!annotationLayer.select(".annotation_axis").empty()) return;

    // 添加垂直参考线
    annotationLayer.append("line")
        .classed("annotation_axis", true)
        .attr("x1", 0)
        .attr("y1", Math.min(minY,0))
        .attr("x2", 0)
        .attr("y2", Math.max(minY + height,0))
        .attr("stroke-width", 1 * scale)
        .attr("stroke", contrastColor)
        .attr("stroke-dasharray", `${3*scale},${3*scale}`)  // 添加虚线效果
        .attr("stroke-opacity", 0.2);     // 添加透明度

    // 添加水平参考线
    annotationLayer.append("line")
        .classed("annotation_axis", true)
        .attr("x1", Math.min(minX,0))
        .attr("y1", 0)
        .attr("x2", Math.max(minX + width,0))
        .attr("y2", 0)
        .attr("stroke-width", 0.5*scale)
        .attr("stroke", contrastColor)
        .attr("stroke-dasharray", `${5*scale},${5*scale}`)  
        .attr("stroke-opacity", 0.2);
  }
}

function createSelectIcon () {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  svg.setAttribute('viewBox', '0 0 12 12');
  // 在svg中添加path元素
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill-rule', 'evenodd');
  path.setAttribute('clip-rule', 'evenodd');
  path.setAttribute('d', "M3.17647 4.82377L5.05882 6.70613L8.82353 2.94141L10 4.11788L5.05882 9.05908L2 6.00024L3.17647 4.82377Z");
  path.setAttribute('fill', 'white');
  svg.appendChild(path);
  return svg;
}

// 处理不同类型的input value
function parseInputValue(input) {
  const type = input.getAttribute("type");
  const value = input.value.trim();

  const parsers = {
      'number': val => Number(val),
      'object': val => JSON.parse(val),
      'array': val => {
        // 移除空白字符
        const value = val.trim();
        return value.startsWith('[') 
            ? JSON.parse(value) 
            : val.split(',').map(item => {
                const num = Number(item);
                // 如果无法转换为数字，则返回原始值
                return Number.isNaN(num) ? item : num;
            });
      }
  };

  return parsers[type] 
      ? parsers[type](value)
      : value;
}

// 生成rotation_icon
function rotation_iconSvg (position, id, scale, fill = "#FF00FF", iconSize = 12) {
  // 创建并配置 SVG 元素

  const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  Object.assign(iconSvg, {
    id: `${id}-icon`,
  });

  // 设置 SVG 属性
  const attrs = {
    x: position.x - scale * iconSize/2,
    y: position.y - scale * iconSize/2,
    width: scale * iconSize,
    height: scale * iconSize,
    viewBox: "0 0 12 12",
    cursor: "pointer"
  };
  Object.entries(attrs).forEach(([key, value]) => iconSvg.setAttribute(key, value));


  // 创建三个圆
  const circles = [
    { r: "4.5", stroke: "white", "stroke-width": "3" },
    { r: "4.5", stroke: fill },
    { r: "5", fill: "rgba(0,0,0,0.01)", opacity: "0" }
  ].forEach(attrs => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "6");
    circle.setAttribute("cy", "6");
    Object.entries(attrs).forEach(([key, value]) => {
      circle.setAttribute(key, value);
    });
    iconSvg.appendChild(circle);
  });

  return iconSvg;
}

// 优先获取value，如果不存在则获取default_value
function getValue (option) {
  return option.value ? option.value : option.default_value;
}

// 发送当前的全部参数
function sendParameters (messageContainer) {
  const messageId = messageContainer.id.split("_")[1]; // 获取消息的 ID

  const parameters = chatService.sendAllValue(messageId);

  // chatService.updateCoordinateValue({ x: 1, y: 2 })

  return parameters;
}

// 获取输入框的宽度
function getInputWidth (input) {
  input.style.width = input.value.length + "ch";
}

// 更新下拉按钮的值
function updateDropdownValue (selectElement) {
  const selectedValue = selectElement.value; // 获取选中的值
  const dropdownButton = selectElement; // 直接使用 select 元素
  dropdownButton.options[0].text = selectedValue.slice(1).split("_").join(" "); // 更新默认选项的文本为选中的值
  dropdownButton.selectedIndex = 0; // 重新选择占位符选项
  // 发送当前的全部参数
  sendParameters();
}

// 切换下拉按钮的显示状态
function toggleDropdown (id) {
  const dropdownDisplay = document
    .getElementById(`${id}-wrapper`)
    .querySelector(".dropdown-display");
  const options = document.getElementById(`${id}-options`);
  options.style.display = options.style.display === "block" ? "none" : "block";

  dropdownDisplay.classList.toggle("active", options.style.display === "block");
  dropdownDisplay.focus();
}

// 在下拉框中选择一个选项
function selectOption (id, value, is_default_value) {
  console.log("selectOption", id, value, is_default_value);
  // 如果是默认值，则icon为id-icon，否则为Group
  is_default_value = eval(is_default_value);
  const icon_id = is_default_value ? `${id}-icon` : "icon_group";

  document.getElementById(id).value = value;

  if (document.getElementById(icon_id)) {
    const icon = document.getElementById(icon_id).outerHTML;
    document
      .getElementById(`${id}-wrapper`)
      .querySelector(
        ".dropdown-display"
      ).innerHTML = `<div class="input-icon">${icon}</div> ${value
        .replace("#", "")
        .replace(/_/g, " ")} `;
  } else {
    document
      .getElementById(`${id}-wrapper`)
      .querySelector(".dropdown-display").innerHTML = `${value
        .replace("#", "")
        .replace(/_/g, " ")} `;
  }

  document.getElementById(`${id}-options`).style.display = "none";
  // 取消 active 类
  document
    .getElementById(`${id}-wrapper`)
    .querySelector(".dropdown-display")
    .classList.remove("active");
  // 发送当前的全部参数
  sendParameters(document.getElementById(`${id}-wrapper`).parentElement);
}

function updateColorInputs(sourceId, targetId) {
  console.log("sourceId", sourceId);
  console.log("targetId", targetId);
  const source = document.getElementById(sourceId);
  const target = document.getElementById(targetId);
  if (source && target) {
      target.value = source.value;
      if (target.type === 'string') {
          target.style.width = `${source.value.length}ch`;
      }
  }
}

// 处理按键事件
function handleKeyDown (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // 防止默认行为（如换行）
    // 获取event.target的父元素
    const parent = event.target.parentElement.parentElement.parentElement;
    if (parent.classList.contains("message-text")) {
      sendParameters(parent); // 调用发送参数的函数
    }
  }
}

// 解析 graphic_code 中的路径以确定合适的 viewBox
function extractViewBoxFromPath (graphic) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`
        <svg xmlns='http://www.w3.org/2000/svg'>
            ${graphic}
        </svg>`, 'image/svg+xml');

  setPathFillOpacity(doc.documentElement)

  // 获取所有路径
  const paths = doc.querySelectorAll('path');
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  // 计算所有路径的边界
  paths.forEach(path => {
    // 获取路径数据
    const d = path.getAttribute('d');
    // 先找到第一个 M 命令的坐标作为初始值
    const initialPoint = d.match(/M\s*([0-9.-]+)\s*[,\s]\s*([0-9.-]+)/);
    let lastX = initialPoint ? parseFloat(initialPoint[1]) : 0;
    let lastY = initialPoint ? parseFloat(initialPoint[2]) : 0;

    // 预处理路径数据，处理单独的垂直/水平线命令
    const processedD = d
      .replace(/V\s*([0-9.-]+)/g, (_, y) => `L ${lastX} ${y}`)  // 处理垂直线
      .replace(/H\s*([0-9.-]+)/g, (_, x) => `L ${x} ${lastY}`); // 处理水平线

    // 提取所有坐标对
    const matches = processedD.match(/[ML]\s*([0-9.-]+)\s*[,\s]\s*([0-9.-]+)/g);

    matches?.forEach(coord => {
      const [x, y] = coord.slice(1).trim().split(/[,\s]+/).map(Number);
      lastX = x;
      lastY = y;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });
  });

  return {
    svgElement: doc.documentElement.innerHTML,
    viewBox: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  };
}
