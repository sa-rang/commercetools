
<script src="./Selector.js"></script>

<template>
  <li>
    <a href="javascript:;">{{ t(title) }}</a>
    <ul>
      <li v-for="value in values" v-bind:key="value">
        <a @click.prevent="() => setValue(value)" href="javascript:;">
          <img v-if="value == 'en'" :src="require('presentation/assets/img/uk.png')" />
          <img v-if="value == 'de' || value == 'DE'" :src="require('presentation/assets/img/de.png')" />
          <img v-if="value == 'us' || value == 'US'" :src="require('presentation/assets/img/us.png')" />
          <span>{{ t(value) }}</span></a>
      </li>
    </ul>
  </li>
</template>
