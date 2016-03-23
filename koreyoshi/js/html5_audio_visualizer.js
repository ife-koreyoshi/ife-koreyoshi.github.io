/**
 * An audio spectrum visualizer built with HTML5 Audio API Author:Wayou
 * License:feel free to use but keep refer pls! Feb 15, 2014 For more infomation
 * or support you can : view the project
 * page:https://github.com/Wayou/HTML5_Audio_Visualizer/ view online
 * demo:http://wayou.github.io/HTML5_Audio_Visualizer/
 */
window.onload = function() {
	new Visualizer().ini();
};
var Visualizer = function() {
	this.file = null; // the current file
	this.fileName = null; // the current file name
	this.audioContext = null;
	this.source = null; // the audio source
	this.info = document.getElementById('info').innerHTML; // this used to
															// upgrade the UI
															// information
	this.infoUpdateId = null; // to sotore the setTimeout ID and clear the
								// interval
	this.animationId = null;
	this.status = 0; // flag for sound is playing 1 or stopped 0
	this.forceStop = false;
	this.allCapsReachBottom = false;
};
Visualizer.prototype = {
	ini : function() {
		this._prepareAPI();
		this._addEventListner();
	},
	_prepareAPI : function() {
		window.AudioContext = window.AudioContext || window.webkitAudioContext
				|| window.mozAudioContext || window.msAudioContext;
		window.requestAnimationFrame = window.requestAnimationFrame
				|| window.webkitRequestAnimationFrame
				|| window.mozRequestAnimationFrame
				|| window.msRequestAnimationFrame;
		window.cancelAnimationFrame = window.cancelAnimationFrame
				|| window.webkitCancelAnimationFrame
				|| window.mozCancelAnimationFrame
				|| window.msCancelAnimationFrame;
		try {
			this.audioContext = new AudioContext();
		} catch (e) {
			this._updateInfo('!Your browser does not support AudioContext',
					false);
			console.log(e);
		}
	},
	_addEventListner : function() {
		var that = this, audioInput = document.getElementById('uploadedFile'), dropContainer = document
				.getElementsByTagName("canvas")[0];
		audioInput.onchange = function() {
			if (that.audioContext === null) {
				return;
			}
			;

			if (audioInput.files.length !== 0) {
				that.file = audioInput.files[0];
				that.fileName = that.file.name;
				if (that.status === 1) {
					that.forceStop = true;
				}
				;
				document.getElementById('fileWrapper').style.opacity = 1;
				that._updateInfo('正在上传', true);
				that._start();
			}
			;
		};
		// listen the drag & drop
		dropContainer.addEventListener("dragenter", function() {
			document.getElementById('fileWrapper').style.opacity = 1;
			that._updateInfo('Drop it on the page', true);
		}, false);
		dropContainer.addEventListener("dragover", function(e) {
			e.stopPropagation();
			e.preventDefault();
			// set the drop mode
			e.dataTransfer.dropEffect = 'copy';
		}, false);
		dropContainer.addEventListener("dragleave", function() {
			document.getElementById('fileWrapper').style.opacity = 0.2;
			that._updateInfo(that.info, false);
		}, false);
		dropContainer.addEventListener("drop", function(e) {
			e.stopPropagation();
			e.preventDefault();
			if (that.audioContext === null) {
				return;
			}
			;
			document.getElementById('fileWrapper').style.opacity = 1;
			that._updateInfo('Uploading', true);
			// get the dropped file
			that.file = e.dataTransfer.files[0];
			if (that.status === 1) {
				document.getElementById('fileWrapper').style.opacity = 1;
				that.forceStop = true;
			}
			;
			that.fileName = that.file.name;
			// once the file is ready,start the visualizer
			that._start();
		}, false);
	},
	_start : function() {
		// read and decode the file into audio array buffer
		var that = this, file = this.file, fr = new FileReader();
		fr.onload = function(e) {
			var fileResult = e.target.result;
			var audioContext = that.audioContext;
			if (audioContext === null) {
				return;
			}
			;
			that._updateInfo('解码文件', true);
			audioContext.decodeAudioData(fileResult, function(buffer) {
				that._updateInfo('解码成功，加载动画', true);
				that._visualize(audioContext, buffer);
			}, function(e) {
				that._updateInfo('!解码文件失败', false);
				console.log(e);
			});
		};
		fr.onerror = function(e) {
			that._updateInfo('!读取文件失败', false);
			console.log(e);
		};
		// assign the file to the reader
		this._updateInfo('开始读取文件', true);
		fr.readAsArrayBuffer(file);
	},
	_visualize : function(audioContext, buffer) {
		var audioBufferSouceNode = audioContext.createBufferSource();
		var analyser = audioContext.createAnalyser();
		audioBufferSouceNode.connect(analyser);
		audioBufferSouceNode.connect(audioContext.destination);
		audioBufferSouceNode.buffer = buffer;
		audioBufferSouceNode.start(0);

		this.status = 1;
		this.source = audioBufferSouceNode;
		audioBufferSouceNode.onended = function() {
			that._audioEnd(that);
		};
		this._updateInfo('播放 ' + this.fileName, false);
		this.info = '播放 ' + this.fileName;
		document.getElementById('fileWrapper').style.opacity = 0.2;
		this._drawSpectrum(analyser);

	},
	_visualize2 : function(audioContext, buffer) {
		var audioBufferSouceNode = audioContext.createBufferSource();
		analyser = audioContext.createAnalyser();
		that = this;
		audioBufferSouceNode.connect(analyser);
		analyser.connect(audioContext.destination);
		audioBufferSouceNode.buffer = buffer;
		// play the source
		if (!audioBufferSouceNode.start) {
			audioBufferSouceNode.start = audioBufferSouceNode.noteOn // in
																		// old
																		// browsers
																		// use
																		// noteOn
																		// method
			audioBufferSouceNode.stop = audioBufferSouceNode.noteOff // in
																		// old
																		// browsers
																		// use
																		// noteOff
																		// method
		}
		;
		// stop the previous sound if any
		if (this.animationId !== null) {
			cancelAnimationFrame(this.animationId);
		}
		if (this.source !== null) {
			this.source.stop(0);
		}
		audioBufferSouceNode.start(0);

		this.status = 1;
		this.source = audioBufferSouceNode;
		audioBufferSouceNode.onended = function() {
			that._audioEnd(that);
		};
		this._updateInfo('播放 ' + this.fileName, false);
		this.info = '播放 ' + this.fileName;
		document.getElementById('fileWrapper').style.opacity = 0.2;
		this._drawSpectrum(analyser);
	},
	_drawSpectrum : function(analyser) {
		var canvas = document.getElementById('canvas'), 
		cwidth = canvas.width, cheight = canvas.height - 2, 
		meterWidth = 1, // 能量条的宽度
		gap = 2, // 能量条间的间距
		meterNum = 800 / (10 + 2), // 计算当前画布上能画多少条
		ctx = canvas.getContext('2d');
		capHeight = 2, capStyle = '#fff';
		capYPositionArray = []; 
		// 定义一个渐变样式用于画图
		gradient = ctx.createLinearGradient(0, 0, 0, 300);
		gradient.addColorStop(1, '#0f0');
		gradient.addColorStop(0.5, '#ff0');
		gradient.addColorStop(0, '#f00');
		ctx.fillStyle = gradient;
		
		var drawMeter = function() {
			var array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			
			var step = Math.round(array.length / meterNum); // 计算采样步长
			ctx.clearRect(0, 0, cwidth, cheight); // 清理画布准备画画
			for (var i = 0; i < meterNum; i++) {
				var value = array[i*step];
				ctx.fillRect(i * 12 /* 频谱条的宽度+条间间距 */, cheight - value
						+ capHeight, meterWidth, cheight);
			}
			requestAnimationFrame(drawMeter);
		}
		
		requestAnimationFrame(drawMeter);
	},
	_drawSpectrum2 : function(analyser) {
		var that = this, canvas = document.getElementById('canvas'), cwidth = canvas.width, cheight = canvas.height - 2, meterWidth = 1, // 能量条的宽度10
		gap = 0.2, // 能量条间的间距2
		capHeight = 2, capStyle = '#fff', meterNum = 800, // count of the
															// meters/ (10 + 2)
		capYPositionArray = []; // //store the vertical position of hte caps for
								// the preivous frame
		ctx = canvas.getContext('2d'), gradient = ctx.createLinearGradient(0,
				0, 0, 300);
		gradient.addColorStop(1, '#0f0');
		gradient.addColorStop(0.5, '#ff0');
		gradient.addColorStop(0, '#f00');
		var drawMeter = function() {
			var array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			if (that.status === 0) {
				// fix when some sounds end the value still not back to zero
				for (var i = array.length - 1; i >= 0; i--) {
					array[i] = 0;
				}
				;
				allCapsReachBottom = true;
				for (var i = capYPositionArray.length - 1; i >= 0; i--) {
					allCapsReachBottom = allCapsReachBottom
							&& (capYPositionArray[i] === 0);
				}
				;
				if (allCapsReachBottom) {
					cancelAnimationFrame(that.animationId); // since the sound
															// is stoped and
															// animation
															// finished, stop
															// the
															// requestAnimation
															// to prevent
															// potential memory
															// leak,THIS IS VERY
															// IMPORTANT!
					return;
				}
				;
			}
			;
			var step = Math.round(array.length / meterNum); // sample limited
															// data from the
															// total array
			ctx.clearRect(0, 0, cwidth, cheight);
			for (var i = 0; i < meterNum; i++) {
				var value = array[i * step];
				if (capYPositionArray.length < Math.round(meterNum)) {
					capYPositionArray.push(value);
				}
				;
				ctx.fillStyle = capStyle;
				// draw the cap, with transition effect
				if (value < capYPositionArray[i]) {
					ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]),
							meterWidth, capHeight);
				} else {
					ctx
							.fillRect(i * 12, cheight - value, meterWidth,
									capHeight);
					capYPositionArray[i] = value;
				}
				;
				ctx.fillStyle = gradient; // set the filllStyle to gradient
											// for a better look
				ctx.fillRect(i * 12 /* meterWidth+gap */, cheight - value
						+ capHeight, meterWidth, cheight); // the meter
			}
			that.animationId = requestAnimationFrame(drawMeter);
		}
		this.animationId = requestAnimationFrame(drawMeter);
	},
	_audioEnd : function(instance) {
		if (this.forceStop) {
			this.forceStop = false;
			this.status = 1;
			return;
		}
		;
		this.status = 0;
		var text = 'HTML5 Audio API showcase | An Audio Viusalizer';
		document.getElementById('fileWrapper').style.opacity = 1;
		document.getElementById('info').innerHTML = text;
		instance.info = text;
		document.getElementById('uploadedFile').value = '';
	},
	_updateInfo : function(text, processing) {
		var infoBar = document.getElementById('info'), dots = '...', i = 0, that = this;
		infoBar.innerHTML = text + dots.substring(0, i++);
		if (this.infoUpdateId !== null) {
			clearTimeout(this.infoUpdateId);
		}
		;
		if (processing) {
			// animate dots at the end of the info text
			var animateDot = function() {
				if (i > 3) {
					i = 0
				}
				;
				infoBar.innerHTML = text + dots.substring(0, i++);
				that.infoUpdateId = setTimeout(animateDot, 250);
			}
			this.infoUpdateId = setTimeout(animateDot, 250);
		}
		;
	}
}
