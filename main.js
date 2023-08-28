const prompt = require('prompt-sync')({ sigint: true });
const clear = require('clear-screen');


//ขั้นตอนการคิด
// 1. ทำความเข้าใจโจทย์ว่าให้ทำสนามขึ้นมา แล้วกำหนดจุดเริ่มต้น เดินขยับ 4 ทิศทาง เพื่อไปตามหา hat แล้วมีอุปสรรคคือ hole
// 2. แยก element ของเกมก่อนว่ามีอะไรบ้างที่ควรมี 
//      -สนาม ข้างในมี ผู้เล่นที่จุดเริ่มต้น, บนพื้นมีหญ้า, มีหลุมกระจัดกระจายแบบ random และตำแหน่งของหมวก
//      -คอนโซลควบคุมทิศทาง มี ซ้าย-ขวา-ขึ้น-ลง และมีปุ่ม reset game
//      -มีการบอก status 
// 3. เริ่มทำไปทีละส่วน แล้วค่อยเพิ่มรายละเอียด
// 4. สร้างสนามเปล่า ด้วยการเขียน array 2 ทิศทาง มีการกำหนดค่า row, column และ percent hole 
// 5. เขียนเงื่อนไขเกี่ยวกับการ random สนาม  ให้มีจุดเริ่มต้นที่ [0][0] และเพิ่ม hole แบบ random และวางตำแหน่ง hat 
// 6. ทดสอบ ด้วย node main.js เรื่อย ๆ ถ้าขึ้นเป็นสนามแล้ว มีจุดเริ่มต้น มีหลุม มีหมวกแล้ว ก็ดำเนินต่อไป
// 7. สร้างการควบคุมของเกม ด้วยการทำฟังก์ชั่นทิศทาง 4 ทาง และมีปุ่ม พร้อมกับ status ในแต่ละก้าว ถ้าเจอหมวก ก็ชนะ ถ้าเจอหลุมก็แพ้ และกดปุ่ม reset เริ่มเกมใหม่
// 8. ในการทำฟังก์ชั่นการเดิน ก็จะกำหนดให้เดินไม่เกินขอบของสนาม
// 9. หลังจากนั้นสร้างฟังก์ชั่นในการรับค่าคำสั่งจากการเดิน คือการกำหนดปุ่มต่าง ๆ หากพิมพ์ตัวอักษร a d w s ก็จะมีการทำงานในการเดินในทิศทางที่กำหนดไว้
// 10. สร้าง prompt ขึ้มาเพื่อรับคำสั่ง
// 11. ตรวจเช็ครายละเอียดค่าต่าง ๆ และรันโค้ดทุกครั้ง เพื่อตรวจสอบการทำงานของเกม

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

//class template ของเกม
class Field {
  constructor(row, column, percentHole) {
    this.hat = hat;
    this.hole = hole;
    this.fieldCharacter = fieldCharacter;
    this.pathCharacter = pathCharacter;
    this.row = row;
    this.column = column;
    this.percentHole = percentHole;
    this.currentRow = 0;
    this.currentColumn = 0;
    this.field = this.generateField();
    this.field[0][0] = this.pathCharacter;
  }

  // สร้างสนามของเกมขึ้นมาแบบ random
  generateField() {
    const field = []; //สนามเปล่า

    // กำหนด row, column ตามค่าที่รับมา
    for (let i = 0; i < this.row; i++) {
      const row = []; //row เปล่า
      for (let j = 0; j < this.column; j++) {
        if (i === 0 && j === 0) { //กำหนดจุดเริ่มต้น [0][0] ให้เป็น Character
          row.push(this.pathCharacter); //เพิ่ม Character ลงไป
        } else if (i === this.row - 2 && j === this.column - 2) { //กำหนดตำแหนงของหมวกโดยลบออกจากจำนวนของ row และ column 
          row.push(this.hat); //เพิ่ม hat เข้าไป
        } else if (Math.random() < this.percentHole) { // random hole ตาม percentage ที่ใส่ค่าเข้ามา
          row.push(this.hole); // เพิ่ม hole
        } else { //ที่เหลือนอกจากนี้ให้เป็นสนามหญ้า
          row.push(this.fieldCharacter); //เพิ่ม field
        }
      }
      field.push(row); //เพิ่มค่าจาก row ที่ผ่านเงื่อนไขแล้วเข้าไปในสนาม
    }
    return field; ส่งค่าออกไป
  }

