const petalPath = "M0 90C0 29 50 0 85 0C85 78 176 90 176 90C176 90 85 110 85 187C47 187 0 151 0 90Z";

const single = (id, source, dataFunction = {}) => ({
  id, type: "single", origin_point: { x: 0, y: 0 }, source, data_function: dataFunction
});
const repeat = (id, coordinate, count, units, extra = {}) => ({
  id, type: "repeat", origin_point: { x: 0, y: 0 },
  source: { type: "repeat", coordinate_system: coordinate, repeat_rule: "even", repeat_count: count, ...extra },
  units, data_function: {}
});
const root = (id, units, relation = []) => ({ id, type: "combine", units, relation });

const redPetal = single("Vector", { type: "PATH", id: "Vector", fill: "#e1362d", path_d: petalPath });
const bluePetal = single("petal", { type: "RECT", id: "petal", x: 0, y: 0, width: 26, height: 116, fill: "#405fc2" });
const stem = single("curve", { type: "PATH", id: "curve", path_d: "M0 160C0 62 46 74 46 0", stroke: "#252622", "stroke-width": 4 }, {});

const examples = [
  {
    id: "red-garden", number: "01", title: "Red Flower Garden",
    summary: "From one imported petal to a nested, relational composition.",
    tags: ["repeat", "data", "compose"], accent: "#e1362d", scene: "garden",
    originalDslFile: "dsl_setting/red_flower_garden.json", paperImage: "public/paper-cases/red-flower-garden.png",
    steps: [
      { title: "Import petal", actor: "USER", intent: "Load the red petal drawn in Figma into GlyphWeaver.", operation: "import_svg", change: "A single PATH unit enters the GDSL.", explanation: "The visual mark remains editable because its SVG geometry and origin are represented directly.", dsl: root("DSL_RED", [redPetal]), view: { count: 1 } },
      { title: "Set base point", actor: "USER", intent: "Move the base point to the end of the petal.", operation: "update_parameter(origin_point)", change: "Vector.origin_point → { x: 176, y: 90 }", explanation: "The base point makes the next rotation explicit and inspectable.", dsl: root("DSL_RED", [{ ...redPetal, origin_point: { x: 176, y: 90 } }]), view: { count: 1, anchor: true } },
      { title: "Rotate ×4", actor: "USER", intent: "Rotate 4 times.", operation: "repeat_content(polar)", change: "Wrap Vector in repeat_count: 4; theta: 90°.", explanation: "A constrained repeat operation introduces a polar container instead of generating unrelated shapes.", dsl: root("DSL_RED", [repeat("(red flower)", "polar", 4, [{ ...redPetal, origin_point: { x: 176, y: 90 } }], { theta: 90, relative_base: { x: 0, y: 0 } })]), view: { count: 1, flower: true } },
      { title: "Repeat stems", actor: "USER", intent: "Repeat the curve 10 times with a horizontal interval of 52.", operation: "repeat_content(cartesian)", change: "Add cartesian repeat_count: 10; interval_x: 52.", explanation: "The same repeat abstraction works across coordinate systems.", dsl: root("DSL_GARDEN", [repeat("(garden)", "cartesian", 10, [stem], { interval_x: 52, interval_y: 0 })]), view: { count: 10, stems: true } },
      { title: "Encode height", actor: "USER", intent: "Set each curve height from the values.", operation: "update_parameter(data_function)", change: "curve.data_function.scale_y → value", explanation: "Data binding is part of the unit, so the mapping is visible rather than hidden in generated code.", dsl: root("DSL_GARDEN", [repeat("(garden)", "cartesian", 10, [{ ...stem, data_function: { scale_y: "value" } }], { interval_x: 52, interval_y: 0, encoded_data: [0.7,1,0.82,1.18,0.9,1.1,0.76,1.22,0.95,1.08] })]), view: { count: 10, stems: true, data: true } },
      { title: "Attach flowers", actor: "USER", intent: "Add a red flower on top of each curve.", operation: "combine_dsl + stick_to", change: "Add flower unit and relation: flower → curve.top.", explanation: "The relation states attachment separately from geometry, making the final composition reusable and editable.", dsl: root("DSL_GARDEN", [repeat("(garden)", "cartesian", 10, [{ ...stem, data_function: { scale_y: "value" } }, root("red flower", [repeat("(red flower)", "polar", 4, [redPetal], { theta: 90 })])], { interval_x: 52, interval_y: 0, encoded_data: [0.7,1,0.82,1.18,0.9,1.1,0.76,1.22,0.95,1.08] })], [{ source_id: "red flower", target_id: "curve", stick_to: { point: "top", distance: { x: 0, y: 0 } } }]), view: { count: 10, stems: true, data: true, flowers: true } }
    ]
  },
  {
    id: "blue-flower", number: "02", title: "Blue Flower",
    summary: "Infer a radial pattern, then bind twelve values to petal length.",
    tags: ["repeat", "data"], accent: "#405fc2", scene: "blueFlower",
    originalDslFile: "dsl_setting/blue_flower.json", paperImage: "public/paper-cases/blue-flower-array.png",
    steps: [
      { title: "Draw petals", actor: "USER", intent: "Draw three blue petals around the same center.", operation: "import_svg", change: "Three RECT marks are observed.", explanation: "Repeated marks give the system evidence for a polar structure.", dsl: root("DSL_BLUE", [bluePetal]), view: { count: 3 } },
      { title: "Infer pattern", actor: "SYSTEM", intent: "A polar repeat is inferred from angle and shared base point.", operation: "infer_repeat(polar)", change: "Create repeat container; theta inferred as 30°.", explanation: "The inferred operation remains exposed for confirmation.", dsl: root("DSL_BLUE", [repeat("(petals)", "polar", 3, [bluePetal], { theta: 30, relative_base: { x: 0, y: 116 } })]), view: { count: 3 } },
      { title: "Set count", actor: "USER", intent: "Change the repetition count to 12.", operation: "update_parameter(repeat_count)", change: "repeat_count: 3 → 12.", explanation: "Direct manipulation and natural language update the same GDSL parameter.", dsl: root("DSL_BLUE", [repeat("(petals)", "polar", 12, [bluePetal], { theta: 30, relative_base: { x: 0, y: 116 } })]), view: { count: 12 } },
      { title: "Bind values", actor: "USER", intent: "Map the twelve values to petal length.", operation: "update_parameter(data_function)", change: "petal.data_function.scale → value; add encoded_data.", explanation: "Each repeated child receives one value from the container.", dsl: root("DSL_BLUE", [{ ...repeat("(petals)", "polar", 12, [{ ...bluePetal, data_function: { scale: "value" } }], { theta: 30, relative_base: { x: 0, y: 116 } }), encoded_data: [1,.69,.69,.58,.79,.57,.94,.84,.6,.88,.67,.78] }]), view: { count: 12, data: true } }
    ]
  },
  {
    id: "better-life", number: "03", title: "Better Life Index",
    summary: "A country glyph composed from eleven indicators, a stem, and a label.",
    tags: ["data", "compose"], accent: "#7d50b5", scene: "blueFlower",
    originalDslFile: "dsl_setting/better_life_index.json", paperImage: "public/paper-cases/better-life-index.png",
    steps: [
      { title: "Import petal", actor: "USER", intent: "Import one indicator petal from the source design.", operation: "import_svg", change: "Create the original Vector 165 PATH unit.", explanation: "The published SVG path is preserved as the leaf unit.", dsl: {}, view: { count: 1 } },
      { title: "Build country glyph", actor: "USER", intent: "Repeat the petal for the eleven Better Life indicators.", operation: "repeat_content(polar)", change: "Create the published 11-petal polar container.", explanation: "One repeated container represents one country's indicator profile.", dsl: {}, view: { count: 11 } },
      { title: "Repeat countries", actor: "USER", intent: "Repeat the country glyph for eight countries.", operation: "repeat_content(cartesian)", change: "Create the published 8-item Cartesian container.", explanation: "The country glyph, stem, and their relation are repeated together.", dsl: {}, view: { count: 8 } },
      { title: "Bind data & labels", actor: "USER", intent: "Bind indicator colors and scales, then label each country.", operation: "bind_data + combine_dsl", change: "Restore the original data functions, relations, and labels.", explanation: "This state is the exact GDSL distributed with the website.", dsl: {}, view: { count: 8, data: true, labels: true } }
    ]
  },
  {
    id: "phone-rates", number: "04", title: "Phone Rates",
    summary: "A Cartesian repeat whose spacing, color, and scale are data-driven.",
    tags: ["repeat", "data"], accent: "#42d7a8", scene: "bars",
    originalDslFile: "dsl_setting/phone_rates.json", paperImage: "public/paper-cases/phone-rates.png",
    steps: [
      { title: "Import branch", actor: "USER", intent: "Import one branching rate mark.", operation: "import_svg", change: "Create the original Vector 167 PATH unit.", explanation: "The published path becomes the reusable leaf unit.", dsl: {}, view: { count: 1 } },
      { title: "Build state glyph", actor: "USER", intent: "Repeat the branch radially to form one state glyph.", operation: "repeat_content(polar)", change: "Create the published 8-branch polar container.", explanation: "Branch scale is controlled inside the nested repeat.", dsl: {}, view: { count: 4 } },
      { title: "Repeat states", actor: "USER", intent: "Repeat the glyph and add state and rate labels.", operation: "repeat_content(cartesian) + combine_dsl", change: "Create the published 4-item Cartesian container.", explanation: "Text and glyph units share the same repeated data context.", dsl: {}, view: { count: 4, data: true } },
      { title: "Bind rate data", actor: "USER", intent: "Bind state names and the rate values to each glyph.", operation: "bind_data", change: "Restore the original encoded data and data functions.", explanation: "This state is the exact GDSL distributed with the website.", dsl: {}, view: { count: 4, data: true, color: true } }
    ]
  },
  {
    id: "snowflake", number: "05", title: "Nested Snowflake",
    summary: "Two levels of repetition expose a hierarchical visual grammar.",
    tags: ["repeat", "compose"], accent: "#5b9db4", scene: "snow",
    steps: [
      { title: "Draw branch", actor: "USER", intent: "Draw one V-shaped branch segment.", operation: "import_svg", change: "Create one PATH branch segment.", explanation: "The smallest reusable unit becomes the leaf of the hierarchy.", dsl: root("SNOW", [single("segment", { type: "PATH", path_d: "M10 20L0 0L10 -20", stroke: "#5b9db4", "stroke-width": 4 })]), view: { segments: 1, arms: 1 } },
      { title: "Build arm", actor: "USER", intent: "Repeat the segment 6 times along a line.", operation: "repeat_content(cartesian)", change: "Nest segment in cartesian repeat_count: 6.", explanation: "The first repeat creates one complete arm.", dsl: root("SNOW", [repeat("(arm)", "cartesian", 6, [single("segment", { type: "PATH", path_d: "M10 20L0 0L10 -20", stroke: "#5b9db4", "stroke-width": 4 })], { interval_x: 18 })]), view: { segments: 6, arms: 1 } },
      { title: "Rotate arms", actor: "USER", intent: "Rotate the arm 6 times around the center.", operation: "repeat_content(polar)", change: "Wrap arm in polar repeat_count: 6; theta: 60°.", explanation: "Nested coordinate systems make the construction compact and predictable.", dsl: root("SNOW", [repeat("(snowflake)", "polar", 6, [repeat("(arm)", "cartesian", 6, [single("segment", { type: "PATH", path_d: "M10 20L0 0L10 -20", stroke: "#5b9db4", "stroke-width": 4 })], { interval_x: 18 })], { theta: 60 })]), view: { segments: 6, arms: 6 } },
      { title: "Encode density", actor: "USER", intent: "Use six values to change the length of each arm.", operation: "bind_data", change: "snowflake.encoded_data added; arm.scale_x → value.", explanation: "Data can target a nested container, not only a primitive mark.", dsl: root("SNOW", [{ ...repeat("(snowflake)", "polar", 6, [{ ...repeat("(arm)", "cartesian", 6, [single("segment", { type: "PATH", path_d: "M10 20L0 0L10 -20", stroke: "#5b9db4", "stroke-width": 4 })], { interval_x: 18 }), data_function: { scale_x: "value" } }], { theta: 60 }), encoded_data: [1,.72,.9,.6,.82,.68] }]), view: { segments: 6, arms: 6, data: true } }
    ]
  },
  {
    id: "orbit", number: "06", title: "Relational Orbit",
    summary: "Attach annotations to repeated marks without baking positions into geometry.",
    tags: ["repeat", "compose"], accent: "#338a67", scene: "orbit",
    steps: [
      { title: "Create node", actor: "USER", intent: "Create one green circular node.", operation: "import_svg", change: "Create a single ELLIPSE unit.", explanation: "The node is independent of any layout.", dsl: root("ORBIT", [single("node", { type: "ELLIPSE", rx: 18, ry: 18, fill: "#338a67" })]), view: { count: 1 } },
      { title: "Make orbit", actor: "USER", intent: "Repeat 8 nodes around the center.", operation: "repeat_content(polar)", change: "repeat_count: 8; theta: 45°; r_base: 128.", explanation: "The polar container owns the layout while the node stays unchanged.", dsl: root("ORBIT", [repeat("(orbit)", "polar", 8, [single("node", { type: "ELLIPSE", rx: 18, ry: 18, fill: "#338a67" })], { theta: 45, r_base: 128 })]), view: { count: 8 } },
      { title: "Add labels", actor: "USER", intent: "Add a number outside every node.", operation: "combine_dsl", change: "Add TEXT label as a sibling inside the repeat.", explanation: "Both children inherit the same repeated data context.", dsl: root("ORBIT", [repeat("(orbit)", "polar", 8, [single("node", { type: "ELLIPSE", rx: 18, ry: 18, fill: "#338a67" }), single("label", { type: "TEXT", text: "index + 1", fill: "#191a17" })], { theta: 45, r_base: 128 })]), view: { count: 8, labels: true } },
      { title: "Constrain labels", actor: "USER", intent: "Keep each number 16 pixels outside its node.", operation: "stick_to", change: "Add relation label → node.right, distance.x: 16.", explanation: "The relation preserves attachment when count or radius changes.", dsl: root("ORBIT", [repeat("(orbit)", "polar", 8, [single("node", { type: "ELLIPSE", rx: 18, ry: 18, fill: "#338a67" }), single("label", { type: "TEXT", text: "index + 1", fill: "#191a17" })], { theta: 45, r_base: 128 })], [{ source_id: "label", target_id: "node", stick_to: { point: "right", distance: { x: 16, y: 0 } } }]), view: { count: 8, labels: true, relation: true } }
    ]
  }
];

