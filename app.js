
		var topMenus = $('.nav li');
		topMenus.on('click',function(){
			topMenus.removeClass('active');
			$('.container').hide();
			$(this).addClass('active');
			$($(this).find('a').attr('href')).show();
		})
		topMenus.eq('0').trigger('click');

		$('[data-toggle="tooltip"]').tooltip(); 

    	$('#getImgURL').bind('click',function(){
			$('#imgURL').val(getHostname($('#url').val()) + `/favicon.ico`)
    	})

        const NOTES = 'NOTES';
        const BOOKMARKS = 'BOOKMARKS';
        const DAILY = 'NOTES';
        const SETTINGS = 'SETTINGS';
        const STATUS_NOTE_NEW = 'NEW';
        const STATUS_NOTE_DONE = 'DONE';

		/*Initialization starts*/
        var bookmarks = getAllItemsFromLS(BOOKMARKS);
        bookmarks = bookmarks || [];
        localStorage.setItem(BOOKMARKS,JSON.stringify(bookmarks));
        
        var settingsObj = getDataFromLS(SETTINGS) || {};
        localStorage.setItem(SETTINGS,JSON.stringify(settingsObj));
        /*Initialization ends*/
        
        (function(){
            $('#saveItem').bind('click',saveBookmark);

            $('.modal-body .form-control').keyup(function (e) {
                if (e.keyCode === 13) {
                   $('#saveItem').trigger('click');
                }
            });

            $('#noteItem').keyup(function (e) {
                if (e.keyCode === 13 && ($(this).val())) {
                   addNote();
                }
            });

            $('.appSet').bind('click',function(){
                $('#settings').toggle();
                $('#content1').toggle();
            })
            
            $('#itemList').on('click','button.editBkm',function(e){
                editBookmark($(e.target),BOOKMARKS);
            });
            $('#itemList').on('click','button.delBkm',function(e){
                deleteItem($(e.target),BOOKMARKS);
            });

            init();
        })();
        
        function init(){
        	populateItems();
        	refreshNotes();
            initSettings(settingsObj);
        }

        function addNote(){
	    	var note = $('#noteItem').val();
	        var noteObj = {
	        	type: NOTES,
	        	note: note,
	        	status: STATUS_NOTE_NEW,
	        	createdDt: new Date(),
	        	actionDt: new Date(),
	        	id: Date.now()
	        }
	        $('#noteItem').val('');
	        addItem(noteObj);
	        refreshNotes('Y');
        }

        function saveBookmark(){
	    	var name = $('#name').val();
	    	var url = $('#url').val();
	    	var imgURL = $('#imgURL').val();
	    	var id = $('#bookmarkId').val();
	    	var addEdit =  (!id) ? 'ADD' : '';
	    	id = (id) ? id : Date.now();

			var bookmarkObj = {
	        	type: BOOKMARKS,
	        	name: name,
	        	url: url,
	        	imgURL: imgURL,
	        	id: id,
	        }
	    	if(addEdit)
	        {
		        addItem(bookmarkObj);
	        }else{
				updateItemInLS(bookmarkObj);
	        }
			populateItems();
	        $('#newBkForm .form-control, #newBkForm input[type="hidden"]#bookmarkId ').val('');
        }
		
		function clearModalData(){
			$('#newBkForm .form-control, #newBkForm input[type="hidden"]#bookmarkId ').val('');	
		}

        function addItem(item){
        	switch(item.type){
        		case BOOKMARKS:
        			addItemInLS(item,BOOKMARKS);
        		break;

        		case NOTES:
        			addItemInLS(item,NOTES);
        		break;
        	}
        }
        function addItemInLS(item,key){
            if(!item){
                return;
            }
            var items = getAllItemsFromLS(key);
            
            items.push(item);
            localStorage.setItem(key,JSON.stringify(items));
        }
        
        function getAllItemsFromLS(key){
            return (getDataFromLS(key) || []);
        }
        function getDataFromLS(key){
            return JSON.parse(localStorage.getItem(key));
        }
        function populateItems(){
            var contnr = $('#itemList');
            var c = getAllItemsFromLS(BOOKMARKS);
            var liItems=``;
            c.forEach(function(item){
            	var btnX = `<button class="btn btn-danger btn-xs delBkm" style="float: right;" data-id="${item.id}">X</button>`;
            	var edit = `<button class="btn btn-primary btn-xs editBkm" data-id="${item.id}"><i class="material-icons" style="font-size:14px">mode_edit</i></button>`;
            	var iconHtml = '';
            	if(item.imgURL){
            		iconHtml =`<span><img class="bookMarkIcon" src="${item.imgURL}"></img></span>`;		
            	}
                liItems = liItems.concat(`
                	<div class="col col-md-2 col-sm-3 col-xs-3">
						<div class="panel panel-default">
						    <div class="panel-heading">${edit} ${btnX}</div>
						    <div class="panel-body">
						    	<a href="${item.url}" target="blank">
						    		<div>
						    			${iconHtml}
						    			${item.name}
						    		</div>
						    	</a>
					    	</div>
					    </div>
					</div>

                	`);
            });
            contnr.html(liItems);
        }
        function clearItems(){
            localStorage.clear();
            populateItems();
        }
        
        function removeItemFromLS(id,type){
            var items = getAllItemsFromLS(type);
            items = items.filter(o => o.id != id);
            localStorage.setItem(type,JSON.stringify(items));
        }
        
        function getItemFromLS(id,type){
        	var items = getAllItemsFromLS(type);
        	items = items.filter(o => o.id == id);
        	return items[0];
        }

        function initSettings(settingsObj){
            
        }
        
        function putDataInLS(strK,strV){
            localStorage.setItem(strK,JSON.stringify(strV));
        }

        function deleteItem(curObj,type){
        	var id = curObj.data('id');
        	removeItemFromLS(id,type);
        	switch(type){
        		case BOOKMARKS:
            		populateItems();	
        		break;
        		case NOTES:
        			refreshNotes();
        		break;
        	}
        }
        function editBookmark(curObj,type){
            
        	$('#addNewBookmark').trigger('click');
        	var id = curObj.data('id');

			var item = getItemFromLS(id,type);
        	$('#name').val(item.name);
	    	$('#url').val(item.url);
	    	$('#imgURL').val(item.imgURL);
	    	$('#bookmarkId').val(item.id);
        }

        function downloadFile(){
        	var file = getBackupFile();
        	var a = document.createElement('a');
        	a.href = URL.createObjectURL(file);
        	a.download = `BackupData ${new Date().toJSON().slice(0,10)}.txt`;
        	document.body.appendChild(a);
        	a.click();
        }

        function getBackupFile(){
        	var fileData = `// Backup Created on : ${new Date().toLocaleString('en-IN')}\r\n`;
        	for(var i = 0; i < localStorage.length; i++)
        	{
        		var key = localStorage.key(i);
        		var value = localStorage.getItem(key);
        		fileData += `localStorage.${key} = JSON.stringify(${value}) ; `;
        	}
        	fileData = fileData.substring(0,fileData.length-2);
        	return new Blob([fileData],{type: 'txt'});
        }

		function refreshNotes(animate){
			var contnr = $('#notesList');
			var doneContnr = $('#doneNotesList');
            var c = getAllItemsFromLS(NOTES);
            var liItems=``;
            var doneLiItems=``;
            var clsLst = ['list-group-item-success','list-group-item-danger','list-group-item-warning','list-group-item-info'];
            c.forEach(function(item,i){
            	i = (i > c.length-1) ? i - c.length-1 : i;
            	var btnX = `<button onclick="deleteItem($(this),${NOTES})" class="btn btn-danger btn-xs del" style="float: right;" data-id="${item.id}">X</button>`;
            	var markDoneBtn = `<button onclick="markNoteAs($(this),STATUS_NOTE_DONE)" class="btn btn-primary btn-xs" style="float: right;" data-id="${item.id}" data-toggle="tooltip" title="Mark as done">
            							<span style="margin:0px">
            								<i class="material-icons" style="font-size:14px;padding:0px;">done</i>
        								</span>
    								</button>`;
            	var undoBtn = `<button onclick="markNoteAs($(this),STATUS_NOTE_NEW)" class="btn btn-warning btn-xs" style="float: right;" data-id="${item.id}" data-toggle="tooltip" title="Undo">
            						<span style="margin:0px">
            							<i class="material-icons" style="font-size:14px;padding:0px;">undo</i>
        							</span>
    							</button>`;
            	var btnOpt = (isNoteNew(item)) ? markDoneBtn : undoBtn;

            	var noteTemplate = `<li class="list-group-item ${clsLst[i]}" data-id="${item.id}">
					                	<div class="d-flex w-100 justify-content-between">
									      	<strong class="mb-1" onclick="editNote($(this));">${item.note} </strong>${btnOpt} ${btnX}
									    </div>
									    <em class="timestamp">${new Date(item.actionDt).toLocaleString('en-IN')}</em>  
				                	</li>`;
				if(isNoteNew(item)){
					liItems = liItems.concat(noteTemplate);	
				}
				if(!isNoteNew(item)){
					doneLiItems = doneLiItems.concat(noteTemplate);
				}
            });
            contnr.html(liItems);
            doneContnr.html(doneLiItems);
            if(animate){
            	$('#notesList li:last').hide().appendTo('#notesList').slideDown();	
            }
        }

        function editNote(currObj){
        	var parentObj = currObj.parent();
        	var text = currObj.text();
        	currObj.parent().children().hide();
        	var editTemplate = `<input type="text" id="dynEditNote" class="form-control" value="${text}" autofocus="autofocus">`;
        	parentObj.append(editTemplate);
        	$('#dynEditNote').on('keyup',event => saveDynNote(event,$('#dynEditNote')));
        }

        function saveDynNote(event,currObj){
        	if(event.keyCode == 13){
        		var id = currObj.closest('li').data('id');
	        	var item = getItemFromLS(id,NOTES);
	        	item.note = currObj.val();
	        	actionDt: new Date(),
	        	updateItemInLS(item);
	        	refreshNotes();
        	}else if(event.keyCode == 27){
        		currObj.parent().children().show();
        		$('#dynEditNote').remove();
        	}

        }

        function isNoteNew(item){
        	if(item.status == STATUS_NOTE_NEW || item.status == undefined){
        		return true;
        	}
        	if(item.status == STATUS_NOTE_DONE){
        		return false;
        	}
        }

        function getHostname(url){
        	var a = document.createElement("a");
        	a.href = url;
        	return a.protocol +'//'+ a.hostname;
        }

        function markNoteAs(curObj,status){
        	var id = curObj.data('id');
        	var item = getItemFromLS(id,NOTES);
        	item.status = status;
        	updateItemInLS(item);
        	refreshNotes();
        }

        function updateItemInLS(item){
        	removeItemFromLS(item.id,item.type);
        	addItemInLS(item,item.type);
        }

    