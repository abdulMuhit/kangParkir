"use strict";

window.onload = function(){

	var intro = document.getElementById("intro");
	var theContent = document.getElementById("app");	

	window.setTimeout(function() {
	   intro.classList.add("fadeOut");
  	}, 1000);
  
  	window.setTimeout(function() {
	  intro.parentNode.removeChild(intro);	  
	  theContent.classList.remove("removeIt");
	  theContent.classList.add("fadeIn");
 }, 1500);

};

var mydb;

moment.locale('id');

if(window.openDatabase) {
    
	mydb = openDatabase("parking_db", "0.1", "A Database of parking", 25 * 1024 * 1024);
		mydb.transaction(function (t) {
            t.executeSql("CREATE TABLE IF NOT EXISTS parking (id INTEGER PRIMARY KEY ASC, noPol TEXT, category TEXT, harga INTEGER, typeHarga NUM, waktuMasuk TEXT)");
        });

        mydb.transaction(function (t) {
            t.executeSql("CREATE TABLE IF NOT EXISTS category (id INTEGER PRIMARY KEY ASC, category TEXT, type NUM, price INTEGER)");
        });

        mydb.transaction(function (t) {
        	t.executeSql("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY ASC, noPol TEXT, category TEXT, harga NUM, typeHarga NUM, waktuMasuk TEXT, waktuKeluar TEXT, note TEXT, totalHarga NUM)");
        });


	} else {          
    	alert("webSql is not supported");
    	
    	setTimeout(function(){
    		tizen.application.getCurrentApplication().exit();    		
    	}, 1000);
    	
}

function cekData(){

	var data;

	mydb.transaction(function(tx){
		tx.executeSql("SELECT * FROM category", [], function(tr, results){
			data = results.rows;

	if(!data.length || data.length === 0){
		mydb.transaction(function (t) {
	        t.executeSql("INSERT INTO category (category, type, price) VALUES (?, ?, ?)", ["mobil", 2, 2000], function(d){ console.log("berhasil: ", d);
	        }, function() {});

	        t.executeSql("INSERT INTO category (category, type, price) VALUES (?, ?, ?)", ["motor", 1, 1000], function(d){ console.log("berhasil: ", d);
	        }, function() {});

	        t.executeSql("INSERT INTO category (category, type, price) VALUES (?, ?, ?)", ["truk", 1, 3000], function(d){ console.log("berhasil: ", d);
	        }, function() {});

	    });

		}

		}, function(){			
			alert("Error to webSql");
		});
	});

	
}

cekData();

var store = new Vuex.Store({
  state: {    
    popUpOpen: false

  },
  mutations: {    
    updatePopUpState: function(state, content){
    	state.popUpOpen = content;
    }
  }
});

Vue.use(Framework7Vue);

