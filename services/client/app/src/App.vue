<template>
    <div class="app-container">
        <header>
            <h1>Socket IO Messages Dashboard</h1>
        </header>

        <main>
            <SocketIOMessages />
        </main>

        <footer>
            <p>Vue's app with Socket.IO</p>
        </footer>
    </div>
</template>

<script>
import SocketIOMessages from "./components/SocketIOMessages.vue";

export default {
    name: "App",
    components: {
        SocketIOMessages,
    },
};
</script>

<style>
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: "Arial", sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
}

.app-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1.125rem;
}

header {
    margin-bottom: 1.75rem;
    text-align: center;
}

h1 {
    color: #2c3e50;
    margin-bottom: 0.625rem;
}

footer {
    margin-top: 2.5rem;
    text-align: center;
    color: #777;
    font-size: 0.875rem;
    padding-top: 1.125rem;
    border-top: 1px solid #ddd;
}
</style>