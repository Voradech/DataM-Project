// ฟังก์ชัน fitness: คำนวณค่า fitness ของ genome โดยพิจารณาจากน้ำหนักของสินค้าทั้งหมด
function fitness(genome, items, maxWeight) {
    // นับรวมค่าน้ำหนักของสินค้าที่เลือก (1 สำหรับเลือก, 0 สำหรับไม่เลือก)
    let weight = genome.reduce((sum, gene, index) => sum + gene * items[index], 0);
    // คืนค่าน้ำหนักถ้าน้ำหนักรวมไม่เกินค่าน้ำหนักสูงสุด ถ้าเกินคืนค่า 0
    return weight <= maxWeight ? weight : 0;
}

// ฟังก์ชัน selectParents: เลือกพ่อแม่จากประชากรโดยใช้วิธีที่เลือก (elitism, tournament, หรือ ranking)
function selectParents(population, fitnesses, method, populationSize, items, maxWeight) {
    if (method === "elitism") {
        // เรียงประชากรตาม fitness จากมากไปน้อย และเลือกประชากรที่ดีที่สุด
        let sortedPopulation = population.slice().sort((a, b) => fitness(b, items, maxWeight) - fitness(a, items, maxWeight));
        return sortedPopulation.slice(0, populationSize); // เลือกประชากรที่ดีที่สุดตามขนาดประชากรที่กำหนด
    } else if (method === "tournament") {
        let parents = [];
        // เลือกพ่อแม่จนกว่าจะได้จำนวนพ่อแม่ที่ต้องการ
        while (parents.length < populationSize) {
            // เลือกประชากรแบบสุ่มจำนวน 5 ตัวเพื่อจัดการแข่งขัน
            let tournament = population.slice().sort(() => 0.5 - Math.random()).slice(0, 5);
            // คำนวณค่า fitness ของประชากรในการแข่งขัน
            let tournamentFitnesses = tournament.map(ind => fitness(ind, items, maxWeight));
            // เลือกผู้ชนะจากการแข่งขัน (ตัวที่มี fitness สูงสุด)
            let winner = tournament[tournamentFitnesses.indexOf(Math.max(...tournamentFitnesses))];
            parents.push(winner);
        }
        return parents;
    } else if (method === "ranking") {
        // เรียงประชากรตาม fitness จากมากไปน้อย
        let sortedPopulation = population.slice().sort((a, b) => fitness(b, items, maxWeight) - fitness(a, items, maxWeight));
        // คำนวณความน่าจะเป็นในการเลือกแต่ละประชากรตามลำดับ (ประชากรที่มี rank สูงจะมีโอกาสเลือกสูง)
        let probabilities = sortedPopulation.map((_, i) => 1 / (i + 1));
        // ปรับค่าความน่าจะเป็นให้รวมกันเป็น 1
        let totalProb = probabilities.reduce((sum, p) => sum + p, 0);
        probabilities = probabilities.map(p => p / totalProb);
        // เลือกพ่อแม่โดยการสุ่มตามความน่าจะเป็น
        return Array.from({ length: populationSize }, () => {
            let rand = Math.random();
            let sum = 0;
            for (let i = 0; i < sortedPopulation.length; i++) {
                sum += probabilities[i];
                if (rand < sum) return sortedPopulation[i];
            }
            return sortedPopulation[sortedPopulation.length - 1];
        });
    }
    return population; // ถ้าไม่มีวิธีเลือกที่ตรงกัน ให้คืนประชากรเดิม
}

