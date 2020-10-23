(function (func) {
    $.ajax({
        url: "/data/get_map",
        type: "GET",
        dataType: "json",
        success: function (data) {
            func(data);
        }
    });
})(function (data) {
    // 初始化图
    var myChart = echarts.init(document.getElementById("chart_map"));
    var color = ['#c5f80e'];

    function get_latitude_longitude(item) {
        // item就是 {"code":"110102","parentCode":"110100","level":"3",
        // "name":"西城区","latitude":"9.93428","longitude":"116.37319"},  一行
        // item是一个字典
        // 过滤出来了城市的经纬度
        return item["name"].indexOf(window.cityname) > -1;
    }

    var tmp_data = data.series.map(function (dataItem) {
        // dataItem:是一个列表
        var cityname = dataItem[0].name;
        window.cityname = cityname;


        // 在areas里面，找到当前城市的坐标
        // filter：返回的是列表,[0]表示获取查找到的元素
        var tmp_area = areas.filter(get_latitude_longitude)[0];
        // 把城市的名字转为经纬度

        // [119.4543, 25.9222, 95]
        var data1 = [parseFloat(tmp_area["longitude"]),
            parseFloat(tmp_area["latitude"]),
            dataItem[0].value];

        return {
            name: cityname,
            value: data1
        };


        // return {
        //                 name: dataItem[1].name,  城市名称
        //                 value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value]) [119.4543, 25.9222, 95]
        //             };
    });

    // 需要一个序列
    var series = [];
    series.push({
        name: "数据量",
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        rippleEffect: {
            brushType: 'stroke'
        },
        label: {
            normal: {
                show: true,
                position: 'right',
                formatter: '{b}'
            }
        },
        symbolSize: function (val) {
            return val[2] / 1000;
        },
        itemStyle: {
            normal: {
                color: color[0]
            }
        },
        data: tmp_data
    });

    var option = {
        tooltip: {
            trigger: 'item'
        },
        geo: {
            map: 'china',
            label: {
                emphasis: {
                    show: false
                }
            },
            roam: true,
            itemStyle: {
                normal: {
                    borderColor: 'rgba(147, 235, 248, 1)',
                    borderWidth: 1,
                    areaColor: {
                        type: 'radial',
                        x: 0.5,
                        y: 0.5,
                        r: 0.8,
                        colorStops: [{
                            offset: 0,
                            color: 'rgba(175,238,238, 0)' // 0% 处的颜色
                        }, {
                            offset: 1,
                            color: 'rgba(47,79,79, .1)' // 100% 处的颜色
                        }],
                        globalCoord: false // 缺省为 false
                    },
                    shadowColor: 'rgba(128, 217, 248, 1)',
                    // shadowColor: 'rgba(255, 255, 255, 1)',
                    shadowOffsetX: -2,
                    shadowOffsetY: 2,
                    shadowBlur: 10
                },
                emphasis: {
                    areaColor: '#389BB7',
                    borderWidth: 0
                }
            }
        },
        series: series
    };

// 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    window.addEventListener("resize", function () {
        myChart.resize();
    });
});