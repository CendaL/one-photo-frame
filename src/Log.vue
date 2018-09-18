<template>
  <div>
    <pre class="log"></pre>
    <pre class="logError"></pre>
  </div>
</template>

<script>
</script>

<style scoped>
pre.log {
  background-color: blue;
  color: white;
  left: 2.5%;
  top: 30%;
  position: fixed;
  height: 60%;
  max-height: 60%;
  max-width: 95%;
  overflow-y: auto;
  word-wrap: break-word;
  white-space: pre-wrap;
}
pre.logError {
  background-color: transparent;
  color: red;
  left: 2.5%;
  top: 10%;
  position: fixed;
  height: 20%;
  max-height: 20%;
  max-width: 95%;
  overflow-y: auto;
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