Vue.component('history', {
	template: '#history',
	data: function(){
		return {		    
		    databaseParkir: [],
		    isi: false,
		    searchMe: ""
		};
	},
	computed: {
		searchList: function(){
		      var result = this.databaseParkir;
		      if (!this.searchMe || this.searchMe === "") {
		    	  return result;  
		      }

		      var searchMe = this.searchMe.toUpperCase();

		      var filter = function(event){		    	  
		    	  return event.category.toUpperCase().indexOf(searchMe) >= 0 || event.noPol.indexOf(searchMe) >=0 || event.note.toUpperCase().indexOf(searchMe) >=0 || event.waktuKeluar.toUpperCase().indexOf(searchMe) >=0 || event.waktuMasuk.toUpperCase().indexOf(searchMe) >=0 || searchMe.trim() === '';
		      };
		      
		      return result.filter(filter);

		}
	},
	methods: {
		searchOnFocus: function(){
						
			var mySearch = document.getElementById("mySearch");
			var myBatal = document.getElementById("myBatal");
			
			mySearch.classList.add("isActive");
			myBatal.classList.add("isActive");
			
		},		
		myBatalClicked: function(){			
			var mySearch = document.getElementById("mySearch");
			var myBatal = document.getElementById("myBatal");
			
			mySearch.classList.remove("isActive");
			myBatal.classList.remove("isActive");
			
			this.searchMe = "";
			
		},
		triggerBackup: function(){
			var self = this;
			self.$f7.showIndicator();
			self.searchMe = "";
    		var timestamp = Date.now();
 			var namefile = "kangBackup"+timestamp+".xlsx";
			
			setTimeout(function(){ 
	 			var worksheet = XLSX.utils.table_to_book(document.getElementById('tableau1'), {sheet:"Sheet JS"});
	 			var wbout = XLSX.write(worksheet, { bookType: 'xlsx', type: 'base64' });
	 			tizen.filesystem.resolve("documents", function(dir){
						
 					var newFile = dir.createFile(namefile);
 				       newFile.openStream(
 				        "w",
 				        function(fs) {
 				        	fs.writeBase64(wbout);
 				        	fs.close();
 				        	self.$f7.hideIndicator();
 				        	  self.$f7.modal({
 				      			    title:  'Informasi',
 				      			    text: 'Berhasil di simpan ke folder documents dengan nama '+namefile,
 				      			    buttons: [        			      
 				      			      {
 				      			        text: 'Ok',
 				      			        bold: true, 				      			        
 				      			      }
 				      			    ]
 				      			  });
 				        }, function() {
 				        	self.$f7.hideIndicator();
 				        	 self.$f7.modal({
 				      			    title:  'Informasi',
 				      			    text: 'Error',
 				      			    buttons: [        			      
 				      			      {
 				      			        text: 'Ok',
 				      			        bold: true, 				      			        
 				      			      }
 				      			    ]
 				      			  });
 				        });
 					
 			}); 
			}, 1000);
			    		 
    	 },
		dropTableModal: function(){
			
			this.$f7.popup("#confirmDropActions");
			
		},
		closeDropTableModal: function(){ 
			this.$f7.closeModal("#confirmDropActions");
		},
		dropTable: function(){			
			var self = this;
			
			mydb.transaction(function(tx){
			tx.executeSql("DROP TABLE history", [] , function(){
						
				
						mydb.transaction(function(t){
						
							t.executeSql("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY ASC, noPol TEXT, category TEXT, harga NUM, typeHarga NUM, waktuMasuk TEXT, waktuKeluar TEXT, note TEXT, totalHarga NUM)");
						}, function(){
							
							self.databaseParkir = [];
							self.isi = false;
							
						}, function(){
							
							self.databaseParkir = [];
							self.isi = false;
						});
						
					},
				    function(){
						
						  self.$f7.modal({
			      			    title:  'Informasi',
			      			    text: 'Data gagal dihapus',
			      			    buttons: [        			      
			      			      {
			      			        text: 'Ok',
			      			        bold: true,
			      			      }
			      			    ]
			      			  });
					}
				);
			});
			
			this.closeDropTableModal();
		},		
		loadHistory: function(){
			
			var self=this;
			self.$f7.showIndicator();
			
			mydb.transaction(function(t){
	  	          t.executeSql("SELECT * FROM history", [], function(tx, results){
	  	          	
	  	          	self.databaseParkir = [];
	  	          	var length = results.rows.length;
	  	          	
	  	          	if(length === 0){
	  	          	self.$f7.hideIndicator();
	  	          	}
	  	    
	  	          	for(var i = 0; i < length; i++){
	  	          		self.databaseParkir.push(results.rows.item(i));
	  	          		
		  	          	if(i === length-1){
			            	  self.isi = true;
			            	 
			      	        self.$f7.hideIndicator();
			            }
	  	          		
	  	          	}  	          	
	  	              
	  	          }, function(){
	  	            
	  	        	
	  		        self.$f7.hideIndicator();
	  		        
	  	            self.$f7.modal({
	      			    title:  'Informasi',
	      			    text: 'Error',
	      			    buttons: [        			      
	      			      {
	      			        text: 'Ok',
	      			        bold: true
	      			      }
	      			    ]
	      			  });
	  	          });
	  	      });
			
			
		}

	},
	created: function(){
      	this.loadHistory();
    }
});