const grid = document.getElementById("gallery-grid");
const dialog = document.getElementById("walkthrough-dialog");
let activeExample = null;
let activeStep = 0;

function syntaxHighlight(json) {
  const escaped = JSON.stringify(json, null, 2).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.replace(/("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?=\s*:)|"(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d+)?)/g, match => {
    let cls = "json-number";
    if (/^"/.test(match)) cls = /:$/.test(match) ? "json-key" : "json-string";
    else if (/true|false|null/.test(match)) cls = "json-boolean";
    return `<span class="${cls}">${match}</span>`;
  });
}

function setupCanvas(canvas) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(300, rect.width * ratio);
  canvas.height = Math.max(220, rect.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  return { ctx, w: rect.width, h: rect.height };
}

function drawPetal(ctx, x, y, angle, scale, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.bezierCurveTo(0, -20, 26, -26, 47, 0); ctx.bezierCurveTo(28, 24, 4, 23, 0, 0); ctx.fill(); ctx.restore();
}
function drawFlower(ctx, x, y, scale, color) {
  for (let i = 0; i < 4; i++) drawPetal(ctx, x, y, i * Math.PI / 2, scale, color);
  ctx.fillStyle = "#f3c34d"; ctx.beginPath(); ctx.arc(x, y, 4 * scale, 0, Math.PI * 2); ctx.fill();
}

function renderScene(canvas, scene, view, accent) {
  const { ctx, w, h } = setupCanvas(canvas);
  ctx.fillStyle = "#eeece5"; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  ctx.lineCap = "round";
  if (scene === "garden") {
    if (!view.stems) {
      if (view.flower) drawFlower(ctx, cx, cy, Math.min(w,h)/180, accent);
      else { drawPetal(ctx, cx - 45, cy, 0, Math.min(w,h)/220, accent); if (view.anchor) { ctx.fillStyle="#191a17"; ctx.beginPath(); ctx.arc(cx-45,cy,5,0,Math.PI*2);ctx.fill(); } }
    } else {
      const vals = [.7,1,.82,1.18,.9,1.1,.76,1.22,.95,1.08];
      const n = Math.min(view.count, 10), gap = Math.min(56, (w-80)/n), baseY = h*.77;
      for(let i=0;i<n;i++){ const x=cx-(n-1)*gap/2+i*gap, ht=(view.data?vals[i]:1)*h*.31; ctx.strokeStyle="#252622";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,baseY);ctx.bezierCurveTo(x,baseY-ht*.55,x+18,baseY-ht*.65,x+18,baseY-ht);ctx.stroke(); if(view.flowers)drawFlower(ctx,x+18,baseY-ht,.28,accent); }
    }
  } else if (scene === "blueFlower" || scene === "scores") {
    const n=view.count||1, vals=scene==="scores"?[.92,.74,.86,.61]:[1,.69,.69,.58,.79,.57,.94,.84,.6,.88,.67,.78];
    for(let i=0;i<n;i++){const a=i*2*Math.PI/n-Math.PI/2, len=(view.data?vals[i]:1)*Math.min(w,h)*.27;ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.fillStyle=accent;roundRect(ctx,12,-13,len,26,13);ctx.fill();ctx.restore();}
    ctx.fillStyle="#fffefa";ctx.beginPath();ctx.arc(cx,cy,10,0,Math.PI*2);ctx.fill();
    if(view.labels){["Math 92","Physics 74","Chem. 86","Philos. 61"].forEach((t,i)=>{const a=i*Math.PI/2-Math.PI/2;ctx.fillStyle="#191a17";ctx.font="11px DM Mono";ctx.textAlign="center";ctx.fillText(t,cx+Math.cos(a)*Math.min(w,h)*.36,cy+Math.sin(a)*Math.min(w,h)*.36);});}
  } else if (scene === "bars") {
    const vals=[.42,.67,.51,.88,.72,.59,.96,.64], n=view.count||1, gap=Math.min(62,(w-70)/n), base=h*.72;
    for(let i=0;i<n;i++){const ht=(view.data?vals[i]:.7)*h*.38,x=cx-(n-1)*gap/2+i*gap;ctx.fillStyle=view.color&&vals[i]>.75?"#e1362d":accent;roundRect(ctx,x-17,base-ht,34,ht,7);ctx.fill();ctx.fillStyle="#fffefa";roundRect(ctx,x-10,base-ht+8,20,ht-18,3);ctx.fill();ctx.fillStyle="#191a17";ctx.font="10px DM Mono";ctx.textAlign="center";ctx.fillText(view.data?Math.round(vals[i]*100):"",x,base+18);}
  } else if (scene === "snow") {
    const arms=view.arms||1, seg=view.segments||1, vals=[1,.72,.9,.6,.82,.68];
    ctx.strokeStyle=accent;ctx.lineWidth=3;
    for(let a=0;a<arms;a++){ctx.save();ctx.translate(cx,cy);ctx.rotate(a*2*Math.PI/arms);ctx.scale(view.data?vals[a]:1,1);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.min(w,h)*.3,0);ctx.stroke();for(let s=1;s<=seg;s++){const x=s*Math.min(w,h)*.3/(seg+1);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-10,-11);ctx.moveTo(x,0);ctx.lineTo(x-10,11);ctx.stroke();}ctx.restore();}
  } else if (scene === "orbit") {
    const n=view.count||1, r=n===1?0:Math.min(w,h)*.28;
    ctx.strokeStyle="#c5c2b9";ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<n;i++){const a=i*2*Math.PI/n-Math.PI/2,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(x,y,16,0,Math.PI*2);ctx.fill();if(view.labels){ctx.fillStyle="#191a17";ctx.font="11px DM Mono";ctx.textAlign="center";const d=view.relation?33:24;ctx.fillText(i+1,x+Math.cos(a)*d,y+Math.sin(a)*d+4);}}
  }
}
function roundRect(ctx,x,y,w,h,r){const rr=Math.min(r,Math.abs(w)/2,Math.abs(h)/2);ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,rr):(ctx.rect(x,y,w,h));}

