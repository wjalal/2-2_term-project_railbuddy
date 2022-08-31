<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
    import { Modal, ModalBody, ModalFooter, ModalHeader, Icon, Button, Card, CardBody, CardFooter, CardHeader, CardSubtitle, 
			 CardText, CardTitle, Container, Row, Collapse, Form, FormGroup, Label, Input} from 'sveltestrap';
    import { onMount } from "svelte";
    import axios from 'axios';
	import prettyMilliseconds from 'pretty-ms'; 
    export let server;

    let comps = [], isResp, replies, cname;

    let formData = {
		reply : ''
	};

    onMount (event => {
		axios.defaults.withCredentials = true;
		axios.post(`${server}/api/getRequestsAdmin`, {
		}).then(res => {
			if (res.data.success === false) {
				alert("Server Error");		
                window.location.reload();
			} else {
				comps = [...res.data.route];
                isResp = Array(comps.length).fill(false);
                replies = Array(comps.length);
				console.log(comps);
			};
		}).catch(function (err) {
			console.log(err);
		});
	});

    const collapse = (i) => {
		isResp[i] = !isResp[i];
	};

    const sendResponse = (i) => {
        console.log(replies[i]);
        axios.defaults.withCredentials = true;
		axios.post(`${server}/api/sendResponse`, {
                id: comps[i].id,
				reply: replies[i]
		}).then(res => {
			if (res.data.success === false) {
                console.log('okay wtf');
                console.log(comps[i].req_time);
				//alert("Server Error");		
                //window.location.reload();
			} else {
				console.log('sent lol');
                window.location.reload();
			};
		}).catch(function (err) {
			console.log(err);
            console.log('jfgievuehvue');
		});
    };

    const printDate = date => {
		let str = (new Date(date)).toDateString();
		return (str.substring(4, str.length));
	};
    
</script>

<div class='aligncenter px-2 d-flex flex-column'>
    <br><br><br><br>

    {#each comps as stop, i(i)}
            {#if !stop.res_text}
            <div class='d-flex flex-column px-md-5 w-100 my-md-0 my-4'>
                <div class='comp-detail mx-auto'>
                        <p>{stop.category}</p>
                        <p class='h5'>#{stop.request_id}</p>
                        <p class='h5'>{printDate(stop.req_time)}</p>
                        <p>{stop.name} ({stop.user_mobile})</p>
                        <b>Attached Supporting Document: </b><br>
                        <a  href={"/api/getUserDoc?rid=" + stop.request_id} target="_blank"
                            class='text-decoration-underline'>{stop.docname}</a>
                    <hr>
                    <p class='h5 fw-bold'>Message Body: </p>
                    <p>{stop.req_text}</p>
                    <Button  on:click={() => collapse(i)}>
                        {#if !isResp[i]}
                        Respond
                        {:else}
                        Close
                        {/if}
                    </Button>
                    <Collapse isOpen={isResp[i]}>
                        <Form id = "searchformform" class="my-3 d-flex flex-column">
                            <FormGroup class="mx-1" >
                                <Label class="text-muted" for="to"><small>Send Response</small></Label>
                                <Input bind:value={replies[i]}/>
                            </FormGroup>                        
                        </Form>
                    </Collapse>
                    {#if isResp[i]}
                        <Button class='border-success'  on:click={() => sendResponse(i)}>
                            Respond
                        </Button>
                    {/if}
                </div>
        </div>
            
            {/if}
		{/each}
 </div>

<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	:global(.route-card) {
		width: 20rem;
	}

    .aligncenter {
		float: center;
	}

    
    @media only screen and (max-width: 768px) {
		:global(.comp) {
			width: 90vw;
			margin-left: 5vw;
			margin-right: 5vw;
			margin-top: 4vw;
			margin-bottom: 3.5vw
		}

		:global(.comp-detail) {
			width: 100%;
		}
	}

	@media only screen and (min-width: 768px) {
		:global(.comp) {
			width: 30vw;
			margin-left: 5vw;
			margin-right: 5vw;
			margin-top: 4vw;
			margin-bottom: 1.5vw
		}

		:global(.comp-detail) {
			width: 65%;
			margin-left: 2.5rem;
		}
	}

	:global(.comp-detail) {
		border-radius: 1rem; 
		border: 2px solid;
		border-color: var(--bs-success);
		margin: 1rem;
		padding: 2.5rem;
	}


</style>