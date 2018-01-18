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
  // Open Graph callbacks
  function setOGMetaData(calculatedSavings){
    const shareSavingsTitle = 'Save up to $' + calculatedSavings + ' on your electric bill'

    const metadataOG = [
      {tag: 'og:title', desc: calculatedSavings > 0? shareSavingsTitle: shareSiteTitle },
    ];
    
    metadataOG.forEach(ogtype=>{
      const {tag,desc} = ogtype;
      const ogMeta = document.createElement('meta');
      ogMeta.name = tag;
      ogMeta.content = desc;
      document.getElementsByTagName('head')[0].appendChild(ogMeta);
    })
  }
  // Input/Calculation function callbacks
  function inputChangeHandler(e) {
    const changeValue = { [e.target.name]: e.target.value };
    inputValues = Object.assign({}, inputValues, changeValue);
    return true;
  }
  function subDropdownChangeHandler(dataset, text) {
    const dropdownSelected = document.querySelector('#formDropdownSubValue');
    dropdownSelected.innerText = text;
    const price = dataset.membershipPrice;
    let memberPercent = price < 450 ? 0.1 : price == 450 ? 0.135 : 0.18;
    const changeValue = Object.assign({}, dataset, { membershipPercent: memberPercent });
    inputValues = Object.assign({}, inputValues, changeValue);
    return true;
  }
  function consTypeDropdownChangeHandler(dataset){
    const {consumptionIndex, consumptionTag} = dataset;
    const consumptionFormInput = document.querySelector('#formInputConsumption');
    const consumptionDropdownSelected = document.querySelector('#consumptionDropdownSelected')
    if(consumptionIndex == "0"){
      inputValues.household = 0;
      consumptionDropdownSelected.textContent = "(Yes)";
      consumptionFormInput.placeholder = "Enter your monthly energy usage (kWh)";
    } else {
      inputValues.consumption = 0;
      consumptionDropdownSelected.textContent = "(No)";
      consumptionFormInput.placeholder = "How many people live in your household?";
    }
    consumptionFormInput.name = consumptionTag;
    consumptionFormInput.value = "";
  }
  function calculateValues(inputParams = inputValues) {
    const { consumption, household, marketPrice, membershipPrice, membershipLength, membershipPercent } = inputParams;
    let getCalculatedValues = {
      estimatedConsumption: !!consumption ? parseInt(consumption) : 897 / 2.58 * parseInt(household),
      estimatedBill: !!consumption ? consumption * marketPrice * 0.01 : marketPrice * 897 / 2.58 * parseInt(household) * 0.01,
      estimatedBillAtlas: !!consumption ? consumption * marketPrice * 0.01 * (1 - membershipPercent) : marketPrice * 897 / 2.58 * parseInt(household) * 0.01 * (1 - membershipPercent)
    };

    getCalculatedValues.estimatedSavings = getCalculatedValues.estimatedBill - getCalculatedValues.estimatedBillAtlas;
    getCalculatedValues.displaySavings = getCalculatedValues.estimatedSavings * 12 * membershipLength - membershipPrice;

    Object.keys(getCalculatedValues).forEach(val => {
      calculatedValues[val] = parseFloat(getCalculatedValues[val].toFixed(2));
    });
    return true;
  }
  function modifyEmailFormView(inputParams = inputValues) {
    const { consumption, household, marketPrice, membershipPrice, membershipLength, membershipPercent } = inputParams;
    document.querySelector('#emailFormContainer').classList.add('container--hide');
    document.querySelector('#emailFormContainer').classList.remove('container--show');

    document.querySelector('#resultsContainer').classList.add('container--show');
    document.querySelector('#resultsContainer').classList.remove('container--hide');

  }
  function modifyResultsView(inputParams = inputValues){
    const { consumption, household, marketPrice, membershipPrice, membershipLength, membershipPercent } = inputParams;
    if (calculatedValues.displaySavings > 0) {
      document.querySelector('#estimatedSavings').classList.remove('results--hide');
      document.querySelector('#phraseROI').classList.remove('results--hide');

      document.querySelector('#savingsMessage').textContent ='Great! with the Atlas ' + membershipLength + ' year '+
      (membershipLength < 20 ? 'basic' : 'premium') + ' subscription, you can save up to:';

      let setCounter = 0;
      const displaySavings = parseFloat(calculatedValues.displaySavings.toFixed(2));
      const savingsCounter = setInterval(()=>{
        setCounter = parseFloat((setCounter + (displaySavings/15)).toFixed(2));
        if(setCounter < displaySavings){
          document.querySelector('#estimatedSavings').textContent = `\$${setCounter}`;
        } else {
          document.querySelector('#estimatedSavings').textContent = `\$${displaySavings.toFixed(2)}`;
          clearInterval(savingsCounter);          
        }
      },50);
      let roiPeriod = parseFloat(membershipPrice / (calculatedValues.estimatedSavings * 12));
      const roiDisplay = roiPeriod > 1 ? roiPeriod.toFixed(1) + ' years' : parseInt(roiPeriod * 12) + ' month(s)';
      document.querySelector('#phraseROItime').textContent = roiDisplay;
    } else {
      document.querySelector('#savingsMessage').textContent = 'Your energy consumption is so low, we can\'t save you a lot of money at the moment!';
      document.querySelector('#estimatedSavings').classList.add('results--hide');
      document.querySelector('#phraseROI').classList.add('results--hide');
    }
    document.querySelector('#membershipTime').textContent = membershipLength + ' year ' + (membershipLength < 20 ? 'basic' : 'premium');

    setOGMetaData(calculatedValues.displaySavings);
  }

  // calculator form
  const calculatorForm = document.querySelector('#calculator');
  calculatorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('#calculatorContainer').classList.add('container--hide');
    document.querySelector('#calculatorContainer').classList.remove('container--show');

    document.querySelector('#emailFormContainer').classList.remove('container--hide');
    document.querySelector('#emailFormContainer').classList.add('container--show');
    return false;
  })

  // app calculator inputs
  const appFormInputText = {
    monthlyConsumption: document.querySelector('#formInputConsumption'),
    // householdSize: document.querySelector('#formInputHouseholdSize'),
    marketPrice: document.querySelector('#formInputMarketPrice')
  };
  // energy consumption type dropdown
  const appFormConsDropdown = document.querySelector('#dropdownConsumptionOptions').children;
  // app membership dropdown
  const appFormMemberDropdown = document.querySelector('#formDropdownSubOptions').children;
  // app membership dropdown - results
  const appFormMemberResultsDropdown = document.querySelector('#formDropdownSubResultsOptions').children;

  // email form
  const emailSubmit = document.querySelector('#mc-embedded-subscribe-form');
  emailSubmit.addEventListener('submit', (e) => {

    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailInput = document.querySelector('#mce-EMAIL').value;
    if (!!re.test(emailInput)) {
      const calcSavings = calculateValues(inputValues);
      if (!!calcSavings) {
        modifyResultsView();
        modifyEmailFormView();
      }
    }
  });

  // event Listeners
  for (let i in appFormInputText) {
    appFormInputText[i].onchange = (e) => inputChangeHandler(e);
  }
  
  for (let o in appFormMemberDropdown) {
    if (o < appFormMemberDropdown.length) {
      const dropdownOption = appFormMemberDropdown[o];
      dropdownOption.onclick = (e) => {
        subDropdownChangeHandler(e.target.dataset, e.target.innerText);
      }
    }
  }

  for (let n in appFormMemberResultsDropdown) {
    if (n < appFormMemberResultsDropdown.length) {
      const dropdownOption = appFormMemberResultsDropdown[n];
      dropdownOption.onclick = (e) => {
        const isParamsModified = subDropdownChangeHandler(e.target.dataset, e.target.innerText);
        if(!!isParamsModified){
          calculateValues(inputValues);
          modifyResultsView();
        }
      }
    }
  }

  for (let p in appFormConsDropdown) {
    if (p < appFormMemberDropdown.length) {
      const dropdownOption = appFormConsDropdown[p];
      dropdownOption.onclick = (e) => consTypeDropdownChangeHandler(e.target.dataset);
    }
  }

}, true);
