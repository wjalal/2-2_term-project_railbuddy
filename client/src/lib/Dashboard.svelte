<script>
	import { Button, Card, TextField, Textarea, Icon, Dialog, Table, AppBar } from "svelte-materialify";
    import { mdiPencil, mdiFileTableOutline, mdiUpload } from '@mdi/js';
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

    
	let formData = {
		doc: null,
        text: '',
		period: 'something',
	};

	let reportState = "", showPreview = false, previewHTML = "", uploadedFileID = "";

    onMount (event => {
    
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
                    showPreview = true;
                    // console.log(showPreview);
                } else {
                    if (res.data.mimeerr == true) 
                    alert("This type of file is not accepted. Please upload a valid MS Excel or CSV file.");
                else alert("Upload failed!");
                    window.location.href = '/';
                };
            }).catch(err => { console.log(err) });
        };
	};

    const onFileConfirm = (event) => {
        event.preventDefault();
        axios.post(`/api/confirmFileUpload`, {
            file_id: uploadedFileID,
            confirm: true,
        }).then(res => {
            console.log(res);
            if (res.data.success) {
                console.log(res);
                showPreview = false;
                // console.log(showPreview);
                window.location.href = '/';
            } else {
                alert("Upload failed!");
                window.location.href = '/';
            };
        }).catch(err => { console.log(err) });
    };

    const onFileDiscard = (event) => {
        event.preventDefault();
        axios.post(`/api/confirmFileUpload`, {
            file_id: uploadedFileID,
            confirm: false,
        }).then(res => {
            console.log(res);
            if (res.data.success) {
                console.log(res);
                showPreview = false;
                // console.log(showPreview);
                window.location.href = '/';
            } else {
                alert("Upload error!");
                window.location.href = '/';
            };
        }).catch(err => { console.log(err) });
    };
</script>

<!-- {#if showPreview}
<div>
    {@html previewHTML}
    <Button on:click={()=>showPreview=false} text class="red-text">Close</Button>
</div>
{/if} -->
{#if showPreview} <AppBar class="grey lighten-1" fixed style="width:100vw">
    <div style="flex-grow:2" />
    <p class ='text-h6 text-center ma-8 grey-text text-darken-3'>
        Please check the preview of your uploaded file and confirm the submission.</p>
    <div style="flex-grow:1" />
    <Button class="pa-4 mr-3 red darken-3 grey-text text-lighten-5 rounded-xl align-self-center"
            on:click={onFileDiscard}>Discard</Button>
    <Button class="pa-4 mr-3 blue darken-3 grey-text text-lighten-5 rounded-xl align-self-center"
            on:click={onFileConfirm}>Confirm</Button>
</AppBar> {/if}
<br>
<div id="dashboard" style="position:relative;">
    {#if !showPreview}
        <p class ='text-h2 text-center mt-3'>Dashboard</p>
        <div class='d-flex flex-column justify-center align-center mt-5'>
            {#if !showPreview} <div id=uploadcard><Card class="mt-6 mb-6 pa-5">
                <div class="d-flex flex-column justify-center align-self-center">
                <p class ="text-h5 mt-5 mb-5 align-self-center">Upload a File</p>
                <!-- <Label class="text-muted" for="date"><small>Report period</small></Label> -->
                <!-- <p class="text-subtitle-1 ml-2 mb-1 grey-text text-darken-2">Report period</p>
                <Flatpickr 	options={{dateFormat: "Y-m-d", minDate: "today", maxDate: dayjs().add(6, 'day').toDate()}} 
                    bind:formattedValue={formData.period} name="date" value={new Date()} class='app-datepicker mb-4'/>
                <FormGroup >
                    <Label class="text-muted" for="date"><small>Please mention any extra information here...</small></Label>
                    <Input  type="textarea" name="text" style="border-radius:0.7rem; height: 6rem" 
                            id="userid" bind:value={formData.text}/>
                </FormGroup> -->
                <!-- <Textarea outlined color="blue darken-3" bind:value={formData.text}>
                    <div slot="append">
                        <Icon path={mdiPencil} />
                    </div>
                    Please mention any extra information here...
                    </Textarea> -->
                <!-- <FormGroup class="mx-1">
                    <input 	class="form-control" type="file" name="doc" id="doc" bind:this={formData.doc}
                            style='border-radius: 0.7rem' /><br>
                    <FormText color="muted">
                        Please make sure that your uploaded report is in Microsoft Excel format and uses no formulas in its cells.
                    </FormText>
                </FormGroup> -->
                <TextField  class="rounded-lg mb-2 mt-2 filepicker" color="blue darken-3" placeholder="Select File" 
                            outlined type="file" id="fileInput" bind:inputElement={formData.doc} >
                    Choose file
                    <div slot="append"><Icon path={mdiFileTableOutline}/></div>
                </TextField>
                <!-- <input class="form-control" type="file" name="doc" id="doc" bind:this={formData.doc}/> -->
                <Button class="pa-4 mt-3 blue darken-3 grey-text text-lighten-5 rounded-xl align-self-center"
                        on:click={onUpload}> <Icon path={mdiUpload} class="mr-3"/> Upload </Button>
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
			width: 40%;	
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