// ฟังก์ชันที่ทำงานเมื่อส่งฟอร์ม: เริ่มต้นการทำงานของอัลกอริธึมทางพันธุกรรม
document.getElementById('gaForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // รับข้อมูลจากฟอร์ม
    let number_of_items = parseInt(document.getElementById('number_of_items').value); // จำนวนสินค้า
    let max_weight = parseInt(document.getElementById('max_weight').value); // น้ำหนักสูงสุดที่อนุญาต
    let population_size = parseInt(document.getElementById('population_size').value); // ขนาดประชากร
    let mutation_rate = parseFloat(document.getElementById('mutation_rate').value); // อัตราการกลายพันธุ์
    let selection_method = document.getElementById('selection_method').value; // วิธีการเลือกพ่อแม่

    // สร้างสินค้าทั้งหมด โดยสุ่มน้ำหนักจาก 1 ถึง 10
    let items = Array.from({ length: number_of_items }, () => Math.floor(Math.random() * 10) + 1);

    // สร้างประชากรเริ่มต้น โดยสุ่มค่าจีโนม (0 หรือ 1) สำหรับแต่ละตัว
    let population = Array.from({ length: population_size }, () =>
        Array.from({ length: number_of_items }, () => Math.floor(Math.random() * 2))
    );

    // เริ่มต้นการทำงานของอัลกอริธึมทางพันธุกรรม
    let generation = 0;
    let best_fitness = 0;
    let best_solution = null;
    let max_generations = 100; // จำนวนรุ่นสูงสุด
    let stagnant_generations = 0; // จำนวนรุ่นที่ไม่มีการพัฒนา
    let max_stagnant_generations = 10; // รุ่นที่ไม่มีการพัฒนามากที่สุด

    let resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'กำลังประมวลผล...';

    let allGenerations = []; // เก็บข้อมูลผลลัพธ์ของทุกรุ่น

    // ฟังก์ชันที่ทำงานในแต่ละรุ่น
    function runGeneration() {
        if (generation < max_generations && stagnant_generations < max_stagnant_generations) {
            generation++;
            let fitnesses = population.map(ind => fitness(ind, items, max_weight)); // คำนวณ fitness ของประชากรแต่ละตัว

            let max_fitness = Math.max(...fitnesses); // ค่าฟิตเนสสูงสุดในรุ่นนี้
            let max_fitness_index = fitnesses.indexOf(max_fitness); // หา index ของผู้ที่มี fitness สูงสุด
            let current_best_solution = population[max_fitness_index]; // เก็บค่าผลลัพธ์ที่ดีที่สุดในรุ่นนี้

            // ถ้าฟิตเนสในรุ่นนี้สูงกว่าเดิม ให้ปรับค่าผลลัพธ์ที่ดีที่สุด
            if (max_fitness > best_fitness) {
                best_fitness = max_fitness;
                best_solution = current_best_solution;
                stagnant_generations = 0; // รีเซ็ตการนับรุ่นที่ไม่มีการพัฒนา
            } else {
                stagnant_generations++; // เพิ่มจำนวนรุ่นที่ไม่มีการพัฒนา
            }

            // เลือกพ่อแม่โดยใช้วิธีที่เลือก
            let parents = selectParents(population, fitnesses, selection_method, population_size, items, max_weight);

            let next_population = [];
            // สร้างประชากรรุ่นถัดไปโดยการผสมพันธุ์
            for (let i = 0; i < population_size / 2; i++) {
                let parent1 = parents[Math.floor(Math.random() * parents.length)];
                let parent2 = parents[Math.floor(Math.random() * parents.length)];
                let crossover_point = Math.floor(Math.random() * (number_of_items - 1)) + 1; // เลือกจุดตัดการผสมพันธุ์
                let child1 = parent1.slice(0, crossover_point).concat(parent2.slice(crossover_point));
                let child2 = parent2.slice(0, crossover_point).concat(parent1.slice(crossover_point));
                next_population.push(child1, child2); // เพิ่มลูกทั้งสองลงในประชากร
            }

            // ใช้อัตราการกลายพันธุ์ในการทำให้บางยีนส์เปลี่ยนแปลง
            next_population.forEach(individual => {
                if (Math.random() < mutation_rate) {
                    let mutate_index = Math.floor(Math.random() * number_of_items);
                    individual[mutate_index] = 1 - individual[mutate_index]; // กลายพันธุ์โดยการสลับค่าของยีนส์
                }
            });

            population = next_population; // อัปเดตประชากรเป็นประชากรรุ่นถัดไป

            // บันทึกผลลัพธ์ของรุ่นนี้
            allGenerations.push({
                generation: generation,
                bestFitness: best_fitness,
                bestSolution: best_solution.join(', ') // แปลงผลลัพธ์เป็นสตริงเพื่อใช้ในตาราง
            });

            // อัปเดตตารางผลลัพธ์
            let tableHTML = `
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Generation</th>
                            <th>Best Fitness</th>
                            <th>Best Solution</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            // สร้างแถวตารางสำหรับทุกๆ รุ่น
            allGenerations.forEach(gen => {
                tableHTML += `
                    <tr>
                        <td>${gen.generation}</td>
                        <td>${gen.bestFitness}</td>
                        <td>${gen.bestSolution}</td>
                    </tr>
                `;
            });

            tableHTML += `</tbody></table>`;

            resultDiv.innerHTML = tableHTML;

            setTimeout(runGeneration, 100); // เรียกฟังก์ชันนี้ซ้ำเพื่อทำงานในรุ่นถัดไป
        } else {
            // เมื่อถึงรุ่นสูงสุดหรือไม่มีการพัฒนาให้แสดงผลลัพธ์สุดท้าย
            resultDiv.innerHTML = `
                <h4>ผลลัพธ์สุดท้าย</h4>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Generation</th>
                            <th>Best Fitness</th>
                            <th>Best Solution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${generation}</td>
                            <td>${best_fitness}</td>
                            <td>${best_solution ? best_solution.join(', ') : 'ไม่พบผลลัพธ์'}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }
    }

    runGeneration(); // เริ่มทำงาน
});