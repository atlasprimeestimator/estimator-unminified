document.addEventListener('DOMContentLoaded', () => {
  let inputValues = {
    consumption: 0,
    household: 0,
    marketPrice: 11.88,
    membershipPrice: 0,
    membershipLength: 0,
    membershipPercent: 0
  };

  let calculatedValues = {
  };

  function inputTextChangeHandler(e) {
    const changeValue = { [e.target.name]: e.target.value };
    inputValues = Object.assign({}, inputValues, changeValue);
  }
  function dropdownChangeHandler(dataset,text) {
    const dropdownSelected = document.querySelector('#formDropdownSubsValue');
    dropdownSelected.innerText = text;
    const price = dataset.membershipPrice;
    let memberPercent = price < 450 ?  0.1 : price == 450 ? 0.135 : 0.18;
    const changeValue = Object.assign({}, dataset, {membershipPercent: memberPercent});
    inputValues = Object.assign({}, inputValues, changeValue);
  }
  function householdSizeHandler(counter){
    if(!!counter){
      inputValues.household = inputValues.household + parseInt(counter);
      document.querySelector('#formInputHouseholdSize').value = inputValues.household;
    }
  }
  function calculateValues(inputParams){
    const {consumption, household, marketPrice, membershipPrice, membershipLength, membershipPercent} = inputParams;
    let getCalculatedValues = {
      estimatedConsumption: !!consumption ? parseInt(consumption) : 897/2.58*parseInt(household),
      estimatedBill: !!consumption ? consumption * marketPrice * 0.01 : marketPrice * 897/2.58*parseInt(household) * 0.01,
      estimatedBillAtlas: !!consumption ? consumption * marketPrice * 0.01 * (1-membershipPercent) : marketPrice * 897/2.58*parseInt(household) * 0.01 * (1-membershipPercent)
    };
    
    getCalculatedValues.estimatedSavings = parseFloat((getCalculatedValues.estimatedBill - getCalculatedValues.estimatedBillAtlas).toFixed(2));
    getCalculatedValues.displaySavings = parseFloat((getCalculatedValues.estimatedSavings * 12 * membershipLength - membershipPrice).toFixed(2));

    calculatedValues = getCalculatedValues;

    renderDOMElements();
  }
  function renderDOMElements(inputParams = inputValues){
    const {consumption, household, marketPrice, membershipPrice, membershipLength, membershipPercent} = inputParams;
    document.querySelector('#calculatorContainer').classList.remove('container--show');
    document.querySelector('#calculatorContainer').classList.add('container--hide');

    document.querySelector('#resultsContainer').classList.remove('container--hide');
    document.querySelector('#resultsContainer').classList.add('container--show');
    if(calculatedValues.displaySavings > 0){
      document.querySelector('#savingsMessage').textContent = 'Great, you can save an estimated';
      document.querySelector('#estimatedSavings').textContent = `\$${calculatedValues.displaySavings.toFixed(2)}`;
      document.querySelector('#phraseROItime').textContent = (membershipPrice/(calculatedValues.estimatedSavings * 12)).toFixed(1);
      document.querySelector('#membershipTime').textContent = membershipLength;
    } else {
      document.querySelector('#savingsMessage').textContent = 'Your energy consumption is so low, we can\'t save you a lot of money at the moment!';
      document.querySelector('#estimatedSavings').classList.add('results--hide');
      document.querySelector('#phraseROI').classList.add('results--hide');
    }
  }

  const calculatorForm = document.querySelector('#calculator');
  calculatorForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    calculateValues(inputValues);
    return false;
  })

  const appFormInputText = {
    monthlyConsumption: document.querySelector('#formInputMonthlyConsumption'),
    householdSize: document.querySelector('#formInputHouseholdSize'),
    marketPrice: document.querySelector('#formInputMarketPrice')
  };
  
  for (let i in appFormInputText) {
    appFormInputText[i].onchange = inputTextChangeHandler;
  }
  
  const householdCountModifier = document.querySelectorAll('.household__counter--modifier');
  for(let h=0; h<householdCountModifier.length; h++){
    householdCountModifier[h].onclick = (e) => {householdSizeHandler(e.target.dataset.counter)};
  }

  const appFormMemberDropdown = document.querySelector('#formDropdownSubsOptions').children;
  
  for (let o=0; o<appFormMemberDropdown.length; o++) {
    const dropdownOption = appFormMemberDropdown[o];
    if(!!dropdownOption){
     dropdownOption.onclick = (e) => dropdownChangeHandler(e.target.dataset, e.target.innerText);
    }
  }

}, true);
