var timeChart1;
var timeChart2;
var tempLines;
var logLines;
var modoDelta = false;

var rgbT = ["rgb(162,237,96)","rgb(221,207,230)","rgb(193,143,41)","rgb(236,186,50)",
            "rgb(212,61,251)","rgb(150,31,218)","rgb(47,193,57)","rgb(253,163,217)",
            "rgb(35,103,71)","rgb(205,185,211)","rgb(164,191,49)","rgb(240,180,29)",
            "rgb(194,138,93)","rgb(55,59,252)","rgb(109,146,195)","rgb(109,32,6)",
            "rgb(80,181,22)","rgb(57,42,156)","rgb(73,61,151)","rgb(28,251,148)",
            "rgb(179,167,221)","rgb(95,116,123)","rgb(161,53,178)","rgb(251,25,35)",
            "rgb(142,69,253)","rgb(132,137,179)","rgb(81,177,118)","rgb(63,45,164)",
            "rgb(153,212,97)","rgb(207,52,192)","rgb(80,60,67)","rgb(133,133,58)"];


function uploadTemperatureFile() {
    var fileInput = document.getElementById('fileInputTemperature');
    var file = fileInput.files[0];
    if (!file) {
        document.getElementById('statusTemperature').innerHTML = 'Nenhum arquivo selecionado!';
        return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        tempLines = contents.split('\n');
        if (tempLines.length > 0) {
            var headers = tempLines[0].split(',');
            if (checkCSVHeaders(headers)) {
                loadTemperatureFile(tempLines);
            } else {
                document.getElementById('statusTemperature').innerHTML = 'Arquivo inválido!';
            }
        }
    };
    reader.readAsText(file);
}

function checkCSVHeaders(headers) {
    var requiredHeaders = ['Timestamp', 'Sensor 1', 'Sensor 2', 'Sensor 3', 'Sensor 4'
                           , 'Sensor 5', 'Sensor 6', 'Sensor 7', 'Sensor 8'
                           , 'Sensor 9', 'Sensor 10', 'Sensor 11', 'Sensor 12'
                           , 'Sensor 13', 'Sensor 14', 'Sensor 15', 'Sensor 16'
                           , 'Sensor 17', 'Sensor 18', 'Sensor 19', 'Sensor 20'
                           , 'Sensor 21', 'Sensor 22', 'Sensor 23', 'Sensor 24'
                           , 'Sensor 25', 'Sensor 26', 'Sensor 27', 'Sensor 28'
                           , 'Sensor 29', 'Sensor 30', 'Sensor 31', 'Sensor 32'];
                           //,'Estado Alarme','Estado GA','Modo de Operação'];
    for (var i = 0; i < requiredHeaders.length; i++) {
        if (headers[i] != requiredHeaders[i]) {
            return false;
        }
    }
    return true;
}

function loadTemperatureFile(lines){
    var lines4chart ;
    if (lines.length>501){
        lines4chart = compactLines(lines.slice(1));
        atualizaDadosGrafico1(transformCSVArray(lines4chart));
    }else{
        lines4chart = lines.slice(1);
        atualizaDadosGrafico1(transformCSVArray(lines4chart));
    }
    
}

function compactLines(lines){
    var step = lines.length/500;
    let resultCompact = new Array(500);
    for(var i = 0; i < 500; i++){
        resultCompact[i] = returnMax(lines.slice(Math.trunc(i*step),Math.trunc((i+1)*step)));  // retorna o maior valor entre cada passo (step)
    }
    return resultCompact;
}

function returnMax(lines){
    
    if (lines.length == 0){
        return "";
    }
    
    if (lines.length == 1){
        return lines[0];
    }
    let resultMax = new Array(33).fill(0);
    resultMax[0] = lines[0].split(',')[0];    //copy timestamp of first line
    for (var i = 0; i < lines.length;i++){
        var values = lines[i].split(',');
        for (var j = 1; j<33; j++){
            resultMax[j] = Math.max(resultMax[j],values[j]);
        }
    }
    return resultMax.join(',');

}

