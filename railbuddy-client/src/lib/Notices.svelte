<script>
	import { Styles, Form, FormGroup, Input, Button, Label, Table, FormText} from "sveltestrap";
	import axios from "axios";
	import { onMount } from "svelte";

	let formData = {
		doc: null,
        text: '',
		category: ''
	};

	let notices = [];

	const printDate = date => {
		let str = (new Date(date)).toLocaleString();
		return (str);
	};

	onMount (event => {
		axios.post("/api/getNotices").then(res => {
            notices = [...res.data]; 
        });
	});

</script>
<br><br><br><br>
<div class='d-flex flex-column justify-content-center align-items-center'>
    {#each notices as n}
        <div class='d-flex flex-column px-md-5 w-75 my-md-0 my-4'>
            <div class='rqst-detail mx-auto'>
                <p class='h3'>{n.title}</p>
                <p class='h4'>{printDate(n.time_posted)}</p>
                <hr>
                <p class='h5 fw-bold'>Details: </p>
                <p>{n.text}</p>
            </div>
        </div>
    {/each}
</div>



<style>
	@import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

	@media only screen and (max-width: 768px) {
		:global(.rqst) {
			width: 90vw;
			margin-left: 5vw;
			margin-right: 5vw;
			margin-top: 4vw;
			margin-bottom: 3.5vw
		}

		:global(.rqst-detail) {
			width: 100%;
		}
	}

	@media only screen and (min-width: 768px) {
		:global(.rqst) {
			width: 30vw;
			margin-left: 5vw;
			margin-right: 5vw;
			margin-top: 4vw;
			margin-bottom: 1.5vw
		}

		:global(.rqst-detail) {
			width: 65%;
			margin-left: 2.5rem;
		}
	}

	:global(.rqst-detail) {
		border-radius: 1rem; 
		border: 2px solid;
		border-color: var(--bs-success);
		margin: 1rem;
		padding: 2.5rem;
	}

</style>
