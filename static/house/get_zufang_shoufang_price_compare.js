(function (func) {
    // 所有的js文件，都按这个方式写
    $.ajax({
        url: "/data/get_zufang_shoufang_price_compare",
        type: "GET",
        dataType: "json",
        success: function (data) {
            func(data);
        }
    });
})(function (data) {
// chart_3
    var myChart = echarts.init(document.getElementById("chart_3"));

    var option = {
        title: {
            text: '折线图堆叠'
        },
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.xAxis
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '租房',
                type: 'line',
                stack: '总量',
                data: data.series1
            },
            {
                name: '售房',
                type: 'line',
                stack: '总量',
                data: data.series2
            }
        ]
    };


    myChart.setOption(option);
    window.addEventListener("resize", function () {
        myChart.resize();
    });


});