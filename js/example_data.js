/* eslint-disable */

const dialog = [
    {
        role: "system",
        content:// ##repeat_times## 后面无需带times, ##rotation_icon##用于标记旋转中心
            "Do you want to##encoded_scale## ##repeat_type## ##repeat_id## by ##repeat_times##? The interval degree is ##para1## degree. The center of rotation is ##c##. ##color##. ##check##",
        options: {

            encoded_scale:
                { default_value: [1.0, 1.0, 1.13, 1.04, 0.88, 1.1, 1.05, 0.91], type: 'array' },

            para1: {
                default_value: -60.00,
                type: "number",
                sub_type: "angle",// 如果存在sub_type则根据sub_type绘制
                value: 45.00,
            },
            check: {
                default_value: false,
                type: "checkbox",
            },
            repeat_id: {
                default_value: "Group_2",
                type: "graphic_id",
                possible_values: [
                    "#Group_2",
                    "#Group_3",
                    "#Group_4",
                    "#Group_5",
                    "#Image_6",
                    "#Frame_1",// 需要按照#Type_id来匹配
                ],

                // graphic_code: '<path id="Polygon 9" d="M393.171 477.273L529.515 398.555L665.859 477.273V634.71L529.515 713.429L393.171 634.71V477.273Z" fill="#6970FF" stroke="white" stroke-width="18.3294"></path>',
                graphic_code: `
                    <path id="Vector" d="M119.871 155.651L62 122.238V55.4128L119.871 22L177.742 55.4128V122.238L119.871 155.651Z" fill="#873DAA"/>
                    <path id="Vector_2" d="M174.143 120.158L119.871 151.49L65.5989 120.158V57.4931L119.871 26.1536L174.143 57.4931V120.158Z" stroke="white" stroke-width="7.19791"/>
                    `,
                filter_code: `
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset dx="2" dy="2"/>
                    <feGaussianBlur stdDeviation="15"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0.527 0 0 0 0 0.241 0 0 0 0 0.667 0 0 0 1 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha2"/>
                    <feOffset dx="-2" dy="-2"/>
                    <feGaussianBlur stdDeviation="10"/>
                    <feComposite in2="hardAlpha2" operator="arithmetic" k2="-1" k3="1"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0"/>
                    <feBlend mode="normal" in2="shape" result="effect2_innerShadow"/>
                    `
            },
            repeat_times: {
                default_value: 6,
                type: "number",
                sub_type: "repeat_times",
                value: 8,
            },
            c: {
                default_value: { x: 124, y: 85.83 },
                type: "coordinates",
                value: { x: 100, y: 100 },
            },
            repeat_type: {
                default_value: "rotate",
                type: "select",
                possible_values: ["rotate", "translate"],
            },
            color: {
                default_value: "#ffffff",
                type: "color",
                value: "#ff0000",
            }
        }
        // action: {
        //     "function": "blablabla",
        //     "parameters": ['repeat_type', 'check']
        // }
    },
    {

    }
];

