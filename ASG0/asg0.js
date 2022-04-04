function main() {
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element'); 
        return;
    }
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color
    let v1 = new Vector3([2.25, 2.25, 0]);
    drawVector(v1, "red", ctx);
    document.getElementById('drawButton').addEventListener("click", function() {
        handleDrawEvent(ctx);
    });
    document.getElementById('drawButton1').addEventListener("click", function() {
        handleDrawOperationEvent(ctx);
    });
    
}

function drawVector(v, color, a) {
    a.strokeStyle = color;
    a.beginPath();
    a.moveTo(200, 200);
    a.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20);
    a.stroke();
}

function handleDrawEvent(canv) {
    canv.clearRect(0, 0, 400, 400);
    canv.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color
    canv.fillRect(0, 0, 400, 400); // Fill a rectangle with the color
    var x1 = document.getElementById("xVal").value;
    var y1 = document.getElementById("yVal").value;
    let v2 = new Vector3([x1, y1, 0]);
    var x2 = document.getElementById("xVal1").value;
    var y2 = document.getElementById("yVal1").value;
    let v3 = new Vector3([x2, y2, 0]);
    drawVector(v2, "red", canv);
    drawVector(v3, "blue", canv);
}

function handleDrawOperationEvent(canv) {
    canv.clearRect(0, 0, 400, 400);
    canv.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color
    canv.fillRect(0, 0, 400, 400); // Fill a rectangle with the color
    var x1 = document.getElementById("xVal").value;
    var y1 = document.getElementById("yVal").value;
    let v2 = new Vector3([x1, y1, 0]);
    var x2 = document.getElementById("xVal1").value;
    var y2 = document.getElementById("yVal1").value;
    let v3 = new Vector3([x2, y2, 0]);
    drawVector(v2, "red", canv);
    drawVector(v3, "blue", canv);
    if(document.getElementById("operation").value == "add") {
        let v4 = v2.add(v3);
        drawVector(v4, "green", canv);
    } else if(document.getElementById("operation").value == "subtract") {
        let v4 = v2.sub(v3);
        drawVector(v4, "green", canv);
    } else if(document.getElementById("operation").value == "multiply") {
        var scaleVal = document.getElementById("scale").value;
        console.log(scaleVal);
        let v4 = v2.mul(scaleVal);
        let v5 = v3.mul(scaleVal);
        drawVector(v4, "green", canv);
        drawVector(v5, "green", canv);
    } else if(document.getElementById("operation").value == "divide") {
        var scaleVal = document.getElementById("scale").value;
        let v4 = v2.div(scaleVal);
        let v5 = v3.div(scaleVal);
        drawVector(v4, "green", canv);
        drawVector(v5, "green", canv);
    } else if(document.getElementById("operation").value == "magnitude") {
        console.log("Magnitude v1: " + v2.magnitude());
        console.log("Magnitude v2: " + v3.magnitude());
    } else if(document.getElementById("operation").value == "normalize") {
        let v4 = v2.normalize();
        let v5 = v3.normalize();
        drawVector(v4, "green", canv);
        drawVector(v5, "green", canv);
    } else if(document.getElementById("operation").value == "angle") {
        console.log(angleBetween(v2, v3));
    } else if(document.getElementById("operation").value == "area") {
        console.log("Area of the triangle: " + areaTriangle(v2, v3));
    }

}

function angleBetween(v1, v2) {
    let a = 0;
    a = (Vector3.dot(v1, v2)) / (v1.magnitude() * v2.magnitude());
    var b = Math.acos(a);
    b = b * (180 / Math.PI);
    return b;
}

function areaTriangle(v1, v2) {
    let ar = Vector3.cross(v1, v2);
    return ar.magnitude() / 2;
}