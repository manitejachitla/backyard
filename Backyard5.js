window.runFunc = (ctx, input, cb)=>{
    let getThingDetails = input.getThingDetails;
    let options = input.options;
    let apiData = input.apiData;

    let dataObj = {};
    let finalData = {};
    let color_arr = [
        '#666633',
        '#333300',
        '#336600',
        '#004d00',
        '#5DA027',
        '#339966',
        '#669999',
        '#006666',
    ];
    for (let i = 0; i < getThingDetails.length; i++) {
        let thing_id = getThingDetails[i].id;
        if (!dataObj[thing_id]) {
            dataObj[thing_id] = [];
        }
        if (!finalData[thing_id]) {
            finalData[thing_id] = {
                all: {
                    conf: [],
                    data: [],
                },
                grid: {
                    conf: [],
                    data: [],
                    zone: 'Asia/Kolkata',
                },
                graph: {
                    conf: [],
                    data: [],
                    zone: 'Asia/Kolkata',
                },
            };
        }

        let summaryThingsObject = {};
        let paramTitlesHashMap = {};

        /* DETAILED DATA */
        let detailedTableColumns = [];
        let detailedTableDataTypes = {
            time: 'datetime::DD MMM YYYY, HH:mm:ss',
        };

        detailedTableColumns.push({
            title: 'DD MMM YYYY, HH:mm:ss',
            dataIndex: 'time',
        });

        let parameters = [];

        if (options.tpara && options.tpara.length) {
            options.tpara.map(function (params) {
                parameters.push(
                    ctx['_'].find(getThingDetails[i].parameters, {
                        key: params,
                    })
                );
            });
        }
        parameters.map(function (param) {
            if (param) {
                detailedTableColumns.push({
                    title: param.name + ' (' + param.unit + ')',
                    dataIndex: param.key,
                });

                paramTitlesHashMap[param.key] =
                    param.name + ' (' + param.unit + ')';

                detailedTableDataTypes[param.key] = param.data_type;
            }
        });

        if (apiData && apiData.data && apiData.data.length) {
            dataObj[thing_id] = ctx['_'].filter(apiData.data, {
                thing_id: thing_id,
            });
        }
        if (dataObj[thing_id] && dataObj[thing_id].length) {
            dataObj[thing_id] = ctx['_'].orderBy(
                dataObj[thing_id],
                'time',
                'desc'
            );
        }
        let detailedTableData = dataObj[thing_id].map(
            function (thing_data) {
                let obj = {};
                Object.keys(thing_data.parameter_values).map(
                    function (param){
                        obj[param] =
                            options.dtype === 'raw'
                                ? thing_data.parameter_values[
                                param
                                ] * 1
                                : thing_data.parameter_values[
                                    param
                                    ]['avg']
                                    ? thing_data.parameter_values[
                                        param
                                        ]['avg']
                                    : null;
                        if (!summaryThingsObject[param])
                            summaryThingsObject[param] = {
                                min: thing_data.parameter_values[
                                    param
                                    ]['avg']
                                    ? thing_data.parameter_values[
                                        param
                                        ]['avg']
                                    : 0,
                                max: thing_data.parameter_values[
                                    param
                                    ]['avg']
                                    ? thing_data.parameter_values[
                                        param
                                        ]['avg']
                                    : 0,
                                maxAt: thing_data.time * 1000,
                                minAt: thing_data.time * 1000,
                                avg: 0,
                                total: 0,
                                count: 0,
                            };
                        if (options.dtype === 'raw') {
                            summaryThingsObject[param][
                                'total'
                                ] = summaryThingsObject[param]['total']
                                ? summaryThingsObject[param][
                                    'total'
                                    ]
                                : 0;
                            summaryThingsObject[param]['total'] +=
                                obj[param];
                        } else {
                            summaryThingsObject[param][
                                'total'
                                ] += thing_data.parameter_values[param][
                                'avg'
                                ]
                                ? thing_data.parameter_values[
                                    param
                                    ]['avg']
                                : 0;
                        }
                        if (options.dtype === 'raw') {
                            summaryThingsObject[param][
                                'count'
                                ] = summaryThingsObject[param]['count']
                                ? summaryThingsObject[param][
                                    'count'
                                    ]
                                : 0;
                            summaryThingsObject[param][
                                'count'
                                ] += 1;
                        } else {
                            summaryThingsObject[param][
                                'count'
                                ] += 1;
                        }
                        if (options.dtype === 'raw') {
                            if (
                                summaryThingsObject[param]['max'] >=
                                obj[param]
                            ) {
                                summaryThingsObject[param]['max'] =
                                    obj[param];
                                summaryThingsObject[param][
                                    'maxAt'
                                    ] = thing_data.time * 1000;
                            }
                        } else {
                            if (
                                thing_data.parameter_values[param][
                                    'avg'
                                    ] >
                                summaryThingsObject[param]['max']
                            ) {
                                summaryThingsObject[param]['max'] =
                                    thing_data.parameter_values[
                                        param
                                        ]['avg'];
                                summaryThingsObject[param][
                                    'maxAt'
                                    ] = thing_data.time * 1000;
                            }
                        }

                        if (options.dtype === 'raw') {
                            if (
                                summaryThingsObject[param]['min'] <=
                                obj[param]
                            ) {
                                summaryThingsObject[param]['min'] =
                                    obj[param];
                                summaryThingsObject[param][
                                    'minAt'
                                    ] = thing_data.time * 1000;
                            }
                        } else {
                            if (
                                thing_data.parameter_values[param][
                                    'avg'
                                    ] <
                                summaryThingsObject[param]['min']
                            ) {
                                summaryThingsObject[param]['min'] =
                                    thing_data.parameter_values[
                                        param
                                        ]['avg'];
                                summaryThingsObject[param][
                                    'minAt'
                                    ] = thing_data.time * 1000;
                            }
                        }

                        summaryThingsObject[param]['avg'] =
                            summaryThingsObject[param]['total'] /
                            summaryThingsObject[param]['count'];
                    }
                );
                obj.time = thing_data.time * 1000;
                return obj;
            }
        );

        // /* ------------------------------> DETAILED DATA */

        // /* SUMMARY DATA */
        let summaryDataColumns = [];
        summaryDataColumns.push({
            title: 'Parameter',
            dataIndex: 'parameter',
        });
        summaryDataColumns.push({
            title: 'Avg',
            dataIndex: 'avg',
        });
        summaryDataColumns.push({
            title: 'Min',
            dataIndex: 'min',
        });
        summaryDataColumns.push({
            title: 'Min at.',
            dataIndex: 'minAt',
        });
        summaryDataColumns.push({
            title: 'Max',
            dataIndex: 'max',
        });
        summaryDataColumns.push({
            title: 'Max at.',
            dataIndex: 'maxAt',
        });

        let summaryDataTableDataTypes = {
            avg: 'number::2',
            min: 'number::2',
            max: 'number::2',
            minAt: 'datetime::DD MMM YYYY, HH:mm:ss',
            maxAt: 'datetime::DD MMM YYYY, HH:mm:ss',
        };
        let summaryTableData = Object.keys(summaryThingsObject).map(
            function (param) {
                let summaryDataItem = {
                    ...summaryThingsObject[param],
                };
                summaryDataItem.parameter =
                    paramTitlesHashMap[param];
                return summaryDataItem;
            }
        );
        // /* ------------------------------> SUMMARY DATA */

        // if (dataViewType === false) {
        /* SUMMARY TABLE PUSHED */
        finalData[thing_id].all.conf.push({
            props: {
                gutter: 10,
            },
            child: [
                {
                    compo: 'Text',
                    props: {
                        type: 'bold',
                    },
                    ...options,
                    col_props: {
                        span: 24,
                    },
                },
            ],
        });
        finalData[thing_id].all.data.push([
            {
                textData: ['Summary Data'],
            },
        ]);
        finalData[thing_id].grid.conf.push({
            props: {
                gutter: 10,
            },
            child: [
                {
                    compo: 'Text',
                    props: {
                        type: 'bold',
                    },
                    ...options,
                    col_props: {
                        span: 24,
                    },
                },
            ],
        });
        finalData[thing_id].grid.data.push([
            {
                textData: ['Summary Data'],
            },
        ]);

        finalData[thing_id].all.conf.push({
            props: {
                gutter: 10,
                style: {},
                className: 'tableRow',
            },
            child: [
                {
                    compo: 'Table',
                    widget: '',
                    classname: 'tab-1',
                    props: {
                        columns: summaryDataColumns,
                        headerFont: 13,
                        size: 'small',
                        tabRadius: 0,
                        horizontalScroll: false,
                        shadow: false,
                        breakPoint: 1000,
                        breakPoint2: 500,
                        largeTable: true,
                        mediumTable: true,
                        smallTable: true,
                    },
                    col_props: {
                        span: 24,
                    },
                    datatype: summaryDataTableDataTypes,
                    pdf_width: 50,
                    pdf_table_break: {
                        col_no: 15,
                        row_no: 20,
                    },
                },
            ],
        });
        finalData[thing_id].all.data.push([summaryTableData]);
        finalData[thing_id].grid.conf.push({
            props: {
                gutter: 10,
                style: {},
                className: 'tableRow',
            },
            child: [
                {
                    compo: 'Table',
                    widget: '',
                    classname: 'tab-1',
                    props: {
                        columns: summaryDataColumns,
                        headerFont: 13,
                        size: 'small',
                        tabRadius: 0,
                        horizontalScroll: false,
                        shadow: false,
                        breakPoint: 1000,
                        breakPoint2: 500,
                        largeTable: true,
                        mediumTable: true,
                        smallTable: true,
                    },
                    col_props: {
                        span: 24,
                    },
                    datatype: summaryDataTableDataTypes,
                    pdf_width: 50,
                    pdf_table_break: {
                        col_no: 15,
                        row_no: 20,
                    },
                },
            ],
        });
        finalData[thing_id].grid.data.push([summaryTableData]);

        /* DETAILED TABLE PUSHED */
        let detailedViewTableConfig = {
            pdf_force_new_page: true,
        };
        finalData[thing_id].all.conf.push({
            props: {
                gutter: 10,
            },
            child: [
                {
                    compo: 'Text',
                    props: {
                        type: 'bold',
                    },
                    ...detailedViewTableConfig,
                    col_props: {
                        span: 24,
                    },
                },
            ],
        });
        finalData[thing_id].all.data.push([
            {
                textData: ['Detailed Data'],
            },
        ]);
        finalData[thing_id].grid.conf.push({
            props: {
                gutter: 10,
            },
            child: [
                {
                    compo: 'Text',
                    props: {
                        type: 'bold',
                    },
                    ...detailedViewTableConfig,
                    col_props: {
                        span: 24,
                    },
                },
            ],
        });
        finalData[thing_id].grid.data.push([
            {
                textData: ['Detailed Data'],
            },
        ]);

        finalData[thing_id].all.conf.push({
            props: {
                gutter: 10,
                style: {},
                className: 'tableRow',
            },
            child: [
                {
                    compo: 'Table',
                    widget: '',
                    classname: 'tab-1',
                    props: {
                        columns: detailedTableColumns,
                        headerFont: 13,
                        size: 'small',
                        tabRadius: 0,
                        horizontalScroll: false,
                        shadow: false,
                        breakPoint: 1000,
                        breakPoint2: 500,
                        largeTable: true,
                        mediumTable: true,
                        smallTable: true,
                    },
                    col_props: {
                        span: 24,
                    },
                    datatype: detailedTableDataTypes,
                    pdf_width: 50,
                    pdf_table_break: {
                        col_no: 15,
                        row_no: 20,
                    },
                },
            ],
        });
        finalData[thing_id].all.data.push([detailedTableData]);
        finalData[thing_id].grid.conf.push({
            props: {
                gutter: 10,
                style: {},
                className: 'tableRow',
            },
            child: [
                {
                    compo: 'Table',
                    widget: '',
                    classname: 'tab-1',
                    props: {
                        columns: detailedTableColumns,
                        headerFont: 13,
                        size: 'small',
                        tabRadius: 0,
                        horizontalScroll: false,
                        shadow: false,
                        breakPoint: 1000,
                        breakPoint2: 500,
                        largeTable: true,
                        mediumTable: true,
                        smallTable: true,
                    },
                    col_props: {
                        span: 24,
                    },
                    datatype: detailedTableDataTypes,
                    pdf_width: 50,
                    pdf_table_break: {
                        col_no: 15,
                        row_no: 20,
                    },
                },
            ],
        });
        finalData[thing_id].grid.data.push([detailedTableData]);
        // }

        // if (dataViewType === true) {
        /* DETAILED DATA GRAPH */
        parameters.map(function (param, param_index) {
            if (param) {
                let graphData = {
                    chart: {
                        type: 'area',
                        zoomType: 'x',
                    },
                    colors: [
                        color_arr[param_index % color_arr.length],
                    ],
                    title: {
                        text: param.name,
                    },
                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            month: '%e. %b',
                            year: '%b',
                        },
                        title: {
                            text: 'Date Time',
                        },
                    },
                    yAxis: {
                        title: {
                            text: param.unit,
                        },
                    },
                    tooltip: {
                        shared: true,
                    },
                    credits: {
                        enabled: false,
                    },
                    series: [
                        {
                            name: 'Max',
                            data: dataObj[thing_id].map(
                                function (thing_data) {
                                    return [
                                        thing_data.time * 1000,
                                        thing_data.parameter_values[
                                            param.key
                                            ]['max'],
                                    ];
                                }
                            ),
                        },
                        {
                            name: 'Avg',
                            data: dataObj[thing_id].map(
                                function (thing_data) {
                                    return [
                                        thing_data.time * 1000,
                                        thing_data.parameter_values[
                                            param.key
                                            ]['avg'],
                                    ];
                                }
                            ),
                        },
                        {
                            name: 'Min',
                            data: dataObj[thing_id].map(
                                function (thing_data) {
                                    return [
                                        thing_data.time * 1000,
                                        thing_data.parameter_values[
                                            param.key
                                            ]['min'],
                                    ];
                                }
                            ),
                        },
                    ],
                    exporting: {
                        sourceHeight: 350,
                        sourceWidth: 1100,
                    },
                };

                let result = '';
                let characters =
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let charactersLength = characters.length;
                for (let i = 0; i < 5; i++) {
                    result += characters.charAt(
                        Math.floor(Math.random() * charactersLength)
                    );
                }

                finalData[thing_id].all.conf.push({
                    props: {
                        gutter: 10,
                        style: {},
                        className: 'rowGraph',
                    },
                    child: [
                        {
                            compo: 'Graph',
                            widget: '',
                            classname: 'graph-1',
                            props: { id: 'graph-id-' + result },
                            col_props: {
                                span: 24,
                            },
                            pdf_force_new_page: true,
                            datatype: {
                                'xAxis.categories':
                                    'datetime::HH:MM',
                                'series.data': 'number::1',
                            },
                        },
                    ],
                });
                finalData[thing_id].all.data.push([graphData]);
                finalData[thing_id].graph.conf.push({
                    props: {
                        gutter: 10,
                        style: {},
                        className: 'rowGraph',
                    },
                    child: [
                        {
                            compo: 'Graph',
                            widget: '',
                            classname: 'graph-1',
                            props: { id: 'graph-id-' + result },
                            col_props: {
                                span: 24,
                            },
                            pdf_force_new_page: true,
                            datatype: {
                                'xAxis.categories':
                                    'datetime::HH:MM',
                                'series.data': 'number::1',
                            },
                        },
                    ],
                });
                finalData[thing_id].graph.data.push([graphData]);
            }
        });
        /* ------------------------------> DETAILED GRAPH DATA */
        // }
    }
    let reportData = finalData;
    console.log('reportData', reportData);

    let downloaderReportConfig = {
        conf: [],
        data: [],
        zone: 'Asia/Kolkata',
    };
    let totalThings = getThingDetails.length;
    let pdfMainHeaderOption = {
        pdf_top_line: true,
        pdf_bottom_line: true,
        pdf_text_align: 'center',
    };
    let REPORT_TYPE = {
        text_conf: {
            props: {
                gutter: 10,
            },
            child: [
                {
                    compo: 'Text',
                    props: {
                        type: 'bold',
                    },
                    ...pdfMainHeaderOption,
                    col_props: {
                        span: 24,
                    },
                },
            ],
        },
        text_data: [
            {
                textData: [
                    options.dtype.toUpperCase() + ' Report',
                    'Duration: ' +
                    ctx.moment
                        .unix(options.fromTime)
                        .format('DD MMM YYYY, HH:mm') +
                    ' to ' +
                    ctx.moment
                        .unix(options.uptoTime)
                        .format('DD MMM YYYY, HH:mm'),
                    'Generated at: ' +
                    ctx.moment
                        .unix(ctx.moment().unix())
                        .format('DD MMM YYYY, HH:mm'),
                ],
            },
        ],
    };

    downloaderReportConfig.conf.push(REPORT_TYPE.text_conf);
    downloaderReportConfig.data.push(REPORT_TYPE.text_data);

    for (let i = 0; i < totalThings; i++) {
        let { id, name } = getThingDetails[i];
        let { all } = reportData[id];
        let { conf, data, zone } = all;
        if (options.dtype !== 'cumulative') {
            let text_option = i ? { pdf_force_new_page: true } : {};
            let { text_conf, text_data } = {
                text_conf: {
                    props: {
                        gutter: 10,
                    },
                    child: [
                        {
                            compo: 'Text',
                            props: {
                                type: 'bold',
                            },
                            ...text_option,
                            col_props: {
                                span: 24,
                            },
                        },
                    ],
                },
                text_data: [
                    {
                        textData: [name],
                    },
                ],
            };

            downloaderReportConfig.conf.push(text_conf);
            downloaderReportConfig.data.push(text_data);
        }

        conf.forEach((conf_item) => {
            downloaderReportConfig.conf.push(conf_item);
        });

        data.forEach((data_item) => {
            downloaderReportConfig.data.push(data_item);
        });

        downloaderReportConfig.zone = 'Asia/Kolkata';
    }
    let values = {
        reportData: reportData,
        downloaderReportConfig: downloaderReportConfig,
    };
    cb(values);
}
window.backyard =class Backyard {
    #worker = null;
    #autoTerminate = true;

    constructor(config) {
        console.log("config",config)
        if (config) {
            let { cb, scripts, autoTerminate, input } = config;

            if (!scripts) {
                scripts = [];
            }
            let run=window.runFunc
            if (run && cb && scripts) {
                this.#runInBackyard({ cb, run, scripts, autoTerminate, input });
            } else {
                console.log('Backyard Error: Invalid Configuration');
            }
        } else {
            console.log('Backyard Error: No Configuration!!');
        }
    }

    terminate = () => {
        console.log('Worker Terminated');
        this.#worker.terminate();
    };

    #runInBackyard = (config) => {
        const { cb, run, scripts, autoTerminate, input } = config;

        if (autoTerminate != null) {
            this.#autoTerminate = autoTerminate;
        }

        const workercode = () => {
            onmessage = (e) => {
                const data = e.data;

                const { workerFunction, input } = data;

                let myFunc =function (a,b,c) {
                    console.log("workerFunction",workerFunction)
                    return eval(workerFunction)(a,b,c)
                };

                const cb = (obj) => {
                    postMessage(obj);
                };

                const returnedValue = myFunc(this, input, cb);

                if (returnedValue != null) {
                    postMessage({
                        result: returnedValue,
                    });
                }
            };
        };

        let code = workercode.toString();

        let transCode = '';
        transCode +=
            'function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };';
        transCode +=
            'function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } };';
        transCode +=
            'function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; };';

        let importScriptCode = '';
        for (let i = 0; i < scripts.length; i++) {
            importScriptCode += "importScripts('" + scripts[i] + "');";
        }

        code =
            transCode +
            importScriptCode +
            code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'));

        /* Converting to a Blob of type js file */
        const blob = new Blob([code], { type: 'application/javascript' });

        /* Creating a URL for the Blob Object */
        const worker_script = URL.createObjectURL(blob);

        const w = new Worker(worker_script);

        w.onmessage = (event) => {
            const { result } = event.data;
            if (this.#autoTerminate && result != null) this.terminate();
            if (cb) cb(event.data);
        };

        w.postMessage({
            workerFunction: window.runFunc.toString(),
            input,
        });

        this.#worker = w;
    };
}

