$.getJSON('/data', function (raw) {
	var data = _.pluck(raw.rows, 'value');

	var portals = _.pluck(data, 'portal');


	var chart;
	chart = new Highcharts.Chart({
		chart:{
			renderTo:'container',
			zoomType:'xy'
		},
		title:{
			text:'Feeds stats'
		},
		subtitle:{
			text:''
		},
		xAxis:[
			{
				categories:portals
			}
		],
		yAxis:[
			{ // Primary yAxis
				labels:{
					formatter:function () {
						return this.value + '%';
					},
					style:{
						color:'#89A54E'
					}
				},
				title:{
					text:'Discount',
					style:{
						color:'#89A54E'
					}
				},
				opposite:true,
				min:0

			},
			{ // Secondary yAxis
				gridLineWidth:0,
				min:0,
				title:{
					text:'Customers',
					style:{
						color:'#4572A7'
					}
				},
				labels:{
					formatter:function () {
						return this.value;
					},
					style:{
						color:'#4572A7'
					}
				}

			},
			{ // Tertiary yAxis
				gridLineWidth:0,
				min:0,
				title:{
					text:'Deals',
					style:{
						color:'#AA4643'
					}
				},
				labels:{
					formatter:function () {
						return this.value + ' deals';
					},
					style:{
						color:'#AA4643'
					}
				},
				opposite:true
			}
		],
		tooltip:{
			formatter:function () {
				var unit = {
					'Customers':'customers',
					'AVG Discount':'%',
					'Deals':'deals'
				}[this.series.name];

				return '' +
						this.x + ': ' + this.y + ' ' + unit;
			}
		},
		legend:{
			layout:'vertical',
			align:'right',
			x:120,
			verticalAlign:'top',
			y:80,
			floating:true,
			backgroundColor:'#FFFFFF'
		},
		series:[
			{
				name:'Customers',
				color:'#4572A7',
				type:'column',
				yAxis:1,
				data:_.pluck(data, 'customers')

			},
			{
				name:'Deals',
				type:'spline',
				color:'#AA4643',
				yAxis:2,
				data:_.pluck(data, 'deals'),
				marker:{
					enabled:false
				},
				dashStyle:'shortdot'

			},
			{
				name:'AVG Discount',
				color:'#89A54E',
				type:'spline',
				data:_.pluck(data, 'discount')
			}
		]
	});

});