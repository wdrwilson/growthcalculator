
	  function calculateGrowthCeiling(currentCustomers, newCustomersPerMonth, mrrPerCustomer, monthlyChurnRate) {
		  if (currentCustomers === 0 && newCustomersPerMonth === 0 && mrrPerCustomer === 0 && monthlyChurnRate ===0) {
			  var dataPoints = []
			  dataPoints.push({x:0,y:0});
			  return {
				  dataPoints: dataPoints,
				  wallMonths: 0,
				  ceilingMonths: 0,
				  maxCustomers: 0,
				  maxMrr: 0
			  }
		  }		  		  		  
	      // Initialize variables for calculation
	      var month = 1;
	      var dataPoints = [];
		  var allDataOverTime = [];
	      var maxCustomers = Math.round(newCustomersPerMonth * (100 / monthlyChurnRate));
	      var maxMrr = maxCustomers * mrrPerCustomer;
	  	  var reach75Percent = 0;
	  	  var maxReach = 0;
		  // Iterate until growth rate is flat
		  while (true) {
			  //Begining of the month - we gain new customers and calc our new MRR. 
			  currentCustomers += newCustomersPerMonth;
			  var mrr = currentCustomers * mrrPerCustomer;
			  
			  //How much did we gain?
			  var newMRR = newCustomersPerMonth * mrrPerCustomer;
			  
			  //How many customers did we lose? 
			  var lostCustomers = Math.round((currentCustomers * (monthlyChurnRate / 100)));
			  			  
			  //How much MRR did we lose?
			  var churnedMRR = lostCustomers * mrrPerCustomer;

			  //Recalc MRR at end of month to account for churn
			  mrr -= churnedMRR;

			  //Recalc customer count to account for churn			  
			  currentCustomers -= lostCustomers;			  
			  
			  allDataOverTime.push({month:month, currentMrr:mrr, lostCustomers:lostCustomers, churnedMRR:churnedMRR, currentCustomers:currentCustomers});
			  dataPoints.push({ x: month, y: mrr });
			  if (currentCustomers >= (maxCustomers * 0.75) && !reach75Percent) {
				  reach75Percent = month;
			  }
			  if (newCustomersPerMonth == lostCustomers) {
				  maxReach = month; 
				  break;
			  }
			  month++;
		  }
		  return {
			  dataPoints: dataPoints,
			  wallMonths: reach75Percent,
			  ceilingMonths: maxReach,
			  maxCustomers: maxCustomers,
			  maxMrr: maxMrr
		  }
	  }

    function runScenarios() {
      // Get input values for scenario 1
      var currentCustomers1 = Math.round(+document.getElementById("currentCustomers1").value);
      var newCustomersPerMonth1 = Math.round(+document.getElementById("newCustomersPerMonth1").value);
      var monthlyChurnRate1 = +document.getElementById("monthlyChurnRate1").value;
      var mrrPerCustomer1 = +document.getElementById("mrrPerCustomer1").value;

      // Get input values for scenario 2
      var currentCustomers2 = Math.round(+document.getElementById("currentCustomers2").value);
      var newCustomersPerMonth2 = Math.round(+document.getElementById("newCustomersPerMonth2").value);
      var monthlyChurnRate2 = +document.getElementById("monthlyChurnRate2").value;
      var mrrPerCustomer2 = +document.getElementById("mrrPerCustomer2").value;

	  var scenario1Data = calculateGrowthCeiling(currentCustomers1, newCustomersPerMonth1, mrrPerCustomer1,monthlyChurnRate1);
	  var scenario2Data = calculateGrowthCeiling(currentCustomers2, newCustomersPerMonth2, mrrPerCustomer2,monthlyChurnRate2);
	  data1 = scenario1Data.dataPoints;
	  data2 = scenario2Data.dataPoints;

	  //Equalize the length + repeat the last x,y for the shortest array.
	  if (data1.length > data2.length) {
		  var paddingCount = data1.length - data2.length;
		  data2 = [...data2, ...Array(paddingCount).fill(data2[data2.length-1])];
	  } else {
		  var paddingCount = data2.length - data1.length;
		  data1 = [...data1, ...Array(paddingCount).fill(data1[data1.length-1])];	  	
	  }
	  	  
	  createChart(data1, data2, scenario1Data.wallMonths, scenario2Data.wallMonths, scenario1Data.ceilingMonths, scenario2Data.ceilingMonths);
	  
	  // Create a div to display the growth ceiling date
	  var growthCeilingDiv = document.createElement('div');
	  growthCeilingDiv.id = "growth-ceiling";
	  document.getElementById("chart").appendChild(growthCeilingDiv);

	  //Emit the scenario tables
	  scenarioRecap("scenario-1", scenario1Data.wallMonths, scenario1Data.ceilingMonths, scenario1Data.maxCustomers, scenario1Data.maxMrr);
	  console.log(scenario1Data);
	  console.log(scenario2Data);
	  scenarioRecap("scenario-2", scenario2Data.wallMonths, scenario2Data.ceilingMonths, scenario2Data.maxCustomers, scenario2Data.maxMrr);
	  
    }