/* EXAMPLE USAGE */

/*
// EXAMPLE 1

new Backyard({
    input: {
        message: "Hi from Frontend!!"
    },
    run: (ctx, input) => {

        for (let i = 0; i < 1000; i++) {
            console.log("i:", i, input.message);
            for (let j = 0; j < 5000000; j++) {
                const x = (i*j)*(i+j);
            }
        }

        ctx.postMessage({
            result: 1024
        });
    },
    cb: (data) => {
        const { result } = data;
        console.log("result", result);
    }
});

// EXAMPLE 2

new Backyard({
      input: {
        message: "Hi from Frontend!!"
      },
      run: (ctx, input, cb) => {

        for (let i = 0; i < 1000; i++) {
          console.log("i:", i, input.message);
          for (let j = 0; j < 5000000; j++) {
            const x = (i*j)*(i+j);
          }
        }


        cb({
          result: 1024
        });
      },
      cb: (data) => {
        console.log(data);
      }
    });

// EXAMPLE 3
new Backyard({
            scripts: [],
            input: {
                message: "Hi from Frontend Which went to te Backyard!!",
                time: moment().unix()
            },
            run: (ctx, input, cb) => {

                for (let i = 0; i < 1000; i++) {
                    console.log("i:", i, input.time);
                    for (let j = 0; j < 10000000; j++) {
                        const x = (i*j)*(i+j);
                    }
                }

                return "Returned 121"
            },
            cb: (data) => {
                console.log(data);
            }
        })
*/

