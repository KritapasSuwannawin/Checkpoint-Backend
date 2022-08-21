const readline = require('readline');

function makeRandomCode(length, isIncludeCharacter) {
  let result = '';
  const characters = isIncludeCharacter ? '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' : '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// month = 1, 3, 12, 2400
// quantityArr = [quantity1Month, quantity3Month, quantity12Month, quantity2400Month]
// INSERT INTO coupon (email, code, is_activated, month) values ('checkpoint.pma@gmail.com', '${couponCode}', false, ${month});

let quantityArr = [0, 0, 0, 0];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('quantity (quantity1Month, quantity3Month, quantity12Month, quantity2400Month): ', (answer) => {
  quantityArr = answer.split(',').map((quantity) => Number(quantity.trim()));

  generateCoupons([
    { month: 1, quantity: quantityArr[0] },
    { month: 3, quantity: quantityArr[1] },
    { month: 12, quantity: quantityArr[2] },
    { month: 2400, quantity: quantityArr[3] },
  ]);

  rl.close();
});

function generateCoupons(monthQuantityArr) {
  let query = '';

  monthQuantityArr.forEach((arr) => {
    const { month, quantity } = arr;

    if (quantity === 0) {
      return;
    }

    console.log('month:', month);

    for (let i = 0; i < quantity; i++) {
      const couponCode = makeRandomCode(10, true);

      query += `INSERT INTO coupon (email, code, is_activated, month) values ('checkpoint.pma@gmail.com', '${couponCode}', false, ${month});`;

      console.log(couponCode);
    }

    console.log();
  });

  console.log(query);
}