Vue.component('virtual', {
	template: '#virtual',
	data: function () {        
        return {          
          kendaraanList: [],
          selectedKendaraan: {},
          tanggalMasuk: "",
          jamMasuk: "",
          typeKendaraanPick: [],
          myTypeKendaraanPick: { id: 1, category: "mobil", type: 2, price: 2000},
          txtHarga: "",
          totalHarga: null,
          durasiTotal: "",
          durasi: "",
          noPol: ""
        };
      },
      methods: {        
        saveKendaraanKeluar: function(){
        	
        	var self = this;
        	var notess = document.getElementById("notess");
        	var dataToSave = this.selectedKendaraan;
        	
        	dataToSave.note = notess.value;

		      mydb.transaction(function (t) {
		    	  
		      t.executeSql("INSERT INTO history (noPol, category, harga, typeHarga, waktuMasuk, waktuKeluar, note, totalHarga) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [dataToSave.noPol, dataToSave.category, dataToSave.harga, dataToSave.typeHarga, dataToSave.waktuMasuk, dataToSave.waktuKeluar, dataToSave.note, dataToSave.totalHarga], function(){
		          
		          mydb.transaction(function (tx) {
				      tx.executeSql("DELETE FROM parking WHERE noPol = ?", [dataToSave.noPol], function(){

				          self.updateListKendaraan();
				          //self.closeDetailKendaraan();
				      }, function() {
				    	  
				          self.$f7.modal({
			      			    title:  'Informasi',
			      			    text: 'Error',
			      			    buttons: [        			      
			      			      {
			      			        text: 'Ok',
			      			        bold: true
			      			      }
			      			    ]
			      			  });
				      });
				      
				      
				      });
		          
		      
		          
		          notess.value = null;
		          
		      }, function() {
		    	  
		          self.$f7.modal({
	      			    title:  'Informasi',
	      			    text: 'Error',
	      			    buttons: [        			      
	      			      {
	      			        text: 'Ok',
	      			        bold: true
	      			      }
	      			    ]
	      			  });
		      });
		      
		      
		      });
		      
		      //to here
		      self.closeDetailKendaraan();
        	
        },

        updateListKendaraan: function(){

	    	var self = this;
	    	self.$f7.showIndicator();
	        

	    	mydb.transaction(function(t){
	          t.executeSql("SELECT * FROM parking", [], function(tx, results){
	          	
	          	self.kendaraanList = [];
	          	for(var i = 0; i < results.rows.length; i++){
	          		self.kendaraanList.push(results.rows.item(i));
	          	}
	          	
	        	
	  	        self.$f7.hideIndicator();
	          	
	          }, function(){

	  	        self.$f7.hideIndicator();
	  	        
	              self.$f7.modal({
	      			    title:  'Informasi',
	      			    text: 'Error',
	      			    buttons: [        			      
	      			      {
	      			        text: 'Ok',
	      			        bold: true
	      			      }
	      			    ]
	      			  });
	              
	          });
	      });

	    },
	    itemClicked: function(par){
	    	
	    	this.selectedKendaraan = par;
	    			
	    	var now  = moment().format('D MMMM YYYY, h:mm:ss a');
    		var then = par.waktuMasuk;
    		this.jamMasuk = now;
    		this.selectedKendaraan.waktuKeluar = now;
    		
	    	var ms = moment(now,"D MMMM YYYY, h:mm:ss a").diff(moment(then,"D MMMM YYYY, h:mm:ss a"));
	    	var d = moment.duration(ms);

	    	var days;
	    	var jam, hari;

	    	if(Math.floor(d.asDays()) <= 0){
	    		jam = Math.floor(d.asHours());
	    		days = Math.floor(d.asHours()) + " jam "+ (Math.floor(d.asMinutes())- (60 * jam))  + " menit";
	    	} else {
	    		hari = Math.floor(d.asDays());
	    		jam = Math.floor(d.asHours());
	    		days = hari +" hari "+ (Math.floor(d.asHours()) - (24 * hari)) + " jam " + (Math.floor(d.asMinutes())- (60 * jam)) + " menit";
	    	}

	    	this.durasi = days;	    		

	    			    		
	    	if(par.typeHarga === 2){
	    	  this.txtHarga = "perJam";
	    	  var jamTerdekat = Math.floor(d.asHours());
	    	  this.totalHarga = jamTerdekat * parseInt(par.harga);
	    	  this.selectedKendaraan.totalHarga = this.totalHarga;
			} else if(par.typeHarga === 3){
			  this.txtHarga = "perHari";
			  var hariTerdekat = Math.floor(d.asDays());
				  				  
			  this.totalHarga = (hariTerdekat+1) * parseInt(par.harga);
			  this.selectedKendaraan.totalHarga = this.totalHarga;
				  
			} else {
			  this.txtHarga = "flat";
			  this.totalHarga = par.harga;
			  this.selectedKendaraan.totalHarga = this.totalHarga;
			}
	    	
	    	this.openPopupDetailKendaraan();
	    },
	    openPopupDetailKendaraan: function(){
			this.$f7.popup("#popupDetailKendaraan");
			store.commit('updatePopUpState', true);
        },
	    closeDetailKendaraan: function(){	    	
	    	this.$f7.closeModal("#popupDetailKendaraan");
	    	store.commit('updatePopUpState', false);
	    },
	    openPopupInputKendaraan: function(){
        	
        	//this.updateKategori();
        	this.tanggalMasuk = moment().format('D MMMM YYYY');
			this.jamMasuk = moment().format('h:mm:ss a');

			this.$f7.popup("#popupInputKendaraan");
			store.commit('updatePopUpState', true);

        },
        closePopupInputKendaraan: function(){
	      
	      this.$f7.closeModal("#popupInputKendaraan");
	      store.commit('updatePopUpState', false);

	    },
	    saveKendaraanMasuk: function(){

		      var self = this;
		      //var noPol = document.getElementById("noPol");
		      var noPol = self.noPol.toUpperCase();
		      

		      //if(!noPol.value) {
		      if(!noPol || noPol.length === 0) {
		        self.$f7.modal({
      			    title:  'Informasi',
      			    text: 'Tolong isi No Polisi Kendaraannya',
      			    buttons: [        			      
      			      {
      			        text: 'Ok',
      			        bold: true
      			      }
      			    ]
      			  });
		        
		        return;
		      }
		    
		    
		    function lanjut(){
	    	
	    		var waktu = moment().format('D MMMM YYYY, h:mm:ss a');
	    		var tambahan = self.myTypeKendaraanPick;
	    		var dataToSave = {
	    				noPol: noPol,
	    				waktuMasuk: waktu,
	    				type: tambahan.category,
	    				price: tambahan.price,
	    				typePrice: tambahan.type
				};
	    	
			      mydb.transaction(function (t) {
				      t.executeSql("INSERT INTO parking (noPol, category, harga, typeHarga, waktuMasuk) VALUES (?, ?, ?, ?, ?)", [dataToSave.noPol, dataToSave.type, dataToSave.price, dataToSave.typePrice, dataToSave.waktuMasuk], function(){
			
				          self.updateListKendaraan();

				          //noPol.value = null;
				          self.noPol = "";
				          
				          //self.closePopupInputKendaraan();
				      }, function() {

				          self.$f7.modal({
			      			    title:  'Informasi',
			      			    text: 'Error',
			      			    buttons: [        			      
			      			      {
			      			        text: 'Ok',
			      			        bold: true
			      			      }
			      			    ]
			      			  });
				      });
				      
				      
				      });
			      
			      //to here
			      self.closePopupInputKendaraan();
	    		
			      
	    	} // end lanjut function
		    
	    	mydb.transaction(function(tx){
	    		//tx.executeSql("SELECT * FROM parking WHERE noPol = ?", [noPol.value.toUpperCase()], function(txt, result){
	    		tx.executeSql("SELECT * FROM parking WHERE noPol = ?", [noPol], function(txt, result){
	    	
	    			if(result.rows.length){
	    	
	    				 self.$f7.modal({
	 	       			    title:  'Informasi',
	 	       			    text: 'Ada no duplikat',
	 	       			    buttons: [        			      
	 	       			      {
	 	       			        text: 'Ok',
	 	       			        bold: true
	 	       			      }
	 	       			    ]
	 	       			  });
	    				 
	    			} else {
	    				lanjut();
	    			}
	    		}, function(){
	    			
	    			 self.$f7.modal({
	       			    title:  'Informasi',
	       			    text: 'Error',
	       			    buttons: [        			      
	       			      {
	       			        text: 'Ok',
	       			        bold: true
	       			      }
	       			    ]
	       			  });
	    			return;
	    		});
	    	});
	    		    	
		    },
		    updateKategori: function(){
			
			      var self = this;

			      mydb.transaction(function(t){
			          t.executeSql("SELECT * FROM category", [], function(tx, results){

			              self.typeKendaraanPick = [];
				          	for(var i = 0; i < results.rows.length; i++){
				          		self.typeKendaraanPick.push(results.rows.item(i));
				          }
			              
			          }, function(){

			              self.$f7.modal({
			      			    title:  'Informasi',
			      			    text: 'Error',
			      			    buttons: [        			      
			      			      {
			      			        text: 'Ok',
			      			        bold: true
			      			      }
			      			    ]
			      			  });
			              
			          });
			      });

			    },
			    typeKendaraanPick1: function(num){
			      
			      this.myTypeKendaraanPick = num;
			      
			    },
      },
      created: function(){
      	this.updateListKendaraan();
      	this.updateKategori();
      	
      }
});

