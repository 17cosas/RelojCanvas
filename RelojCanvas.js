/*
	RelojCanvas por Jose Antonio Jurado
	Version 1.0.4 (13.sep.2009)
	http://17cosas.blogspot.com
	
	La distribución está permitida siempre que aparezcan las tres líneas anteriores. Gracias.
*/

function Aguja(x,y,tamanyoAguja, grosorAguja){
		// x = origen coordenada X
		// y = origen coordenada Y
		
		this.x=x;
		this.y=y;
		this.anguloAguja=0;
		this.tamanyoAguja=tamanyoAguja;
		this.grosorAguja=grosorAguja;
		
	};
	
	Aguja.prototype = {
		dibuja : function(contexto){
	
			var xAdd = this.tamanyoAguja * Math.cos(this.getAngulo());
			var yAdd = -this.tamanyoAguja * Math.sin(this.getAngulo());

			contexto.beginPath();
			contexto.lineWidth = this.grosorAguja;
			contexto.moveTo(this.x,this.y);
			contexto.lineTo(this.x + xAdd,this.y + yAdd);
			contexto.stroke();
		},
		setAngulo : function(angulo){
			this.anguloAguja=angulo;
		},
		getAngulo : function(){
			return this.anguloAguja;
		}
	};
	/* ---------------- */
	
	function Circunferencia(centroXArg, centroYArg, radioArg, grosorLineaArg,conSombraArg){
		this.x=centroXArg;
		this.y=centroYArg;
		this.radio=radioArg;
		this.grosorLinea=grosorLineaArg;
		this.conSombra=conSombraArg;
		this.agujas=new Array();
		this.contexto=null;
	};
	
	Circunferencia.prototype = {
		dibuja : function(contexto){
			this.contexto=contexto;
			this.quitaSombra();
			
			if (this.conSombra){
				this.ponSombra();
			}
			
			contexto.beginPath();
			contexto.lineWidth=this.grosorLinea;
			contexto.arc(this.x, this.y, this.radio, 0, 2 * Math.PI, true); // 2 * Math.PI === 360 * Math.PI /180;
			contexto.stroke();
		
			if (this.agujas.length>0){
				for (var aguja in this.agujas){
					this.agujas[aguja].dibuja(contexto);
				}
			}
		},
		addAguja : function (objAguja){
			this.agujas.push(objAguja);
		},
		ponSombra : function(){
			this.contexto.shadowOffsetX = 3;
			this.contexto.shadowOffsetY = 1;
			this.contexto.shadowBlur    = 4;
			this.contexto.shadowColor   = 'rgba(0, 0, 255, 0.5)';
		},
		quitaSombra : function(){
			this.contexto.shadowOffsetX = 0;
			this.contexto.shadowOffsetY = 0;
			this.contexto.shadowBlur    = 0;
		}
	};
	
/*----------*/
	
	
	
	function RelojCanvas(opciones){
	
		opciones = {
			id : opciones.id || "",
			radio: opciones.radio || 0,
			conSombra: opciones.conSombra || false,
			conMilisegs: opciones.conMilisegs || false
			
		};
		
		this.inicio(opciones);
	};
	
	RelojCanvas.prototype = {
	
		inicio: function(ops){
			
			this.id=ops.id;
			
			this.canvas=document.getElementById(this.id);
			this.ctx=this.canvas.getContext('2d');
			this.centroX=this.canvas.width/2;
			this.centroY=this.canvas.height/2;
			this.radio=ops.radio;
			this.conMilisegs=ops.conMilisegs;
			this.ticker=(this.conMilisegs) ? 1 : 1000;
			this.circunPeque=null;
							
			this.anyadeElementos();
			
			return this;
			
		},
		anyadeElementos: function(){
			// Anyade las circunferencias y las agujas
			var c=new Circunferencia(this.centroX, this.centroY, this.radio, 3,true);
			c.addAguja(new Aguja(this.centroX,this.centroY,60,3)); //Aguja hora
			c.addAguja(new Aguja(this.centroX, this.centroY,80,3)); //Aguja minutos
			c.addAguja(new Aguja(this.centroX,this.centroY,70,1)); //Aguja segundos
			this.circun=c;
			
			if (this.conMilisegs){
				var distanciaDesdeCentro=(this.canvas.width-this.centroX)/2;
				var cpeque=new Circunferencia(this.centroX+distanciaDesdeCentro, this.centroY, this.radio/5,1,false);
				cpeque.addAguja(new Aguja(this.centroX+distanciaDesdeCentro, this.centroY, this.radio/5,1));
				this.circunPeque=cpeque;
			}
			
		},
		deg2rad: function(grados) {
			//Grados a radianes
			return (Math.PI * grados/180);
		},
		dibujaMarcas: function(){
			
			var numMarcas=60;
			var angulo=0, radian=0,x=0,y=0,x2=0,y2=0;
			var longi=0;
			for (var i=0; i<numMarcas; i++)
			{
				angulo=(i*(360/numMarcas))-(360/numMarcas);
				radian=this.deg2rad(angulo);
				x =   this.centroX + (this.radio * Math.cos(radian));
				y =   this.centroY - (this.radio * Math.sin(radian));
				//alert(ancho);
				
				longi=3;
				this.ctx.lineWidth=1;
				if (angulo % 30 == 0) { 
					this.ctx.lineWidth=2; 
					longi=10;
				}
				x2 =  this.centroX + ((this.radio-longi) * Math.cos(radian));
				y2 =  this.centroY - ((this.radio-longi) * Math.sin(radian));
				
				this.ctx.beginPath();
				this.ctx.moveTo(x,y);
				this.ctx.lineTo(x2,y2);
				this.ctx.stroke();
			}
		},
		
		refresca: function(){
			// Actualiza los tiempos y dibuja todo el reloj
			var d = new Date();
			var h = d.getHours();
			var m = d.getMinutes();
			var s = d.getSeconds();
			var ms= d.getMilliseconds();
			if(h > 12) { h = h - 12; }

			var dosPI = (Math.PI * 2).toFixed(3);
			var anguloH = (dosPI * ( 3 - ( h + m / 60 ) ) / 12).toFixed(3); //Hora
			var anguloM = (dosPI * ( 15 - ( m + s / 60 ) ) / 60).toFixed(3); //Minutos
			var anguloSegs = (dosPI * (15 - s) / 60).toFixed(3); //Segundos

			
			this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
			
			this.circun.agujas[0].setAngulo(anguloH);
			this.circun.agujas[1].setAngulo(anguloM);
			this.circun.agujas[2].setAngulo(anguloSegs);
			
			if (this.conMilisegs){
				var anguloMilisegs = ((dosPI) * ( 180 -  ms ) / 1000).toFixed(4); //MiliSegundos
				this.circunPeque.agujas[0].setAngulo(anguloMilisegs);
				this.circunPeque.dibuja(this.ctx);
			}
			
			this.circun.dibuja(this.ctx);
			
			
			this.dibujaMarcas();
			
		},
		start: function(){
			var este=this;
			this.intervalo=setInterval(function(){este.refresca();}, this.ticker);
		},
		stop: function(){
			clearInterval(this.intervalo);
		}
	};