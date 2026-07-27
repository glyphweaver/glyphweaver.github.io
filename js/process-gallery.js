const petalPath = "M0 90C0 29 50 0 85 0C85 78 176 90 176 90C176 90 85 110 85 187C47 187 0 151 0 90Z";
const redProcessPetalPath = "M0 180C0 58 99.9899 0 169.404 0C169.404 156 350.5 180 350.5 180C350.5 180 169.404 220 169.404 373C94.2053 373 0 302 0 180Z";
const redProcessOrigin = { x: 353.04, y: 181.05 };

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
      { title: "Set base point", actor: "USER", intent: "Move the base point to the end of the petal.", operation: "update_parameter(origin_point)", change: "Vector.origin_point → { x: 353.04, y: 181.05 }", explanation: "The base point makes the next rotation explicit and inspectable.", dsl: {}, view: { count: 1, anchor: true } },
      { title: "Rotate ×4", actor: "USER", intent: "Rotate 4 times.", operation: "repeat_content(polar)", change: "Wrap Vector in repeat_count: 4; theta: 90°.", explanation: "A constrained repeat operation introduces a polar container instead of generating unrelated shapes.", dsl: {}, view: { count: 1, flower: true } },
      { title: "Repeat stems", actor: "USER", intent: "Repeat the curve 20 times across the canvas.", operation: "repeat_content(cartesian)", change: "Add cartesian repeat_count: 20; interval_x: 504.85.", explanation: "The same repeat abstraction works across coordinate systems.", dsl: {}, view: { count: 20, stems: true } },
      { title: "Vary curve scale", actor: "USER", intent: "Give the repeated curves varied widths and heights.", operation: "update_parameter(data_function)", change: "Vector 141.data_function → stochastic scale_x and index-aware stochastic scale_y.", explanation: "The published DSL combines random variation with an index trend; it is not a direct value-to-height mapping.", dsl: {}, view: { count: 20, stems: true, data: true } },
      { title: "Attach flowers", actor: "USER", intent: "Add a red flower on top of each curve.", operation: "combine_dsl + stick_to", change: "Add the flower unit and relation: DSL_0331_221736 → Vector 141.top.", explanation: "This step establishes composition and attachment only; flower size is not mapped yet.", dsl: {}, view: { count: 20, stems: true, data: true, flowers: true } },
      { title: "Vary flower size", actor: "USER", intent: "Give every attached flower a different size.", operation: "update_parameter(data_function)", change: "DSL_0331_221736.data_function.scale → Math.random() * 0.3 + 0.05.", explanation: "The flower-size mapping is a separate operation on the attached combine unit.", dsl: {}, view: { count: 20, stems: true, data: true, flowers: true } }
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

function drawPetal(ctx, x, y, angle, scale, color, pathData = null, geometry = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
  ctx.fillStyle = color;
  if (pathData && typeof Path2D !== "undefined") {
    const origin=geometry.petalOrigin||{x:0,y:0};
    const normalization=geometry.petalNormalization||0.024;
    ctx.scale(normalization, normalization);
    ctx.translate(-origin.x,-origin.y);
    ctx.fill(new Path2D(pathData));
  } else {
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -20, 26, -26, 47, 0); ctx.bezierCurveTo(28, 24, 4, 23, 0, 0); ctx.fill();
  }
  ctx.restore();
}
function drawFlower(ctx, x, y, scale, color, pathData = null, geometry = {}) {
  for (let i = 0; i < 4; i++) drawPetal(ctx, x, y, i * Math.PI / 2, scale, color, pathData, geometry);
  ctx.fillStyle = "#f3c34d"; ctx.beginPath(); ctx.arc(x, y, 4 * scale, 0, Math.PI * 2); ctx.fill();
}

