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
    export let preferedClass;

    let coaches = [], showSeats = false, displayBogies = [], sCoach, sBogie = '', sBogieObj = {}, 
        selMat, selCount = 0, selList = [];
    
    const getSBogie = () => {    
        for (const bogie of displayBogies) {
            if (bogie.coach == sBogie) {
                sBogieObj = bogie;
                break;
            };
        };
    };

    $: sBogie && getSBogie();

    const init_selMat = () => {
        selCount = 0;
        selMat = {};
        displayBogies.forEach(bogie => {
            const L = bogie.coach;
            console.log(sBogieObj);
            selMat[L] = new Array(bogie.mat_row);
            for (let i=0; i<bogie.mat_row; i++) {
                selMat[L][i] = new Array(bogie.mat_col);
                for (let j=0; j<bogie.mat_col; j++) {
                    selMat[L][i][j] = false;
                };
            };
        });
    };

    const clickSeat = (i, j) => {
        if (!sBogieObj.vacancy[i][j]) {
            console.log(selMat);
            const L = sBogieObj.coach;
            if (selMat[L][i][j] === false) {
                if (selCount < 4) selMat[L][i][j] = true, selCount++;
            } else {
                if (selCount > 0) selMat[L][i][j] = false, selCount--;
            };
        };
    };


    onMount (event => {
		axios.defaults.withCredentials = true;
		axios.post(`${server}/api/getCoaches`, {
			id: train_id,
            date: date
		}).then(res => {
			if (res.data.success === false) {
				alert("Server Error");		
                window.location.reload();
			} else {
				coaches = [...res.data.classes];
                // for (const c of coaches) {
                //     if (c.class_name === preferedClass) isOpen();
                //     break;
                // };
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
				console.log(res.data.bogies);
                displayBogies = res.data.bogies;
                sCoach = coach;
                sBogie = displayBogies[0].coach;
                getSBogie();
                init_selMat();
                console.log(selMat);
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
    <Card   class='shadow mb-4 mx-xl-2 mx-auto text-center border-{coach.capacity>0? 
                                                                    (coach.vacancy/coach.capacity>0.1? 
                                                                        "success" 
                                                                        :"warning")
                                                                    :"danger border-2"} {coach.class_name === preferedClass? "border-3":""}' 
            style='{showSeats && sCoach === coach ? "width:30vh":""}; border-radius: 1.5rem'>
        <CardHeader >
            <CardTitle class='{coach.class_name === preferedClass? "fw-bold":""}'>{coach.class_name}</CardTitle>
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
            <br>
            <p class='text-center text-black-50 text-uppercase mb-0' style='font-size: 0.8rem'>Total Capacity &nbsp;: 
                <b class='text-dark'>{coach.capacity}</b></p>
            <p class='text-center text-secondary text-uppercase'style='font-size: 0.7rem'>Current Vacancy : 
                <b class='text-success'>{coach.vacancy}</b></p>
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
                            <Button class='px-0 py-1 my-1 w-100 bg-{sBogieObj.vacancy[i][j]? "danger":(selMat[sBogie][i][j]?"success":"light")} border-dark'
                                    on:click={() => clickSeat(i,j)} >
                                <div class='text-{selMat[sBogie][i][j] || sBogieObj.vacancy[i][j]?"light":"dark"} text-center' 
                                        style='font-size: {sBogieObj.mat_col>5? 0.5:0.6}rem; white-space:pre-line; line-height:1.3'>
                                    <b>{sBogieObj.coach + '\n' + sBogieObj.mat[i][j]}</b>
                                </div>
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
            <Button class='{showSeats && coach === sCoach?  "text-dark border-success border-2 bg-white"
                                                            :(coach.vacancy/coach.capacity>0.1? "bg-success":"bg-warning")} w-75 mx-auto mx-md-4' 
                    style='border-radius: 0.8rem'
                    on:click={() => onCheckSeats(coach)}>
                {showSeats && coach === sCoach? "Refresh" : "Check Seats"}
            </Button> 
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