/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template>
  <div class="frame-outer">
    <div class="frame-inner">
      <span class="my-text">
        <slot></slot>
      </span>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.frame-outer {
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 14px;
}

.frame-inner {
  flex-grow: 0;
  padding: 8px 17px 9px 15px;
  border-radius: 4px;
  background-color: #594cb2;
}

.my-text {
  flex-grow: 0;
  font-family: Work Sans;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: rgba(255, 255, 255, 0.8);

  // spacing between paragraphs
  p + p {
    margin-top: 8px;
  }
}

</style>