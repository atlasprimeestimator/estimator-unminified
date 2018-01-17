document.addEventListener('DOMContentLoaded', () => {
  // Store values
  let inputValues = {
    consumption: 0,
    household: 0,
    marketPrice: 11.88,
    membershipPrice: 0,
    membershipLength: 0,
    membershipPercent: 0
  };

  let calculatedValues = {};

  // function callbacks
  function inputChangeHandler(e) {
    const changeValue = { [e.target.name]: e.target.value };
    console.log(changeValue);
    inputValues = Object.assign({}, inputValues, changeValue);

    return true;
  }
  function dropdownChangeHandler(dataset,text) {
    const dropdownSelected = document.querySelector('#formDropdownSubsValue');
    dropdownSelected.innerText = text;
    const price = dataset.membershipPrice;
    let memberPercent = price < 450 ?  0.1 : price == 450 ? 0.135 : 0.18;
    const changeValue = Object.assign({}, dataset, {membershipPercent: memberPercent});
    inputValues = Object.assign({}, inputValues, changeValue);

    return true;
  }
  function householdSizeHandler(counter){
    if(!!counter){
      inputValues.household = inputValues.household + parseInt(counter);
      document.querySelector('#formInputHouseholdSize').value = inputValues.household;
    }
    return true;
  }
  function calculateValues(inputParams){
    const {consumption, household, marketPrice, membershipPrice, membershipLength, membershipPercent} = inputParams;
    let getCalculatedValues = {
      estimatedConsumption: !!consumption ? parseInt(consumption) : 897/2.58*parseInt(household),
      estimatedBill: !!consumption ? consumption * marketPrice * 0.01 : marketPrice * 897/2.58*parseInt(household) * 0.01,
      estimatedBillAtlas: !!consumption ? consumption * marketPrice * 0.01 * (1-membershipPercent) : marketPrice * 897/2.58*parseInt(household) * 0.01 * (1-membershipPercent)
    };

    getCalculatedValues.estimatedSavings = getCalculatedValues.estimatedBill - getCalculatedValues.estimatedBillAtlas;
    getCalculatedValues.displaySavings = getCalculatedValues.estimatedSavings * 12 * membershipLength - membershipPrice;

    Object.keys(getCalculatedValues).forEach(val => {
      calculatedValues[val] =  parseFloat(getCalculatedValues[val].toFixed(2));
    });
    console.log(calculatedValues);
    return true;
  }
  function renderResultsContainer(inputParams = inputValues){
    const {consumption, household, marketPrice, membershipPrice, membershipLength, membershipPercent} = inputParams;
    document.querySelector('#emailFormContainer').classList.add('container--hide');
    document.querySelector('#emailFormContainer').classList.remove('container--show');

    document.querySelector('#resultsContainer').classList.add('container--show');
    document.querySelector('#resultsContainer').classList.remove('container--hide');
    if(calculatedValues.displaySavings > 0){
      document.querySelector('#savingsMessage').textContent = 'Great, you can save an estimated';
      document.querySelector('#estimatedSavings').textContent = `\$${calculatedValues.displaySavings.toFixed(2)}`;
      document.querySelector('#phraseROItime').textContent = (membershipPrice/(calculatedValues.estimatedSavings * 12)).toFixed(1);
    } else {
      document.querySelector('#savingsMessage').textContent = 'Your energy consumption is so low, we can\'t save you a lot of money at the moment!';
      document.querySelector('#estimatedSavings').classList.add('results--hide');
      document.querySelector('#phraseROI').classList.add('results--hide');
    }
    document.querySelector('#membershipTime').textContent = membershipLength;
  }

  // calculator form
  const calculatorForm = document.querySelector('#calculator');
  calculatorForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    document.querySelector('#calculatorContainer').classList.add('container--hide');
    document.querySelector('#calculatorContainer').classList.remove('container--show');

    document.querySelector('#emailFormContainer').classList.remove('container--hide');
    document.querySelector('#emailFormContainer').classList.add('container--show');
    return false;
  })

  // app calculator inputs
  const appFormInputText = {
    monthlyConsumption: document.querySelector('#formInputMonthlyConsumption'),
    householdSize: document.querySelector('#formInputHouseholdSize'),
    marketPrice: document.querySelector('#formInputMarketPrice')
  };
  // app membership dropdown
  const householdCountModifier = document.querySelectorAll('.household__counter--modifier');
  for(let h=0; h<householdCountModifier.length; h++){
    householdCountModifier[h].onclick = (e) => {householdSizeHandler(e.target.dataset.counter)};
  }
  const appFormMemberDropdown = document.querySelector('#formDropdownSubsOptions').children;

  // email form
  const emailSubmit = document.querySelector('#emailSubmit');
  emailSubmit.onclick = (e) => {
    const emailInput = document.querySelector('#emailAddress').value;
    if(!!emailInput){
      const calcSavings = calculateValues(inputValues);
      console.log(calcSavings);
      if(!!calcSavings){
        renderResultsContainer();
      }
    }
  }

  // event Listeners
  for (let i in appFormInputText) {
    appFormInputText[i].onchange = (e) => inputChangeHandler(e);
  }
 
  for (let o in appFormMemberDropdown) {
    if(o<appFormMemberDropdown.length){
    const dropdownOption = appFormMemberDropdown[o];
     dropdownOption.onclick = (e) => dropdownChangeHandler(e.target.dataset, e.target.innerText);
    }
  }

}, true);
