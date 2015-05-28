	/***************************************
	*  - Tracé de signaux M2WIC/DCISS -    *
	*   Monique Tran, Samuel Hoarau,       *
	*   Jocelyn Carmona, Aurélien Cousin   *
	***************************************/
	
	
	var largeur, hauteur;		//taille du canvas
	var canvas = document.getElementById("graphCanvas");
	var contexte = canvas.getContext("2d");
	
	var fonct;					//La fonction à dessiner
	
	var isrunning;				//Etat de l'animation (en marche/pause)
	var dndMode;				//Mode Drag n Drop ou fonction simple
	var autoZoom;				//Calcul automatique de l'intervalle
	
	var minX;					//Abscisse minimum
	var maxX;					//Abscisse maximum
	var minY;					//Ordonnée minimum
	var maxY;					//Ordonnée maximum
	var minYTr;					//Ordonnée minimum transposée dans un intervalle positif(pour le calcul du décalage vertical)
	var maxYTr;					//Ordonnée maximum transposée dans un intervalle positif
	
	var tableauX;				//Valeurs d'abscisse du dernier fichier drag n drop 
	var tableauY;				//Valeurs d'ordonnée du dernier fichier drag n drop	
	
	var	pas;					//nombre de pixels entre chaque segment
	var periode;				//Durée d'une période	
	var fps;					//Images par seconde
	var freq;					//Nombre de périodes à afficher
	var	frame;	 				//Frame courante

	initParameters();
	initDragDropEvents();
	fitToContainer();
	draw();
	
	/** Reinitialisation des variables */
	function initParameters() {
		document.getElementById('fieldFonction').value = "";
		fonct = "";		

		isrunning=false;	
		dndMode=false;		
		autoZoom=false;	

		minX = 0;			
		maxX = 10;			
		minY = 0;			
		maxY = 10;			
		minYTr = 0;		
		maxYTr = 0;		

		tableauX = new Array();
		tableauY = new Array();

		pas = 1;			
		periode = Math.PI;		
		fps = 60;				
		freq = 2;				
		frame =	0; 
		
		document.getElementById("animbutton").innerHTML="Animer";
		refreshFields();
		draw();
	}

	/** Responsive canvas */
	function fitToContainer(){
		canvas.width  = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		largeur = canvas.width;
		hauteur = canvas.height;
	}
	
	/** Met à jour les paramètres sur l'interface */
	function refreshFields() {
		document.getElementById("fieldMinY").value = minY;
		document.getElementById("fieldMaxY").value = maxY;
		document.getElementById("fieldMinX").value = minX;
		document.getElementById("fieldMaxX").value = maxX;
		document.getElementById("fieldFs").value = freq;
		document.getElementById("fieldPeriode").value = periode;
	}
	
	/** Fonction principale de dessin du canvas */
	function draw() {
		//redimensionnement du canvas pour effacer son contenu		
		contexte.clearRect(0, 0, largeur, hauteur);	
		updateVars();
		if(minY <= 0 && maxY >= 0) {
			drawZero();
		}
		if(dndMode) {
			drawGraphDrop();
		}
		else {
			drawGraph();
		}
		if(isrunning)
			window.requestAnimationFrame(draw);
	}	

	/** Redessine à partir de la première frame*/
	function redraw() {
		frame=0;
		if(!isrunning)
			draw();
	}
	
	/** Mise à jour de l'intervalle de dessin et des variables */
	function updateVars() {
		//si on a changé la valeur de la fonction, on quitte le mode dnd
		if(fonct != document.getElementById('fieldFonction').value) {
			dndMode=false;
			isrunning=false;
		}
		fonct = document.getElementById('fieldFonction').value;
		minY = document.getElementById("fieldMinY").value;
		maxY = document.getElementById("fieldMaxY").value;
		minX = document.getElementById("fieldMinX").value;
		maxX = document.getElementById("fieldMaxX").value;
		minYTr = 0;
		maxYTr = maxY - minY;
		freq = document.getElementById("fieldFs").value;
		periode = document.getElementById("fieldPeriode").value;
	}
	
	/** Recadrer l'intervalle de dessin */
	function changeAutoZoom() {
		if(dndMode) {
			minX = tableauX[0];
			maxX = tableauX[tableauX.length-1];
			minY = Math.min.apply(null, tableauY);
			maxY = Math.max.apply(null, tableauY);
		}
		else {
			with(Math) {
				minX = 0;
				maxX = freq*periode;
				minY = 1000;
				maxY = -1000;
				var x = 0;
				for(var i=minX; i < maxX; i++) {
					x=i;
					valeurFonction = eval(fonct); 
					if(valeurFonction > maxY) {
						maxY = valeurFonction;
					}
					if(valeurFonction < minY) {
						minY = valeurFonction;
					}
				}
			}
		}
		refreshFields();
		
		if(!isrunning) {
			draw();
		}
	}
	
	/** Mettre en marche/pause l'animation */
	function startStopAnimation() {
		if(isrunning) {
			isrunning = false;
			document.getElementById("animbutton").innerHTML="Animer";
			frame=0;
			draw();
		}
		else {
			isrunning = true;
			document.getElementById("animbutton").innerHTML="Stop";
			frame=0;
			draw();
		}	
	}
	
	/** Trace l'axe des abscisses (0) */
	function drawZero() {
		contexte.strokeStyle = "#000";
		contexte.lineWidth=1;
		contexte.beginPath();
		//ligne horizontale au centre du canvas
		contexte.moveTo(0, hauteur - scaling(0-minY, minY, maxY, 0, hauteur));
		contexte.lineTo(largeur,  hauteur - scaling(0-minY, minY, maxY, 0, hauteur));
		contexte.stroke();
	}

	/** Met la valeur value à l'échelle dans le canvas */
	function scaling(value, scaleMin, scaleMax, canvasMin, canvasMax) {
		return value*((canvasMax - canvasMin)/(scaleMax - scaleMin));
	}

	/** Dessine la fonction*/
	function drawGraph(){	
		with(Math) {
			valPhase = freq*periode*frame/fps;		
			contexte.strokeStyle = "#CF0000";
			contexte.lineWidth=1;
			contexte.beginPath();
			var x = 0;
			for	(i=pas;i<largeur;i+=pas){	
				valeurX	= scaling(i,0,largeur,minX,maxX); 	 		
				x = valeurX + valPhase;
				valFonct = eval(fonct);
				valFonct -= minY;	//transposition dans intervalle positif 													
				valeurY	= scaling(valFonct, minY, maxY, 0, hauteur);		
				contexte.lineTo(i,hauteur-valeurY);	
			}
		}
		contexte.stroke();	
		frame = (frame+1)%fps;
	}
	
	/** Dessine les valeurs du fichier */
	function drawGraphDrop() {
		with(Math) {
			valPhase = freq*periode*frame/fps;		
			contexte.strokeStyle = "#CF0000";
			contexte.lineWidth=1;
			contexte.beginPath();
			valFonct = tableauY[0];
			valFonct -= minY; //transposition dans intervalle positif 													
			valeurY	= scaling(valFonct, minY, maxY,	0, hauteur);	
			//dessin de chaque point
			for	(i=0;i<tableauX.length;i++){	
				valeurX	= scaling(tableauX[i],minX,maxX,0,largeur) - minX; 	
				x = valeurX - valPhase;
				valFonct = tableauY[i];
				valFonct -= minY;	//transposition dans intervalle positif 													
				valeurY	= scaling(valFonct, minY, maxY, 0, hauteur);		
				contexte.lineTo(x,hauteur-valeurY);	
			}
			
		}
		frame = (frame+1)%fps;
		contexte.stroke();
	}
	
	/** Active le drag and drop sur le canvas */
	function initDragDropEvents() {

		canvas.addEventListener("dragover", function(event) { 
			event.preventDefault(); }, true);

		canvas.addEventListener("drop", function(event) { 
			event.preventDefault();
			var fichiers = event.dataTransfer.files;
			lireContenu(fichiers[0]); }, true);

		canvas.addEventListener("dragenter", function(event) {
		  event.preventDefault();
		  canvas.className = "over";
				  }, true);

		canvas.addEventListener("dragleave", function(event) {
		  event.preventDefault();
		  canvas.className = "";
		 		  }, true);
	}

	/** Tente de lire le contenu du fichier passé en paramètre */
	function lireContenu(readFile) {
		var reader = new FileReader();
		reader.readAsText(readFile, "UTF-8");
		reader.onload = charger;
		reader.onerror = erreur;
	}

	/** Enregistre le contenu du fichier dans un tableau et dessine le canvas */
	function charger(evt) {
		var contenu = evt.target.result;

		tableauX = new Array();
		tableauY = new Array();

		var lignes = contenu.split("\n");
		for(var i=1; i<lignes.length; i++){
			var colonnes = lignes[i].split("\t");
			tableauX.push(colonnes[0]);
			tableauY.push(colonnes[1]);
		}
		dndMode = true;
		draw();
		
	}
	
	/** Erreur affichee si echec de lecture */
	function erreur(evt) {
		alert("Une erreur est survenue lors de la lecture du fichier.");
	} 
	
	/** Met a jour la fonction choisie par l'utilisateur (lors des clic boutons) */
	function choixFonction(id){
		var fieldFonction = document.getElementById("fieldFonction");
		fieldFonction.value += ""+id;
		fieldFonction.focus();
	}

	/** Efface le champ de fonction */
	function effacer() {
		document.getElementById("fieldFonction").value="";
	}
	
	/** Support des animations sur les differents navigateurs */
	window.requestAnimationFrame = (function(){
		return window.requestAnimationFrame ||			//Base
		window.webkitRequestAnimationFrame || 			//Safari/Chrome
		window.mozRequestAnimationFrame || 				//Firefox
		window.oRequestAnimationFrame ||				//Opera
		window.msRequestAnimationFrame ||				//IE
		function (callback) {					//si non supporté
			window.setTimeout(callback, 1000 / fps);
		};
	}());