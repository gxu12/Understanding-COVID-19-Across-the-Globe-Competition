/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

var CANVAS_WIDTH = 400;
var CANVAS_HEIGHT = 300;

(function (context) {

    var helper = context.uiHelper = {};

    // canvas comparing strategy, 'stack' or 'content'
    var STRATEGY = 'content';
    // always display images even if no error
    var ALWAYS_SHOW_IMAGE = true;

    // dom for failed cases
    var failedDom = document.createElement('div');
    failedDom.setAttribute('id', 'failed-panel');
    var hasFailedDom = false;

    /**
     * expect canvas.toDataURL to be the same by old and new echarts
     * @param  {string} title title of suite and case
     * @param  {function} doTest test body
     * @param  {function} done   done callback provided by jasmine
     */
    helper.expectEqualCanvasContent = function(title, doTest, done) {
        var that = this;
        window.require(['oldEcharts', 'newEcharts'], function (oldE, newE) {
            var oldImg = doTest(oldE).toDataURL();
            var newImg = doTest(newE).toDataURL();
            if (ALWAYS_SHOW_IMAGE || oldImg !== newImg) {
                // show difference rate of canvas content as string
                var diff = 0;
                for (var i = 0; i < oldImg.length; ++i) {
                    if (oldImg[i] !== newImg[i]) {
                        ++diff;
                    }
                }
                if (newImg.length > oldImg.length) {
                    diff += newImg.length - oldImg.length;
                }
                var log = 'Different rate: ' + diff + '/' + oldImg.length
                    + '. ';

                that.addFailedCases(title, oldImg, newImg, log);
            }
            expect(oldImg).toEqual(newImg);
            done();
        });
    };

    /**
     * expect canvas operation stack provided by canteen
     * to be the same by old and new echarts
     * @param  {string} title title of suite and case
     * @param  {function} doTest test body
     * @param  {function} done   done callback provided by jasmine
     */
    helper.expectEqualCanvasStack = function(title, doTest, done) {
        window.require(['oldEcharts', 'newEcharts'], function (oldE, newE) {
            var oldCanvas = doTest(oldE);
            var newCanvas = doTest(newE);
            var oldImg = oldCanvas.toDataURL();
            var newImg = newCanvas.toDataURL();
            if (ALWAYS_SHOW_IMAGE || oldImg !== newImg) {
                helper.addFailedCases(title, oldImg, newImg);
            }
            var oldCtx = oldCanvas.getContext('2d');
            var newCtx = newCanvas.getContext('2d');
            // hash of canvas operation stack, provided by canteen
            // https://github.com/platfora/Canteen
            // console.log(oldCtx.hash());
            expect(oldCtx.hash()).toEqual(newCtx.hash());
            done();
        });
    };

    /**
     * expect canvas with strategy
     * @param  {string} title title of suite and case
     * @param  {function} doTest test body
     * @param  {function} done   done callback provided by jasmine
     */
    helper.expectEqualCanvas = function(title, doTest, done) {
        if (STRATEGY === 'content') {
            helper.expectEqualCanvasContent(title, doTest, done);
        } else if (STRATEGY === 'stack') {
            helper.expectEqualCanvasStack(title, doTest, done);
        } else {
            console.error('Invalid equal canvas strategy!');
        }
    };

    var optionCompareHelper = function(isExpectEqual,
                                       title,
                                       option1,
                                       option2) {

        it(title, function(done) {
            window.require(['newEcharts'], function (ec) {
                var canvas1 = helper.getRenderedCanvas(ec, function(myChart) {
                    myChart.setOption(helper.preprocessOption(option1));
                });
                var canvas2 = helper.getRenderedCanvas(ec, function(myChart) {
                    myChart.setOption(helper.preprocessOption(option2));
                });
                var ctx1 = canvas1.getContext('2d');
                var ctx2 = canvas2.getContext('2d');
                var img1 = canvas1.toDataURL();
                var img2 = canvas2.toDataURL();

                var compare1 = compare2 = null;
                if (STRATEGY === 'content') {
                    compare1 = img1;
                    compare2 = img2;
                } else if (STRATEGY === 'stack') {
                    compare1 = ctx1.hash()
                    compare2 = ctx2.hash();
                } else {
                    console.error('Invalid equal canvas strategy!');
                }

                if (isExpectEqual) {
                    expect(compare1).toEqual(compare2);
                } else {
                    expect(compare1).not.toEqual(compare2);
                }

                if (ALWAYS_SHOW_IMAGE || (compare1 === compare2) ^ isExpectEqual) {
                    helper.addFailedCases(title, img1, img2);
                    // console.log(title);
                    // console.log(JSON.stringify(ctx1.stack()));
                    // console.log(JSON.stringify(ctx2.stack()));
                }

                done();
            });
        });
    };

    /**
     * expect two options have the same canvas for new echarts
     * @param  {string}   title   title of test case
     * @param  {object}   option1 one echarts option
     * @param  {object}   option2 the other echarts option
     * @param  {function} done    callback for jasmine
     */
    helper.expectEqualOption = function(title, option1, option2) {
        optionCompareHelper(true, title, option1, option2);
    };

    /**
     * expect two options have different canvas for new echarts
     * @param  {string}   title   title of test case
     * @param  {object}   option1 one echarts option
     * @param  {object}   option2 the other echarts option
     * @param  {function} done    callback for jasmine
     */
    helper.expectNotEqualOption = function(title, option1, option2) {
        optionCompareHelper(false, title, option1, option2);
    };

    /**
     * get rendered canvas with echarts and operations
     * @param  {object}   echarts    echarts
     * @param  {function} operations operations with echarts
     * @return {Canvas}              canvas rendered by echarts
     */
    helper.getRenderedCanvas = function(echarts, operations) {
        // init canvas with echarts
        var canvas = document.createElement('canvas');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        var myChart = echarts.init(canvas);

        // user defined operations
        operations(myChart);

        return canvas;
    };

    /**
     * run test with only setOption
     * @param  {string} name      name of the test
     * @param  {object} option    echarts option
     */
    helper.testOption = function(name, option) {
        var doTest = function(ec) {
            var canvas = helper.getRenderedCanvas(ec, function(myChart) {
                myChart.setOption(helper.preprocessOption(option));
            });
            return canvas;
        };
        it(name, function(done) {
            if (STRATEGY === 'content') {
                helper.expectEqualCanvasContent(name, doTest, done);
            } else if (STRATEGY === 'stack') {
                helper.expectEqualCanvasStack(name, doTest, done);
            } else {
                console.error('Invalid equal canvas strategy!');
            }
        });
    }

    /**
     * preprocess option and set default values
     * @param  {object} option echarts option
     * @return {object}        processed option
     */
    helper.preprocessOption = function(option) {
        if (typeof option.animation === 'undefined') {
            option.animation = false;
        }
        return option;
    }

    /**
     * run test with setOption for whole spec
     * @param  {string}   specName spec name
     * @param  {object[]} suites    arrary of suites
     * @param {boolean} isTestAll true to test all cases,
     *                            or false or undefined to the last one only
     */
    helper.testOptionSpec = function(specName, suites, isTestAll) {
        if (isTestAll === undefined) {
            // default value of test all to be true
            isTestAll = true;
        }

        var testCases = function(suiteName, cases) {
            describe(suiteName, function() {
                var start = isTestAll ? 0 : cases.length - 1;
                for (var cid = start; cid < cases.length; ++cid) {
                    if (cases[cid].ignore) {
                        continue;
                    }

                    var name = specName + ' - ' + suiteName + ': '
                        + cases[cid].name;
                    if (cases[cid].cases) {
                        // another level of cases
                        testCases(name, cases[cid].cases);
                        return;
                    }
                    if (cases[cid].test === 'equalOption') {
                        helper.expectEqualOption(name, cases[cid].option1,
                            cases[cid].option2);
                        // helper.testOption(name + ', same as last version',
                        //     cases[cid].option1);
                    } else if (cases[cid].test === 'notEqualOption') {
                        helper.expectNotEqualOption(name, cases[cid].option1,
                            cases[cid].option2);
                        // helper.testOption(name + ', same as last version',
                        //     cases[cid].option1);
                    } else {
                        helper.testOption(name, cases[cid].option);
                    }
                }
            });
        };
        var start = isTestAll ? 0 : suites.length - 1;
        for (var sid = start, slen = suites.length; sid < slen; ++sid) {
            testCases(suites[sid].name, suites[sid].cases);
        }
    }

    /**
     * @param {string} name name of the test
     * @param {string} oldImgSrc old canvas.toDataURL value
     * @param {string} newImgSrc new canvas.toDataURL value
     * @param {string} extraLog  extra log information
     * add a failed case in dom
     */
    helper.addFailedCases = function(name, oldImgSrc, newImgSrc, extraLog) {
        // group of this case
        var group = document.createElement('div');
        var title = document.createElement('h6');
        var log = name + ': ';
        if (extraLog !== undefined) {
            log += extraLog;
        }
        log += 'Here are old, new, and diff images.';
        title.innerHTML = log;
        group.appendChild(title);

        // old image and new image
        var oldImg = document.createElement('img');
        oldImg.src = oldImgSrc;
        oldImg.setAttribute('title', 'Old Image');
        oldImg.width = CANVAS_WIDTH;
        oldImg.height = CANVAS_HEIGHT;
        group.appendChild(oldImg);

        var newImg = document.createElement('img');
        newImg.src = newImgSrc;
        newImg.setAttribute('title', 'New Image');
        newImg.width = CANVAS_WIDTH;
        newImg.height = CANVAS_HEIGHT;
        group.appendChild(newImg);

        // diff image
        var diff = imagediff.diff(oldImg, newImg);
        var canvas = document.createElement('canvas');
        canvas.width = oldImg.width;
        canvas.height = oldImg.height;
        var ctx = canvas.getContext('2d');
        ctx.putImageData(diff, 0, 0);
        var diffImg = document.createElement('img');
        diffImg.src = canvas.toDataURL();
        diffImg.setAttribute('title', 'Diff Image');
        group.appendChild(diffImg);

        failedDom.appendChild(group);

        // append to dom
        if (!hasFailedDom) {
            var body = document.getElementsByTagName('body')[0];
            body.appendChild(failedDom);
            hasFailedDom = true;
        }
    };

})(window);
