<script>
	import { Button, Card, TextField, Textarea, Icon, Dialog, Table, AppBar, Input } from "svelte-materialify";
    import { mdiPencil, mdiFileTableOutline, mdiUpload, mdiSend, mdiImage, mdiArrowDownThin, mdiArrowCollapseDown, mdiEye, mdiCheckCircle } from '@mdi/js';
    import Flatpickr from 'svelte-flatpickr';
	import 'flatpickr/dist/flatpickr.css';
	import axios from "axios";
	import {userName} from "../userStore"; 
	import { onMount } from "svelte";

    import dayjs from 'dayjs';

	let currentUser;
	userName.subscribe(value => {
		currentUser = value;
	});

    let contact, contactName="", showImgForm=false, lastLoaded = "", oldest = "", cSeen = {};

	let formData = {
		text: '',
	};

    let messages = [];

	let reportState = "", showPreview = false, previewHTML = "", uploadedFileID = "";

    const getMessages = () => {
        axios.post(`/api/getMessages`, {
            lastLoaded: lastLoaded,
            recip: contact,
        }).then(res => {
            console.log(res.data);
            let resdata = [...res.data];
            messages = resdata.concat(messages);
            contactName = messages[0].name;
            lastLoaded = messages[0].id;
            oldest = messages[messages.length-1].id;
            if (!document.hidden) {
                axios.post(`/api/updateSeen`, {
                    lastSeen: lastLoaded,
                    recip: contact,
                }).then(res => {
                    console.log(res.data);  
                    cSeen = {...res.data.cSeen};
                    console.log(Object.keys(cSeen));
                }).catch(err => { console.log(err) });
            };
        }).catch(err => { console.log(err) });
    };

    const getOlderMessages = () => {
        axios.post(`/api/getMoreMessages`, {
            oldest: oldest,
            recip: contact,
        }).then(res => {
            console.log(res.data);
            let resdata = [...res.data];
            messages = messages.concat(resdata);
            contactName = messages[0].name;
            oldest = messages[messages.length-1].id;
            // console.log(messages[0].id);
            // console.log(lastLoaded);
            // if (res.data.success) {
            //     alert ("Contact added successfully!");
            // } else if (res.data.invalid) {
            //     alert("No such user found");
            // } else if (res.data.preexist) {
            //     alert("User is already in your contacts");
            // } else {
            //     alert("Failed to add contact");
            // };
        }).catch(err => { console.log(err) });
    }

    onMount (event => {
        contact = (new URLSearchParams(window.location.search)).get('contact');
        console.log("contact:" + contact);

        getMessages();
        setInterval(() => {
            getMessages();
        }, 2200);
    });

    const onUpload = (event) => {
		event.preventDefault();
        console.log(formData);
		console.log(formData.doc.files)
		const fD = new FormData();
		fD.append("doc", formData.doc.files[0]);
		fD.append("text", formData.text);
		fD.append("period", formData.period);
        if (!formData.doc.files[0]){
            alert("Please fill up all the entries.")
        } else {
            axios.post(`/api/uploadFile`, fD, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(res => {
                console.log(res);
                if (res.data.success) {
                    console.log(res);
                    uploadedFileID = res.data.file_id;
                    previewHTML = res.data.preview;
                    //alert("Upload successfully completed!");
                    // window.location.href = '/';
                    // console.log(showPreview);
                    axios.post(`/api/confirmFileUpload`, {
                        file_id: uploadedFileID,
                        confirm: true,
                    }).then(res => {
                        console.log(res);
                        if (res.data.success) {
                            console.log(res);
                            // console.log(showPreview);
                            axios.post(`/api/sendMessage`, {
                                recip: contact,
                                text: `::img:${uploadedFileID}`,
                            }).then(res => {
                                console.log(res);
                                if (res.data.success == false) {
                                    alert ("Message sending failed");
                                    window.location.reload();
                                };
                                getMessages();
                                showImgForm = false;
                            }).catch(err => { console.log(err) });
                        } else {
                            alert("Upload failed!");
                            window.location.reload();
                        };
                    }).catch(err => { console.log(err) });
                } else {
                    if (res.data.mimeerr == true) 
                    alert("This type of file is not accepted. Please upload a valid MS Excel or CSV file.");
                else alert("Upload failed!");
                    window.location.reload()
                };
            }).catch(err => { console.log(err) });
        };
	};

	const onSend = (event) => {
		event.preventDefault();
        console.log(formData.text);

        if (formData.text){
            axios.post(`/api/sendMessage`, {
                recip: contact,
                text: formData.text,
            }).then(res => {
                console.log(res);
                if (res.data.success == false) {
                    alert ("Message sending failed");
                    window.location.reload();
                };
            }).catch(err => { console.log(err) });
        };
        formData.text = "";
        // getMessages();
	};

</script>
<br>
<div id="dashboard" style="position:relative;">
    {#if !showPreview}
        <div class='d-flex flex-column justify-center align-center mt-5'>
            {#if !showPreview} <div id=uploadcard><Card class="mt-6 mb-6 pa-5">
                <div class="d-flex flex-column justify-center align-self-center">
                {#if contactName != ""} <h4 class='align-self-center'>{contactName}</h4> {/if}
                <br>
                <TextField outlined color="blue darken-3" bind:value={formData.text}>
                    <div slot="append">
                        <Button class="pa-2 ml-2 blue darken-3 grey-text text-lighten-5 rounded-xl align-self-center"
                        icon on:click={()=> {showImgForm = !showImgForm}}> <Icon path={mdiImage}/></Button>
                        <Button class="pa-2 ml-2 blue darken-3 grey-text text-lighten-5 rounded-xl align-self-center"
                        icon on:click={onSend}> <Icon path={mdiSend}/></Button>
                    </div>
                    Type new message
                </TextField>
                {#if showImgForm}
                <TextField  class="rounded-lg mb-2 mt-2 filepicker" color="blue darken-3" placeholder="Select File" 
                            outlined type="file" id="fileInput" bind:inputElement={formData.doc} >
                    Choose file
                    <div slot="append"><Button class="pa-2 ml-2 blue darken-3 grey-text text-lighten-5 rounded-xl align-self-center"
                        icon on:click={onUpload}> <Icon path={mdiUpload}/></Button></div>
                </TextField>{/if}
                <br>
                {#each messages as m}
                <div class={(m.sender != currentUser? `grey lighten-3`: `light-blue lighten-4`) + ` mb-2 pa-3 rounded-xl`} style="align:left">
                    <b style="text-align:left">{m.sender}</b>                   
                    <small style ="text-align:left; color:gray">{
                        (new Date(m.timestamp)).toLocaleTimeString() + " " + 
                        ((new Date(m.timestamp)).toLocaleDateString() === (new Date()).toLocaleDateString()?
                        "" : (new Date(m.timestamp)).toLocaleDateString())
                    } </small>
                    {#if m.text.substring(0,6) == "::img:"}<br>
                    <img src={`api/getUserDoc?rid=${m.text.substring(6)}`}
                         alt={"image sent by " + m.sender}
                         style="width:50%"/>
                    {:else}
                    <p>{m.text}</p>
                    {/if}
                    {#each Object.keys(cSeen) as s}
                        {#if m.sender != s && s != currentUser && m.id == cSeen[s]}
                        <small style ="text-align:left; color:gray"><Icon size=10 path={mdiCheckCircle}/>{" " + s + "  "}</small>
                        {/if}
                    {/each}
                </div>
                {/each}
                <Button class="pa-2 ml-2 blue darken-3 grey-text text-lighten-5 rounded-xl align-self-center"
                        icon on:click={getOlderMessages}> <Icon path={mdiArrowCollapseDown}/></Button>
                <!-- <input class="form-control" type="file" name="doc" id="doc" bind:this={formData.doc}/> -->
            </div>
            </Card></div>{/if}
        </div>
    {:else }
    <br>
    <div class='d-flex flex-column justify-center align-center mt-5'>
        <Table style="width:70%">
            {@html previewHTML}
        </Table>
        <!-- <Button on:click={()=>showPreview=false} text class="red-text">Close</Button> -->
    </div>{/if}
</div>



<style>


	@media only screen and (max-width: 768px) {
		#uploadcard {
			width: 100%;
		}		

        #dashboard {
            width: 95%;
            left: 2.5%;
        }
	}


	@media only screen and (min-width: 768px) {
		#uploadcard {
			width: 60%;	
        }

        #dashboard {
            width: 85%;
            left: 12%;
        }
	}


    :global(.app-datepicker) {
		width:100%; 
		height: calc(3.5rem + 2px); 
		border-radius: 0.7rem; 
		border-width: 1px; 
		border-style: solid !important;
        border-color: rgb(75, 75, 75);
		padding:1rem; 
	}

	:global(input.app-datepicker:focus-visible) {
		outline-width: 0px !important;
		border-color: rgb(40, 116, 179) !important; 
        border-width: 2px;
	} 

	:global(input.app-datepicker) {
		background-color: white !important;
		border-color: rgb(71, 71, 71) !important; 
	}
</style>