function createChart(dataPoints, dataPoints2, wallMonth, wallMonth2, ceilingMonth, ceilingMonth2) {
    var ctx = document.getElementById("chart").getContext("2d");
    // check if chart exist
    if (window.myChart != undefined) {
        window.myChart.destroy();
    }
	var labelData = ceilingMonth >= ceilingMonth2 ? dataPoints : dataPoints2
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelData.map(function (point) { return point.x; }),
            datasets: [{
                label: 'Scenario 1',
                data: dataPoints.map(function (point) { return point.y; }),
                borderColor: 'rgb(33,181,115)',
                backgroundColor: 'rgba(33,181,115, 0.5)',
				borderWidth: 2,
				lineTension: 0.5,
				/* point options */
				pointBorderColor: 'rgb(33,181,115)',
				pointBackgroundColor: 'rgb(33,181,115)', // wite point fill
				pointBorderWidth: 1 // point border width

            },{
                label: 'Scenario 2',
                data: dataPoints2.map(function (point) { return point.y; }),
                borderColor: 'rgb(41,171,227)',
                backgroundColor: 'rgba(41,171,227, 0.5)', 
				borderWidth: 2,
				lineTension: 0.5,
				/* point options */
				pointBorderColor: 'rgb(41,171,227)',
				pointBackgroundColor: 'rgb(41,171,227)', // wite point fill
				pointBorderWidth: 1 // point border width
				
            }]
        },
        options: {
			hover: {
			    intersect: false
			  },
			interaction: {
				mode: 'index',
			},
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'MRR ($)'
                    }
                },
                x: {
					grid: {
					    display: false
					},
					title: {
                        display: true,
                        text: 'Months From Today'
                    }
                }
            },
			elements: {
				point: {
					hoverRadius: 3,
					radius: function(ctx) {
							//scenario 1 mark the growth wall and ceiling with a bigger point size
							if (ctx.datasetIndex == 0) {
								return (ctx.index == wallMonth || ctx.index == ceilingMonth) ? 4 : 0;
							} else {
								return (ctx.index == wallMonth2 || ctx.index == ceilingMonth2) ? 4 : 0;
							}
						}
				},
			},
						
			plugins: {
				tooltip: {
					usePointStyle: true,
				    intersect: false,
					yAlign: 'bottom',
					xAlign: 'right',
					caretSize: 10,
					backgroundColor: 'rgba(11,39,56,0.8)',
					position: 'nearest',
					itemSort: function(a, b) {
        				return b.raw - a.raw;
        			},		
					callbacks: {
						labelPointStyle: function(context) {
						     return {
	                            pointStyle: 'rectRounded',
	                        };                        
					},
						label: function(context) {
	                        let label = context.dataset.label || '';
	                        if (context.parsed.y !== null) {
	                            label = new Intl.NumberFormat('en-US', { 
									style: 'currency', 
									currency: 'USD', 
									maximumFractionDigits: 0}).format(context.parsed.y);
	                        }
							if (context.datasetIndex == 0) {
								if (context.parsed.x == wallMonth) {
									label = `${label} (wall)`
								}
								if (context.parsed.x == ceilingMonth) {
									label = `${label} (ceiling)`
								}
							}
							else {
								if (context.parsed.x == wallMonth2) {
									label = `${label} (wall)`
								}
								if (context.parsed.x == ceilingMonth2) {
									label = `${label} (ceiling)`
								}
							}
	                        return label;
	                    },
						title: function(context) {
							yearAndMonth = getYearAndMonth(context[0].dataIndex);
							return `${yearAndMonth.shortMonth} ${yearAndMonth.year}`;	
							
						},					
				},
			},
	            legend: {
	                display: true,
	                position: 'top',
					align: 'end',
					labels: {
						pointStyleWidth:40,
						useBorderRadius:true,
						usePointStyle:true,	
						pointStyle: 'rectRounded',					
						font: {
							size: 12 // legend point size is based on fontsize
						}
					}
	            },
			},
			responsive: true,
        }
    });
    window.myChart = chart;
	}
	
	function getYearAndMonth(monthsFromToday) {
	    // Get current date
	    var currentDate = new Date();

	    // Add the number of months to the current date
	    currentDate.setMonth(currentDate.getMonth() + monthsFromToday);

	    // Return the year and month
	    return {
	        year: currentDate.getFullYear(),
	        month: currentDate.toLocaleString('default', { month: 'long' }),
			shortMonth: currentDate.toLocaleString('default', { month: 'short' })
	    };
	}
	
	function scenarioRecap(scenarioId, wallMonths, ceilingMonths, maxCustomers, maxMrr) {
  	  // Get the year and month of the max MRR for each scenario
  	  var wallDate = getYearAndMonth(wallMonths);
	  var ceilingDate = getYearAndMonth(ceilingMonths);
	  var formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
	  document.querySelector("#" + scenarioId + "-wall").innerHTML = wallDate.month +" " + wallDate.year + ", " + wallMonths + " months from now.";
	  document.querySelector("#" + scenarioId + "-ceiling").innerHTML = ceilingDate.month + " " + ceilingDate.year + ", " + ceilingMonths + " months from now.";
	  document.querySelector("#" + scenarioId + "-maxCustomers").innerHTML = maxCustomers.toFixed(0);
	  document.querySelector("#" + scenarioId + "-maxMrr").innerHTML = formatter.format(maxMrr.toFixed(2));
	}
	window.onload = function() {
	  document.getElementById("currentCustomers1").value = 200;
	  document.getElementById("newCustomersPerMonth1").value = 25;
	  document.getElementById("monthlyChurnRate1").value = 4;
	  document.getElementById("mrrPerCustomer1").value = 199;
	  document.getElementById("currentCustomers2").value = 200;
	  document.getElementById("newCustomersPerMonth2").value = 25;
	  document.getElementById("monthlyChurnRate2").value = 2.5;
	  document.getElementById("mrrPerCustomer2").value = 199;
runScenarios();
    };