function renderScene(canvas, scene, view, accent, geometry = {}) {
  const { ctx, w, h } = setupCanvas(canvas);
  ctx.fillStyle = "#eeece5"; ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  ctx.lineCap = "round";
  if (scene === "garden") {
    if (!view.stems) {
      if (view.flower) drawFlower(ctx, cx, cy, Math.min(w,h)/180, accent, geometry.petalPath, geometry);
      else {
        const scale=Math.min(w,h)/(geometry.petalPath?132:220);
        const normalization=geometry.petalNormalization||0.024;
        const width=(geometry.petalWidth||2003)*normalization*scale;
        const height=(geometry.petalHeight||2003)*normalization*scale;
        const origin=geometry.petalOrigin||{x:0,y:0};
        const px=cx-width/2+origin.x*normalization*scale;
        const py=cy-height/2+origin.y*normalization*scale;
        drawPetal(ctx,px,py,0,scale,accent,geometry.petalPath,geometry);
        if (view.anchor) { ctx.fillStyle="#191a17"; ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2);ctx.fill(); }
      }
    } else {
      const vals = [.7,1,.82,1.18,.9,1.1,.76,1.22,.95,1.08];
      const n = Math.min(view.count, 10), gap = Math.min(56, (w-80)/n), baseY = h*.77;
      for(let i=0;i<n;i++){
        const x=cx-(n-1)*gap/2+i*gap, ht=(view.data?vals[i]:1)*h*.31;
        let flowerX=x+18, flowerY=baseY-ht;
        if (geometry.stemPath && typeof Path2D !== "undefined") {
          const s=ht/5928.56;
          ctx.save();ctx.translate(x,baseY);ctx.scale(s,s);ctx.translate(0,-7474.66);
          ctx.strokeStyle=geometry.stemStroke||"#181818";ctx.lineWidth=Number(geometry.stemWidth)||18;
          ctx.stroke(new Path2D(geometry.stemPath));ctx.restore();
          flowerX=x+1633.32*s;flowerY=baseY-5928.56*s;
        } else {
          ctx.strokeStyle="#252622";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,baseY);ctx.bezierCurveTo(x,baseY-ht*.55,x+18,baseY-ht*.65,x+18,baseY-ht);ctx.stroke();
        }
        if(view.flowers)drawFlower(ctx,flowerX,flowerY,.28,accent,geometry.petalPath,geometry);
      }
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
    const importedPetal = single("Vector", { type: "PATH", id: "Vector", fill: "#e30613", path_d: redProcessPetalPath });
    const anchoredPetal = { ...copy(importedPetal), origin_point: copy(redProcessOrigin) };
    const processFlower = {
      id: "DSL_0715_163038",
      units: [repeat("(DSL_0715_163038)", "polar", 4, [anchoredPetal], {
        theta: 90, relative_base: { x: 0, y: 0 }
      })],
      relation: [],
      origin_point: { x: -353.04, y: -181.05 },
      type: "combine"
    };
    const bareCurve = withoutDataFunctions(curve);
    const repeatedBareCurve = copy(outer);
    repeatedBareCurve.units = [bareCurve];
    repeatedBareCurve.relation = [];
    const repeatedEncodedCurve = copy(outer);
    repeatedEncodedCurve.units = [curve];
    repeatedEncodedCurve.relation = [];
    const attachedUnscaled = copy(finalDsl);
    const attachedOuter = attachedUnscaled.units[0];
    const attachedFlower = attachedOuter.units.find(unit => unit.type === "combine");
    attachedFlower.data_function = {};
    states.push(
      root("DSL_0715_163038", [importedPetal]),
      root("DSL_0715_163038", [anchoredPetal]),
      processFlower,
      asRoot(finalDsl, [repeatedBareCurve]),
      asRoot(finalDsl, [repeatedEncodedCurve]),
      attachedUnscaled,
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
    states.push(asRoot(finalDsl, [withoutDataFunctions(branch)]), copy(glyph), asRoot(finalDsl, [withLabels]), copy(finalDsl));
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
    activeExample.renderEnvelope = {
      defsString: payload.defs_string || "",
      backgroundColor: payload.background_color || "#ffffff"
    };
    if (ex.id === "red-garden") {
      const outer = finalDsl.units[0];
      const flower = outer.units.find(unit => unit.type === "combine");
      const stemUnit = outer.units.find(unit => unit.type === "single");
      const petalUnit = flower?.units?.[0]?.units?.[0];
      activeExample.geometry = {
        petalPath: petalUnit?.source?.path_d,
        petalOrigin: petalUnit?.origin_point || { x: 0, y: 0 },
        petalNormalization: 0.024,
        petalWidth: 2003,
        petalHeight: 2003,
        stemPath: stemUnit?.source?.path_d,
        stemStroke: stemUnit?.source?.stroke,
        stemWidth: stemUnit?.source?.["stroke-width"]
      };
      activeExample.processGeometry = {
        petalPath: redProcessPetalPath,
        petalOrigin: redProcessOrigin,
        petalNormalization: 0.134,
        petalWidth: 350.5,
        petalHeight: 373
      };
    }
    const derived = deriveFromPublishedDsl(ex, finalDsl);
    activeExample.steps.forEach((step, index) => { step.dsl = derived[index] || finalDsl; });
    if (ex.id === "red-garden") {
      activeExample.steps.forEach((step,index)=>{
        step.geometry=index<3?activeExample.processGeometry:activeExample.geometry;
      });
    }
  } catch (error) {
    console.error("Could not load published DSL", error);
  }
  document.getElementById("dialog-kicker").textContent=`Case ${ex.number} · ${ex.tags.join(" / ")}`;
  document.getElementById("dialog-title").textContent=ex.title;
  const container=document.getElementById("print-steps");
  container.innerHTML=activeExample.steps.map((step,index)=>{
    const isFinal=index===activeExample.steps.length-1;
    const visual=`<div class="step-render step-svg-render" id="step-render-${activeExample.id}-${index}" data-step-index="${index}" aria-label="${step.title} rendered from its GDSL"></div>`;
    return `<article class="print-step">
      <header class="print-step-heading">
        <span class="step-index">STEP ${String(index+1).padStart(2,"0")} / ${String(activeExample.steps.length).padStart(2,"0")}</span>
        <h3>${step.title}</h3>
        <code class="step-operation">${step.operation}</code>
      </header>
      <div class="print-step-body">
        <section class="step-visual">
          <div class="panel-label"><span>Rendered result</span><span>${isFinal?"Original GDSL output":"Intermediate GDSL output"}</span></div>
          ${visual}
          <div class="change-summary">
            <span class="change-icon">Δ</span>
            <div><small>Change from previous step</small><p>${index===0?"Initial state — no previous mutation.":step.change}</p></div>
          </div>
        </section>
        <section class="step-evidence">
          <div class="intent-card">
            <div class="actor">${step.actor}</div>
            <blockquote>“${step.intent}”</blockquote>
            <p class="step-explanation">${step.explanation}</p>
          </div>
          <div class="code-card">
            <div class="code-toolbar">
              <div><span class="code-dot red"></span><span class="code-dot amber"></span><span class="code-dot green"></span></div>
              <span>legacy-gdsl.json</span>
            </div>
            <pre><code>${syntaxHighlight(step.dsl)}</code></pre>
          </div>
        </section>
      </div>
    </article>`;
  }).join("");
  dialog.showModal();
  document.body.style.overflow="hidden";
  requestAnimationFrame(async ()=>{
    const renderTargets=container.querySelectorAll(".step-svg-render[data-step-index]");
    for (const target of renderTargets) {
      const index=Number(target.dataset.stepIndex);
      await renderExactDsl(target,activeExample.steps[index].dsl,activeExample.renderEnvelope);
    }
    dialog.scrollTop=0;
  });
}

