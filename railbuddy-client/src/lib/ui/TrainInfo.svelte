<!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous"> -->
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
    const server = "http://localhost";
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
    <Card class="shadow mb-4 mx-2 text-center border-success">
        <CardHeader>
            <CardTitle>{coach.class_name}</CardTitle>
        </CardHeader>
        <CardBody>
            <CardText>
                <big class="text-success"><b>৳{coach.fare}</b></big>
            </CardText>
            <CardSubtitle>
                <small class="text-muted">
                    {(coach.class_name == 'AC_S' || coach.class_name == 'AC_B' || coach.class_name == 'SNIGDHA')? "+15% VAT" :  "" }
                </small>
            </CardSubtitle>
        </CardBody>
        <!-- <CardFooter>Footer</CardFooter> -->
    </Card>
{/each}

<style>
    @import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

</style>