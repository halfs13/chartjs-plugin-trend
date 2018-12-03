
var pluginTrendlineLinear = {
    beforeDraw: function (chartInstance) {

        var yScale = chartInstance.scales["y-axis-0"];
        var canvas = chartInstance.chart;
        var ctx = canvas.ctx;        

        for(var i = 0; i < chartInstance.data.datasets.length; i++) {
            if (chartInstance.data.datasets[i].trendlineLinear) {                                               
                var datasets = chartInstance.data.datasets[i];
                var datasetMeta = chartInstance.getDatasetMeta(i);                                                     

                addFitter(datasetMeta, ctx, datasets, yScale);
            }
        }
    }
};

function addFitter(datasetMeta, ctx, datasets, yScale) {
    
    var style = datasets.trendlineLinear.style;
    style = (style !== undefined) ? style : "rgba(169,169,169, .6)";    
    var lineWidth = datasets.trendlineLinear.width;
    lineWidth = (lineWidth !== undefined) ? lineWidth : 3;

    var lastIndex = datasets.data.length - 1;
    var startPos = datasetMeta.data[0]._model.x;
    var endPos = datasetMeta.data[lastIndex]._model.x;
    var fitter = new LineFitter();

    for(var i = 0; i < datasets.data.length; i++) {
        fitter.add(i, datasets.data[i]);
    }

    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(startPos, yScale.getPixelForValue(fitter.project(0)));
    ctx.lineTo(endPos, yScale.getPixelForValue(fitter.project(lastIndex)));
    ctx.strokeStyle = style;
    ctx.stroke();
}

Chart.plugins.register(pluginTrendlineLinear);

function LineFitter() {
    this.count = 0;
    this.sumX = 0;
    this.sumX2 = 0;
    this.sumXY = 0;
    this.sumY = 0;
}

LineFitter.prototype = {
    'add': function (x, y) {
        this.count++;

        var yVal = y;
        if(y.y) {
            yVal = y.y
        }
        
        this.sumX += x;
        this.sumX2 += x * x;
        this.sumXY += x * yVal;
        this.sumY += yVal;
    },
    'project': function (x) {
        var det = this.count * this.sumX2 - this.sumX * this.sumX;
        var offset = (this.sumX2 * this.sumY - this.sumX * this.sumXY) / det;
        var scale = (this.count * this.sumXY - this.sumX * this.sumY) / det;
        return offset + x * scale;
    }
};