function addPublishedDefs(svg, defsString) {
  if (!defsString) return;
  let defs=svg.querySelector("defs");
  if (!defs) {
    defs=document.createElementNS("http://www.w3.org/2000/svg","defs");
    svg.insertBefore(defs,svg.firstChild);
  }
  defs.innerHTML=defsString;
}

async function renderExactDsl(container, dsl, envelope = {}) {
  container.innerHTML="";
  container.style.backgroundColor=envelope.backgroundColor||"#ffffff";
  try {
    const generator=new PatternGenerator(container.id);
    generator.generateFromJSON(copy(dsl));
    generator.downloadContainer?.remove();
    const svg=generator.svg;
    addPublishedDefs(svg,envelope.defsString);
    await new Promise(resolve=>requestAnimationFrame(resolve));
    const group=svg.querySelector(".DSL_rendered_group")||svg;
    const bbox=group.getBBox();
    const width=Math.max(bbox.width,1),height=Math.max(bbox.height,1);
    const padding=Math.max(width,height)*0.08;
    svg.setAttribute("viewBox",`${bbox.x-padding} ${bbox.y-padding} ${width+padding*2} ${height+padding*2}`);
    svg.setAttribute("preserveAspectRatio","xMidYMid meet");
    svg.setAttribute("width","100%");
    svg.setAttribute("height","100%");
  } catch (error) {
    console.error("Exact GDSL render failed",error);
    container.innerHTML=`<div class="render-error">This intermediate GDSL could not be rendered.</div>`;
  }
}

document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("is-active"));btn.classList.add("is-active");buildCards(btn.dataset.filter);
}));
document.querySelector(".close-button").addEventListener("click",()=>dialog.close());
dialog.addEventListener("close",()=>{document.body.style.overflow="";});
document.getElementById("print-case").addEventListener("click",()=>window.print());
buildCards();
