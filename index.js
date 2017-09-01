const formExample = document.querySelector('#myForm');
const submitButton = document.querySelector('#submitButton');
const resultContainer = document.querySelector('#resultContainer');

const _REGEX_FIO = /^[A-Za-zА-Яа-яЁё]+\s[A-Za-zА-Яа-яЁё]+\s[A-Za-zА-Яа-яЁё]+$/;
const _REGEX_EMAIL = /^[A-Za-z-_\.]{1,30}@(yandex\.ru|ya\.ru|yandex\.ua|yandex\.by|yandex\.kz|yandex\.com)$/;
const _REGEX_PHONE = /^\+7\(\d\d\d\)\d\d\d-\d\d-\d\d$/;


var form = {
  fio: formExample.querySelector('#myForm input[name=\'fio\']'),
  email: formExample.querySelector('#myForm input[name=\'email\']'),
  phone: formExample.querySelector('#myForm input[name=\'phone\']'),
  
  checkInput: function(input, regex) {
    input.classList.remove('error-input');
    //console.log('regex = ', regex, ' value = ', input.value, ' result = ', regex.test(input.value));
    if (!regex.test(input.value)) {
      input.classList.add('error-input');
      return false;
    }
    return true;
  },
  
  checkSumDigitsPhone: function(input) {
    input.classList.remove('error-input');

    let digits = input.value.match(/\d/g);
    let sum = digits.reduce((sum, elem) => sum + Number(elem), 0);

    if (sum > 30) {
      input.classList.add('error-input');
      return false;
    }
    return true;  
  },

  checkPhone: function(input) {
    return this.checkInput(input, _REGEX_PHONE) && this.checkSumDigitsPhone(input);
  },
  
  validate: function() {

    // Предварительная обработка значений
    let fio_value = this.fio.value.replace(/\s+/g,' ').trim();
    let email_value = this.email.value.replace(/\s+/g,'').trim().toLowerCase();
    let phone_value = this.phone.value.replace(/\s+/g,'').trim();

    this.setData({
      fio: fio_value,
      email: email_value,
      phone: phone_value
    });
    
    let isValid = true,
        errorFields = [];
    
    if (!this.checkInput(this.fio, _REGEX_FIO)) {
      errorFields.push(this.fio.name);
      isValid = false;
    }

    if (!this.checkInput(this.email, _REGEX_EMAIL)) {
      errorFields.push(this.email.name);
      isValid = false;
    }
    
    if (!this.checkPhone(this.phone)) {
      errorFields.push(this.phone.name);
      isValid = false;
    }
      
    return {
      isValid: isValid,
      errorFields: errorFields
    }
  },
  
  getData: function() {
    return {
      fio: this.fio.value,
      email: this.email.value,
      phone: this.phone.value
    };
  },
  
  setData: function(obj) {
    this.fio.value = obj.fio;
    this.email.value = obj.email;
    this.phone.value = obj.phone;
  },
  
  submit: function() {
    // Если валидные данные
    if (this.validate().isValid) {
      // значит ajaxим
      submitButton.disabled = true;
      resultContainer.classList.remove('success', 'error', 'progress'); // убираем все классы у контейнера
      this.getAnswer();
    }  
  },
  
  getAnswer: function(timeout = 0) {
    let cntx = this; // запоминаем контект для вызова getAnswer внутри then
    setTimeout(function() {
      fetch(formExample.action)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        switch(data.status) {
          case 'success':
      		resultContainer.classList.remove('progress');
            resultContainer.classList.add('success');
            resultContainer.innerHTML += 'Success';
            break;
          case 'error':
      		resultContainer.classList.remove('progress');
            resultContainer.classList.add('error');
            resultContainer.innerHTML += data.reason;
            break;
          case 'progress':
            resultContainer.classList.add('progress');
            let newTimeout = Number(data.timeout);
            cntx.getAnswer(newTimeout);
            break;
        } 
      })
      .catch(function(e) {
        console.log('fetch error: ', e.message);
      });
    }, timeout);
  }
}

var myForm = Object.create(form);

submitButton.addEventListener('click', function(e) {
  e.preventDefault();
  myForm.submit();
})