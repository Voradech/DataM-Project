let weight1 = Math.random();
let weight2 = Math.random();
let bias = Math.random();
let learningRate = 0.05;
let epochs = 100;
let dataset = [];
let errorData = [];

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function predict(equipmentQuality, weatherCondition) {
    return sigmoid(equipmentQuality * weight1 + weatherCondition * weight2 + bias);
}

function trainPerceptron() {

     // ✅ เพิ่มค่าของ Weights ที่อัปเดตเข้าไปใน Weight Graph
     weightData.x.push(weight1);
     weightData.y.push(weight2);
     
    let eq = parseFloat(document.getElementById('equipmentQuality').value);
    let wc = parseFloat(document.getElementById('weatherCondition').value);

    if (isNaN(eq) || isNaN(wc)) {
        alert("กรุณากรอกค่าทั้งสองช่องก่อนทำการทำนาย!");
        return;
    }

    eq = Math.max(1, Math.min(eq, 10));
    wc = Math.max(1, Math.min(wc, 10));

    let target = eq > 5 && wc > 5 ? 1 : 0;
    let errors = [];

    for (let i = 0; i < epochs; i++) {
        let output = predict(eq, wc);
        let error = target - output;
        errors.push(error ** 2);

        weight1 += learningRate * error * eq;
        weight2 += learningRate * error * wc;
        bias += learningRate * error;
    }

    errorData.push(errors.reduce((a, b) => a + b, 0) / epochs);
    let prediction = predict(eq, wc) >= 0.5 ? "ชนะ" : "แพ้";

    dataset.push([
        dataset.length + 1,  // ลำดับที่เพิ่มขึ้น
        eq, wc, prediction, weight1, weight2, bias
    ]);

    console.log("Updated Weights:", weight1, weight2, bias); // ตรวจสอบค่าใหม่
    console.log("Latest Prediction:", prediction); // ตรวจสอบผลการทำนายใหม่

    updateTable();
    updateGraph();
    updateWeightsDisplay();  // ✅ ใช้ค่าใหม่ล่าสุด
    updateResult(prediction);  // ✅ แสดงผลทำนายทันที
    // generateErrorSurface();
    updateWeightGraph();
}

function updateTable() {
    let table = document.querySelector("#datasetTable tbody");
    table.innerHTML = "";
    dataset.forEach(data => {
        let row = `<tr>
            <td>${data[0]}</td> <!-- ลำดับ -->
            <td>${data[1]}</td><td>${data[2]}</td> <!-- Input -->
            <td>${data[3]}</td> <!-- ผลทำนาย (ชนะ/แพ้) -->
            <td>${data[4].toFixed(4)}</td><td>${data[5].toFixed(4)}</td><td>${data[6].toFixed(4)}</td>
        </tr>`;
        table.innerHTML += row;
    });
}

// ✅ ปุ่มซ่อน / แสดง Dataset
function toggleDataset() {
    let table = document.getElementById("datasetTable");
    table.style.display = (table.style.display === "none") ? "table" : "none";
}

// ✅ เรียกใช้ Dataset จำลองเมื่อเริ่มต้น
window.onload = function () {
    updateGraph();
    updateWeightsDisplay();
    updateWeightGraph();
};

let chartInstance = null; // เก็บตัวแปร Chart เพื่อตรวจสอบว่ามีกราฟอยู่หรือไม่

// function generateMockDataset(size = 10) {
//     dataset = []; // รีเซ็ต Dataset ทุกครั้งที่โหลดเว็บ
//     for (let i = 0; i < size; i++) {
//         let eq = Math.floor(Math.random() * 10) + 1; // สุ่มค่า 1-10
//         let wc = Math.floor(Math.random() * 10) + 1;
//         let prediction = sigmoid(eq * weight1 + wc * weight2 + bias) >= 0.5 ? "ชนะ" : "แพ้";
//         dataset.push([i + 1, eq, wc, prediction, weight1, weight2, bias]);
//     }
//     updateTable(); // ✅ อัปเดตตารางเมื่อสร้างข้อมูลใหม่
// }


function toggleDataset() {
    let rows = document.querySelectorAll("#datasetTable tbody tr"); // เลือกเฉพาะข้อมูลใน <tbody>
    let halfRows = Math.ceil(rows.length / 2); // คำนวณครึ่งหนึ่งของตาราง
    let isHidden = rows[halfRows]?.style.display === "none"; // ตรวจสอบว่าแถวครึ่งหลังซ่อนอยู่หรือไม่

    rows.forEach((row, index) => {
        if (index >= halfRows) {
            row.style.display = isHidden ? "table-row" : "none"; // ซ่อน/แสดงเฉพาะครึ่งหลัง
        }
    });
}