const test_svg_string = `<svg width="373" height="365" viewBox="0 0 373 365" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Group 109">
<g id="Group" filter="url(#filter0_d_105_222)">
<path id="Vector" d="M119.871 155.651L62 122.238V55.4128L119.871 22L177.742 55.4128V122.238L119.871 155.651Z" fill="#873DAA"/>
<path id="Vector_2" d="M174.143 120.158L119.871 151.49L65.5989 120.158V57.4931L119.871 26.1536L174.143 57.4931V120.158Z" stroke="white" stroke-width="7.19791"/>
</g>
<g id="Group_2" filter="url(#filter1_d_105_222)">
<path id="Vector_3" d="M121.707 303L119.67 152.117" stroke="#C1C1C1" stroke-width="7.19791"/>
<path id="Vector_4" d="M91.1799 196.887L119.518 177.993L148.713 195.534" stroke="white" stroke-width="7.19791"/>
<path id="Vector_5" d="M104.799 210.398L120.044 200.234L135.75 209.671" stroke="white" stroke-width="7.19791"/>
<path id="Vector_6" d="M106.591 227.889L120.475 218.632L134.778 227.226" stroke="white" stroke-width="7.19791"/>
<path id="Vector_7" d="M107.037 246.934L120.922 237.677L135.231 246.272" stroke="white" stroke-width="7.19791"/>
<path id="Vector_8" d="M102.783 270.557L121.404 258.133L140.594 269.665" stroke="white" stroke-width="7.19791"/>
<path id="Vector_9" d="M112.587 285.322L121.901 279.108L131.496 284.874" stroke="white" stroke-width="7.19791"/>
<path id="Vector_10" d="M93.6565 178.606L119.123 161.129L145.381 177.382" stroke="white" stroke-width="7.19791"/>
</g>
<g id="Group_3" filter="url(#filter2_d_105_222)">
<path id="Vector_11" d="M308.802 195.317L177.116 121.64" stroke="#C1C1C1" stroke-width="7.19791"/>
<path id="Vector_13" d="M220.154 163.659L218.974 145.375L234.999 136.491" stroke="white" stroke-width="7.19791"/>
<path id="Vector_12" d="M204.991 170.537L202.797 136.548L217.691 128.291L232.585 120.035" stroke="white" stroke-width="7.19791"/>
<path id="Vector_14" d="M236.198 170.852L235.124 154.199L249.718 146.111" stroke="white" stroke-width="7.19791"/>
<path id="Vector_15" d="M252.916 179.989L251.842 163.336L266.439 155.241" stroke="white" stroke-width="7.19791"/>
<path id="Vector_16" d="M271.246 195.485L269.797 173.147L289.378 162.293" stroke="white" stroke-width="7.19791"/>
<path id="Vector_17" d="M288.933 194.376L288.21 183.204L298.002 177.777" stroke="white" stroke-width="7.19791"/>
<path id="Vector_18" d="M187.048 157.412L184.647 126.619L211.851 112.006" stroke="white" stroke-width="7.19791"/>
</g>
</g>
<defs>
<filter id="filter0_d_105_222" x="0.0981102" y="-39.9042" width="239.546" height="257.457" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="30.9509"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.91 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_105_222"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_105_222" result="shape"/>
</filter>
<filter id="filter1_d_105_222" x="27.2815" y="90.1661" width="185.187" height="274.784" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="30.9509"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.91 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_105_222"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_105_222" result="shape"/>
</filter>
<filter id="filter2_d_105_222" x="113.457" y="46.9336" width="259.003" height="213.426" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="30.9509"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.91 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_105_222"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_105_222" result="shape"/>
</filter>
</defs>
</svg>`;