function buildCards(filter="all") {
  grid.innerHTML="";
  examples.filter(ex=>ex.originalDslFile && (filter==="all"||ex.tags.includes(filter))).forEach(ex=>{
    const card=document.createElement("article"); card.className="case-card"; card.tabIndex=0;
    card.innerHTML=`<div class="card-preview"><img src="${ex.paperImage}" alt="${ex.title}, as published in the GlyphWeaver paper"></div><div class="card-content"><div class="card-meta"><span class="tag">case ${ex.number}</span>${ex.tags.map(t=>`<span class="tag">${t}</span>`).join("")}<span class="tag">paper figure</span></div><h3>${ex.title}</h3><p>${ex.summary}</p><div class="card-foot"><span>${ex.steps.length} derived states · original DSL</span><b>↗</b></div></div>`;
    const open=()=>openExample(ex); card.addEventListener("click",open); card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
    grid.appendChild(card);
  });
}

const copy = value => JSON.parse(JSON.stringify(value));
const withoutDataFunctions = unit => {
  const next = copy(unit);
  if (next.data_function) next.data_function = {};
  (next.units || []).forEach(child => Object.assign(child, withoutDataFunctions(child)));
  return next;
};
const asRoot = (finalDsl, units, relation = []) => ({
  id: finalDsl.id, type: "combine", origin_point: finalDsl.origin_point,
  units: units.map(copy), relation: copy(relation)
});

