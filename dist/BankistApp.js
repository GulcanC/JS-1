'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP
//🔴We have 4 bank accounts
// Data
const account1 = {
  owner: 'Marie Vernet',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 111,

  movementsDates: [
    '2020-11-18T21:31:17.178Z',
    '2020-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2021-05-26T10:17:24.185Z',
    '2020-06-03T14:11:59.604Z',
    '2021-06-01T17:01:17.194Z',
    '2021-05-28T23:36:17.929Z',
    '2021-05-30T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'fr-FR',
};

const account2 = {
  owner: 'David Dion',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 222,

  movementsDates: [
    '2020-11-01T13:15:33.035Z',
    '2020-11-30T09:48:16.867Z',
    '2020-12-25T06:04:23.907Z',
    '2021-01-25T14:18:46.235Z',
    '2021-02-05T16:33:06.386Z',
    '2021-04-10T14:43:26.374Z',
    '2021-06-03T18:49:59.371Z',
    '2021-06-01T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//1. Format movements date
// to see transfer dates
// calculate how many days passed
// Rounding method to see dates well
// ınternationalisation the date, tarihi ulusallaştırma.

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
};

//2. Create a reusable function to format internationalisation currencies

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//3. Create a function "displayMovements"
// The movements will be sorted in descending or ascending order
// At the beginning it is false when we click the sort button it will be true.
// Define it as conditional. If it is true sort movements, if it is false show normal movements
// Use forEach Method and callBack Function
// Inside this function, we need the current movement and index
// Here number 1 is deposit, number 2 is withdrawal.
// Create an HTML, with template literal.
// Inside this template literal, create a string of HTML includes movements data
// Use FIXED method to make well the decimal parts
// Use InsertAdjacentHTML method
// Use 'afterbegin' to add this template at the beginning of the container
// In this case the movements will be displayed in the user interface

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ' ';
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMov = formatCur(mov, acc.locale, acc.currency);
    const html = ` <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedMov}</div>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//4. Accumulate the balance of movements of all accounts
// Use reduce method
// Choose inital value as 0

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

//5. Display Summary
// Use FILTER method to filter deposits from withdrawals
// Use REDUCE method to calculate incomes and out
// To convert all accounts $ or EUR use local and currency

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);
  //6. Calculate the summary of interest
  // FILTER METHOD chose deposits
  // MAP method to apply the interest rate to deposits
  // Rule: if interest rate <1, it will not pay interest
  // FILTER method to exclude the interest below one

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

//7. Computing usernames

// User names are just initials lowercase e.g. David Dion : dd
// Use forEach Method for each account.
// Use lowercase method and split method to separate each name
// we will take first letters of name and surname
// for doing this use MAP method and callBack Function
// We will obtain an array like that ['d', 'd']
// to write username dd, use JOIN method

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);
console.log(accounts);

//8. Create a new function to update account

const updateUI = function (acc) {
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

//9. TIMER
// Set time to 2 minutes
// call the timer every second
// Use Math.trunc to remove decimal parts
// Use padStart for padding
// When time is 0, stop timer and logout user
// Decrase time 1 second

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };
  let time = 120;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//10. Create date for current account
let currentAccount, timer;

//11.  Button login

// prevent the page to reload
// FIND method to see which user use application right now
// Check the pin, if current account pin is equal to input login pin, it is correct
// If the pin and username are true, display user ID and change welcome message
//Use SPLIT method to select first name
// Change the opacity style. If the username and pin is correct, opacity should be 1. For this select conatiner app
// Create current date and time
// After submitting the username and pin seem on the screen, to remove them, put an empty string. Clear input fields
// Cursor continuous to blink in the field areas, remove it
btnLogin.addEventListener('click', function (event) {
  event.preventDefault();

  currentAccount = accounts.find(
    account => account.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    updateUI(currentAccount);
  }
});

//12. Button Transfer
//transfer money to an account
// prevent reload when the submit button is clicked
// send the amount to different user
// Use FIND method to select the right receiver
// To transfer money, it should be greater than 0
// Current account balance should be equal or greater than the amount that will be send
// Receiver account should be true account
// Current account and receiver account should be different
// Use push method to write the amount whether it is - or +
// Add tarnsfer date
// Update UI
//Reset timer

btnTransfer.addEventListener('click', function (event) {
  event.preventDefault();
  const amount = Number(inputTransferAmount.value);

  const receiverAcc = accounts.find(
    account => account.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  console.log(amount, receiverAcc);

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    console.log('Transfer valid');

    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//13. Button close
// Check the user and pin are correct
// use SPLICE method to delete the current account
// Use FINDINDEX method to find index and delete one Element
// Check the index of current user
// delete account with SPLICE Method
// Hide UI
//Clean the field areas

btnClose.addEventListener('click', function (event) {
  event.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username == currentAccount.username
    );

    console.log(index);
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

//14. Button loan
//Use FLOOR method to round down the amount, 13,4 will be 13
// Use FIXED method to remove decimal parts
// add positif amount to current users account
// add loan date
// reset timer
// clear the empty field

btnLoan.addEventListener('click', function (event) {
  event.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some(movement => movement >= amount * 0.1)
  ) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
  }
  inputLoanAmount.value = '';
});

//15.Button Close
// check the user and pin are correct
// Use SPLICE method to delete the current account
//calculate the index that we want it to delete
// Use FINDINDEX method and delete one element
// hide UI
// Clean the fields

btnClose.addEventListener('click', function (event) {
  event.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    accounts.splice(index, 1);

    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

//16. Button sort

let sorted = false;

btnSort.addEventListener('click', function (event) {
  event.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
