function getWindowSize() {
		var client = {
			x : 0,
			y : 0
		};
		if (typeof document.compatMode != 'undefined'
				&& document.compatMode == 'CSS1Compat') {
			client.x = document.documentElement.clientWidth;
			client.y = document.documentElement.clientHeight;
		} else if (typeof document.body != 'undefined'
				&& (document.body.scrollLeft || document.body.scrollTop)) {
			client.x = document.body.clientWidth;
			client.y = document.body.clientHeight;
		}
		return client;
	}
	
	
	function drawDH(id) {
		var canvas = document.getElementById(id);
		var size = getWindowSize();
		canvas.setAttribute('height', size.y);
		canvas.setAttribute('width', size.x);
		if (canvas == null) {
			return false;
		}
		var context = canvas.getContext('2d');

		var x = size.x / 2;
		var y = 100;
		var l = 20;
		var data = new Array(x + l, y, l, 0);
		var data1 = new Array(x + l, y, l, 0);
		var data2 = new Array(x + l, y, l, 0);
		var data3 = new Array(x + l, y, l, 0);
		var data4 = new Array(x + l, y, l, 0);

		var interal = setInterval(function() {
			context.clearRect(0, 0, size.x, size.y);
			data[3] += 30;
			data = drawMy(context, data[0], data[1], data[2], data[3]);
			data1[3] += 25;
			data1 = drawMy(context, data1[0], data1[1], data1[2], data1[3]);
			data2[3] += 20;
			data2 = drawMy(context, data2[0], data2[1], data2[2], data2[3]);
			data3[3] += 15;
			data3 = drawMy(context, data3[0], data3[1], data3[2], data3[3]);
			data4[3] += 10;
			data4 = drawMy(context, data4[0], data4[1], data4[2], data4[3]);
		}, 80);

	}
	//X 坐标  Y y坐标  l半径  a水平度数
	function drawMy(context, x, y, l, a) {
		context.beginPath();
		context.arc(x, y, l / 2, 0, Math.PI * 2, true);
		context.closePath();
		context.fillStyle = 'yellow';
		context.fill();
		context.strokeStyle = 'yellow';
		context.moveTo(x, y);
		context.lineTo(x + Math.cos(2 * Math.PI * a / 360) * l, y
				+ Math.sin(2 * Math.PI * a / 360) * l);
		context.stroke();
		return new Array(x + Math.cos(2 * Math.PI * a / 360) * l, y
				+ Math.sin(2 * Math.PI * a / 360) * l, l, a);
	}

	