function deriveFromPublishedDsl(example, finalDsl) {
  const states = [];
  const outer = finalDsl.units[0];
  if (example.id === "blue-flower") {
    const leaf = outer.units[0];
    const inferred = copy(outer);
    inferred.source.repeat_count = 3;
    inferred.encoded_data = [];
    inferred.units[0].data_function = {};
    const twelve = copy(inferred);
    twelve.source.repeat_count = 12;
    states.push(asRoot(finalDsl, [leaf]), asRoot(finalDsl, [inferred]), asRoot(finalDsl, [twelve]), copy(finalDsl));
  } else if (example.id === "red-garden") {
    const flower = outer.units.find(unit => unit.type === "combine");
    const curve = outer.units.find(unit => unit.type === "single");
    const petal = flower.units[0].units[0];
    const bareCurve = withoutDataFunctions(curve);
    const repeatedBareCurve = copy(outer);
    repeatedBareCurve.units = [bareCurve];
    repeatedBareCurve.relation = [];
    const repeatedEncodedCurve = copy(outer);
    repeatedEncodedCurve.units = [curve];
    repeatedEncodedCurve.relation = [];
    states.push(
      asRoot(finalDsl, [petal]),
      asRoot(finalDsl, [petal]),
      copy(flower),
      asRoot(finalDsl, [repeatedBareCurve]),
      asRoot(finalDsl, [repeatedEncodedCurve]),
      copy(finalDsl)
    );
  } else if (example.id === "better-life") {
    const flower = outer.units.find(unit => unit.type === "combine");
    const stemUnit = outer.units.find(unit => unit.type === "single" && unit.source?.type === "PATH");
    const petal = flower.units[0].units[0];
    const repeated = copy(outer);
    repeated.units = [withoutDataFunctions(stemUnit), withoutDataFunctions(flower)];
    repeated.relation = copy(outer.relation || []);
    states.push(asRoot(finalDsl, [petal]), copy(flower), asRoot(finalDsl, [repeated]), copy(finalDsl));
  } else if (example.id === "phone-rates") {
    const glyph = outer.units.find(unit => unit.type === "combine");
    const branch = glyph.units[0].units[0];
    const repeatedGlyph = copy(outer);
    repeatedGlyph.units = [withoutDataFunctions(glyph)];
    const withLabels = withoutDataFunctions(outer);
    states.push(asRoot(finalDsl, [branch]), copy(glyph), asRoot(finalDsl, [withLabels]), copy(finalDsl));
  }
  return states;
}