const example_data = {
    units: [
        {
            id: "snow",
            type: "repeat",
            source: {
                type: "repeat",
                coordinate_system: "cartesian",
                repeat_rule: "even",
                y: 250,
                x: 100,
            },
            repeat_count: "3",
            encoded_data: [
                {
                    snow: [
                        [0.38, 0.75, 0.82, 0.52, 0.31, 0.25, 0.19],
                        [0.42, 0.88, 0.79, 0.48, 0.29, 0.23, 0.18],
                        [0.35, 0.92, 0.84, 0.45, 0.28, 0.22, 0.17],
                        [0.45, 0.85, 0.78, 0.49, 0.32, 0.24, 0.2],
                        [0.41, 0.89, 0.81, 0.47, 0.3, 0.23, 0.18],
                        [0.37, 0.86, 0.83, 0.5, 0.33, 0.26, 0.21],
                    ],
                    scale: 0.2,
                    color: "#ffffff",
                },
                {
                    snow: [
                        [0.38, 0.75, 0.82, 0.52, 0.31, 0.25, 0.19],
                        [0.42, 0.88, 0.79, 0.48, 0.29, 0.23, 0.18],
                        [0.35, 0.92, 0.84, 0.45, 0.28, 0.22, 0.17],
                        [0.45, 0.85, 0.78, 0.49, 0.32, 0.24, 0.2],
                        [0.41, 0.89, 0.81, 0.47, 0.3, 0.23, 0.18],
                        [0.37, 0.86, 0.83, 0.5, 0.33, 0.26, 0.21],
                    ],
                    scale: 0.4,
                    color: "#ff0000",
                },
                {
                    snow: [
                        [0.38, 0.75, 0.82, 0.52, 0.31, 0.25, 0.19],
                        [0.42, 0.88, 0.79, 0.48, 0.29, 0.23, 0.18],
                        [0.35, 0.92, 0.84, 0.45, 0.28, 0.22, 0.17],
                        [0.45, 0.85, 0.78, 0.49, 0.32, 0.24, 0.2],
                        [0.41, 0.89, 0.81, 0.47, 0.3, 0.23, 0.18],
                        [0.37, 0.86, 0.83, 0.5, 0.33, 0.26, 0.21],
                    ],
                    scale: 0.3,
                    color: "#ff00ff",
                },
            ],
            units: [
                {
                    id: "branches",
                    type: "repeat",
                    source: {
                        type: "repeat",
                        coordinate_system: "polar",
                        repeat_rule: "even",
                        theta: 60,
                        theta_offset: 0,
                        r_base: 40,
                    },
                    encoded_data: {
                        value: "parent.snow",
                    },
                    data_function: {
                        scale: "0.2",
                        r_base: "currentData.scale * 200",
                    },
                    repeat_count: "6",
                    units: [
                        {
                            id: "single_branch",
                            type: "repeat",
                            source: {
                                type: "repeat",
                                coordinate_system: "cartesian",
                                repeat_rule: "even",
                                x: 14,
                                x_offset: 5,
                            },
                            repeat_count: "7",
                            units: [
                                {
                                    id: "line",
                                    type: "single",
                                    source: {
                                        type: "PATH",
                                        path_data: [
                                            {
                                                type: "M",
                                                values: [10, 20],
                                            },
                                            {
                                                type: "L",
                                                values: [0, 0],
                                            },
                                            {
                                                type: "L",
                                                values: [10, -20],
                                            },
                                        ],
                                        "stroke-width": 4,
                                        stroke: "#FFFFFF",
                                    },
                                    data_function: {
                                        scale: "value",
                                    },
                                    origin_point: {
                                        x: 0,
                                        y: 0,
                                    },
                                },
                            ],
                        },
                        {
                            id: "branch_center",
                            type: "single",
                            source: {
                                type: "PATH",
                                path_data: [
                                    {
                                        type: "M",
                                        values: [0, 0],
                                    },
                                    {
                                        type: "L",
                                        values: [100, 0],
                                    },
                                ],
                                "stroke-width": 4,
                                stroke: "#FFFFFF",
                            },
                            origin_point: {
                                x: 0,
                                y: 0,
                            },
                        },
                    ],
                },
                {
                    id: "POLYGON_6",
                    type: "single",
                    source: {
                        type: "PATH",
                        path_data: [
                            {
                                type: "M",
                                values: [200, 0],
                            },
                            {
                                type: "L",
                                values: [100, 173.205],
                            },
                            {
                                type: "L",
                                values: [-100, 173.205],
                            },
                            {
                                type: "L",
                                values: [-200, 0],
                            },
                            {
                                type: "L",
                                values: [-100, -173.205],
                            },
                            {
                                type: "L",
                                values: [100, -173.205],
                            },
                            {
                                type: "Z",
                            },
                        ],
                        "stroke-width": 4,
                        stroke: "#FFFFFF",
                        fill: "#97CFF7",
                    },
                    data_function: {
                        scale: "currentData.scale",
                        fill: "currentData.color",
                    },
                    origin_point: {
                        x: 0,
                        y: 0,
                    },
                },
            ],
        },
    ],
    relation: [
        {
            type: "fixed-position",
            source: "multi_snow",
            position: {
                x: 250,
                y: 200,
            },
        },
    ],
};
