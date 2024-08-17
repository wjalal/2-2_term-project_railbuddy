<script>
	import { Button, Card, TextField, Textarea, Icon, Dialog, Table, AppBar, Input } from "svelte-materialify";
    import { mdiPencil, mdiFileTableOutline, mdiUpload, mdiAccountPlus } from '@mdi/js';
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
		userid: '',
	};

	let reportState = "", showPreview = false, previewHTML = "", uploadedFileID = "";

    onMount (event => {
    });

	const onAddContact = (event) => {
		event.preventDefault();
        console.log(formData.userid);

        if (!formData.userid){
            alert("Please fill up all the entries.")
        } else {
            axios.post(`/api/addContact`, {
                userid: formData.userid
            }).then(res => {
                console.log(res);
                if (res.data.success) {
                    alert ("Contact added successfully!");
                    window.location.reload();
                } else if (res.data.invalid) {
                    alert("No such user found");
                } else if (res.data.preexist) {
                    alert("User is already in your contacts");
                } else {
                    alert("Failed to add contact");
                };
            }).catch(err => { console.log(err) });
        };
	};

</script>
<br>
<div id="dashboard" style="position:relative;">
    {#if !showPreview}
        <div class='d-flex flex-column justify-center align-center mt-5'>
            {#if !showPreview} <div id=uploadcard><Card class="mt-6 mb-6 pa-5">
                <div class="d-flex flex-column justify-center align-self-center">
                <p class ="text-h5 mt-5 mb-5 align-self-center">Add a Contact</p>

                <TextField outlined color="blue darken-3" bind:value={formData.userid}>
                    <div slot="append">
                        <Icon path={mdiPencil} />
                    </div>
                    Enter exact user ID here
                </TextField>

                <!-- <input class="form-control" type="file" name="doc" id="doc" bind:this={formData.doc}/> -->
                <Button class="pa-4 mt-3 blue darken-3 grey-text text-lighten-5 rounded-xl align-self-center"
                        on:click={onAddContact}> <Icon path={mdiAccountPlus} class="mr-3"/> Add </Button>
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
