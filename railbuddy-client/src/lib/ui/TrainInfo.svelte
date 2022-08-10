<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css"/>
<script>
    import { onMount } from "svelte";
	import { Styles, Form, FormGroup, Input, Button, Icon,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardSubtitle,
    CardText,
    CardTitle } from "sveltestrap";
	import axios from "axios";
    const server = "";
    export let train_id;
    let coaches = [];

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

</script>

{#each coaches as coach}
    <Card class="mb-3 mx-5 w-50">
        <CardHeader>
        <CardTitle class='card-title-success'>{coach.class_name}</CardTitle>
        </CardHeader>
        <CardBody>
        <CardSubtitle class="mx-auto">
            <big class="text-success">৳{coach.fare}</big>
        </CardSubtitle>
        <CardText>
            <small class="text-muted">
                {(coach.class_name == 'AC_S' || coach.class_name == 'AC_B' || coach.class_name == 'SNIGDHA')? "+15% VAT" :  "" }
            </small>
        </CardText>
        </CardBody>
        <!-- <CardFooter>Footer</CardFooter> -->
    </Card>
{/each}

<style>
   
</style>