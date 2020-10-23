(function (func) {
    // 所有的js文件，都按这个方式写
    $.ajax({
        url: "/data/get_every_regions_zufang_count",
        type: "GET",
        dataType: "json",
        success: function (data) {
            func(data);
        }
    });
})(function (data) {
// chart_2

    var myChart = echarts.init(document.getElementById("chart_2"));

    var option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
            {
                name: '访问来源',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontSize: '30',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: data.series
            }
        ]
    };


    myChart.setOption(option);
    window.addEventListener("resize", function () {
        myChart.resize();
    });
});