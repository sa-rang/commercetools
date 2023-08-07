<script src="./VariantSelector.js"></script>

<template>
  <div>
    <ul class="list-inline" data-test="variant-selector-list">
      <li v-for="[label, variants] in variants" :key="label">
        <div class="pro-details-size">
          <span>{{
            t(label)
          }}</span>
          <select v-on:change="changeAndSet(label, $event)" class="select-product-detail"
            :data-test="`attribute-select-${label}`">
            <option v-for="variant in variants" :key="variant" :value="variant" :selected="isSelected(label, variant)"
              data-test="attribute-select-option">
              {{ variant }}
            </option>
          </select>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.pro-details-size {
  span {
    margin-left: 3px;
    margin-right: 10px;
  }

  .select-product-detail {
    max-width: 100px;
    border: 1px solid #eceff8;
  }
}
</style>