function updateGraph() { //error cost
    let ctx = document.getElementById('errorChart').getContext('2d');

    // ✅ ถ้ามีกราฟเก่า ให้ลบก่อน
    if (chartInstance !== null) {
        chartInstance.destroy();
    }

    // ✅ สร้างกราฟใหม่ และเก็บ instance ไว้
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: errorData.length}, (_, i) => i + 1),
            datasets: [{
                label: 'Error Cost',
                data: errorData,
                borderColor: 'red',
                borderWidth: 2,
                fill: false
            }]
        }
    });
}

// function generateErrorSurface() {
//     let weight1Range = Array.from({ length: 20 }, (_, i) => -1 + i * 0.1); // ช่วงค่าของ Weight1
//     let weight2Range = Array.from({ length: 20 }, (_, i) => -1 + i * 0.1); // ช่วงค่าของ Weight2
//     let errorSurface = [];

//     for (let w1 of weight1Range) {
//         let row = [];
//         for (let w2 of weight2Range) {
//             let totalError = 0;
//             dataset.forEach(data => {
//                 let eq = data[1];
//                 let wc = data[2];
//                 let target = data[3] === "ชนะ" ? 1 : 0;
//                 let prediction = sigmoid(eq * w1 + wc * w2 + bias);
//                 let error = (target - prediction) ** 2;
//                 totalError += error;
//             });
//             row.push(totalError / dataset.length);
//         }
//         errorSurface.push(row);
//     }

//     let trace = {
//         x: weight1Range,
//         y: weight2Range,
//         z: errorSurface,
//         type: "surface"
//     };

//     let layout = {
//         title: "Error Surface Plot",
//         scene: {
//             xaxis: { title: "Weight 1" },
//             yaxis: { title: "Weight 2" },
//             zaxis: { title: "Error Cost" }
//         }
//     };

//     Plotly.newPlot("errorSurface", [trace], layout);
// }

let weightData = { x: [], y: [] }; // เก็บค่าของ Weight1 และ Weight2
let weightChart = null;

function updateWeightGraph() {
    let ctx = document.getElementById("weightGraph").getContext("2d");

    // ✅ ถ้ามีกราฟเก่า ต้องลบก่อน
    if (weightChart !== null) {
        weightChart.destroy();
    }

    // ✅ ถ้ายังไม่มีข้อมูลใน dataset ให้ใช้ Weight ปัจจุบัน
    if (weightData.x.length === 0) {
        weightData.x.push(weight1);
        weightData.y.push(weight2);
    }

    weightChart = new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                label: "การเคลื่อนที่ของ Weight",
                data: weightData.x.map((w1, i) => ({ x: w1, y: weightData.y[i] })),
                borderColor: "blue",
                backgroundColor: "blue",
                pointRadius: 5,
            },
            {
                label: "เป้าหมาย (Optimal Point)",
                data: [{ x: 0, y: 0 }], // ✅ จุดเป้าหมายกลางกราฟ
                borderColor: "red",
                backgroundColor: "red",
                pointRadius: 7,
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: "Weight 1" } },
                y: { title: { display: true, text: "Weight 2" } }
            }
        }
    });

    console.log("Weight Graph Updated:", weightData.x, weightData.y);
}


// function updateWeightsDisplay() {
//     console.log("Latest Weights for Display:", weight1, weight2, bias); // Debugging

//     document.getElementById('weights').innerHTML = `
//         น้ำหนัก 1: ${weight1.toFixed(4)} <br>
//         น้ำหนัก 2: ${weight2.toFixed(4)} <br>
//         Bias: ${bias.toFixed(4)}
//     `;
// }

function updateWeightsDisplay() {
    let lastData = dataset.length > 0 ? dataset[dataset.length - 1] : null;

    if (lastData) {
        // ใช้ค่าล่าสุดจาก dataset
        document.getElementById('weights').innerHTML = `
            น้ำหนัก 1: ${lastData[4].toFixed(4)} <br>
            น้ำหนัก 2: ${lastData[5].toFixed(4)} <br>
            Bias: ${lastData[6].toFixed(4)}
        `;
    } else {
        // ใช้ค่าล่าสุดจาก ANN
        document.getElementById('weights').innerHTML = `
            น้ำหนัก 1: ${weight1.toFixed(4)} <br>
            น้ำหนัก 2: ${weight2.toFixed(4)} <br>
            Bias: ${bias.toFixed(4)}
        `;
    }
}


function updateResult(prediction) {
    console.log("Displaying Prediction:", prediction); // Debugging
    document.getElementById('result').innerHTML = `ผลการทำนาย: ${prediction}`;
}


function resetForm() {
    document.getElementById('equipmentQuality').value = 0;
    document.getElementById('weatherCondition').value = 0;
    document.getElementById('result').innerHTML = '';
}
