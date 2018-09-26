$(document).ready(function () {
    let canvas = document.querySelector("#canvas");
    let ctx = canvas.getContext("2d");
    let is_null = true;

    // 初始化笔画颜色
    let stokeColor = getStrokeColor();

    // 初始化
    let shapes = []; // 图像集
    let points = []; // 点集

    //按下事件
    canvas.addEventListener("mousedown", function (e) {
        //计算出鼠标点击在canvas中的位置
        let x = e.offsetX;
        let y = e.offsetY;

        //记录旧的点
        this.oldPoint = {
            x: x - 1,
            y: y - 1
        };

        //画笔功能
        drawPointToCanvas(x, y, canvas.oldPoint.x, canvas.oldPoint.y, stokeColor);

        //绑定移动和抬起事件
        this.addEventListener("mousemove", move);
        this.addEventListener("mouseup", up);
    });

    // 鼠标抬起
    function up() {
        this.removeEventListener("mousemove", move);
    }

    // 鼠标移动
    function move(e) {
        let x = e.offsetX;
        let y = e.offsetY;

        // 记录点
        points.push(new Point(x, y));

        drawPointToCanvas(x, y, canvas.oldPoint.x, canvas.oldPoint.y, stokeColor);

        this.oldPoint = {
            x: x,
            y: y
        }
    }

    // 绘画按钮
    let drawBtn = document.getElementById('draw');
    drawBtn.onclick = function () {

    };

    // 清空按钮
    let clearBtn = document.getElementById('clear');
    clearBtn.onclick = function () {
        clearCanvas();
    };

    // 识别按钮,笔画换个颜色,把识别结果记录出来
    let useBoundedRotationInvariance = false;
    let recognizer = new DollarRecognizer(useBoundedRotationInvariance);

    let identifyBtn = document.getElementById('identify');
    identifyBtn.onclick = function () {
        if (is_null)
            alert('您尚未画图');
        else {
            let result = recognizer.Recognize(points, useBoundedRotationInvariance, false, false);
            result = result['Name'];

            // 展示识别结果
            addResult(stokeColor, result);

            // 记录该图形
            shapes.push(new Shape(stokeColor, result, points));
            // 清空点集和笔画计数
            points = [];
            is_null = true;

            // 变换颜色
            stokeColor = getStrokeColor();
        }
    };

    // 导出按钮
    let outputBtn = document.getElementById('output');
    outputBtn.onclick = function () {
        // 下载到本地
        let json = JSON.stringify(shapes);
        let filestr = "data:text/json;charset=utf-8," + encodeURIComponent(json);
        let downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", filestr);
        downloadAnchorNode.setAttribute("download", 'draw.json');
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    // 导入按钮
    let inputMockBtn = document.getElementById('mock');
    inputMockBtn.onchange = function readFile() {
        let file = this.files[0];//获取input输入的图片
        let reader = new FileReader();
        reader.onload = function (ev) {
            // 解析成json
            loadfile = ev.target.result;
            let newshapes = JSON.parse(loadfile);

            // 重新绘画
            drawToCanvas(newshapes);
        };
        reader.readAsText(file);
    };

    let inputBtn = document.getElementById('input');
    inputBtn.onclick = function () {
        inputMockBtn.click();
    };

    // 清空画布
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 判定不在绘画
        is_null = true;
        shapes = [];
        points = [];

        // 清空识别结果
        let parent = document.getElementById('result_div');
        while (parent.children.length !== 0) {
            parent.removeChild(parent.children[0]);
        }
        parent.insertAdjacentHTML('beforeend', '<div class="title">识别结果</div>');
    }

    // 重新画图到canvas
    function drawToCanvas(newshapes) {
        // 清空画板
        clearCanvas();
        shapes = newshapes;

        for (let i = 0; i < shapes.length; i++) {
            let points = shapes[i]['points'];
            let color = shapes[i]['color'];
            let tag = shapes[i]['tag'];
            // 标注
            addResult(color, tag);
            // 画点
            for (let j = 0; j < points.length - 1; j++) {
                drawPointToCanvas(points[j].X, points[j].Y, points[j + 1].X, points[j + 1].Y, color);
            }
        }
    }

    // 每个点的绘画方法
    function drawPointToCanvas(x1, y1, x2, y2, color) {
        ctx.beginPath();

        // 线的颜色
        ctx.strokeStyle = color;
        // 线的宽度
        ctx.lineWidth = 3;

        // 线的样式
        ctx.lineCap = "round";
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();

        is_null = false;
    }

    // 添加识别结果
    function addResult(color, result) {
        let dom = '<div class="single_result" style="color: ' + color + '">' + result + '</div>';
        document.getElementById('result_div').insertAdjacentHTML('beforeend', dom);
    }

    // 随机产生笔画颜色
    function getStrokeColor() {
        let random_number = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase();
        let random_color = "#" + "000000".substring(0, 6 - random_number) + random_number;

        while (random_color === document.body.style.backgroundColor) {
            random_number = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase();
            random_color = "#" + "000000".substring(0, 6 - random_number) + random_number;
        }
        return random_color;
    }

    // 形状
    class Shape {
        constructor(color, result, points) {
            this.tag = result;
            this.points = points;
            this.color = color;
        }
    }
});
