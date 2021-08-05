// alert("amma baboi")
// window.accountFunction=function (){
//     console.log("madaaaaaf")
// }
// alert("done")
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
            let run=window.runFunction
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
            workerFunction: "(".concat(window.runFunction.toString())+").bind(this)",
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