// let outBtn=document.getElementById("hello")
// outBtn.addEventListener('click',()=>{
//
// })

function someFunction(){
    console.log(Backyard)
    // new Backyard({
    //     input: {
    //         message: "Hi from Frontend!!"
    //     },
    //     run: (ctx, input, cb) => {
    //         for (let i = 0; i < 1000; i++) {
    //             console.log("i:", i, input.message);
    //             for (let j = 0; j < 5000000; j++) {
    //                 const x = (i*j)*(i+j);
    //             }
    //         }
    //         cb({
    //             result: 1024
    //         });
    //     },
    //     cb: (data) => {
    //         console.log(data);
    //     }
    // });
}
/* EXAMPLE USAGE */

/*
// EXAMPLE 1

new Backyard({
    input: {
        message: "Hi from Frontend!!"
    },
    run: (ctx, input) => {

        for (let i = 0; i < 1000; i++) {
            console.log("i:", i, input.message);
            for (let j = 0; j < 5000000; j++) {
                const x = (i*j)*(i+j);
            }
        }

        ctx.postMessage({
            result: 1024
        });
    },
    cb: (data) => {
        const { result } = data;
        console.log("result", result);
    }
});

// EXAMPLE 2

new Backyard({
      input: {
        message: "Hi from Frontend!!"
      },
      run: (ctx, input, cb) => {

        for (let i = 0; i < 1000; i++) {
          console.log("i:", i, input.message);
          for (let j = 0; j < 5000000; j++) {
            const x = (i*j)*(i+j);
          }
        }


        cb({
          result: 1024
        });
      },
      cb: (data) => {
        console.log(data);
      }
    });

// EXAMPLE 3
new Backyard({
            scripts: [],
            input: {
                message: "Hi from Frontend Which went to te Backyard!!",
                time: moment().unix()
            },
            run: (ctx, input, cb) => {

                for (let i = 0; i < 1000; i++) {
                    console.log("i:", i, input.time);
                    for (let j = 0; j < 10000000; j++) {
                        const x = (i*j)*(i+j);
                    }
                }

                return "Returned 121"
            },
            cb: (data) => {
                console.log(data);
            }
        })
*/
