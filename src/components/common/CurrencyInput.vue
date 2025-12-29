<template>
  <!-- Input teks dengan formatting mata uang IDR (tanpa desimal), emit angka murni -->
  <input
    :value="displayValue"
    @input="onInput"
    type="text"
    class="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
  />
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: { type: [Number, String], default: 0 },
});
const emit = defineEmits(['update:modelValue']);

const inner = ref(String(props.modelValue));

watch(
  () => props.modelValue,
  (val) => {
    inner.value = String(val);
  }
);

const formatCurrency = (numStr) => {
    const number = parseInt(numStr.replace(/\D/g, ''), 10);
    if (isNaN(number)) return '';
    return number.toLocaleString('id-ID');
};

const displayValue = computed(() => {
  const formatted = formatCurrency(inner.value);
  return formatted ? `Rp ${formatted}` : '';
});

function onInput(event) {
  const raw = event.target.value;
  const digits = raw.replace(/\D/g, '');
  inner.value = digits;
  const numberValue = parseInt(digits || '0', 10);
  emit('update:modelValue', numberValue);
}
</script>
