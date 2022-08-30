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
		axios.post(`${server}/api/getComplaints`, {
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
            console.log('jfgievuehvue');
		});
	});

    const collapse = (i) => {
		isResp[i] = !isResp[i];
	};

    const sendReply = (i) => {
        console.log(replies[i]);
        axios.defaults.withCredentials = true;
		axios.post(`${server}/api/sendReply`, {
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
                //window.location.reload();
			};
		}).catch(function (err) {
			console.log(err);
            console.log('jfgievuehvue');
		});
    }
</script>

<div class='aligncenter px-2 d-flex flex-column'>
		{#each comps as stop, i(i)}
            {#if !stop.res_text}
                <Card class="mb-4 mx-md-5 mx-1 display-flex flex-column border-danger bg-white" >
                    <CardHeader>
                        <CardTitle>
                            <Icon name="error" /> {`${stop.name}`}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        <Container>
                            <Row class='p-1'>
                                {`${stop.req_text}`}
                            </Row>
                        </Container>
                    </CardBody>
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
                                <Label class="text-muted" for="to"><small>Send Reply</small></Label>
                                <Input bind:value={replies[i]}/>
                            </FormGroup>                        
                        </Form>
                    </Collapse>
                    {#if isResp[i]}
                        <Button class='border-success'  on:click={() => sendReply(i)}>
                            Respond
                        </Button>
                    {/if}
                </Card>
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

</style>