async function openExample(ex) {
  activeExample=copy(ex); activeStep=0;
  try {
    const response = await fetch(ex.originalDslFile);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const finalDsl = payload.dsl || payload;
    const derived = deriveFromPublishedDsl(ex, finalDsl);
    activeExample.steps.forEach((step, index) => { step.dsl = derived[index] || finalDsl; });
  } catch (error) {
    console.error("Could not load published DSL", error);
  }
  document.getElementById("dialog-kicker").textContent=`Case ${ex.number} · ${ex.tags.join(" / ")}`;
  document.getElementById("dialog-title").textContent=ex.title;
  const strip=document.getElementById("step-strip"); strip.innerHTML="";
  ex.steps.forEach((step,i)=>{const btn=document.createElement("button");btn.className="step-tab";btn.role="tab";btn.innerHTML=`<span>STEP ${String(i+1).padStart(2,"0")}</span><strong>${step.title}</strong>`;btn.addEventListener("click",()=>showStep(i));strip.appendChild(btn);});
  dialog.showModal(); document.body.style.overflow="hidden"; showStep(0);
}
function showStep(index) {
  activeStep=index; const step=activeExample.steps[index];
  document.querySelectorAll(".step-tab").forEach((el,i)=>{el.classList.toggle("is-active",i===index);el.setAttribute("aria-selected",i===index);});
  document.querySelectorAll(".step-tab")[index]?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
  document.getElementById("actor-label").textContent=step.actor;
  document.getElementById("intent-text").textContent=`“${step.intent}”`;
  document.getElementById("operation-code").textContent=step.operation;
  document.getElementById("dsl-code").innerHTML=syntaxHighlight(step.dsl);
  document.getElementById("change-text").textContent=index===0?"Initial state — no previous mutation.":step.change;
  document.getElementById("step-explanation").textContent=step.explanation;
  document.getElementById("step-count").textContent=`${index+1} / ${activeExample.steps.length}`;
  document.getElementById("previous-step").disabled=index===0;
  document.getElementById("next-step").disabled=index===activeExample.steps.length-1;
  const canvas = document.getElementById("render-canvas");
  const paperResult = document.getElementById("paper-result");
  const isPublishedFinal = index === activeExample.steps.length - 1;
  paperResult.style.display = isPublishedFinal ? "block" : "none";
  canvas.style.display = isPublishedFinal ? "none" : "block";
  document.getElementById("render-status").textContent = isPublishedFinal ? "Published paper result" : "Derived intermediate preview";
  if (isPublishedFinal) {
    paperResult.src = activeExample.paperImage;
    paperResult.alt = `${activeExample.title}, published result`;
  } else {
    requestAnimationFrame(()=>renderScene(canvas,activeExample.scene,step.view,activeExample.accent));
  }
}

document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("is-active"));btn.classList.add("is-active");buildCards(btn.dataset.filter);
}));
document.querySelector(".close-button").addEventListener("click",()=>dialog.close());
dialog.addEventListener("close",()=>{document.body.style.overflow="";});
document.getElementById("previous-step").addEventListener("click",()=>{if(activeStep>0)showStep(activeStep-1);});
document.getElementById("next-step").addEventListener("click",()=>{if(activeStep<activeExample.steps.length-1)showStep(activeStep+1);});
document.getElementById("copy-code").addEventListener("click",async e=>{await navigator.clipboard.writeText(JSON.stringify(activeExample.steps[activeStep].dsl,null,2));e.target.textContent="Copied";setTimeout(()=>e.target.textContent="Copy",1200);});
window.addEventListener("keydown",e=>{if(!dialog.open)return;if(e.key==="ArrowRight"&&activeStep<activeExample.steps.length-1)showStep(activeStep+1);if(e.key==="ArrowLeft"&&activeStep>0)showStep(activeStep-1);});
window.addEventListener("resize",()=>{if(dialog.open && activeStep < activeExample.steps.length-1)renderScene(document.getElementById("render-canvas"),activeExample.scene,activeExample.steps[activeStep].view,activeExample.accent);});
buildCards();