  //Move direction function
  //คิดว่าการจะทำให้ขยับได้มันจะต้องเกี่ยวกับตำแหน่ง [row][column] ที่มีการเพิ่มลดค่าในนั้น

  //เดินไปทางซ้าย จะมีทิศทางเในแกน x หรือลำดับ index ของ column ดังนั้นซ้ายสุดเลยคือ [0] 
  moveLeft() {
    if (this.currentColumn > 0) {
      this.currentColumn--; //ลบ
    }
  }

  //เดินไปทางขวา ก็จะคล้าย ๆ กับเดินไปทางซ้าย แต่ตรงข้ามกัน index ท้ายสุด คือ จำนวน column - 1 
  moveRight() {
    if (this.currentColumn < this.column - 1) {
      this.currentColumn++; //บวก
    }
  }

  //เดินขึ้น มีหลักการเดียวกัน แต่จะเดินในทิศทาง แกน y หรือ row ดังนั้น index บนสุดคือ [0]
  moveUp() {
    if (this.currentRow > 0) {
      this.currentRow--;
    }
  }

  //เดินลง index ท้ายสุด คือ จำนวน row - 1 
  moveDown() {
    if (this.currentRow < this.row - 1) {
      this.currentRow++;
    }
  }

  //เพิ่ม function reset ให้เป็นสนามใหม่ เพื่อที่จะให้ผู้เล่นเริ่มเล่นใหม่อีกครั้ง
  //และอีกอย่างคือ ในสนามบางครั้ง hole จะปิดเส้นทางการเดิน ซึ่งยังหาทางแก้หรือตั้งเงื่อนไขไม่ได้ จึงให้ผู้เล่น กด reset ใหม้ได้
  reset() {
    this.currentRow = 0;
    this.currentColumn = 0;
    this.field = this.generateField();
    this.field[0][0] = this.pathCharacter;
  }

  //function ในการรับคำสั่งการทำงาน โดยใช้ a d w s ในการควบคุมทิศทาง เนื่องจากเกมต่าง ๆ ก็มีการใช้งานของปุ่มนี้เช่นกัน
  moveInMap(direction) {
    if (direction === "a") {
      this.moveLeft();
    } else if (direction === "d") {
      this.moveRight();
    } else if (direction === "w") {
      this.moveUp();
    } else if (direction === "s") {
      this.moveDown();
    } else if (direction === "reset") {
      this.reset();
    }

    //มีการสร้างเงื่อนไข เพื่อบอก status ของผู้เล่นในตำแหน่งปัจจุบัน
    const currentCell = this.field[this.currentRow][this.currentColumn];
      if (currentCell === this.hat) {
        console.log("You won!,finding the hat successfully."); //เจอ hat
      } else if (currentCell === this.hole) {
        console.log("You lost, falling the hole."); //ตก hole
        console.log("Please, reset for new game."); //แนะนำให้ reset 
        // this.reset();
      } else {
        console.log("Finding the hat.");
        this.field[this.currentRow][this.currentColumn] = this.pathCharacter; //กำลังดำเนินการ
      }
    // return ค่าใน currentCell ออกไป
    return currentCell;
  }

  //function แสดงผล  
  print() {
    clear(); //เคลียร์หน้าจอทุกครั้งที่ดำเนินการ
    for (let i = 0; i < this.row; i++) {
      console.log(this.field[i].join("")); //ใช้ method .join() เพื่อเอาช่องว่างของสนามออก
    }
    console.log(" "); //เพิ่มบรรทัดเปล่า เพื่อความสวยงามและสบายตา
    console.log("a = left | d = right | w = up | s = down | reset = new game"); //คำแนะนำเกม
    console.log(" ");
    console.log("status :"); //สามารถดู status ได้
    console.log(this.moveInMap()); // รับค่ามาจากฟังก์ชั่น moveInMap() ที่ข้างในนั้น มี ค่า return ของ currentCell 
  }
}

//กำหนด user ใหม่
//มีค่าให้ใส่ 3 ค่า คือ row, column, percentHole
const myfield = new Field(10, 30, 0.2);

//ฟังก์ชันรับคำสั่ง prompt ที่ user กรอกเข้าไป
while (true) {
  myfield.print();
  const userInput = prompt("พิมพ์คำสั่ง : "); //กำหนดค่า
  myfield.moveInMap(userInput); //ใส่ค่าลงไปในฟังก์ชั่น

}