Vue.component('about', {
	template: '#page-about'
});

Vue.component('inputTipe', {
	template: "#inputTipe",
	data: function(){
		return {
			radioPick: [
        		{"no": 1, "name": "flat"},
        		{"no": 2, "name": "perJam"},
        		{"no": 3, "name": "perHari"}
      		],
      		myTypeRadioPick: "1",
			kategoriList: []
		};
	},
	methods: {
		deleteClicked: function(par){
			var self = this;
			
			mydb.transaction(function(t){
	          t.executeSql("DELETE FROM category WHERE id = ?", [par], function(){
	        	  self.updateKategori();
	          }, function(){
	              self.$f7.modal({
	      			    title:  'Informasi',
	      			    text: 'Error',
	      			    buttons: [        			      
	      			      {
	      			        text: 'Ok',
	      			        bold: true
	      			      }
	      			    ]
	      			  });
	          });
	      });
		},
		updateKategori: function(){

			var self = this;

		mydb.transaction(function(t){
          t.executeSql("SELECT * FROM category", [], function(tx, results){
        	  
              self.kategoriList = [];
	          for(var i = 0; i < results.rows.length; i++){
	          		self.kategoriList.push(results.rows.item(i));
	          		if(results.rows.item(i).type === 2){
	          			self.kategoriList[i].typeText = "perJam";
	          		} else if(results.rows.item(i).type === 3){
	          			self.kategoriList[i].typeText = "perHari";
	          		} else {
	          			self.kategoriList[i].typeText = "flat";
	          		}
	          	
	          }
	          	
          }, function(){
              
              self.$f7.modal({
    			    title:  'Informasi',
    			    text: 'Pengambilan database gagal',
    			    buttons: [        			      
    			      {
    			        text: 'Ok',
    			        bold: true
    			      }
    			    ]
    			  });
          });
		
		});
		},
		openPopupInputType: function(){
			
			this.$f7.popup("#popupInputType");
			store.commit('updatePopUpState', true);
			
		},
		closePopupCategory: function(){
			
      		this.$f7.closeModal('#popupInputType');
      		store.commit('updatePopUpState', false);   
      		
		},
		radioPickFunction: function(num){
			
      		this.myTypeRadioPick = num;
		},
		saveKategori: function(){
			var self = this;
      		var nama = document.getElementById("name");
      		var harga = document.getElementById("harga");
      		var type = this.myTypeRadioPick;
      		
      		if(!nama.value || !harga.value) {
        	
      			self.$f7.modal({
        			    title:  'Informasi',
        			    text: 'Nama tipe dan harga wajib di isi',
        			    buttons: [        			      
        			      {
        			        text: 'Ok',
        			        bold: true
        			      }
        			    ]
        			  });
        		return;
      		}
      		

      		mydb.transaction(function (t) {
                t.executeSql("INSERT INTO category (category, type, price) VALUES (?, ?, ?)", [nama.value, type, harga.value], function(){
                    
                    nama.value = "";
                    harga.value = "";
                    self.updateKategori();
                    
                	self.closePopupCategory();
                });
        
            });
		}
	},
	created: function(){
		this.updateKategori();
	}
});

