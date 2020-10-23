(function (func) {
    // 所有的js文件，都按这个方式写
    $.ajax({
        url: "/data/get_serven_area",
        type: "GET",
        dataType: "json",
        success: function (data) {
            func(data);
        }
    });
})(function (data) {
    var myChart = echarts.init(document.getElementById("serven_area"));
    // 后台返回的数据需要构造成前台图形适应的格式
    var data1 = [];
    var data2 = [];
    // 遍历后台数据
    // each:for 循环 这个数组
    $(data.series_data).each(function (k, v) {
        data1.push(v.city);
        data2.push(v.price);
    });

    var option = {
        color: ['#3398DB'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: data1,
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                name: '直接访问',
                type: 'bar',
                barWidth: '60%',
                data: data2
            }
        ]
    };
    myChart.setOption(option);
    window.addEventListener("resize", function () {
        myChart.resize();
    });

});