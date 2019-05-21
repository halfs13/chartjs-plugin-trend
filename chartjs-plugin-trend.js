var pluginTrendlineLinear = {
    beforeDraw: function (chartInstance) {

        var yScale = chartInstance.scales["y-axis-0"];
        var xScale = chartInstance.scales['x-axis-0'];
        var canvas = chartInstance.chart;
        var ctx = canvas.ctx;        

        for(var i = 0; i < chartInstance.data.datasets.length; i++) {
            if (chartInstance.data.datasets[i].trendlineLinear) {                                               
                var datasets = chartInstance.data.datasets[i];
                var datasetMeta = chartInstance.getDatasetMeta(i);                                                     

                addFitter(datasetMeta, ctx, datasets, yScale, xScale);
            }
        }
    }
};
function addFitter(datasetMeta, ctx, datasets, yScale, xScale) {
    
    var style = datasets.trendlineLinear.style;
    style = (style !== undefined) ? style : "rgba(169,169,169, .6)";    
    var lineWidth = datasets.trendlineLinear.width;
    lineWidth = (lineWidth !== undefined) ? lineWidth : 3;

    var lastIndex = datasets.data.length - 1;
    var startPos = xScale.left;
    var endPos = xScale.right;
    var fitter = new LineFitter();

    for(var i = 0; i < datasets.data.length; i++) {
        fitter.add(datasetMeta.data[i]._model.x, datasetMeta.data[i]._model.y);
    }

    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    if(fitter.getXValFromPixel(yScale.top) > startPos) {
    	startPos = fitter.getXValFromPixel(yScale.top);
    }
    ctx.moveTo(startPos, fitter.project(startPos));
    if(fitter.getXValFromPixel(yScale.bottom) < endPos) {
    	endPos = fitter.getXValFromPixel(yScale.bottom);
    }
    ctx.lineTo(endPos, fitter.project(endPos));
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
    	if(y) {
          this.count++;

          var yVal = y;
          if(y.y) {
              yVal = y.y
          }

          this.sumXY += x * yVal;
          this.sumX += x;
          this.sumY += yVal;
          this.sumX2 += x * x;
    	}
    },
    'project': function (x) {
        var a = this.count * this.sumXY;
        var b = this.sumX * this.sumY;
        var c = this.count * this.sumX2;
        var d = this.sumX * this.sumX;
        
        var slope = (a - b) / (c - d);
        var f = slope * this.sumX;
        var yInt = (this.sumY - f) / this.count;
        var value = (slope * x) + yInt;
        return value;
    },
    getXValFromPixel: function(yMinPixel) {
    	var a = this.count * this.sumXY;
        var b = this.sumX * this.sumY;
        var c = this.count * this.sumX2;
        var d = this.sumX * this.sumX;
        
        var slope = (a - b) / (c - d);
        var f = slope * this.sumX;
        var yInt = (this.sumY - f) / this.count;
        var x = (yMinPixel - yInt) / slope;
        return x;
    }  
};