//Init App
new Vue({
	el: '#app',   
	framework7: {
		root: '#app',
		routes: [
		{ 
			path: '/about/',
			component: 'about'
		},
		{
			path: '/inputTipe/',
			component: 'inputTipe'
		},
		{
			path: '/history/',
			component: 'history'
		},
		{
			path: '/virtual/',
			component: 'virtual'
		}
	],
			
	swipePanelOnlyClose:true,		
	cache: false,
	pushState: true,
	animatePages: true,
	preloadPreviousPage: true
		
	},
	data: function(){
		return {
			myRootData: 'helo vue framework7',			
		};
	},
	methods: {
		quitApp: function(){
		
			 tizen.application.getCurrentApplication().exit();
		},
		openModalQuit: function(){
		
			this.$f7.popup("#confirmExitActions");
		}
	},
	created: function(){
		
		var self = this;
		document.addEventListener('tizenhwkey', function(e) {
	        if (e.keyName === "back") {
	            try {
	            	
	            	if(self.$f7.mainView.url === '#null'){
	            		self.$f7.popup("#confirmExitActions");		            	
	            	} else {	            		
	            		if(store.state.popUpOpen) {
	            			
			            	self.$f7.closeModal();
			            	store.commit('updatePopUpState', false);
		            	} else {
		            		self.$f7.mainView.back();
		            	}
	            	}
	            	
	            } catch (ignore) {}
	        }
	    });
	}
});


