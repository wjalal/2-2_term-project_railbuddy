<!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous"> -->
<script>
    import { onMount } from "svelte";
	import { Styles, Form, FormGroup, Input, Button, Icon, Container, Row, Col, 
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardSubtitle,
    CardText,
    CardTitle } from "sveltestrap";
	import axios from "axios";
import { each, is_client } from "svelte/internal";
    export let server;
    export let train_id;
    export let date;
    let coaches = [], showSeats = false, displayBogies = [], sCoach, sBogie = '', sBogieObj = {}, 
        selMat, selCount = 0;
    
    const getSBogie = () => {    
        for (const bogie of displayBogies) {
            if (bogie.coach == sBogie) sBogieObj = bogie;
        };
        init_selMat();
    };

    $: sBogie && getSBogie();

    const init_selMat = () => {
        selCount = 0;
        selMat = Array(sBogieObj.mat_row);
        for (let i=0; i<sBogieObj.mat_row; i++) {
            selMat[i] = Array(sBogieObj.mat_col);
            for (let j=0; j<sBogieObj.mat_col; j++) {
                selMat[i][j] = false;
            };
        };
    };

    const clickSeat = (i, j) => {
        console.log(selMat);
        if (selMat[i][j] === false) {
            if (selCount < 4) selMat[i][j] = true, selCount++;
        } else {
            if (selCount > 0) selMat[i][j] = true, selCount--;
        };
    };

    onMount (event => {
		axios.defaults.withCredentials = true;
		axios.post(`${server}/api/getCoaches`, {
			id: train_id
		}).then(res => {
			if (res.data.success === false) {
				alert("Server Error");		
                window.location.reload();
			} else {
				coaches = [...res.data.classes];
				console.log(coaches);
			};
		}).catch(function (err) {
			console.log(err);
		});
	});

    const onCheckSeats = (coach) => {
        axios.defaults.withCredentials = true;
		axios.post(`${server}/api/checkSeats`, {
			class_id: coach.class_id,
            date: date
		}).then(res => {
			if (res.data.success === false) {
				alert("Server Error");		
                window.location.reload();
			} else {
				//coaches = [...res.data.seatMatrix];
				console.log(res.data.bogies);
                displayBogies = res.data.bogies;
                sCoach = coach;
                sBogie = displayBogies[0].coach;
                showSeats = true;
			};
		}).catch(function (err) {
			console.log(err);
		});

    };

</script>

<div class='d-flex flex-xl-{showSeats ? "row":"row"} flex-column justify-content-center align-items-center align-items-xl-start'>
{#each coaches as coach}
    <div id="card-div">
    <Card   class='shadow mb-4 mx-xl-2 mx-auto text-center border-success'
            style='{showSeats && sCoach === coach ? "width:30vh":""}'>
        <CardHeader>
            <CardTitle>{coach.class_name}</CardTitle>
        </CardHeader>
        <CardBody>
            <CardText>
                <big class="text-success"><b>৳{coach.fare}</b></big>
            </CardText>
            <CardSubtitle>
                <small class="text-muted mb-3">
                    {(coach.class_name == 'AC_S' || coach.class_name == 'AC_B' || coach.class_name == 'SNIGDHA')? "+15% VAT" :  " " }
                </small>
            </CardSubtitle>
            {#if showSeats && sCoach === coach}
            <div class="d-flex flex-column justify-content-center mx-auto w-100 my-4">
                <FormGroup floating label="Select Bogie">
                    <Input type="select" name="bogie" id="bogie" bind:value={sBogie}>
                        {#each displayBogies as bogie (bogie.coach)} 
                            <option value={bogie.coach}> {bogie.coach} </option>
                        {/each}
                    </Input>
                </FormGroup><br>
                <small class="mx-auto text-muted mb-2">Select seats (Upto 4)</small>
                <Container>
                {#each Array(sBogieObj.mat_row) as _, i}
                    <Row>
                        {#each Array(sBogieObj.mat_col) as _, j}
                            <Col class="p-1 flex-fil">
                                {#if sBogieObj.mat[i][j] !== 0}
                                <Button class='px-0 py-1 my-1 w-100 bg-{selMat[i][j]?"success":"light"} border-dark'
                                        on:click={() => clickSeat(i,j)} >
                                    <span class='text-{selMat[i][j]?"light":"dark"}' style="font-size: 0.6rem">
                                        <b>{sBogieObj.coach}{sBogieObj.mat[i][j]}</b>
                                    </span>
                                </Button>
                                {:else}<small style="font-size: 0.6rem"> </small>{/if}
                            </Col>
                        {/each}
                    </Row>
                {/each}
                </Container>
            </div>
            {/if}
        </CardBody>
        <CardFooter>
            <Button class="bg-success w-75 mx-auto mx-md-4" on:click={() => onCheckSeats(coach)}>Check Seats</Button> 
        </CardFooter> 
    </Card>
    </div>
{/each}
</div>

<style>
    @import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

    @media only screen and (max-width: 768px) {
		#card-div {
			width: 85%;
		}
	}

    @media only screen and (min-width: 768px) {

	}

</style>