function transformCSVArray(lines){
    //var resultArray = Array(lines.length).fill(new Array(33));
    var resultArray = Array.from(Array(lines.length), () => new Array(33))
    var values = new Array(33);
    for (var i = 0; i < lines.length; i++){
        values = lines[i].split(',');
        resultArray[i][0] = values[0];
        for (var j = 1; j < 33;j++){
            resultArray[i][j] = parseFloat(values[j]);
        }
    }
    return resultArray;
}

function initiatetimeChart1(){
    // Initialize the chart
    var ctx = document.getElementById('timeChart1').getContext('2d');
    
    timeChart1 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            maintainAspectRatio: false,
            events: ['click'],
            animations: false,
            onClick: (e) => {
                //const canvasPosition = timeChart1.helpers.getRelativePosition(e, timeChart1);
                changePosition(e);
            }
        }
        
    });


    for (var i = 0; i < 32; i++) {
        timeChart1.data.datasets.push({
            label: 'T' + (i + 1),
            borderColor: rgbT[i],
            borderWidth: 1,
            fill: false,
            data: [],
            hidden: false // Initially hidden
        });
    }
    
    for (var x = 0; x < 500; x++)
    {
        for (var i = 0; i < 32; i++) {
            timeChart1.data.datasets[i].data.push(0);
        }
    }

    timeChart1.data.labels = Array.from({length: 500}, (_, i) => 0);
    

    timeChart1.update();
}

function atualizaDadosGrafico1(temperaturas)
{
    var chartSize = timeChart1.data.datasets[0].data.length;
    for (var x = 0; x < chartSize; x++)
    {
        for (var i = 0; i < 32; i++) {
            timeChart1.data.datasets[i].data.shift();
        }
    }
    for (var x = 0; x < temperaturas.length; x++)
    {
        for (var i = 0; i < 32; i++) {
            timeChart1.data.datasets[i].data.push(temperaturas[x][i+1]);
        }
    }
    timeChart1.data.labels = Array.from({length: temperaturas.length}, (_, i) => temperaturas[i][0]);
    timeChart1.update(); 
}

function changePosition(e){
    var span = e.chart.chartArea.right - e.chart.chartArea.left;
    var dataX = ((e.x - e.chart.chartArea.left)/span)*500;
    console.log(dataX);
    if (timeChart1.data.datasets[0].data.length >= 60){
       atualizaDadosGrafico2(dataX);
    }

}

function atualizaDadosGrafico2(dataX)
{
    var startPos = 0;
    var totalLenght = tempLines.length;
    var step = totalLenght/500;
    startPos = dataX * step;
    if (startPos>=totalLenght-500){
        startPos = totalLenght - 501;
    }
    var lines4chart = compactLines(tempLines.slice(startPos,startPos+500));
    var linesArray = transformCSVArray(lines4chart);
    for (var x = 0; x < 60; x++)
    {
        for (var i = 0; i < 32; i++) {
            timeChart2.data.datasets[i].data.shift();
            timeChart2.data.datasets[i].data.push(linesArray[x][i+1]);
        }
    }
    timeChart2.data.labels = Array.from({length: 60}, (_, i) => linesArray[i][0]);
    timeChart2.update(); 
}
function initiatetimeChart2(){
    // Initialize the chart
    var ctx = document.getElementById('timeChart2').getContext('2d');
    
    timeChart2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            maintainAspectRatio: false,
            animations: false
        }
    });


    for (var i = 0; i < 32; i++) {

        timeChart2.data.datasets.push({
            label: 'T' + (i + 1),
            borderColor: rgbT[i],
            borderWidth: 1,
            fill: false,
            data: [],
            hidden: false // Initially hidden
        });
    }
    
    for (var x = 0; x < 60; x++)
    {
        for (var i = 0; i < 32; i++) {
            timeChart2.data.datasets[i].data.push(0);
        }
    }

    timeChart2.data.labels = Array.from({length: 60}, (_, i) => 0);
    

    timeChart2.update();
}



document.addEventListener('DOMContentLoaded', function () {

    initiatetimeChart1();
    initiatetimeChart2();

});

document.addEventListener('DOMContentLoaded', function () {
    const switchElement = document.getElementById('SwitchDelta');
    const switchLabel = document.querySelector('label[for="SwitchDelta"]');
    switchElement.addEventListener('change', function () {
        if (this.checked) {
            modoDelta = true;
            
        } else {
            modoDelta = false;
            
        }
        loadLogFile(tempLines);
    });
});
