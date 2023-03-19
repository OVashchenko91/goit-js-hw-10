

import './css/styles.css';
import debounce from 'lodash.debounce';

import { fetchCountries } from './fetchCountries';

// all modules
import Notiflix from 'notiflix';

// one by one
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Block } from 'notiflix/build/notiflix-block-aio';


const DEBOUNCE_DELAY = 300;//використовується у функціях debounce для підтримки виконання функцій

const refs = { //оголошення посилання на об’єкт, яке містить посилання на елементи на сторінці, і створення змінних, які містять посилання на відповідні елементи
  searchBox: document.querySelector('input#search-box'),
  countryList: document.querySelector('ul.country-list'),
  countryInfo: document.querySelector('div.country-info'),
};
const { countryInfo, countryList, searchBox } = refs;

const clearContainers = () => { //очищає вміст контейнерів, які відображають інформацію про країну або список країн
  countryInfo.innerHTML = '';
  countryList.innerHTML = '';
};

const createMarkup = data => //створює розмітку списку країн на основі даних, отриманих за допомогою функції fetchCountries
  data
    .map(
      ({ name, flags }) =>
        `<li class="country-list__item">
          <img class="country-list__image" src="${flags.svg}" alt="${name.official}" width="32">
          <span class="country-list__name" >${name.official}</span>
        </li>`
    )
    .join('');

const createOneCountryMarkup = ([country]) => { //створює розмітку для однієї країни, використовуючи дані, отримані за допомогою функції fetchCountries
  const { name, flags, capital, population, languages } = country;

  return `<div class="country-info__head">
            <img class="country-info__image" src="${flags.svg}" alt="${
    name.official
  }" width="80">
            <span class="country-info__name">${name.official}</span>
          </div>
          <ul class="list">
            <li class="country-info__feature">
              <span class="country-info__feature-caption">Capital: </span>${capital}
            </li>
            <li class="country-info__feature">
              <span class="country-info__feature-caption">Population: </span>${population}
            </li>
            <li class="country-info__feature">
              <span class="country-info__feature-caption">Languages: </span>${Object.values(
                languages
              ).join(', ')}
            </li>
          </ul>`;
};

const checkData = data => {//перевіряє дані, отримані за допомогою функції fetchCountries, і в залежності від кількості знайдених сторінок відображає інформацію про список країн, або про одну сторінку, або інформаційне повідомлення про те, що знайдено занадто багато країн
  if (data.length > 10) {
    Notify.info('Too many matches found. Please enter a more specific name.');
    return;
  }

  if (data.length > 1) {
    countryList.innerHTML = createMarkup(data);
    return;
  }

  countryInfo.innerHTML = createOneCountryMarkup(data);
};

const showError = error => //показує повідомлення про помилки на сторінці залежно від типу помилок, що виникають при виконанні функції fetchCountries
  Notify.failure(
    error.message === '404'
      ? 'Oops, there is no country with that name'
      : 'Oops, something went wrong'
  );

const findCountries = async name => { //викликає функцію fetchCountries і передає її ім'я країни для пошуку. Потім перевіряє результат за допомогою функції checkData і відображає інформаційне повідомлення про помилку в разі невдачі

  try {
    checkData(await fetchCountries(name));
  } catch (error) {
    showError(error);
  }
};

const onInput = ({ target }) => {//викликає кожен раз при зміні вмісту поля вводу та функція findCountries з переданим у неї значенням поля вводу
  const countryName = target.value.trim();

  clearContainers();

  if (!countryName) return;

  findCountries(countryName);
};

searchBox.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));//обробник події 'input' на елементі пошуку, який викликає функцію onInput із затримкою за допомогою функції debounce, для того, щоб не надсилати багато запитів на сервер при частому зміненні значення поля введення
