<script lang="ts">
    const gamepads = $state({});

    $inspect(gamepads);
</script>

<svelte:window
    ongamepadconnected={(e) => (gamepads[e.gamepad.index] = e.gamepad)}
    ongamepaddisconnected={(e) => console.log(e)}
/>
